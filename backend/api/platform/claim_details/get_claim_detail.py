from flask import Blueprint, request, jsonify
from typing import Dict, List, Optional, Tuple
import time
import logging
from datetime import date, datetime
from db import get_connection, close_connection

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Blueprints for different APIs
rebound_api_get_claim = Blueprint('rebound_api_get_claim', __name__, url_prefix='/api/v1/rebound')
rebound_api_get_claim.api_name = 'rebound_api_get_claim'

medevolve_api_get_claim = Blueprint('medevolve_api_get_claim', __name__, url_prefix='/api/v1/medevolve')
medevolve_api_get_claim.api_name = 'medevolve_api_get_claim'

@rebound_api_get_claim.route("/get_claim", methods=["GET"])
@medevolve_api_get_claim.route("/get_claim", methods=["GET"])
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
        conn, cursor, db_name = get_connection(request.base_url)
        claim_no = request.args.get("id")
        username = request.args.get("username")
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
                CUSTOM_ALL.BillProvName,
                CUSTOM_ALL.BIllProvAddress,
                CUSTOM_ALL.BillTaxonomy,
                CUSTOM_ALL.RendTaxonomy,
                CUSTOM_ALL.PrimaryDX,
                CUSTOM_ALL.Automation,
                CUSTOM_ALL.Frequency
            FROM CUSTOM_ALL
            LEFT JOIN matching_for_table ON matching_for_table.ClaimNo=CUSTOM_ALL.ClaimNo
            LEFT JOIN CUSTOM_PAID_AMOUNT ON CUSTOM_PAID_AMOUNT.ID=matching_for_table.id_835
            WHERE CUSTOM_ALL.ClaimNo='{claim_no}'
        """
        cursor.execute(q)
        ret["Claim"]["Data"] = cursor.fetchone()

        
        id = ret["Claim"]["Data"]["id"]
        id_835 = ret["Claim"]["Data"]["id_835"]

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
        overturn = 0
        
        for row in results:
            if len(ret['Action']) != 0 and datetime.strptime(ret['Action'][0]['action_date'], '%m/%d/%Y').date() <= row['CheckDate']:
                overturn += row['PaidAmount']
            ret['Remit'].append(row)
            ret['Remit'][-1]['ServiceLine'] = []
            if row['id_835'] != None:
                q = f"""
                    SELECT
                        EDI_PaidClaimLines.ID,
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
                    WHERE EDI_PaidClaimLines.ClaimID={row['id_835']} AND (cpt.Type='CPT' OR cpt.Type='HCPCS')
                """
                cursor.execute(q)
                rows = cursor.fetchall()
                for r in rows:
                    ret['Remit'][-1]['ServiceLine'].append(r)
                    q = f"""
                        SELECT
                            EDI_PaidClaimLineAdj.AdjustmentGroup,
                            EDI_PaidClaimLineAdj.AdjustmentReason,
                            EDI_PaidClaimLineAdj.AdjustmentAmount,
                            carc.Description
                        FROM EDI_PaidClaimLineAdj
                        LEFT JOIN carc ON carc.Code=EDI_PaidClaimLineAdj.AdjustmentReason
                        WHERE LineID={r['ID']}
                    """
                    cursor.execute(q)
                    ret["Remit"][-1]['ServiceLine'][-1]['Codes'] = cursor.fetchall()

                # Debug print statement to check if the code block is reached
                print(f"Fetching modifiers for ID_835={row['id_835']}")

                # Fetching modifiers from CUSTOM_PAID_SERVICE
                # q = f"SELECT * FROM CUSTOM_PAID_SERVICE WHERE ID_835={row['id_835']}"
                # print(f"Executing query: {q}")  # Debug print statement to show the query
                # cursor.execute(q)
                # modifier_data = cursor.fetchall()
                # print(f"Modifier data for ID_835={row['id_835']}: {modifier_data}")  # Debug print statement to show the results
                # ret['Remit'][-1]['ModifierData'] = modifier_data
                q = f"SELECT id_835,id,ProcedureCode,ProcedureModifier1,ProcedureModifier2,ProcedureModifier3,ProcedureModifier4 FROM CUSTOM_PAID_SERVICE WHERE ID_835={row['id_835']}"
                cursor.execute(q)
                modifier_data = cursor.fetchall()
                # print(f"Modifier data for ID_835={row['id_835']}: {modifier_data}")  # Debug print statement

                    # Merging ModifierData into ServiceLine
                for service_line in ret['Remit'][-1]['ServiceLine']:
                    service_line['Modifiers'] = [
                        modifier for modifier in modifier_data if modifier['id'] == service_line['ID']
                    ]
        
        ret['Claim']['Data']['Overturn'] = overturn
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
        
        return ret, 200
    except Exception as e:
        print(f"[ERROR]: {e}")
        return {"error": "Internal server Error"}, 500
    finally:
        close_connection(cursor, conn)
        _end = time.time()
        print("/get_rebound_claim", _end - _start)