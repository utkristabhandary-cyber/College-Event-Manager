export interface EventItem {
  id: number;
  name: string;
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
  phone_number: string;
  section: string;
  semester: string;
  is_present?: boolean | null;
}

export interface AttendeeCreateInput {
  name: string;
  email: string;
  phone_number: string;
  section: string;
  semester: string;
}

export interface AttendeeUpdateInput {
  name?: string;
  email?: string;
  phone_number?: string;
  section?: string;
  semester?: string;
}

export interface ImportRow {
  row_number: number;
  name: string;
  email: string;
  phone_number: string;
  section: string;
  semester: string;
  errors?: string[] | null;
}

export interface AttendeeImportPreview {
  filename: string;
  detected_columns: string[];
  ignored_column_count: number;
  total_rows: number;
  valid_count: number;
  invalid_count: number;
  duplicate_count: number;
  existing_count: number;
  missing_columns: string[];
  rows: ImportRow[];
}

export interface AttendeeImportResult {
  processed: number;
  imported: number;
  invalid_skipped: number;
  existing_skipped: number;
  duplicate_skipped: number;
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
