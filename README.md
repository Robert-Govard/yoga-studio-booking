# Willow Yoga Studio — Booking Site

A full-stack portfolio project: a marketing site for a fictional yoga studio
with a real booking flow (conflict-safe time slots) and a token-gated admin
view of bookings.

## Stack

- **Client:** React + Vite + TypeScript + Tailwind CSS + React Router
- **Server:** Express + TypeScript + Prisma + SQLite (dev) / PostgreSQL (prod)
- **Tests:** Vitest + Supertest (server), Vitest + React Testing Library (client)

## Local development

### Server

```bash
cd server
cp .env.example .env
npm install
npx prisma db push
npm run seed
npm run dev
```

The API runs on http://localhost:4000.

### Client

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

The site runs on http://localhost:5173.

## Running tests

```bash
cd server && npm test
cd client && npm test
```

## Deployment

1. **Database:** create a free PostgreSQL instance on [Neon](https://neon.tech)
   or [Supabase](https://supabase.com). Copy the connection string.
2. **Server (Render):**
   - In `server/prisma/schema.prisma`, change `provider = "sqlite"` to
     `provider = "postgresql"`.
   - Push a new Render Web Service pointing at the `server/` directory.
   - Build command: `npm install && npx prisma generate && npm run build`
   - Start command: `npm start`
   - Env vars: `DATABASE_URL` (from step 1), `ADMIN_TOKEN` (a strong secret)
   - Run `npx prisma db push` once against the production database (via
     Render's shell or a one-off job) before first use — this project uses
     `db push`, not migration files, so there is no `prisma/migrations`
     directory to run `migrate deploy` against. Then run `npm run seed` with
     `DATABASE_URL` set to production to seed services (the seed script is
     idempotent — safe to re-run, it skips seeding if services already exist).
3. **Client (Vercel/Netlify):**
   - Root directory: `client/`
   - Build command: `npm run build`, output directory: `dist`
   - Env var: `VITE_API_URL` = your deployed Render URL

## Admin access

Visit `/admin` and enter the `ADMIN_TOKEN` value to view all bookings.
There is no user management system — this is a single shared token by design.

## Notes on scope

This is a portfolio piece, not a production booking system. Deliberately
out of scope: CORS is fully open (no cookies/credentials are used, so this
is not a CSRF risk, but a real deployment would restrict `Access-Control-Allow-Origin`
to the client's domain), and there is no rate limiting on `POST /bookings`.
