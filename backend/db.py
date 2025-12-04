import os
import time
from mysql.connector import pooling, Error
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try to load .env file, but don't fail if it doesn't exist
try:
    load_dotenv()
except Exception as e:
    logger.warning(f"Could not load .env file: {e}")

# RDS connection config
config = {
    "host": os.getenv('RDS_HOST', 'database-1.c9ym48eueeio.us-west-2.rds.amazonaws.com'),
    "user": os.getenv('RDS_USER', 'root'),
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

# Initialize connection pools with error handling
rebound_conn = None
medevolve_conn = None

try:
    rebound_conn = create_connection_pool("r2", "rebound_pool")
    medevolve_conn = create_connection_pool("medevolve", "medevolve_pool")
    logger.info("Connection pools created successfully")
except Exception as e:
    logger.warning(f"Failed to initialize connection pools: {e}")
    logger.warning("Running in development mode without database connection")
    # Don't raise the exception, allow the app to start without database

def get_connection(base_url):
    if rebound_conn is None or medevolve_conn is None:
        raise Exception("Database connection not available. Please check your MySQL configuration.")
    
    if 'rebound' in base_url:
        conn = rebound_conn.get_connection()
        cursor = conn.cursor(dictionary=True)
        # Set SQL mode to be more permissive with dates
        cursor.execute("SET SESSION sql_mode = '';")
        return conn, cursor, 'rebound'
    elif 'medevolve' in base_url:
        conn = medevolve_conn.get_connection()
        cursor = conn.cursor(dictionary=True)
        # Set SQL mode to be more permissive with dates
        cursor.execute("SET SESSION sql_mode = '';")
        return conn, cursor, 'medevolve'
    else:
        raise ValueError("Invalid base URL")

def close_connection(cursor, conn):
    if cursor:
        cursor.close()
    if conn:
        conn.close()