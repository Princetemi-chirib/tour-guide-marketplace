import { MongoClient } from 'mongodb';
import { seedMongo } from './seedMongo.js';

let client;
let db;
let connectPromise;

export async function connectMongo() {
  if (db) return db;
  if (connectPromise) return connectPromise;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Add it to be/.env — see be/.env.example'
    );
  }

  connectPromise = (async () => {
    const dbName = process.env.MONGODB_DB_NAME || 'tour_guide_marketplace';
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);

    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('tours').createIndex({ guideId: 1 });
    await db.collection('tours').createIndex({ featured: 1, createdAt: -1 });
    await db.collection('bookings').createIndex({ userId: 1 });
    await db.collection('bookings').createIndex({ tourId: 1 });

    await seedMongo(db);
    return db;
  })();

  return connectPromise;
}

export function getDb() {
  if (!db) {
    throw new Error('MongoDB not connected. Call connectMongo() first.');
  }
  return db;
}

export async function getNextId(name) {
  const result = await getDb()
    .collection('counters')
    .findOneAndUpdate(
      { _id: name },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
  return result.seq;
}

export async function closeMongo() {
  if (client) {
    await client.close();
    client = undefined;
    db = undefined;
    connectPromise = undefined;
  }
}
