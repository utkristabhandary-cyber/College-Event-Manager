from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.services.event_service import EventService

router = APIRouter()


@router.get("", response_model=List[EventResponse], summary="Get all events with statistics")
def read_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Retrieve all events along with total attendees, present/absent count, and attendance rate."""
    return EventService.get_all(db=db, skip=skip, limit=limit)


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED, summary="Create a new event")
def create_event(
    event_in: EventCreate,
    db: Session = Depends(get_db)
):
    """Create a new event with date, time, location, and description."""
    return EventService.create(db=db, event_in=event_in)


@router.get("/{event_id}", response_model=EventResponse, summary="Get event details by ID")
def read_event(
    event_id: int,
    db: Session = Depends(get_db)
):
    """Retrieve specific event details including its computed attendance statistics."""
    event = EventService.get_by_id(db=db, event_id=event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return event


@router.put("/{event_id}", response_model=EventResponse, summary="Update event details")
def update_event(
    event_id: int,
    event_in: EventUpdate,
    db: Session = Depends(get_db)
):
    """Update fields of an existing event."""
    try:
        updated = EventService.update(db=db, event_id=event_id, event_in=event_in)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return updated


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete an event")
def delete_event(
    event_id: int,
    db: Session = Depends(get_db)
):
    """Delete an event and its cascading attendees and attendance records."""
    deleted = EventService.delete(db=db, event_id=event_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return None
