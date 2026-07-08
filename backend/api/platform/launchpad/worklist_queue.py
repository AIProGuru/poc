"""Shared active worklist rules used by table, summary, and nav badge queries."""

from typing import Dict


def build_future_tickler_filter_sql() -> str:
    """Exclude triaged claims that are waiting on a future tickler date."""
    return """
        AND NOT (
            ActionTaken IS NOT NULL
            AND LOWER(TRIM(CAST(ActionTaken AS CHAR))) = 'triage'
            AND TickleDate IS NOT NULL
            AND CURRENT_DATE() < DATE(TickleDate)
        )
    """


def build_active_queue_where_sql() -> str:
    """Unresolved claims only; resolved is balance = 0."""
    return f"""
        WHERE ROUND(Balance, 2) <> 0
        {build_future_tickler_filter_sql()}
    """


def build_is_overdue_sql(tickle_date_expr: str) -> str:
    return f"""
        CASE
            WHEN {tickle_date_expr} IS NOT NULL
             AND CURRENT_DATE() >= {tickle_date_expr}
                THEN 1
            ELSE 0
        END
    """


def build_priority_order_sql() -> str:
    """Overdue triaged claims surface at the top of their category worklist."""
    return """
        CASE
            WHEN IsOverdue = 1 AND LOWER(COALESCE(ActionTaken, '')) = 'triage' THEN 0
            ELSE 1
        END ASC,
        IsOverdue DESC,
        CASE WHEN IsOverdue = 1 THEN TickleDate END ASC,
        HandoffFlag DESC,
        CASE WHEN HandoffFlag = 1 THEN COALESCE(ActionDateParsed, LoadDate, ServiceDate, '9999-12-31') END ASC,
        CASE
            WHEN HandoffFlag = 0 AND IsOverdue = 0 AND Balance >= 25000 THEN 1
            WHEN HandoffFlag = 0 AND IsOverdue = 0 AND Balance >= 10000 THEN 2
            WHEN HandoffFlag = 0 AND IsOverdue = 0 AND Balance >= 5000 THEN 3
            WHEN HandoffFlag = 0 AND IsOverdue = 0 AND Balance >= 1000 THEN 4
            WHEN HandoffFlag = 0 AND IsOverdue = 0 AND Balance >= 100 THEN 5
            WHEN HandoffFlag = 0 AND IsOverdue = 0 AND Balance > 0 THEN 6
            WHEN HandoffFlag = 0 AND IsOverdue = 0 AND Balance < 0 THEN 7
            ELSE 8
        END ASC,
        CASE WHEN HandoffFlag = 0 AND IsOverdue = 0 THEN PayerName END ASC,
        CASE WHEN HandoffFlag = 0 AND IsOverdue = 0 THEN ROUND(Balance, 2) END DESC,
        CASE WHEN HandoffFlag = 0 AND IsOverdue = 0 THEN PrimaryProcedure END ASC,
        COALESCE(DischargeDate, ServiceDate, LoadDate, '9999-12-31') ASC,
        ClaimNo ASC
    """


def build_category_grouped_count_sql(
    delinquent_safe: str,
    base_from_sql: str,
    priority_helpers: Dict[str, str],
) -> str:
    """Grouped category counts that respect the same active-queue rules as data_all."""
    return f"""
        SELECT
            Category,
            COUNT(ID) AS Count,
            SUM(Amount) AS Charge,
            SUM(AllowedAmt) AS AllowedAmt,
            SUM(DeniedAmt) AS DeniedAmt,
            AVG(AgeDays) AS Days
        FROM (
            SELECT
                CASE
                    WHEN CUSTOM_ALL.Category IS NULL OR TRIM(CUSTOM_ALL.Category) = ''
                        THEN '{delinquent_safe}'
                    ELSE CUSTOM_ALL.Category
                END AS Category,
                CUSTOM_ALL.ID AS ID,
                CUSTOM_ALL.Amount AS Amount,
                CUSTOM_ALL.AllowedAmt AS AllowedAmt,
                CUSTOM_ALL.DeniedAmt AS DeniedAmt,
                DATEDIFF(CURRENT_DATE(), CUSTOM_ALL.ServiceDate) AS AgeDays,
                {priority_helpers["balance"]} AS Balance,
                {priority_helpers["tickle_date"]} AS TickleDate,
                CUSTOM_ALL.ActionTaken AS ActionTaken
            {base_from_sql}
        ) active_queue
        {build_active_queue_where_sql()}
        GROUP BY Category
    """


def build_part1_summary_sql(base_from_sql: str, priority_helpers: Dict[str, str]) -> str:
    return f"""
        SELECT
            COUNT(ID) AS Count,
            SUM(Amount) AS Charge,
            SUM(AllowedAmt) AS AllowedAmt,
            SUM(DeniedAmt) AS DeniedAmt,
            AVG(AgeDays) AS Days
        FROM (
            SELECT
                CUSTOM_ALL.ID AS ID,
                CUSTOM_ALL.Amount AS Amount,
                CUSTOM_ALL.AllowedAmt AS AllowedAmt,
                CUSTOM_ALL.DeniedAmt AS DeniedAmt,
                DATEDIFF(CURRENT_DATE(), CUSTOM_ALL.ServiceDate) AS AgeDays,
                {priority_helpers["balance"]} AS Balance,
                {priority_helpers["tickle_date"]} AS TickleDate,
                CUSTOM_ALL.ActionTaken AS ActionTaken
            {base_from_sql}
        ) active_queue
        {build_active_queue_where_sql()}
    """


def build_part2_grouped_sql(base_from_sql: str, priority_helpers: Dict[str, str]) -> str:
    return f"""
        SELECT
            COUNT(ID) AS Count,
            PrimaryCode,
            Category,
            SUM(Amount) AS Charge,
            SUM(DeniedAmt) AS DeniedAmt,
            AVG(AgeDays) AS Days
        FROM (
            SELECT
                CUSTOM_ALL.ID AS ID,
                CUSTOM_ALL.PrimaryCode AS PrimaryCode,
                CUSTOM_ALL.Category AS Category,
                CUSTOM_ALL.Amount AS Amount,
                CUSTOM_ALL.DeniedAmt AS DeniedAmt,
                DATEDIFF(CURRENT_DATE(), CUSTOM_ALL.ServiceDate) AS AgeDays,
                {priority_helpers["balance"]} AS Balance,
                {priority_helpers["tickle_date"]} AS TickleDate,
                CUSTOM_ALL.ActionTaken AS ActionTaken
            {base_from_sql}
        ) active_queue
        {build_active_queue_where_sql()}
        GROUP BY PrimaryCode, Category
        ORDER BY PrimaryCode
    """
