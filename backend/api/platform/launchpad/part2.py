from flask import Blueprint, request, jsonify
from typing import Dict, List, Optional, Tuple
import time
import logging
from datetime import date, datetime
from db import get_connection, close_connection
from core.gen_sql_platform.Generate_Platform_SQL import generate_sql as newGenerateSQL, merge_request_extra
from api.platform.launchpad.stratification_details import (
    build_priority_helpers,
    get_custom_all_patient_payment_expr,
    get_existing_columns,
)
from api.platform.launchpad.worklist_queue import build_part2_grouped_sql

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Blueprints
rebound_api_part2 = Blueprint('rebound_api_part2', __name__, url_prefix='/api/v1/rebound')
rebound_api_part2.api_name = 'rebound_api_part2'

medevolve_api_part2 = Blueprint('medevolve_api_part2', __name__, url_prefix='/api/v1/medevolve')
medevolve_api_part2.api_name = 'medevolve_api_part2'

pilotcustomer_api_part2 = Blueprint('pilotcustomer_api_part2', __name__, url_prefix='/api/v1/pilotcustomer')
pilotcustomer_api_part2.api_name = 'pilotcustomer_api_part2'

betacustomer_api_part2 = Blueprint('betacustomer_api_part2', __name__, url_prefix='/api/v1/betacustomer')
betacustomer_api_part2.api_name = 'betacustomer_api_part2'

@rebound_api_part2.route("/part2_all", methods=["POST"])
@medevolve_api_part2.route("/part2_all", methods=["POST"])
@pilotcustomer_api_part2.route("/part2_all", methods=["POST"])
@betacustomer_api_part2.route("/part2_all", methods=["POST"])
def get_rebound_data_part2_all():
    """
    This endpoint fetches platform data part 2 with filtering options.
    ---
    tags:
      - Platform Data
    parameters:
      - in: body
        name: body
        description: JSON payload
        required: true
        schema:
          type: object
          properties:
            tabIndex:
              type: integer
              example: 0
            keyword:
              type: string
              example: ""
            selectedTags:
              type: array
              items:
                type: string
              example: ["Other Non-Specific", "Duplicate", "Medical Coding"]
            startDate:
              type: string
              format: date
              example: null
            endDate:
              type: string
              format: date
              example: null
            code:
              type: string
              example: ""
            remark:
              type: string
              example: ""
            procedure:
              type: string
              example: ""
            pos:
              type: string
              example: ""
            extra:
              type: object
              example: {}
    responses:
      200:
        description: Successful response
        schema:
          type: array
          items:
            type: object
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
        # Check if the content type is application/json
        if not request.is_json:
            return jsonify({"error": "Unsupported Media Type: Content-Type must be application/json"}), 415

        # Get database connection and cursor
        conn, cursor, db_name = get_connection(request)
        
        # Extract parameters from the request JSON
        tab_index = request.json.get("tabIndex")
        keyword = request.json.get("keyword")
        selectedTags = request.json.get("selectedTags")
        startDate = request.json.get("startDate")
        endDate = request.json.get("endDate")
        extra = merge_request_extra(request.json)
        code = request.json.get("code", "")
        remark = request.json.get("remark", "")
        procedure = request.json.get("procedure", "")
        pos = request.json.get("pos", "")
        
        # If no tags are selected, return an empty response
        if not selectedTags:
            return jsonify([]), 200

        patient_payment_expr = get_custom_all_patient_payment_expr(cursor, db_name)
        custom_all_columns = get_existing_columns(cursor, db_name, "CUSTOM_ALL")
        actions_columns = get_existing_columns(cursor, db_name, "actions")
        priority_helpers = build_priority_helpers(custom_all_columns, actions_columns, patient_payment_expr)
        base_from_sql = newGenerateSQL(
            tab_index,
            keyword,
            selectedTags,
            startDate,
            endDate,
            code,
            remark,
            procedure,
            pos,
            extra,
            "",
        )
        generatedSQL = build_part2_grouped_sql(base_from_sql, priority_helpers)
        
        cursor.execute(generatedSQL)
        ret = cursor.fetchall()
        logger.info(f"Called from: {request.blueprint}, Database: {db_name}")
        return jsonify(ret), 200
    except Exception as e:
        logger.error(f"[ERROR]: {e}")
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)
        _end = time.time()
        logger.info(f"/rebound_data_part2_all took {_end - _start:.2f} seconds")
