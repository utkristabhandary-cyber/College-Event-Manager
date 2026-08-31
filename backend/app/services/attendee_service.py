from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from fastapi import HTTPException, status
from app.models.attendee import Attendee
from app.models.attendance import Attendance
from app.models.event import Event
from app.schemas.attendee import AttendeeCreate, AttendeeUpdate, AttendeeResponse


class AttendeeService:
    @staticmethod
    def _to_response(attendee: Attendee) -> AttendeeResponse:
        is_present = attendee.attendance.is_present if attendee.attendance else False
        event_name = attendee.event.name if attendee.event else None
        return AttendeeResponse(
            id=attendee.id,
            event_id=attendee.event_id,
            event_name=event_name,
            name=attendee.name,
            email=attendee.email,
            phone_number=attendee.phone_number,
            section=attendee.section,
            semester=attendee.semester,
            is_present=is_present,
        )

    @classmethod
    def _apply_filters(
        cls,
        query,
        search: Optional[str] = None,
        section: Optional[str] = None,
        semester: Optional[str] = None,
    ):
        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Attendee.name.ilike(search_pattern),
                    Attendee.email.ilike(search_pattern),
                    Attendee.phone_number.ilike(search_pattern),
                )
            )

        if section:
            query = query.filter(Attendee.section.ilike(f"%{section.strip()}%"))

        if semester:
            query = query.filter(Attendee.semester == semester.strip())

        return query

    @classmethod
    def get_all(
        cls,
        db: Session,
        search: Optional[str] = None,
        section: Optional[str] = None,
        semester: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[AttendeeResponse]:
        query = cls._apply_filters(
            db.query(Attendee),
            search=search,
            section=section,
            semester=semester,
        )
        attendees = query.order_by(Attendee.name.asc()).offset(skip).limit(limit).all()
        return [cls._to_response(a) for a in attendees]

    @classmethod
    def get_by_event(
        cls,
        db: Session,
        event_id: int,
        search: Optional[str] = None,
        section: Optional[str] = None,
        semester: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[AttendeeResponse]:
        query = db.query(Attendee).filter(Attendee.event_id == event_id)
        query = cls._apply_filters(
            query,
            search=search,
            section=section,
            semester=semester,
        )
        attendees = query.order_by(Attendee.name.asc()).offset(skip).limit(limit).all()
        return [cls._to_response(a) for a in attendees]

    @classmethod
    def create(cls, db: Session, event_id: int, attendee_in: AttendeeCreate) -> AttendeeResponse:
        # Check if event exists
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

        # Check for duplicate email within the same event
        existing = db.query(Attendee).filter(
            Attendee.event_id == event_id,
            Attendee.email == attendee_in.email
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Attendee with email '{attendee_in.email}' is already registered for this event"
            )

        attendee = Attendee(
            event_id=event_id,
            name=attendee_in.name,
            email=attendee_in.email,
            phone_number=attendee_in.phone_number,
            section=attendee_in.section,
            semester=attendee_in.semester,
        )
        db.add(attendee)
        db.flush()

        attendance = Attendance(
            event_id=event_id,
            attendee_id=attendee.id,
            is_present=False
        )
        db.add(attendance)
        db.commit()
        db.refresh(attendee)

        return cls._to_response(attendee)

    @classmethod
    def update(cls, db: Session, attendee_id: int, attendee_in: AttendeeUpdate) -> AttendeeResponse:
        attendee = db.query(Attendee).filter(Attendee.id == attendee_id).first()
        if not attendee:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendee not found")

        if attendee_in.email and attendee_in.email != attendee.email:
            existing = db.query(Attendee).filter(
                Attendee.event_id == attendee.event_id,
                Attendee.email == attendee_in.email,
                Attendee.id != attendee_id
            ).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Email '{attendee_in.email}' is already registered by another attendee for this event"
                )

        update_data = attendee_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(attendee, field, value)

        db.commit()
        db.refresh(attendee)
        return cls._to_response(attendee)

    @classmethod
    def delete(cls, db: Session, attendee_id: int) -> bool:
        attendee = db.query(Attendee).filter(Attendee.id == attendee_id).first()
        if not attendee:
            return False
        db.delete(attendee)
        db.commit()
        return True
