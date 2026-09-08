import express from 'express';
import cors from 'cors';
import { servicesRouter } from './routes/services';
import { availabilityRouter } from './routes/availability';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/services', servicesRouter);
  app.use('/availability', availabilityRouter);

  return app;
}
