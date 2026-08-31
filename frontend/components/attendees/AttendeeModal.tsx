'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { AttendeeItem, AttendeeCreateInput, AttendeeUpdateInput } from '@/types';

interface AttendeeModalProps {
  isOpen: boolean;
  eventName?: string;
  attendeeToEdit: AttendeeItem | null;
  onClose: () => void;
  onSubmit: (data: AttendeeCreateInput | AttendeeUpdateInput) => Promise<void>;
}

export const AttendeeModal: React.FC<AttendeeModalProps> = ({
  isOpen,
  eventName,
  attendeeToEdit,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [section, setSection] = useState('');
  const [semester, setSemester] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (attendeeToEdit) {
      setName(attendeeToEdit.name);
      setEmail(attendeeToEdit.email);
      setPhoneNumber(attendeeToEdit.phone_number || '');
      setSection(attendeeToEdit.section || '');
      setSemester(attendeeToEdit.semester || '');
    } else {
      setName('');
      setEmail('');
      setPhoneNumber('');
      setSection('');
      setSemester('');
    }
    setErrors({});
  }, [attendeeToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!section.trim()) newErrors.section = 'Section is required';
    if (!semester.trim()) newErrors.semester = 'Semester is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone_number: phoneNumber.trim(),
        section: section.trim(),
        semester: semester.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save attendee. Please verify the input.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="attendee-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
    >
      <div
        id="attendee-modal-content"
        className="bg-white border border-slate-200 rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 id="attendee-modal-title" className="text-lg font-bold text-slate-900">
              {attendeeToEdit ? 'Edit Attendee' : 'Register New Attendee'}
            </h2>
            {eventName && <p className="text-xs text-slate-500 mt-0.5">Event: {eventName}</p>}
          </div>
          <button
            id="attendee-modal-close-btn"
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
              id="attendee-form-error-banner"
              className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label
              htmlFor="attendee-name-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1"
            >
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="attendee-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className={`w-full px-3.5 py-2 bg-white border rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 shadow-2xs ${
                errors.name
                  ? 'border-rose-400 focus:ring-rose-500'
                  : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="attendee-email-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1"
            >
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              id="attendee-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex@example.com"
              className={`w-full px-3.5 py-2 bg-white border rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 shadow-2xs ${
                errors.email
                  ? 'border-rose-400 focus:ring-rose-500'
                  : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            />
            {errors.email && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="attendee-phone-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1"
            >
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              id="attendee-phone-input"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. +1 (555) 012-3456"
              className={`w-full px-3.5 py-2 bg-white border rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 shadow-2xs ${
                errors.phoneNumber
                  ? 'border-rose-400 focus:ring-rose-500'
                  : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            />
            {errors.phoneNumber && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Section */}
          <div>
            <label
              htmlFor="attendee-section-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1"
            >
              Section <span className="text-rose-500">*</span>
            </label>
            <input
              id="attendee-section-input"
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g. A, B, C"
              className={`w-full px-3.5 py-2 bg-white border rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 shadow-2xs ${
                errors.section
                  ? 'border-rose-400 focus:ring-rose-500'
                  : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            />
            {errors.section && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.section}</p>
            )}
          </div>

          {/* Semester */}
          <div>
            <label
              htmlFor="attendee-semester-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1"
            >
              Semester <span className="text-rose-500">*</span>
            </label>
            <input
              id="attendee-semester-input"
              type="text"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="e.g. 1, 2, 3"
              className={`w-full px-3.5 py-2 bg-white border rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 shadow-2xs ${
                errors.semester
                  ? 'border-rose-400 focus:ring-rose-500'
                  : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            />
            {errors.semester && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.semester}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              id="attendee-form-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              id="attendee-form-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md transition-colors shadow-sm"
            >
              {isSubmitting ? 'Saving...' : attendeeToEdit ? 'Update Attendee' : 'Add Attendee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
