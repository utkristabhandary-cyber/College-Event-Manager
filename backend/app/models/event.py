from sqlalchemy import Column, Integer, String, Text, Date, Time
from sqlalchemy.orm import relationship
from app.db.session import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=False, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    location = Column(String(255), nullable=False)

    # Relationships
    attendees = relationship("Attendee", back_populates="event", cascade="all, delete-orphan")
    attendance_records = relationship("Attendance", back_populates="event", cascade="all, delete-orphan")
