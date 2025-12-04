from flask import Blueprint, request, jsonify
from db import get_connection, close_connection
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Blueprints for different APIs
rebound_api_status = Blueprint('rebound_api_status', __name__, url_prefix='/api/v1/rebound')
medevolve_api_status = Blueprint('medevolve_api_status', __name__, url_prefix='/api/v1/medevolve')

@medevolve_api_status.route("/change_model_status", methods=["GET", "POST"])
@rebound_api_status.route("/change_model_status", methods=["GET", "POST"])
def change_model_status():
    """
    This endpoint changes the status of an AI model.
    ---
    tags:
      - AI Automation
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            id:
              type: integer
              description: The ID of the AI model
            status:
              type: string
              description: The new status of the AI model
            user:
              type: string
              description: The user making the change
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

        id = request.json.get("id")
        status = request.json.get("status")
        user = request.json.get("user")

        ret = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        q = f"update ai_model set status='{status}', user='{user}', updated_at='{ret}' where id={id}"
        cursor.execute(q)
        conn.commit()

        return jsonify(ret), 200
    except Exception as e:
        logger.error(f"[ERROR]: {e}")
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)