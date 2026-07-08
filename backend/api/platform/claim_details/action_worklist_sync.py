import logging
from datetime import date, timedelta
from typing import Optional

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
