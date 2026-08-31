from datetime import date, time
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class EventBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Name of the event")
    description: Optional[str] = Field(None, description="Detailed description of the event")
    date: date = Field(..., description="Event date (YYYY-MM-DD)")
    start_time: time = Field(..., description="Event start time (HH:MM:SS)")
    end_time: time = Field(..., description="Event end time (HH:MM:SS)")
    location: str = Field(..., min_length=1, max_length=255, description="Location or venue")

    @field_validator("end_time")
    def validate_times(cls, v, info):
        if "start_time" in info.data and v <= info.data["start_time"]:
            raise ValueError("end_time must be after start_time")
        return v


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    location: Optional[str] = Field(None, min_length=1, max_length=255)


class EventResponse(EventBase):
    id: int
    total_attendees: Optional[int] = 0
    present_count: Optional[int] = 0
    absent_count: Optional[int] = 0
    attendance_rate: Optional[float] = 0.0

    class Config:
        from_attributes = True
