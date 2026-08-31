'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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
  Building,
  Edit3,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';
import {
  EventItem,
  AttendeeItem,
  EventUpdateInput,
  AttendeeCreateInput,
  AttendeeUpdateInput,
} from '@/types';
import { AttendeeTable } from '@/components/attendees/AttendeeTable';
import { EventFormModal } from '@/components/events/EventFormModal';
import { AttendeeModal } from '@/components/attendees/AttendeeModal';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);

  const [event, setEvent] = useState<EventItem | null>(null);
  const [attendees, setAttendees] = useState<AttendeeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [orgFilter, setOrgFilter] = useState('');

  // Modals state
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [isDeleteEventOpen, setIsDeleteEventOpen] = useState(false);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

  const [isAttendeeModalOpen, setIsAttendeeModalOpen] = useState(false);
  const [attendeeToEdit, setAttendeeToEdit] = useState<AttendeeItem | null>(null);
  const [attendeeToDelete, setAttendeeToDelete] = useState<AttendeeItem | null>(null);
  const [isDeletingAttendee, setIsDeletingAttendee] = useState(false);

  // Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadEventAndAttendees = useCallback(async () => {
    if (!eventId || isNaN(eventId)) return;
    setIsLoading(true);
    try {
      const [eventData, attendeesData] = await Promise.all([
        api.getEvent(eventId),
        api.getEventAttendees(eventId, {
          search: searchQuery || undefined,
          organization: orgFilter || undefined,
        }),
      ]);
      setEvent(eventData);
      setAttendees(attendeesData);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to load event details');
    } finally {
      setIsLoading(false);
    }
  }, [eventId, searchQuery, orgFilter, showToast]);

  useEffect(() => {
    loadEventAndAttendees();
  }, [loadEventAndAttendees]);

  const handleUpdateEvent = async (data: EventUpdateInput) => {
    try {
      const updated = await api.updateEvent(eventId, data);
      setEvent(updated);
      showToast('success', 'Event updated successfully');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update event');
    }
  };

  const handleDeleteEvent = async () => {
    setIsDeletingEvent(true);
    try {
      await api.deleteEvent(eventId);
      showToast('success', 'Event deleted successfully');
      router.push('/events');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete event');
      setIsDeletingEvent(false);
    }
  };

  const handleCreateOrEditAttendee = async (data: AttendeeCreateInput | AttendeeUpdateInput) => {
    if (attendeeToEdit) {
      await api.updateAttendee(attendeeToEdit.id, data);
      showToast('success', `Attendee "${data.name}" updated`);
    } else {
      await api.createAttendee(eventId, data as AttendeeCreateInput);
      showToast('success', `Attendee "${data.name}" registered`);
    }
    await loadEventAndAttendees();
  };

  const handleToggleAttendance = async (attendee: AttendeeItem) => {
    const newStatus = !attendee.is_present;
    // Optimistically update the UI before the API call completes.
    setAttendees((prev) =>
      prev.map((a) => (a.id === attendee.id ? { ...a, is_present: newStatus } : a))
    );
    try {
      await api.markAttendance(eventId, attendee.id, newStatus);
      showToast('success', `Marked ${attendee.name} as ${newStatus ? 'Present' : 'Absent'}`);
      await loadEventAndAttendees();
    } catch (err: any) {
      // Roll back the optimistic update on failure.
      setAttendees((prev) =>
        prev.map((a) => (a.id === attendee.id ? { ...a, is_present: !newStatus } : a))
      );
      showToast('error', err.message || 'Failed to update attendance');
    }
  };

  const handleDeleteAttendee = async () => {
    if (!attendeeToDelete) return;
    setIsDeletingAttendee(true);
    try {
      await api.deleteAttendee(attendeeToDelete.id);
      showToast('success', `Attendee "${attendeeToDelete.name}" removed`);
      setAttendeeToDelete(null);
      await loadEventAndAttendees();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete attendee');
    } finally {
      setIsDeletingAttendee(false);
    }
  };

  if (!event && !isLoading) {
    return (
      <div className="text-center py-20 bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Event Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">The requested event does not exist or has been deleted.</p>
        <Link
          href="/events"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md shadow-sm transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Events</span>
        </Link>
      </div>
    );
  }

  const formattedDate = event
    ? new Date(`${event.date}T00:00:00`).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const total = event?.total_attendees || 0;
  const present = event?.present_count || 0;
  const absent = event?.absent_count || 0;
  const rate = event?.attendance_rate || 0;

  // Extract unique organizations for filter dropdown
  const uniqueOrgs = Array.from(
    new Set(attendees.map((a) => a.organization).filter((org): org is string => !!org))
  );

  return (
    <div className="space-y-8">
      {/* Back Link & Action Bar */}
      <div className="flex items-center justify-between">
        <Link
          id="back-to-events-link"
          href="/events"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Events</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            id="refresh-event-detail-btn"
            onClick={loadEventAndAttendees}
            title="Refresh event data"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors text-xs font-medium flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            id="edit-event-detail-btn"
            onClick={() => setIsEditEventOpen(true)}
            className="p-2 sm:px-3 sm:py-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit Event</span>
          </button>
          <button
            id="delete-event-detail-btn"
            onClick={() => setIsDeleteEventOpen(true)}
            className="p-2 sm:px-3 sm:py-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-md transition-colors text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      {event && (
        <>
          {/* Event Header & Metadata Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                  Event Details
                </span>
                <h1 id="event-detail-title" className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">
                  {event.name}
                </h1>
                {event.description && (
                  <p className="text-xs text-slate-600 mt-2 max-w-3xl leading-relaxed">
                    {event.description}
                  </p>
                )}
              </div>

              {/* Quick Action Button */}
              <div className="shrink-0">
                <button
                  id="add-attendee-top-btn"
                  onClick={() => {
                    setAttendeeToEdit(null);
                    setIsAttendeeModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Attendee</span>
                </button>
              </div>
            </div>

            {/* Event Info Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Date</span>
                  <span className="font-semibold text-slate-900">{formattedDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Time</span>
                  <span className="font-semibold text-slate-900">
                    {event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Location</span>
                  <span className="font-semibold text-slate-900 truncate block max-w-xs">{event.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Event Statistics Cards */}
          <div id="event-stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Registered</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-slate-900">{total}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Invited guests</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Present</span>
                <UserCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-slate-900">{present}</span>
                <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">Checked-in attendees</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Absent / Pending</span>
                <UserX className="w-4 h-4 text-slate-500" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-slate-900">{absent}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Unconfirmed arrival</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Turnout Rate</span>
                <Percent className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-slate-900">{rate}%</span>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Attendee Roster Section */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden space-y-0">
            {/* Roster Header */}
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Attendee Roster ({attendees.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click the attendance status button to instantly toggle check-in status.
                </p>
              </div>

              {/* Search & Organization Filters */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="attendees-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, email..."
                    className="pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-md text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-44 sm:w-52 shadow-2xs"
                  />
                </div>

                {uniqueOrgs.length > 0 && (
                  <select
                    id="attendees-org-filter"
                    value={orgFilter}
                    onChange={(e) => setOrgFilter(e.target.value)}
                    className="py-1.5 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                  >
                    <option value="">All Organizations</option>
                    {uniqueOrgs.map((org) => (
                      <option key={org} value={org}>
                        {org}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  id="add-attendee-roster-btn"
                  onClick={() => {
                    setAttendeeToEdit(null);
                    setIsAttendeeModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Attendee</span>
                </button>
              </div>
            </div>

            {/* Table */}
            {attendees.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h3 className="text-xs font-semibold text-slate-800">No attendees found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {searchQuery || orgFilter
                    ? 'No attendees match the current search or filters.'
                    : 'No attendees have been registered for this event yet.'}
                </p>
              </div>
            ) : (
              <AttendeeTable
                attendees={attendees}
                onToggleAttendance={handleToggleAttendance}
                onEditAttendee={(att) => {
                  setAttendeeToEdit(att);
                  setIsAttendeeModalOpen(true);
                }}
                onDeleteAttendee={(att) => setAttendeeToDelete(att)}
              />
            )}
          </div>
        </>
      )}

      {/* Edit Event Modal */}
      {event && (
        <EventFormModal
          isOpen={isEditEventOpen}
          eventToEdit={event}
          onClose={() => setIsEditEventOpen(false)}
          onSubmit={handleUpdateEvent}
        />
      )}

      {/* Delete Event Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteEventOpen}
        title="Delete Event"
        message="Are you sure you want to permanently delete this event and all associated attendee registration records?"
        itemName={event?.name}
        confirmLabel="Delete Event"
        isDeleting={isDeletingEvent}
        onConfirm={handleDeleteEvent}
        onClose={() => setIsDeleteEventOpen(false)}
      />

      {/* Add / Edit Attendee Modal */}
      <AttendeeModal
        isOpen={isAttendeeModalOpen}
        eventName={event?.name}
        attendeeToEdit={attendeeToEdit}
        onClose={() => setIsAttendeeModalOpen(false)}
        onSubmit={handleCreateOrEditAttendee}
      />

      {/* Delete Attendee Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!attendeeToDelete}
        title="Remove Attendee"
        message="Are you sure you want to remove this attendee from the event roster?"
        itemName={attendeeToDelete?.name}
        confirmLabel="Remove Attendee"
        isDeleting={isDeletingAttendee}
        onConfirm={handleDeleteAttendee}
        onClose={() => setAttendeeToDelete(null)}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
