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
    "pool_size": 15,
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

# Initialize connection pools lazily to avoid exhausting DB connections on startup.
rebound_conn = None
medevolve_conn = None
betacustomer_conn = None

def _ensure_pools():
    global rebound_conn, medevolve_conn, betacustomer_conn
    if medevolve_conn is not None and betacustomer_conn is not None:
        return
    try:
        # rebound_conn = create_connection_pool("r2", "rebound_pool")
        medevolve_conn = create_connection_pool("medevolve", "medevolve_pool")
        betacustomer_conn = create_connection_pool("betacustomer", "betacustomer_pool")
        logger.info("Connection pools created successfully")
    except Exception as e:
        logger.warning(f"Failed to initialize connection pools: {e}")
        logger.warning("Running in development mode without database connection")

def _extract_tenant_hint(request_or_url):
    if request_or_url is None:
        return ""
    # If a Flask request object is provided, inspect headers + path.
    if hasattr(request_or_url, "headers") and hasattr(request_or_url, "path"):
        header_hint = (
            request_or_url.headers.get("X-Tenant")
            or request_or_url.headers.get("X-Client")
            or request_or_url.headers.get("X-Client-Db")
            or ""
        )
        path_hint = request_or_url.path or ""
        base_hint = getattr(request_or_url, "base_url", "") or ""
        return " ".join([header_hint, path_hint, base_hint]).lower()
    return str(request_or_url).lower()


def _current_database_name(cursor, fallback: str) -> str:
    """Return the schema name for the active connection (not the API tenant label)."""
    try:
        cursor.execute("SELECT DATABASE() AS db_name")
        row = cursor.fetchone() or {}
        db_name = row.get("db_name")
        if db_name:
            return db_name
    except Exception as exc:
        logger.warning("Unable to resolve active database name: %s", exc)
    return fallback


def get_connection(request_or_url):
    _ensure_pools()
    if medevolve_conn is None and betacustomer_conn is None:
        raise Exception("Database connection not available. Please check your MySQL configuration.")

    hint = _extract_tenant_hint(request_or_url)

    # if 'rebound' in hint:
    #     conn = rebound_conn.get_connection()
    #     cursor = conn.cursor(dictionary=True)
    #     # Set SQL mode to be more permissive with dates
    #     cursor.execute("SET SESSION sql_mode = '';")
    #     return conn, cursor, 'rebound'
    if "betacustomer" in hint:
        if betacustomer_conn is None:
            raise Exception("Database connection not available. Please check your MySQL configuration.")
        conn = betacustomer_conn.get_connection()
        cursor = conn.cursor(dictionary=True)
        # Set SQL mode to be more permissive with dates
        cursor.execute("SET SESSION sql_mode = '';")
        return conn, cursor, _current_database_name(cursor, "betacustomer")
    if "rebound" in hint or "medevolve" in hint or "pilotcustomer" in hint or "demo" in hint:
        conn = medevolve_conn.get_connection()
        cursor = conn.cursor(dictionary=True)
        # Set SQL mode to be more permissive with dates
        cursor.execute("SET SESSION sql_mode = '';")
        # pilotcustomer/rebound/demo API routes share the medevolve pool in this environment.
        return conn, cursor, _current_database_name(cursor, "medevolve")
    raise ValueError("Invalid base URL")

def close_connection(cursor, conn):
    if cursor:
        cursor.close()
    if conn:
        conn.close()
