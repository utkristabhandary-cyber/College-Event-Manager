import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer id="app-footer" className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="font-medium text-slate-600">Event Management Dashboard • Next.js + FastAPI</span>
        <span>FastAPI + PostgreSQL + SQLAlchemy + TypeScript</span>
      </div>
    </footer>
  );
};
