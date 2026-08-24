import logging
from typing import Any, Dict, List, Optional, Tuple

from flask import Blueprint, jsonify, request

from db import close_connection, get_connection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

rebound_api_governance = Blueprint("rebound_api_governance", __name__, url_prefix="/api/v1/rebound")
medevolve_api_governance = Blueprint("medevolve_api_governance", __name__, url_prefix="/api/v1/medevolve")
pilotcustomer_api_governance = Blueprint(
    "pilotcustomer_api_governance", __name__, url_prefix="/api/v1/pilotcustomer"
)
betacustomer_api_governance = Blueprint(
    "betacustomer_api_governance", __name__, url_prefix="/api/v1/betacustomer"
)

GOVERNANCE_BLUEPRINTS = (
    rebound_api_governance,
    medevolve_api_governance,
    pilotcustomer_api_governance,
    betacustomer_api_governance,
)

GOVERNANCE_OPTIONAL_COLUMNS = {
    "effective_year": "SMALLINT NULL",
    "expires_on": "DATE NULL",
    "is_active": "TINYINT(1) NOT NULL DEFAULT 1",
    "updated_at": "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
}

DATASET_CONFIG = {
    "carc": {
        "table_candidates": ["carc", "CARC"],
        "create_sql": """
            CREATE TABLE IF NOT EXISTS carc (
              Code VARCHAR(16) NOT NULL PRIMARY KEY,
              Description TEXT NULL,
              DenialCategory VARCHAR(255) NULL,
              effective_year SMALLINT NULL,
              expires_on DATE NULL,
              is_active TINYINT(1) NOT NULL DEFAULT 1,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              INDEX idx_carc_active (is_active),
              INDEX idx_carc_expires_on (expires_on)
            )
        """,
        "fields": {
            "carcCode": ["Code", "code", "CARCCode", "carc_code"],
            "carcDescription": ["Description", "description", "CarcDescription"],
            "category": ["DenialCategory", "Category", "category", "denial_category"],
            "effectiveYear": ["effective_year", "EffectiveYear", "effectiveYear"],
            "expiresOn": ["expires_on", "ExpiresOn", "expiresOn"],
        },
    },
    "rarc": {
        "table_candidates": ["rarc", "RARC"],
        "create_sql": """
            CREATE TABLE IF NOT EXISTS rarc (
              Code VARCHAR(16) NOT NULL PRIMARY KEY,
              Description TEXT NULL,
              DenialCategory VARCHAR(255) NULL,
              effective_year SMALLINT NULL,
              expires_on DATE NULL,
              is_active TINYINT(1) NOT NULL DEFAULT 1,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              INDEX idx_rarc_active (is_active),
              INDEX idx_rarc_expires_on (expires_on)
            )
        """,
        "fields": {
            "rarcCode": ["Code", "code", "RARCCode", "rarc_code", "RemarkCode", "remark_code"],
            "rarcDescription": ["Description", "description", "RarcDescription"],
            "category": ["DenialCategory", "Category", "category", "denial_category"],
            "effectiveYear": ["effective_year", "EffectiveYear", "effectiveYear"],
            "expiresOn": ["expires_on", "ExpiresOn", "expiresOn"],
        },
    },
    "actionCodes": {
        "table_candidates": ["claim_action_items", "Claim_Action_Items", "claim_action_item"],
        "create_sql": """
            CREATE TABLE IF NOT EXISTS claim_action_items (
              id INT AUTO_INCREMENT PRIMARY KEY,
              category VARCHAR(255) NOT NULL,
              action_label VARCHAR(255) NOT NULL,
              allow_free_text TINYINT(1) NOT NULL DEFAULT 0,
              sort_order INT NOT NULL DEFAULT 0,
              is_active TINYINT(1) NOT NULL DEFAULT 1,
              transaction_options TEXT NULL,
              tickle_time VARCHAR(64) NULL,
              effective_year SMALLINT NULL,
              expires_on DATE NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              INDEX idx_claim_action_category (category),
              INDEX idx_claim_action_active (is_active),
              INDEX idx_claim_action_expires_on (expires_on)
            )
        """,
        "fields": {
            "actionCode": ["action_label", "action_code", "ActionCode", "action"],
            "category": ["category", "Category", "denial_category"],
            "tickleTime": ["tickle_time", "tickle_days", "TickleTime", "tickleTime"],
            "effectiveYear": ["effective_year", "EffectiveYear", "effectiveYear"],
            "expiresOn": ["expires_on", "ExpiresOn", "expiresOn"],
        },
        "defaults": {
            "allow_free_text": 0,
            "is_active": 1,
        },
    },
}


def _dataset_config(dataset: str) -> Dict[str, Any]:
    config = DATASET_CONFIG.get(dataset)
    if not config:
        raise ValueError(f"Unknown dataset: {dataset}")
    return config


def _list_database_tables(cursor, db_name: str) -> Dict[str, str]:
    cursor.execute(
        """
        SELECT TABLE_NAME
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = %s
        """,
        (db_name,),
    )
    return {
        (row.get("TABLE_NAME") or "").lower(): row.get("TABLE_NAME")
        for row in (cursor.fetchall() or [])
        if row.get("TABLE_NAME")
    }


def _resolve_table_name(cursor, db_name: str, dataset: str) -> Optional[str]:
    config = _dataset_config(dataset)
    tables = _list_database_tables(cursor, db_name)
    for candidate in config.get("table_candidates") or []:
        match = tables.get(candidate.lower())
        if match:
            return match
    return None


def _get_table_columns(cursor, db_name: str, table_name: str) -> Dict[str, str]:
    cursor.execute(
        """
        SELECT COLUMN_NAME, COLUMN_KEY, EXTRA
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = %s AND LOWER(TABLE_NAME) = LOWER(%s)
        ORDER BY ORDINAL_POSITION
        """,
        (db_name, table_name),
    )
    rows = cursor.fetchall() or []
    return {row["COLUMN_NAME"]: row["COLUMN_KEY"] for row in rows}


def _ensure_optional_columns(cursor, table_name: str, columns: Dict[str, str]):
    existing = {name.lower() for name in columns}
    for column_name, ddl in GOVERNANCE_OPTIONAL_COLUMNS.items():
        if column_name in existing:
            continue
        try:
            cursor.execute(f"ALTER TABLE `{table_name}` ADD COLUMN `{column_name}` {ddl}")
        except Exception as exc:
            logger.warning("Unable to add %s to %s: %s", column_name, table_name, exc)

    if table_name.lower() in {"claim_action_items", "claim_action_item"}:
        if "tickle_time" not in existing:
            try:
                cursor.execute(
                    f"ALTER TABLE `{table_name}` ADD COLUMN `tickle_time` VARCHAR(64) NULL"
                )
            except Exception as exc:
                logger.warning("Unable to add tickle_time to %s: %s", table_name, exc)
        if "transaction_options" not in existing:
            try:
                cursor.execute(f"ALTER TABLE `{table_name}` ADD COLUMN `transaction_options` TEXT NULL")
            except Exception as exc:
                logger.warning("Unable to add transaction_options to %s: %s", table_name, exc)


def _ensure_dataset_table(cursor, conn, db_name: str, dataset: str) -> str:
    config = _dataset_config(dataset)
    table_name = _resolve_table_name(cursor, db_name, dataset)
    if not table_name:
        cursor.execute(config["create_sql"])
        conn.commit()
        table_name = _resolve_table_name(cursor, db_name, dataset)
        if not table_name:
            fallback = config["table_candidates"][0]
            tables = _list_database_tables(cursor, db_name)
            table_name = tables.get(fallback.lower(), fallback)

    columns = _get_table_columns(cursor, db_name, table_name)
    _ensure_optional_columns(cursor, table_name, columns)
    conn.commit()
    return table_name


def _resolve_field_columns(columns: Dict[str, str], field_map: Dict[str, List[str]]) -> Dict[str, str]:
    lowered = {name.lower(): name for name in columns.keys()}
    resolved = {}
    for ui_key, candidates in field_map.items():
        for candidate in candidates:
            found = lowered.get(candidate.lower())
            if found:
                resolved[ui_key] = found
                break
    return resolved


def _resolve_primary_key(columns: Dict[str, str]) -> Optional[str]:
    for name, key_type in columns.items():
        if key_type == "PRI":
            return name
    lowered = {name.lower(): name for name in columns.keys()}
    for candidate in ("id", "code"):
        if candidate in lowered:
            return lowered[candidate]
    return None


OTHER_ACTION_SORT_ORDER = 99999


def _is_other_action_label(label: str) -> bool:
    return (label or "").strip().lower() == "other"


def _serialize_row(row: Dict[str, Any], field_columns: Dict[str, str], primary_key: str) -> Dict[str, Any]:
    payload = {"id": row.get(primary_key)}
    for ui_key, column in field_columns.items():
        value = row.get(column)
        if ui_key in {"effectiveYear"} and value is not None:
            payload[ui_key] = str(value)
        elif ui_key == "expiresOn" and value is not None:
            payload[ui_key] = value.isoformat() if hasattr(value, "isoformat") else str(value)
        else:
            payload[ui_key] = value
    if payload["id"] is not None:
        payload["id"] = str(payload["id"])
    is_active_col = next((col for col in row.keys() if col.lower() == "is_active"), None)
    if is_active_col is not None:
        payload["isActive"] = bool(row.get(is_active_col))
    sort_order_col = next((col for col in row.keys() if col.lower() == "sort_order"), None)
    if sort_order_col is not None:
        payload["sortOrder"] = row.get(sort_order_col)
    return payload


def _payload_to_db_values(payload: Dict[str, Any], field_columns: Dict[str, str]) -> Dict[str, Any]:
    values = {}
    for ui_key, column in field_columns.items():
        if ui_key not in payload:
            continue
        raw = payload.get(ui_key)
        if ui_key == "effectiveYear":
            text = str(raw or "").strip()
            values[column] = int(text) if text.isdigit() else None
        elif ui_key == "expiresOn":
            text = str(raw or "").strip()
            values[column] = text or None
        else:
            values[column] = raw
    return values


def _include_inactive_requested() -> bool:
    return str(request.args.get("includeInactive", "0")).lower() in {"1", "true", "yes"}


def _build_dataset_context(cursor, conn, db_name: str, dataset: str) -> Dict[str, Any]:
    table_name = _ensure_dataset_table(cursor, conn, db_name, dataset)
    config = _dataset_config(dataset)
    columns = _get_table_columns(cursor, db_name, table_name)
    if not columns:
        raise ValueError(f"Table '{table_name}' was not found in database '{db_name}'.")

    field_columns = _resolve_field_columns(columns, config["fields"])
    if not field_columns:
        raise ValueError(f"No matching columns found for dataset '{dataset}' in table '{table_name}'.")

    primary_key = _resolve_primary_key(columns)
    if not primary_key:
        raise ValueError(f"Primary key not found for table '{table_name}'.")

    return {
        "table_name": table_name,
        "columns": columns,
        "field_columns": field_columns,
        "primary_key": primary_key,
        "config": config,
    }


def _natural_code_order_sql(column: str) -> str:
    """Sort numeric codes as numbers (1, 2, 10) instead of lexically (1, 10, 2)."""
    return (
        f"CASE WHEN `{column}` REGEXP '^[0-9]+$' THEN 0 ELSE 1 END, "
        f"CAST(`{column}` AS UNSIGNED), `{column}`"
    )


def _next_action_sort_order(cursor, table_name: str, category: str) -> int:
    cursor.execute(
        f"""
        SELECT COALESCE(MAX(sort_order), 0) AS max_sort
        FROM `{table_name}`
        WHERE category = %s AND LOWER(action_label) <> 'other'
        """,
        (category,),
    )
    row = cursor.fetchone() or {}
    return int(row.get("max_sort") or 0) + 10


def _apply_action_code_sort_order(db_values: Dict[str, Any], field_columns: Dict[str, str], col_map: Dict[str, str]):
    action_col = field_columns.get("actionCode")
    sort_col = col_map.get("sort_order")
    if not action_col or not sort_col:
        return
    label = (db_values.get(action_col) or "").strip()
    if _is_other_action_label(label):
        db_values[sort_col] = OTHER_ACTION_SORT_ORDER
        free_text_col = col_map.get("allow_free_text")
        if free_text_col and free_text_col not in db_values:
            db_values[free_text_col] = 1


def _load_dataset(cursor, conn, db_name: str, dataset: str) -> List[Dict[str, Any]]:
    ctx = _build_dataset_context(cursor, conn, db_name, dataset)
    table_name = ctx["table_name"]
    field_columns = ctx["field_columns"]
    primary_key = ctx["primary_key"]
    columns = ctx["columns"]

    order_parts = []
    col_map = {name.lower(): name for name in columns}
    if dataset == "actionCodes":
        if "sort_order" in col_map:
            order_parts.append(f"`{col_map['sort_order']}`")
        if "actionCode" in field_columns:
            order_parts.append(f"`{field_columns['actionCode']}`")
    else:
        code_column = field_columns.get("carcCode") or field_columns.get("rarcCode") or primary_key
        order_parts.append(_natural_code_order_sql(code_column))
        if "category" in field_columns:
            order_parts.append(f"`{field_columns['category']}`")

    where_sql = ""
    if not _include_inactive_requested() and "is_active" in col_map:
        where_sql = f" WHERE `{col_map['is_active']}` = 1"

    order_sql = ", ".join(order_parts) if order_parts else "1"
    cursor.execute(f"SELECT * FROM `{table_name}`{where_sql} ORDER BY {order_sql}")
    rows = cursor.fetchall() or []
    serialized = [_serialize_row(row, field_columns, primary_key) for row in rows]
    if dataset == "actionCodes":
        serialized = [
            row for row in serialized if not _is_other_action_label(row.get("actionCode"))
        ]
    return serialized


def list_governance_rows(dataset: str):
    conn = None
    cursor = None
    try:
        conn, cursor, db_name = get_connection(request)
        rows = _load_dataset(cursor, conn, db_name, dataset)
        return jsonify(rows), 200
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        logger.error("[GOVERNANCE LIST ERROR]: %s", exc)
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)


def create_governance_row(dataset: str):
    conn = None
    cursor = None
    try:
        payload = request.get_json(silent=True) or {}
        conn, cursor, db_name = get_connection(request)
        ctx = _build_dataset_context(cursor, conn, db_name, dataset)
        table_name = ctx["table_name"]
        field_columns = ctx["field_columns"]
        primary_key = ctx["primary_key"]
        columns = ctx["columns"]
        config = ctx["config"]
        db_values = _payload_to_db_values(payload, field_columns)

        col_map = {name.lower(): name for name in columns}
        if "is_active" in col_map and col_map["is_active"] not in db_values:
            db_values[col_map["is_active"]] = 1

        if dataset == "actionCodes":
            category_col = field_columns.get("category")
            action_col = field_columns.get("actionCode")
            category = (db_values.get(category_col) or "").strip()
            action_label = (db_values.get(action_col) or "").strip()
            if not category or not action_label:
                return jsonify({"error": "Action Code and Category are required."}), 400
            if _is_other_action_label(action_label):
                return jsonify({
                    "error": "Other is a built-in default for every category and cannot be created here."
                }), 400
            if "sort_order" in col_map and col_map["sort_order"] not in db_values:
                db_values[col_map["sort_order"]] = _next_action_sort_order(cursor, table_name, category)
            _apply_action_code_sort_order(db_values, field_columns, col_map)
            for key, value in (config.get("defaults") or {}).items():
                actual = col_map.get(key.lower())
                if actual and actual not in db_values:
                    db_values[actual] = value
        else:
            code_key = field_columns.get("carcCode") or field_columns.get("rarcCode")
            if code_key and not str(db_values.get(code_key) or "").strip():
                return jsonify({"error": "Code is required."}), 400

        if not db_values:
            return jsonify({"error": "No values provided."}), 400

        insert_columns = list(db_values.keys())
        placeholders = ", ".join(["%s"] * len(insert_columns))
        column_sql = ", ".join(f"`{col}`" for col in insert_columns)
        cursor.execute(
            f"INSERT INTO `{table_name}` ({column_sql}) VALUES ({placeholders})",
            [db_values[col] for col in insert_columns],
        )
        conn.commit()

        new_id = cursor.lastrowid
        if not new_id and primary_key in db_values:
            new_id = db_values[primary_key]

        if new_id is not None:
            cursor.execute(
                f"SELECT * FROM `{table_name}` WHERE `{primary_key}` = %s LIMIT 1",
                (new_id,),
            )
            row = cursor.fetchone()
            if row:
                return jsonify(_serialize_row(row, field_columns, primary_key)), 201

        rows = _load_dataset(cursor, conn, db_name, dataset)
        return jsonify(rows[-1] if rows else {}), 201
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        logger.error("[GOVERNANCE CREATE ERROR]: %s", exc)
        if conn:
            conn.rollback()
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)


def update_governance_row(dataset: str, row_id: str):
    conn = None
    cursor = None
    try:
        payload = request.get_json(silent=True) or {}
        conn, cursor, db_name = get_connection(request)
        ctx = _build_dataset_context(cursor, conn, db_name, dataset)
        table_name = ctx["table_name"]
        field_columns = ctx["field_columns"]
        primary_key = ctx["primary_key"]

        db_values = _payload_to_db_values(payload, field_columns)
        if primary_key in db_values:
            db_values.pop(primary_key, None)

        if not db_values:
            return jsonify({"error": "No values provided."}), 400

        if dataset == "actionCodes":
            columns = ctx["columns"]
            col_map = {name.lower(): name for name in columns}
            action_col = field_columns.get("actionCode")
            if action_col and _is_other_action_label(db_values.get(action_col)):
                return jsonify({
                    "error": "Other is a built-in default for every category and cannot be saved here."
                }), 400
            _apply_action_code_sort_order(db_values, field_columns, col_map)

        set_sql = ", ".join(f"`{col}` = %s" for col in db_values.keys())
        cursor.execute(
            f"UPDATE `{table_name}` SET {set_sql} WHERE `{primary_key}` = %s",
            [*db_values.values(), row_id],
        )
        if cursor.rowcount == 0:
            return jsonify({"error": "Row not found."}), 404
        conn.commit()

        cursor.execute(
            f"SELECT * FROM `{table_name}` WHERE `{primary_key}` = %s LIMIT 1",
            (row_id,),
        )
        row = cursor.fetchone()
        return jsonify(_serialize_row(row, field_columns, primary_key)), 200
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        logger.error("[GOVERNANCE UPDATE ERROR]: %s", exc)
        if conn:
            conn.rollback()
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)


def delete_governance_row(dataset: str, row_id: str):
    conn = None
    cursor = None
    try:
        conn, cursor, db_name = get_connection(request)
        ctx = _build_dataset_context(cursor, conn, db_name, dataset)
        table_name = ctx["table_name"]
        primary_key = ctx["primary_key"]
        columns = ctx["columns"]
        col_map = {name.lower(): name for name in columns}
        hard_delete = str(request.args.get("hard", "0")).lower() in {"1", "true", "yes"}

        if not hard_delete and "is_active" in col_map:
            is_active_col = col_map["is_active"]
            cursor.execute(
                f"UPDATE `{table_name}` SET `{is_active_col}` = 0 WHERE `{primary_key}` = %s",
                (row_id,),
            )
        else:
            cursor.execute(
                f"DELETE FROM `{table_name}` WHERE `{primary_key}` = %s",
                (row_id,),
            )
        if cursor.rowcount == 0:
            return jsonify({"error": "Row not found."}), 404
        conn.commit()
        return jsonify({"message": "Deleted"}), 200
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        logger.error("[GOVERNANCE DELETE ERROR]: %s", exc)
        if conn:
            conn.rollback()
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)


def reorder_governance_action_codes():
    conn = None
    cursor = None
    try:
        payload = request.get_json(silent=True) or {}
        category = (payload.get("category") or "").strip()
        ordered_ids = payload.get("orderedIds") or []
        if not category:
            return jsonify({"error": "Category is required."}), 400
        if not isinstance(ordered_ids, list) or not ordered_ids:
            return jsonify({"error": "orderedIds must be a non-empty list."}), 400

        conn, cursor, db_name = get_connection(request)
        ctx = _build_dataset_context(cursor, conn, db_name, "actionCodes")
        table_name = ctx["table_name"]
        primary_key = ctx["primary_key"]
        columns = ctx["columns"]
        col_map = {name.lower(): name for name in columns}
        sort_col = col_map.get("sort_order")
        category_col = ctx["field_columns"].get("category")
        action_col = ctx["field_columns"].get("actionCode")
        if not sort_col or not category_col or not action_col:
            return jsonify({"error": "Action code table is missing required columns."}), 400

        sort_value = 10
        for row_id in ordered_ids:
            cursor.execute(
                f"SELECT `{primary_key}`, `{action_col}`, `{category_col}` FROM `{table_name}` WHERE `{primary_key}` = %s LIMIT 1",
                (row_id,),
            )
            row = cursor.fetchone()
            if not row:
                return jsonify({"error": f"Action row '{row_id}' was not found."}), 404
            if (row.get(category_col) or "").strip() != category:
                return jsonify({"error": "All reordered actions must belong to the same category."}), 400

            label = (row.get(action_col) or "").strip()
            next_sort = OTHER_ACTION_SORT_ORDER if _is_other_action_label(label) else sort_value
            cursor.execute(
                f"UPDATE `{table_name}` SET `{sort_col}` = %s WHERE `{primary_key}` = %s",
                (next_sort, row_id),
            )
            if not _is_other_action_label(label):
                sort_value += 10

        conn.commit()
        rows = _load_dataset(cursor, conn, db_name, "actionCodes")
        return jsonify(rows), 200
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        logger.error("[GOVERNANCE REORDER ERROR]: %s", exc)
        if conn:
            conn.rollback()
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)


def register_governance_routes(blueprint: Blueprint):
    blueprint.add_url_rule(
        "/governance/actionCodes/reorder",
        view_func=reorder_governance_action_codes,
        methods=["POST"],
        endpoint="reorder_governance_action_codes",
    )
    blueprint.add_url_rule(
        "/governance/<dataset>",
        view_func=list_governance_rows,
        methods=["GET"],
        endpoint="list_governance_rows",
    )
    blueprint.add_url_rule(
        "/governance/<dataset>",
        view_func=create_governance_row,
        methods=["POST"],
        endpoint="create_governance_row",
    )
    blueprint.add_url_rule(
        "/governance/<dataset>/<row_id>",
        view_func=update_governance_row,
        methods=["PUT"],
        endpoint="update_governance_row",
    )
    blueprint.add_url_rule(
        "/governance/<dataset>/<row_id>",
        view_func=delete_governance_row,
        methods=["DELETE"],
        endpoint="delete_governance_row",
    )


for blueprint in GOVERNANCE_BLUEPRINTS:
    register_governance_routes(blueprint)
