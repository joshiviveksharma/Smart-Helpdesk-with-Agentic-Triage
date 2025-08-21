import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger';
import { getDbReadyState } from './db';
import authRoutes from './routes/auth';
import kbRoutes from './routes/kb';
import ticketRoutes from './routes/tickets';
import agentRoutes from './routes/agent';
import configRoutes from './routes/config';
import auditRoutes from './routes/audit';
import { notFound, errorHandler } from './middleware/errors';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(pinoHttp({ logger }));

  app.use('/api/auth', authRoutes);
  app.use('/api/kb', kbRoutes);
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/agent', agentRoutes);
  app.use('/api/config', configRoutes);
  app.use('/api', auditRoutes);

  app.get('/healthz', (_req, res) => res.status(200).json({ status: 'ok' }));
  app.get('/readyz', (_req, res) => {
    const ready = getDbReadyState() === 1;
    res.status(ready ? 200 : 503).json({ ready });
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}


