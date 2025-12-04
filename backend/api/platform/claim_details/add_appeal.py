from flask import Blueprint, request, jsonify
from db import get_connection, close_connection
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Blueprints for different APIs
rebound_api_appeal = Blueprint('rebound_api_appeal', __name__, url_prefix='/api/v1/rebound')
medevolve_api_appeal = Blueprint('medevolve_api_appeal', __name__, url_prefix='/api/v1/medevolve')

@medevolve_api_appeal.route("/save_appeal", methods=["POST"])
@rebound_api_appeal.route("/save_appeal", methods=["POST"])
def save_appeals():
    """
    This endpoint saves appeal data to the database.
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
            ClaimNo:
              type: string
              description: The claim number
            appeals:
              type: array
              items:
                type: string
              description: List of appeals
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
        conn, cursor,db_name = get_connection(request.base_url)

        id = request.json.get("ClaimNo")
        appeals = request.json.get("appeals")
        for i in range(6):
            appeals[i] = appeals[i].replace("\n", "").replace('"', "")
        q = f"""
            INSERT INTO appeals(ClaimNo, Appeal1, Appeal2, Appeal3, Appeal4, Appeal5, Appeal6)
            VALUES ("{id}", "{appeals[0]}", "{appeals[1]}", "{appeals[2]}", "{appeals[3]}", "{appeals[4]}", "{appeals[5]}")
        """
        cursor.execute(q)
        conn.commit()
        return jsonify("success"), 200
    except Exception as e:
        logger.error(f"[ERROR]: {e}")
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)