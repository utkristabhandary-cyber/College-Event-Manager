export interface EventItem {
  id: number;
  name: str;
  description?: string | null;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  total_attendees?: number;
  present_count?: number;
  absent_count?: number;
  attendance_rate?: number;
}

export type str = string;

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
  event_name?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  is_present?: boolean | null;
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

export interface DashboardOverview {
  total_events: number;
  total_attendees: number;
  total_present: number;
  total_absent: number;
  overall_attendance_rate: number;
  events: EventItem[];
}
