import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  BarChart3,
  Users,
} from 'lucide-react';
import { EventItem, DashboardOverviewData, ActiveTab, EventCreateInput, EventUpdateInput } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { StatsCards } from './components/StatsCards';
import { EventCard } from './components/EventCard';
import { EventFormModal } from './components/EventFormModal';
import { EventDetailView } from './components/EventDetailView';
import { AttendeesDirectory } from './components/AttendeesDirectory';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const [dashboardStats, setDashboardStats] = useState<DashboardOverviewData | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state for events
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date_asc' | 'date_desc' | 'name' | 'attendance'>('date_asc');

  // Event modal state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null);

  // Delete event modal state
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

  // Toast system
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load all dashboard data
  const loadData = async () => {
    try {
      setIsLoading(true);
      const overview = await api.getDashboardOverview();
      setDashboardStats(overview);
      setEvents(overview.events);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Event Creation / Update
  const handleSaveEvent = async (data: EventCreateInput | EventUpdateInput) => {
    if (eventToEdit) {
      await api.updateEvent(eventToEdit.id, data as EventUpdateInput);
      showToast('success', 'Event updated successfully');
    } else {
      await api.createEvent(data as EventCreateInput);
      showToast('success', 'New event created successfully');
    }
    await loadData();
  };

  // Handle Event Deletion
  const handleConfirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    setIsDeletingEvent(true);
    try {
      await api.deleteEvent(eventToDelete.id);
      showToast('info', `Deleted event: ${eventToDelete.name}`);
      setEventToDelete(null);
      if (selectedEventId === eventToDelete.id) {
        setSelectedEventId(null);
        setActiveTab('events');
      }
      await loadData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete event');
    } finally {
      setIsDeletingEvent(false);
    }
  };

  // Reset sample data
  const handleResetData = async () => {
    await api.resetData();
    showToast('info', 'Restored initial sample data');
    await loadData();
  };

  // Navigate to Event Detail
  const handleSelectEvent = (event: EventItem) => {
    setSelectedEventId(event.id);
    setActiveTab('event_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered & Sorted events list
  const filteredEvents = events
    .filter((e) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        e.location.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
      if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'attendance') return (b.attendance_rate || 0) - (a.attendance_rate || 0);
      return 0;
    });

  return (
    <div id="app-root" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'event_detail') setSelectedEventId(null);
        }}
        onOpenCreateEvent={() => {
          setEventToEdit(null);
          setIsEventModalOpen(true);
        }}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && !dashboardStats ? (
          <div id="initial-loading-spinner" className="flex items-center justify-center p-24 text-slate-400">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-slate-600">Initializing Event Management Dashboard...</span>
            </div>
          </div>
        ) : activeTab === 'event_detail' && selectedEventId ? (
          /* Single Event Detail & Live Attendance View */
          <EventDetailView
            eventId={selectedEventId}
            onBack={() => {
              setSelectedEventId(null);
              setActiveTab('events');
            }}
            onEditEvent={(ev) => {
              setEventToEdit(ev);
              setIsEventModalOpen(true);
            }}
            onDeleteEvent={(ev) => setEventToDelete(ev)}
            showToast={showToast}
          />
        ) : activeTab === 'attendees' ? (
          /* All Attendees Directory View */
          <AttendeesDirectory
            onSelectEvent={(eventId) => {
              setSelectedEventId(eventId);
              setActiveTab('event_detail');
            }}
          />
        ) : (
          /* Dashboard & Events List Views */
          <div className="space-y-8">
            {/* Top Stats Overview */}
            {dashboardStats && (
              <section id="dashboard-overview-section" className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Live Metrics Overview
                  </h2>
                </div>
                <StatsCards stats={dashboardStats} />
              </section>
            )}

            {/* Events Header & Controls */}
            <section id="events-list-section" className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    {activeTab === 'dashboard' ? 'Upcoming & Active Events' : 'All Events'}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Select an event to view attendees, track attendance, and inspect statistics.
                  </p>
                </div>

                {/* Search & Sort Controls */}
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
                      className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-48 sm:w-56 shadow-xs"
                    />
                  </div>

                  {/* Sort */}
                  <div className="relative">
                    <select
                      id="event-sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="py-1.5 pl-3 pr-8 bg-white border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs"
                    >
                      <option value="date_asc">Date (Earliest first)</option>
                      <option value="date_desc">Date (Latest first)</option>
                      <option value="name">Event Name (A-Z)</option>
                      <option value="attendance">Highest Attendance %</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Events Grid */}
              {filteredEvents.length === 0 ? (
                <div id="no-events-empty-state" className="text-center py-16 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-slate-800">No events found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {searchQuery
                      ? 'No events matched your search query. Try clearing the search.'
                      : 'Get started by creating your first organized event.'}
                  </p>
                  {!searchQuery && (
                    <button
                      id="empty-state-create-event-btn"
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
                <div id="events-cards-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onSelect={handleSelectEvent}
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
          </div>
        )}
      </main>

      {/* Footer */}
      <footer id="app-footer" className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium text-slate-600">Event Management Dashboard • Clean Minimalism</span>
          <span>FastAPI + SQLAlchemy + PostgreSQL + TypeScript</span>
        </div>
      </footer>

      {/* Event Create / Edit Modal */}
      <EventFormModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEventToEdit(null);
        }}
        onSubmit={handleSaveEvent}
        eventToEdit={eventToEdit}
      />

      {/* Delete Event Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!eventToDelete}
        title="Delete Event"
        message={`Are you sure you want to delete "${eventToDelete?.name}"? All associated attendee and attendance records will be permanently removed.`}
        confirmLabel="Delete Event"
        onConfirm={handleConfirmDeleteEvent}
        onCancel={() => setEventToDelete(null)}
        isDeleting={isDeletingEvent}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
