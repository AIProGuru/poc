import json
import logging
import uuid
from datetime import date
from typing import Optional

from flask import Blueprint, jsonify, request

from api.platform.claim_details.action_worklist_sync import (
    extract_selected_actions,
    resolve_tickle_date_for_triage,
    sync_custom_all_after_action,
)
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
        selected_actions = extract_selected_actions(action_payload)
    else:
        action_str = str(action_payload or "")
        selected_actions = extract_selected_actions(action_str)

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
        tickle_date = resolve_tickle_date_for_triage(
            cursor,
            action_str,
            explicit_date=explicit_tickle_date,
            explicit_tickle_time=payload.get("tickleTime"),
        )

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
