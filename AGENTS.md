# AI-Event-Manager — Agent Instructions

## Project

AI-Event-Manager is a full-stack event management dashboard.

The application allows event organizers to:

- Create, edit, and delete events
- Register and manage attendees
- Track attendee attendance
- Mark attendees Present/Absent
- View event-level attendance statistics
- View global dashboard statistics
- Search and filter attendees and events

## Architecture

This is a decoupled full-stack application.

### Frontend

- Next.js
- App Router
- TypeScript
- Tailwind CSS
- React

Location:

`frontend/`

### Backend

- Python 3.11+
- FastAPI
- SQLAlchemy 2.0
- Pydantic v2

Location:

`backend/`

### Database

- PostgreSQL
- SQLite may be used for isolated automated tests

### Infrastructure

- Docker
- Docker Compose

## Important Existing Structure

Do not arbitrarily restructure the project.

Backend:

- `backend/app/api/v1/` — API routes
- `backend/app/models/` — SQLAlchemy models
- `backend/app/schemas/` — Pydantic schemas
- `backend/app/services/` — business logic
- `backend/app/db/` — database configuration
- `backend/app/core/` — configuration
- `backend/tests/` — tests

Frontend:

- `frontend/app/` — Next.js routes
- `frontend/components/` — reusable UI components
- `frontend/lib/` — API/client utilities
- `frontend/types/` — TypeScript types

## Development Rules

1. Understand the existing code before modifying it.
2. Do not rewrite working code unnecessarily.
3. Do not change the architecture without a clear reason.
4. Preserve existing functionality when making changes.
5. Keep frontend and backend responsibilities separated.
6. Business logic belongs in backend services, not API route handlers.
7. Database access belongs in the database/service layer.
8. Validate external input with Pydantic schemas.
9. Keep TypeScript types synchronized with API responses.
10. Never hard-code secrets or database credentials.
11. Use environment variables for configuration.
12. Do not commit `.env` files or secrets.
13. Prefer small, focused changes over large rewrites.
14. Before creating a new file, check whether an existing file should be extended instead.
15. Before adding a dependency, verify that an existing dependency cannot solve the problem.

## Database Rules

Database integrity must be enforced at the database level where appropriate.

Important constraints include:

- `UNIQUE(event_id, email)` for attendees
- `UNIQUE(event_id, attendee_id)` for attendance
- Foreign-key cascade behavior must be preserved.

Do not modify database relationships casually.

## API Rules

API routes use the `/api/v1/` prefix.

Do not silently rename or remove existing endpoints.

When changing an API:

1. Update the backend implementation.
2. Update the Pydantic schema if necessary.
3. Update the frontend API client.
4. Update TypeScript types if necessary.
5. Update tests.
6. Verify existing consumers are not broken.

## Frontend Rules

Use Server Components where appropriate.

Use Client Components only when client-side interactivity or browser APIs require them.

Interactive functionality such as:

- forms
- modals
- search
- filters
- attendance toggles
- optimistic updates

may use Client Components.

Avoid unnecessary client-side state.

## Testing

Tests are located in:

`backend/tests/`

When changing backend behavior, add or update relevant tests.

Do not delete tests simply because they fail after a change.

Investigate the underlying cause.

## Git

The repository uses Git with the `main` branch.

Before making significant changes:

- inspect `git status`
- understand the current state of the repository

After completing a meaningful change:

- inspect the diff
- run relevant tests
- verify the application still works
- create a clear Git commit when appropriate

Never overwrite or discard user changes without explicit permission.

## Agent Behavior

Act as a senior full-stack engineer.

Before coding:

1. Inspect the relevant files.
2. Understand how the existing implementation works.
3. Identify dependencies and affected components.
4. Explain the intended change briefly.
5. Then implement it.

When debugging:

1. Reproduce or inspect the failure.
2. Find the root cause.
3. Fix the smallest appropriate part of the system.
4. Test the fix.
5. Check for regressions.

Do not guess when the repository can provide the answer.

Do not claim something works unless it has been verified.

## Scope Control

Only modify files relevant to the requested task.

Do not:

- perform unrelated refactors
- rename files unnecessarily
- replace the framework
- replace the database
- introduce a new architecture
- remove existing features

unless explicitly requested.

## Priority

When instructions conflict, follow this priority:

1. Explicit user request
2. These project instructions
3. Existing project architecture and conventions
4. General engineering best practices

When uncertain about a potentially destructive or architectural change, stop and ask before proceeding.