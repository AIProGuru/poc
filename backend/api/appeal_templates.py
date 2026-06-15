import logging
import os
import re
import uuid
from datetime import datetime

from flask import Blueprint, current_app, jsonify, request, send_file
from werkzeug.utils import secure_filename

from db import close_connection, get_connection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MAX_TEMPLATE_BYTES = 50 * 1024 * 1024
ALLOWED_EXTENSIONS = {"pdf", "doc", "docx", "txt"}

rebound_api_appeal_templates = Blueprint(
    "rebound_api_appeal_templates", __name__, url_prefix="/api/v1/rebound"
)
medevolve_api_appeal_templates = Blueprint(
    "medevolve_api_appeal_templates", __name__, url_prefix="/api/v1/medevolve"
)
pilotcustomer_api_appeal_templates = Blueprint(
    "pilotcustomer_api_appeal_templates", __name__, url_prefix="/api/v1/pilotcustomer"
)
betacustomer_api_appeal_templates = Blueprint(
    "betacustomer_api_appeal_templates", __name__, url_prefix="/api/v1/betacustomer"
)

APPEAL_TEMPLATE_BLUEPRINTS = (
    rebound_api_appeal_templates,
    medevolve_api_appeal_templates,
    pilotcustomer_api_appeal_templates,
    betacustomer_api_appeal_templates,
)


def _allowed_file(filename):
    return bool(filename and "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS)


def _normalize_payer_id(value):
    return re.sub(r"\s+", "", f"{value or ''}").upper()


def _parse_payer_ids(raw_value):
    values = raw_value if isinstance(raw_value, list) else re.split(r"[\s,;]+", f"{raw_value or ''}")
    payer_ids = []
    seen = set()
    for value in values:
        normalized = _normalize_payer_id(value)
        if normalized and normalized not in seen:
            payer_ids.append(normalized)
            seen.add(normalized)
    return payer_ids


def _ensure_tables(cursor):
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS appeal_templates (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          original_file_name VARCHAR(255) NOT NULL,
          stored_path VARCHAR(512) NOT NULL,
          mime_type VARCHAR(128) DEFAULT NULL,
          file_size BIGINT DEFAULT NULL,
          notes TEXT,
          uploaded_by VARCHAR(128) DEFAULT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
        """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS appeal_template_payer_ids (
          id INT AUTO_INCREMENT PRIMARY KEY,
          template_id INT NOT NULL,
          payer_id_835 VARCHAR(80) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY uq_template_payer (template_id, payer_id_835),
          INDEX idx_payer_id_835 (payer_id_835),
          CONSTRAINT fk_appeal_template_payer_template
            FOREIGN KEY (template_id) REFERENCES appeal_templates(id) ON DELETE CASCADE
        )
        """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS payer_appeal_contacts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          payer_id_835 VARCHAR(80) NOT NULL,
          payer_name VARCHAR(255) DEFAULT NULL,
          address TEXT,
          phone VARCHAR(80) DEFAULT NULL,
          fax VARCHAR(80) DEFAULT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_payer_contact_835 (payer_id_835)
        )
        """
    )


def _serialize_template(row, payer_ids=None):
    if not row:
        return None
    created_at = row.get("created_at")
    updated_at = row.get("updated_at")
    if isinstance(created_at, datetime):
        created_at = created_at.isoformat()
    if isinstance(updated_at, datetime):
        updated_at = updated_at.isoformat()
    return {
        "id": row.get("id"),
        "name": row.get("name"),
        "originalFileName": row.get("original_file_name"),
        "mimeType": row.get("mime_type"),
        "fileSize": row.get("file_size"),
        "notes": row.get("notes") or "",
        "uploadedBy": row.get("uploaded_by"),
        "createdAt": created_at,
        "updatedAt": updated_at,
        "payerIds": payer_ids or [],
    }


def _serialize_contact(row):
    if not row:
        return None
    return {
        "id": row.get("id"),
        "payerId": row.get("payer_id_835"),
        "payerDescription": row.get("payer_name") or "",
        "payerAddress": row.get("address") or "",
        "payerPhoneNumber": row.get("phone") or "",
        "payerFaxNumber": row.get("fax") or "",
    }


def _fetch_template_payer_ids(cursor, template_ids):
    if not template_ids:
        return {}
    placeholders = ",".join(["%s"] * len(template_ids))
    cursor.execute(
        f"""
        SELECT template_id, payer_id_835
        FROM appeal_template_payer_ids
        WHERE template_id IN ({placeholders})
        ORDER BY payer_id_835
        """,
        tuple(template_ids),
    )
    payer_map = {}
    for row in cursor.fetchall() or []:
        payer_map.setdefault(row["template_id"], []).append(row["payer_id_835"])
    return payer_map


def _template_folder(db_name):
    base = current_app.config.get("UPLOAD_FOLDER", "uploads")
    return os.path.join(base, "appeal_templates", db_name or "default")


def list_appeal_templates():
    conn = None
    cursor = None
    try:
        conn, cursor, _db_name = get_connection(request)
        _ensure_tables(cursor)
        cursor.execute(
            """
            SELECT id, name, original_file_name, mime_type, file_size, notes,
                   uploaded_by, created_at, updated_at
            FROM appeal_templates
            ORDER BY created_at DESC, id DESC
            """
        )
        rows = cursor.fetchall() or []
        payer_map = _fetch_template_payer_ids(cursor, [row["id"] for row in rows])
        return jsonify([_serialize_template(row, payer_map.get(row["id"], [])) for row in rows]), 200
    except Exception as exc:
        logger.error("Error fetching appeal templates: %s", exc)
        return jsonify({"error": "Failed to fetch appeal templates"}), 500
    finally:
        close_connection(cursor, conn)


def create_appeal_template():
    conn = None
    cursor = None
    stored_path = None
    try:
        conn, cursor, db_name = get_connection(request)
        _ensure_tables(cursor)

        upload = request.files.get("file")
        name = (request.form.get("name") or "").strip()
        payer_ids = _parse_payer_ids(request.form.get("payer_ids") or request.form.get("payerIds"))
        notes = (request.form.get("notes") or "").strip()
        uploaded_by = (request.form.get("uploaded_by") or request.form.get("uploadedBy") or "").strip()

        if not name:
            return jsonify({"error": "Template name is required"}), 400
        if not payer_ids:
            return jsonify({"error": "At least one 835 payer ID is required"}), 400
        if upload is None or not upload.filename:
            return jsonify({"error": "Template file is required"}), 400
        if not _allowed_file(upload.filename):
            return jsonify({"error": "File type not supported. Allowed: PDF, Word, and text files."}), 400

        upload.stream.seek(0, os.SEEK_END)
        file_size = upload.stream.tell()
        upload.stream.seek(0)
        if file_size > MAX_TEMPLATE_BYTES:
            return jsonify({"error": "File exceeds maximum size of 50 MB."}), 400

        file_token = uuid.uuid4().hex[:12]
        stored_filename = f"{file_token}_{secure_filename(upload.filename)}"
        folder = _template_folder(db_name)
        os.makedirs(folder, exist_ok=True)
        stored_path = os.path.join(folder, stored_filename)
        upload.save(stored_path)

        cursor.execute(
            """
            INSERT INTO appeal_templates
              (name, original_file_name, stored_path, mime_type, file_size, notes, uploaded_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                name[:255],
                upload.filename[:255],
                stored_path,
                upload.mimetype,
                file_size,
                notes or None,
                uploaded_by[:128] if uploaded_by else None,
            ),
        )
        template_id = cursor.lastrowid
        cursor.executemany(
            """
            INSERT IGNORE INTO appeal_template_payer_ids (template_id, payer_id_835)
            VALUES (%s, %s)
            """,
            [(template_id, payer_id) for payer_id in payer_ids],
        )
        conn.commit()

        cursor.execute(
            """
            SELECT id, name, original_file_name, mime_type, file_size, notes,
                   uploaded_by, created_at, updated_at
            FROM appeal_templates
            WHERE id = %s
            """,
            (template_id,),
        )
        return jsonify(_serialize_template(cursor.fetchone(), payer_ids)), 200
    except Exception as exc:
        if conn:
            conn.rollback()
        if stored_path and os.path.isfile(stored_path):
            try:
                os.remove(stored_path)
            except OSError:
                pass
        logger.error("Error creating appeal template: %s", exc)
        return jsonify({"error": "Failed to create appeal template"}), 500
    finally:
        close_connection(cursor, conn)


def match_appeal_template():
    conn = None
    cursor = None
    payer_id = _normalize_payer_id(request.args.get("payer_id") or request.args.get("payerId"))
    if not payer_id:
        return jsonify(None), 200

    try:
        conn, cursor, _db_name = get_connection(request)
        _ensure_tables(cursor)
        cursor.execute(
            """
            SELECT t.id, t.name, t.original_file_name, t.mime_type, t.file_size,
                   t.notes, t.uploaded_by, t.created_at, t.updated_at
            FROM appeal_template_payer_ids p
            JOIN appeal_templates t ON t.id = p.template_id
            WHERE p.payer_id_835 = %s
            ORDER BY t.created_at DESC, t.id DESC
            LIMIT 1
            """,
            (payer_id,),
        )
        row = cursor.fetchone()
        if not row:
            return jsonify(None), 200
        payer_map = _fetch_template_payer_ids(cursor, [row["id"]])
        return jsonify(_serialize_template(row, payer_map.get(row["id"], []))), 200
    except Exception as exc:
        logger.error("Error matching appeal template for payer ID %s: %s", payer_id, exc)
        return jsonify({"error": "Failed to match appeal template"}), 500
    finally:
        close_connection(cursor, conn)


def download_appeal_template(template_id):
    conn = None
    cursor = None
    try:
        conn, cursor, _db_name = get_connection(request)
        _ensure_tables(cursor)
        cursor.execute(
            "SELECT original_file_name, stored_path FROM appeal_templates WHERE id = %s",
            (template_id,),
        )
        row = cursor.fetchone()
        if row is None:
            return jsonify({"error": "Template not found"}), 404
        stored_path = row.get("stored_path")
        if not stored_path or not os.path.isfile(stored_path):
            return jsonify({"error": "Template file missing"}), 404
        return send_file(stored_path, as_attachment=True, download_name=row.get("original_file_name"))
    except Exception as exc:
        logger.error("Error downloading appeal template %s: %s", template_id, exc)
        return jsonify({"error": "Failed to download appeal template"}), 500
    finally:
        close_connection(cursor, conn)


def delete_appeal_template(template_id):
    conn = None
    cursor = None
    try:
        conn, cursor, _db_name = get_connection(request)
        _ensure_tables(cursor)
        cursor.execute("SELECT stored_path FROM appeal_templates WHERE id = %s", (template_id,))
        row = cursor.fetchone()
        if row is None:
            return jsonify({"error": "Template not found"}), 404
        stored_path = row.get("stored_path")
        cursor.execute("DELETE FROM appeal_templates WHERE id = %s", (template_id,))
        conn.commit()
        if stored_path and os.path.isfile(stored_path):
            try:
                os.remove(stored_path)
            except OSError as exc:
                logger.warning("Could not delete appeal template file %s: %s", stored_path, exc)
        return jsonify({"message": "Template deleted"}), 200
    except Exception as exc:
        if conn:
            conn.rollback()
        logger.error("Error deleting appeal template %s: %s", template_id, exc)
        return jsonify({"error": "Failed to delete appeal template"}), 500
    finally:
        close_connection(cursor, conn)


def list_payer_appeal_contacts():
    conn = None
    cursor = None
    requested_payer_id = _normalize_payer_id(request.args.get("payer_id") or request.args.get("payerId"))
    try:
        conn, cursor, _db_name = get_connection(request)
        _ensure_tables(cursor)
        if requested_payer_id:
            cursor.execute(
                """
                SELECT id, payer_id_835, payer_name, address, phone, fax
                FROM payer_appeal_contacts
                WHERE payer_id_835 = %s
                ORDER BY updated_at DESC, id DESC
                """,
                (requested_payer_id,),
            )
        else:
            cursor.execute(
                """
                SELECT id, payer_id_835, payer_name, address, phone, fax
                FROM payer_appeal_contacts
                ORDER BY payer_id_835, payer_name
                """
            )
        return jsonify([_serialize_contact(row) for row in (cursor.fetchall() or [])]), 200
    except Exception as exc:
        logger.error("Error fetching payer appeal contacts: %s", exc)
        return jsonify({"error": "Failed to fetch payer appeal contacts"}), 500
    finally:
        close_connection(cursor, conn)


for blueprint in APPEAL_TEMPLATE_BLUEPRINTS:
    blueprint.add_url_rule("/appeal-templates", view_func=list_appeal_templates, methods=["GET"])
    blueprint.add_url_rule("/appeal-templates", view_func=create_appeal_template, methods=["POST"])
    blueprint.add_url_rule("/appeal-templates/match", view_func=match_appeal_template, methods=["GET"])
    blueprint.add_url_rule(
        "/appeal-templates/<int:template_id>/download",
        view_func=download_appeal_template,
        methods=["GET"],
    )
    blueprint.add_url_rule(
        "/appeal-templates/<int:template_id>",
        view_func=delete_appeal_template,
        methods=["DELETE"],
    )
    blueprint.add_url_rule("/payer-appeal-contacts", view_func=list_payer_appeal_contacts, methods=["GET"])
