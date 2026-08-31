from fastapi import APIRouter
from app.api.v1.endpoints import events, attendees, attendance, dashboard

api_router = APIRouter()

api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(attendees.router, tags=["attendees"])
api_router.include_router(attendance.router, tags=["attendance"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
