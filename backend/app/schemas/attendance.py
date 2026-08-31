from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class AttendanceUpdate(BaseModel):
    is_present: bool = Field(..., description="Attendance status: True for present, False for absent")


class AttendanceResponse(BaseModel):
    id: int
    event_id: int
    attendee_id: int
    is_present: bool
    marked_at: Optional[datetime] = None

    class Config:
        from_attributes = True
