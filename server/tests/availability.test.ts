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
