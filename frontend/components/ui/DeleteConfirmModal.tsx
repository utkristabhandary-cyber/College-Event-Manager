'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  confirmLabel?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  message,
  itemName,
  confirmLabel = 'Delete',
  isDeleting = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="delete-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
    >
      <div
        id="delete-modal-content"
        className="bg-white border border-slate-200 rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <h2 id="delete-modal-title" className="text-base font-bold text-slate-900">
              {title}
            </h2>
          </div>
          <button
            id="delete-modal-close-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
          {itemName && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900">
              {itemName}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            id="delete-modal-cancel-btn"
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            id="delete-modal-confirm-btn"
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-md transition-colors shadow-xs"
          >
            {isDeleting ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
