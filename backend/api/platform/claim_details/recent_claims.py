import logging
import os

from flask import Blueprint, jsonify, request

from api.platform.launchpad.stratification_details import (
    get_custom_all_patient_payment_expr,
)
from db import close_connection, get_connection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

rebound_api_recent_claims = Blueprint(
    "rebound_api_recent_claims", __name__, url_prefix="/api/v1/rebound"
)
medevolve_api_recent_claims = Blueprint(
    "medevolve_api_recent_claims", __name__, url_prefix="/api/v1/medevolve"
)
pilotcustomer_api_recent_claims = Blueprint(
    "pilotcustomer_api_recent_claims", __name__, url_prefix="/api/v1/pilotcustomer"
)
betacustomer_api_recent_claims = Blueprint(
    "betacustomer_api_recent_claims", __name__, url_prefix="/api/v1/betacustomer"
)

RECENT_CLAIMS_QUERY = """
WITH LatestTriage AS (
    SELECT
        a.ClaimNo,
        MAX(a.id) AS latest_action_id
    FROM actions a
    WHERE LOWER(TRIM(COALESCE(a.claim_status, ''))) = 'triage'
      AND (%s = '' OR a.user = %s)
    GROUP BY a.ClaimNo
)
SELECT
    c.ClaimNo,
    c.ProvTaxID,
    c.ProvNPI,
    c.PayerName,
    c.PayerID,
    c.PayerSeq,
    c.LoadDate,
    c.ServiceDate,
    c.PlaceOfService,
    c.Amount,
    c.AllowedAmt,
    c.PaidAmt,
    c.PatientResp,
    {patient_payment_expr} AS PatientPayment,
    c.Balance,
    COALESCE(c.BillProvName, '') AS FacilityName,
    COALESCE(c.BillProvName, '') AS BillProvName,
    COALESCE(c.PatientName, '') AS PatientName,
    COALESCE(NULLIF(TRIM(c.Category), ''), '{delinquent_label}') AS Category,
    COALESCE(c.PrimaryGroup, '') AS PrimaryGroup,
    COALESCE(c.PrimaryCode, '') AS PrimaryCode,
    c.PrimaryDX,
    c.PrimaryProcedure,
    c.Remark,
    c.ActionDate,
    c.ActionTaken,
    c.TickleDate,
    a.action_date AS TriageActionDate,
    a.notes AS TriageNotes,
    a.user AS TriageUser,
    a.action AS TriageAction
FROM LatestTriage lt
INNER JOIN actions a ON a.id = lt.latest_action_id
INNER JOIN CUSTOM_ALL c ON c.ClaimNo = lt.ClaimNo
WHERE LOWER(TRIM(COALESCE(c.ActionTaken, ''))) = 'triage'
  AND c.TickleDate IS NOT NULL
  AND CURRENT_DATE() < DATE(c.TickleDate)
ORDER BY a.id DESC
"""

RECENT_CLAIMS_COUNT_QUERY = """
WITH LatestTriage AS (
    SELECT
        a.ClaimNo,
        MAX(a.id) AS latest_action_id
    FROM actions a
    WHERE LOWER(TRIM(COALESCE(a.claim_status, ''))) = 'triage'
      AND (%s = '' OR a.user = %s)
    GROUP BY a.ClaimNo
)
SELECT COUNT(*) AS cnt
FROM LatestTriage lt
INNER JOIN actions a ON a.id = lt.latest_action_id
INNER JOIN CUSTOM_ALL c ON c.ClaimNo = lt.ClaimNo
WHERE LOWER(TRIM(COALESCE(c.ActionTaken, ''))) = 'triage'
  AND c.TickleDate IS NOT NULL
  AND CURRENT_DATE() < DATE(c.TickleDate)
"""

RECENT_CLAIMS_SUMMARY_QUERY = """
WITH LatestTriage AS (
    SELECT
        a.ClaimNo,
        MAX(a.id) AS latest_action_id
    FROM actions a
    WHERE LOWER(TRIM(COALESCE(a.claim_status, ''))) = 'triage'
      AND (%s = '' OR a.user = %s)
    GROUP BY a.ClaimNo
)
SELECT
    COUNT(*) AS count,
    COALESCE(SUM(c.Amount), 0) AS charges,
    COALESCE(SUM(c.AllowedAmt), 0) AS allowed,
    COALESCE(SUM(c.PaidAmt), 0) AS payerPayments,
    COALESCE(SUM({patient_payment_expr}), 0) AS patientPayment,
    COALESCE(SUM(c.PatientResp), 0) AS patientResp,
    COALESCE(SUM(c.Balance), 0) AS balance
FROM LatestTriage lt
INNER JOIN actions a ON a.id = lt.latest_action_id
INNER JOIN CUSTOM_ALL c ON c.ClaimNo = lt.ClaimNo
WHERE LOWER(TRIM(COALESCE(c.ActionTaken, ''))) = 'triage'
  AND c.TickleDate IS NOT NULL
  AND CURRENT_DATE() < DATE(c.TickleDate)
"""


def _fetch_recent_claims(cursor, db_name, username, current_page, per_page):
    delinquent_label = (os.getenv("DELIQUENT") or "Delinquent").replace("'", "''")
    patient_payment_expr = get_custom_all_patient_payment_expr(cursor, db_name, table_alias="c")
    user_filter = (username or "").strip()

    cursor.execute(RECENT_CLAIMS_COUNT_QUERY, (user_filter, user_filter))
    total_count = int((cursor.fetchone() or {}).get("cnt") or 0)
    max_page = (total_count - 1) // per_page + 1 if total_count > 0 else 0
    offset = (current_page - 1) * per_page

    summary_query = RECENT_CLAIMS_SUMMARY_QUERY.format(
        patient_payment_expr=patient_payment_expr,
    )
    cursor.execute(summary_query, (user_filter, user_filter))
    summary_row = cursor.fetchone() or {}
    summary = {
        "count": int(summary_row.get("count") or 0),
        "charges": float(summary_row.get("charges") or 0),
        "allowed": float(summary_row.get("allowed") or 0),
        "payerPayments": float(summary_row.get("payerPayments") or 0),
        "patientPayment": float(summary_row.get("patientPayment") or 0),
        "patientResp": float(summary_row.get("patientResp") or 0),
        "adjustment45": 0,
        "balance": float(summary_row.get("balance") or 0),
    }

    query = RECENT_CLAIMS_QUERY.format(
        patient_payment_expr=patient_payment_expr,
        delinquent_label=delinquent_label,
    ) + f"\nLIMIT {int(per_page)} OFFSET {int(offset)}"
    cursor.execute(query, (user_filter, user_filter))
    rows = cursor.fetchall() or []

    return max_page, rows, summary


@rebound_api_recent_claims.route("/recent_claims", methods=["GET"])
@medevolve_api_recent_claims.route("/recent_claims", methods=["GET"])
@pilotcustomer_api_recent_claims.route("/recent_claims", methods=["GET"])
@betacustomer_api_recent_claims.route("/recent_claims", methods=["GET"])
def get_recent_claims():
    conn = None
    cursor = None
    try:
        conn, cursor, db_name = get_connection(request)
        current_page = max(int(request.args.get("currentPage", 1)), 1)
        per_page = max(int(request.args.get("perPage", 50)), 1)
        username = (request.args.get("username") or "").strip()

        max_page, rows, summary = _fetch_recent_claims(
            cursor, db_name, username, current_page, per_page
        )
        return jsonify({"maxPage": max_page, "data": rows, "summary": summary}), 200
    except Exception as exc:
        logger.error("[RECENT CLAIMS ERROR]: %s", exc)
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)
