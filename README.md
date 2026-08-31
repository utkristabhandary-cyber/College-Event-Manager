# Event Management Dashboard

A production-structured, full-stack web application for event organizers to create events, manage attendees, track real-time attendance, and view aggregated attendance statistics.

---

## 🏗️ Architecture Overview

The system uses a decoupled client-server architecture designed for clean separation of concerns, scalability, and type safety:

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS
  - Modular component structure with clean separation of layout, dashboard metrics, event cards, modals, and attendee roster.
  - Interactive dashboard metrics, search/filter controls, and optimistic attendance status toggling.
- **Backend**: FastAPI + Python 3.11+
  - Clean layered architecture separating Routers, Business Services, SQLAlchemy 2.0 ORM Models, and Pydantic v2 Schemas.
  - Automatic OpenAPI / Swagger interactive documentation at `/docs` and ReDoc at `/redoc`.
- **Database**: PostgreSQL 15 (with SQLite support for isolated unit/integration testing)
  - Relational schema enforcing foreign key cascades and composite uniqueness constraints (`(event_id, email)` and `(event_id, attendee_id)`).
- **Containerization**: Docker & Docker Compose
  - Multi-service composition orchestrating PostgreSQL, FastAPI backend, and Next.js frontend.

---

## 📁 Folder & File Structure

```text
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── events.py       # Event CRUD endpoints & stats calculation
│   │   │       │   ├── attendees.py    # Attendee management endpoints
│   │   │       │   ├── attendance.py   # Attendance marking endpoints
│   │   │       │   └── dashboard.py    # Aggregated metrics endpoint
│   │   │       └── api.py              # API v1 router aggregator
│   │   ├── core/
│   │   │   └── config.py               # Pydantic Settings & environment config
│   │   ├── db/
│   │   │   ├── base.py                 # Declarative Base & model registration
│   │   │   └── session.py              # SQLAlchemy engine & session factory
│   │   ├── models/
│   │   │   ├── event.py                # Event SQLAlchemy Model
│   │   │   ├── attendee.py             # Attendee SQLAlchemy Model
│   │   │   └── attendance.py           # Attendance SQLAlchemy Model
│   │   ├── schemas/
│   │   │   ├── event.py                # Event Pydantic schemas
│   │   │   ├── attendee.py             # Attendee Pydantic schemas
│   │   │   ├── attendance.py           # Attendance Pydantic schemas
│   │   │   └── dashboard.py            # Dashboard metrics schemas
│   │   ├── services/
│   │   │   ├── event_service.py        # Event business logic & stats calculation
│   │   │   ├── attendee_service.py     # Attendee business logic & validation
│   │   │   └── attendance_service.py   # Attendance marking logic
│   │   └── main.py                     # FastAPI application entry point
│   ├── tests/
│   │   ├── conftest.py                 # In-memory DB fixture & TestClient setup
│   │   ├── test_events.py              # Event CRUD tests
│   │   ├── test_attendees.py           # Attendee creation & search tests
│   │   └── test_attendance.py          # Attendance & statistics calculation tests
│   ├── Dockerfile                      # Backend container definition
│   ├── requirements.txt                # Python dependencies
│   └── .env.example                    # Backend environment template
├── frontend/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout with Navbar, Footer & styling
│   │   ├── page.tsx                    # Dashboard overview page
│   │   ├── loading.tsx                 # Loading state with spinner
│   │   ├── globals.css                 # Tailwind CSS styles
│   │   ├── events/
│   │   │   ├── page.tsx                # Events list & filter page
│   │   │   └── [id]/
│   │   │       └── page.tsx            # Event detail & attendee workspace page
│   │   └── attendees/
│   │       └── page.tsx                # Global attendee directory page
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx              # Top navigation bar
│   │   │   └── Footer.tsx              # Application footer
│   │   ├── dashboard/
│   │   │   └── StatsCards.tsx          # Overview metrics cards
│   │   ├── events/
│   │   │   ├── EventCard.tsx           # Event card with progress & stats
│   │   │   └── EventFormModal.tsx      # Create/Edit event modal
│   │   ├── attendees/
│   │   │   ├── AttendeeTable.tsx       # Attendee roster with status toggle
│   │   │   └── AttendeeModal.tsx       # Add/Edit attendee modal
│   │   └── ui/
│   │       ├── DeleteConfirmModal.tsx  # Safe deletion dialog
│   │       ├── Toast.tsx               # Toast notification system
│   │       └── Spinner.tsx             # Loading spinner
│   ├── lib/
│   │   └── api.ts                      # Typed API client
│   ├── types/
│   │   └── index.ts                    # TypeScript models and interfaces
│   ├── Dockerfile                      # Next.js multi-stage container definition
│   ├── package.json                    # Frontend dependencies & scripts
│   ├── next.config.mjs                 # Next.js standalone build configuration
│   ├── tailwind.config.ts              # Tailwind CSS configuration
│   ├── tsconfig.json                   # TypeScript configuration
│   └── .env.example                    # Frontend environment template
├── docker-compose.yml                  # Multi-container service composition
├── .env.example                        # Root environment variables template
└── README.md                           # Project documentation
```

---

## 🗄️ Database Schema & Relationships

### 1. `events` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | Primary Key, Auto-increment | Unique event identifier |
| `name` | `VARCHAR(255)` | Not Null, Indexed | Event title |
| `description` | `TEXT` | Nullable | Detailed description |
| `date` | `DATE` | Not Null, Indexed | Date of the event |
| `start_time` | `TIME` | Not Null | Starting time |
| `end_time` | `TIME` | Not Null | Ending time |
| `location` | `VARCHAR(255)` | Not Null | Venue or virtual location |

### 2. `attendees` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | Primary Key, Auto-increment | Unique attendee identifier |
| `event_id` | `INTEGER` | Foreign Key (`events.id`), Cascade Delete | Associated event |
| `name` | `VARCHAR(255)` | Not Null, Indexed | Full name |
| `email` | `VARCHAR(255)` | Not Null, Indexed | Email address |
| `phone` | `VARCHAR(50)` | Nullable | Phone number |
| `organization`| `VARCHAR(255)` | Nullable | Organization or Company |
| **Unique Constraint** | `UNIQUE(event_id, email)` | Enforces unique email per event |

### 3. `attendances` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | Primary Key, Auto-increment | Unique attendance record identifier |
| `event_id` | `INTEGER` | Foreign Key (`events.id`), Cascade Delete | Associated event |
| `attendee_id`| `INTEGER` | Foreign Key (`attendees.id`), Cascade Delete | Associated attendee |
| `is_present` | `BOOLEAN` | Not Null, Default `FALSE` | Present (`true`) / Absent (`false`) |
| `marked_at` | `TIMESTAMP` | Server Default `NOW()` | Timestamp when last marked |
| **Unique Constraint** | `UNIQUE(event_id, attendee_id)` | Prevents duplicate records per attendee |

---

## 🔌 API Endpoint Reference

### Events (`/api/v1/events`)
- `GET /api/v1/events` — Retrieve all events with computed statistics (`total_attendees`, `present_count`, `absent_count`, `attendance_rate`).
- `POST /api/v1/events` — Create a new event.
- `GET /api/v1/events/{id}` — Retrieve a single event with computed statistics.
- `PUT /api/v1/events/{id}` — Update event details.
- `DELETE /api/v1/events/{id}` — Delete an event and cascade delete attendees/attendance.

### Attendees (`/api/v1/attendees` & `/api/v1/events/{event_id}/attendees`)
- `GET /api/v1/attendees` — List all attendees across events with optional `?search=` and `?organization=`.
- `GET /api/v1/events/{event_id}/attendees` — List attendees for an event (supports `?search=` and `?organization=`).
- `POST /api/v1/events/{event_id}/attendees` — Register attendee for an event (enforces email uniqueness per event).
- `PUT /api/v1/attendees/{id}` — Update attendee contact/organization details.
- `DELETE /api/v1/attendees/{id}` — Delete an attendee.

### Attendance (`/api/v1/events/{event_id}/attendees/{attendee_id}/attendance`)
- `GET /api/v1/events/{event_id}/attendance` — List all attendance records for an event.
- `PUT /api/v1/events/{event_id}/attendees/{attendee_id}/attendance` — Mark attendance status (`is_present: true/false`).

### Dashboard (`/api/v1/dashboard`)
- `GET /api/v1/dashboard/overview` — Get aggregated metrics (`total_events`, `total_attendees`, `total_present`, `total_absent`, `overall_attendance_rate`, `events`).

---

## 🚀 How to Run with Docker Compose

1. **Clone the repository and copy the environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Build and start all containers:**
   ```bash
   docker compose up --build
   ```

3. **Access the services:**
   - **Frontend App**: [http://localhost:3000](http://localhost:3000)
   - **Backend API & Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
   - **PostgreSQL Database**: `localhost:5432`

---

## 💻 How to Run Locally

### 1. Backend (FastAPI + Python 3.11+)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start FastAPI dev server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend (Next.js App Router)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 How to Run Tests

The backend test suite uses `pytest` with an in-memory SQLite database (`sqlite:///:memory:`) and FastAPI's `TestClient` with dependency overrides:

```bash
cd backend
pytest -v
```
