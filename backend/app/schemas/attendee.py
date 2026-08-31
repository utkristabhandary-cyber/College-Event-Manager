from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class AttendeeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Full name of participant")
    email: EmailStr = Field(..., description="Email address")
    phone_number: str = Field(..., min_length=1, max_length=50, description="Contact phone number")
    section: str = Field(..., min_length=1, max_length=50, description="Section of the participant")
    semester: str = Field(..., min_length=1, max_length=50, description="Semester of the participant")


class AttendeeCreate(AttendeeBase):
    pass


class AttendeeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = Field(None, min_length=1, max_length=50)
    section: Optional[str] = Field(None, min_length=1, max_length=50)
    semester: Optional[str] = Field(None, min_length=1, max_length=50)


class AttendeeResponse(AttendeeBase):
    id: int
    event_id: int
    event_name: Optional[str] = None
    is_present: Optional[bool] = None

    class Config:
        from_attributes = True
