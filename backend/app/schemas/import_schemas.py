from typing import List, Optional
from pydantic import BaseModel, Field


class ImportRow(BaseModel):
    row_number: int
    name: str
    email: str
    phone_number: str
    section: str
    semester: str
    errors: Optional[List[str]] = None


class AttendeeImportPreview(BaseModel):
    filename: str
    detected_columns: List[str]
    ignored_column_count: int
    total_rows: int
    valid_count: int
    invalid_count: int
    duplicate_count: int
    existing_count: int
    rows: List[ImportRow]
    missing_columns: List[str] = Field(default_factory=list)


class AttendeeImportResult(BaseModel):
    processed: int
    imported: int
    invalid_skipped: int
    existing_skipped: int
    duplicate_skipped: int
