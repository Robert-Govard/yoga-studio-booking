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
