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
   - Run `npx prisma migrate deploy` once against the production database
     (via Render's shell or a one-off job) before first use, then `npm run seed`
     with `DATABASE_URL` set to production to seed services.
3. **Client (Vercel/Netlify):**
   - Root directory: `client/`
   - Build command: `npm run build`, output directory: `dist`
   - Env var: `VITE_API_URL` = your deployed Render URL

## Admin access

Visit `/admin` and enter the `ADMIN_TOKEN` value to view all bookings.
There is no user management system — this is a single shared token by design.
