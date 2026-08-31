import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  UserCheck,
  UserX,
  Percent,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Building,
} from 'lucide-react';
import { EventItem, AttendeeItem, AttendeeCreateInput, AttendeeUpdateInput } from '../types';
import { api } from '../services/api';
import { AttendeeModal } from './AttendeeModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface EventDetailViewProps {
  eventId: number;
  onBack: () => void;
  onEditEvent: (event: EventItem) => void;
  onDeleteEvent: (event: EventItem) => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const EventDetailView: React.FC<EventDetailViewProps> = ({
  eventId,
  onBack,
  onEditEvent,
  onDeleteEvent,
  showToast,
}) => {
  const [event, setEvent] = useState<EventItem | null>(null);
  const [attendees, setAttendees] = useState<AttendeeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [orgFilter, setOrgFilter] = useState('');

  // Attendee modal state
  const [isAttendeeModalOpen, setIsAttendeeModalOpen] = useState(false);
  const [attendeeToEdit, setAttendeeToEdit] = useState<AttendeeItem | null>(null);

  // Delete attendee state
  const [attendeeToDelete, setAttendeeToDelete] = useState<AttendeeItem | null>(null);
  const [isDeletingAttendee, setIsDeletingAttendee] = useState(false);

  // Load event details & attendees
  const loadData = async () => {
    try {
      setIsLoading(true);
      const fetchedEvent = await api.getEventById(eventId);
      if (!fetchedEvent) {
        showToast('error', 'Event not found');
        onBack();
        return;
      }
      setEvent(fetchedEvent);
      const fetchedAttendees = await api.getAttendees(eventId, searchQuery, orgFilter);
      setAttendees(fetchedAttendees);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to load event data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId, searchQuery, orgFilter]);

  // Handle Mark Attendance Toggle
  const handleToggleAttendance = async (attendee: AttendeeItem) => {
    const nextStatus = !attendee.is_present;
    try {
      await api.markAttendance(eventId, attendee.id, nextStatus);
      showToast(
        'success',
        `Marked ${attendee.name} as ${nextStatus ? 'Present' : 'Absent'}`
      );
      // Reload event stats and attendee status
      const updatedEvent = await api.getEventById(eventId);
      if (updatedEvent) setEvent(updatedEvent);
      const updatedAttendees = await api.getAttendees(eventId, searchQuery, orgFilter);
      setAttendees(updatedAttendees);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update attendance');
    }
  };

  // Handle Create / Update Attendee
  const handleSaveAttendee = async (data: AttendeeCreateInput | AttendeeUpdateInput) => {
    if (attendeeToEdit) {
      await api.updateAttendee(attendeeToEdit.id, data as AttendeeUpdateInput);
      showToast('success', 'Attendee information updated');
    } else {
      await api.addAttendee(eventId, data as AttendeeCreateInput);
      showToast('success', 'New attendee registered for this event');
    }
    const updatedEvent = await api.getEventById(eventId);
    if (updatedEvent) setEvent(updatedEvent);
    const updatedAttendees = await api.getAttendees(eventId, searchQuery, orgFilter);
    setAttendees(updatedAttendees);
  };

  // Handle Delete Attendee
  const handleConfirmDeleteAttendee = async () => {
    if (!attendeeToDelete) return;
    setIsDeletingAttendee(true);
    try {
      await api.deleteAttendee(attendeeToDelete.id);
      showToast('info', `Removed ${attendeeToDelete.name} from attendees`);
      setAttendeeToDelete(null);
      const updatedEvent = await api.getEventById(eventId);
      if (updatedEvent) setEvent(updatedEvent);
      const updatedAttendees = await api.getAttendees(eventId, searchQuery, orgFilter);
      setAttendees(updatedAttendees);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to remove attendee');
    } finally {
      setIsDeletingAttendee(false);
    }
  };

  if (isLoading && !event) {
    return (
      <div id="event-detail-loading" className="flex items-center justify-center p-20 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-600">Loading event details...</span>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const totalAttendees = event.total_attendees ?? 0;
  const presentCount = event.present_count ?? 0;
  const absentCount = event.absent_count ?? 0;
  const attendanceRate = event.attendance_rate ?? 0;

  // Extract unique organizations for filter dropdown
  const organizations = Array.from(
    new Set(attendees.map((a) => a.organization).filter(Boolean) as string[])
  );

  return (
    <div id="event-detail-container" className="space-y-6">
      {/* Top Bar: Navigation & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <button
          id="event-detail-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-600" />
          <span>Back to All Events</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="event-detail-edit-btn"
            onClick={() => onEditEvent(event)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-md text-xs font-semibold transition-colors shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Event</span>
          </button>
          <button
            id="event-detail-delete-btn"
            onClick={() => onDeleteEvent(event)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 rounded-md text-xs font-semibold transition-colors shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Event</span>
          </button>
        </div>
      </div>

      {/* Event Header & Metadata Card */}
      <div id="event-detail-header-card" className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h1 id="event-detail-title" className="text-2xl font-bold text-slate-900 tracking-tight">
              {event.name}
            </h1>
            {event.description && (
              <p id="event-detail-description" className="text-sm text-slate-500 leading-relaxed">
                {event.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-600 pt-2 font-medium">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>
                  {new Date(`${event.date}T00:00:00`).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>
                  {event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>

          {/* Key Metrics Pill Container */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-center px-3">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Total</span>
              <span className="text-xl font-bold text-slate-900">{totalAttendees}</span>
            </div>
            <div className="text-center px-3 border-l border-slate-200">
              <span className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider block">Present</span>
              <span className="text-xl font-bold text-emerald-600">{presentCount}</span>
            </div>
            <div className="text-center px-3 border-l border-slate-200">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Absent</span>
              <span className="text-xl font-bold text-slate-700">{absentCount}</span>
            </div>
            <div className="text-center px-3 border-l border-slate-200">
              <span className="text-[11px] text-indigo-600 font-bold uppercase tracking-wider block">Rate</span>
              <span className="text-xl font-bold text-indigo-600">{attendanceRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendees & Attendance Management Section */}
      <div id="attendees-section" className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Attendees Section Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Attendee List & Attendance Marking</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage registrants, update attendee details, and mark attendance status in real time.
            </p>
          </div>

          {/* Search, Filter & Add Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="attendee-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, org..."
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-48 sm:w-56 shadow-2xs"
              />
            </div>

            {/* Organization Filter */}
            {organizations.length > 0 && (
              <select
                id="attendee-org-filter"
                value={orgFilter}
                onChange={(e) => setOrgFilter(e.target.value)}
                className="py-1.5 px-3 bg-white border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
              >
                <option value="">All Organizations</option>
                {organizations.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>
            )}

            {/* Add Attendee Button */}
            <button
              id="open-add-attendee-btn"
              onClick={() => {
                setAttendeeToEdit(null);
                setIsAttendeeModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Attendee</span>
            </button>
          </div>
        </div>

        {/* Attendees Table */}
        <div className="overflow-x-auto">
          {attendees.length === 0 ? (
            <div id="attendees-empty-state" className="text-center py-12 px-4">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-800">
                {searchQuery || orgFilter ? 'No matching attendees found' : 'No attendees registered yet'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery || orgFilter
                  ? 'Try clearing the search or filter query to see all attendees.'
                  : 'Start building this event roster by adding the first attendee.'}
              </p>
              {!searchQuery && !orgFilter && (
                <button
                  id="empty-state-add-attendee-btn"
                  onClick={() => {
                    setAttendeeToEdit(null);
                    setIsAttendeeModalOpen(true);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Attendee</span>
                </button>
              )}
            </div>
          ) : (
            <table id="attendees-table" className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                <tr>
                  <th scope="col" className="px-6 py-3">Attendee</th>
                  <th scope="col" className="px-6 py-3">Contact</th>
                  <th scope="col" className="px-6 py-3">Organization</th>
                  <th scope="col" className="px-6 py-3 text-center">Attendance Status</th>
                  <th scope="col" className="px-6 py-3 text-right">Actions</th>
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

                    {/* Email & Phone */}
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{attendee.email}</span>
                        </div>
                        {attendee.phone && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{attendee.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Organization */}
                    <td className="px-6 py-4">
                      {attendee.organization ? (
                        <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{attendee.organization}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>

                    {/* Attendance Status Toggle Button */}
                    <td className="px-6 py-4 text-center">
                      <button
                        id={`toggle-attendance-btn-${attendee.id}`}
                        onClick={() => handleToggleAttendance(attendee)}
                        title={`Click to mark as ${attendee.is_present ? 'Absent' : 'Present'}`}
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
                    </td>

                    {/* Row Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          id={`edit-attendee-btn-${attendee.id}`}
                          onClick={() => {
                            setAttendeeToEdit(attendee);
                            setIsAttendeeModalOpen(true);
                          }}
                          title="Edit attendee information"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`delete-attendee-btn-${attendee.id}`}
                          onClick={() => setAttendeeToDelete(attendee)}
                          title="Remove attendee"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Attendee Form Modal */}
      <AttendeeModal
        isOpen={isAttendeeModalOpen}
        onClose={() => {
          setIsAttendeeModalOpen(false);
          setAttendeeToEdit(null);
        }}
        onSubmit={handleSaveAttendee}
        attendeeToEdit={attendeeToEdit}
        eventName={event.name}
      />

      {/* Delete Attendee Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!attendeeToDelete}
        title="Remove Attendee"
        message={`Are you sure you want to remove ${attendeeToDelete?.name} (${attendeeToDelete?.email}) from this event? All attendance records for this attendee will be deleted.`}
        confirmLabel="Remove Attendee"
        onConfirm={handleConfirmDeleteAttendee}
        onCancel={() => setAttendeeToDelete(null)}
        isDeleting={isDeletingAttendee}
      />
    </div>
  );
};
