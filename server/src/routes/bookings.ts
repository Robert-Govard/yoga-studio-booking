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
