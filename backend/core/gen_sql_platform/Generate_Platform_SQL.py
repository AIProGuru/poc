from enum import IntEnum
from typing import Dict, List, Optional
from datetime import date
import os

class TabIndex(IntEnum):
    MAIN = 0
    CONTRACTUAL = 1
    PATIENT = 2
    DELINQUENT = 3
    AUTOMATION = 5
    CUSTOM = 6

def generate_sql(
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
