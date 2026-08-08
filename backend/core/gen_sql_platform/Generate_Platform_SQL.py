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

ADVANCED_FILTER_COLUMNS = {
    "facilityName": "CUSTOM_ALL.BillProvName",
    "provTaxId": "CUSTOM_ALL.ProvTaxID",
    "provNpi": "CUSTOM_ALL.ProvNPI",
    "payerId": "CUSTOM_ALL.PayerID",
    "payerSeq": "CUSTOM_ALL.PayerSeq",
    "patientName": "CUSTOM_ALL.PatientName",
    "patientId": "CUSTOM_ALL.PatientID",
    "category": "CUSTOM_ALL.Category",
    "placeOfService": "CUSTOM_ALL.PlaceOfService",
    "primaryDx": "CUSTOM_ALL.PrimaryDX",
    "primaryProcedure": "CUSTOM_ALL.PrimaryProcedure",
}

PAYER_NAME_SEARCH_EXPR = (
    "TRIM(CONCAT_WS(' ', COALESCE(CUSTOM_ALL.PayerName, ''), COALESCE(CUSTOM_ALL.PayerID, '')))"
)

SERVICE_DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def normalize_search_text(value: str) -> str:
    return re.sub(r"[\s\u00a0\u2000-\u200b]+", " ", str(value or "").strip())


def escape_sql_like(value: str) -> str:
    return value.replace("'", "''")


def build_tokenized_like_condition(column_expr: str, value: str) -> str:
    normalized = normalize_search_text(value)
    tokens = [token for token in normalized.split(" ") if token]
    if not tokens:
        return ""
    if len(tokens) == 1:
        safe = escape_sql_like(tokens[0])
        return f"{column_expr} LIKE '%{safe}%'"
    parts = []
    for token in tokens:
        safe = escape_sql_like(token)
        parts.append(f"{column_expr} LIKE '%{safe}%'")
    return f"({' AND '.join(parts)})"


def build_advanced_filter_sql_conditions(advanced_filters: Optional[dict]) -> str:
    if not advanced_filters:
        return ""
    conditions = []
    payer_name = advanced_filters.get("payerName")
    if payer_name:
        payer_condition = build_tokenized_like_condition(PAYER_NAME_SEARCH_EXPR, payer_name)
        if payer_condition:
            conditions.append(payer_condition)
    for key, column in ADVANCED_FILTER_COLUMNS.items():
        raw = advanced_filters.get(key)
        if raw is None:
            continue
        value = normalize_search_text(raw)
        if not value:
            continue
        safe = escape_sql_like(value)
        conditions.append(f"{column} LIKE '%{safe}%'")
    service_date = advanced_filters.get("serviceDate")
    if service_date:
        value = str(service_date).strip()
        if SERVICE_DATE_PATTERN.match(value):
            conditions.append(f"DATE(CUSTOM_ALL.ServiceDate) = '{value}'")
    return " AND ".join(conditions)


def merge_request_extra(payload: dict) -> dict:
    extra = dict(payload.get("extra") or {})
    advanced_filters = payload.get("advancedFilters") or {}
    if advanced_filters:
        extra["AdvancedFilters"] = advanced_filters
    return extra

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
    if extra.get("Pend277") or extra.get("Pend835"):
        apply_tag_filters = False
    else:
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
        query += "1=1 "
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
    if "AllowedFacilities" in extra:
        facilities = extra.get("AllowedFacilities") or []
        tax_ids = []
        npis = []
        taxonomy_codes = []
        for item in facilities:
            if not item:
                continue
            if isinstance(item, str):
                tax_ids.append(item)
                continue
            tax_id = item.get("taxId") or item.get("taxID") or item.get("facilityTaxId") or item.get("facilityTaxID") or item.get("FedTaxID")
            npi = item.get("npi") or item.get("NPI") or item.get("facilityNpi") or item.get("facilityNPI") or item.get("ProvNPI") or item.get("BillProvNPI")
            taxonomy_code = (
                item.get("taxonomyCode")
                or item.get("taxonomy")
                or item.get("TaxonomyCode")
                or item.get("facilityTaxonomyCode")
                or item.get("BillTaxonomy")
                or item.get("RendTaxonomy")
            )
            if tax_id:
                tax_ids.append(str(tax_id))
            if npi:
                npis.append(str(npi))
            if taxonomy_code:
                taxonomy_codes.append(str(taxonomy_code))
        conditions = []
        if tax_ids:
            safe_tax = ", ".join(["'{}'".format(str(t).replace("'", "''")) for t in tax_ids])
            conditions.append(f"CUSTOM_ALL.ProvTaxID IN ({safe_tax})")
        if npis:
            safe_npi = ", ".join(["'{}'".format(str(n).replace("'", "''")) for n in npis])
            conditions.append(f"CUSTOM_ALL.ProvNPI IN ({safe_npi})")
        if taxonomy_codes:
            safe_taxonomy = ", ".join(["'{}'".format(str(t).replace("'", "''")) for t in taxonomy_codes])
            conditions.append(
                f"(CUSTOM_ALL.BillTaxonomy IN ({safe_taxonomy}) OR CUSTOM_ALL.RendTaxonomy IN ({safe_taxonomy}))"
            )
        if conditions:
            query += f" AND ({' OR '.join(conditions)})"
    if extra.get("Missing835"):
        query += "AND (CUSTOM_ALL.id_835 IS NULL OR CUSTOM_ALL.id_835=0) "
    if extra.get("Pend277"):
        query += """
            AND (CUSTOM_ALL.id_835 IS NULL OR CUSTOM_ALL.id_835=0)
            AND NOT EXISTS (
                SELECT 1
                FROM optum_claim_status_request_encounter e
                JOIN optum_claim_status_response r ON r.request_id = e.request_id
                WHERE e.trading_partner_claim_number = CUSTOM_ALL.ClaimNo
            )
        """
    if extra.get("Pend835"):
        query += """
            AND (CUSTOM_ALL.id_835 IS NULL OR CUSTOM_ALL.id_835=0)
            AND EXISTS (
                SELECT 1
                FROM optum_claim_status_request_encounter e
                JOIN optum_claim_status_response r ON r.request_id = e.request_id
                WHERE e.trading_partner_claim_number = CUSTOM_ALL.ClaimNo
            )
        """
    query += build_exclude_ai_models_sql(extra)
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
    advanced_filter_sql = build_advanced_filter_sql_conditions(extra.get("AdvancedFilters"))
    if advanced_filter_sql:
        query += f" AND {advanced_filter_sql}"
    if sort != "":
        if sort[-1] == '-':
            query += f" ORDER BY CUSTOM_ALL.{sort[:-1]} DESC"
        else:
            query += f" ORDER BY CUSTOM_ALL.{sort}"
    return query


def build_exclude_ai_models_from_rows(models):
    seen = set()
    payload = []
    for row in models or []:
        if not isinstance(row, dict):
            continue
        group = str(row.get("GroupCode") or row.get("group") or "").strip()
        code = str(row.get("Code") or row.get("code") or row.get("AdjustmentReason") or "").strip()
        if not group or not code:
            continue
        key = f"{group}:{code}"
        if key in seen:
            continue
        seen.add(key)
        payload.append({"group": group, "code": code})
    return payload


def build_exclude_ai_models_condition(extra):
    exclude_ai_models = (extra or {}).get("ExcludeAiModels") if isinstance(extra, dict) else None
    if not exclude_ai_models:
        return ""
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
    if not conditions:
        return ""
    conditions_sql = " OR ".join(conditions)
    return f"""NOT EXISTS (
                    SELECT 1
                    FROM CUSTOM_SERVICE_CODE_FOR_TABLE
                    WHERE CUSTOM_SERVICE_CODE_FOR_TABLE.id_837=CUSTOM_ALL.ID
                      AND ({conditions_sql})
                )"""


def build_exclude_ai_models_sql(extra):
    condition = build_exclude_ai_models_condition(extra)
    if not condition:
        return ""
    return f" AND {condition}"


def merge_sql_conditions(base, addition):
    base_sql = (base or "").strip()
    addition_sql = (addition or "").strip()
    if not addition_sql:
        return base_sql
    if not base_sql:
        return addition_sql
    return f"{base_sql} AND {addition_sql}"
