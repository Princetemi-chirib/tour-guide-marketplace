import { Router } from 'express';
import { getDb, getNextId } from '../db/mongo.js';
import { formatBooking } from '../db/format.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

const VALID_PAYMENT = ['card', 'cash', 'transfer'];

router.post('/', authenticate, requireRole('traveler'), async (req, res, next) => {
  try {
    const { tourId, date, peopleCount, paymentMethod } = req.body;

    if (!tourId || !date || !peopleCount || !paymentMethod) {
      return res.status(400).json({
        message: 'tourId, date, peopleCount, and paymentMethod are required',
      });
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
    const tour = await db.collection('tours').findOne({ id: Number(tourId) });
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    const id = await getNextId('bookingId');
    const doc = {
      id,
      tourId: tour.id,
      userId: req.user.id,
      date,
      peopleCount: Number(peopleCount),
      paymentMethod,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    await db.collection('bookings').insertOne(doc);
    res.status(201).json({
      booking: formatBooking(doc, {
        tourTitle: tour.title,
        tourLocation: tour.location,
        tourImageUrl: tour.imageUrl,
      }),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, requireRole('traveler'), async (req, res, next) => {
  try {
    const db = getDb();
    const bookings = await db
      .collection('bookings')
      .find({ userId: req.user.id })
      .sort({ date: -1 })
      .toArray();

    const tourIds = [...new Set(bookings.map((b) => b.tourId))];
    const tours = await db.collection('tours').find({ id: { $in: tourIds } }).toArray();
    const tourMap = new Map(tours.map((t) => [t.id, t]));

    res.json({
      bookings: bookings.map((b) => {
        const tour = tourMap.get(b.tourId);
        return formatBooking(b, {
          tourTitle: tour?.title,
          tourLocation: tour?.location,
          tourImageUrl: tour?.imageUrl,
        });
      }),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/guide', authenticate, requireRole('guide'), async (req, res, next) => {
  try {
    const db = getDb();
    const guideTours = await db
      .collection('tours')
      .find({ guideId: req.user.id })
      .project({ id: 1 })
      .toArray();
    const tourIds = guideTours.map((t) => t.id);
    if (tourIds.length === 0) {
      return res.json({ bookings: [] });
    }

    const bookings = await db
      .collection('bookings')
      .find({ tourId: { $in: tourIds } })
      .sort({ createdAt: -1 })
      .toArray();

    const tours = await db.collection('tours').find({ id: { $in: tourIds } }).toArray();
    const tourMap = new Map(tours.map((t) => [t.id, t]));

    const userIds = [...new Set(bookings.map((b) => b.userId))];
    const travelers = await db.collection('users').find({ id: { $in: userIds } }).toArray();
    const userMap = new Map(travelers.map((u) => [u.id, u]));

    res.json({
      bookings: bookings.map((b) => {
        const tour = tourMap.get(b.tourId);
        const traveler = userMap.get(b.userId);
        return formatBooking(b, {
          tourTitle: tour?.title,
          tourLocation: tour?.location,
          tourImageUrl: tour?.imageUrl,
          travelerName: traveler?.name,
          travelerEmail: traveler?.email,
        });
      }),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
