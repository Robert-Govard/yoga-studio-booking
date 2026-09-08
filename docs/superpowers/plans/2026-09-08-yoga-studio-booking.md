# Yoga Studio Booking Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a two-app portfolio project — a public marketing/booking site for a fictional yoga studio and a small admin view — demonstrating a real REST API with race-safe booking logic, not just static CRUD.

**Architecture:** `server/` is an Express + TypeScript + Prisma API backed by SQLite for local dev/tests (swap to Postgres for production per README). `client/` is a Vite + React + TypeScript + Tailwind SPA that talks to the API over `fetch`. Booking conflicts are prevented by a DB-level unique constraint, not just application logic.

**Tech Stack:** Express, TypeScript, Prisma, SQLite (dev/test) / PostgreSQL (prod), Zod, Vitest, Supertest, React 18, Vite, React Router, Tailwind CSS, @testing-library/react.

**Spec:** `docs/superpowers/specs/2026-09-08-yoga-studio-booking-design.md`

## Global Constraints

- Two sub-apps in one repo: `server/` and `client/` — no monorepo tooling (no Nx/Turborepo), just two independent npm projects with their own `package.json`.
- Language: TypeScript everywhere, strict mode on.
- No authentication system for customers — booking requires no account. Admin view uses a single bearer token from `ADMIN_TOKEN` env var, no user table.
- Booking slots are fixed daily hours 09:00–17:00 (hourly, 9 slots/day) for every service — no per-service custom schedules in v1.
- Double-booking is prevented by a Prisma `@@unique([serviceId, date, timeSlot])` constraint — the API must treat the resulting Prisma `P2002` error as a 409, not a 500.
- No payments, no email/SMS confirmations, no booking edit/cancel — out of scope per spec.
- Every task must leave `npm test` passing in whichever app(s) it touched.

---

### Task 1: Server bootstrap — Express app with health check

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/.gitignore`
- Create: `server/src/app.ts`
- Create: `server/src/index.ts`
- Create: `server/vitest.config.ts`
- Test: `server/tests/health.test.ts`

**Interfaces:**
- Produces: `createApp(): express.Express` from `server/src/app.ts`, used by every later server task and by tests via supertest.

- [ ] **Step 1: Create the server package**

```bash
mkdir -p "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking/server/src"
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking/server"
npm init -y
npm install express cors
npm install -D typescript tsx vitest supertest @types/express @types/cors @types/supertest @types/node
npx tsc --init
```

- [ ] **Step 2: Write `server/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 3: Write `server/.gitignore`**

```
node_modules
dist
*.db
.env
```

- [ ] **Step 4: Write `server/src/app.ts`**

```typescript
import express from 'express';
import cors from 'cors';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
}
```

- [ ] **Step 5: Write `server/src/index.ts`**

```typescript
import { createApp } from './app';

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
createApp().listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
```

- [ ] **Step 6: Write `server/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
  },
});
```

- [ ] **Step 7: Write the failing test — `server/tests/health.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

describe('GET /health', () => {
  it('returns status ok', async () => {
    const res = await request(createApp()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
```

- [ ] **Step 8: Add test/dev scripts to `server/package.json`**

Edit the `"scripts"` section to:

```json
"scripts": {
  "dev": "tsx watch src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "test": "vitest run"
}
```

- [ ] **Step 9: Run the test and verify it passes**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking/server"
npm test
```
Expected: PASS (1 test).

- [ ] **Step 10: Commit**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking"
git add server/
git commit -m "Bootstrap Express server with health check"
```

---

### Task 2: Service model + `GET /services`

**Files:**
- Create: `server/prisma/schema.prisma`
- Create: `server/prisma/seed.ts`
- Create: `server/.env`
- Create: `server/src/lib/prisma.ts`
- Create: `server/src/routes/services.ts`
- Modify: `server/src/app.ts`
- Test: `server/tests/services.test.ts`
- Test: `server/tests/setup.ts`

**Interfaces:**
- Consumes: `createApp()` from Task 1.
- Produces: `prisma` singleton from `server/src/lib/prisma.ts` (used by every later route); `servicesRouter` mounted at `/services`.

- [ ] **Step 1: Install Prisma and initialize**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking/server"
npm install @prisma/client zod
npm install -D prisma dotenv
```

- [ ] **Step 2: Write `server/prisma/schema.prisma`**

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Service {
  id              String    @id @default(cuid())
  name            String
  durationMinutes Int
  priceCents      Int
  bookings        Booking[]
}

model Booking {
  id            String   @id @default(cuid())
  serviceId     String
  service       Service  @relation(fields: [serviceId], references: [id])
  date          String
  timeSlot      String
  customerName  String
  customerEmail String
  customerPhone String
  createdAt     DateTime @default(now())

  @@unique([serviceId, date, timeSlot])
}
```

- [ ] **Step 3: Write `server/.env`**

```
DATABASE_URL="file:./dev.db"
ADMIN_TOKEN="dev-admin-token"
PORT=4000
```

- [ ] **Step 4: Push schema to dev and test databases**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking/server"
npx prisma generate
npx prisma db push
DATABASE_URL="file:./test.db" npx prisma db push
```

- [ ] **Step 5: Write `server/prisma/seed.ts`**

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.service.createMany({
    data: [
      { name: 'Vinyasa Flow (60 min)', durationMinutes: 60, priceCents: 2500 },
      { name: 'Restorative Yoga (75 min)', durationMinutes: 75, priceCents: 3000 },
      { name: 'Private 1:1 Session (60 min)', durationMinutes: 60, priceCents: 8000 },
    ],
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
```

Add to `server/package.json` `"scripts"`:

```json
"seed": "tsx prisma/seed.ts"
```

Run it against the dev DB:

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking/server"
npm run seed
```

- [ ] **Step 6: Write `server/src/lib/prisma.ts`**

```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
```

- [ ] **Step 7: Write `server/tests/setup.ts`**

```typescript
process.env.DATABASE_URL = 'file:./test.db';
process.env.ADMIN_TOKEN = 'test-admin-token';
```

Update `server/vitest.config.ts` to load it:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
  },
});
```

- [ ] **Step 8: Write the failing test — `server/tests/services.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';

describe('GET /services', () => {
  beforeEach(async () => {
    await prisma.booking.deleteMany();
    await prisma.service.deleteMany();
  });

  it('returns seeded services', async () => {
    await prisma.service.create({
      data: { name: 'Vinyasa Flow', durationMinutes: 60, priceCents: 2500 },
    });

    const res = await request(createApp()).get('/services');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ name: 'Vinyasa Flow', priceCents: 2500 });
  });
});
```

- [ ] **Step 9: Run test to verify it fails**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking/server"
npm test
```
Expected: FAIL — `Cannot find module '../src/routes/services'` or 404 on `/services`.

- [ ] **Step 10: Write `server/src/routes/services.ts`**

```typescript
import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const servicesRouter = Router();

servicesRouter.get('/', async (_req, res, next) => {
  try {
    const services = await prisma.service.findMany();
    res.json(services);
  } catch (err) {
    next(err);
  }
});
```

- [ ] **Step 11: Mount the router in `server/src/app.ts`**

```typescript
import express from 'express';
import cors from 'cors';
import { servicesRouter } from './routes/services';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/services', servicesRouter);

  return app;
}
```

- [ ] **Step 12: Run tests and verify they pass**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking/server"
npm test
```
Expected: PASS (2 tests).

- [ ] **Step 13: Commit**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking"
git add server/
git commit -m "Add Service model and GET /services endpoint"
```

---

### Task 3: Availability logic + `GET /availability`

**Files:**
- Create: `server/src/lib/availability.ts`
- Create: `server/src/routes/availability.ts`
- Modify: `server/src/app.ts`
- Test: `server/tests/availability.test.ts`
- Test: `server/tests/availability.unit.test.ts`

**Interfaces:**
- Consumes: `prisma` from Task 2.
- Produces: `DAILY_SLOTS: string[]` and `computeOpenSlots(bookedSlots: string[]): string[]` from `server/src/lib/availability.ts`, used by the availability route and reused conceptually by the booking route's conflict messaging.

- [ ] **Step 1: Write the failing unit test — `server/tests/availability.unit.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { computeOpenSlots, DAILY_SLOTS } from '../src/lib/availability';

describe('computeOpenSlots', () => {
  it('returns all slots when nothing is booked', () => {
    expect(computeOpenSlots([])).toEqual(DAILY_SLOTS);
  });

  it('excludes booked slots', () => {
    const result = computeOpenSlots(['09:00', '14:00']);
    expect(result).not.toContain('09:00');
    expect(result).not.toContain('14:00');
    expect(result).toHaveLength(DAILY_SLOTS.length - 2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking/server"
npm test
```
Expected: FAIL — module `../src/lib/availability` not found.

- [ ] **Step 3: Write `server/src/lib/availability.ts`**

```typescript
export const DAILY_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00',
];

export function computeOpenSlots(bookedSlots: string[]): string[] {
  return DAILY_SLOTS.filter((slot) => !bookedSlots.includes(slot));
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking/server"
npm test
```
Expected: PASS.

- [ ] **Step 5: Write the failing integration test — `server/tests/availability.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';

describe('GET /availability', () => {
  beforeEach(async () => {
    await prisma.booking.deleteMany();
    await prisma.service.deleteMany();
  });

  it('excludes already-booked slots for that service and date', async () => {
    const service = await prisma.service.create({
      data: { name: 'Vinyasa Flow', durationMinutes: 60, priceCents: 2500 },
    });
    await prisma.booking.create({
      data: {
        serviceId: service.id,
        date: '2026-10-01',
        timeSlot: '09:00',
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        customerPhone: '5551234567',
      },
    });

    const res = await request(createApp())
      .get('/availability')
      .query({ date: '2026-10-01', serviceId: service.id });

    expect(res.status).toBe(200);
    expect(res.body.openSlots).not.toContain('09:00');
    expect(res.body.openSlots).toContain('10:00');
  });

  it('returns 400 when date or serviceId is missing', async () => {
    const res = await request(createApp()).get('/availability').query({ date: '2026-10-01' });
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking/server"
npm test
```
Expected: FAIL — 404 on `/availability`.

- [ ] **Step 7: Write `server/src/routes/availability.ts`**

```typescript
import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { computeOpenSlots } from '../lib/availability';

export const availabilityRouter = Router();

availabilityRouter.get('/', async (req, res, next) => {
  try {
    const { date, serviceId } = req.query;
    if (typeof date !== 'string' || typeof serviceId !== 'string') {
      res.status(400).json({ error: 'date and serviceId query params are required' });
      return;
    }

    const bookings = await prisma.booking.findMany({
      where: { date, serviceId },
      select: { timeSlot: true },
    });

    res.json({
      date,
      serviceId,
      openSlots: computeOpenSlots(bookings.map((b) => b.timeSlot)),
    });
  } catch (err) {
    next(err);
  }
});
```

- [ ] **Step 8: Mount the router in `server/src/app.ts`**

```typescript
import express from 'express';
import cors from 'cors';
import { servicesRouter } from './routes/services';
import { availabilityRouter } from './routes/availability';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/services', servicesRouter);
  app.use('/availability', availabilityRouter);

  return app;
}
```

- [ ] **Step 9: Run tests and verify they pass**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking/server"
npm test
```
Expected: PASS (6 tests).

- [ ] **Step 10: Commit**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking"
git add server/
git commit -m "Add availability calculation and GET /availability endpoint"
```

---

### Task 4: `POST /bookings` with validation, conflict handling, and centralized error handling

**Files:**
- Create: `server/src/validation/booking.ts`
- Create: `server/src/routes/bookings.ts`
- Create: `server/src/middleware/errorHandler.ts`
- Modify: `server/src/app.ts`
- Test: `server/tests/bookings.test.ts`

**Interfaces:**
- Consumes: `prisma` from Task 2, `computeOpenSlots`/booking model shape from Task 3.
- Produces: `bookingSchema` (zod) and `BookingInput` type from `server/src/validation/booking.ts`, reused by the client's TypeScript types by convention (not imported directly — client and server are separate npm projects).

- [ ] **Step 1: Write the failing test — `server/tests/bookings.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';

describe('POST /bookings', () => {
  beforeEach(async () => {
    await prisma.booking.deleteMany();
    await prisma.service.deleteMany();
  });

  it('creates a booking for an open slot', async () => {
    const service = await prisma.service.create({
      data: { name: 'Vinyasa Flow', durationMinutes: 60, priceCents: 2500 },
    });

    const res = await request(createApp()).post('/bookings').send({
      serviceId: service.id,
      date: '2026-10-01',
      timeSlot: '09:00',
      customerName: 'Jane Doe',
      customerEmail: 'jane@example.com',
      customerPhone: '5551234567',
    });

    expect(res.status).toBe(201);
    expect(res.body.timeSlot).toBe('09:00');
  });

  it('returns 409 when the slot is already booked', async () => {
    const service = await prisma.service.create({
      data: { name: 'Vinyasa Flow', durationMinutes: 60, priceCents: 2500 },
    });
    await prisma.booking.create({
      data: {
        serviceId: service.id,
        date: '2026-10-01',
        timeSlot: '09:00',
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        customerPhone: '5551234567',
      },
    });

    const res = await request(createApp()).post('/bookings').send({
      serviceId: service.id,
      date: '2026-10-01',
      timeSlot: '09:00',
      customerName: 'John Roe',
      customerEmail: 'john@example.com',
      customerPhone: '5559876543',
    });

    expect(res.status).toBe(409);
  });

  it('returns 400 for an invalid payload', async () => {
    const res = await request(createApp()).post('/bookings').send({ serviceId: '' });
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking/server"
npm test
```
Expected: FAIL — 404 on `/bookings`.

- [ ] **Step 3: Write `server/src/validation/booking.ts`**

```typescript
import { z } from 'zod';

export const bookingSchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  timeSlot: z.string().regex(/^([01]\d|2[0-3]):00$/, 'timeSlot must be HH:00'),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(6),
});

export type BookingInput = z.infer<typeof bookingSchema>;
```

- [ ] **Step 4: Write `server/src/middleware/errorHandler.ts`**

```typescript
import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Invalid request', details: err.issues });
    return;
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    res.status(409).json({ error: 'This time slot was just booked. Please pick another.' });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
};
```

- [ ] **Step 5: Write `server/src/routes/bookings.ts`**

```typescript
import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { bookingSchema } from '../validation/booking';

export const bookingsRouter = Router();

bookingsRouter.post('/', async (req, res, next) => {
  try {
    const input = bookingSchema.parse(req.body);
    const booking = await prisma.booking.create({ data: input });
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
});
```

- [ ] **Step 6: Mount the router and error handler in `server/src/app.ts`**

```typescript
import express from 'express';
import cors from 'cors';
import { servicesRouter } from './routes/services';
import { availabilityRouter } from './routes/availability';
import { bookingsRouter } from './routes/bookings';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/services', servicesRouter);
  app.use('/availability', availabilityRouter);
  app.use('/bookings', bookingsRouter);

  app.use(errorHandler);

  return app;
}
```

- [ ] **Step 7: Run tests and verify they pass**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking/server"
npm test
```
Expected: PASS (9 tests).

- [ ] **Step 8: Commit**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking"
git add server/
git commit -m "Add POST /bookings with validation and conflict handling"
```

---

### Task 5: Admin auth + `GET /admin/bookings`

**Files:**
- Create: `server/src/middleware/adminAuth.ts`
- Create: `server/src/routes/admin.ts`
- Modify: `server/src/app.ts`
- Test: `server/tests/admin.test.ts`

**Interfaces:**
- Consumes: `prisma` from Task 2, `ADMIN_TOKEN` env var (set in `tests/setup.ts` for tests, `.env` for dev).
- Produces: `adminAuth` middleware, reusable by any future admin route (none planned in v1).

- [ ] **Step 1: Write the failing test — `server/tests/admin.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';

describe('GET /admin/bookings', () => {
  beforeEach(async () => {
    await prisma.booking.deleteMany();
    await prisma.service.deleteMany();
  });

  it('rejects requests without a valid token', async () => {
    const res = await request(createApp()).get('/admin/bookings');
    expect(res.status).toBe(401);
  });

  it('returns bookings for a valid token', async () => {
    const service = await prisma.service.create({
      data: { name: 'Vinyasa Flow', durationMinutes: 60, priceCents: 2500 },
    });
    await prisma.booking.create({
      data: {
        serviceId: service.id,
        date: '2026-10-01',
        timeSlot: '09:00',
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        customerPhone: '5551234567',
      },
    });

    const res = await request(createApp())
      .get('/admin/bookings')
      .set('Authorization', `Bearer ${process.env.ADMIN_TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].service.name).toBe('Vinyasa Flow');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking/server"
npm test
```
Expected: FAIL — 404 on `/admin/bookings`.

- [ ] **Step 3: Write `server/src/middleware/adminAuth.ts`**

```typescript
import { RequestHandler } from 'express';

export const adminAuth: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token || token !== process.env.ADMIN_TOKEN) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
};
```

- [ ] **Step 4: Write `server/src/routes/admin.ts`**

```typescript
import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { adminAuth } from '../middleware/adminAuth';

export const adminRouter = Router();

adminRouter.get('/bookings', adminAuth, async (_req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { date: 'asc' },
      include: { service: true },
    });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});
```

- [ ] **Step 5: Mount the router in `server/src/app.ts`**

```typescript
import express from 'express';
import cors from 'cors';
import { servicesRouter } from './routes/services';
import { availabilityRouter } from './routes/availability';
import { bookingsRouter } from './routes/bookings';
import { adminRouter } from './routes/admin';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/services', servicesRouter);
  app.use('/availability', availabilityRouter);
  app.use('/bookings', bookingsRouter);
  app.use('/admin', adminRouter);

  app.use(errorHandler);

  return app;
}
```

- [ ] **Step 6: Run tests and verify they pass**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking/server"
npm test
```
Expected: PASS (11 tests). The server is now feature-complete.

- [ ] **Step 7: Commit**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking"
git add server/
git commit -m "Add admin auth middleware and GET /admin/bookings"
```

---

### Task 6: Client bootstrap — Vite + React + Tailwind + routing shell

**Files:**
- Create: `client/` (via Vite scaffold)
- Create: `client/tailwind.config.js`
- Create: `client/postcss.config.js`
- Modify: `client/src/index.css`
- Create: `client/src/components/Nav.tsx`
- Create: `client/src/components/Footer.tsx`
- Create: `client/src/pages/Home.tsx`
- Modify: `client/src/App.tsx`
- Create: `client/vitest.config.ts`
- Create: `client/src/test/setup.ts`
- Test: `client/src/App.test.tsx`

**Interfaces:**
- Produces: `<App />` with a `Nav`/`Footer` layout and `/` route rendering `Home`, the shell every later page task adds routes to.

- [ ] **Step 1: Scaffold the Vite project**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking"
npm create vite@latest client -- --template react-ts
cd client
npm install
npm install react-router-dom
npm install -D tailwindcss postcss autoprefixer vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
npx tailwindcss init -p
```

- [ ] **Step 2: Configure Tailwind — `client/tailwind.config.js`**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
```

- [ ] **Step 3: Replace `client/src/index.css` with Tailwind directives**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 4: Write `client/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

- [ ] **Step 5: Write `client/src/test/setup.ts`**

```typescript
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 6: Add a `test` script to `client/package.json`**

Edit the `"scripts"` section to include:

```json
"test": "vitest run"
```

- [ ] **Step 7: Write `client/src/components/Nav.tsx`**

```tsx
import { NavLink } from 'react-router-dom';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm font-medium ${isActive ? 'text-emerald-700' : 'text-gray-600 hover:text-emerald-700'}`;

export function Nav() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <span className="text-lg font-semibold text-emerald-800">Willow Yoga Studio</span>
        <div className="flex gap-1">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/services" className={linkClass}>Services</NavLink>
          <NavLink to="/about" className={linkClass}>About</NavLink>
          <NavLink to="/booking" className={linkClass}>Book Now</NavLink>
        </div>
      </nav>
    </header>
  );
}
```

- [ ] **Step 8: Write `client/src/components/Footer.tsx`**

```tsx
export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-500">
      © {new Date().getFullYear()} Willow Yoga Studio. All rights reserved.
    </footer>
  );
}
```

- [ ] **Step 9: Write `client/src/pages/Home.tsx`**

```tsx
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-emerald-900">Find your breath. Find your flow.</h1>
      <p className="mt-4 text-lg text-gray-600">
        Willow Yoga Studio offers Vinyasa, Restorative, and private sessions in a calm,
        welcoming space.
      </p>
      <Link
        to="/booking"
        className="mt-8 inline-block rounded-md bg-emerald-700 px-6 py-3 text-white hover:bg-emerald-800"
      >
        Book a class
      </Link>
    </main>
  );
}
```

- [ ] **Step 10: Write `client/src/App.tsx`**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <Nav />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
```

- [ ] **Step 11: Write the test — `client/src/App.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the home page with a booking link', () => {
    render(<App />);
    expect(screen.getByText(/Find your breath/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /book a class/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 12: Run the test and verify it passes**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking/client"
npm test
```
Expected: PASS (1 test).

- [ ] **Step 13: Commit**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking"
git add client/
git commit -m "Bootstrap Vite/React/Tailwind client with routing shell"
```

---

### Task 7: API client + Services and About pages

**Files:**
- Create: `client/.env`
- Create: `client/src/types.ts`
- Create: `client/src/api/client.ts`
- Create: `client/src/pages/Services.tsx`
- Create: `client/src/pages/About.tsx`
- Modify: `client/src/App.tsx`
- Test: `client/src/pages/Services.test.tsx`

**Interfaces:**
- Consumes: the App shell from Task 6.
- Produces: `getServices()`, `Service` type, and `API_URL` convention from `client/src/api/client.ts` / `client/src/types.ts`, reused by Task 8's booking page and Task 9's admin page.

- [ ] **Step 1: Write `client/.env`**

```
VITE_API_URL=http://localhost:4000
```

- [ ] **Step 2: Write `client/src/types.ts`**

```typescript
export interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
}

export interface Booking {
  id: string;
  serviceId: string;
  service: Service;
  date: string;
  timeSlot: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
}
```

- [ ] **Step 3: Write `client/src/api/client.ts`**

```typescript
import type { Service, Booking } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function getServices(): Promise<Service[]> {
  const res = await fetch(`${API_URL}/services`);
  if (!res.ok) throw new Error('Failed to load services');
  return res.json();
}

export async function getAvailability(
  date: string,
  serviceId: string,
): Promise<{ openSlots: string[] }> {
  const res = await fetch(
    `${API_URL}/availability?date=${encodeURIComponent(date)}&serviceId=${encodeURIComponent(serviceId)}`,
  );
  if (!res.ok) throw new Error('Failed to load availability');
  return res.json();
}

export interface CreateBookingInput {
  serviceId: string;
  date: string;
  timeSlot: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const res = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (res.status === 409) throw new Error('SLOT_TAKEN');
  if (!res.ok) throw new Error('Failed to create booking');
  return res.json();
}

export async function getAdminBookings(token: string): Promise<Booking[]> {
  const res = await fetch(`${API_URL}/admin/bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load bookings');
  return res.json();
}
```

- [ ] **Step 4: Write the failing test — `client/src/pages/Services.test.tsx`**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Services } from './Services';
import * as api from '../api/client';

describe('Services page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders services fetched from the API', async () => {
    vi.spyOn(api, 'getServices').mockResolvedValue([
      { id: '1', name: 'Vinyasa Flow', durationMinutes: 60, priceCents: 2500 },
    ]);

    render(
      <MemoryRouter>
        <Services />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Vinyasa Flow')).toBeInTheDocument();
    });
    expect(screen.getByText('$25.00')).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking/client"
npm test
```
Expected: FAIL — `./Services` module not found.

- [ ] **Step 6: Write `client/src/pages/Services.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getServices } from '../api/client';
import type { Service } from '../types';

export function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getServices()
      .then(setServices)
      .catch(() => setError('Could not load services right now.'));
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold text-emerald-900">Our Classes</h1>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      <ul className="mt-8 grid gap-6 sm:grid-cols-2">
        {services.map((service) => (
          <li key={service.id} className="rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold">{service.name}</h2>
            <p className="mt-1 text-gray-600">{service.durationMinutes} minutes</p>
            <p className="mt-2 text-lg font-medium text-emerald-800">
              ${(service.priceCents / 100).toFixed(2)}
            </p>
          </li>
        ))}
      </ul>
      <Link
        to="/booking"
        className="mt-8 inline-block rounded-md bg-emerald-700 px-6 py-3 text-white hover:bg-emerald-800"
      >
        Book a class
      </Link>
    </main>
  );
}
```

- [ ] **Step 7: Write `client/src/pages/About.tsx`**

```tsx
export function About() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-emerald-900">About Willow Yoga Studio</h1>
      <p className="mt-4 text-gray-700">
        Founded in 2019, Willow Yoga Studio is a small, community-focused space offering
        Vinyasa, Restorative, and private yoga sessions. Our instructors are certified
        200+ hour RYT practitioners with a focus on accessible, mindful movement.
      </p>
    </main>
  );
}
```

- [ ] **Step 8: Add routes in `client/src/App.tsx`**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { About } from './pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <Nav />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
```

- [ ] **Step 9: Run tests and verify they pass**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking/client"
npm test
```
Expected: PASS (2 tests).

- [ ] **Step 10: Commit**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking"
git add client/
git commit -m "Add API client and Services/About pages"
```

---

### Task 8: Booking page — service, date, slot selection and submission

**Files:**
- Create: `client/src/pages/Booking.tsx`
- Modify: `client/src/App.tsx`
- Test: `client/src/pages/Booking.test.tsx`

**Interfaces:**
- Consumes: `getServices`, `getAvailability`, `createBooking` from `client/src/api/client.ts` (Task 7).
- Produces: `/booking` route — terminal node for this task, nothing later depends on its internals.

- [ ] **Step 1: Write the failing test — `client/src/pages/Booking.test.tsx`**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Booking } from './Booking';
import * as api from '../api/client';

describe('Booking page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(api, 'getServices').mockResolvedValue([
      { id: 'svc-1', name: 'Vinyasa Flow', durationMinutes: 60, priceCents: 2500 },
    ]);
    vi.spyOn(api, 'getAvailability').mockResolvedValue({ openSlots: ['09:00', '10:00'] });
  });

  it('blocks submit until required fields are filled', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Booking />
      </MemoryRouter>,
    );

    await waitFor(() => screen.getByText('Vinyasa Flow'));
    await user.type(screen.getByLabelText(/date/i), '2026-10-01');
    await waitFor(() => screen.getByText('09:00'));
    await user.click(screen.getByText('09:00'));

    await user.click(screen.getByRole('button', { name: /confirm booking/i }));

    expect(screen.getByText(/please fill in your name, email, and phone/i)).toBeInTheDocument();
  });

  it('submits a booking and shows a confirmation', async () => {
    vi.spyOn(api, 'createBooking').mockResolvedValue({
      id: 'b1',
      serviceId: 'svc-1',
      service: { id: 'svc-1', name: 'Vinyasa Flow', durationMinutes: 60, priceCents: 2500 },
      date: '2026-10-01',
      timeSlot: '09:00',
      customerName: 'Jane Doe',
      customerEmail: 'jane@example.com',
      customerPhone: '5551234567',
      createdAt: new Date().toISOString(),
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Booking />
      </MemoryRouter>,
    );

    await waitFor(() => screen.getByText('Vinyasa Flow'));
    await user.type(screen.getByLabelText(/date/i), '2026-10-01');
    await waitFor(() => screen.getByText('09:00'));
    await user.click(screen.getByText('09:00'));
    await user.type(screen.getByLabelText(/name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/phone/i), '5551234567');
    await user.click(screen.getByRole('button', { name: /confirm booking/i }));

    await waitFor(() => {
      expect(screen.getByText(/you're booked/i)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking/client"
npm test
```
Expected: FAIL — `./Booking` module not found.

- [ ] **Step 3: Write `client/src/pages/Booking.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { getServices, getAvailability, createBooking } from '../api/client';
import type { Service } from '../types';

export function Booking() {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [timeSlot, setTimeSlot] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    getServices().then((list) => {
      setServices(list);
      if (list.length > 0) setServiceId(list[0].id);
    });
  }, []);

  useEffect(() => {
    if (!date || !serviceId) {
      setSlots([]);
      return;
    }
    getAvailability(date, serviceId).then((res) => setSlots(res.openSlots));
    setTimeSlot('');
  }, [date, serviceId]);

  if (confirmed) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-emerald-900">You&apos;re booked!</h1>
        <p className="mt-4 text-gray-600">
          We&apos;ve reserved your {timeSlot} slot on {date}. See you on the mat.
        </p>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!serviceId || !date || !timeSlot) {
      setFormError('Please choose a service, date, and time slot.');
      return;
    }
    if (!name || !email || !phone) {
      setFormError('Please fill in your name, email, and phone number.');
      return;
    }

    try {
      await createBooking({ serviceId, date, timeSlot, customerName: name, customerEmail: email, customerPhone: phone });
      setConfirmed(true);
    } catch (err) {
      if (err instanceof Error && err.message === 'SLOT_TAKEN') {
        setFormError('That slot was just taken. Please pick another time.');
        const res = await getAvailability(date, serviceId);
        setSlots(res.openSlots);
        setTimeSlot('');
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-emerald-900">Book a Class</h1>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="service" className="block text-sm font-medium text-gray-700">Service</label>
          <select
            id="service"
            className="mt-1 w-full rounded-md border border-gray-300 p-2"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
          <input
            id="date"
            type="date"
            className="mt-1 w-full rounded-md border border-gray-300 p-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {slots.length > 0 && (
          <div>
            <span className="block text-sm font-medium text-gray-700">Available times</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {slots.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setTimeSlot(slot)}
                  className={`rounded-md border px-3 py-1 text-sm ${
                    timeSlot === slot
                      ? 'border-emerald-700 bg-emerald-700 text-white'
                      : 'border-gray-300 text-gray-700 hover:border-emerald-700'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            id="name"
            className="mt-1 w-full rounded-md border border-gray-300 p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            className="mt-1 w-full rounded-md border border-gray-300 p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            id="phone"
            className="mt-1 w-full rounded-md border border-gray-300 p-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {formError && <p className="text-red-600">{formError}</p>}

        <button
          type="submit"
          className="rounded-md bg-emerald-700 px-6 py-3 text-white hover:bg-emerald-800"
        >
          Confirm Booking
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 4: Add the route in `client/src/App.tsx`**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { About } from './pages/About';
import { Booking } from './pages/Booking';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <Nav />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/booking" element={<Booking />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
```

- [ ] **Step 5: Run tests and verify they pass**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking/client"
npm test
```
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking"
git add client/
git commit -m "Add booking flow with slot selection and conflict handling"
```

---

### Task 9: Admin page — token-gated bookings list

**Files:**
- Create: `client/src/pages/Admin.tsx`
- Modify: `client/src/App.tsx`
- Test: `client/src/pages/Admin.test.tsx`

**Interfaces:**
- Consumes: `getAdminBookings` from `client/src/api/client.ts` (Task 7).
- Produces: `/admin` route — terminal node, nothing later depends on it.

- [ ] **Step 1: Write the failing test — `client/src/pages/Admin.test.tsx`**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Admin } from './Admin';
import * as api from '../api/client';

describe('Admin page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does not fetch bookings before a token is entered', () => {
    const spy = vi.spyOn(api, 'getAdminBookings');
    render(<Admin />);
    expect(spy).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/admin token/i)).toBeInTheDocument();
  });

  it('fetches and displays bookings once a token is submitted', async () => {
    vi.spyOn(api, 'getAdminBookings').mockResolvedValue([
      {
        id: 'b1',
        serviceId: 'svc-1',
        service: { id: 'svc-1', name: 'Vinyasa Flow', durationMinutes: 60, priceCents: 2500 },
        date: '2026-10-01',
        timeSlot: '09:00',
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        customerPhone: '5551234567',
        createdAt: new Date().toISOString(),
      },
    ]);

    const user = userEvent.setup();
    render(<Admin />);

    await user.type(screen.getByLabelText(/admin token/i), 'secret-token');
    await user.click(screen.getByRole('button', { name: /view bookings/i }));

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
    expect(screen.getByText('Vinyasa Flow')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking/client"
npm test
```
Expected: FAIL — `./Admin` module not found.

- [ ] **Step 3: Write `client/src/pages/Admin.tsx`**

```tsx
import { useState } from 'react';
import { getAdminBookings } from '../api/client';
import type { Booking } from '../types';

export function Admin() {
  const [token, setToken] = useState('');
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const result = await getAdminBookings(token);
      setBookings(result);
    } catch {
      setError('Invalid token or the bookings could not be loaded.');
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-emerald-900">Admin: Bookings</h1>

      <form className="mt-6 flex gap-2" onSubmit={handleSubmit}>
        <div className="flex-1">
          <label htmlFor="admin-token" className="sr-only">Admin token</label>
          <input
            id="admin-token"
            type="password"
            placeholder="Admin token"
            className="w-full rounded-md border border-gray-300 p-2"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>
        <button type="submit" className="rounded-md bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800">
          View bookings
        </button>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {bookings && (
        <table className="mt-8 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2">Date</th>
              <th className="py-2">Time</th>
              <th className="py-2">Service</th>
              <th className="py-2">Customer</th>
              <th className="py-2">Contact</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-gray-100">
                <td className="py-2">{b.date}</td>
                <td className="py-2">{b.timeSlot}</td>
                <td className="py-2">{b.service.name}</td>
                <td className="py-2">{b.customerName}</td>
                <td className="py-2">{b.customerEmail} / {b.customerPhone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
```

- [ ] **Step 4: Add the route in `client/src/App.tsx`**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { About } from './pages/About';
import { Booking } from './pages/Booking';
import { Admin } from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <Nav />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
```

- [ ] **Step 5: Run tests and verify they pass**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking/client"
npm test
```
Expected: PASS (6 tests). The client is now feature-complete.

- [ ] **Step 6: Commit**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking"
git add client/
git commit -m "Add token-gated admin bookings page"
```

---

### Task 10: README with setup, dev, and deployment instructions

**Files:**
- Create: `README.md`
- Create: `client/.env.example`
- Create: `server/.env.example`

**Interfaces:**
- Consumes: nothing (documentation only).
- Produces: nothing consumed by other tasks — this is the terminal task.

- [ ] **Step 1: Write `server/.env.example`**

```
DATABASE_URL="file:./dev.db"
ADMIN_TOKEN="change-me"
PORT=4000
```

- [ ] **Step 2: Write `client/.env.example`**

```
VITE_API_URL=http://localhost:4000
```

- [ ] **Step 3: Write `README.md`**

```markdown
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

\`\`\`bash
cd server
cp .env.example .env
npm install
npx prisma db push
npm run seed
npm run dev
\`\`\`

The API runs on http://localhost:4000.

### Client

\`\`\`bash
cd client
cp .env.example .env
npm install
npm run dev
\`\`\`

The site runs on http://localhost:5173.

## Running tests

\`\`\`bash
cd server && npm test
cd client && npm test
\`\`\`

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
```

- [ ] **Step 4: Commit**

```bash
cd "/Users/govard/Public/Claude Work/Portfolio/yoga-studio-booking"
git add README.md server/.env.example client/.env.example
git commit -m "Add README with setup and deployment instructions"
```

---

## Self-Review Notes

- **Spec coverage:** Home/Services/About/Booking/Admin pages (Tasks 6-9); `GET /services`, `GET /availability`, `POST /bookings`, `GET /admin/bookings` (Tasks 2-5); unique-constraint race safety (Task 2 schema, Task 4 error handling); zod validation (Task 4); error-handling middleware mapping ZodError→400 and P2002→409 (Task 4); server tests for availability/conflict/validation (Tasks 3-5); client tests for validation-blocks-submit and successful-submit (Task 8); deployment instructions (Task 10). All spec sections are covered.
- **Placeholder scan:** no TBD/TODO markers; every step has runnable code.
- **Type consistency:** `Service`/`Booking` shapes match between `server/prisma/schema.prisma`, `server/src/validation/booking.ts`, and `client/src/types.ts`. `computeOpenSlots`/`DAILY_SLOTS` names are consistent between Task 3's definition and its two consumers (availability route, unit test).
