import 'dotenv/config';
import { createApp, ensureDb } from './app.js';

const PORT = Number(process.env.PORT) || 3000;

await ensureDb();
const app = createApp();

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log('Connected to MongoDB Atlas');
});
