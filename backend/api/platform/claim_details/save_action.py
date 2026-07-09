import json
import logging

from flask import Blueprint, jsonify, request

from api.platform.claim_details.action_worklist_sync import (
    resolve_tickle_date_for_triage,
    sync_custom_all_after_action,
)
from db import close_connection, get_connection

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Blueprints for different APIs
rebound_api_action = Blueprint('rebound_api_action', __name__, url_prefix='/api/v1/rebound')
medevolve_api_action = Blueprint('medevolve_api_action', __name__, url_prefix='/api/v1/medevolve')
pilotcustomer_api_action = Blueprint('pilotcustomer_api_action', __name__, url_prefix='/api/v1/pilotcustomer')
betacustomer_api_action = Blueprint('betacustomer_api_action', __name__, url_prefix='/api/v1/betacustomer')

@rebound_api_action.route("/save_action", methods=["POST"])
@medevolve_api_action.route("/save_action", methods=["POST"])
@pilotcustomer_api_action.route("/save_action", methods=["POST"])
@betacustomer_api_action.route("/save_action", methods=["POST"])
def save_action():
    """
    This endpoint saves an action to the database.
    ---
    tags:
      - Claim Details
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            claimno:
              type: string
              description: The claim number
            action_date:
              type: string
              description: The date of the action
            action:
              type: string
              description: The action taken
            claim_status:
              type: string
              description: The status of the claim
            thumb:
              type: integer
              description: The thumb action (e.g., up or down)
            notes:
              type: string
              description: Notes about the action
            username:
              type: string
              description: The username of the person taking the action
    responses:
      200:
        description: Successful response
        schema:
          type: string
      500:
        description: Internal server error
        schema:
          type: object
          properties:
            error:
              type: string
    """
    conn = None
    cursor = None
    try:
        payload = request.get_json(silent=True) or {}
        conn, cursor, db_name = get_connection(request)
        claimno = payload.get("claimno")
        action_date = payload.get("action_date") or payload.get("aaction_date")
        action = payload.get("action")
        claim_status = payload.get("claim_status")
        thumb = payload.get("thumb")
        notes = payload.get("notes")
        username = payload.get("username")
        explicit_tickle_date = payload.get("tickleDate")
        explicit_tickle_time = payload.get("tickleTime")

        if not claimno:
            return jsonify({"error": "claimno is required"}), 400

        if thumb is not None and str(thumb) != "":
            cursor.execute(
                "SELECT 1 FROM rate WHERE username = %s AND claimno = %s LIMIT 1",
                (username, claimno),
            )
            result = cursor.fetchone()
            if result is not None:
                cursor.execute(
                    "UPDATE rate SET action = %s WHERE username = %s AND claimno = %s",
                    (thumb, username, claimno),
                )
            else:
                cursor.execute(
                    "INSERT INTO rate(username, claimno, action) VALUES (%s, %s, %s)",
                    (username, claimno, thumb),
                )

        cursor.execute(
            """
            INSERT INTO actions (ClaimNo, action_date, action, claim_status, notes, user)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (claimno, action_date, action, claim_status, notes, username),
        )

        if str(claim_status or "").strip().lower() == "triage":
            tickle_date = resolve_tickle_date_for_triage(
                cursor,
                action,
                explicit_date=explicit_tickle_date,
                explicit_tickle_time=explicit_tickle_time,
            )
            sync_custom_all_after_action(
                cursor,
                db_name,
                claimno,
                action_date,
                claim_status,
                tickle_date,
            )

        conn.commit()
        return jsonify("success"), 200
    except Exception as e:
        logger.error(f"[ERROR]: {e}")
        if conn:
            conn.rollback()
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)
