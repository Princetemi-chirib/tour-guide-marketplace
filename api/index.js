import 'dotenv/config';
import { createApp } from '../be/src/app.js';

/** Vercel serverless entry — all /api/* requests are routed here */
export default createApp();
