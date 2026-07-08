import time
from threading import Lock
from typing import Set

_CACHE_TTL_SECONDS = 3600
_columns_cache = {}
_lock = Lock()


def invalidate_table_columns(db_name: str, table_name: str) -> None:
    cache_key = (db_name, table_name.lower())
    with _lock:
        _columns_cache.pop(cache_key, None)


def get_table_columns(cursor, db_name: str, table_name: str) -> Set[str]:
    cache_key = (db_name, table_name.lower())
    now = time.time()
    with _lock:
        cached = _columns_cache.get(cache_key)
        if cached and now - cached[0] < _CACHE_TTL_SECONDS:
            return cached[1]

    cursor.execute(
        """
        SELECT COLUMN_NAME
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = %s
          AND TABLE_NAME = %s
        """,
        (db_name, table_name),
    )
    columns = {row["COLUMN_NAME"] for row in (cursor.fetchall() or []) if row.get("COLUMN_NAME")}

    with _lock:
        _columns_cache[cache_key] = (now, columns)
    return columns


def table_has_column(cursor, db_name: str, table_name: str, column_name: str) -> bool:
    target = column_name.lower()
    return any(col.lower() == target for col in get_table_columns(cursor, db_name, table_name))
