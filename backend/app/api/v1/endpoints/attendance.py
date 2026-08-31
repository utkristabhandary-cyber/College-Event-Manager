from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.attendance import AttendanceResponse, AttendanceUpdate
from app.services.attendance_service import AttendanceService

router = APIRouter()


@router.get("/events/{event_id}/attendance", response_model=List[AttendanceResponse], summary="Get attendance records for an event")
def read_event_attendance(
    event_id: int,
    db: Session = Depends(get_db)
):
    """Retrieve all attendance tracking records for an event."""
    return AttendanceService.get_event_attendance(db=db, event_id=event_id)


@router.put("/events/{event_id}/attendees/{attendee_id}/attendance", response_model=AttendanceResponse, summary="Mark attendee present or absent")
def mark_attendance(
    event_id: int,
    attendee_id: int,
    attendance_in: AttendanceUpdate,
    db: Session = Depends(get_db)
):
    """Mark an attendee as present or absent for an event. Prevents duplicates by upserting the unique record."""
    return AttendanceService.mark_attendance(
        db=db,
        event_id=event_id,
        attendee_id=attendee_id,
        attendance_in=attendance_in
    )
