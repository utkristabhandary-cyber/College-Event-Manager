import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div id="delete-confirm-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div id="delete-confirm-modal-content" className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-md w-full shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 id="delete-confirm-modal-title" className="text-base font-semibold text-zinc-100">
              {title}
            </h3>
            <p id="delete-confirm-modal-message" className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-zinc-400 hover:text-zinc-200 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-zinc-800">
          <button
            id="delete-confirm-cancel-btn"
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            id="delete-confirm-action-btn"
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-md transition-colors shadow-sm"
          >
            {isDeleting ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
