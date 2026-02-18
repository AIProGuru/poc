from enum import IntEnum
from typing import Dict, List, Optional
from datetime import date
import os
import re

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
    apply_tag_filters = True,
):
    include_all_categories = extra.get("IncludeAllCategories", False)
    allowed_categories = extra.get("AllowedCategories") or []
    allowed_set = set([str(item).strip() for item in allowed_categories if item])
    apply_tag_filters = apply_tag_filters and not (include_all_categories and tab_index == TabIndex.MAIN)
    tags = ""
    flag = False
    filteredTags = []
    effective_tags = selectedTags or []
    if allowed_set:
        if include_all_categories and tab_index == TabIndex.MAIN:
            effective_tags = list(allowed_set)
            apply_tag_filters = True
        else:
            effective_tags = [item for item in effective_tags if str(item).strip() in allowed_set]
    if apply_tag_filters:
        for item in effective_tags:
            if not item:
                continue
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
            if tag == os.getenv('DELIQUENT'):
                flag = True
            tags += f"'{tag}',"
        if tags.endswith(","):
            tags = tags[: len(tags) - 1]
    if allowed_set and tags == "" and apply_tag_filters:
        tags = "'__none__'"
    group = ""
    if code != "":
        group = code[:2].upper()
        code = code[2:].upper()
    query = f"""
        from CUSTOM_ALL
        where CUSTOM_ALL.ClaimNo LIKE '{keyword}%' AND 
    """
    if not apply_tag_filters:
        query += "1=1"
    else:
        if include_all_categories and tab_index == TabIndex.MAIN:
            query += "1=1"
        else:
            if tags == "":
                if flag == True:
                    query += f"""
                        (CUSTOM_ALL.Category IS NULL OR TRIM(CUSTOM_ALL.Category) = '')
                    """
                else:
                    query += f"""
                        CUSTOM_ALL.Category='A'
                    """
            else:
                if flag == True:
                    query += f"""
                        (CUSTOM_ALL.Category IS NULL OR TRIM(CUSTOM_ALL.Category) = '' OR CUSTOM_ALL.Category IN ({tags}))
                    """
                else:
                    query += f"""
                        CUSTOM_ALL.Category IN ({tags})
                    """
    if pos != "":
        query += f"and CUSTOM_ALL.PlaceOfService='{pos}' "
    if remark != "":
        remark_codes = [code.strip() for code in re.split(r"[,*]", remark) if code.strip()]
        if len(remark_codes) == 1:
            remark_filter = f"CUSTOM_PAID_SERVICE_REMARK.RemarkCode='{remark_codes[0]}'"
        else:
            safe_codes = ["'%s'" % code.replace("'", "''") for code in remark_codes]
            remark_filter = f"CUSTOM_PAID_SERVICE_REMARK.RemarkCode IN ({','.join(safe_codes)})"
        query += f"""
            AND EXISTS (
                SELECT 1
                FROM CUSTOM_PAID_SERVICE_REMARK
                WHERE {remark_filter}
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
    if "AllowedPayers" in extra:
        allowed_payers = [name for name in extra.get("AllowedPayers", []) if name]
        if len(allowed_payers) > 0:
            query += " AND ("
            for name in allowed_payers:
                safe_name = str(name).replace("'", "''")
                if query[-1] == '(':
                    query += f"CUSTOM_ALL.PayerName LIKE '%{safe_name}%'"
                else:
                    query += f" OR CUSTOM_ALL.PayerName LIKE '%{safe_name}%'"
            query += ")"
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
    if "AllowedValueRanges" in extra:
        ranges = extra.get("AllowedValueRanges") or []
        conditions = []
        for item in ranges:
            try:
                min_val = float(item.get("min")) if item.get("min") is not None else None
            except (TypeError, ValueError, AttributeError):
                min_val = None
            try:
                max_val = float(item.get("max")) if item.get("max") is not None else None
            except (TypeError, ValueError, AttributeError):
                max_val = None
            if min_val is None and max_val is None:
                continue
            if min_val is not None and max_val is not None:
                conditions.append(f"(CUSTOM_ALL.Amount BETWEEN {min_val} AND {max_val})")
            elif min_val is not None:
                conditions.append(f"(CUSTOM_ALL.Amount >= {min_val})")
            elif max_val is not None:
                conditions.append(f"(CUSTOM_ALL.Amount <= {max_val})")
        if len(conditions) > 0:
            query += f" AND ({' OR '.join(conditions)})"
    if extra.get("Missing835"):
        query += "AND CUSTOM_ALL.id_835 IS NULL "
    exclude_ai_models = extra.get("ExcludeAiModels")
    if exclude_ai_models:
        conditions = []
        for item in exclude_ai_models:
            group = (item.get("group") or item.get("GroupCode") or "").strip()
            code = (item.get("code") or item.get("AdjustmentReason") or "").strip()
            if not group or not code:
                continue
            group_safe = group.replace("'", "''")
            code_safe = code.replace("'", "''")
            conditions.append(
                f"(CUSTOM_SERVICE_CODE_FOR_TABLE.AdjustmentGroup='{group_safe}' AND CUSTOM_SERVICE_CODE_FOR_TABLE.AdjustmentReason='{code_safe}')"
            )
        if len(conditions) > 0:
            conditions_sql = " OR ".join(conditions)
            query += f"""
                AND NOT EXISTS (
                    SELECT 1
                    FROM CUSTOM_SERVICE_CODE_FOR_TABLE
                    WHERE CUSTOM_SERVICE_CODE_FOR_TABLE.id_837=CUSTOM_ALL.ID
                      AND ({conditions_sql})
                )
            """
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
    skip_automation_filter = include_all_categories and tab_index == TabIndex.MAIN
    if not skip_automation_filter:
        if "All" not in extra or tab_index != 5:
            if tab_index != 6:
                if tab_index == 5:
                    query += f"AND CUSTOM_ALL.Automation!=0"
                else:
                    query += f"AND CUSTOM_ALL.Automation=0"
    if extra.get("ExcludeAutomationZero"):
        query += " AND (CUSTOM_ALL.Automation IS NULL OR CUSTOM_ALL.Automation != 0)"
    if sort != "":
        if sort[-1] == '-':
            query += f" ORDER BY CUSTOM_ALL.{sort[:-1]} DESC"
        else:
            query += f" ORDER BY CUSTOM_ALL.{sort}"
    return query
