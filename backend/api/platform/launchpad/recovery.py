import time
import os
from flask import Blueprint, request, jsonify
from db import get_connection, close_connection
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Blueprints
rebound_api_recovery = Blueprint('rebound_api_recovery', __name__, url_prefix='/api/v1/rebound')
medevolve_api_recovery = Blueprint('medevolve_api_recovery', __name__, url_prefix='/api/v1/medevolve')

@medevolve_api_recovery.route("/recovery", methods=["GET", "POST"])
@rebound_api_recovery.route("/recovery", methods=["GET", "POST"])
def get_recovery():
    """
    This endpoint retrieves recovery statistics from the system.
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
              count:
                type: integer
                description: Number of claims in each category
              amount:
                type: number
                format: float
                description: Total amount for each category
          example: [
            {
              "count": 100,
              "amount": 50000.00,
              "description": "Total recoverable amount from denial actions"
            },
            {
              "count": 200,
              "amount": 75000.00,
              "description": "Total amount from claims with actions"
            },
            {
              "count": 150,
              "amount": 60000.00,
              "description": "Total amount from automated claims"
            },
            {
              "count": 50,
              "amount": 25000.00,
              "description": "Total overturned amount from recovered claims"
            }
          ]
      500:
        description: Internal server error
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Internal server Error"
    """
    conn = None
    cursor = None
    try:
        # Get database connection and cursor
        conn, cursor, db_name = get_connection(request.base_url)
        
        ret = [
            {"count": 0, "amount": 0},
            {"count": 0, "amount": 0},
            {"count": 0, "amount": 0},
            {"count": 0, "amount": 0},
        ]

        # Query 1: Total recoverable amount from denial actions
        query1 = """
            SELECT 
                SUM(recoverable_amount) amount, 
                COUNT(1) cnt 
            FROM denial_actions;
        """
        cursor.execute(query1)
        row = cursor.fetchone()
        ret[0]['count'] = row['cnt']
        ret[0]['amount'] = row['amount']

        # Query 2: Total amount from claims with actions
        query2 = """
            SELECT 
                SUM(Amount) amount, 
                COUNT(1) cnt 
            FROM CUSTOM_ALL 
            WHERE EXISTS (
                SELECT 1 
                FROM actions 
                WHERE actions.ClaimNo=CUSTOM_ALL.ClaimNo
            );
        """
        cursor.execute(query2)
        row = cursor.fetchone()
        ret[1]['count'] = row['cnt']
        ret[1]['amount'] = row['amount']

        # Query 3: Total amount from automated claims
        query3 = """
            SELECT 
                SUM(Amount) amount, 
                COUNT(1) cnt 
            FROM CUSTOM_ALL 
            WHERE CUSTOM_ALL.Automation!=0;
        """
        cursor.execute(query3)
        row = cursor.fetchone()
        ret[2]['count'] = row['cnt']
        ret[2]['amount'] = row['amount']

        # Query 4: Total overturned amount from recovered claims
        query4 = """
            SELECT 
                SUM(OverturnAmount) amount, 
                COUNT(1) cnt 
            FROM CUSTOM_ALL 
            WHERE CUSTOM_ALL.Recovery=1;
        """
        cursor.execute(query4)
        row = cursor.fetchone()
        ret[3]['count'] = row['cnt']
        ret[3]['amount'] = row['amount']

        logger.info(f"Called from: {request.blueprint}, Database: {db_name}")
        return jsonify(ret), 200

    except Exception as e:
        logger.error(f"[ERROR]: {e}")
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)