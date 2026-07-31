from flask import Blueprint, request, jsonify
from typing import Dict, List, Optional, Tuple
import time
import logging
from datetime import date
import os
from db import get_connection, close_connection
from core.schema_cache import get_table_columns, table_has_column
from core.gen_sql_platform.Generate_Platform_SQL import generate_sql as newGenerateSQL, merge_request_extra
from api.platform.launchpad.worklist_queue import (
    build_active_queue_financial_summary_sql,
    build_active_queue_where_sql,
    build_is_overdue_sql,
    build_part1_summary_sql,
    build_priority_order_sql,
)

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
    "Priority",
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


def get_custom_all_patient_payment_expr(
    cursor, db_name: str, table_alias: str = "CUSTOM_ALL"
) -> str:
    """Use PatientPayment when the column exists; otherwise fall back to 0."""
    try:
        if table_has_column(cursor, db_name, "CUSTOM_ALL", "PatientPayment"):
            return f"COALESCE({table_alias}.PatientPayment, 0)"
        return "0"
    except Exception as exc:
        logger.warning("Unable to inspect CUSTOM_ALL.PatientPayment: %s", exc)
        return "0"


def get_existing_columns(cursor, db_name: str, table_name: str) -> set:
    try:
        return get_table_columns(cursor, db_name, table_name)
    except Exception as exc:
        logger.warning("Unable to inspect columns for %s: %s", table_name, exc)
        return set()


def first_existing_column(columns: set, candidates: List[str]) -> Optional[str]:
    lowered = {column.lower(): column for column in columns}
    for candidate in candidates:
        match = lowered.get(candidate.lower())
        if match:
            return match
    return None


def build_priority_helpers(custom_all_columns: set, actions_columns: set, patient_payment_expr: str) -> Dict[str, str]:
    handoff_column = first_existing_column(
        custom_all_columns,
        [
            "HandoffFlag",
            "Handoff",
            "IsHandoff",
            "HandoffStatus",
            "AssignedTo",
            "AssignedUser",
            "ReviewUser",
            "SentTo",
        ],
    )
    tickle_column = first_existing_column(
        custom_all_columns,
        ["TickleDate", "TickleTime", "TickleAt", "FollowUpDate", "NextActionDate", "NextWorkDate"],
    )
    discharge_column = first_existing_column(
        custom_all_columns,
        ["DischargeDate", "Discharge_Date", "ClaimAgeByDischargeDate"],
    )

    actions_claim_no_column = first_existing_column(actions_columns, ["ClaimNo"])
    actions_status_column = first_existing_column(actions_columns, ["claim_status"])
    actions_action_column = first_existing_column(actions_columns, ["action"])

    if handoff_column:
        handoff_expr = f"""
            CASE
                WHEN CUSTOM_ALL.`{handoff_column}` IS NULL THEN 0
                WHEN LOWER(TRIM(CAST(CUSTOM_ALL.`{handoff_column}` AS CHAR))) IN ('1','true','yes','y','handoff','assigned','sent')
                    THEN 1
                WHEN TRIM(CAST(CUSTOM_ALL.`{handoff_column}` AS CHAR)) <> '' THEN 1
                ELSE 0
            END
        """
    elif actions_claim_no_column and (actions_status_column or actions_action_column):
        handoff_predicates = []
        if actions_status_column:
            handoff_predicates.append(f"LOWER(COALESCE(a_handoff.`{actions_status_column}`, '')) LIKE '%handoff%'")
        if actions_action_column:
            handoff_predicates.append(f"LOWER(COALESCE(a_handoff.`{actions_action_column}`, '')) LIKE '%handoff%'")
        handoff_predicate_sql = " OR ".join(handoff_predicates) or "1=0"
        handoff_expr = """
            CASE WHEN EXISTS (
                SELECT 1
                FROM actions a_handoff
                WHERE a_handoff.`{actions_claim_no_column}` = CUSTOM_ALL.ClaimNo
                  AND ({handoff_predicate_sql})
            ) THEN 1 ELSE 0 END
        """.format(
            actions_claim_no_column=actions_claim_no_column,
            handoff_predicate_sql=handoff_predicate_sql,
        )
    else:
        handoff_expr = "0"

    tickle_date_expr = (
        f"COALESCE(DATE(CUSTOM_ALL.`{tickle_column}`), STR_TO_DATE(CUSTOM_ALL.`{tickle_column}`, '%m/%d/%Y'), STR_TO_DATE(CUSTOM_ALL.`{tickle_column}`, '%Y-%m-%d'))"
        if tickle_column
        else "NULL"
    )
    discharge_date_expr = (
        f"COALESCE(DATE(CUSTOM_ALL.`{discharge_column}`), STR_TO_DATE(CUSTOM_ALL.`{discharge_column}`, '%m/%d/%Y'), STR_TO_DATE(CUSTOM_ALL.`{discharge_column}`, '%Y-%m-%d'))"
        if discharge_column
        else "DATE(CUSTOM_ALL.ServiceDate)"
    )
    balance_expr = (
        f"COALESCE(CUSTOM_ALL.Amount, 0) - COALESCE(CUSTOM_ALL.Adjustment45Amount, 0) "
        f"- COALESCE(CUSTOM_ALL.PaidAmt, 0) - {patient_payment_expr}"
    )

    return {
        "handoff": handoff_expr,
        "tickle_date": tickle_date_expr,
        "discharge_date": discharge_date_expr,
        "balance": balance_expr,
    }


def build_outer_order_sql(sort: str) -> str:
    priority_order = build_priority_order_sql()
    if not sort or sort == "Priority":
        return f"Priority ASC, {priority_order}"
    if sort == "Priority-":
        return f"Priority DESC, {priority_order}"
    direction = "DESC" if sort.endswith("-") else "ASC"
    column = sort[:-1] if sort.endswith("-") else sort
    if column == "BillProvName":
        column = "FacilityName"
    return f"`{column}` {direction}, Priority ASC, {priority_order}"


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
        startDate = request.json.get("startDate")
        endDate = request.json.get("endDate")
        extra = merge_request_extra(request.json)
        code = request.json.get("code", "")
        remark = request.json.get("remark", "")
        procedure = request.json.get("procedure", "")
        pos = request.json.get("pos", "")
        sort = map_sort_field(request.json.get("sort", ""))
        
        include_all_categories = extra.get("IncludeAllCategories") and tab_index == 0
        is_pend_flow = bool(extra.get("Pend277") or extra.get("Pend835"))
        if not include_all_categories and not selectedTags and not is_pend_flow:
            return jsonify({"maxPage": 0, "data": []}), 200

        delinquent_label = os.getenv('DELIQUENT', 'Delinquent').replace("'", "''")
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
            ""
        )

        active_queue_where = build_active_queue_where_sql()
        is_overdue_sql = build_is_overdue_sql(priority_helpers["tickle_date"])

        priority_order_sql = build_priority_order_sql()
        outer_order_sql = build_outer_order_sql(sort)
        base_sql = f"""select
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
            {patient_payment_expr} AS PatientPayment,
            {priority_helpers["balance"]} AS Balance,
            COALESCE(CUSTOM_ALL.BillProvName, '') AS FacilityName,
            COALESCE(NULLIF(TRIM(CUSTOM_ALL.Category), ''), '{delinquent_label}') AS Category,
            COALESCE(CUSTOM_ALL.PrimaryGroup, '') AS PrimaryGroup,
            COALESCE(CUSTOM_ALL.PrimaryCode, '') AS PrimaryCode,
            CUSTOM_ALL.PrimaryDX,
            CUSTOM_ALL.PrimaryProcedure,
            CUSTOM_ALL.Remark,
            CUSTOM_ALL.ActionDate,
            CUSTOM_ALL.ActionTaken,
            {priority_helpers["handoff"]} AS HandoffFlag,
            {priority_helpers["tickle_date"]} AS TickleDate,
            {is_overdue_sql} AS IsOverdue,
            {priority_helpers["discharge_date"]} AS DischargeDate,
            COALESCE(
                STR_TO_DATE(CUSTOM_ALL.ActionDate, '%m/%d/%Y'),
                STR_TO_DATE(CUSTOM_ALL.ActionDate, '%Y-%m-%d'),
                DATE(CUSTOM_ALL.ActionDate)
            ) AS ActionDateParsed
            {base_from_sql}"""
        data_sql = f"""
            WITH prioritized_claims AS (
                SELECT
                    base_claims.*,
                    ROW_NUMBER() OVER (
                        PARTITION BY base_claims.Category
                        ORDER BY {priority_order_sql}
                    ) AS Priority,
                    COUNT(*) OVER() AS total_count
                FROM (
                    {base_sql}
                ) base_claims
                {active_queue_where}
            )
            SELECT
                Priority,
                ClaimNo,
                ProvTaxID,
                ProvNPI,
                PayerName,
                PayerID,
                PayerSeq,
                LoadDate,
                ServiceDate,
                PlaceOfService,
                Amount,
                Adjustment45Amount,
                AllowedAmt,
                RecoveryAllowed,
                PaidAmt,
                PatientResp,
                PatientPayment,
                Balance,
                FacilityName,
                Category,
                PrimaryGroup,
                PrimaryCode,
                PrimaryDX,
                PrimaryProcedure,
                Remark,
                ActionDate,
                ActionTaken,
                HandoffFlag,
                TickleDate,
                IsOverdue,
                DischargeDate,
                total_count
            FROM prioritized_claims
            ORDER BY {outer_order_sql}
            LIMIT {perPage} OFFSET {(currentPage-1)*perPage}
        """

        cursor.execute(data_sql)
        results = cursor.fetchall()
        total_count = int(results[0].get("total_count") or 0) if results else 0
        maxPage = int((total_count - 1) / perPage) + 1 if total_count > 0 else 0
        for row in results:
            row.pop("total_count", None)
        
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
        extra = merge_request_extra(request.json)
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
        summary_sql = build_active_queue_financial_summary_sql(
            base_from_sql,
            priority_helpers,
            patient_payment_expr,
        )
        cursor.execute(summary_sql)
        totals = cursor.fetchone() or {}
        active_count = int(totals.get("Count") or 0)
        charges = float(totals.get("total_amount") or 0)
        allowed = float(totals.get("total_allowed") or 0)
        payer_paid = float(totals.get("total_payer_paid") or 0)
        patient_payment = float(totals.get("total_patient_payment") or 0)
        patient_resp = float(totals.get("total_patient_resp") or 0)
        adjustment45 = float(totals.get("total_adjustment45") or 0)
        balance = float(totals.get("total_balance") or 0)
        return jsonify(
            {
                "count": active_count,
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
