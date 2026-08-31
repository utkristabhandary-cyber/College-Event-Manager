from pydantic import BaseModel
from typing import List
from app.schemas.event import EventResponse


class EventStats(BaseModel):
    event_id: int
    event_name: str
    total_attendees: int
    present_count: int
    absent_count: int
    attendance_rate: float


class DashboardOverview(BaseModel):
    total_events: int
    total_attendees: int
    total_present: int
    total_absent: int
    overall_attendance_rate: float
    events: List[EventResponse]
