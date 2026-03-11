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
    Save or update a claim comment record.
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
              description: Claim number to associate the comment with
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
        description: Comment saved successfully
      400:
        description: Validation error
      500:
        description: Internal server error
    """
    conn = None
    cursor = None
    try:
        conn, cursor, db_name = get_connection(request)
        payload = request.get_json(force=True) or {}
        claim_no = payload.get("ClaimNo")
        comment = payload.get("comment") or {}

        if not claim_no:
            return jsonify({"error": "ClaimNo is required"}), 400

        fields = [
            "Additional",
            "CPT",
            "Description",
            "Recommendation",
            "Root",
            "Steps",
            "Evidence1",
            "Evidence2",
        ]

        values = [comment.get(field, "") or "" for field in fields]

        cursor.execute("SELECT 1 FROM comments WHERE ClaimNo=%s LIMIT 1", (claim_no,))
        exists = cursor.fetchone() is not None

        if exists:
            update_query = """
                UPDATE comments
                SET Additional=%s,
                    CPT=%s,
                    Description=%s,
                    Recommendation=%s,
                    Root=%s,
                    Steps=%s,
                    Evidence1=%s,
                    Evidence2=%s
                WHERE ClaimNo=%s
            """
            cursor.execute(update_query, (*values, claim_no))
        else:
            insert_query = """
                INSERT INTO comments
                    (ClaimNo, Additional, CPT, Description, Recommendation, Root, Steps, Evidence1, Evidence2)
                VALUES
                    (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(insert_query, (claim_no, *values))

        conn.commit()
        return jsonify({"status": "success"}), 200
    except Exception as e:
        logger.error(f"[ERROR]: {e}")
        if conn:
            conn.rollback()
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)
