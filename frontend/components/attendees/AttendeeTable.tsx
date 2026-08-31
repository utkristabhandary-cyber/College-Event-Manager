'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, Building, CheckCircle2, XCircle, Edit3, Trash2, Calendar } from 'lucide-react';
import { AttendeeItem } from '@/types';

interface AttendeeTableProps {
  attendees: AttendeeItem[];
  showEventName?: boolean;
  onToggleAttendance?: (attendee: AttendeeItem) => void;
  onEditAttendee?: (attendee: AttendeeItem) => void;
  onDeleteAttendee?: (attendee: AttendeeItem) => void;
}

export const AttendeeTable: React.FC<AttendeeTableProps> = ({
  attendees,
  showEventName = false,
  onToggleAttendance,
  onEditAttendee,
  onDeleteAttendee,
}) => {
  return (
    <div className="overflow-x-auto">
      <table id="attendees-table" className="w-full text-left text-xs text-slate-700">
        <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
          <tr>
            <th scope="col" className="px-6 py-3">
              Attendee
            </th>
            {showEventName && (
              <th scope="col" className="px-6 py-3">
                Event
              </th>
            )}
            <th scope="col" className="px-6 py-3">
              Contact
            </th>
            <th scope="col" className="px-6 py-3">
              Section
            </th>
            <th scope="col" className="px-6 py-3">
              Semester
            </th>
            <th scope="col" className="px-6 py-3 text-center">
              Attendance Status
            </th>
            {(onEditAttendee || onDeleteAttendee) && (
              <th scope="col" className="px-6 py-3 text-right">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {attendees.map((attendee) => (
            <tr
              key={attendee.id}
              id={`attendee-row-${attendee.id}`}
              className="hover:bg-slate-50 transition-colors"
            >
              {/* Attendee Name */}
              <td className="px-6 py-4">
                <div className="font-semibold text-slate-900 text-sm">{attendee.name}</div>
                <div className="text-slate-400 text-xs sm:hidden flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3" />
                  <span>{attendee.email}</span>
                </div>
              </td>

              {/* Event Name (if cross-event directory) */}
              {showEventName && (
                <td className="px-6 py-4">
                  {attendee.event_name ? (
                    <Link
                      href={`/events/${attendee.event_id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{attendee.event_name}</span>
                    </Link>
                  ) : (
                    <span className="text-slate-400 italic">Event #{attendee.event_id}</span>
                  )}
                </td>
              )}

              {/* Email & Phone */}
              <td className="px-6 py-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{attendee.email}</span>
                  </div>
                  {attendee.phone_number && (
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{attendee.phone_number}</span>
                    </div>
                  )}
                </div>
              </td>

              {/* Section */}
              <td className="px-6 py-4">
                {attendee.section ? (
                  <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
                    <Building className="w-3 h-3 text-slate-400" />
                    <span>{attendee.section}</span>
                  </span>
                ) : (
                  <span className="text-slate-400 italic">None</span>
                )}
              </td>

              {/* Semester */}
              <td className="px-6 py-4">
                {attendee.semester ? (
                  <span className="text-slate-600 font-medium">{attendee.semester}</span>
                ) : (
                  <span className="text-slate-400 italic">None</span>
                )}
              </td>

              {/* Attendance Status Toggle */}
              <td className="px-6 py-4 text-center">
                {onToggleAttendance ? (
                  <button
                    id={`toggle-attendance-btn-${attendee.id}`}
                    onClick={() => onToggleAttendance(attendee)}
                    title={`Click to mark ${attendee.is_present ? 'Absent' : 'Present'}`}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500 shadow-2xs ${
                      attendee.is_present
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {attendee.is_present ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Present</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>Absent</span>
                      </>
                    )}
                  </button>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      attendee.is_present
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {attendee.is_present ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Present</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>Absent</span>
                      </>
                    )}
                  </span>
                )}
              </td>

              {/* Actions */}
              {(onEditAttendee || onDeleteAttendee) && (
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {onEditAttendee && (
                      <button
                        id={`edit-attendee-btn-${attendee.id}`}
                        onClick={() => onEditAttendee(attendee)}
                        title="Edit attendee"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDeleteAttendee && (
                      <button
                        id={`delete-attendee-btn-${attendee.id}`}
                        onClick={() => onDeleteAttendee(attendee)}
                        title="Remove attendee"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
