from flask import Blueprint, request, jsonify
import time
import logging
from db import get_connection, close_connection

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Blueprints
rebound_api_payer = Blueprint('rebound_api_payer', __name__, url_prefix='/api/v1/rebound')
medevolve_api_payer = Blueprint('medevolve_api_payer', __name__, url_prefix='/api/v1/medevolve')

@rebound_api_payer.route("/get_all_payers", methods=["GET"])
@medevolve_api_payer.route("/get_all_payers", methods=["GET"])
def get_all_payers():
    """
    This endpoint fetches all distinct payer names from the system.
    ---
    tags:
      - Platform Data
    responses:
      200:
        description: Successful response
        schema:
          type: array
          items:
            type: object
            properties:
              PayerName:
                type: string
                description: Name of the payer
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
        
        # SQL query to fetch distinct payer names
        query = """
            SELECT DISTINCT PayerName 
            FROM CUSTOM_ALL 
            WHERE PayerName IS NOT NULL 
            ORDER BY PayerName;
        """
        
        cursor.execute(query)
        results = cursor.fetchall()
        
        logger.info(f"Called from: {request.blueprint}, Database: {db_name}")
        return jsonify(results), 200
        
    except Exception as e:
        logger.error(f"[ERROR]: {e}")
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)
        _end = time.time()
        logger.info(f"/get_all_payers took {_end - _start:.2f} seconds")