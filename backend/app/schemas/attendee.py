from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class AttendeeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Full name of attendee")
    email: EmailStr = Field(..., description="Email address")
    phone: Optional[str] = Field(None, max_length=50, description="Contact phone number")
    organization: Optional[str] = Field(None, max_length=255, description="Company or organization")


class AttendeeCreate(AttendeeBase):
    pass


class AttendeeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    organization: Optional[str] = Field(None, max_length=255)


class AttendeeResponse(AttendeeBase):
    id: int
    event_id: int
    event_name: Optional[str] = None
    is_present: Optional[bool] = None

    class Config:
        from_attributes = True
