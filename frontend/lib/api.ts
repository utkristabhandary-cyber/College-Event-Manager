import {
  EventItem,
  EventCreateInput,
  EventUpdateInput,
  AttendeeItem,
  AttendeeCreateInput,
  AttendeeUpdateInput,
  AttendanceRecord,
  DashboardOverview,
} from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window === 'undefined'
    ? process.env.INTERNAL_API_URL || 'http://backend:8000/api/v1'
    : 'http://localhost:8000/api/v1');

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson && errorJson.detail) {
        errorDetail = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
      }
    } catch {
      // ignore parse error
    }
    throw new Error(errorDetail);
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  return response.json();
}

export const api = {
  // Dashboard
  getDashboardOverview: (): Promise<DashboardOverview> => {
    return fetchJson<DashboardOverview>('/dashboard/overview');
  },

  // Events
  getEvents: (): Promise<EventItem[]> => {
    return fetchJson<EventItem[]>('/events');
  },

  getEvent: (id: number): Promise<EventItem> => {
    return fetchJson<EventItem>(`/events/${id}`);
  },

  createEvent: (data: EventCreateInput): Promise<EventItem> => {
    return fetchJson<EventItem>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateEvent: (id: number, data: EventUpdateInput): Promise<EventItem> => {
    return fetchJson<EventItem>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteEvent: (id: number): Promise<void> => {
    return fetchJson<void>(`/events/${id}`, {
      method: 'DELETE',
    });
  },

  // Attendees
  getAllAttendees: (params?: { search?: string; organization?: string }): Promise<AttendeeItem[]> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.organization) searchParams.set('organization', params.organization);
    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return fetchJson<AttendeeItem[]>(`/attendees${queryStr}`);
  },

  getEventAttendees: (
    eventId: number,
    params?: { search?: string; organization?: string }
  ): Promise<AttendeeItem[]> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.organization) searchParams.set('organization', params.organization);
    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return fetchJson<AttendeeItem[]>(`/events/${eventId}/attendees${queryStr}`);
  },

  createAttendee: (eventId: number, data: AttendeeCreateInput): Promise<AttendeeItem> => {
    return fetchJson<AttendeeItem>(`/events/${eventId}/attendees`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateAttendee: (id: number, data: AttendeeUpdateInput): Promise<AttendeeItem> => {
    return fetchJson<AttendeeItem>(`/attendees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteAttendee: (id: number): Promise<void> => {
    return fetchJson<void>(`/attendees/${id}`, {
      method: 'DELETE',
    });
  },

  // Attendance
  markAttendance: (eventId: number, attendeeId: number, isPresent: boolean): Promise<AttendanceRecord> => {
    return fetchJson<AttendanceRecord>(`/events/${eventId}/attendees/${attendeeId}/attendance`, {
      method: 'PUT',
      body: JSON.stringify({ is_present: isPresent }),
    });
  },
};
