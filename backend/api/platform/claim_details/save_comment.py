from flask import Blueprint, request, jsonify
from db import get_connection, close_connection
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Blueprints for different APIs
rebound_api_comment = Blueprint('rebound_api_comment', __name__, url_prefix='/api/v1/rebound')
medevolve_api_comment = Blueprint('medevolve_api_comment', __name__, url_prefix='/api/v1/medevolve')

@rebound_api_comment.route("/save_comment", methods=["POST"])
@medevolve_api_comment.route("/save_comment", methods=["POST"])
def save_comment():
    """
    This endpoint saves a comment to the database.
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
            comment:
              type: object
              properties:
                Additional:
                  type: string
                CPT:
                  type: string
                Description:
                  type: string
                Recommendation:
                  type: string
                Root:
                  type: string
                Steps:
                  type: string
                Evidence1:
                  type: string
                Evidence2:
                  type: string
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
        comment = request.json.get("comment")
        query = f"""
        INSERT INTO comments(ClaimNo, Additional, CPT, Description, Recommendation, Root, Steps, Evidence1, Evidence2)
        VALUES("{id}", "{comment['Additional']}", "{comment['CPT']}", "{comment['Description']}", "{comment['Recommendation']}", "{comment['Root']}", "{comment['Steps']}", "{comment['Evidence1']}", "{comment['Evidence2']}")
        ON DUPLICATE KEY UPDATE
            Additional="{comment['Additional']}",
            CPT="{comment['CPT']}",
            Description="{comment['Description']}",
            Recommendation="{comment['Recommendation']}",
            Root="{comment['Root']}",
            Steps="{comment['Steps']}",
            Evidence1="{comment['Evidence1']}",
            Evidence2="{comment['Evidence2']}"
        """
        cursor.execute(query)
        conn.commit()
        return jsonify("success"), 200
    except Exception as e:
        logger.error(f"[ERROR]: {e}")
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)