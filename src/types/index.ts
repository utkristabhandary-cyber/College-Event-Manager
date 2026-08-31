export interface EventItem {
  id: number;
  name: string;
  description?: string | null;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS or HH:MM
  end_time: string; // HH:MM:SS or HH:MM
  location: string;
  total_attendees?: number;
  present_count?: number;
  absent_count?: number;
  attendance_rate?: number;
}

export interface EventCreateInput {
  name: string;
  description?: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
}

export interface EventUpdateInput {
  name?: string;
  description?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
}

export interface AttendeeItem {
  id: number;
  event_id: number;
  name: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  is_present?: boolean;
}

export interface AttendeeCreateInput {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
}

export interface AttendeeUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  organization?: string;
}

export interface AttendanceRecord {
  id: number;
  event_id: number;
  attendee_id: number;
  is_present: boolean;
  marked_at?: string;
}

export interface DashboardOverviewData {
  total_events: number;
  total_attendees: number;
  total_present: number;
  total_absent: number;
  overall_attendance_rate: number;
  events: EventItem[];
}

export type ActiveTab = 'dashboard' | 'events' | 'event_detail' | 'attendees';
