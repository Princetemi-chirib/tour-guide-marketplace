import { api } from './client';
import type { Booking, Tour, User, UserRole } from '../types';

export interface TourInput {
  title: string;
  description: string;
  price: number;
  location: string;
  duration: string;
  imageUrl?: string;
  featured?: boolean;
}

export interface BookingInput {
  tourId: number;
  date: string;
  peopleCount: number;
  paymentMethod: string;
}

export interface TourListParams {
  search?: string;
  featured?: boolean;
}

// —— Auth ——

export async function apiLogin(email: string, password: string) {
  return api<{ token: string; user: User }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(
  name: string,
  email: string,
  password: string,
  role: UserRole
) {
  return api<{ token: string; user: User }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role }),
  });
}

export async function apiGetMe() {
  return api<{ user: User }>('/api/auth/me');
}

// —— Tours ——

export async function apiListTours(params: TourListParams = {}) {
  const qs = new URLSearchParams();
  if (params.search?.trim()) qs.set('search', params.search.trim());
  if (params.featured) qs.set('featured', 'true');
  const query = qs.toString();
  const { tours } = await api<{ tours: Tour[] }>(
    `/api/tours${query ? `?${query}` : ''}`
  );
  return tours;
}

export async function apiGetTour(id: number) {
  const { tour } = await api<{ tour: Tour }>(`/api/tours/${id}`);
  return tour;
}

export async function apiGetMyTours() {
  const { tours } = await api<{ tours: Tour[] }>('/api/tours/mine');
  return tours;
}

export async function apiCreateTour(input: TourInput) {
  const { tour } = await api<{ tour: Tour }>('/api/tours', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return tour;
}

export async function apiUpdateTour(id: number, input: Partial<TourInput>) {
  const { tour } = await api<{ tour: Tour }>(`/api/tours/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  return tour;
}

export async function apiDeleteTour(id: number) {
  await api<void>(`/api/tours/${id}`, { method: 'DELETE' });
}

// —— Bookings ——

export async function apiCreateBooking(input: BookingInput) {
  const { booking } = await api<{ booking: Booking }>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return booking;
}

export async function apiGetMyBookings() {
  const { bookings } = await api<{ bookings: Booking[] }>('/api/bookings/me');
  return bookings;
}

export async function apiGetGuideBookings() {
  const { bookings } = await api<{ bookings: Booking[] }>('/api/bookings/guide');
  return bookings;
}
