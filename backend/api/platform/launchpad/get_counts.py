from flask import Blueprint, request, jsonify
import time
import logging
from db import get_connection, close_connection

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Blueprints
rebound_api_counts = Blueprint('rebound_api_counts', __name__, url_prefix='/api/v1/rebound')
medevolve_api_counts = Blueprint('medevolve_api_counts', __name__, url_prefix='/api/v1/medevolve')

@rebound_api_counts.route("/get_counts", methods=["GET"])
@medevolve_api_counts.route("/get_counts", methods=["GET"])
def get_counts():
    """
    This endpoint fetches various counts and amounts from the system.
    ---
    tags:
      - Platform Data
    responses:
      200:
        description: Successful response
        schema:
          type: object
          properties:
            cnt1:
              type: integer
              description: Count of non-contractual, non-patient responsibility claims with no automation
            cnt2:
              type: integer
              description: Count of contractual adjustment claims with no automation
            cnt3:
              type: integer
              description: Count of patient responsibility claims with no automation
            cnt4:
              type: integer
              description: Count of uncategorized claims with no automation
            cnt6:
              type: integer
              description: Count of automated claims
            cnt7:
              type: integer
              description: Total count of claims
            amount1:
              type: number
              description: Total amount for non-contractual, non-patient responsibility claims
            amount2:
              type: number
              description: Total amount for contractual adjustment claims
            amount3:
              type: number
              description: Total amount for patient responsibility claims
            amount4:
              type: number
              description: Total amount for uncategorized claims
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
        # Get database connection and cursor
        conn, cursor, db_name = get_connection(request.base_url)
        
        # SQL query to fetch counts and amounts
        query = """
            SELECT
                COUNT(CASE WHEN (Category != 'Contractual Adj' AND Category != 'Patient Resp' 
                    AND Category IS NOT NULL AND Automation = 0) THEN 1 ELSE NULL END) cnt1,
                COUNT(CASE WHEN Category = 'Contractual Adj' AND Automation = 0 THEN 1 ELSE NULL END) cnt2,
                COUNT(CASE WHEN Category = 'Patient Resp' AND Automation = 0 THEN 1 ELSE NULL END) cnt3,
                COUNT(CASE WHEN Category IS NULL AND Automation = 0 THEN 1 ELSE NULL END) cnt4,
                COUNT(CASE WHEN Automation != 0 THEN 1 ELSE NULL END) cnt6,
                COUNT(1) cnt7,
                SUM(CASE WHEN (Category != 'Contractual Adj' AND Category != 'Patient Resp' 
                    AND Category IS NOT NULL) THEN Amount ELSE 0 END) amount1,
                SUM(CASE WHEN Category = 'Contractual Adj' THEN Amount ELSE 0 END) amount2,
                SUM(CASE WHEN Category = 'Patient Resp' THEN Amount ELSE 0 END) amount3,
                SUM(CASE WHEN Category IS NULL THEN Amount ELSE 0 END) amount4
            FROM CUSTOM_ALL;
        """
        
        cursor.execute(query)
        results = cursor.fetchone()
        
        logger.info(f"Called from: {request.blueprint}, Database: {db_name}")
        return jsonify(results), 200
        
    except Exception as e:
        logger.error(f"[ERROR]: {e}")
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)
        _end = time.time()
        logger.info(f"/get_counts took {_end - _start:.2f} seconds")