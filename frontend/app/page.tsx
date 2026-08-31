'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Calendar, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { DashboardOverview, EventItem, EventCreateInput, EventUpdateInput } from '@/types';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { EventCard } from '@/components/events/EventCard';
import { EventFormModal } from '@/components/events/EventFormModal';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date_asc' | 'date_desc' | 'name' | 'attendance'>('date_asc');

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

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getDashboardOverview();
      setStats(data);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to load dashboard overview');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateOrEditEvent = async (data: EventCreateInput | EventUpdateInput) => {
    if (eventToEdit) {
      await api.updateEvent(eventToEdit.id, data);
      showToast('success', `Event "${data.name}" updated successfully`);
    } else {
      await api.createEvent(data as EventCreateInput);
      showToast('success', `Event "${data.name}" created successfully`);
    }
    await loadData();
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteEvent(eventToDelete.id);
      showToast('success', `Event "${eventToDelete.name}" deleted successfully`);
      setEventToDelete(null);
      await loadData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEvents = (stats?.events || [])
    .filter((ev) => {
      const q = searchQuery.toLowerCase();
      return (
        ev.name.toLowerCase().includes(q) ||
        (ev.description && ev.description.toLowerCase().includes(q)) ||
        ev.location.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'date_asc') {
        return new Date(`${a.date}T${a.start_time}`).getTime() - new Date(`${b.date}T${b.start_time}`).getTime();
      }
      if (sortBy === 'date_desc') {
        return new Date(`${b.date}T${b.start_time}`).getTime() - new Date(`${a.date}T${a.start_time}`).getTime();
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'attendance') {
        return (b.attendance_rate || 0) - (a.attendance_rate || 0);
      }
      return 0;
    });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time event analytics, attendance monitoring, and event management workspace.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="refresh-dashboard-btn"
            onClick={loadData}
            title="Refresh dashboard metrics"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors text-xs font-medium flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            id="create-event-dashboard-btn"
            onClick={() => {
              setEventToEdit(null);
              setIsEventModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {isLoading && !stats ? (
        <Spinner size="lg" label="Loading dashboard data..." />
      ) : (
        <>
          {/* Key Metrics Cards */}
          {stats && (
            <section id="dashboard-metrics-section">
              <StatsCards stats={stats} />
            </section>
          )}

          {/* Events Section */}
          <section id="dashboard-events-section" className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Organized Events</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select an event to view attendees, track live check-ins, and inspect statistics.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="event-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events or venue..."
                    className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-48 sm:w-56 shadow-2xs"
                  />
                </div>

                {/* Sort */}
                <select
                  id="event-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="py-1.5 pl-3 pr-8 bg-white border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
                >
                  <option value="date_asc">Date (Earliest first)</option>
                  <option value="date_desc">Date (Latest first)</option>
                  <option value="name">Event Name (A-Z)</option>
                  <option value="attendance">Attendance Rate (High to Low)</option>
                </select>
              </div>
            </div>

            {/* Events Grid */}
            {filteredEvents.length === 0 ? (
              <div
                id="no-events-empty-state"
                className="text-center py-16 bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
              >
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-800">No events found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {searchQuery
                    ? 'No events matched your search query. Try clearing the search.'
                    : 'Get started by creating your first organized event.'}
                </p>
                {!searchQuery && (
                  <button
                    id="empty-create-event-btn"
                    onClick={() => {
                      setEventToEdit(null);
                      setIsEventModalOpen(true);
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Your First Event</span>
                  </button>
                )}
              </div>
            ) : (
              <div
                id="events-grid-container"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
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
          </section>
        </>
      )}

      {/* Create / Edit Event Modal */}
      <EventFormModal
        isOpen={isEventModalOpen}
        eventToEdit={eventToEdit}
        onClose={() => setIsEventModalOpen(false)}
        onSubmit={handleCreateOrEditEvent}
      />

      {/* Delete Event Confirmation Modal */}
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
