import os
import time
from mysql.connector import pooling, Error
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# RDS connection config
config = {
    "host": os.getenv('RDS_HOST', 'database-1.c9ym48eueeio.us-west-2.rds.amazonaws.com'),
    "user": os.getenv('RDS_USER', 'admin'),
    "password": os.getenv('RDS_PASSWORD', ''),
    "port": int(os.getenv('RDS_PORT', '3306')),
    "pool_size": 32,
    "connection_timeout": 20,
    "buffered": True
}

def create_connection_pool(database_name, pool_name):
    try:
        logger.info(f"Creating pool for {database_name}")
        start_time = time.time()
        
        pool = pooling.MySQLConnectionPool(
            pool_name=pool_name,
            **config,
            database=database_name
        )
        
        end_time = time.time()
        logger.info(f"Pool creation took {end_time - start_time:.2f} seconds")
        
        return pool
            
    except Error as e:
        logger.error(f"Failed to create connection pool: {e}")
        raise

# try:
#     demo_conn = create_connection_pool("aaftaab", "demo_pool")
#     logger.info("Demo Connection pools created successfully")
# except Exception as e:
#     logger.error(f"Failed to initialize connection pools: {e}")
#     raise

def get_connection():
    conn = demo_conn.get_connection()
    cursor = conn.cursor(dictionary=True)
    # Set SQL mode to be more permissive with dates
    cursor.execute("SET SESSION sql_mode = '';")
    return conn, cursor

def close_connection(cursor, conn):
    if cursor:
        cursor.close()
    if conn:
        conn.close()






demo_api = Blueprint('demo_api', __name__, url_prefix='/api/v1/demo')

@demo_api.route("/data", methods=["GET"])
def get_data():
    """
    This endpoint fetches statistics data.
    ---
    tags:
      - Demo
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
        conn, cursor = get_connection()
        q = """
            SELECT
                *
            FROM demo
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
        logger.info(f"/data {_end - _start}")

@demo_api.route("/get_claim", methods=["GET"])
def get_claim():
    """
    This endpoint fetches claim details based on the claim number.
    ---
    tags:
      - Demo
    parameters:
      - in: query
        name: id
        type: string
        required: true
        description: Claim number
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
        conn, cursor = get_connection()
        claim_no = request.args.get("id")
        q = f"""
            SELECT
                *
            FROM demo
            WHERE LIMS_CLINIC_ID={claim_no}
        """
        cursor.execute(q)
        result = cursor.fetchone()
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"[ERROR]: {e}")
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)
        _end = time.time()
        logger.info(f"/get_claim {_end - _start}")