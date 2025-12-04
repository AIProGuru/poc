from flask import Blueprint, request, jsonify
from db import get_connection, close_connection
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Blueprints for different APIs
rebound_api_resubmitted = Blueprint('rebound_api_resubmitted', __name__, url_prefix='/api/v1/rebound')
medevolve_api_resubmitted = Blueprint('medevolve_api_resubmitted', __name__, url_prefix='/api/v1/medevolve')

@rebound_api_resubmitted.route("/resubmitted_claims", methods=["GET"])
@medevolve_api_resubmitted.route("/resubmitted_claims", methods=["GET"])
def get_resubmitted_claims():
    """
    This endpoint fetches resubmitted claims data.
    ---
    tags:
      - Statistics
    parameters:
      - in: query
        name: currentPage
        type: integer
        required: false
        default: 1
        description: The current page number for pagination
      - in: query
        name: perPage
        type: integer
        required: false
        default: 10
        description: The number of items per page for pagination
      - in: query
        name: total
        type: boolean
        required: false
        default: false
        description: Whether to fetch all resubmitted claims without pagination
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
                properties:
                  ClaimNo:
                    type: string
                  ProvTaxID:
                    type: string
                  ProvNPI:
                    type: string
                  PayerName:
                    type: string
                  PayerID:
                    type: string
                  PayerSeq:
                    type: string
                  LoadDate:
                    type: string
                  ServiceDate:
                    type: string
                  PlaceOfService:
                    type: string
                  Amount:
                    type: number
                  AllowedAmt:
                    type: number
                  Category:
                    type: string
                  PrimaryGroup:
                    type: string
                  PrimaryCode:
                    type: string
                  PrimaryDX:
                    type: string
                  PrimaryProcedure:
                    type: string
                  Remark:
                    type: string
                  claim_status:
                    type: string
                  action_date:
                    type: string
                  PaidAmount:
                    type: number
                  ProcessingStatus:
                    type: string
                  ApprovalStatus:
                    type: string
      500:
        description: Internal server error
        schema:
          type: object
          properties:
            error:
              type: string
    """
    conn = None
    cursor = None
    try:
        conn, cursor, db_name = get_connection(request.base_url)
        
        # Get pagination parameters
        currentPage = int(request.args.get("currentPage", 1))
        perPage = int(request.args.get("perPage", 10))
        total = request.args.get("total", "false").lower() == "true"
        
        if total:
            # SQL query to fetch all resubmitted claim details
            query = """
WITH LatestActions AS (
    SELECT
        ClaimNo,
        MAX(action_date) AS latest_action_date
    FROM actions
    WHERE claim_status = 'resubmit'
    GROUP BY ClaimNo
),
FilteredPaid AS (
    SELECT
        matching_837_835.ClaimNo,
        CUSTOM_PAID.CheckDate,
        CUSTOM_PAID.ProcessingStatus,
        CUSTOM_PAID.PaidAmount,
        ROW_NUMBER() OVER (PARTITION BY matching_837_835.ClaimNo ORDER BY CUSTOM_PAID.CheckDate DESC) AS rn
    FROM CUSTOM_PAID
    LEFT JOIN matching_837_835 ON matching_837_835.id_835 = CUSTOM_PAID.ID
    WHERE CUSTOM_PAID.ProcessingStatus != '22'
),
UniqueServiceCodes AS (
    SELECT
        id_835,
        MAX(CASE WHEN AdjustmentReason = '1' THEN 1 ELSE 0 END) AS HasAdjustmentReason1
    FROM CUSTOM_SERVICE_CODE_FOR_TABLE
    GROUP BY id_835
)
SELECT
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
    CUSTOM_ALL.AllowedAmt,
    CUSTOM_ALL.Category,
    CUSTOM_ALL.PrimaryGroup,
    CUSTOM_ALL.PrimaryCode,
    CUSTOM_ALL.PrimaryDX,
    CUSTOM_ALL.PrimaryProcedure,
    CUSTOM_ALL.Remark,
    actions.claim_status,
    actions.action_date,
    adjustment.PaidAmount,
    adjustment.ProcessingStatus,
    CASE
        WHEN STR_TO_DATE(adjustment.CheckDate, '%Y-%m-%d') < STR_TO_DATE(actions.action_date, '%m/%d/%Y') THEN 'Pending'
        WHEN CUSTOM_ALL.AllowedAmt > 0 OR CUSTOM_ALL.PaidAmt > 0 THEN 'Approved'
        WHEN CUSTOM_ALL.AllowedAmt > 0 AND CUSTOM_ALL.PaidAmt = 0 AND UniqueServiceCodes.HasAdjustmentReason1 = 1 THEN 'Approved'
        ELSE 'Denied'
    END AS ApprovalStatus
FROM CUSTOM_ALL
LEFT JOIN LatestActions ON LatestActions.ClaimNo = CUSTOM_ALL.ClaimNo
LEFT JOIN actions ON actions.ClaimNo = CUSTOM_ALL.ClaimNo AND actions.action_date = LatestActions.latest_action_date
LEFT JOIN FilteredPaid adjustment ON adjustment.ClaimNo = CUSTOM_ALL.ClaimNo AND adjustment.rn = 1
LEFT JOIN UniqueServiceCodes ON UniqueServiceCodes.id_835 = CUSTOM_ALL.id_835
WHERE actions.claim_status = 'resubmit'
ORDER BY adjustment.CheckDate DESC

            """
            
            cursor.execute(query)
            results = cursor.fetchall()
            
            return {
                "data": results
            }, 200
        else:
            # SQL query to count total resubmitted claims
            count_query = """
            SELECT COUNT(*) AS cnt
            FROM CUSTOM_ALL
            LEFT JOIN actions ON actions.ClaimNo = CUSTOM_ALL.ClaimNo
            WHERE actions.claim_status = 'resubmit'
            """
            
            cursor.execute(count_query)
            result = cursor.fetchone()
            total_count = result["cnt"]
            maxPage = (total_count - 1) // perPage + 1
            
            # SQL query to fetch resubmitted claim details with pagination
            query = f"""
WITH LatestActions AS (
    SELECT
        ClaimNo,
        MAX(action_date) AS latest_action_date
    FROM actions
    WHERE claim_status = 'resubmit'
    GROUP BY ClaimNo
),
FilteredPaid AS (
    SELECT
        matching_837_835.ClaimNo,
        CUSTOM_PAID.CheckDate,
        CUSTOM_PAID.ProcessingStatus,
        CUSTOM_PAID.PaidAmount,
        ROW_NUMBER() OVER (PARTITION BY matching_837_835.ClaimNo ORDER BY CUSTOM_PAID.CheckDate DESC) AS rn
    FROM CUSTOM_PAID
    LEFT JOIN matching_837_835 ON matching_837_835.id_835 = CUSTOM_PAID.ID
    WHERE CUSTOM_PAID.ProcessingStatus != '22'
),
UniqueServiceCodes AS (
    SELECT
        id_835,
        MAX(CASE WHEN AdjustmentReason = '1' THEN 1 ELSE 0 END) AS HasAdjustmentReason1
    FROM CUSTOM_SERVICE_CODE_FOR_TABLE
    GROUP BY id_835
)
SELECT
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
    CUSTOM_ALL.AllowedAmt,
    CUSTOM_ALL.Category,
    CUSTOM_ALL.PrimaryGroup,
    CUSTOM_ALL.PrimaryCode,
    CUSTOM_ALL.PrimaryDX,
    CUSTOM_ALL.PrimaryProcedure,
    CUSTOM_ALL.Remark,
    actions.claim_status,
    actions.action_date,
    adjustment.PaidAmount,
    adjustment.ProcessingStatus,
    CASE
        WHEN STR_TO_DATE(adjustment.CheckDate, '%Y-%m-%d') < STR_TO_DATE(actions.action_date, '%m/%d/%Y') THEN 'Pending'
        WHEN CUSTOM_ALL.AllowedAmt > 0 OR CUSTOM_ALL.PaidAmt > 0 THEN 'Approved'
        WHEN CUSTOM_ALL.AllowedAmt > 0 AND CUSTOM_ALL.PaidAmt = 0 AND UniqueServiceCodes.HasAdjustmentReason1 = 1 THEN 'Approved'
        ELSE 'Denied'
    END AS ApprovalStatus
FROM CUSTOM_ALL
LEFT JOIN LatestActions ON LatestActions.ClaimNo = CUSTOM_ALL.ClaimNo
LEFT JOIN actions ON actions.ClaimNo = CUSTOM_ALL.ClaimNo AND actions.action_date = LatestActions.latest_action_date
LEFT JOIN FilteredPaid adjustment ON adjustment.ClaimNo = CUSTOM_ALL.ClaimNo AND adjustment.rn = 1
LEFT JOIN UniqueServiceCodes ON UniqueServiceCodes.id_835 = CUSTOM_ALL.id_835
WHERE actions.claim_status = 'resubmit'
ORDER BY adjustment.CheckDate DESC
            LIMIT {perPage} OFFSET {(currentPage - 1) * perPage}
            """
            
            cursor.execute(query)
            results = cursor.fetchall()
            
            return {
                "maxPage": maxPage,
                "data": results
            }, 200
    except Exception as e:
        print(f"[ERROR]: {e}")
        return {"error": "Internal server Error"}, 500
    finally:
        close_connection(cursor, conn)
