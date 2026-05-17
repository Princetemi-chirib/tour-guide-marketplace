/**
 * Write all seed documents to MongoDB Atlas.
 * Usage: npm run seed -w be
 *        npm run seed:force -w be   (clears users, tours, bookings, counters first)
 */
import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { seedMongo, SEED_DOCUMENTS } from '../src/db/seedMongo.js';

const force = process.argv.includes('--force');
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'tour_guide_marketplace';

if (!uri) {
  console.error('Missing MONGODB_URI in be/.env');
  process.exit(1);
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(dbName);

  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('tours').createIndex({ guideId: 1 });
  await db.collection('tours').createIndex({ featured: 1, createdAt: -1 });
  await db.collection('bookings').createIndex({ userId: 1 });
  await db.collection('bookings').createIndex({ tourId: 1 });

  const inserted = await seedMongo(db, { force });

  if (!inserted && !force) {
    console.log('Database already has tours — skipped seed.');
    console.log('Run: npm run seed:force -w be  to replace all data.');
  } else {
    const counts = {
      users: await db.collection('users').countDocuments(),
      tours: await db.collection('tours').countDocuments(),
      bookings: await db.collection('bookings').countDocuments(),
    };
    console.log(`Seeded database "${dbName}"${force ? ' (forced reset)' : ''}:`);
    console.log(`  users:    ${counts.users} (${SEED_DOCUMENTS.users.length} demo accounts)`);
    console.log(`  tours:    ${counts.tours}`);
    console.log(`  bookings: ${counts.bookings}`);
    console.log('\nDemo logins (password: password123):');
    console.log('  guide@marketplace.test');
    console.log('  guide2@marketplace.test');
    console.log('  traveler@marketplace.test');
  }
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exit(1);
} finally {
  await client.close();
}
