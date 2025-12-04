from flask import Blueprint, request, jsonify
from db import get_connection, close_connection
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Blueprints for different APIs
rebound_api_action = Blueprint('rebound_api_action', __name__, url_prefix='/api/v1/rebound')
medevolve_api_action = Blueprint('medevolve_api_action', __name__, url_prefix='/api/v1/medevolve')

@rebound_api_action.route("/save_action", methods=["POST"])
@medevolve_api_action.route("/save_action", methods=["POST"])
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
        conn, cursor ,db_name= get_connection(request.base_url)
        claimno = request.json.get("claimno")
        action_date = request.json.get("action_date")
        action = request.json.get("action")
        claim_status = request.json.get("claim_status")
        thumb = request.json.get("thumb")
        notes = request.json.get("notes")
        username = request.json.get("username")

        q = f"select * from rate where username='{username}' and claimno='{claimno}' limit 1"
        cursor.execute(q)
        result = cursor.fetchone()
        if result is not None:
            q = f"update rate set action={thumb} where username='{username}' and claimno='{claimno}'"
        else:
            q = f"insert into rate(username, claimno, action) values('{username}', '{claimno}', {thumb})"
        cursor.execute(q)
        conn.commit()

        q = f"""
            insert into actions(ClaimNo, action_date, action, claim_status, notes, user) 
            values('{claimno}', '{action_date}', '{action}', '{claim_status}', "{notes}", "{username}")
        """
        cursor.execute(q)
        conn.commit()

        return jsonify("success"), 200
    except Exception as e:
        logger.error(f"[ERROR]: {e}")
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)