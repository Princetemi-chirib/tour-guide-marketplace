import type { Booking, Tour, User } from '../types';

export interface MockUserRecord extends User {
  password: string;
}

export const SEED_USERS: MockUserRecord[] = [
  {
    id: 1,
    name: 'Ada Okafor',
    email: 'guide@marketplace.test',
    password: 'password123',
    role: 'guide',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'James Mensah',
    email: 'guide2@marketplace.test',
    password: 'password123',
    role: 'guide',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 3,
    name: 'Demo Traveler',
    email: 'traveler@marketplace.test',
    password: 'password123',
    role: 'traveler',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const SEED_TOURS: Tour[] = [
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
    guideName: 'Ada Okafor',
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
    guideName: 'Ada Okafor',
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
    guideName: 'James Mensah',
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
    guideName: 'James Mensah',
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
    guideName: 'Ada Okafor',
    createdAt: '2026-01-02T00:00:00.000Z',
  },
];

export const SEED_BOOKINGS: Booking[] = [
  {
    id: 1,
    tourId: 1,
    userId: 3,
    date: '2026-06-15',
    peopleCount: 2,
    paymentMethod: 'card',
    status: 'confirmed',
    createdAt: '2026-05-01T00:00:00.000Z',
    tourTitle: 'Explore Lagos in 3 Hours',
    tourLocation: 'Lagos, Nigeria',
    tourImageUrl:
      'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80',
    travelerName: 'Demo Traveler',
    travelerEmail: 'traveler@marketplace.test',
  },
];
