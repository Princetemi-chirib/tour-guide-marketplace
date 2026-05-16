import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db/init.js';
import authRoutes from './routes/auth.js';
import tourRoutes from './routes/tours.js';
import bookingRoutes from './routes/bookings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let dbReady = false;

export function createApp() {
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'dev-secret-change-in-production';
  }

  if (!dbReady) {
    const databasePath =
      process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'marketplace.db');
    initDb(databasePath);
    dbReady = true;
  }

  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/tours', tourRoutes);
  app.use('/api/bookings', bookingRoutes);

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  });

  return app;
}
