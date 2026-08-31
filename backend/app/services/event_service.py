from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.models.event import Event
from app.models.attendee import Attendee
from app.models.attendance import Attendance
from app.schemas.event import EventCreate, EventUpdate, EventResponse


class EventService:
    @staticmethod
    def get_event_with_stats(db: Session, event: Event) -> EventResponse:
        total_attendees = db.query(Attendee).filter(Attendee.event_id == event.id).count()
        present_count = (
            db.query(Attendance)
            .filter(Attendance.event_id == event.id, Attendance.is_present == True)
            .count()
        )
        # Absent includes those explicitly marked is_present=False or registered but not present
        absent_count = max(0, total_attendees - present_count)
        rate = round((present_count / total_attendees * 100), 1) if total_attendees > 0 else 0.0

        return EventResponse(
            id=event.id,
            name=event.name,
            description=event.description,
            date=event.date,
            start_time=event.start_time,
            end_time=event.end_time,
            location=event.location,
            total_attendees=total_attendees,
            present_count=present_count,
            absent_count=absent_count,
            attendance_rate=rate,
        )

    @classmethod
    def get_all(cls, db: Session, skip: int = 0, limit: int = 100) -> List[EventResponse]:
        events = db.query(Event).order_by(Event.date.desc(), Event.start_time.desc()).offset(skip).limit(limit).all()
        return [cls.get_event_with_stats(db, e) for e in events]

    @classmethod
    def get_by_id(cls, db: Session, event_id: int) -> Optional[EventResponse]:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            return None
        return cls.get_event_with_stats(db, event)

    @classmethod
    def create(cls, db: Session, event_in: EventCreate) -> EventResponse:
        event = Event(
            name=event_in.name,
            description=event_in.description,
            date=event_in.date,
            start_time=event_in.start_time,
            end_time=event_in.end_time,
            location=event_in.location,
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return cls.get_event_with_stats(db, event)

    @classmethod
    def update(cls, db: Session, event_id: int, event_in: EventUpdate) -> Optional[EventResponse]:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            return None
        
        update_data = event_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(event, field, value)
        
        db.commit()
        db.refresh(event)
        return cls.get_event_with_stats(db, event)

    @classmethod
    def delete(cls, db: Session, event_id: int) -> bool:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            return False
        db.delete(event)
        db.commit()
        return True
