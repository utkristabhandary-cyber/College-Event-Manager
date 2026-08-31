'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { EventItem, EventCreateInput, EventUpdateInput } from '@/types';

interface EventFormModalProps {
  isOpen: boolean;
  eventToEdit: EventItem | null;
  onClose: () => void;
  onSubmit: (data: EventCreateInput | EventUpdateInput) => Promise<void>;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  eventToEdit,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00:00');
  const [endTime, setEndTime] = useState('17:00:00');
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (eventToEdit) {
      setName(eventToEdit.name);
      setDescription(eventToEdit.description || '');
      setDate(eventToEdit.date);
      setStartTime(eventToEdit.start_time);
      setEndTime(eventToEdit.end_time);
      setLocation(eventToEdit.location);
    } else {
      setName('');
      setDescription('');
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setStartTime('09:00:00');
      setEndTime('17:00:00');
      setLocation('');
    }
    setErrors({});
  }, [eventToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Event name is required';
    if (!date) newErrors.date = 'Date is required';
    if (!location.trim()) newErrors.location = 'Location is required';
    if (!startTime) newErrors.startTime = 'Start time is required';
    if (!endTime) newErrors.endTime = 'End time is required';

    if (startTime && endTime && endTime <= startTime) {
      newErrors.endTime = 'End time must be strictly after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const formattedStartTime = startTime.length === 5 ? `${startTime}:00` : startTime;
      const formattedEndTime = endTime.length === 5 ? `${endTime}:00` : endTime;

      await onSubmit({
        name: name.trim(),
        description: description.trim() ? description.trim() : undefined,
        date,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
        location: location.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save event. Please verify your inputs.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="event-form-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
    >
      <div
        id="event-form-modal-content"
        className="bg-white border border-slate-200 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 id="event-modal-title" className="text-lg font-bold text-slate-900">
            {eventToEdit ? 'Edit Event' : 'Create New Event'}
          </h2>
          <button
            id="event-modal-close-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.form && (
            <div
              id="event-form-error-banner"
              className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Event Name */}
          <div>
            <label
              htmlFor="event-name-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1"
            >
              Event Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="event-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Annual Technology Summit"
              className={`w-full px-3.5 py-2 bg-white border rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 shadow-2xs ${
                errors.name
                  ? 'border-rose-400 focus:ring-rose-500'
                  : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="event-desc-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1"
            >
              Description <span className="text-slate-400 text-xs font-normal">(Optional)</span>
            </label>
            <textarea
              id="event-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief summary or agenda of the event..."
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
            />
          </div>

          {/* Date & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="event-date-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1"
              >
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                id="event-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-3.5 py-2 bg-white border rounded-md text-sm text-slate-900 focus:outline-none focus:ring-1 shadow-2xs ${
                  errors.date
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
              {errors.date && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.date}</p>}
            </div>

            <div>
              <label
                htmlFor="event-location-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1"
              >
                Location <span className="text-rose-500">*</span>
              </label>
              <input
                id="event-location-input"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Hall 4B or Online"
                className={`w-full px-3.5 py-2 bg-white border rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 shadow-2xs ${
                  errors.location
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
              {errors.location && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.location}</p>
              )}
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="event-start-time-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1"
              >
                Start Time <span className="text-rose-500">*</span>
              </label>
              <input
                id="event-start-time-input"
                type="time"
                step="1"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={`w-full px-3.5 py-2 bg-white border rounded-md text-sm text-slate-900 focus:outline-none focus:ring-1 shadow-2xs ${
                  errors.startTime
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
              {errors.startTime && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.startTime}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="event-end-time-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1"
              >
                End Time <span className="text-rose-500">*</span>
              </label>
              <input
                id="event-end-time-input"
                type="time"
                step="1"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={`w-full px-3.5 py-2 bg-white border rounded-md text-sm text-slate-900 focus:outline-none focus:ring-1 shadow-2xs ${
                  errors.endTime
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
              {errors.endTime && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              id="event-form-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              id="event-form-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md transition-colors shadow-sm"
            >
              {isSubmitting ? 'Saving...' : eventToEdit ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
