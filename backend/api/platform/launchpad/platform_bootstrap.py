from flask import Blueprint, request, jsonify
import time
import logging
import json
import re
import os
from db import get_connection, close_connection
from core.gen_sql_platform.Generate_Platform_SQL import (
    generate_sql as newGenerateSQL,
    build_exclude_ai_models_from_rows,
    build_exclude_ai_models_condition,
    merge_sql_conditions,
)
from api.platform.launchpad.stratification_details import (
    build_priority_helpers,
    get_custom_all_patient_payment_expr,
    get_existing_columns,
)
from api.platform.launchpad.worklist_queue import build_category_grouped_count_sql

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Blueprints
rebound_api_bootstrap = Blueprint('rebound_api_bootstrap', __name__, url_prefix='/api/v1/rebound')
medevolve_api_bootstrap = Blueprint('medevolve_api_bootstrap', __name__, url_prefix='/api/v1/medevolve')
pilotcustomer_api_bootstrap = Blueprint('pilotcustomer_api_bootstrap', __name__, url_prefix='/api/v1/pilotcustomer')
betacustomer_api_bootstrap = Blueprint('betacustomer_api_bootstrap', __name__, url_prefix='/api/v1/betacustomer')


@rebound_api_bootstrap.route("/platform_bootstrap", methods=["POST", "OPTIONS"])
@medevolve_api_bootstrap.route("/platform_bootstrap", methods=["POST", "OPTIONS"])
@pilotcustomer_api_bootstrap.route("/platform_bootstrap", methods=["POST", "OPTIONS"])
@betacustomer_api_bootstrap.route("/platform_bootstrap", methods=["POST", "OPTIONS"])
def platform_bootstrap():
    """
    This endpoint fetches all platform bootstrap data in one call.
    ---
    tags:
      - Platform Data
    parameters:
      - in: body
        name: body
        description: JSON payload
        required: false
        schema:
          type: object
          properties:
            tabIndexes:
              type: array
              items:
                type: integer
              example: [6,2,1,4]
            keyword:
              type: string
              example: ""
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
    responses:
      200:
        description: Successful response
      500:
        description: Internal server error
    """
    _start = time.time()
    conn = None
    cursor = None
    try:
        if request.method == "OPTIONS":
            return jsonify({"ok": True}), 200

        if not request.is_json:
            return jsonify({"error": "Unsupported Media Type: Content-Type must be application/json"}), 415

        payload = request.get_json(silent=True) or {}
        tab_indexes = payload.get("tabIndexes") or []
        keyword = payload.get("keyword", "")
        startDate = payload.get("startDate")
        endDate = payload.get("endDate")
        code = payload.get("code", "")
        remark = payload.get("remark", "")
        procedure = payload.get("procedure", "")
        pos = payload.get("pos", "")
        extra = payload.get("extra", {}) or {}

        conn, cursor, db_name = get_connection(request)

        delinquent_label = os.getenv("DELIQUENT") or "Delinquent"
        delinquent_safe = delinquent_label.replace("'", "''")

        def build_extra_conditions(extra_filters):
            conditions = []
            allowed_categories = [
                (item or "").strip() for item in extra_filters.get("AllowedCategories", []) if item
            ]
            if "Pend 835" in allowed_categories:
                allowed_categories.append("Delinquent")
            allowed_categories = [item.replace("'", "''") for item in allowed_categories if item]
            if allowed_categories:
                allowed_list = ",".join([f"'{c}'" for c in allowed_categories])
                conditions.append(f"CUSTOM_ALL.Category IN ({allowed_list})")

            allowed_payers = [
                (item or "").strip() for item in extra_filters.get("AllowedPayers", []) if item
            ]
            allowed_payers = [item.replace("'", "''") for item in allowed_payers if item]
            if allowed_payers:
                payer_conditions = " OR ".join(
                    [f"CUSTOM_ALL.PayerName LIKE '%{name}%'" for name in allowed_payers]
                )
                conditions.append(f"({payer_conditions})")

            ranges = extra_filters.get("AllowedValueRanges") or []
            range_conditions = []
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
                    range_conditions.append(f"(CUSTOM_ALL.Amount BETWEEN {min_val} AND {max_val})")
                elif min_val is not None:
                    range_conditions.append(f"(CUSTOM_ALL.Amount >= {min_val})")
                elif max_val is not None:
                    range_conditions.append(f"(CUSTOM_ALL.Amount <= {max_val})")
            if range_conditions:
                conditions.append(f"({' OR '.join(range_conditions)})")

            facilities = extra_filters.get("AllowedFacilities") or []
            tax_ids = []
            npis = []
            taxonomy_codes = []
            for item in facilities:
                if not item:
                    continue
                if isinstance(item, str):
                    tax_ids.append(item)
                    continue
                tax_id = (
                    item.get("taxId")
                    or item.get("taxID")
                    or item.get("facilityTaxId")
                    or item.get("facilityTaxID")
                    or item.get("FedTaxID")
                )
                npi = (
                    item.get("npi")
                    or item.get("NPI")
                    or item.get("facilityNpi")
                    or item.get("facilityNPI")
                    or item.get("ProvNPI")
                    or item.get("BillProvNPI")
                )
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
            facility_conditions = []
            if tax_ids:
                tax_list = ", ".join(["'{}'".format(str(t).replace("'", "''")) for t in tax_ids])
                facility_conditions.append(f"CUSTOM_ALL.ProvTaxID IN ({tax_list})")
            if npis:
                npi_list = ", ".join(["'{}'".format(str(n).replace("'", "''")) for n in npis])
                facility_conditions.append(f"CUSTOM_ALL.ProvNPI IN ({npi_list})")
            if taxonomy_codes:
                taxonomy_list = ", ".join(["'{}'".format(str(t).replace("'", "''")) for t in taxonomy_codes])
                facility_conditions.append(
                    f"(CUSTOM_ALL.BillTaxonomy IN ({taxonomy_list}) OR CUSTOM_ALL.RendTaxonomy IN ({taxonomy_list}))"
                )
            if facility_conditions:
                conditions.append(f"({' OR '.join(facility_conditions)})")

            return " AND ".join(conditions)

        def append_where(query_text, conditions_sql):
            if not conditions_sql:
                return query_text
            raw = query_text.strip().rstrip(";")
            lower = raw.lower()
            order_idx = lower.rfind(" order by ")
            group_idx = lower.rfind(" group by ")
            split_idx = min(idx for idx in [order_idx, group_idx] if idx != -1) if (order_idx != -1 or group_idx != -1) else -1
            if " where " in lower:
                if split_idx != -1:
                    head = raw[:split_idx]
                    tail = raw[split_idx:]
                    return f"{head} AND {conditions_sql}{tail};"
                return f"{raw} AND {conditions_sql};"
            if split_idx != -1:
                head = raw[:split_idx]
                tail = raw[split_idx:]
                return f"{head} WHERE {conditions_sql}{tail};"
            return f"{raw} WHERE {conditions_sql};"

        extra_conditions = build_extra_conditions(extra)

        def inject_conditions(query_text, conditions_sql):
            if not conditions_sql:
                return query_text
            lower = query_text.lower()
            from_idx = lower.find("from custom_all")
            if from_idx == -1:
                return query_text
            tail = query_text[from_idx:]
            end_idx = tail.lower().find(") as subquery1")
            if end_idx == -1:
                end_idx = tail.lower().find(") subquery1")
            if end_idx == -1:
                return query_text
            subquery_block = tail[:end_idx]
            if "where" in subquery_block.lower():
                updated_block = f"{subquery_block} AND {conditions_sql} "
            else:
                updated_block = f"{subquery_block} WHERE {conditions_sql} "
            return query_text[:from_idx] + updated_block + tail[end_idx:]

        cursor.execute("select * from ai_model")
        queries_for_ai_model = cursor.fetchall() or []

        models = []
        for item in queries_for_ai_model:
            query_text = item.get("query") or ""
            filtered_query = inject_conditions(query_text, extra_conditions)
            logger.info(f"Executing query: {filtered_query}")
            try:
                cursor.execute(filtered_query)
                row = cursor.fetchone()
                if row is not None:
                    try:
                        extra_data = json.loads(item.get("extra") or "{}")
                    except json.JSONDecodeError:
                        extra_data = {}
                    remark_codes = re.findall(r"RemarkCode='([^']+)'", query_text)
                    if remark_codes and "remarkCodes" not in extra_data:
                        extra_data["remarkCodes"] = remark_codes
                    if "denial_actions" in query_text and "Only" not in extra_data:
                        extra_data["Only"] = True

                    models.append(
                        {
                            "id": item.get("id"),
                            "Title": item.get("title"),
                            "ModelTitle": item.get("model_title") or "",
                            "Count": row.get("cnt"),
                            "Amount": row.get("amount"),
                            "Code": row.get("AdjustmentReason"),
                            "GroupCode": row.get("AdjustmentGroup"),
                            "Remark": item.get("remark"),
                            "Category": row.get("DenialCategory"),
                            "Status": item.get("status"),
                            "User": item.get("user"),
                            "extra": extra_data,
                        }
                    )
            except Exception as query_error:
                logger.error(f"[QUERY ERROR]: {query_error} - Query: {item.get('query')}")
                continue

        exclude_ai_models = build_exclude_ai_models_from_rows(models)
        worklist_extra = {**extra, "ExcludeAiModels": exclude_ai_models} if exclude_ai_models else dict(extra)
        ai_exclude_condition = build_exclude_ai_models_condition(worklist_extra)
        extra_conditions_worklist = merge_sql_conditions(extra_conditions, ai_exclude_condition)

        # Tags
        cursor.execute(
            append_where(
                """
                SELECT DISTINCT Category
                FROM CUSTOM_ALL
                ORDER BY Category;
                """,
                extra_conditions,
            )
        )
        rows = cursor.fetchall() or []
        tags = []
        for row in rows:
            category_value = (row.get("Category") or "").strip()
            if category_value:
                tags.append(category_value)
            else:
                tags.append(delinquent_label)

        # Counts
        cursor.execute(
            append_where(
                """
                SELECT
                    COUNT(CASE WHEN (Category != 'Contractual Adj' AND Category != 'Patient Resp'
                        AND Category IS NOT NULL AND TRIM(Category) != '' AND Automation = 0) THEN 1 ELSE NULL END) cnt1,
                    COUNT(CASE WHEN Category = 'Contractual Adj' AND Automation = 0 THEN 1 ELSE NULL END) cnt2,
                    COUNT(CASE WHEN Category = 'Patient Resp' AND Automation = 0 THEN 1 ELSE NULL END) cnt3,
                    COUNT(CASE WHEN (Category IS NULL OR TRIM(Category) = '') AND Automation = 0 THEN 1 ELSE NULL END) cnt4,
                    COUNT(CASE WHEN Automation != 0 THEN 1 ELSE NULL END) cnt6,
                    COUNT(1) cnt7,
                    SUM(CASE WHEN (Category != 'Contractual Adj' AND Category != 'Patient Resp'
                        AND Category IS NOT NULL AND TRIM(Category) != '') THEN Amount ELSE 0 END) amount1,
                    SUM(CASE WHEN Category = 'Contractual Adj' THEN Amount ELSE 0 END) amount2,
                    SUM(CASE WHEN Category = 'Patient Resp' THEN Amount ELSE 0 END) amount3,
                    SUM(CASE WHEN (Category IS NULL OR TRIM(Category) = '') THEN Amount ELSE 0 END) amount4
                FROM CUSTOM_ALL;
                """,
                extra_conditions_worklist,
            )
        )
        counts = cursor.fetchone() or {}

        # Statistics
        cursor.execute(
            append_where(
                """
                SELECT
                    Category AS label,
                    COUNT(ID) AS value
                FROM CUSTOM_ALL
                WHERE Category IS NOT NULL
                    AND TRIM(Category) != ''
                    AND Category != 'Patient Resp'
                    AND Category != 'Contractual Adj'
                GROUP BY Category
                """,
                extra_conditions_worklist,
            )
        )
        statistics = cursor.fetchall() or []

        # Payers
        cursor.execute(
            append_where(
                """
                SELECT DISTINCT PayerName
                FROM CUSTOM_ALL
                WHERE PayerName IS NOT NULL
                ORDER BY PayerName;
                """,
                extra_conditions,
            )
        )
        payers = cursor.fetchall() or []

        # Recovery
        recovery = [
            {"count": 0, "amount": 0},
            {"count": 0, "amount": 0},
            {"count": 0, "amount": 0},
            {"count": 0, "amount": 0},
        ]

        cursor.execute(
            append_where(
                """
                SELECT
                    SUM(recoverable_amount) amount,
                    COUNT(1) cnt
                FROM denial_actions;
                """,
                "",
            )
        )
        row = cursor.fetchone() or {}
        recovery[0]["count"] = row.get("cnt")
        recovery[0]["amount"] = row.get("amount")

        cursor.execute(
            append_where(
                """
                SELECT
                    SUM(Amount) amount,
                    COUNT(1) cnt
                FROM CUSTOM_ALL
                WHERE EXISTS (
                    SELECT 1
                    FROM actions
                    WHERE actions.ClaimNo=CUSTOM_ALL.ClaimNo
                );
                """,
                extra_conditions_worklist,
            )
        )
        row = cursor.fetchone() or {}
        recovery[1]["count"] = row.get("cnt")
        recovery[1]["amount"] = row.get("amount")

        cursor.execute(
            append_where(
                """
                SELECT
                    SUM(Amount) amount,
                    COUNT(1) cnt
                FROM CUSTOM_ALL
                WHERE CUSTOM_ALL.Automation!=0;
                """,
                extra_conditions_worklist,
            )
        )
        row = cursor.fetchone() or {}
        recovery[2]["count"] = row.get("cnt")
        recovery[2]["amount"] = row.get("amount")

        cursor.execute(
            append_where(
                """
                SELECT
                    SUM(OverturnAmount) amount,
                    COUNT(1) cnt
                FROM CUSTOM_ALL
                WHERE CUSTOM_ALL.Recovery=1;
                """,
                extra_conditions_worklist,
            )
        )
        row = cursor.fetchone() or {}
        recovery[3]["count"] = row.get("cnt")
        recovery[3]["amount"] = row.get("amount")

        # Grouped data (nav badges)
        grouped_payload = {}
        target_tabs = []
        if isinstance(tab_indexes, list) and len(tab_indexes) > 0:
            target_tabs = list(dict.fromkeys(tab_indexes))

        allowed_categories = extra.get("AllowedCategories") or []
        allowed_set = [str(item).strip() for item in allowed_categories if item]
        patient_payment_expr = get_custom_all_patient_payment_expr(cursor, db_name)
        custom_all_columns = get_existing_columns(cursor, db_name, "CUSTOM_ALL")
        actions_columns = get_existing_columns(cursor, db_name, "actions")
        priority_helpers = build_priority_helpers(custom_all_columns, actions_columns, patient_payment_expr)

        for tab in target_tabs:
            base_from_sql = newGenerateSQL(
                tab,
                keyword,
                [],
                startDate,
                endDate,
                code,
                remark,
                procedure,
                pos,
                worklist_extra,
                "",
                False,
            )
            if allowed_set:
                allowed_list = ", ".join(
                    ["'{}'".format(str(item).replace("'", "''")) for item in allowed_set]
                )
                allow_delinquent = delinquent_label in allowed_set
                if allow_delinquent:
                    base_from_sql += f"""
                        AND (
                            CUSTOM_ALL.Category IN ({allowed_list})
                            OR CUSTOM_ALL.Category IS NULL
                            OR TRIM(CUSTOM_ALL.Category) = ''
                        )
                    """
                else:
                    base_from_sql += f"""
                        AND CUSTOM_ALL.Category IN ({allowed_list})
                    """
            generatedSQL = build_category_grouped_count_sql(
                delinquent_safe,
                base_from_sql,
                priority_helpers,
            )

            cursor.execute(generatedSQL)
            rows = cursor.fetchall() or []
            grouped_payload[str(tab)] = rows

        # Pend 277 / Pend 835 counts (claim status badges)
        pend_counts = {"pend277": 0, "pend835": 0}
        try:
            pend277_extra = {**worklist_extra, "Pend277": True, "IncludeAllCategories": True}
            pend835_extra = {**worklist_extra, "Pend835": True, "IncludeAllCategories": True}
            pend277_sql = f"""select
                count(ID) AS cnt
                {newGenerateSQL(
                    6,
                    keyword,
                    [],
                    startDate,
                    endDate,
                    code,
                    remark,
                    procedure,
                    pos,
                    pend277_extra,
                    ""
                )}"""
            cursor.execute(pend277_sql)
            row = cursor.fetchone() or {}
            pend_counts["pend277"] = row.get("cnt") or 0

            pend835_sql = f"""select
                count(ID) AS cnt
                {newGenerateSQL(
                    6,
                    keyword,
                    [],
                    startDate,
                    endDate,
                    code,
                    remark,
                    procedure,
                    pos,
                    pend835_extra,
                    ""
                )}"""
            cursor.execute(pend835_sql)
            row = cursor.fetchone() or {}
            pend_counts["pend835"] = row.get("cnt") or 0
        except Exception as pend_error:
            logger.warning(f"Failed to compute pend counts: {pend_error}")

        payment_posting_categories = {"Contractual Adj", "Payment", "Write-off", "Refund"}
        payment_variance_categories = {"Payer Overpaid", "Payer Underpaid"}

        def dashboard_category_source_tab(category):
            category_value = (category or "").strip()
            if category_value in payment_posting_categories:
                return "1"
            if category_value == "Patient Resp":
                return "2"
            if category_value in payment_variance_categories:
                return "4"
            return "6"

        ar_by_category_map = {}
        for tab in target_tabs:
            for row in grouped_payload.get(str(tab), []):
                category_value = (row.get("Category") or "").strip()
                if not category_value:
                    continue
                if dashboard_category_source_tab(category_value) != str(tab):
                    continue
                ar_by_category_map[category_value] = {
                    "Category": category_value,
                    "Count": row.get("Count") or 0,
                    "Charge": row.get("Charge") or 0,
                }
        ar_by_category = list(ar_by_category_map.values())

        result = {
            "tags": tags,
            "counts": counts,
            "statistics": statistics,
            "payers": payers,
            "recovery": recovery,
            "models": models,
            "grouped": grouped_payload,
            "pendCounts": pend_counts,
            "arByCategory": ar_by_category,
            "Call_from": request.blueprint,
            "Database": db_name,
        }

        logger.info(f"Called from: {request.blueprint}, Database: {db_name}")
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"[ERROR]: {e}")
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)
        _end = time.time()
        logger.info(f"/platform_bootstrap took {_end - _start:.2f} seconds")
