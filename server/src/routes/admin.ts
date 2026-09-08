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
