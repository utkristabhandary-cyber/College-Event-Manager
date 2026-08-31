from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.session import Base


class Attendee(Base):
    __tablename__ = "attendees"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    phone_number = Column(String(50), nullable=False)
    section = Column(String(50), nullable=False, index=True)
    semester = Column(String(50), nullable=False, index=True)

    # Relationships
    event = relationship("Event", back_populates="attendees")
    attendance = relationship("Attendance", back_populates="attendee", uselist=False, cascade="all, delete-orphan")

    # Prevent duplicate attendee email for the same event
    __table_args__ = (
        UniqueConstraint("event_id", "email", name="uq_event_attendee_email"),
    )
