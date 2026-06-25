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

MAX_APPEAL_DOC_BYTES = 50 * 1024 * 1024
ALLOWED_EXTENSIONS = {
    "pdf",
    "doc",
    "docx",
    "txt",
    "jpg",
    "jpeg",
    "png",
    "tif",
    "tiff",
}

rebound_api_appeal_docs = Blueprint("rebound_api_appeal_docs", __name__, url_prefix="/api/v1/rebound")
medevolve_api_appeal_docs = Blueprint("medevolve_api_appeal_docs", __name__, url_prefix="/api/v1/medevolve")
pilotcustomer_api_appeal_docs = Blueprint(
    "pilotcustomer_api_appeal_docs", __name__, url_prefix="/api/v1/pilotcustomer"
)
betacustomer_api_appeal_docs = Blueprint(
    "betacustomer_api_appeal_docs", __name__, url_prefix="/api/v1/betacustomer"
)

APPEAL_DOC_BLUEPRINTS = (
    rebound_api_appeal_docs,
    medevolve_api_appeal_docs,
    pilotcustomer_api_appeal_docs,
    betacustomer_api_appeal_docs,
)


def _allowed_file(filename):
    if not filename or "." not in filename:
        return False
    return filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def _sanitize_claim_no(claim_no):
    return re.sub(r"[^A-Za-z0-9._-]", "", f"{claim_no or ''}")


_APPEAL_DOCS_TABLE_READY = False


def _ensure_table(cursor):
    global _APPEAL_DOCS_TABLE_READY
    if _APPEAL_DOCS_TABLE_READY:
        return
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS appeal_supporting_documents (
          id INT AUTO_INCREMENT PRIMARY KEY,
          claim_no VARCHAR(64) NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          file_type VARCHAR(64) NOT NULL,
          stored_path VARCHAR(512) NOT NULL,
          mime_type VARCHAR(128) DEFAULT NULL,
          file_size BIGINT DEFAULT NULL,
          uploaded_by VARCHAR(128) DEFAULT NULL,
          uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          source VARCHAR(32) DEFAULT 'manual',
          INDEX idx_appeal_docs_claim_no (claim_no)
        )
        """
    )
    _APPEAL_DOCS_TABLE_READY = True


def _serialize_document(row):
    if not row:
        return None
    uploaded_at = row.get("uploaded_at")
    if isinstance(uploaded_at, datetime):
        uploaded_at = uploaded_at.isoformat()
    return {
        "id": row.get("id"),
        "claim_no": row.get("claim_no"),
        "file_name": row.get("file_name"),
        "file_type": row.get("file_type"),
        "mime_type": row.get("mime_type"),
        "file_size": row.get("file_size"),
        "uploaded_by": row.get("uploaded_by"),
        "uploaded_at": uploaded_at,
        "source": row.get("source") or "manual",
    }


def fetch_supporting_documents(cursor, claim_no):
    _ensure_table(cursor)
    q = """
        SELECT id, claim_no, file_name, file_type, mime_type, file_size,
               uploaded_by, uploaded_at, source
        FROM appeal_supporting_documents
        WHERE claim_no = %s
        ORDER BY uploaded_at DESC, id DESC
    """
    cursor.execute(q, (claim_no,))
    rows = cursor.fetchall() or []
    return [_serialize_document(row) for row in rows]


def _upload_folder(db_name, claim_no):
    base = current_app.config.get("UPLOAD_FOLDER", "uploads")
    safe_claim = _sanitize_claim_no(claim_no)
    return os.path.join(base, "appeal_documents", db_name or "default", safe_claim)


def upload_appeal_document():
    conn = None
    cursor = None
    try:
        conn, cursor, db_name = get_connection(request)
        claim_no = request.form.get("claimno") or request.form.get("claim_no")
        file_name = (request.form.get("file_name") or "").strip()
        file_type = (request.form.get("file_type") or "other").strip()
        username = (request.form.get("username") or "").strip()
        upload = request.files.get("file")

        if not claim_no:
            return jsonify({"error": "claimno is required"}), 400
        if upload is None or not upload.filename:
            return jsonify({"error": "file is required"}), 400

        original_name = upload.filename
        if not _allowed_file(original_name):
            return (
                jsonify(
                    {
                        "error": "File type not supported. Allowed: PDF, Word, text, and common image formats."
                    }
                ),
                400,
            )

        upload.stream.seek(0, os.SEEK_END)
        file_size = upload.stream.tell()
        upload.stream.seek(0)
        if file_size > MAX_APPEAL_DOC_BYTES:
            return jsonify({"error": "File exceeds maximum size of 50 MB."}), 400

        if not file_name:
            file_name = original_name

        _ensure_table(cursor)
        doc_id = uuid.uuid4().hex[:12]
        extension = original_name.rsplit(".", 1)[1].lower()
        stored_filename = f"{doc_id}_{secure_filename(original_name)}"
        folder = _upload_folder(db_name, claim_no)
        os.makedirs(folder, exist_ok=True)
        stored_path = os.path.join(folder, stored_filename)
        upload.save(stored_path)

        q = """
            INSERT INTO appeal_supporting_documents
              (claim_no, file_name, file_type, stored_path, mime_type, file_size, uploaded_by, source)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(
            q,
            (
                claim_no,
                file_name[:255],
                file_type[:64],
                stored_path,
                upload.mimetype,
                file_size,
                username[:128] if username else None,
                "manual",
            ),
        )
        conn.commit()
        new_id = cursor.lastrowid
        cursor.execute(
            """
            SELECT id, claim_no, file_name, file_type, mime_type, file_size,
                   uploaded_by, uploaded_at, source
            FROM appeal_supporting_documents
            WHERE id = %s
            """,
            (new_id,),
        )
        row = cursor.fetchone()
        return jsonify(_serialize_document(row)), 200
    except Exception as e:
        logger.error(f"[ERROR] upload_appeal_document: {e}")
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)


def list_appeal_documents():
    conn = None
    cursor = None
    try:
        conn, cursor, _db_name = get_connection(request)
        claim_no = request.args.get("claimno") or request.args.get("claim_no")
        if not claim_no:
            return jsonify({"error": "claimno is required"}), 400
        documents = fetch_supporting_documents(cursor, claim_no)
        return jsonify(documents), 200
    except Exception as e:
        logger.error(f"[ERROR] list_appeal_documents: {e}")
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)


def download_appeal_document(doc_id):
    conn = None
    cursor = None
    try:
        conn, cursor, _db_name = get_connection(request)
        _ensure_table(cursor)
        cursor.execute(
            "SELECT file_name, stored_path FROM appeal_supporting_documents WHERE id = %s",
            (doc_id,),
        )
        row = cursor.fetchone()
        if row is None:
            return jsonify({"error": "Document not found"}), 404
        stored_path = row.get("stored_path")
        if not stored_path or not os.path.isfile(stored_path):
            return jsonify({"error": "Document file missing"}), 404
        return send_file(stored_path, as_attachment=True, download_name=row.get("file_name"))
    except Exception as e:
        logger.error(f"[ERROR] download_appeal_document: {e}")
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)


def delete_appeal_document(doc_id):
    conn = None
    cursor = None
    try:
        conn, cursor, _db_name = get_connection(request)
        _ensure_table(cursor)
        cursor.execute(
            "SELECT stored_path FROM appeal_supporting_documents WHERE id = %s",
            (doc_id,),
        )
        row = cursor.fetchone()
        if row is None:
            return jsonify({"error": "Document not found"}), 404
        stored_path = row.get("stored_path")
        cursor.execute("DELETE FROM appeal_supporting_documents WHERE id = %s", (doc_id,))
        conn.commit()
        if stored_path and os.path.isfile(stored_path):
            try:
                os.remove(stored_path)
            except OSError as err:
                logger.warning(f"Could not delete file {stored_path}: {err}")
        return jsonify("success"), 200
    except Exception as e:
        logger.error(f"[ERROR] delete_appeal_document: {e}")
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)


for blueprint in APPEAL_DOC_BLUEPRINTS:
    blueprint.add_url_rule(
        "/upload_appeal_document",
        view_func=upload_appeal_document,
        methods=["POST"],
    )
    blueprint.add_url_rule(
        "/appeal_documents",
        view_func=list_appeal_documents,
        methods=["GET"],
    )
    blueprint.add_url_rule(
        "/appeal_documents/<int:doc_id>/download",
        view_func=download_appeal_document,
        methods=["GET"],
    )
    blueprint.add_url_rule(
        "/appeal_documents/<int:doc_id>",
        view_func=delete_appeal_document,
        methods=["DELETE"],
    )
