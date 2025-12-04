from flask import Blueprint, request, jsonify
import time
from db import get_connection, close_connection
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Blueprints for different APIs
rebound_api_recoverable = Blueprint('rebound_api_recoverable', __name__, url_prefix='/api/v1/rebound')
medevolve_api_recoverable = Blueprint('medevolve_api_recoverable', __name__, url_prefix='/api/v1/medevolve')

@rebound_api_recoverable.route("/statistics", methods=["GET"])
@medevolve_api_recoverable.route("/statistics", methods=["GET"])
def get_statistics():
    """
    This endpoint fetches statistics data.
    ---
    tags:
      - Statistics
    responses:
      200:
        description: Successful response
        schema:
          type: array
          items:
            type: object
            properties:
              label:
                type: string
              value:
                type: integer
      500:
        description: Internal server error
        schema:
          type: object
          properties:
            error:
              type: string
    """
    _start = time.time()
    conn = None
    cursor = None
    try:
        conn, cursor,db_name = get_connection(request.base_url)
        q = """
            SELECT 
                Category AS label, 
                COUNT(ID) AS value 
            FROM CUSTOM_ALL 
            WHERE Category IS NOT NULL 
                AND Category != 'Patient Resp' 
                AND Category != 'Contractual Adj' 
            GROUP BY Category
        """
        cursor.execute(q)
        results = cursor.fetchall()
        return jsonify(results), 200
    except Exception as e:
        logger.error(f"[ERROR]: {e}")
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)
        _end = time.time()
        logger.info(f"/statistics {_end - _start}")