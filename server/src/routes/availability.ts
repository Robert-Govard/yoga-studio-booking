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
