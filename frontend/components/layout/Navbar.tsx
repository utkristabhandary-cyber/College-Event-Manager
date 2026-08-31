'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, LayoutDashboard, Users, Plus } from 'lucide-react';

interface NavbarProps {
  onOpenCreateEvent?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateEvent }) => {
  const pathname = usePathname();

  const isDashboard = pathname === '/';
  const isEvents = pathname.startsWith('/events');
  const isAttendees = pathname.startsWith('/attendees');

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-900 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-3 text-left focus:outline-none group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs transition-transform group-hover:scale-105">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 tracking-tight block">EventSync</span>
                <span className="text-xs text-slate-500 font-medium block">Event & Attendance Manager</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav id="nav-tabs" className="hidden md:flex items-center gap-1.5">
              <Link
                id="nav-tab-dashboard"
                href="/"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isDashboard
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                Dashboard
              </Link>

              <Link
                id="nav-tab-events"
                href="/events"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isEvents
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-4 h-4 text-indigo-600" />
                Events
              </Link>

              <Link
                id="nav-tab-attendees"
                href="/attendees"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isAttendees
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4 text-indigo-600" />
                All Attendees
              </Link>
            </nav>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            {onOpenCreateEvent && (
              <button
                id="header-create-event-btn"
                onClick={onOpenCreateEvent}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ New Event</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div id="mobile-nav-bar" className="flex md:hidden border-t border-slate-100 py-2 gap-1 overflow-x-auto">
          <Link
            id="mobile-tab-dashboard"
            href="/"
            className={`flex-1 py-1.5 px-2 text-center text-xs font-medium rounded-md ${
              isDashboard ? 'bg-slate-100 text-slate-900' : 'text-slate-500'
            }`}
          >
            Dashboard
          </Link>
          <Link
            id="mobile-tab-events"
            href="/events"
            className={`flex-1 py-1.5 px-2 text-center text-xs font-medium rounded-md ${
              isEvents ? 'bg-slate-100 text-slate-900' : 'text-slate-500'
            }`}
          >
            Events
          </Link>
          <Link
            id="mobile-tab-attendees"
            href="/attendees"
            className={`flex-1 py-1.5 px-2 text-center text-xs font-medium rounded-md ${
              isAttendees ? 'bg-slate-100 text-slate-900' : 'text-slate-500'
            }`}
          >
            Attendees
          </Link>
        </div>
      </div>
    </header>
  );
};
