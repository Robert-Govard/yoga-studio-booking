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
