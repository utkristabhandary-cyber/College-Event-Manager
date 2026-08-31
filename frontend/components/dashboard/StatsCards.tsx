import React from 'react';
import { Calendar, Users, UserCheck, UserX, Percent } from 'lucide-react';
import { DashboardOverview } from '@/types';

interface StatsCardsProps {
  stats: DashboardOverview;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div id="stats-overview-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Events */}
      <div id="stat-card-total-events" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Events</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold text-slate-900">{stats.total_events}</span>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Active organized events</p>
        </div>
      </div>

      {/* Total Attendees */}
      <div id="stat-card-total-attendees" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Attendees</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold text-slate-900">{stats.total_attendees}</span>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Registered participants</p>
        </div>
      </div>

      {/* Total Present */}
      <div id="stat-card-total-present" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Present</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold text-slate-900">{stats.total_present}</span>
          <p className="text-[11px] text-emerald-600 mt-1 font-bold">Checked in attendees</p>
        </div>
      </div>

      {/* Total Absent */}
      <div id="stat-card-total-absent" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Absent / Pending</span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <UserX className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold text-slate-900">{stats.total_absent}</span>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Awaiting check-in</p>
        </div>
      </div>

      {/* Overall Attendance Rate */}
      <div id="stat-card-attendance-rate" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Attendance</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold text-slate-900">{stats.overall_attendance_rate}%</span>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, stats.overall_attendance_rate))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
