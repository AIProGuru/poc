from flask import Blueprint, request, jsonify
import json
import re
from db import get_connection, close_connection
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Blueprints for different APIs
rebound_api_ai = Blueprint('rebound_api_ai', __name__, url_prefix='/api/v1/rebound')
medevolve_api_ai = Blueprint('medevolve_api_ai', __name__, url_prefix='/api/v1/medevolve')
pilotcustomer_api_ai = Blueprint('pilotcustomer_api_ai', __name__, url_prefix='/api/v1/pilotcustomer')

@rebound_api_ai.route("/get_artificial_intelligence", methods=["GET", "POST"])
@medevolve_api_ai.route("/get_artificial_intelligence", methods=["GET", "POST"])
@pilotcustomer_api_ai.route("/get_artificial_intelligence", methods=["GET", "POST"])
def get_artificial_intelligence():
    """
    This endpoint fetches artificial intelligence model data.
    ---
    tags:
      - AI Automation
    responses:
      200:
        description: Successful response
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
              Title:
                type: string
              Count:
                type: integer
              Amount:
                type: number
              Code:
                type: string
              GroupCode:
                type: string
              Remark:
                type: string
              Category:
                type: string
              Status:
                type: string
              UpdatedAt:
                type: string
              User:
                type: string
              extra:
                type: object
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

        ret = []
        payload = request.get_json(silent=True) or {}
        extra = payload.get("extra", {}) or {}

        def build_extra_conditions(extra_filters):
            conditions = []
            allowed_categories = [
                (item or "").strip() for item in extra_filters.get("AllowedCategories", []) if item
            ]
            if "Pend 835" in allowed_categories:
                allowed_categories.append("Delinquent")
            allowed_categories = [item.replace("'", "''") for item in allowed_categories if item]
            if allowed_categories:
                conditions.append(
                    f"CUSTOM_ALL.Category IN ({','.join([f\"'{c}'\" for c in allowed_categories])})"
                )

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

            return " AND ".join(conditions)

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

        extra_conditions = build_extra_conditions(extra)

        q = "select * from ai_model"
        cursor.execute(q)
        queries_for_ai_model = cursor.fetchall()

        for item in queries_for_ai_model:
            query_text = item.get("query") or ""
            filtered_query = inject_conditions(query_text, extra_conditions)
            logger.info(f"Executing query: {filtered_query}")
            try:
                cursor.execute(filtered_query)
                row = cursor.fetchone()
                if row is not None:
                    try:
                        extra_data = json.loads(item["extra"])
                    except json.JSONDecodeError:
                        extra_data = {}
                    remark_codes = re.findall(r"RemarkCode='([^']+)'", query_text)
                    if remark_codes and "remarkCodes" not in extra_data:
                        extra_data["remarkCodes"] = remark_codes
                    if "denial_actions" in query_text and "Only" not in extra_data:
                        extra_data["Only"] = True

                    ret.append(
                        {
                            "id": item["id"],
                            "Title": item["title"],
                            "ModelTitle": item.get("model_title") or "",
                            "Count": row["cnt"],
                            "Amount": row["amount"],
                            "Code": row["AdjustmentReason"],
                            "GroupCode": row["AdjustmentGroup"],
                            "Remark": item["remark"],
                            "Category": row["DenialCategory"],
                            "Status": item["status"],
                            "UpdatedAt": (
                                item["updated_at"].strftime("%Y-%m-%d %H:%M:%S")
                                if item["updated_at"] is not None
                                else ""
                            ),
                            "User": item["user"],
                            "extra": extra_data,
                        }
                    )
            except Exception as query_error:
                logger.error(f"[QUERY ERROR]: {query_error} - Query: {item['query']}")
                continue

        return jsonify(ret), 200
    except Exception as e:
        logger.error(f"[ERROR]: {e}")
        return jsonify({"error": "Internal server Error"}), 500
    finally:
        close_connection(cursor, conn)
