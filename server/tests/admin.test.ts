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
