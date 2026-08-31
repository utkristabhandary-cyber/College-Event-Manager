import React, { useState, useEffect } from 'react';
import { Search, Users, Mail, Phone, Building, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { AttendeeItem } from '../types';
import { api } from '../services/api';

interface AttendeesDirectoryProps {
  onSelectEvent: (eventId: number) => void;
}

export const AttendeesDirectory: React.FC<AttendeesDirectoryProps> = ({ onSelectEvent }) => {
  const [attendees, setAttendees] = useState<(AttendeeItem & { eventName?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [orgFilter, setOrgFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await api.getAllAttendees();
      setAttendees(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const filtered = attendees.filter((a) => {
    const matchSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      (a.organization && a.organization.toLowerCase().includes(search.toLowerCase())) ||
      (a.eventName && a.eventName.toLowerCase().includes(search.toLowerCase()));

    const matchOrg = !orgFilter || a.organization === orgFilter;
    return matchSearch && matchOrg;
  });

  const organizations = Array.from(
    new Set(attendees.map((a) => a.organization).filter(Boolean) as string[])
  );

  return (
    <div id="attendees-directory-container" className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Attendee Directory</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Global directory of all registered attendees across all organized events.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="directory-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search across all attendees..."
              className="pl-8 pr-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-md text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-56 sm:w-64"
            />
          </div>

          {organizations.length > 0 && (
            <select
              id="directory-org-filter"
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="py-1.5 px-3 bg-zinc-800 border border-zinc-700 rounded-md text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Organizations</option>
              {organizations.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-zinc-400">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2" />
            <span className="text-xs font-medium">Loading attendee directory...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Users className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-zinc-300">No attendees match your search</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/70 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th scope="col" className="px-5 py-3">Attendee Name</th>
                  <th scope="col" className="px-5 py-3">Email & Phone</th>
                  <th scope="col" className="px-5 py-3">Organization</th>
                  <th scope="col" className="px-5 py-3">Registered Event</th>
                  <th scope="col" className="px-5 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-zinc-100">{a.name}</td>
                    <td className="px-5 py-3.5 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <Mail className="w-3 h-3 text-zinc-500" />
                        <span>{a.email}</span>
                      </div>
                      {a.phone && (
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <Phone className="w-3 h-3 text-zinc-500" />
                          <span>{a.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {a.organization ? (
                        <span className="inline-flex items-center gap-1 text-zinc-300">
                          <Building className="w-3 h-3 text-zinc-500" />
                          <span>{a.organization}</span>
                        </span>
                      ) : (
                        <span className="text-zinc-600 italic">None</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => onSelectEvent(a.event_id)}
                        className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>{a.eventName}</span>
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          a.is_present
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {a.is_present ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Present</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-zinc-500" />
                            <span>Absent</span>
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
