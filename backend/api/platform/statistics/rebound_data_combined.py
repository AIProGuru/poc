from flask import Blueprint, request, jsonify
import time
from db import get_connection, close_connection
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Blueprints for different APIs
rebound_api_combined = Blueprint('rebound_api_combined', __name__, url_prefix='/api/v1/rebound')
medevolve_api_combined = Blueprint('medevolve_api_combined', __name__, url_prefix='/api/v1/medevolve')

def newGenerateSQL(
    tab_index,
    keyword,
    selectedTags,
    startDate,
    endDate,
    code,
    remark,
    procedure,
    pos,
    extra={},
    sort = "",
):
    tags = ""
    flag = False
    filteredTags = []
    for item in selectedTags:
        if tab_index == 0:
            if item == os.getenv('DELIQUENT') or item == "Contractual Adj" or item == "Patient Resp":
                continue
            filteredTags.append(item)
        elif tab_index == 1:
            if item == "Contractual Adj":
                filteredTags.append(item)
        elif tab_index == 2:
            if item == "Patient Resp":
                filteredTags.append(item)
        elif tab_index == 3:
            if item == os.getenv('DELIQUENT'):
                filteredTags.append(item)
        elif tab_index == 6 or tab_index == 5:
            filteredTags.append(item)
    for tag in filteredTags:
        if tag != os.getenv('DELIQUENT'):
            tags += f"'{tag}',"
        else:
            flag = True
    tags = tags[: len(tags) - 1]
    group = ""
    if code != "":
        group = code[:2].upper()
        code = code[2:].upper()
    query = f"""
        from CUSTOM_ALL
        where CUSTOM_ALL.ClaimNo LIKE '{keyword}%' AND 
    """
    if tags == "":
        if flag == True:
            query += f"""
                CUSTOM_ALL.Category IS NULL
            """
        else:
            query += f"""
                CUSTOM_ALL.Category='A'
            """
    else:
        if flag == True:
            query += f"""
                (CUSTOM_ALL.Category IS NULL OR CUSTOM_ALL.Category IN ({tags}))
            """
        else:
            query += f"""
                CUSTOM_ALL.Category IN ({tags})
            """
    if pos != "":
        query += f"and CUSTOM_ALL.PlaceOfService='{pos}' "
    if remark != "":
        query += f"""
            AND EXISTS (
                SELECT 1
                FROM CUSTOM_PAID_SERVICE_REMARK
                WHERE CUSTOM_PAID_SERVICE_REMARK.RemarkCode='{remark}'
                    AND CUSTOM_ALL.id_835=CUSTOM_PAID_SERVICE_REMARK.id_835
                    AND CUSTOM_ALL.ID=CUSTOM_PAID_SERVICE_REMARK.id_837
            )
        """
    if procedure != "":
        query += f"""
            AND EXISTS (
                SELECT 1
                FROM Procedures
                WHERE ProcedureCode='{procedure}'
                    AND CUSTOM_ALL.ID=Procedures.ClaimID
            )
        """
    if "Recovery" in extra:
        query += f"AND CUSTOM_ALL.Recovery=1 "
    if "PayerResponsibility" in extra:
        query += f"and CUSTOM_ALL.PayerSeq='{extra['PayerResponsibility']}' "
    if "PayerName" in extra:
        query += f"AND ("
        payer_names = extra['PayerName'].split('*')
        for name in payer_names:
            if query[-1] == '(':
                query += f"CUSTOM_ALL.PayerName LIKE '%{name}%'"
            else:
                query += f" OR CUSTOM_ALL.PayerName LIKE '%{name}%'"
        query += ')'
    if "Only" in extra:
        query += f"""
            AND EXISTS (
                SELECT 1
                FROM denial_actions
                WHERE denial_actions.ClaimNo=CUSTOM_ALL.ClaimNo
            )
        """
    if "PayerNameAll" in extra:
        query += f"and CUSTOM_ALL.PayerName LIKE '%{extra['PayerNameAll']}%' "
    if "InsuranceType" in extra:
        query += f"and CUSTOM_ALL.InsuranceType='{extra['InsuranceType']}' "
    if code != "":
        query += f"""
            AND EXISTS (
                SELECT 1
                FROM CUSTOM_SERVICE_CODE_FOR_TABLE
                WHERE AdjustmentReason='{code}'
                    AND AdjustmentGroup='{group}'
                    AND CUSTOM_SERVICE_CODE_FOR_TABLE.id_837=CUSTOM_ALL.ID
            )
        """
    if startDate != None and endDate != None:
        query += f"AND CUSTOM_ALL.ServiceDate BETWEEN '{startDate}' AND '{endDate}' "
    elif startDate != None:
        query += f"AND CUSTOM_ALL.ServiceDate >= '{startDate}' "
    elif endDate != None:
        query += f"AND CUSTOM_ALL.ServiceDate <= '{endDate}' "
    if "All" not in extra or tab_index != 5:
        if tab_index != 6:
            if tab_index == 5:
                query += f"AND CUSTOM_ALL.Automation!=0"
            else:
                query += f"AND CUSTOM_ALL.Automation=0"
    if sort != "":
        if sort[-1] == '-':
            query += f" ORDER BY CUSTOM_ALL.{sort[:-1]} DESC"
        else:
            query += f" ORDER BY CUSTOM_ALL.{sort}"
    return query



@rebound_api_combined.route("/stats_part1_combined", methods=["GET"])
@medevolve_api_combined.route("/stats_part1_combined", methods=["GET"])
def get_rebound_data_combined():
    """
    This endpoint fetches combined statistics data for different categories.
    ---
    tags:
      - Statistics
    responses:
      200:
        description: Successful response
        schema:
          type: object
          properties:
            results:
              type: object
              properties:
                Recoverable:
                  type: object
                  properties:
                    Count:
                      type: integer
                    Charge:
                      type: number
                    AllowedAmt:
                      type: number
                    DeniedAmt:
                      type: number
                    Days:
                      type: number
                AI_automation:
                  type: object
                  properties:
                    Count:
                      type: integer
                    Charge:
                      type: number
                    AllowedAmt:
                      type: number
                    DeniedAmt:
                      type: number
                    Days:
                      type: number
                Non_recoverable:
                  type: object
                  properties:
                    Count:
                      type: integer
                    Charge:
                      type: number
                    AllowedAmt:
                      type: number
                    DeniedAmt:
                      type: number
                    Days:
                      type: number
                Patient_responsibility:
                  type: object
                  properties:
                    Count:
                      type: integer
                    Charge:
                      type: number
                    AllowedAmt:
                      type: number
                    DeniedAmt:
                      type: number
                    Days:
                      type: number
                Delinquent:
                  type: object
                  properties:
                    Count:
                      type: integer
                    Charge:
                      type: number
                    AllowedAmt:
                      type: number
                    DeniedAmt:
                      type: number
                    Days:
                      type: number
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
        conn, cursor,db_name = get_connection(request.base_url)
        categorized_results = {
            "Recoverable": {},
            "AI_automation": {},
            "Non_recoverable": {},
            "Patient_responsibility": {},
            "Delinquent": {}
        }

        payloads = [
            {
                "category": "Recoverable",
                "tabIndex": 0,
                "keyword": "",
                "selectedTags": [
                    "Other Non-Specific", "Duplicate", "Medical Coding", "Timely Filing",
                    "Coordination of Benefits", "Documentation", "Authorization", "Missing",
                    "Non-Covered", "Eligibility", "Provider", "Medical Necessity", "Billing",
                    "Level of Care"
                ],
                "startDate": None,
                "endDate": None,
                "code": "",
                "remark": "",
                "procedure": "",
                "pos": "",
                "extra": {}
            },
            {
                "category": "AI_automation",
                "tabIndex": 5,
                "keyword": "",
                "selectedTags": [
                    "Contractual Adj", "Other Non-Specific", "Duplicate", "Patient Resp",
                    "Medical Coding", "Timely Filing", "Coordination of Benefits", "Documentation",
                    "Authorization", "Missing", "Non-Covered", "Eligibility", "Provider",
                    "Medical Necessity", "Billing", "Level of Care"
                ],
                "startDate": None,
                "endDate": None,
                "code": "",
                "remark": "",
                "procedure": "",
                "pos": "",
                "extra": {}
            },
            {
                "category": "Non_recoverable",
                "tabIndex": 1,
                "keyword": "",
                "selectedTags": ["Contractual Adj"],
                "startDate": None,
                "endDate": None,
                "code": "",
                "remark": "",
                "procedure": "",
                "pos": "",
                "extra": {}
            },
            {
                "category": "Patient_responsibility",
                "tabIndex": 2,
                "keyword": "",
                "selectedTags": ["Patient Resp"],
                "startDate": None,
                "endDate": None,
                "code": "",
                "remark": "",
                "procedure": "",
                "pos": "",
                "extra": {}
            },
            {
                "category": "Delinquent",
                "tabIndex": 3,
                "keyword": "",
                "selectedTags": ["Missing"],
                "startDate": None,
                "endDate": None,
                "code": "",
                "remark": "",
                "procedure": "",
                "pos": "",
                "extra": {}
            }
        ]

        for payload in payloads:
            category = payload["category"]
            tab_index = payload["tabIndex"]
            keyword = payload["keyword"]
            selectedTags = payload["selectedTags"]
            startDate = payload["startDate"]
            endDate = payload["endDate"]
            code = payload["code"]
            remark = payload["remark"]
            procedure = payload["procedure"]
            pos = payload["pos"]
            extra = payload["extra"]

            generatedSQL = f"""select
                count(CUSTOM_ALL.ID) AS Count,
                SUM(CUSTOM_ALL.Amount) AS Charge,
                SUM(CUSTOM_ALL.AllowedAmt) AS AllowedAmt,
                SUM(CUSTOM_ALL.DeniedAmt) AS DeniedAmt,
                AVG(datediff(current_date(), CUSTOM_ALL.ServiceDate)) Days
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
            cursor.execute(generatedSQL)
            result = cursor.fetchone()
            categorized_results[category] = result

        return {"results": categorized_results}, 200

    except Exception as e:
        logger.error(f"[ERROR]: {e}")
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)
        _end = time.time()
        logger.info(f"/stats_part1_combined {_end - _start}")