import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db;

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}

export function initDb(databasePath) {
  const dir = path.dirname(databasePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(databasePath);
  db.pragma('foreign_keys = ON');

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);

  const tourCount = db.prepare('SELECT COUNT(*) AS count FROM tours').get();
  if (tourCount.count === 0) {
    seed(db);
  }

  return db;
}

function seed(database) {
  const passwordHash = bcrypt.hashSync('password123', 10);

  const insertGuide = database.prepare(
    `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'guide')`
  );
  const guideResult = insertGuide.run('Ada Okafor', 'guide@marketplace.test', passwordHash);
  const guideId = guideResult.lastInsertRowid;

  const insertGuide2 = insertGuide.run('James Mensah', 'guide2@marketplace.test', passwordHash);
  const guide2Id = insertGuide2.lastInsertRowid;

  const insertTour = database.prepare(`
    INSERT INTO tours (guide_id, title, description, price, location, duration, image_url, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tours = [
    {
      guideId,
      title: 'Explore Lagos in 3 Hours',
      description:
        'Discover the energy of Lagos Island: National Museum highlights, Balogun Market buzz, and waterfront views. Perfect for first-time visitors.',
      price: 45,
      location: 'Lagos, Nigeria',
      duration: '3 hours',
      imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80',
      featured: 1,
    },
    {
      guideId,
      title: 'Cape Town Table Mountain Hike',
      description:
        'Guided hike with panoramic views of the city and Atlantic Ocean. Includes safety briefing and photo stops.',
      price: 65,
      location: 'Cape Town, South Africa',
      duration: '5 hours',
      imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5ad9da667?w=800&q=80',
      featured: 1,
    },
    {
      guideId: guide2Id,
      title: 'Marrakech Medina Food Walk',
      description:
        'Taste tagines, mint tea, and street snacks while learning the history of the old medina alleys.',
      price: 38,
      location: 'Marrakech, Morocco',
      duration: '4 hours',
      imageUrl: 'https://images.unsplash.com/photo-1489749791775-7c1eaa092c99?w=800&q=80',
      featured: 1,
    },
    {
      guideId: guide2Id,
      title: 'Nairobi National Park Safari',
      description:
        'Half-day safari spotting lions, giraffes, and rhinos with skyline views of Nairobi in the background.',
      price: 120,
      location: 'Nairobi, Kenya',
      duration: '6 hours',
      imageUrl: 'https://images.unsplash.com/photo-1516426712078-6979ebaa2a8a?w=800&q=80',
      featured: 0,
    },
    {
      guideId,
      title: 'Accra Arts & Culture Tour',
      description:
        'Visit galleries, craft markets, and live music spots in Osu and Jamestown with a local storyteller.',
      price: 42,
      location: 'Accra, Ghana',
      duration: '4 hours',
      imageUrl: 'https://images.unsplash.com/photo-1523805009345-7448845a9e9?w=800&q=80',
      featured: 0,
    },
  ];

  for (const tour of tours) {
    insertTour.run(
      tour.guideId,
      tour.title,
      tour.description,
      tour.price,
      tour.location,
      tour.duration,
      tour.imageUrl,
      tour.featured
    );
  }
}
