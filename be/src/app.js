import express from 'express';
import cors from 'cors';
import { connectMongo } from './db/mongo.js';
import authRoutes from './routes/auth.js';
import tourRoutes from './routes/tours.js';
import bookingRoutes from './routes/bookings.js';

let dbReady = false;

export async function ensureDb() {
  if (!dbReady) {
    await connectMongo();
    dbReady = true;
  }
}

export function createApp() {
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'dev-secret-change-in-production';
  }

  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  app.use(async (req, res, next) => {
    try {
      await ensureDb();
      next();
    } catch (err) {
      console.error('Database connection failed:', err.message);
      res.status(503).json({
        message:
          'Database unavailable. Set MONGODB_URI in be/.env (see be/.env.example).',
      });
    }
  });

  app.get('/health', async (_req, res) => {
    res.json({ ok: true, database: 'mongodb' });
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
