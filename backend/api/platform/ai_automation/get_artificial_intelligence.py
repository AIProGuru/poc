from flask import Blueprint, request, jsonify
import json
from db import get_connection, close_connection
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Blueprints for different APIs
rebound_api_ai = Blueprint('rebound_api_ai', __name__, url_prefix='/api/v1/rebound')
medevolve_api_ai = Blueprint('medevolve_api_ai', __name__, url_prefix='/api/v1/medevolve')

@rebound_api_ai.route("/get_artificial_intelligence", methods=["GET"])
@medevolve_api_ai.route("/get_artificial_intelligence", methods=["GET"])
def get_artificial_intelligence():
    """
    This endpoint fetches artificial intelligence model data.
    ---
    tags:
      - AI Automation
    responses:
      200:
        description: Successful response
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
              Title:
                type: string
              Count:
                type: integer
              Amount:
                type: number
              Code:
                type: string
              GroupCode:
                type: string
              Remark:
                type: string
              Category:
                type: string
              Status:
                type: string
              UpdatedAt:
                type: string
              User:
                type: string
              extra:
                type: object
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
        conn, cursor, db_name = get_connection(request.base_url)

        ret = []

        q = "select * from ai_model"
        cursor.execute(q)
        queries_for_ai_model = cursor.fetchall()

        for item in queries_for_ai_model:
            logger.info(f"Executing query: {item['query']}")
            try:
                cursor.execute(item["query"])
                row = cursor.fetchone()
                if row is not None:
                    try:
                        extra_data = json.loads(item["extra"])
                    except json.JSONDecodeError:
                        extra_data = {}

                    ret.append(
                        {
                            "id": item["id"],
                            "Title": item["title"],
                            "Count": row["cnt"],
                            "Amount": row["amount"],
                            "Code": row["AdjustmentReason"],
                            "GroupCode": row["AdjustmentGroup"],
                            "Remark": item["remark"],
                            "Category": row["DenialCategory"],
                            "Status": item["status"],
                            "UpdatedAt": (
                                item["updated_at"].strftime("%Y-%m-%d %H:%M:%S")
                                if item["updated_at"] is not None
                                else ""
                            ),
                            "User": item["user"],
                            "extra": extra_data,
                        }
                    )
            except Exception as query_error:
                logger.error(f"[QUERY ERROR]: {query_error} - Query: {item['query']}")
                continue

        return jsonify(ret), 200
    except Exception as e:
        logger.error(f"[ERROR]: {e}")
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)