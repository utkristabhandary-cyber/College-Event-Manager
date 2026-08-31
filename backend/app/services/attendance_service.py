from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List
from app.models.attendance import Attendance
from app.models.attendee import Attendee
from app.models.event import Event
from app.schemas.attendance import AttendanceResponse, AttendanceUpdate


class AttendanceService:
    @classmethod
    def get_event_attendance(cls, db: Session, event_id: int) -> List[AttendanceResponse]:
        records = db.query(Attendance).filter(Attendance.event_id == event_id).all()
        return [
            AttendanceResponse(
                id=r.id,
                event_id=r.event_id,
                attendee_id=r.attendee_id,
                is_present=r.is_present,
                marked_at=r.marked_at,
            )
            for r in records
        ]

    @classmethod
    def mark_attendance(
        cls,
        db: Session,
        event_id: int,
        attendee_id: int,
        attendance_in: AttendanceUpdate
    ) -> AttendanceResponse:
        # Check event and attendee validity
        attendee = db.query(Attendee).filter(
            Attendee.id == attendee_id,
            Attendee.event_id == event_id
        ).first()
        if not attendee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Attendee not found for this event"
            )

        attendance = db.query(Attendance).filter(
            Attendance.event_id == event_id,
            Attendance.attendee_id == attendee_id
        ).first()

        if not attendance:
            attendance = Attendance(
                event_id=event_id,
                attendee_id=attendee_id,
                is_present=attendance_in.is_present,
            )
            db.add(attendance)
        else:
            attendance.is_present = attendance_in.is_present

        db.commit()
        db.refresh(attendance)

        return AttendanceResponse(
            id=attendance.id,
            event_id=attendance.event_id,
            attendee_id=attendance.attendee_id,
            is_present=attendance.is_present,
            marked_at=attendance.marked_at,
        )
