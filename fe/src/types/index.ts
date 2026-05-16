export type UserRole = 'traveler' | 'guide';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Tour {
  id: number;
  guideId: number;
  title: string;
  description: string;
  price: number;
  location: string;
  duration: string;
  imageUrl: string;
  featured: boolean;
  guideName?: string;
  createdAt: string;
}

export interface Booking {
  id: number;
  tourId: number;
  userId: number;
  date: string;
  peopleCount: number;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  tourTitle?: string;
  tourLocation?: string;
  tourImageUrl?: string;
  travelerName?: string;
  travelerEmail?: string;
}
