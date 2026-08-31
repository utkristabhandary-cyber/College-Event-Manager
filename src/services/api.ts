import {
  EventItem,
  EventCreateInput,
  EventUpdateInput,
  AttendeeItem,
  AttendeeCreateInput,
  AttendeeUpdateInput,
  AttendanceRecord,
  DashboardOverviewData,
} from '../types';

const INITIAL_EVENTS: EventItem[] = [
  {
    id: 1,
    name: 'Global Tech Summit 2026',
    description: 'Keynotes on autonomous AI agents, cloud architectures, and scalable platforms.',
    date: '2026-09-18',
    start_time: '09:00',
    end_time: '17:30',
    location: 'Metropolitan Convention Center, Hall A',
  },
  {
    id: 2,
    name: 'Product & Design Systems Workshop',
    description: 'Interactive working session on token-driven UI frameworks and accessibility standards.',
    date: '2026-09-25',
    start_time: '13:00',
    end_time: '16:30',
    location: 'Design Studio B, Innovation Campus',
  },
  {
    id: 3,
    name: 'Full-Stack Developer Meetup',
    description: 'Lightning talks covering FastAPI microservices, Next.js 15 features, and modern DevOps.',
    date: '2026-10-05',
    start_time: '18:30',
    end_time: '21:00',
    location: 'Tech Hub Co-working, 4th Floor',
  },
];

const INITIAL_ATTENDEES: AttendeeItem[] = [
  {
    id: 1,
    event_id: 1,
    name: 'Sarah Chen',
    email: 'sarah.chen@innovate.tech',
    phone: '+1 (415) 555-0142',
    organization: 'Innovate Labs',
    is_present: true,
  },
  {
    id: 2,
    event_id: 1,
    name: 'Marcus Vance',
    email: 'm.vance@cloudscale.io',
    phone: '+1 (206) 555-0188',
    organization: 'CloudScale Systems',
    is_present: true,
  },
  {
    id: 3,
    event_id: 1,
    name: 'Elena Rostova',
    email: 'elena.rostova@dataflux.com',
    phone: '+1 (512) 555-0199',
    organization: 'DataFlux Analytics',
    is_present: false,
  },
  {
    id: 4,
    event_id: 1,
    name: 'Devon Miller',
    email: 'devon@nexustech.org',
    phone: '+1 (617) 555-0123',
    organization: 'Nexus Technologies',
    is_present: true,
  },
  {
    id: 5,
    event_id: 2,
    name: 'Aria Patel',
    email: 'aria.p@studioalpha.design',
    phone: '+1 (312) 555-0177',
    organization: 'Studio Alpha',
    is_present: true,
  },
  {
    id: 6,
    event_id: 2,
    name: 'Lucas Dupont',
    email: 'lucas.dupont@interface.co',
    phone: '+1 (718) 555-0164',
    organization: 'Interface Collective',
    is_present: false,
  },
  {
    id: 7,
    event_id: 2,
    name: 'Zoe Washington',
    email: 'zoe@uxforward.io',
    phone: '+1 (408) 555-0131',
    organization: 'UX Forward',
    is_present: false,
  },
  {
    id: 8,
    event_id: 3,
    name: 'Kenji Takahashi',
    email: 'kenji@hyperbuild.dev',
    phone: '+1 (206) 555-0112',
    organization: 'HyperBuild Devs',
    is_present: true,
  },
  {
    id: 9,
    event_id: 3,
    name: 'Maya Lin',
    email: 'maya.lin@syntaxcraft.com',
    phone: '+1 (415) 555-0155',
    organization: 'Syntax Craft',
    is_present: true,
  },
];

class StorageApiManager {
  private eventsKey = 'event_mgmt_events';
  private attendeesKey = 'event_mgmt_attendees';

  constructor() {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem(this.eventsKey)) {
        localStorage.setItem(this.eventsKey, JSON.stringify(INITIAL_EVENTS));
      }
      if (!localStorage.getItem(this.attendeesKey)) {
        localStorage.setItem(this.attendeesKey, JSON.stringify(INITIAL_ATTENDEES));
      }
    }
  }

  private getEventsFromStorage(): EventItem[] {
    try {
      const data = localStorage.getItem(this.eventsKey);
      return data ? JSON.parse(data) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  }

  private saveEventsToStorage(events: EventItem[]): void {
    try {
      localStorage.setItem(this.eventsKey, JSON.stringify(events));
    } catch (e) {
      console.error('Failed to save events to local storage', e);
    }
  }

  private getAttendeesFromStorage(): AttendeeItem[] {
    try {
      const data = localStorage.getItem(this.attendeesKey);
      return data ? JSON.parse(data) : INITIAL_ATTENDEES;
    } catch {
      return INITIAL_ATTENDEES;
    }
  }

  private saveAttendeesToStorage(attendees: AttendeeItem[]): void {
    try {
      localStorage.setItem(this.attendeesKey, JSON.stringify(attendees));
    } catch (e) {
      console.error('Failed to save attendees to local storage', e);
    }
  }

  private enrichEventWithStats(event: EventItem, attendees: AttendeeItem[]): EventItem {
    const eventAttendees = attendees.filter((a) => a.event_id === event.id);
    const total = eventAttendees.length;
    const present = eventAttendees.filter((a) => a.is_present).length;
    const absent = Math.max(0, total - present);
    const rate = total > 0 ? Math.round((present / total) * 1000) / 10 : 0;

    return {
      ...event,
      total_attendees: total,
      present_count: present,
      absent_count: absent,
      attendance_rate: rate,
    };
  }

  async getDashboardOverview(): Promise<DashboardOverviewData> {
    const events = this.getEventsFromStorage();
    const attendees = this.getAttendeesFromStorage();
    const enrichedEvents = events.map((e) => this.enrichEventWithStats(e, attendees));

    const totalEvents = enrichedEvents.length;
    const totalAttendees = attendees.length;
    const totalPresent = attendees.filter((a) => a.is_present).length;
    const totalAbsent = Math.max(0, totalAttendees - totalPresent);
    const overallRate = totalAttendees > 0 ? Math.round((totalPresent / totalAttendees) * 1000) / 10 : 0;

    return {
      total_events: totalEvents,
      total_attendees: totalAttendees,
      total_present: totalPresent,
      total_absent: totalAbsent,
      overall_attendance_rate: overallRate,
      events: enrichedEvents,
    };
  }

  async getEvents(): Promise<EventItem[]> {
    const events = this.getEventsFromStorage();
    const attendees = this.getAttendeesFromStorage();
    return events.map((e) => this.enrichEventWithStats(e, attendees));
  }

  async getEventById(id: number): Promise<EventItem | null> {
    const events = this.getEventsFromStorage();
    const event = events.find((e) => e.id === id);
    if (!event) return null;
    const attendees = this.getAttendeesFromStorage();
    return this.enrichEventWithStats(event, attendees);
  }

  async createEvent(input: EventCreateInput): Promise<EventItem> {
    const events = this.getEventsFromStorage();
    const newId = events.length > 0 ? Math.max(...events.map((e) => e.id)) + 1 : 1;
    const newEvent: EventItem = {
      id: newId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      date: input.date,
      start_time: input.start_time,
      end_time: input.end_time,
      location: input.location.trim(),
    };
    const updated = [newEvent, ...events];
    this.saveEventsToStorage(updated);
    const attendees = this.getAttendeesFromStorage();
    return this.enrichEventWithStats(newEvent, attendees);
  }

  async updateEvent(id: number, input: EventUpdateInput): Promise<EventItem> {
    const events = this.getEventsFromStorage();
    const index = events.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Event not found');

    const updatedEvent: EventItem = {
      ...events[index],
      ...(input.name !== undefined && { name: input.name.trim() }),
      ...(input.description !== undefined && { description: input.description?.trim() || null }),
      ...(input.date !== undefined && { date: input.date }),
      ...(input.start_time !== undefined && { start_time: input.start_time }),
      ...(input.end_time !== undefined && { end_time: input.end_time }),
      ...(input.location !== undefined && { location: input.location.trim() }),
    };

    events[index] = updatedEvent;
    this.saveEventsToStorage(events);
    const attendees = this.getAttendeesFromStorage();
    return this.enrichEventWithStats(updatedEvent, attendees);
  }

  async deleteEvent(id: number): Promise<boolean> {
    const events = this.getEventsFromStorage();
    const filtered = events.filter((e) => e.id !== id);
    this.saveEventsToStorage(filtered);

    // Cascade delete attendees for this event
    const attendees = this.getAttendeesFromStorage();
    const filteredAttendees = attendees.filter((a) => a.event_id !== id);
    this.saveAttendeesToStorage(filteredAttendees);
    return true;
  }

  async getAttendees(eventId: number, search?: string, organization?: string): Promise<AttendeeItem[]> {
    let attendees = this.getAttendeesFromStorage().filter((a) => a.event_id === eventId);

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      attendees = attendees.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          (a.organization && a.organization.toLowerCase().includes(q))
      );
    }

    if (organization && organization.trim()) {
      const org = organization.toLowerCase().trim();
      attendees = attendees.filter((a) => a.organization && a.organization.toLowerCase().includes(org));
    }

    return attendees;
  }

  async getAllAttendees(): Promise<(AttendeeItem & { eventName?: string })[]> {
    const attendees = this.getAttendeesFromStorage();
    const events = this.getEventsFromStorage();
    const eventMap = new Map(events.map((e) => [e.id, e.name]));

    return attendees.map((a) => ({
      ...a,
      eventName: eventMap.get(a.event_id) || 'Unknown Event',
    }));
  }

  async addAttendee(eventId: number, input: AttendeeCreateInput): Promise<AttendeeItem> {
    const attendees = this.getAttendeesFromStorage();

    // Check duplicate email for same event
    const emailNorm = input.email.toLowerCase().trim();
    const exists = attendees.some(
      (a) => a.event_id === eventId && a.email.toLowerCase().trim() === emailNorm
    );
    if (exists) {
      throw new Error(`Attendee with email '${input.email}' is already registered for this event.`);
    }

    const newId = attendees.length > 0 ? Math.max(...attendees.map((a) => a.id)) + 1 : 1;
    const newAttendee: AttendeeItem = {
      id: newId,
      event_id: eventId,
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone?.trim() || null,
      organization: input.organization?.trim() || null,
      is_present: false,
    };

    attendees.push(newAttendee);
    this.saveAttendeesToStorage(attendees);
    return newAttendee;
  }

  async updateAttendee(id: number, input: AttendeeUpdateInput): Promise<AttendeeItem> {
    const attendees = this.getAttendeesFromStorage();
    const index = attendees.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Attendee not found');

    const current = attendees[index];

    if (input.email && input.email.toLowerCase().trim() !== current.email.toLowerCase().trim()) {
      const emailNorm = input.email.toLowerCase().trim();
      const duplicate = attendees.some(
        (a) => a.event_id === current.event_id && a.id !== id && a.email.toLowerCase().trim() === emailNorm
      );
      if (duplicate) {
        throw new Error(`Email '${input.email}' is already registered by another attendee for this event.`);
      }
    }

    const updated: AttendeeItem = {
      ...current,
      ...(input.name !== undefined && { name: input.name.trim() }),
      ...(input.email !== undefined && { email: input.email.trim() }),
      ...(input.phone !== undefined && { phone: input.phone?.trim() || null }),
      ...(input.organization !== undefined && { organization: input.organization?.trim() || null }),
    };

    attendees[index] = updated;
    this.saveAttendeesToStorage(attendees);
    return updated;
  }

  async deleteAttendee(id: number): Promise<boolean> {
    const attendees = this.getAttendeesFromStorage();
    const filtered = attendees.filter((a) => a.id !== id);
    this.saveAttendeesToStorage(filtered);
    return true;
  }

  async markAttendance(eventId: number, attendeeId: number, isPresent: boolean): Promise<AttendeeItem> {
    const attendees = this.getAttendeesFromStorage();
    const index = attendees.findIndex((a) => a.id === attendeeId && a.event_id === eventId);
    if (index === -1) throw new Error('Attendee not found for this event');

    attendees[index].is_present = isPresent;
    this.saveAttendeesToStorage(attendees);
    return attendees[index];
  }

  async resetData(): Promise<void> {
    this.saveEventsToStorage(INITIAL_EVENTS);
    this.saveAttendeesToStorage(INITIAL_ATTENDEES);
  }
}

export const api = new StorageApiManager();
