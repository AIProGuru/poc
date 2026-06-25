import json
import logging
from typing import Any, Dict, List

logger = logging.getLogger(__name__)

OTHER_ACTION_LABEL = "Other"
OTHER_SORT_ORDER = 99999
DEFAULT_OTHER_ACTION = {
    "label": OTHER_ACTION_LABEL,
    "allowFreeText": True,
    "transactionOptions": [],
}


def is_other_action_label(label: str) -> bool:
    return (label or "").strip().lower() == OTHER_ACTION_LABEL.lower()


def _parse_transaction_options(raw_value) -> List[Dict[str, Any]]:
    if not raw_value:
        return []
    try:
        parsed = json.loads(raw_value)
        return parsed if isinstance(parsed, list) else []
    except (json.JSONDecodeError, TypeError):
        return []


def _serialize_triage_row(row: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "label": row.get("action_label") or "",
        "allowFreeText": bool(row.get("allow_free_text", 0)),
        "transactionOptions": _parse_transaction_options(row.get("transaction_options")),
    }


def normalize_triage_actions(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Return actions sorted by sort_order with Other always last; inject Other if missing."""
    regular: List[Dict[str, Any]] = []
    other_action = None

    for row in rows or []:
        serialized = _serialize_triage_row(row)
        label = serialized.get("label") or ""
        if is_other_action_label(label):
            other_action = serialized
        else:
            regular.append(serialized)

    if other_action is None:
        other_action = dict(DEFAULT_OTHER_ACTION)

    return regular + [other_action]


def fetch_triage_actions_for_category(cursor, denial_category: str) -> List[Dict[str, Any]]:
    category = (denial_category or "").strip()
    if not category:
        return []

    cursor.execute(
        """
        SELECT action_label, allow_free_text, sort_order, transaction_options
        FROM claim_action_items
        WHERE category = %s AND is_active = 1
        ORDER BY
          CASE WHEN LOWER(action_label) = 'other' THEN 1 ELSE 0 END,
          sort_order,
          action_label
        """,
        (category,),
    )
    rows = cursor.fetchall() or []
    return normalize_triage_actions(rows)
