from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.dashboard import DashboardOverview
from app.services.event_service import EventService
from app.models.event import Event
from app.models.attendee import Attendee
from app.models.attendance import Attendance

router = APIRouter()


@router.get("/overview", response_model=DashboardOverview, summary="Get global dashboard statistics")
def get_dashboard_overview(db: Session = Depends(get_db)):
    """Compute and retrieve aggregated statistics across all events."""
    events = EventService.get_all(db=db)
    total_events = len(events)
    total_attendees = db.query(Attendee).count()
    total_present = db.query(Attendance).filter(Attendance.is_present == True).count()
    total_absent = max(0, total_attendees - total_present)
    overall_rate = round((total_present / total_attendees * 100), 1) if total_attendees > 0 else 0.0

    return DashboardOverview(
        total_events=total_events,
        total_attendees=total_attendees,
        total_present=total_present,
        total_absent=total_absent,
        overall_attendance_rate=overall_rate,
        events=events
    )
