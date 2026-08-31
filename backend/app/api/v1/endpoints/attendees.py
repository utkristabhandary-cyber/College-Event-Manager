from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.schemas.attendee import AttendeeCreate, AttendeeUpdate, AttendeeResponse
from app.services.attendee_service import AttendeeService

router = APIRouter()


@router.get("/attendees", response_model=List[AttendeeResponse], summary="List all attendees across events")
def read_all_attendees(
    search: Optional[str] = Query(None, description="Search by name, email, or organization"),
    organization: Optional[str] = Query(None, description="Filter by organization"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Retrieve all attendees across all events with optional search and filtering."""
    return AttendeeService.get_all(
        db=db,
        search=search,
        organization=organization,
        skip=skip,
        limit=limit
    )


@router.get("/events/{event_id}/attendees", response_model=List[AttendeeResponse], summary="List attendees for an event")
def read_attendees(
    event_id: int,
    search: Optional[str] = Query(None, description="Search by name, email, or organization"),
    organization: Optional[str] = Query(None, description="Filter by organization"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Retrieve attendees for a specific event with optional search and filtering."""
    return AttendeeService.get_by_event(
        db=db,
        event_id=event_id,
        search=search,
        organization=organization,
        skip=skip,
        limit=limit
    )


@router.post("/events/{event_id}/attendees", response_model=AttendeeResponse, status_code=status.HTTP_201_CREATED, summary="Add attendee to event")
def create_attendee(
    event_id: int,
    attendee_in: AttendeeCreate,
    db: Session = Depends(get_db)
):
    """Add a new attendee to an event. Prevents duplicate email within the event."""
    return AttendeeService.create(db=db, event_id=event_id, attendee_in=attendee_in)


@router.put("/attendees/{attendee_id}", response_model=AttendeeResponse, summary="Update attendee information")
def update_attendee(
    attendee_id: int,
    attendee_in: AttendeeUpdate,
    db: Session = Depends(get_db)
):
    """Update name, email, phone, or organization of an attendee."""
    return AttendeeService.update(db=db, attendee_id=attendee_id, attendee_in=attendee_in)


@router.delete("/attendees/{attendee_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete an attendee")
def delete_attendee(
    attendee_id: int,
    db: Session = Depends(get_db)
):
    """Delete an attendee and their attendance records."""
    deleted = AttendeeService.delete(db=db, attendee_id=attendee_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendee not found")
    return None
