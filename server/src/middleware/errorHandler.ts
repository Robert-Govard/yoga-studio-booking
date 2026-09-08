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
