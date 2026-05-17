import bcrypt from 'bcryptjs';

/** Full seed documents — every field the API uses (enriched fields are joined at read time). */
export const SEED_DOCUMENTS = {
  users: [
    {
      id: 1,
      name: 'Ada Okafor',
      email: 'guide@marketplace.test',
      role: 'guide',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      name: 'James Mensah',
      email: 'guide2@marketplace.test',
      role: 'guide',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 3,
      name: 'Demo Traveler',
      email: 'traveler@marketplace.test',
      role: 'traveler',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  tours: [
    {
      id: 1,
      guideId: 1,
      title: 'Explore Lagos in 3 Hours',
      description:
        'Discover the energy of Lagos Island: National Museum highlights, Balogun Market buzz, and waterfront views. Perfect for first-time visitors.',
      price: 45,
      location: 'Lagos, Nigeria',
      duration: '3 hours',
      imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80',
      featured: true,
      createdAt: '2026-01-02T00:00:00.000Z',
    },
    {
      id: 2,
      guideId: 1,
      title: 'Cape Town Table Mountain Hike',
      description:
        'Guided hike with panoramic views of the city and Atlantic Ocean. Includes safety briefing and photo stops.',
      price: 65,
      location: 'Cape Town, South Africa',
      duration: '5 hours',
      imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5ad9da667?w=800&q=80',
      featured: true,
      createdAt: '2026-01-02T00:00:00.000Z',
    },
    {
      id: 3,
      guideId: 2,
      title: 'Marrakech Medina Food Walk',
      description:
        'Taste tagines, mint tea, and street snacks while learning the history of the old medina alleys.',
      price: 38,
      location: 'Marrakech, Morocco',
      duration: '4 hours',
      imageUrl: 'https://images.unsplash.com/photo-1489749791775-7c1eaa092c99?w=800&q=80',
      featured: true,
      createdAt: '2026-01-02T00:00:00.000Z',
    },
    {
      id: 4,
      guideId: 2,
      title: 'Nairobi National Park Safari',
      description:
        'Half-day safari spotting lions, giraffes, and rhinos with skyline views of Nairobi in the background.',
      price: 120,
      location: 'Nairobi, Kenya',
      duration: '6 hours',
      imageUrl: 'https://images.unsplash.com/photo-1516426712078-6979ebaa2a8a?w=800&q=80',
      featured: false,
      createdAt: '2026-01-02T00:00:00.000Z',
    },
    {
      id: 5,
      guideId: 1,
      title: 'Accra Arts & Culture Tour',
      description:
        'Visit galleries, craft markets, and live music spots in Osu and Jamestown with a local storyteller.',
      price: 42,
      location: 'Accra, Ghana',
      duration: '4 hours',
      imageUrl: 'https://images.unsplash.com/photo-1523805009345-7448845a9e9?w=800&q=80',
      featured: false,
      createdAt: '2026-01-02T00:00:00.000Z',
    },
  ],
  bookings: [
    {
      id: 1,
      tourId: 1,
      userId: 3,
      date: '2026-06-15',
      peopleCount: 2,
      paymentMethod: 'card',
      status: 'confirmed',
      createdAt: '2026-05-01T00:00:00.000Z',
    },
    {
      id: 2,
      tourId: 2,
      userId: 3,
      date: '2026-07-20',
      peopleCount: 4,
      paymentMethod: 'transfer',
      status: 'pending',
      createdAt: '2026-05-10T00:00:00.000Z',
    },
    {
      id: 3,
      tourId: 3,
      userId: 3,
      date: '2026-08-05',
      peopleCount: 1,
      paymentMethod: 'cash',
      status: 'pending',
      createdAt: '2026-05-12T00:00:00.000Z',
    },
    {
      id: 4,
      tourId: 1,
      userId: 3,
      date: '2026-09-01',
      peopleCount: 3,
      paymentMethod: 'card',
      status: 'cancelled',
      createdAt: '2026-04-20T00:00:00.000Z',
    },
  ],
};

export async function seedMongo(database, options = {}) {
  const { force = false } = options;

  if (!force) {
    const tourCount = await database.collection('tours').countDocuments();
    if (tourCount > 0) return false;
  } else {
    await database.collection('users').deleteMany({});
    await database.collection('tours').deleteMany({});
    await database.collection('bookings').deleteMany({});
    await database.collection('counters').deleteMany({});
  }

  const passwordHash = bcrypt.hashSync('password123', 10);

  const users = SEED_DOCUMENTS.users.map((u) => ({
    ...u,
    passwordHash,
  }));

  await database.collection('counters').insertMany([
    { _id: 'userId', seq: 3 },
    { _id: 'tourId', seq: 5 },
    { _id: 'bookingId', seq: 4 },
  ]);

  await database.collection('users').insertMany(users);
  await database.collection('tours').insertMany(SEED_DOCUMENTS.tours);
  await database.collection('bookings').insertMany(SEED_DOCUMENTS.bookings);

  return true;
}
