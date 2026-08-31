'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users, Search, RefreshCw, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { AttendeeItem, AttendeeUpdateInput } from '@/types';
import { AttendeeTable } from '@/components/attendees/AttendeeTable';
import { AttendeeModal } from '@/components/attendees/AttendeeModal';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';

export default function AllAttendeesPage() {
  const [attendees, setAttendees] = useState<AttendeeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');

  // Modals state
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

  const loadAttendees = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getAllAttendees({
        search: searchQuery || undefined,
        section: sectionFilter || undefined,
        semester: semesterFilter || undefined,
      });
      setAttendees(data);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to load attendees directory');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, sectionFilter, semesterFilter, showToast]);

  useEffect(() => {
    loadAttendees();
  }, [loadAttendees]);

  const handleEditAttendee = async (data: any) => {
    if (!attendeeToEdit) return;
    try {
      await api.updateAttendee(attendeeToEdit.id, data as AttendeeUpdateInput);
      showToast('success', `Attendee "${data.name}" updated successfully`);
      await loadAttendees();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update attendee');
    }
  };

  const handleDeleteAttendee = async () => {
    if (!attendeeToDelete) return;
    setIsDeletingAttendee(true);
    try {
      await api.deleteAttendee(attendeeToDelete.id);
      showToast('success', `Attendee "${attendeeToDelete.name}" deleted successfully`);
      setAttendeeToDelete(null);
      await loadAttendees();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete attendee');
    } finally {
      setIsDeletingAttendee(false);
    }
  };

  const uniqueSections = Array.from(
    new Set(attendees.map((a) => a.section).filter((s): s is string => !!s))
  );
  const uniqueSemesters = Array.from(
    new Set(attendees.map((a) => a.semester).filter((s): s is string => !!s))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendee Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Global directory of all registered event attendees across the platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="refresh-attendees-btn"
            onClick={loadAttendees}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors text-xs font-medium flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Records: {attendees.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="attendees-dir-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-md text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs transition-colors"
            />
          </div>

          {/* Section Filter */}
          {uniqueSections.length > 0 && (
            <select
              id="attendees-dir-section-filter"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="py-1.5 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
            >
              <option value="">All Sections</option>
              {uniqueSections.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}

          {/* Semester Filter */}
          {uniqueSemesters.length > 0 && (
            <select
              id="attendees-dir-semester-filter"
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="py-1.5 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
            >
              <option value="">All Semesters</option>
              {uniqueSemesters.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading && attendees.length === 0 ? (
          <Spinner size="lg" label="Loading attendee directory..." />
        ) : attendees.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800">No attendees found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || sectionFilter || semesterFilter
                ? 'No registered attendees matched your filter parameters.'
                : 'No attendees have been registered to any event yet.'}
            </p>
          </div>
        ) : (
          <AttendeeTable
            attendees={attendees}
            showEventName={true}
            onEditAttendee={(att) => {
              setAttendeeToEdit(att);
              setIsAttendeeModalOpen(true);
            }}
            onDeleteAttendee={(att) => setAttendeeToDelete(att)}
          />
        )}
      </div>

      {/* Edit Attendee Modal */}
      <AttendeeModal
        isOpen={isAttendeeModalOpen}
        eventName={attendeeToEdit?.event_name || undefined}
        attendeeToEdit={attendeeToEdit}
        onClose={() => setIsAttendeeModalOpen(false)}
        onSubmit={handleEditAttendee}
      />

      {/* Delete Attendee Modal */}
      <DeleteConfirmModal
        isOpen={!!attendeeToDelete}
        title="Remove Attendee"
        message="Are you sure you want to permanently remove this attendee from the event database?"
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
