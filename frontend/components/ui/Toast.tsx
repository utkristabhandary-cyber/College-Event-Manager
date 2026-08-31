'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-notifications-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg transition-all duration-200 animate-in fade-in slide-in-from-bottom-3 ${
              isSuccess
                ? 'bg-white border-emerald-200 text-emerald-900'
                : isError
                ? 'bg-white border-rose-200 text-rose-900'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {isError && <AlertCircle className="w-4 h-4 text-rose-600" />}
              {!isSuccess && !isError && <Info className="w-4 h-4 text-indigo-600" />}
            </div>
            <div className="flex-1 text-xs font-medium leading-relaxed">{toast.message}</div>
            <button
              id={`dismiss-toast-btn-${toast.id}`}
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-700 transition-colors p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
