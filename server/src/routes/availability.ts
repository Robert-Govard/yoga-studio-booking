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
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ error: 'date must be in YYYY-MM-DD format' });
      return;
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      res.status(404).json({ error: 'Service not found' });
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
