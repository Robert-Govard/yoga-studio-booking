# Yoga Studio Booking Site — Design

## Purpose

Portfolio piece #1 of 3, targeting freelance clients who need a small-business
marketing site with a functional booking flow (e.g. studios, salons, clinics).
Demonstrates: responsive marketing UI, a real booking flow with conflict
checking, a small REST API, and a minimally-gated admin view — without
over-building a multi-tenant SaaS.

## Architecture

Single repository, two apps:

- `client/` — React + Vite + TypeScript + Tailwind CSS (SPA)
- `server/` — Express + TypeScript + Prisma ORM + PostgreSQL

Local development uses a Dockerized Postgres (or SQLite fallback) via Prisma;
production targets a hosted Postgres (Neon/Supabase) with the client on
Vercel/Netlify and the server on Render. Deployment is manual, following the
repo's README — not automated in this build.

## Components

### Client pages
- **Home** — hero, studio intro, class highlights, CTA to booking
- **Services** — list of class/session types with duration and price
- **About** — studio story, instructors
- **Booking** — the core flow:
  1. Pick a service
  2. Pick a date → client fetches `GET /availability?date&serviceId`
  3. Pick an open time slot
  4. Enter name, email, phone
  5. Submit → `POST /bookings`; show confirmation or conflict error
- **Admin** (`/admin`) — single page gated by a bearer token entered once and
  stored in memory/sessionStorage; lists bookings from `GET /admin/bookings`,
  no further admin features (no edit/delete in v1 — YAGNI, this is a
  portfolio piece, not a real ops tool)

### Server
- `GET /services` — static-ish list seeded in the DB
- `GET /availability?date=&serviceId=` — computes open slots for that day by
  subtracting existing bookings from a fixed daily schedule (e.g. 9:00–18:00,
  hourly), per service
- `POST /bookings` — validates payload with zod, re-checks slot is still free
  (race-safe via a DB unique constraint on `(date, timeSlot, serviceId)`,
  not just an application-level check), creates the booking, returns it
- `GET /admin/bookings` — requires `Authorization: Bearer <ADMIN_TOKEN>` env
  value; returns all bookings ordered by date

### Data model (Prisma)
- `Service { id, name, durationMinutes, priceCents }`
- `Booking { id, serviceId, date, timeSlot, customerName, customerEmail, customerPhone, createdAt }`
  with a unique constraint on `(serviceId, date, timeSlot)` to prevent
  double-booking races.

## Error handling
- Client: inline form validation (required fields, email/phone format)
  before submit; on `POST /bookings` 409 (slot taken), show a clear message
  and refresh availability rather than a generic error.
- Server: a single error-handling middleware maps zod validation errors → 400,
  the unique-constraint violation → 409, everything else → 500 with no leaked
  internals.

## Testing
- Server: Vitest + supertest covering — availability computation excludes
  booked slots; booking a free slot succeeds; booking an already-taken slot
  returns 409; invalid payload returns 400.
- Client: a couple of React Testing Library tests for the booking form
  (validation blocks submit; successful submit shows confirmation) — not
  full coverage, enough to demonstrate testing practice.

## Out of scope (v1)
- Payments/deposits
- Email/SMS confirmations
- Multi-admin auth / user accounts
- Editing or cancelling bookings from the admin view
- i18n

## Deployment notes (manual, documented in README)
1. Provision Postgres (Neon/Supabase free tier), run `prisma migrate deploy`
2. Deploy `server/` to Render (env: `DATABASE_URL`, `ADMIN_TOKEN`)
3. Deploy `client/` to Vercel/Netlify (env: `VITE_API_URL`)
