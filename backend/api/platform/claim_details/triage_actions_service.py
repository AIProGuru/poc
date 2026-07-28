import json
import logging
import re
from typing import Any, Dict, List

logger = logging.getLogger(__name__)

OTHER_ACTION_LABEL = "Other"
OTHER_SORT_ORDER = 99999
DEFAULT_OTHER_ACTION = {
    "label": OTHER_ACTION_LABEL,
    "allowFreeText": True,
    "transactionOptions": [],
}

TRIAGE_CATEGORY_GROUPS = {
    "Pend 277": ["Pend 277", "Pend277", "Claim Status"],
    "Pend 835": ["Pend 835", "Pend835"],
    "Patient Resp": ["Patient Resp", "Patient Responsibility", "Bal Due from PT", "Bal Due From PT"],
    "Eligibility": ["Eligibility"],
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
        "tickleTime": row.get("tickle_time") or "",
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


def _normalize_category_key(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", (value or "").strip().lower())


def build_category_candidates(denial_category: str, workflow: str = "") -> List[str]:
    """Return ordered category labels to try when loading governance action codes."""
    candidates: List[str] = []

    def add(*values: str) -> None:
        for value in values:
            cleaned = (value or "").strip()
            if cleaned and cleaned not in candidates:
                candidates.append(cleaned)

    add(denial_category)

    category_norm = _normalize_category_key(denial_category)
    workflow_norm = _normalize_category_key(workflow)

    if (
        workflow_norm in {"pend277", "claimstatuspend277"}
        or category_norm == "pend277"
        or "pend277" in category_norm
    ):
        add("Pend 277", "Pend277")

    if (
        workflow_norm in {"pend835", "claimstatuspend835"}
        or category_norm == "pend835"
        or "pend835" in category_norm
    ):
        add("Pend 835", "Pend835")

    if (
        workflow_norm in {"patientresp", "patientresponsibility", "balduefrompt"}
        or category_norm in {"patientresp", "patientresponsibility", "balduefrompt"}
    ):
        add("Patient Resp", "Patient Responsibility", "Bal Due from PT")

    if workflow_norm == "eligibility" or category_norm == "eligibility":
        add("Eligibility")

    for canonical, aliases in TRIAGE_CATEGORY_GROUPS.items():
        alias_norms = {_normalize_category_key(canonical)}
        alias_norms.update(_normalize_category_key(alias) for alias in aliases)
        if category_norm in alias_norms or workflow_norm in alias_norms:
            add(canonical, *aliases)

    return candidates


def _query_actions_for_category(cursor, category: str) -> List[Dict[str, Any]]:
    cursor.execute(
        """
        SELECT action_label, allow_free_text, sort_order, transaction_options, tickle_time
        FROM claim_action_items
        WHERE category = %s AND is_active = 1
        ORDER BY
          CASE WHEN LOWER(action_label) = 'other' THEN 1 ELSE 0 END,
          sort_order,
          action_label
        """,
        (category,),
    )
    return cursor.fetchall() or []


def _query_actions_case_insensitive(cursor, category: str) -> List[Dict[str, Any]]:
    cursor.execute(
        """
        SELECT action_label, allow_free_text, sort_order, transaction_options, tickle_time
        FROM claim_action_items
        WHERE is_active = 1
          AND LOWER(TRIM(category)) = LOWER(TRIM(%s))
        ORDER BY
          CASE WHEN LOWER(action_label) = 'other' THEN 1 ELSE 0 END,
          sort_order,
          action_label
        """,
        (category,),
    )
    return cursor.fetchall() or []


def _candidate_normalized_keys(candidates: List[str]) -> set:
    keys = set()
    for candidate in candidates:
        candidate_norm = _normalize_category_key(candidate)
        if candidate_norm:
            keys.add(candidate_norm)
        for canonical, aliases in TRIAGE_CATEGORY_GROUPS.items():
            alias_norms = {_normalize_category_key(canonical)}
            alias_norms.update(_normalize_category_key(alias) for alias in aliases)
            if candidate_norm in alias_norms:
                keys.update(alias_norms)
    return keys


def _query_actions_by_normalized_key(cursor, candidates: List[str]) -> List[Dict[str, Any]]:
    target_keys = _candidate_normalized_keys(candidates)
    if not target_keys:
        return []
    cursor.execute(
        """
        SELECT action_label, allow_free_text, sort_order, transaction_options, tickle_time, category
        FROM claim_action_items
        WHERE is_active = 1
        ORDER BY
          CASE WHEN LOWER(action_label) = 'other' THEN 1 ELSE 0 END,
          sort_order,
          action_label
        """
    )
    rows = cursor.fetchall() or []
    matched = [
        row
        for row in rows
        if _normalize_category_key(row.get("category") or "") in target_keys
    ]
    for row in matched:
        row.pop("category", None)
    return matched


def _apply_category_defaults(actions: List[Dict[str, Any]], category_key: str) -> List[Dict[str, Any]]:
    normalized = _normalize_category_key(category_key)
    if normalized != "pend277":
        return actions

    has_request = any(
        (item.get("label") or "").strip().lower() == "request 277" for item in actions
    )
    if has_request:
        return actions

    request_action = {
        "label": "Request 277",
        "allowFreeText": False,
        "transactionOptions": [],
        "tickleTime": "",
    }
    if actions:
        return actions[:-1] + [request_action, actions[-1]]
    return normalize_triage_actions([request_action])


def fetch_triage_actions_for_category(
    cursor,
    denial_category: str,
    workflow: str = "",
) -> List[Dict[str, Any]]:
    candidates = build_category_candidates(denial_category, workflow)
    if not candidates:
        return []

    rows: List[Dict[str, Any]] = []
    matched_category = ""

    for candidate in candidates:
        rows = _query_actions_for_category(cursor, candidate)
        if rows:
            matched_category = candidate
            break
        rows = _query_actions_case_insensitive(cursor, candidate)
        if rows:
            matched_category = candidate
            break

    if not rows:
        rows = _query_actions_by_normalized_key(cursor, candidates)
        if rows:
            matched_category = candidates[0]

    if not rows:
        return []

    actions = normalize_triage_actions(rows)
    return _apply_category_defaults(actions, matched_category or candidates[0])
