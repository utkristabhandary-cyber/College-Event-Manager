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

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          id={`toast-${toast.id}`}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border backdrop-blur-sm transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-800 text-emerald-100'
              : toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-800 text-rose-100'
              : 'bg-zinc-900/90 border-zinc-700 text-zinc-100'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
          </div>
          <p className="text-sm font-medium leading-tight flex-1">{toast.message}</p>
          <button
            id={`toast-close-${toast.id}`}
            onClick={() => onDismiss(toast.id)}
            className="text-zinc-400 hover:text-zinc-100 transition-colors p-0.5 rounded"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
