import React from 'react';
import { Calendar, Clock, MapPin, Users, Edit3, Trash2, ArrowRight } from 'lucide-react';
import { EventItem } from '../types';

interface EventCardProps {
  event: EventItem;
  onSelect: (event: EventItem) => void;
  onEdit: (event: EventItem) => void;
  onDelete: (event: EventItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const total = event.total_attendees ?? 0;
  const present = event.present_count ?? 0;
  const absent = event.absent_count ?? 0;
  const rate = event.attendance_rate ?? 0;

  // Format date nicely
  const formattedDate = new Date(`${event.date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      id={`event-card-${event.id}`}
      className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all duration-150 shadow-sm group"
    >
      <div>
        {/* Card Header: Title & Action Menu */}
        <div className="flex items-start justify-between gap-3">
          <button
            id={`event-title-btn-${event.id}`}
            onClick={() => onSelect(event)}
            className="text-left group-hover:text-indigo-600 transition-colors focus:outline-none"
          >
            <h3 className="text-base font-bold text-slate-900 line-clamp-1">{event.name}</h3>
          </button>
          <div className="flex items-center gap-1 shrink-0">
            <button
              id={`event-edit-btn-${event.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(event);
              }}
              title="Edit Event"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              id={`event-delete-btn-${event.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(event);
              }}
              title="Delete Event"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}

        {/* Event Metadata (Date, Time, Location) */}
        <div className="mt-4 space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-700">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              {event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
      </div>

      {/* Attendance Stats Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-500 font-medium flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Attendees</span>
          </span>
          <div className="flex items-center gap-2.5 text-[11px] font-semibold">
            <span className="text-slate-600">Total: {total}</span>
            <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Present: {present}</span>
            <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Absent: {absent}</span>
          </div>
        </div>

        {/* Attendance Percentage Progress Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                rate >= 75 ? 'bg-emerald-600' : rate >= 40 ? 'bg-indigo-600' : 'bg-slate-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-700 shrink-0 w-9 text-right">
            {rate}%
          </span>
        </div>

        {/* Open Details Button */}
        <button
          id={`event-open-details-btn-${event.id}`}
          onClick={() => onSelect(event)}
          className="mt-3.5 w-full py-2 px-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 border border-slate-200 text-slate-700 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
        >
          <span>Manage Attendees & Attendance</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
