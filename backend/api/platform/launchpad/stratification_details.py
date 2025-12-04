from flask import Blueprint, request, jsonify
from typing import Dict, List, Optional, Tuple
import time
import logging
from datetime import date
from db import get_connection, close_connection
from core.gen_sql_platform.Generate_Platform_SQL import generate_sql as newGenerateSQL

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Blueprints for different APIs
rebound_api_stratification = Blueprint('rebound_api_stratification', __name__, url_prefix='/api/v1/rebound')
rebound_api_stratification.api_name = 'rebound_api_stratification'

medevolve_api_stratification = Blueprint('medevolve_api_stratification', __name__, url_prefix='/api/v1/medevolve')
medevolve_api_stratification.api_name = 'medevolve_api_stratification'

# Define the endpoint for fetching rebound data
@rebound_api_stratification.route("/data_all", methods=["POST"])
@medevolve_api_stratification.route("/data_all", methods=["POST"])
def get_rebound_data_all():
    """
    This endpoint fetches platform data with pagination and filtering options.
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
            currentPage:
              type: integer
              example: 1
            perPage:
              type: integer
              example: 50
            selectedTags:
              type: array
              items:
                type: string
              example: ["Other Non-Specific", "Duplicate", "Medical Coding"]
            keyword:
              type: string
              example: ""
            tabIndex:
              type: integer
              example: 0
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
            sort:
              type: string
              example: "ClaimNo"
    responses:
      200:
        description: Successful response
        schema:
          type: object
          properties:
            maxPage:
              type: integer
            data:
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
    _start = time.time()  # Start time for performance logging
    conn = None
    cursor = None
    try:
        # Get database connection and cursor
        conn, cursor, db_name = get_connection(request.base_url)
        
        # Extract parameters from the request JSON
        tab_index = request.json.get("tabIndex")
        currentPage = request.json.get("currentPage")
        perPage = request.json.get("perPage")
        keyword = request.json.get("keyword")
        selectedTags = request.json.get("selectedTags")
        startDate = request.json.get("startDate")
        endDate = request.json.get("endDate")
        extra = request.json.get("extra", {})
        code = request.json.get("code", "")
        remark = request.json.get("remark", "")
        procedure = request.json.get("procedure", "")
        pos = request.json.get("pos", "")
        sort = request.json.get("sort", "")
        
        # If no tags are selected, return an empty response
        if not selectedTags:
            return jsonify({"maxPage": 0, "data": []}), 200
        
        # Generate SQL query to count the total number of records
        count_sql = f"""select
            count(ID) AS cnt
            {newGenerateSQL(
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
                ""
            )}"""
        
        cursor.execute(count_sql)
        result = cursor.fetchone()
        maxPage = int((result["cnt"] - 1) / perPage) + 1
        
        # Generate SQL query to fetch the data with pagination
        data_sql = f"""select
            CUSTOM_ALL.ClaimNo, CUSTOM_ALL.ProvTaxID, CUSTOM_ALL.ProvNPI,
            CUSTOM_ALL.PayerName, CUSTOM_ALL.PayerID, CUSTOM_ALL.PayerSeq, CUSTOM_ALL.LoadDate,
            CUSTOM_ALL.ServiceDate, CUSTOM_ALL.PlaceOfService, CUSTOM_ALL.Amount,
            CUSTOM_ALL.AllowedAmt, CUSTOM_ALL.Category, CUSTOM_ALL.PrimaryGroup,
            CUSTOM_ALL.PrimaryCode, CUSTOM_ALL.PrimaryDX, CUSTOM_ALL.PrimaryProcedure, CUSTOM_ALL.Remark, CUSTOM_ALL.ActionDate, CUSTOM_ALL.ActionTaken
            {newGenerateSQL(
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
                sort
            )} LIMIT {perPage} OFFSET {(currentPage-1)*perPage}"""
        
        cursor.execute(data_sql)
        results = cursor.fetchall()
        
        # Log the API call details
        logger.info(f"Called from: {request.blueprint}, Database: {db_name}")
        
        # Return the response with the data and max page count
        return jsonify({"maxPage": maxPage, "data": results}), 200
    except Exception as e:
        # Log the error and return an internal server error response
        logger.error(f"[ERROR]: {e}")
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        # Close the database connection and log the time taken for the request
        close_connection(cursor, conn)
        _end = time.time()
        logger.info(f"/rebound_data_all took {_end - _start:.2f} seconds")