from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    attendee_id = Column(Integer, ForeignKey("attendees.id", ondelete="CASCADE"), nullable=False, index=True)
    is_present = Column(Boolean, nullable=False, default=False)
    marked_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    event = relationship("Event", back_populates="attendance_records")
    attendee = relationship("Attendee", back_populates="attendance")

    # Prevent duplicate attendance records for the same attendee and event
    __table_args__ = (
        UniqueConstraint("event_id", "attendee_id", name="uq_event_attendee_attendance"),
    )
