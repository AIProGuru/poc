import json
import logging
import re
from datetime import date, datetime, timedelta
from typing import Any, List, Optional

from api.platform.launchpad.stratification_details import first_existing_column, get_existing_columns
from core.schema_cache import invalidate_table_columns

logger = logging.getLogger(__name__)

TICKLE_COLUMN_CANDIDATES = [
    "TickleDate",
    "TickleTime",
    "TickleAt",
    "FollowUpDate",
    "NextActionDate",
    "NextWorkDate",
]

ACTION_DATE_CANDIDATES = ["ActionDate", "action_date", "Action_Date"]
ACTION_TAKEN_CANDIDATES = ["ActionTaken", "action_taken", "Action_Taken"]


def resolve_tickle_column(custom_all_columns: set) -> Optional[str]:
    return first_existing_column(custom_all_columns, TICKLE_COLUMN_CANDIDATES)


def ensure_tickle_column(cursor, db_name: str) -> Optional[str]:
    """Return an existing tickle column, creating TickleDate when none exists."""
    columns = get_existing_columns(cursor, db_name, "CUSTOM_ALL")
    existing = resolve_tickle_column(columns)
    if existing:
        return existing

    try:
        cursor.execute("ALTER TABLE CUSTOM_ALL ADD COLUMN TickleDate DATE NULL")
        invalidate_table_columns(db_name, "CUSTOM_ALL")
    except Exception as exc:
        logger.warning("Unable to add TickleDate to CUSTOM_ALL: %s", exc)
        return None

    columns = get_existing_columns(cursor, db_name, "CUSTOM_ALL")
    return resolve_tickle_column(columns)


def default_tickle_date(days: int = 7) -> str:
    return (date.today() + timedelta(days=max(days, 1))).strftime("%Y-%m-%d")


def parse_tickle_days(tickle_time: str) -> Optional[int]:
    if not tickle_time:
        return None
    raw = str(tickle_time).strip().lower()
    if not raw:
        return None
    match = re.search(r"(\d+)", raw)
    if not match:
        return None
    days = int(match.group(1))
    return days if days > 0 else None


def compute_tickle_date(tickle_time: str, explicit_date: Optional[str] = None) -> Optional[str]:
    if explicit_date:
        parsed = str(explicit_date).strip()
        if parsed:
            for fmt in ("%Y-%m-%d", "%m/%d/%Y"):
                try:
                    return datetime.strptime(parsed, fmt).strftime("%Y-%m-%d")
                except ValueError:
                    continue
            return parsed[:10]
    days = parse_tickle_days(tickle_time)
    if days is None:
        return None
    return (date.today() + timedelta(days=days)).strftime("%Y-%m-%d")


def extract_selected_actions(action_payload: Any) -> List[str]:
    if isinstance(action_payload, dict):
        selected = action_payload.get("selected") or []
        return [str(item).strip() for item in selected if str(item).strip()]
    raw = str(action_payload or "").strip()
    if not raw:
        return []
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        return []
    if isinstance(parsed, dict):
        selected = parsed.get("selected") or []
        return [str(item).strip() for item in selected if str(item).strip()]
    return []


def resolve_tickle_time_for_actions(cursor, selected_actions: List[str]) -> str:
    """Return the tickle_time with the longest interval among selected action codes."""
    if not selected_actions:
        return ""
    placeholders = ", ".join(["%s"] * len(selected_actions))
    cursor.execute(
        f"""
        SELECT tickle_time
        FROM claim_action_items
        WHERE is_active = 1
          AND action_label IN ({placeholders})
          AND tickle_time IS NOT NULL
          AND TRIM(tickle_time) <> ''
        """,
        tuple(selected_actions),
    )
    rows = cursor.fetchall() or []
    best_time = ""
    best_days = -1
    for row in rows:
        tickle_time = (row.get("tickle_time") or "").strip()
        days = parse_tickle_days(tickle_time)
        if days is not None and days > best_days:
            best_days = days
            best_time = tickle_time
    return best_time


def resolve_tickle_date_for_triage(
    cursor,
    action_payload: Any,
    explicit_date: Optional[str] = None,
    explicit_tickle_time: Optional[str] = None,
) -> str:
    selected_actions = extract_selected_actions(action_payload)
    tickle_time = explicit_tickle_time or resolve_tickle_time_for_actions(cursor, selected_actions)
    tickle_date = compute_tickle_date(tickle_time, explicit_date)
    return tickle_date or default_tickle_date(7)


def sync_custom_all_after_action(
    cursor,
    db_name: str,
    claimno: str,
    action_date: str,
    claim_status: str,
    tickle_date: Optional[str],
) -> None:
    """Mirror triage action metadata onto CUSTOM_ALL for worklist filtering."""
    custom_all_columns = get_existing_columns(cursor, db_name, "CUSTOM_ALL")
    action_date_column = first_existing_column(custom_all_columns, ACTION_DATE_CANDIDATES)
    action_taken_column = first_existing_column(custom_all_columns, ACTION_TAKEN_CANDIDATES)
    tickle_column = ensure_tickle_column(cursor, db_name)

    set_parts = []
    params = []

    if action_date_column and action_date:
        set_parts.append(f"`{action_date_column}` = %s")
        params.append(action_date)
    if action_taken_column and claim_status:
        set_parts.append(f"`{action_taken_column}` = %s")
        params.append(claim_status)
    if tickle_column and tickle_date:
        set_parts.append(f"`{tickle_column}` = %s")
        params.append(tickle_date)

    if not set_parts:
        logger.warning("No CUSTOM_ALL columns available to sync action for claim %s", claimno)
        return

    params.append(claimno)
    cursor.execute(
        f"UPDATE CUSTOM_ALL SET {', '.join(set_parts)} WHERE ClaimNo = %s",
        tuple(params),
    )
