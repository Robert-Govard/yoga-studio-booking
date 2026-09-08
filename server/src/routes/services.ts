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
