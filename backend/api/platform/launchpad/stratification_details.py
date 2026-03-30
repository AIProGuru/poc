from flask import Blueprint, request, jsonify
from typing import Dict, List, Optional, Tuple
import time
import logging
from datetime import date
import os
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

pilotcustomer_api_stratification = Blueprint('pilotcustomer_api_stratification', __name__, url_prefix='/api/v1/pilotcustomer')
pilotcustomer_api_stratification.api_name = 'pilotcustomer_api_stratification'

betacustomer_api_stratification = Blueprint('betacustomer_api_stratification', __name__, url_prefix='/api/v1/betacustomer')
betacustomer_api_stratification.api_name = 'betacustomer_api_stratification'

ALLOWED_SORT_COLUMNS = {
    "ClaimNo",
    "ProvTaxID",
    "ProvNPI",
    "PayerName",
    "PayerID",
    "PayerSeq",
    "LoadDate",
    "ServiceDate",
    "PlaceOfService",
    "Amount",
    "AllowedAmt",
    "PaidAmt",
    "PatientResp",
    "Category",
    "PrimaryGroup",
    "PrimaryCode",
    "PrimaryDX",
    "PrimaryProcedure",
    "Remark",
    "ActionDate",
    "ActionTaken",
    # facility mapping
    "BillProvName",
}


def map_sort_field(sort: str) -> str:
    """Map UI sort keys to database columns and guard against invalid fields."""
    if not sort:
        return sort
    target = sort[:-1] if sort.endswith("-") else sort
    suffix = "-" if sort.endswith("-") else ""
    if target.lower() == "facility":
        target = "BillProvName"
    if target not in ALLOWED_SORT_COLUMNS:
        return "ClaimNo"
    return f"{target}{suffix}"


# Define the endpoint for fetching rebound data
@rebound_api_stratification.route("/data_all", methods=["POST"])
@medevolve_api_stratification.route("/data_all", methods=["POST"])
@pilotcustomer_api_stratification.route("/data_all", methods=["POST"])
@betacustomer_api_stratification.route("/data_all", methods=["POST"])
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
        conn, cursor, db_name = get_connection(request)
        
        # Extract parameters from the request JSON
        tab_index = request.json.get("tabIndex")
        currentPage = request.json.get("currentPage")
        perPage = request.json.get("perPage")
        keyword = request.json.get("keyword")
        selectedTags = request.json.get("selectedTags") or []
        print(selectedTags)
        startDate = request.json.get("startDate")
        endDate = request.json.get("endDate")
        extra = request.json.get("extra", {})
        code = request.json.get("code", "")
        remark = request.json.get("remark", "")
        procedure = request.json.get("procedure", "")
        pos = request.json.get("pos", "")
        sort = map_sort_field(request.json.get("sort", ""))
        
        include_all_categories = extra.get("IncludeAllCategories") and tab_index == 0
        is_pend_flow = bool(extra.get("Pend277") or extra.get("Pend835"))
        if not include_all_categories and not selectedTags and not is_pend_flow:
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
        print("aaaaaaaaaaaaaaaaaaaaaaa", count_sql)
        print("bbbbbbbbbbbbbbbbbbbbbbb", result['cnt'])
        # Generate SQL query to fetch the data with pagination
        delinquent_label = os.getenv('DELIQUENT', 'Delinquent').replace("'", "''")
        data_sql = f"""select
            CUSTOM_ALL.ClaimNo,
            CUSTOM_ALL.ProvTaxID,
            CUSTOM_ALL.ProvNPI,
            CUSTOM_ALL.PayerName,
            CUSTOM_ALL.PayerID,
            CUSTOM_ALL.PayerSeq,
            CUSTOM_ALL.LoadDate,
            CUSTOM_ALL.ServiceDate,
            CUSTOM_ALL.PlaceOfService,
            CUSTOM_ALL.Amount,
            CUSTOM_ALL.Adjustment45Amount,
            CUSTOM_ALL.AllowedAmt,
            CUSTOM_ALL.RecoveryAllowed,
            CUSTOM_ALL.PaidAmt,
            CUSTOM_ALL.PatientResp,
            0 AS PatientPayment,
            COALESCE(CUSTOM_ALL.Amount, 0) - COALESCE(CUSTOM_ALL.Adjustment45Amount, 0) - COALESCE(CUSTOM_ALL.PaidAmt, 0) AS Balance,
            COALESCE(CUSTOM_ALL.BillProvName, '') AS FacilityName,
            COALESCE(NULLIF(TRIM(CUSTOM_ALL.Category), ''), '{delinquent_label}') AS Category,
            COALESCE(CUSTOM_ALL.PrimaryGroup, '') AS PrimaryGroup,
            COALESCE(CUSTOM_ALL.PrimaryCode, '') AS PrimaryCode,
            CUSTOM_ALL.PrimaryDX, CUSTOM_ALL.PrimaryProcedure, CUSTOM_ALL.Remark, CUSTOM_ALL.ActionDate, CUSTOM_ALL.ActionTaken
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

        print("ccccccccccccccccccccc", data_sql)
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


@rebound_api_stratification.route("/data_summary", methods=["POST"])
@medevolve_api_stratification.route("/data_summary", methods=["POST"])
@pilotcustomer_api_stratification.route("/data_summary", methods=["POST"])
@betacustomer_api_stratification.route("/data_summary", methods=["POST"])
def get_rebound_data_summary():
    """
    This endpoint returns aggregate totals for the current filter set.
    ---
    tags:
      - Platform Data
    """
    _start = time.time()
    conn = None
    cursor = None
    try:
        if os.getenv("LOG_SUMMARY_REQUESTS", "0") == "1":
            logger.info(
                "data_summary request: ip=%s ua=%s payload=%s",
                request.remote_addr,
                request.headers.get("User-Agent", ""),
                request.get_json(silent=True),
            )
        conn, cursor, db_name = get_connection(request)
        tab_index = request.json.get("tabIndex")
        keyword = request.json.get("keyword")
        selectedTags = request.json.get("selectedTags") or []
        startDate = request.json.get("startDate")
        endDate = request.json.get("endDate")
        extra = request.json.get("extra", {})
        code = request.json.get("code", "")
        remark = request.json.get("remark", "")
        procedure = request.json.get("procedure", "")
        pos = request.json.get("pos", "")

        include_all_categories = extra.get("IncludeAllCategories") and tab_index == 0
        is_pend_flow = bool(extra.get("Pend277") or extra.get("Pend835"))
        if not include_all_categories and not selectedTags and not is_pend_flow:
            return jsonify(
                {
                    "count": 0,
                    "charges": 0,
                    "allowed": 0,
                    "payerPayments": 0,
                    "patientPayment": 0,
                    "patientResp": 0,
                    "adjustment45": 0,
                    "balance": 0,
                }
            ), 200

        summary_sql = f"""select
            count(ID) AS cnt,
            COALESCE(sum(CUSTOM_ALL.Amount), 0) AS total_amount,
            COALESCE(sum(CUSTOM_ALL.AllowedAmt), 0) AS total_allowed,
            COALESCE(sum(CUSTOM_ALL.PaidAmt), 0) AS total_payer_paid,
            0 AS total_patient_payment,
            COALESCE(sum(CUSTOM_ALL.PatientResp), 0) AS total_patient_resp,
            COALESCE(sum(CUSTOM_ALL.Adjustment45Amount), 0) AS total_adjustment45
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
        cursor.execute(summary_sql)
        result = cursor.fetchone() or {}
        charges = result.get("total_amount") or 0
        allowed = result.get("total_allowed") or 0
        payer_paid = result.get("total_payer_paid") or 0
        patient_payment = result.get("total_patient_payment") or 0
        patient_resp = result.get("total_patient_resp") or 0
        adjustment45 = result.get("total_adjustment45") or 0
        charges = float(charges or 0)
        allowed = float(allowed or 0)
        payer_paid = float(payer_paid or 0)
        patient_payment = float(patient_payment or 0)
        patient_resp = float(patient_resp or 0)
        adjustment45 = float(adjustment45 or 0)
        balance = float(charges) - float(adjustment45) - float(payer_paid) - float(patient_payment)
        return jsonify(
            {
                "count": result.get("cnt") or 0,
                "charges": float(charges),
                "allowed": float(allowed),
                "payerPayments": float(payer_paid),
                "patientPayment": float(patient_payment),
                "patientResp": float(patient_resp),
                "adjustment45": float(adjustment45),
                "balance": float(balance),
            }
        ), 200
    except Exception as e:
        logger.error(f"[ERROR]: {e}")
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)
        _end = time.time()
        logger.info(f"/rebound_data_summary took {_end - _start:.2f} seconds")
