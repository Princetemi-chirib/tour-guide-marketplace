import { Router } from 'express';
import { getDb } from '../db/init.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

const VALID_PAYMENT = ['card', 'cash', 'transfer'];

function formatBooking(row) {
  return {
    id: row.id,
    tourId: row.tour_id,
    userId: row.user_id,
    date: row.date,
    peopleCount: row.people_count,
    paymentMethod: row.payment_method,
    status: row.status,
    createdAt: row.created_at,
    tourTitle: row.tour_title,
    tourLocation: row.tour_location,
    tourImageUrl: row.tour_image_url,
    travelerName: row.traveler_name,
    travelerEmail: row.traveler_email,
  };
}

router.post('/', authenticate, requireRole('traveler'), (req, res) => {
  const { tourId, date, peopleCount, paymentMethod } = req.body;

  if (!tourId || !date || !peopleCount || !paymentMethod) {
    return res.status(400).json({ message: 'tourId, date, peopleCount, and paymentMethod are required' });
  }
  if (!VALID_PAYMENT.includes(paymentMethod)) {
    return res.status(400).json({ message: 'paymentMethod must be card, cash, or transfer' });
  }
  if (Number(peopleCount) < 1) {
    return res.status(400).json({ message: 'peopleCount must be at least 1' });
  }

  const bookingDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (Number.isNaN(bookingDate.getTime()) || bookingDate < today) {
    return res.status(400).json({ message: 'Booking date must be today or in the future' });
  }

  const db = getDb();
  const tour = db.prepare('SELECT id FROM tours WHERE id = ?').get(tourId);
  if (!tour) {
    return res.status(404).json({ message: 'Tour not found' });
  }

  const result = db
    .prepare(
      `INSERT INTO bookings (tour_id, user_id, date, people_count, payment_method, status)
       VALUES (?, ?, ?, ?, ?, 'confirmed')`
    )
    .run(tourId, req.user.id, date, Number(peopleCount), paymentMethod);

  const row = db
    .prepare(
      `SELECT b.*, t.title AS tour_title, t.location AS tour_location, t.image_url AS tour_image_url
       FROM bookings b
       JOIN tours t ON t.id = b.tour_id
       WHERE b.id = ?`
    )
    .get(result.lastInsertRowid);

  res.status(201).json({ booking: formatBooking(row) });
});

router.get('/me', authenticate, requireRole('traveler'), (req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT b.*, t.title AS tour_title, t.location AS tour_location, t.image_url AS tour_image_url
       FROM bookings b
       JOIN tours t ON t.id = b.tour_id
       WHERE b.user_id = ?
       ORDER BY b.date DESC`
    )
    .all(req.user.id);

  res.json({ bookings: rows.map(formatBooking) });
});

router.get('/guide', authenticate, requireRole('guide'), (req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT b.*, t.title AS tour_title, t.location AS tour_location, t.image_url AS tour_image_url,
              u.name AS traveler_name, u.email AS traveler_email
       FROM bookings b
       JOIN tours t ON t.id = b.tour_id
       JOIN users u ON u.id = b.user_id
       WHERE t.guide_id = ?
       ORDER BY b.created_at DESC`
    )
    .all(req.user.id);

  res.json({ bookings: rows.map(formatBooking) });
});

export default router;
