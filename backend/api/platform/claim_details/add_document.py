from flask import Blueprint, request, jsonify
from db import get_connection, close_connection
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Blueprints for different APIs
rebound_api_add_doc = Blueprint('rebound_api_add_doc', __name__, url_prefix='/api/v1/rebound')
medevolve_api_add_doc = Blueprint('medevolve_api_add_doc', __name__, url_prefix='/api/v1/medevolve')

@rebound_api_add_doc.route("/add_document", methods=["POST"])
@medevolve_api_add_doc.route("/add_document", methods=["POST"])
def add_document():
    """
    This endpoint adds a document to the database.
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
            Category:
              type: string
              description: The category of the document
            DenialCode:
              type: string
              description: The denial code
            Comments:
              type: string
              description: Comments about the document
            Evidence1:
              type: string
              description: First piece of evidence
            Evidence2:
              type: string
              description: Second piece of evidence
            Resubmittion:
              type: string
              description: Resubmission details
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
        category = request.json.get("Category")
        denial_code = request.json.get("DenialCode")
        comments = request.json.get("Comments")
        evidence1 = request.json.get("Evidence1")
        evidence2 = request.json.get("Evidence2")
        resubmittion = request.json.get("Resubmittion")
        
        q = f"DELETE FROM documents WHERE id='{id}'"
        cursor.execute(q)
        
        q = f"""
            INSERT INTO documents (id, category, denial_code, comments, evidence1, evidence2, resubmittion)
            VALUES ('{id}', '{category}', '{denial_code}', '{comments}', '{evidence1}', '{evidence2}', '{resubmittion}')
        """
        cursor.execute(q)
        conn.commit()
        
        return jsonify("success"), 200
    except Exception as e:
        logger.error(f"[ERROR]: {e}")
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)