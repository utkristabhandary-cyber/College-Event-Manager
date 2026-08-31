"""Idempotent, data-preserving schema migration.

The project does not use Alembic. Tables are normally created with
``Base.metadata.create_all``, which does not alter existing tables. This module
transforms the legacy ``attendees`` schema (``phone`` / ``organization``) into the
participant schema (``phone_number`` / ``section`` / ``semester``) in place, so
existing PostgreSQL data is preserved.

The migration is safe to run repeatedly: each step checks whether the relevant
column already exists before acting.
"""

import logging

from sqlalchemy import inspect, text

logger = logging.getLogger("app.migrations")


def _run_text(conn, statement: str):
    logger.info("DB migration: %s", statement)
    conn.execute(text(statement))


def run_schema_migration(bind) -> None:
    inspector = inspect(bind)
    tables = inspector.get_table_names()
    if "attendees" not in tables:
        return

    columns = {c["name"] for c in inspector.get_columns("attendees")}
    with bind.begin() as conn:
        # 1. Add new participant columns if missing (nullable first for safe backfill).
        if "phone_number" not in columns:
            _run_text(conn, 'ALTER TABLE attendees ADD COLUMN phone_number VARCHAR(50)')
        if "section" not in columns:
            _run_text(conn, 'ALTER TABLE attendees ADD COLUMN section VARCHAR(50)')
        if "semester" not in columns:
            _run_text(conn, 'ALTER TABLE attendees ADD COLUMN semester VARCHAR(50)')

        # 2. Backfill new columns from the legacy columns, preserving data.
        #    section <- organization value; phone_number <- phone value.
        if "organization" in columns:
            _run_text(conn, "UPDATE attendees SET section = COALESCE(NULLIF(organization, ''), '')")
        if "phone" in columns:
            _run_text(conn, "UPDATE attendees SET phone_number = COALESCE(NULLIF(phone, ''), '')")
        _run_text(conn, "UPDATE attendees SET semester = '' WHERE semester IS NULL")
        _run_text(conn, "UPDATE attendees SET section = '' WHERE section IS NULL")
        _run_text(conn, "UPDATE attendees SET phone_number = '' WHERE phone_number IS NULL")

        # 3. Drop legacy columns if they still exist.
        for legacy in ("phone", "organization"):
            if legacy in columns:
                try:
                    _run_text(conn, f"ALTER TABLE attendees DROP COLUMN {legacy}")
                except Exception as exc:  # pragma: no cover - defensive
                    logger.warning("Could not drop legacy column %s: %s", legacy, exc)

        # 4. Apply the required (NOT NULL) constraints.
        for col in ("phone_number", "section", "semester"):
            _run_text(conn, f"ALTER TABLE attendees ALTER COLUMN {col} SET NOT NULL")

    # 5. Recreate the section/semester indexes if they do not exist (create_all
    #    would not have added indexes to a pre-existing table).
    index_names = {i["name"] for i in inspector.get_indexes("attendees")}
    with bind.begin() as conn:
        if "ix_attendees_section" not in index_names:
            _run_text(conn, "CREATE INDEX IF NOT EXISTS ix_attendees_section ON attendees (section)")
        if "ix_attendees_semester" not in index_names:
            _run_text(conn, "CREATE INDEX IF NOT EXISTS ix_attendees_semester ON attendees (semester)")
