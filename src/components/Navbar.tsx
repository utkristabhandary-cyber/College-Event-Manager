import React from 'react';
import { Calendar, Users, LayoutDashboard, Plus, RotateCcw } from 'lucide-react';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCreateEvent: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateEvent,
  onResetData,
}) => {
  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-900 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-8">
            <button
              id="brand-logo-btn"
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 text-left focus:outline-none group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs transition-transform group-hover:scale-105">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 tracking-tight block">EventSync</span>
                <span className="text-xs text-slate-500 font-medium block">Event & Attendance Manager</span>
              </div>
            </button>

            {/* Navigation Tabs */}
            <nav id="nav-tabs" className="hidden md:flex items-center gap-1.5">
              <button
                id="nav-tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                Dashboard
              </button>

              <button
                id="nav-tab-events"
                onClick={() => setActiveTab('events')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'events' || activeTab === 'event_detail'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-4 h-4 text-indigo-600" />
                Events
              </button>

              <button
                id="nav-tab-attendees"
                onClick={() => setActiveTab('attendees')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'attendees'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4 text-indigo-600" />
                All Attendees
              </button>
            </nav>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              id="reset-demo-data-btn"
              onClick={onResetData}
              title="Reset to default sample data"
              className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 rounded-md transition-colors text-xs font-medium flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Data</span>
            </button>

            <button
              id="header-create-event-btn"
              onClick={onOpenCreateEvent}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Event</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div id="mobile-nav-bar" className="flex md:hidden border-t border-slate-100 py-2 gap-1 overflow-x-auto">
          <button
            id="mobile-tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-1.5 px-2 text-center text-xs font-medium rounded-md ${
              activeTab === 'dashboard' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'
            }`}
          >
            Dashboard
          </button>
          <button
            id="mobile-tab-events"
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-1.5 px-2 text-center text-xs font-medium rounded-md ${
              activeTab === 'events' || activeTab === 'event_detail' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'
            }`}
          >
            Events
          </button>
          <button
            id="mobile-tab-attendees"
            onClick={() => setActiveTab('attendees')}
            className={`flex-1 py-1.5 px-2 text-center text-xs font-medium rounded-md ${
              activeTab === 'attendees' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'
            }`}
          >
            Attendees
          </button>
        </div>
      </div>
    </header>
  );
};
