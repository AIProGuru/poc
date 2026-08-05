from flask import Blueprint, request, jsonify
from typing import Any, Dict, List, Optional, Tuple
import json
import re
import time
import logging
from datetime import date, datetime
from db import get_connection, close_connection
from core.schema_cache import get_table_columns, table_has_column
from api.platform.claim_details.appeal_documents import fetch_supporting_documents
from api.platform.claim_details.triage_actions_service import fetch_triage_actions_for_category

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Blueprints for different APIs
rebound_api_get_claim = Blueprint('rebound_api_get_claim', __name__, url_prefix='/api/v1/rebound')
rebound_api_get_claim.api_name = 'rebound_api_get_claim'

medevolve_api_get_claim = Blueprint('medevolve_api_get_claim', __name__, url_prefix='/api/v1/medevolve')
medevolve_api_get_claim.api_name = 'medevolve_api_get_claim'
pilotcustomer_api_get_claim = Blueprint('pilotcustomer_api_get_claim', __name__, url_prefix='/api/v1/pilotcustomer')
pilotcustomer_api_get_claim.api_name = 'pilotcustomer_api_get_claim'

betacustomer_api_get_claim = Blueprint('betacustomer_api_get_claim', __name__, url_prefix='/api/v1/betacustomer')
betacustomer_api_get_claim.api_name = 'betacustomer_api_get_claim'


def parse_remark_codes(raw_value) -> List[str]:
    """Parse RARC/remark codes from an EDI RemarkCodes field."""
    if raw_value is None:
        return []
    text = str(raw_value).replace("\r", "").replace("HE:", "").strip()
    if not text:
        return []
    seen = set()
    result = []
    for part in re.split(r"[,*\n;]+", text):
        code = part.strip()
        if code and code not in seen:
            seen.add(code)
            result.append(code)
    return result


def custom_paid_service_remark_has_line_id(cursor, db_name: str) -> bool:
    try:
        columns = {name.lower() for name in get_table_columns(cursor, db_name, "CUSTOM_PAID_SERVICE_REMARK")}
        return "line_id" in columns
    except Exception as exc:
        logger.warning("Unable to inspect CUSTOM_PAID_SERVICE_REMARK.line_id: %s", exc)
        return False


def _coerce_to_date(value) -> Optional[date]:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    text = str(value).strip()
    if not text:
        return None
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(text[:19], fmt).date()
        except ValueError:
            continue
    return None


def _parse_triage_action_value(raw_value) -> Dict[str, Any]:
    if not raw_value:
        return {"selected": [], "otherText": "", "transactionCodes": {}}
    try:
        parsed = json.loads(raw_value)
        if isinstance(parsed, list):
            return {"selected": [item for item in parsed if item], "otherText": "", "transactionCodes": {}}
        if isinstance(parsed, dict):
            selected = parsed.get("selected") if isinstance(parsed.get("selected"), list) else []
            transaction_codes = parsed.get("transactionCodes")
            return {
                "selected": [item for item in selected if item],
                "otherText": parsed.get("otherText") or "",
                "transactionCodes": transaction_codes if isinstance(transaction_codes, dict) else {},
            }
    except (json.JSONDecodeError, TypeError):
        pass
    return {
        "selected": [part.strip() for part in str(raw_value).split(",") if part.strip()],
        "otherText": "",
        "transactionCodes": {},
    }


def _is_triage_note_entry(entry: Optional[Dict[str, Any]]) -> bool:
    if not entry:
        return False
    status = (entry.get("claim_status") or "").strip().lower()
    if status != "triage":
        return False
    notes = (entry.get("notes") or "").strip()
    action = (entry.get("action") or "").strip()
    return bool(notes or action)


def _is_submit_action_entry(entry: Optional[Dict[str, Any]]) -> bool:
    if not entry:
        return False
    status = (entry.get("claim_status") or "").strip().lower()
    if "resubmit" in status:
        return True
    parsed = _parse_triage_action_value(entry.get("action"))
    labels = list(parsed.get("selected", []))
    transaction_codes = parsed.get("transactionCodes")
    if isinstance(transaction_codes, dict):
        labels.extend(transaction_codes.keys())
    return any(re.search(r"submit", str(label or ""), re.IGNORECASE) for label in labels)


def _triage_history_sort_key(entry: Dict[str, Any]) -> Tuple[int, int]:
    entry_id = int(entry.get("id") or 0)
    raw_date = entry.get("action_date") or entry.get("created_at") or ""
    parsed = _coerce_to_date(raw_date)
    sort_date = int(parsed.strftime("%Y%m%d")) if parsed else 0
    return (entry_id if entry_id else 10**12, sort_date)


def _resolve_submit_date(claim_data: Optional[Dict[str, Any]], actions: List[Dict[str, Any]]) -> Optional[date]:
    triage_entries = [entry for entry in (actions or []) if _is_triage_note_entry(entry)]
    triage_entries.sort(key=_triage_history_sort_key)
    for entry in triage_entries:
        if not _is_submit_action_entry(entry):
            continue
        entry_date = _coerce_to_date(entry.get("action_date") or entry.get("created_at"))
        if entry_date:
            return entry_date
    return None


def fetch_remit_remark_codes(cursor, id_837, id_835) -> List[str]:
    try:
        cursor.execute(
            """
            SELECT RemarkCode
            FROM CUSTOM_PAID_SERVICE_REMARK
            WHERE id_837 = %s AND id_835 = %s
            """,
            (id_837, id_835),
        )
        seen = set()
        result = []
        for row in cursor.fetchall() or []:
            code = f"{row.get('RemarkCode') or ''}".strip()
            if code and code not in seen:
                seen.add(code)
                result.append(code)
        return result
    except Exception as exc:
        logger.warning("Unable to fetch remit remark codes: %s", exc)
        return []


def fetch_remark_codes_by_line(cursor, id_837, id_835, has_line_id: bool) -> Dict[int, List[str]]:
    line_remarks: Dict[int, List[str]] = {}
    if not has_line_id:
        return line_remarks
    try:
        cursor.execute(
            """
            SELECT line_id, RemarkCode
            FROM CUSTOM_PAID_SERVICE_REMARK
            WHERE id_837 = %s AND id_835 = %s AND line_id IS NOT NULL
            """,
            (id_837, id_835),
        )
        for row in cursor.fetchall() or []:
            line_id = row.get("line_id")
            code = f"{row.get('RemarkCode') or ''}".strip()
            if line_id is None or not code:
                continue
            line_remarks.setdefault(line_id, [])
            if code not in line_remarks[line_id]:
                line_remarks[line_id].append(code)
    except Exception as exc:
        logger.warning("Unable to fetch line-level remark codes: %s", exc)
    return line_remarks


def attach_service_line_remarks(
    service_lines: List[dict],
    remit_remarks: List[str],
    line_remarks_by_id: Dict[int, List[str]],
) -> None:
    line_count = len(service_lines)
    for service_line in service_lines:
        line_id = service_line.get("ID")
        parsed = parse_remark_codes(service_line.get("RemarkCodes"))
        if not parsed and line_id in line_remarks_by_id:
            parsed = list(line_remarks_by_id[line_id])
        if not parsed and line_count == 1 and remit_remarks:
            parsed = list(remit_remarks)
        service_line["Remark"] = parsed


def get_custom_all_patient_payment_expr(cursor, db_name: str) -> str:
    """Use PatientPayment when the column exists; otherwise fall back to 0."""
    try:
        if table_has_column(cursor, db_name, "CUSTOM_ALL", "PatientPayment"):
            return "COALESCE(CUSTOM_ALL.PatientPayment, 0)"
        return "0"
    except Exception as exc:
        logger.warning("Unable to inspect CUSTOM_ALL.PatientPayment: %s", exc)
        return "0"

@rebound_api_get_claim.route("/get_claim", methods=["GET"])
@medevolve_api_get_claim.route("/get_claim", methods=["GET"])
@pilotcustomer_api_get_claim.route("/get_claim", methods=["GET"])
@betacustomer_api_get_claim.route("/get_claim", methods=["GET"])
def get_rebound_claim():
    """
    This endpoint fetches claim details based on the claim number.
    ---
    tags:
      - Claim Details
    parameters:
      - in: query
        name: id
        type: string
        required: true
        description: Claim number
      - in: query
        name: username
        type: string
        required: true
        description: Username
    responses:
      200:
        description: Successful response
        schema:
          type: object
          properties:
            Claim:
              type: object
              properties:
                Data:
                  type: object
                Related:
                  type: array
                  items:
                    type: object
                Diagnosis:
                  type: array
                  items:
                    type: object
                ServiceLine:
                  type: array
                  items:
                    type: object
            Remit:
              type: array
              items:
                type: object
            RelatedEncounters:
              type: array
              items:
                type: object
            Document:
              type: object
            Appeal:
              type: array
              items:
                type: string
            up:
              type: integer
            down:
              type: integer
            rate:
              type: integer
            Comment:
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
        conn, cursor, db_name = get_connection(request)
        claim_no = request.args.get("id")
        username = request.args.get("username")
        patient_payment_expr = get_custom_all_patient_payment_expr(cursor, db_name)
        ret = {"Claim": {}, "Remit": {}, "RelatedEncounters": []}
        q = f"""
            SELECT
                CUSTOM_ALL.id,
                CUSTOM_ALL.id_835,
                CUSTOM_ALL.ClaimNo,
                CUSTOM_ALL.ServiceDate,
                CUSTOM_ALL.PrimaryGroup,
                CUSTOM_ALL.PrimaryCode,
                CUSTOM_ALL.Category,
                CUSTOM_ALL.Amount,
                CUSTOM_ALL.AllowedAmt,
                CUSTOM_ALL.PaidAmt,
                {patient_payment_expr} AS PatientPayment,
                CUSTOM_ALL.DeniedAmt,
                CUSTOM_PAID_AMOUNT.ChargeAmount,
                CUSTOM_PAID_AMOUNT.PaidAmount,
                CUSTOM_PAID_AMOUNT.PatientResp,
                CUSTOM_PAID_AMOUNT.DeniedAmount,
                CUSTOM_ALL.PriorAuthorization,
                CUSTOM_ALL.PlaceOfService,
                CUSTOM_ALL.PayerName,
                CUSTOM_ALL.PatientID,
                CUSTOM_ALL.PayerSeq,
                CUSTOM_ALL.PayerID,
                CUSTOM_ALL.PayerAddress,
                CUSTOM_ALL.ProvNPI,
                CUSTOM_ALL.ProvTaxID,
                COALESCE(CUSTOM_ALL.BillProvName, '') AS BillProvName,
                CUSTOM_ALL.BIllProvAddress,
                CUSTOM_ALL.BillTaxonomy,
                CUSTOM_ALL.RendTaxonomy,
                CUSTOM_ALL.PrimaryDX,
                CUSTOM_ALL.Automation,
                CUSTOM_ALL.Frequency,
                CUSTOM_ALL.TransactionDate
            FROM CUSTOM_ALL
            LEFT JOIN matching_for_table ON matching_for_table.ClaimNo=CUSTOM_ALL.ClaimNo
            LEFT JOIN CUSTOM_PAID_AMOUNT ON CUSTOM_PAID_AMOUNT.ID=matching_for_table.id_835
            WHERE CUSTOM_ALL.ClaimNo='{claim_no}'
        """
        cursor.execute(q)
        ret["Claim"]["Data"] = cursor.fetchone()

        
        id = ret["Claim"]["Data"]["id"]
        id_835 = ret["Claim"]["Data"]["id_835"]

        # Pend 277/835 flags for claim-status detail context.
        pend277 = False
        pend835 = False
        try:
            if id_835 is None or id_835 == 0:
                q = """
                    SELECT 1
                    FROM optum_claim_status_request_encounter e
                    JOIN optum_claim_status_response r ON r.request_id = e.request_id
                    WHERE e.trading_partner_claim_number = %s
                    LIMIT 1
                """
                cursor.execute(q, (ret["Claim"]["Data"]["ClaimNo"],))
                has_optum = cursor.fetchone() is not None
                pend277 = not has_optum
                pend835 = has_optum
        except Exception as pend_error:
            logger.warning(f"Failed to compute pend flags: {pend_error}")
        ret["Claim"]["Data"]["Pend277"] = pend277
        ret["Claim"]["Data"]["Pend835"] = pend835

        claim_no_splits = ret["Claim"]["Data"]["ClaimNo"].split('-')

        q = f"""
            SELECT
                CUSTOM_EDI_Claims_CLONE.ClaimNo
            FROM CUSTOM_EDI_Claims_CLONE
            WHERE CUSTOM_EDI_Claims_CLONE.ClaimNoFirst='{claim_no_splits[0]}'
                AND CUSTOM_EDI_Claims_CLONE.Amount={ret["Claim"]["Data"]["Amount"]}
                AND CUSTOM_EDI_Claims_CLONE.PrincipalDiagnosis='{ret["Claim"]["Data"]["PrimaryDX"]}'
                AND CUSTOM_EDI_Claims_CLONE.ServiceDate='{ret["Claim"]["Data"]["ServiceDate"]}'
        """
        cursor.execute(q)
        ret["Claim"]["Related"] = cursor.fetchall()

        # Remark Codes
        ret['Claim']['Data']['Remark'] = []
        if id_835 != None:
            q = f"SELECT RemarkCode FROM CUSTOM_PAID_SERVICE_REMARK WHERE id_837={id} AND id_835={id_835}"
            cursor.execute(q)
            data = cursor.fetchall()
            ret['Claim']['Data']['Remark'] = [item['RemarkCode'] for item in data]

        q = f"""
            SELECT
                CUSTOM_ICD.Code,
                CUSTOM_ICD.Description
            FROM Diagnosis
            LEFT JOIN CUSTOM_ICD ON CUSTOM_ICD.Code=Diagnosis.Diagnosis
            WHERE ClaimNo='{claim_no}';
        """
        cursor.execute(q)
        ret['Claim']['Diagnosis'] = cursor.fetchall()

        q = f"""
            SELECT
                CUSTOM_SERVICE.Code,
                CUSTOM_SERVICE.Modifier,
                CUSTOM_SERVICE.Code,
                cpt.Description,
                CUSTOM_SERVICE.ServiceDate,
                CUSTOM_SERVICE.Charges,
                CUSTOM_SERVICE.Units,
                CUSTOM_SERVICE.RendProvNPI,
                CUSTOM_SERVICE.RendTaxonomy
            FROM CUSTOM_SERVICE
            LEFT JOIN cpt ON cpt.Code=CUSTOM_SERVICE.Code
            WHERE ClaimNo='{claim_no}' AND (cpt.Type='CPT' OR cpt.Type='HCPCS')
        """
        cursor.execute(q)
        ret['Claim']['ServiceLine'] = cursor.fetchall()

        q = f"SELECT * FROM actions WHERE ClaimNo='{claim_no}' ORDER BY id DESC"
        cursor.execute(q)
        row = cursor.fetchall()
        if row != None:
            ret['Action'] = row
        else:
            ret['Action'] = [{
                "action_date": '',
                "action": '',
                "claim_status": '',
                "notes": ''
            }]

        ret['Remit'] = []
        q = f"""
            SELECT
                CUSTOM_PAID.CheckDate,
                CUSTOM_PAID.CheckNumber,
                CUSTOM_PAID.CheckAmount,
                CUSTOM_PAID.PayerID,
                CUSTOM_PAID.PayerName,
                CUSTOM_PAID.ProviderName,
                CUSTOM_PAID.ProviderAddress,
                CUSTOM_PAID.NPI,
                CUSTOM_PAID.ServiceDate,
                CUSTOM_PAID.ProcessingStatus,
                CUSTOM_PAID.PayerClaimNumber,
                CUSTOM_PAID.ClaimID,
                CUSTOM_PAID.ChargeAmount,
                CUSTOM_PAID.PaidAmount,
                CUSTOM_PAID.DeniedAmount,
                CUSTOM_PAID.PatientResp,
                matching_837_835.id_835
            FROM CUSTOM_PAID
            LEFT JOIN matching_837_835 ON matching_837_835.id_835=CUSTOM_PAID.ID
            WHERE matching_837_835.ClaimNo='{claim_no}'
            ORDER BY CUSTOM_PAID.CheckDate DESC, matching_837_835.id_835 DESC
        """
        cursor.execute(q)
        results = cursor.fetchall()
        remark_has_line_id = custom_paid_service_remark_has_line_id(cursor, db_name)
        overturn = 0
        recovery_amount = 0
        action_date_value = None
        submit_date_value = _resolve_submit_date(ret["Claim"]["Data"], ret.get("Action", []))
        if submit_date_value:
            ret["Claim"]["Data"]["SubmitDate"] = submit_date_value.isoformat()
        if len(ret.get('Action', [])) != 0:
            action_date = ret['Action'][0].get('action_date')
            if action_date:
                try:
                    action_date_value = datetime.strptime(action_date, '%m/%d/%Y').date()
                except ValueError:
                    action_date_value = None

        remit_claim_ids = [row['id_835'] for row in results if row.get('id_835') is not None]
        lines_by_claim_id = {}
        codes_by_line_id = {}
        modifiers_by_claim_id = {}

        if remit_claim_ids:
            claim_placeholders = ",".join(["%s"] * len(remit_claim_ids))
            cursor.execute(
                f"""
                    SELECT
                        EDI_PaidClaimLines.ID,
                        EDI_PaidClaimLines.ClaimID,
                        EDI_PaidClaimLines.ServiceDate,
                        EDI_PaidClaimLines.ProcedureCode,
                        EDI_PaidClaimLines.UnitsPaid,
                        EDI_PaidClaimLines.ChargedAmount,
                        EDI_PaidClaimLines.AllowedAmount,
                        EDI_PaidClaimLines.PaidAmount,
                        EDI_PaidClaimLines.RemarkCodes,
                        cpt.Description
                    FROM EDI_PaidClaimLines
                    LEFT JOIN cpt ON cpt.Code=EDI_PaidClaimLines.ProcedureCode
                    WHERE EDI_PaidClaimLines.ClaimID IN ({claim_placeholders})
                      AND (cpt.Type='CPT' OR cpt.Type='HCPCS')
                """,
                remit_claim_ids,
            )
            all_service_lines = cursor.fetchall() or []
            all_line_ids = []
            for line in all_service_lines:
                claim_id = line.get("ClaimID")
                lines_by_claim_id.setdefault(claim_id, []).append(line)
                all_line_ids.append(line["ID"])

            if all_line_ids:
                line_placeholders = ",".join(["%s"] * len(all_line_ids))
                cursor.execute(
                    f"""
                        SELECT
                            EDI_PaidClaimLineAdj.LineID,
                            EDI_PaidClaimLineAdj.AdjustmentGroup,
                            EDI_PaidClaimLineAdj.AdjustmentReason,
                            EDI_PaidClaimLineAdj.AdjustmentAmount,
                            carc.Description
                        FROM EDI_PaidClaimLineAdj
                        LEFT JOIN carc ON carc.Code=EDI_PaidClaimLineAdj.AdjustmentReason
                        WHERE EDI_PaidClaimLineAdj.LineID IN ({line_placeholders})
                    """,
                    all_line_ids,
                )
                for adj in cursor.fetchall() or []:
                    line_id = adj.get("LineID")
                    if line_id is None:
                        continue
                    codes_by_line_id.setdefault(line_id, []).append(
                        {
                            "AdjustmentGroup": adj.get("AdjustmentGroup"),
                            "AdjustmentReason": adj.get("AdjustmentReason"),
                            "AdjustmentAmount": adj.get("AdjustmentAmount"),
                            "Description": adj.get("Description"),
                        }
                    )

            cursor.execute(
                f"""
                    SELECT id_835, id, ProcedureCode, ProcedureModifier1, ProcedureModifier2,
                           ProcedureModifier3, ProcedureModifier4
                    FROM CUSTOM_PAID_SERVICE
                    WHERE ID_835 IN ({claim_placeholders})
                """,
                remit_claim_ids,
            )
            for modifier in cursor.fetchall() or []:
                modifiers_by_claim_id.setdefault(modifier.get("id_835"), []).append(modifier)

        for row in results:
            ret['Remit'].append(row)
            ret['Remit'][-1]['ServiceLine'] = []
            if row['id_835'] is None:
                continue

            service_lines = lines_by_claim_id.get(row['id_835'], [])
            check_date = _coerce_to_date(row.get('CheckDate'))
            if action_date_value and check_date and check_date > action_date_value:
                overturn += sum(float(line.get('AllowedAmount') or 0) for line in service_lines)
            if submit_date_value and check_date and check_date > submit_date_value:
                recovery_amount += sum(float(line.get('AllowedAmount') or 0) for line in service_lines)

            modifier_data = modifiers_by_claim_id.get(row['id_835'], [])
            for line in service_lines:
                service_line = dict(line)
                service_line['Codes'] = codes_by_line_id.get(line['ID'], [])
                service_line['Modifiers'] = [
                    modifier for modifier in modifier_data if modifier.get('id') == line['ID']
                ]
                ret['Remit'][-1]['ServiceLine'].append(service_line)

            remit_remarks = fetch_remit_remark_codes(cursor, id, row['id_835'])
            line_remarks_by_id = fetch_remark_codes_by_line(
                cursor, id, row['id_835'], remark_has_line_id
            )
            attach_service_line_remarks(
                ret['Remit'][-1]['ServiceLine'],
                remit_remarks,
                line_remarks_by_id,
            )
            ret['Remit'][-1]['Remark'] = remit_remarks
        
        ret['Claim']['Data']['Overturn'] = overturn
        ret['Claim']['Data']['RecoveryAmount'] = recovery_amount
        q = f"""
            SELECT
                CUSTOM_ALL.ClaimNo,
                CUSTOM_ALL.ServiceDate,
                CUSTOM_ALL.TransactionDate,
                CUSTOM_ALL.TransactionType,
                CUSTOM_ALL.PayerID,
                CUSTOM_ALL.PayerName,
                CUSTOM_ALL.PayerSeq,
                CUSTOM_ALL.Frequency,
                CUSTOM_ALL.PatientID,
                CUSTOM_ALL.PatientName
            FROM CUSTOM_ALL
            WHERE CUSTOM_ALL.ClaimNo LIKE '{claim_no.split('-')[0]}-%'
            ORDER BY CUSTOM_ALL.TransactionDate DESC
        """
        cursor.execute(q)
        ret['RelatedEncounters'] = cursor.fetchall()

        ret["Document"] = {
            "Category": "",
            "DenialCode": "",
            "Comments": "",
            "Evidence1": "",
            "Evidence2": "",
            "Resubmittion": "",
        }
        q = f"SELECT * FROM documents WHERE id='{claim_no}'"
        cursor.execute(q)
        ret['Document'] = cursor.fetchone()

        ret['Appeal'] = ["", "", "", "", "", "", ""]
        flag = False

        if len(ret['Remit']) > 0:
            for service in ret['Remit'][0]['ServiceLine']:
                if service['RemarkCodes'] == 'HE:N255':
                    flag = True
                    q = f"SELECT * FROM n255 WHERE Code='{ret['Claim']['Data']['RendTaxonomy']}'"
                    cursor.execute(q)
                    row = cursor.fetchone()
                    if row != None:
                        ret["Appeal"][2] = row["rationale"]
                        ret["Appeal"][4] = f"Billing Provider Taxonomy is missing."
                        ret["Appeal"][
                            5
                        ] = f"Resubmit the claim with Billing Taxonomy code '{row['BillingTaxonomy']}'."
                    break
                elif service['RemarkCodes'] == "M77":
                    flag = True
                    q = f"SELECT * FROM denial_actions WHERE ClaimNo='{claim_no}' limit 1"
                    cursor.execute(q)
                    row = cursor.fetchone()
                    if row != None:
                        ret["Appeal"][0] = "N/A"
                        ret["Appeal"][1] = row["action"]
                        ret["Appeal"][2] = row["rationale"]
                        if row["evidence"] != None:
                            ret["Appeal"][3] = row["evidence"]
                        ret["Appeal"][4] = row["root_cause"]
                        ret["Appeal"][5] = row["recommendation"]
                        ret["Appeal"][6] = 0
                    break
        if flag == False:
            q = f"SELECT * FROM denial_actions WHERE ClaimNo='{claim_no}' limit 1"
            cursor.execute(q)
            row = cursor.fetchone()
            if row != None:
                ret["Appeal"][0] = "N/A"
                ret["Appeal"][1] = row["action"]
                ret["Appeal"][2] = row["rationale"]
                if row["evidence"] != None:
                    ret["Appeal"][3] = row["evidence"]
                ret["Appeal"][4] = row["root_cause"]
                ret["Appeal"][5] = row["recommendation"]
                ret["Appeal"][6] = 2
            else:
                q = f"SELECT * FROM action_denials_co97 WHERE ClaimID='{claim_no}' limit 1"
                cursor.execute(q)
                row = cursor.fetchone()
                if row != None:
                    ret["Appeal"][0] = "N/A"
                    ret["Appeal"][1] = "N/A"
                    if row["Evidence"] != None:
                        ret["Appeal"][3] = row["Evidence"]
                    ret["Appeal"][4] = row["root_cause"]
                    ret["Appeal"][5] = row["Recommendation"]
                    ret["Appeal"][6] = 1
                else:
                    q = f"SELECT * FROM appeals WHERE ClaimNo='{claim_no}' limit 1"
                    cursor.execute(q)
                    row = cursor.fetchone()
                    if row != None:
                        ret["Appeal"][0] = row["Appeal1"]
                        ret["Appeal"][1] = row["Appeal2"]
                        ret["Appeal"][2] = row["Appeal3"]
                        ret["Appeal"][3] = row["Appeal4"]
                        ret["Appeal"][4] = row["Appeal5"]
                        ret["Appeal"][5] = row["Appeal6"]
                        ret["Appeal"][6] = 0
                    else:
                        ret["Appeal"][6] = -1

        q = f"select count(username) up from rate where claimno='{claim_no}' and action=1 and username != '{username}'"
        cursor.execute(q)
        row = cursor.fetchone()
        if row != None:
            ret["up"] = row["up"]

        q = f"select count(username) down from rate where claimno='{claim_no}' and action=-1 and username != '{username}'"
        cursor.execute(q)
        row = cursor.fetchone()
        if row != None:
            ret["down"] = row["down"]

        q = f"select action from rate where claimno='{claim_no}' and username='{username}'"
        cursor.execute(q)
        row = cursor.fetchone()
        if row != None:
            ret["rate"] = row["action"]
        else:
            ret["rate"] = 0


        ret["Comment"] = {}
        ret["Comment"]["Additional"] = ""
        ret["Comment"]["CPT"] = ""
        ret["Comment"]["Description"] = ""
        ret["Comment"]["Recommendation"] = ""
        ret["Comment"]["Root"] = ""
        ret["Comment"]["Steps"] = ""
        ret["Comment"]["Evidence1"] = ""
        ret["Comment"]["Evidence2"] = ""
        q = f"SELECT * FROM comments WHERE ClaimNo='{claim_no}' limit 1"
        cursor.execute(q)
        row = cursor.fetchone()
        if row != None:
            ret["Comment"] = row

        try:
            ret["SupportingDocuments"] = fetch_supporting_documents(cursor, claim_no)
        except Exception as doc_err:
            logger.warning(f"Could not load supporting documents: {doc_err}")
            ret["SupportingDocuments"] = []
        
        return ret, 200
    except Exception as e:
        print(f"[ERROR]: {e}")
        return {"error": "Internal server Error"}, 500
    finally:
        close_connection(cursor, conn)
        _end = time.time()
        print("/get_rebound_claim", _end - _start)


@rebound_api_get_claim.route("/triage_actions", methods=["GET"])
@medevolve_api_get_claim.route("/triage_actions", methods=["GET"])
@pilotcustomer_api_get_claim.route("/triage_actions", methods=["GET"])
@betacustomer_api_get_claim.route("/triage_actions", methods=["GET"])
def get_triage_actions():
    """
    This endpoint fetches triage action items for a denial category.
    ---
    tags:
      - Claim Details
    parameters:
      - in: query
        name: denial_category
        type: string
        required: true
        description: Denial category name
    responses:
      200:
        description: Successful response
        schema:
          type: array
          items:
            type: object
            properties:
              label:
                type: string
              allowFreeText:
                type: boolean
    """
    conn = None
    cursor = None
    try:
        conn, cursor, db_name = get_connection(request)
        denial_category = (request.args.get("denial_category") or "").strip()
        workflow = (request.args.get("workflow") or "").strip()
        if denial_category == "" and workflow == "":
            return jsonify([]), 200

        try:
            ret = fetch_triage_actions_for_category(
                cursor,
                denial_category,
                workflow=workflow,
            )
        except Exception as query_error:
            logger.error("[QUERY ERROR]: %s", query_error)
            return jsonify([]), 200

        return jsonify(ret), 200
    except Exception as e:
        logger.error(f"[ERROR]: {e}")
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)
