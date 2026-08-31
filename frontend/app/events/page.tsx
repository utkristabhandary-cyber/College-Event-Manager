'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Calendar, RefreshCw, LayoutGrid, ListFilter } from 'lucide-react';
import { api } from '@/lib/api';
import { EventItem, EventCreateInput, EventUpdateInput } from '@/types';
import { EventCard } from '@/components/events/EventCard';
import { EventFormModal } from '@/components/events/EventFormModal';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'upcoming' | 'past'>('all');

  // Modals state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null);
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleCreateOrEditEvent = async (data: EventCreateInput | EventUpdateInput) => {
    if (eventToEdit) {
      await api.updateEvent(eventToEdit.id, data);
      showToast('success', `Event "${data.name}" updated successfully`);
    } else {
      await api.createEvent(data as EventCreateInput);
      showToast('success', `Event "${data.name}" created successfully`);
    }
    await loadEvents();
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteEvent(eventToDelete.id);
      showToast('success', `Event "${eventToDelete.name}" deleted successfully`);
      setEventToDelete(null);
      await loadEvents();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredEvents = events.filter((ev) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      ev.name.toLowerCase().includes(q) ||
      (ev.description && ev.description.toLowerCase().includes(q)) ||
      ev.location.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filterPeriod === 'upcoming') {
      return ev.date >= todayStr;
    }
    if (filterPeriod === 'past') {
      return ev.date < todayStr;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Events Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse all events, configure schedules, manage attendees, and track check-ins.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="refresh-events-btn"
            onClick={loadEvents}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors text-xs font-medium flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            id="create-event-btn"
            onClick={() => {
              setEventToEdit(null);
              setIsEventModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Period Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full md:w-auto">
          <button
            id="filter-period-all"
            onClick={() => setFilterPeriod('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filterPeriod === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Events ({events.length})
          </button>
          <button
            id="filter-period-upcoming"
            onClick={() => setFilterPeriod('upcoming')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filterPeriod === 'upcoming'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Upcoming
          </button>
          <button
            id="filter-period-past"
            onClick={() => setFilterPeriod('past')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filterPeriod === 'past'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Past
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="events-page-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by event title, location..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-md text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs transition-colors"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading && events.length === 0 ? (
        <Spinner size="lg" label="Loading events..." />
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">No events matched</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'No events match your search query.'
              : filterPeriod !== 'all'
              ? `No ${filterPeriod} events found.`
              : 'No events created yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={(ev) => {
                setEventToEdit(ev);
                setIsEventModalOpen(true);
              }}
              onDelete={(ev) => setEventToDelete(ev)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <EventFormModal
        isOpen={isEventModalOpen}
        eventToEdit={eventToEdit}
        onClose={() => setIsEventModalOpen(false)}
        onSubmit={handleCreateOrEditEvent}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!eventToDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action will permanently remove the event and all associated attendee registration and attendance records."
        itemName={eventToDelete?.name}
        confirmLabel="Delete Event"
        isDeleting={isDeleting}
        onConfirm={handleDeleteEvent}
        onClose={() => setEventToDelete(null)}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
