import type { Booking, Tour, User, UserRole } from '../types';
import {
  SEED_BOOKINGS,
  SEED_TOURS,
  SEED_USERS,
  type MockUserRecord,
} from './data';

export class MockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MockError';
  }
}

const KEYS = {
  users: 'tg_mock_users',
  tours: 'tg_mock_tours',
  bookings: 'tg_mock_bookings',
  session: 'tg_mock_session_user_id',
  nextUserId: 'tg_mock_next_user_id',
  nextTourId: 'tg_mock_next_tour_id',
  nextBookingId: 'tg_mock_next_booking_id',
} as const;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function initStore() {
  if (!localStorage.getItem(KEYS.users)) {
    save(KEYS.users, SEED_USERS);
    save(KEYS.tours, SEED_TOURS);
    save(KEYS.bookings, SEED_BOOKINGS);
    save(KEYS.nextUserId, 4);
    save(KEYS.nextTourId, 6);
    save(KEYS.nextBookingId, 2);
  }
}

initStore();

function getUsers(): MockUserRecord[] {
  return load(KEYS.users, SEED_USERS);
}

function getToursRaw(): Tour[] {
  return load(KEYS.tours, SEED_TOURS);
}

function getBookingsRaw(): Booking[] {
  return load(KEYS.bookings, SEED_BOOKINGS);
}

function attachGuideNames(tours: Tour[]): Tour[] {
  const users = getUsers();
  return tours.map((t) => ({
    ...t,
    guideName: users.find((u) => u.id === t.guideId)?.name ?? t.guideName,
  }));
}

function enrichBooking(b: Booking): Booking {
  const tour = getToursRaw().find((t) => t.id === b.tourId);
  const traveler = getUsers().find((u) => u.id === b.userId);
  return {
    ...b,
    tourTitle: tour?.title ?? b.tourTitle,
    tourLocation: tour?.location ?? b.tourLocation,
    tourImageUrl: tour?.imageUrl ?? b.tourImageUrl,
    travelerName: traveler?.name ?? b.travelerName,
    travelerEmail: traveler?.email ?? b.travelerEmail,
  };
}

export function toPublicUser(record: MockUserRecord): User {
  const { password: _p, ...user } = record;
  return user;
}

export function getSessionUser(): User | null {
  const id = localStorage.getItem(KEYS.session);
  if (!id) return null;
  const user = getUsers().find((u) => u.id === Number(id));
  return user ? toPublicUser(user) : null;
}

export function setSession(userId: number | null) {
  if (userId == null) {
    localStorage.removeItem(KEYS.session);
  } else {
    localStorage.setItem(KEYS.session, String(userId));
  }
}

export function mockLogin(email: string, password: string): User {
  const user = getUsers().find(
    (u) => u.email === email.trim().toLowerCase() && u.password === password
  );
  if (!user) {
    throw new MockError('Invalid email or password');
  }
  setSession(user.id);
  return toPublicUser(user);
}

export function mockRegister(
  name: string,
  email: string,
  password: string,
  role: UserRole
): User {
  if (password.length < 6) {
    throw new MockError('Password must be at least 6 characters');
  }
  const normalized = email.trim().toLowerCase();
  if (getUsers().some((u) => u.email === normalized)) {
    throw new MockError('Email already registered');
  }

  const nextId = load(KEYS.nextUserId, 4);
  const record: MockUserRecord = {
    id: nextId,
    name: name.trim(),
    email: normalized,
    password,
    role,
    createdAt: new Date().toISOString(),
  };
  const users = [...getUsers(), record];
  save(KEYS.users, users);
  save(KEYS.nextUserId, nextId + 1);
  setSession(record.id);
  return toPublicUser(record);
}

export function mockLogout() {
  setSession(null);
}

export interface TourFilters {
  search?: string;
  featured?: boolean;
}

export function mockGetTours(filters: TourFilters = {}): Tour[] {
  let tours = attachGuideNames(getToursRaw());
  if (filters.featured) {
    tours = tours.filter((t) => t.featured);
  }
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    tours = tours.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }
  return tours.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function mockGetTourById(id: number): Tour {
  const tour = attachGuideNames(getToursRaw()).find((t) => t.id === id);
  if (!tour) throw new MockError('Tour not found');
  return tour;
}

export function mockGetToursByGuide(guideId: number): Tour[] {
  return attachGuideNames(getToursRaw().filter((t) => t.guideId === guideId));
}

export interface TourInput {
  title: string;
  description: string;
  price: number;
  location: string;
  duration: string;
  imageUrl?: string;
  featured?: boolean;
}

export function mockCreateTour(guideId: number, input: TourInput): Tour {
  const nextId = load(KEYS.nextTourId, 6);
  const guide = getUsers().find((u) => u.id === guideId);
  const tour: Tour = {
    id: nextId,
    guideId,
    title: input.title.trim(),
    description: input.description.trim(),
    price: input.price,
    location: input.location.trim(),
    duration: input.duration.trim(),
    imageUrl:
      input.imageUrl?.trim() ||
      'https://images.unsplash.com/photo-1469854523086-cc02afe5c88d?w=800&q=80',
    featured: Boolean(input.featured),
    guideName: guide?.name,
    createdAt: new Date().toISOString(),
  };
  const tours = [...getToursRaw(), tour];
  save(KEYS.tours, tours);
  save(KEYS.nextTourId, nextId + 1);
  return tour;
}

export function mockUpdateTour(
  tourId: number,
  guideId: number,
  input: Partial<TourInput>
): Tour {
  const tours = getToursRaw();
  const index = tours.findIndex((t) => t.id === tourId);
  if (index === -1) throw new MockError('Tour not found');
  if (tours[index].guideId !== guideId) {
    throw new MockError('You can only edit your own tours');
  }

  const current = tours[index];
  const updated: Tour = {
    ...current,
    title: input.title?.trim() ?? current.title,
    description: input.description?.trim() ?? current.description,
    price: input.price ?? current.price,
    location: input.location?.trim() ?? current.location,
    duration: input.duration?.trim() ?? current.duration,
    imageUrl: input.imageUrl?.trim() || current.imageUrl,
    featured: input.featured ?? current.featured,
  };
  tours[index] = updated;
  save(KEYS.tours, tours);
  return attachGuideNames([updated])[0];
}

export function mockDeleteTour(tourId: number, guideId: number) {
  const tours = getToursRaw();
  const tour = tours.find((t) => t.id === tourId);
  if (!tour) throw new MockError('Tour not found');
  if (tour.guideId !== guideId) {
    throw new MockError('You can only delete your own tours');
  }
  save(
    KEYS.tours,
    tours.filter((t) => t.id !== tourId)
  );
  save(
    KEYS.bookings,
    getBookingsRaw().filter((b) => b.tourId !== tourId)
  );
}

export interface BookingInput {
  tourId: number;
  date: string;
  peopleCount: number;
  paymentMethod: string;
}

export function mockCreateBooking(userId: number, input: BookingInput): Booking {
  const validPayment = ['card', 'cash', 'transfer'];
  if (!validPayment.includes(input.paymentMethod)) {
    throw new MockError('paymentMethod must be card, cash, or transfer');
  }
  if (input.peopleCount < 1) {
    throw new MockError('peopleCount must be at least 1');
  }

  const bookingDate = new Date(input.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (Number.isNaN(bookingDate.getTime()) || bookingDate < today) {
    throw new MockError('Booking date must be today or in the future');
  }

  mockGetTourById(input.tourId);

  const nextId = load(KEYS.nextBookingId, 2);
  const booking: Booking = {
    id: nextId,
    tourId: input.tourId,
    userId,
    date: input.date,
    peopleCount: input.peopleCount,
    paymentMethod: input.paymentMethod,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  const bookings = [...getBookingsRaw(), booking];
  save(KEYS.bookings, bookings);
  save(KEYS.nextBookingId, nextId + 1);
  return enrichBooking(booking);
}

export function mockGetBookingsForUser(userId: number): Booking[] {
  return getBookingsRaw()
    .filter((b) => b.userId === userId)
    .map(enrichBooking)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function mockGetBookingsForGuide(guideId: number): Booking[] {
  const tourIds = new Set(
    getToursRaw().filter((t) => t.guideId === guideId).map((t) => t.id)
  );
  return getBookingsRaw()
    .filter((b) => tourIds.has(b.tourId))
    .map(enrichBooking)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Reset mock data to seeds (useful while developing UI). */
export function mockResetStore() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  initStore();
}
