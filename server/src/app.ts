import express from 'express';
import cors from 'cors';
import { servicesRouter } from './routes/services';
import { availabilityRouter } from './routes/availability';
import { bookingsRouter } from './routes/bookings';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/services', servicesRouter);
  app.use('/availability', availabilityRouter);
  app.use('/bookings', bookingsRouter);

  app.use(errorHandler);

  return app;
}
