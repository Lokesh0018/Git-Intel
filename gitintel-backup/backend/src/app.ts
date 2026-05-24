import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRoutes } from './routes/apiRoutes.js';
import { authRoutes } from './routes/authRoutes.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 120,
      standardHeaders: 'draft-7',
      legacyHeaders: false
    })
  );

  app.get('/health', (_req, res) => res.json({ ok: true, service: 'gitintel-api' }));
  app.use('/api/auth', authRoutes);
  app.use('/api', apiRoutes);
  app.use(errorHandler);

  return app;
}
