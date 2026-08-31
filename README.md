# College Event Manager

A full-stack college event management and attendance system. Organizers can create events, register participants, track attendance, filter participants by section/semester, import participants from Google Forms Excel exports, and view dashboard statistics.

---

## Core Functionality

- **Dashboard**: Global metrics — total events, total participants, present/absent counts, overall attendance rate
- **Event management**: Create, edit, delete, and view events with per-event attendance statistics
- **Participant management**: Add, edit, delete, and search participants
- **Attendance tracking**: Mark participants present/absent, event-isolated records
- **Section filtering**: Filter participants by class section
- **Semester filtering**: Filter participants by semester
- **Participant search**: Search by name, email, or phone number
- **Excel participant import**: Bulk import from Google Forms Excel exports
- **Import preview**: Review detected, valid, invalid, duplicate, and existing rows before importing
- **Duplicate detection**: Duplicate within spreadsheet and already-registered participants are skipped
- **Event-specific participants**: Participants belong to a single event
- **Attendance statistics**: Per-event and global attendance rates

---

## Technology Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: FastAPI, SQLAlchemy 2.0, Pydantic v2
- **Database**: PostgreSQL 15 (SQLite for tests)
- **Containerization**: Docker, Docker Compose
- **Testing**: pytest (backend)

---

## Architecture

Decoupled client-server architecture:

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python 3.11+ + SQLAlchemy 2.0 ORM + Pydantic v2
- **Database**: PostgreSQL 15 (SQLite for isolated tests)
- **Containerization**: Docker Compose

---

## Folder Structure

```text
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── endpoints/   # events, attendees, attendance, dashboard, import
│   │   │   └── api.py       # v1 router aggregator
│   │   ├── core/config.py   # Pydantic Settings & env vars
│   │   ├── db/
│   │   │   ├── base.py      # Declarative Base
│   │   │   ├── session.py   # Engine & session factory
│   │   │   └── migrations.py # Idempotent schema migration
│   │   ├── models/          # event.py, attendee.py, attendance.py
│   │   ├── schemas/         # event.py, attendee.py, attendance.py, dashboard.py, import_schemas.py
│   │   ├── services/        # event_service.py, attendee_service.py, attendance_service.py, import_service.py
│   │   └── main.py          # FastAPI entry point
│   ├── tests/               # conftest.py, test_events.py, test_attendees.py, test_attendance.py, test_import.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── layout.tsx, page.tsx, loading.tsx
│   │   ├── events/          # page.tsx, [id]/page.tsx
│   │   └── attendees/page.tsx
│   ├── components/
│   │   ├── layout/          # Navbar.tsx, Footer.tsx
│   │   ├── dashboard/       # StatsCards.tsx
│   │   ├── events/          # EventCard.tsx, EventFormModal.tsx
│   │   ├── attendees/       # AttendeeTable.tsx, AttendeeModal.tsx, ImportParticipantsModal.tsx
│   │   └── ui/              # DeleteConfirmModal.tsx, Toast.tsx, Spinner.tsx
│   ├── lib/api.ts           # Typed API client
│   ├── types/index.ts       # TypeScript interfaces
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Database Schema

### `events`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | PK, auto-increment | Unique identifier |
| `name` | `VARCHAR(255)` | Not null, indexed | Event title |
| `description` | `TEXT` | Nullable | Detailed description |
| `date` | `DATE` | Not null, indexed | Event date |
| `start_time` | `TIME` | Not null | Start time |
| `end_time` | `TIME` | Not null | End time |
| `location` | `VARCHAR(255)` | Not null | Venue or location |

### `attendees`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | PK, auto-increment | Unique identifier |
| `event_id` | `INTEGER` | FK (`events.id`), cascade delete | Associated event |
| `name` | `VARCHAR(255)` | Not null, indexed | Full name |
| `email` | `VARCHAR(255)` | Not null, indexed | Email address |
| `phone_number` | `VARCHAR(50)` | Not null | Phone number |
| `section` | `VARCHAR(100)` | Not null, indexed | Class/section |
| `semester` | `VARCHAR(20)` | Not null, indexed | Semester |
| **Unique** | | `UNIQUE(event_id, email)` | One email per event |

### `attendances`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | PK, auto-increment | Unique identifier |
| `event_id` | `INTEGER` | FK (`events.id`), cascade delete | Associated event |
| `attendee_id` | `INTEGER` | FK (`attendees.id`), cascade delete | Associated attendee |
| `is_present` | `BOOLEAN` | Not null, default `false` | Present / Absent |
| `marked_at` | `TIMESTAMP` | Server default `NOW()` | Last marked timestamp |
| **Unique** | | `UNIQUE(event_id, attendee_id)` | One record per attendee |

---

## API Endpoints

### Events (`/api/v1/events`)
- `GET    /api/v1/events`                     — List all events with attendance stats
- `POST   /api/v1/events`                     — Create event
- `GET    /api/v1/events/{id}`                 — Get event by ID
- `PUT    /api/v1/events/{id}`                 — Update event
- `DELETE /api/v1/events/{id}`                 — Delete event (cascades)

### Attendees (`/api/v1/events/{event_id}/attendees`)
- `GET    /api/v1/attendees`                   — List all attendees (global), supports `?search=`, `?section=`, `?semester=`
- `GET    /api/v1/events/{event_id}/attendees`  — List attendees for event, supports same filters
- `POST   /api/v1/events/{event_id}/attendees`  — Register attendee (Name, Email, Phone Number, Section, Semester)
- `PUT    /api/v1/attendees/{id}`               — Update attendee
- `DELETE /api/v1/attendees/{id}`               — Delete attendee

### Excel Import (`/api/v1/events/{event_id}/attendees/import`)
- `POST   /api/v1/events/{event_id}/attendees/import/preview`  — Upload `.xlsx`, get validation preview
- `POST   /api/v1/events/{event_id}/attendees/import`           — Confirm and import validated rows

**Expected Excel columns (Google Forms style):** `Name`, `Email`, `Phone Number`, `Section`, `Semester`

### Attendance (`/api/v1/events/{event_id}/attendees/{attendee_id}/attendance`)
- `GET    /api/v1/events/{event_id}/attendance`                 — List all attendance for event
- `PUT    /api/v1/events/{event_id}/attendees/{attendee_id}/attendance` — Mark present/absent

### Dashboard (`/api/v1/dashboard`)
- `GET    /api/v1/dashboard/overview` — Aggregated metrics: total events, attendees, present/absent counts, attendance rate

---

## Run with Docker Compose

```bash
cp .env.example .env
docker compose up --build -d
docker compose ps
```

**Services:**
| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger / API docs | http://localhost:8000/docs (only when `ENVIRONMENT=development`) |

Note: PostgreSQL runs on the internal Docker network and is **not** exposed to the host. It is reachable by the backend via the `postgres://...` service URL.

---

## Run Locally

### Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

For a local run you need a reachable PostgreSQL instance (or set `DATABASE_URL`), with the credentials from `.env`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## Run Tests

Backend tests run against an in-memory SQLite database with no external dependencies:

```bash
cd backend
pytest -v
```

Verified result (Phase 9, final audit): **33/33 tests passed**.

Coverage:
- Event CRUD and time validation
- Attendee CRUD, search, section/semester filtering
- Attendance marking and statistics
- Excel import: preview, confirm, validation, edge cases, event isolation, cascade behavior

---

## Excel Import Workflow

Participants are imported from a Google Forms Excel export:

1. **Google Form** collects responses (Name, Email, Phone Number, Section, Semester, plus often extra columns such as Timestamp, Gender, College ID)
2. **Export responses to Excel** from Google Forms
3. **Upload Excel** (`.xlsx`) on an event detail page
4. **Preview detected data** — the system identifies the required columns (case- and spacing-insensitive, e.g. "Full Name" or "Student Name" map to Name) and reports total/valid/invalid/duplicate/existing counts
5. **Review valid/invalid/existing rows** — each row shows a reason when invalid or already registered
6. **Confirm import** — valid new rows are added
7. **Participants added to event** with a zeroed attendance record

The system intentionally extracts only these five fields and ignores all other columns:

| Field | Notes |
|---|---|
| Name | Required |
| Email | Required, unique per event |
| Phone Number | Required |
| Section | Required |
| Semester | Required |

**Duplicate behavior:**
- Duplicate email within the spreadsheet: the later row is flagged/skipped
- Participant already registered in the event: skipped (never overwritten)
- Invalid rows (missing fields or bad email): skipped with a reason

### Import limits
- Only `.xlsx` files are accepted (`.xls` legacy binary is rejected because it is not supported)
- Maximum file size: 10 MB
- Maximum row count: 5,000
- Files are processed in-memory; they are never written to disk

---

## Environment Variables

Secrets and configuration are supplied through environment variables (see `.env.example`). Real secrets such as the database password live in a local `.env` file that is gitignored and never committed.

| Variable | Purpose | Example |
|---|---|---|
| `POSTGRES_SERVER` | Backend DB host | `localhost` / `postgres` (Docker) |
| `POSTGRES_PORT` | Backend DB port | `5432` |
| `POSTGRES_USER` | DB user | `postgres` |
| `POSTGRES_PASSWORD` | DB password | (set in `.env`) |
| `POSTGRES_DB` | DB name | `event_db` |
| `DATABASE_URL` | Optional full connection string override | `postgresql://user:pass@host:5432/db` |
| `BACKEND_HOST` | Backend bind host | `0.0.0.0` |
| `BACKEND_PORT` | Backend bind port | `8000` |
| `CORS_ORIGINS` | Comma-separated allowed browser origins | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Frontend public API base | `http://localhost:8000/api/v1` |
| `ENVIRONMENT` | `development` or `production` (documents `/docs` visibility) | `development` |

---

## Security

- **Environment-based secrets**: All credentials are read from environment variables; `.env` files are gitignored.
- **No hardcoded API keys**: The repository contains no API keys, private keys, or OAuth tokens (a full secrets scan found none).
- **CORS restrictions**: Backend allows only configured origins (default `http://localhost:3000`) with credentials; methods are limited to `GET`, `POST`, `PUT`, `DELETE`; headers limited to `Content-Type`.
- **Input validation**: All API inputs are validated by Pydantic v2 schemas; invalid input returns `422`.
- **Excel upload validation**: `.xlsx` only, 10 MB size cap, 5,000-row cap, in-memory processing (no disk writes), safe parser configuration (`read_only=True`, `data_only=True`) preventing formula/cached-value issues and resource exhaustion.
- **SQLAlchemy parameterization**: Database access uses SQLAlchemy ORM parameterized queries, preventing SQL injection.
- **Security headers**: The Next.js frontend sends `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, and `X-XSS-Protection` headers.
- **Docker container security**: The frontend runs as a non-root user; PostgreSQL is not exposed to the host network; `.dockerignore` files exclude secrets and build artifacts from image context.
- **Docs gating**: Swagger/ReDoc are only served when `ENVIRONMENT=development`.

### Deployment considerations
- Place the application behind an HTTPS reverse proxy in production (HSTS should be added at the proxy layer; the backend currently serves plain HTTP).
- Set `ENVIRONMENT=production` and a real `CORS_ORIGINS` and `POSTGRES_PASSWORD` in production.
- The backend and database should only be reachable over an internal Docker network.

---

## Limitations

- **No authentication/authorization**: The application is unauthenticated and designed for single-organizer internal use. Anyone with network access to the API can create/modify/delete data. Not recommended for public or multi-tenant deployment without adding auth.
- **No browser automation testing performed**: This audit validated the backend (33/33 tests), the Next.js production build, and live API smoke tests against PostgreSQL. No headless browser UI tests were run.
- **`.xls` not supported**: Excel import accepts `.xlsx` only. Legacy `.xls` files must be re-saved as `.xlsx`.
- **HTTPS/headers**: Strict-Transport-Security and other TLS headers are the responsibility of an upstream reverse proxy; the app itself serves HTTP.
- **Dependency advisories**: `next@14.2.35` (newest in the 14.x line) has upstream advisories that are only fixed in next 15/16. This application does not use the affected features (no `next/image`, no rewrites, no Server Actions, no middleware/i18n), so real-world exposure is low. A future planned major upgrade should address them.

---

## Design Decisions

- **No authentication**: Designed for single-organizer internal use
- **Cascading deletes**: Deleting an event removes all associated attendees and attendance records
- **Idempotent migration**: `migrations.py` runs `CREATE TABLE IF NOT EXISTS` at startup
- **Pydantic v2 schemas**: All API inputs validated against Pydantic models
- **Standalone Next.js build**: Frontend builds as a standalone Node.js server
- **Client Components**: Forms, modals, search/filter, and attendance toggles use React client state; pages and layouts use Server Components where possible
