import json
import logging
import re
import uuid
from datetime import date, datetime, timedelta
from typing import Any, Dict, Optional

from flask import Blueprint, jsonify, request

from api.platform.claim_details.action_worklist_sync import default_tickle_date, sync_custom_all_after_action
from db import close_connection, get_connection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

rebound_api_bulk_action = Blueprint(
    "rebound_api_bulk_action", __name__, url_prefix="/api/v1/rebound"
)
medevolve_api_bulk_action = Blueprint(
    "medevolve_api_bulk_action", __name__, url_prefix="/api/v1/medevolve"
)
pilotcustomer_api_bulk_action = Blueprint(
    "pilotcustomer_api_bulk_action", __name__, url_prefix="/api/v1/pilotcustomer"
)
betacustomer_api_bulk_action = Blueprint(
    "betacustomer_api_bulk_action", __name__, url_prefix="/api/v1/betacustomer"
)

def _escape_sql(value: Any) -> str:
    if value is None:
        return ""
    return str(value).replace("\\", "\\\\").replace('"', '\\"').replace("'", "''")


def _parse_tickle_days(tickle_time: str) -> Optional[int]:
    if not tickle_time:
        return None
    raw = str(tickle_time).strip().lower()
    if not raw:
        return None
    match = re.search(r"(\d+)", raw)
    if not match:
        return None
    days = int(match.group(1))
    return days if days > 0 else None


def _compute_tickle_date(tickle_time: str, explicit_date: Optional[str]) -> Optional[str]:
    if explicit_date:
        parsed = str(explicit_date).strip()
        if parsed:
            for fmt in ("%Y-%m-%d", "%m/%d/%Y"):
                try:
                    return datetime.strptime(parsed, fmt).strftime("%Y-%m-%d")
                except ValueError:
                    continue
            return parsed[:10]
    days = _parse_tickle_days(tickle_time)
    if days is None:
        return None
    return (date.today() + timedelta(days=days)).strftime("%Y-%m-%d")


def _resolve_tickle_time_for_actions(cursor, selected_actions) -> str:
    """Return the tickle_time with the longest interval among selected action codes."""
    if not selected_actions:
        return ""
    placeholders = ", ".join(["%s"] * len(selected_actions))
    cursor.execute(
        f"""
        SELECT tickle_time
        FROM claim_action_items
        WHERE is_active = 1
          AND action_label IN ({placeholders})
          AND tickle_time IS NOT NULL
          AND TRIM(tickle_time) <> ''
        """,
        tuple(selected_actions),
    )
    rows = cursor.fetchall() or []
    best_time = ""
    best_days = -1
    for row in rows:
        tickle_time = (row.get("tickle_time") or "").strip()
        days = _parse_tickle_days(tickle_time)
        if days is not None and days > best_days:
            best_days = days
            best_time = tickle_time
    return best_time


def _update_custom_all(
    cursor,
    db_name: str,
    claimno: str,
    action_date: str,
    claim_status: str,
    tickle_date: Optional[str],
) -> None:
    sync_custom_all_after_action(
        cursor, db_name, claimno, action_date, claim_status, tickle_date
    )


def _process_single_claim(
    cursor,
    db_name: str,
    claimno: str,
    action_date: str,
    action: str,
    claim_status: str,
    notes: str,
    username: str,
    tickle_date: Optional[str],
) -> None:
    cursor.execute(
        """
        INSERT INTO actions (ClaimNo, action_date, action, claim_status, notes, user)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (claimno, action_date, action, claim_status, notes, username),
    )
    _update_custom_all(cursor, db_name, claimno, action_date, claim_status, tickle_date)


@rebound_api_bulk_action.route("/bulk_save_action", methods=["POST"])
@medevolve_api_bulk_action.route("/bulk_save_action", methods=["POST"])
@pilotcustomer_api_bulk_action.route("/bulk_save_action", methods=["POST"])
@betacustomer_api_bulk_action.route("/bulk_save_action", methods=["POST"])
def bulk_save_action():
    if not request.is_json:
        return (
            jsonify({"error": "Unsupported Media Type: Content-Type must be application/json"}),
            415,
        )

    payload = request.get_json(silent=True) or {}
    claim_nos = payload.get("claimNos") or payload.get("claimnos") or []
    if not isinstance(claim_nos, list) or len(claim_nos) == 0:
        return jsonify({"error": "claimNos must be a non-empty array"}), 400

    action_date = payload.get("action_date") or date.today().strftime("%m/%d/%Y")
    claim_status = payload.get("claim_status") or "triage"
    username = payload.get("username") or ""
    notes = payload.get("notes") or ""
    automation = payload.get("automation") or ""
    explicit_tickle_date = payload.get("tickleDate")
    action_payload = payload.get("action")

    if isinstance(action_payload, dict):
        action_str = json.dumps(action_payload)
        selected_actions = action_payload.get("selected") or []
    else:
        action_str = str(action_payload or "")
        try:
            parsed = json.loads(action_str) if action_str else {}
            selected_actions = parsed.get("selected") or [] if isinstance(parsed, dict) else []
        except json.JSONDecodeError:
            selected_actions = []

    bulk_operation_id = str(uuid.uuid4())
    audit_notes = notes.strip()
    if audit_notes:
        audit_notes = f"[Bulk Update {bulk_operation_id}] {audit_notes}"
    else:
        audit_notes = f"[Bulk Update {bulk_operation_id}]"

    if automation:
        try:
            action_obj = json.loads(action_str) if action_str else {}
            if not isinstance(action_obj, dict):
                action_obj = {"selected": selected_actions}
            action_obj["automation"] = automation
            action_obj["bulkOperationId"] = bulk_operation_id
            action_str = json.dumps(action_obj)
        except json.JSONDecodeError:
            action_str = json.dumps(
                {
                    "selected": selected_actions,
                    "automation": automation,
                    "bulkOperationId": bulk_operation_id,
                }
            )

    conn = None
    cursor = None
    results = []
    success_count = 0
    failure_count = 0

    try:
        conn, cursor, db_name = get_connection(request)
        tickle_time = payload.get("tickleTime") or _resolve_tickle_time_for_actions(
            cursor, selected_actions
        )
        tickle_date = _compute_tickle_date(tickle_time, explicit_tickle_date)
        if not tickle_date:
            tickle_date = default_tickle_date(7)

        for idx, raw_claim_no in enumerate(claim_nos):
            claimno = str(raw_claim_no or "").strip()
            if not claimno:
                failure_count += 1
                results.append(
                    {"index": idx, "claimNo": raw_claim_no, "status": "error", "error": "Missing claim number"}
                )
                continue

            try:
                _process_single_claim(
                    cursor,
                    db_name,
                    claimno,
                    action_date,
                    action_str,
                    claim_status,
                    audit_notes,
                    username,
                    tickle_date,
                )
                conn.commit()
                success_count += 1
                results.append(
                    {
                        "index": idx,
                        "claimNo": claimno,
                        "status": "ok",
                        "tickleDate": tickle_date,
                    }
                )
            except Exception as item_exc:
                conn.rollback()
                failure_count += 1
                logger.error("Bulk action failed for claim %s: %s", claimno, item_exc)
                results.append(
                    {
                        "index": idx,
                        "claimNo": claimno,
                        "status": "error",
                        "error": str(item_exc),
                    }
                )

        return (
            jsonify(
                {
                    "bulkOperationId": bulk_operation_id,
                    "results": results,
                    "successCount": success_count,
                    "failureCount": failure_count,
                    "tickleDate": tickle_date,
                }
            ),
            200,
        )
    except Exception as exc:
        logger.error("[BULK SAVE ACTION ERROR]: %s", exc)
        if conn:
            conn.rollback()
        return jsonify({"error": "Failed to process bulk action", "detail": str(exc)}), 500
    finally:
        close_connection(cursor, conn)
