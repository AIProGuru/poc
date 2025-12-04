from flask import Blueprint, request, jsonify
import time
import os
import logging
from db import get_connection, close_connection

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Blueprints
rebound_api_tags = Blueprint('rebound_api_tags', __name__, url_prefix='/api/v1/rebound')
medevolve_api_tags = Blueprint('medevolve_api_tags', __name__, url_prefix='/api/v1/medevolve')

@rebound_api_tags.route("/get_all_tags", methods=["GET"])
@medevolve_api_tags.route("/get_all_tags", methods=["GET"])
def get_tags():
    """
    This endpoint retrieves all distinct categories (tags) from the system.
    ---
    tags:
      - Platform Data
    responses:
      200:
        description: Successful response
        schema:
          type: array
          items:
            type: string
            description: Category name
          example: ["Medical Coding", "Contractual Adj", "Patient Resp", "Delinquent"]
      500:
        description: Internal server error
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Internal server Error"
    """
    _start = time.time()
    conn = None
    cursor = None
    try:
        # Get database connection and cursor
        conn, cursor, db_name = get_connection(request.base_url)
        
        # Query to fetch distinct categories
        query = """
            SELECT DISTINCT Category 
            FROM CUSTOM_ALL 
            ORDER BY Category;
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        
        # Process results
        categories = []
        for row in rows:
            if row["Category"] is not None:
                categories.append(row["Category"])
            else:
                categories.append(os.getenv('DELIQUENT', 'Delinquent'))
        
        logger.info(f"Called from: {request.blueprint}, Database: {db_name}")
        return jsonify(categories), 200
        
    except Exception as e:
        logger.error(f"[ERROR]: {e}")
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)
        _end = time.time()
        logger.info(f"/get_all_tags took {_end - _start:.2f} seconds")