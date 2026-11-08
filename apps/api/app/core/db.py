from collections.abc import Iterator
from pathlib import Path

import psycopg
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from app.core.config import API_ROOT, get_settings

MIGRATIONS_DIR = API_ROOT / "migrations"

_pool: ConnectionPool | None = None


def get_pool() -> ConnectionPool:
    global _pool
    if _pool is None:
        _pool = ConnectionPool(
            get_settings().database_url,
            min_size=1,
            max_size=10,
            kwargs={"row_factory": dict_row},
            open=True,
        )
    return _pool


def close_pool() -> None:
    global _pool
    if _pool is not None:
        _pool.close()
        _pool = None


def get_conn() -> Iterator[psycopg.Connection]:
    """FastAPI dependency: one pooled connection per request, committed on success."""
    with get_pool().connection() as conn:
        yield conn


def migrate(
    database_url: str | None = None, migrations_dir: Path = MIGRATIONS_DIR
) -> list[str]:
    """Apply pending numbered .sql files in order. Returns the versions applied."""
    applied: list[str] = []
    with psycopg.connect(
        database_url or get_settings().database_url, autocommit=True
    ) as conn:
        conn.execute(
            "create table if not exists schema_migrations ("
            " version text primary key, applied_at timestamptz not null default now())"
        )
        done = {row[0] for row in conn.execute("select version from schema_migrations")}
        for path in sorted(migrations_dir.glob("*.sql")):
            version = path.stem
            if version in done:
                continue
            with conn.transaction():
                conn.execute(path.read_text())
                conn.execute(
                    "insert into schema_migrations (version) values (%s)", (version,)
                )
            applied.append(version)
    return applied


if __name__ == "__main__":
    versions = migrate()
    print(f"Applied: {', '.join(versions)}" if versions else "Database is up to date.")
