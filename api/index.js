import 'dotenv/config';
import { createApp, ensureDb } from '../be/src/app.js';

let app;

export default async function handler(req, res) {
  try {
    await ensureDb();
    if (!app) {
      app = createApp();
    }
    return app(req, res);
  } catch (err) {
    console.error(err);
    res.status(503).json({ message: 'Database unavailable' });
  }
}
