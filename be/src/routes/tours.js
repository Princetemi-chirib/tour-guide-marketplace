import { Router } from 'express';
import { getDb, getNextId } from '../db/mongo.js';
import { formatTour } from '../db/format.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

async function findTourWithGuide(id) {
  const db = getDb();
  const tour = await db.collection('tours').findOne({ id: Number(id) });
  if (!tour) return null;
  const guide = await db.collection('users').findOne({ id: tour.guideId });
  return formatTour(tour, guide?.name);
}

router.get('/mine', authenticate, requireRole('guide'), async (req, res, next) => {
  try {
    const tours = await getDb()
      .collection('tours')
      .find({ guideId: req.user.id })
      .sort({ createdAt: -1 })
      .toArray();
    const guide = await getDb().collection('users').findOne({ id: req.user.id });
    res.json({ tours: tours.map((t) => formatTour(t, guide?.name)) });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { search, featured } = req.query;
    const filter = {};

    if (featured === 'true') {
      filter.featured = true;
    }
    if (search?.trim()) {
      const term = search.trim();
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
      ];
    }

    const tours = await getDb()
      .collection('tours')
      .find(filter)
      .sort({ featured: -1, createdAt: -1 })
      .toArray();

    const guideIds = [...new Set(tours.map((t) => t.guideId))];
    const guides = await getDb()
      .collection('users')
      .find({ id: { $in: guideIds } })
      .toArray();
    const guideMap = new Map(guides.map((g) => [g.id, g.name]));

    res.json({
      tours: tours.map((t) => formatTour(t, guideMap.get(t.guideId))),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const tour = await findTourWithGuide(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.json({ tour });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, requireRole('guide'), async (req, res, next) => {
  try {
    const { title, description, price, location, duration, imageUrl, featured } = req.body;

    if (!title?.trim() || !description?.trim() || !location?.trim() || !duration?.trim()) {
      return res.status(400).json({ message: 'Title, description, location, and duration are required' });
    }
    if (price == null || Number(price) < 0) {
      return res.status(400).json({ message: 'Valid price is required' });
    }

    const id = await getNextId('tourId');
    const doc = {
      id,
      guideId: req.user.id,
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      location: location.trim(),
      duration: duration.trim(),
      imageUrl:
        imageUrl?.trim() ||
        'https://images.unsplash.com/photo-1469854523086-cc02afe5c88d?w=800&q=80',
      featured: Boolean(featured),
      createdAt: new Date().toISOString(),
    };

    await getDb().collection('tours').insertOne(doc);
    const tour = await findTourWithGuide(id);
    res.status(201).json({ tour });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, requireRole('guide'), async (req, res, next) => {
  try {
    const tourId = Number(req.params.id);
    const existing = await getDb().collection('tours').findOne({ id: tourId });
    if (!existing) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    if (existing.guideId !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own tours' });
    }

    const { title, description, price, location, duration, imageUrl, featured } = req.body;
    const update = {};
    if (title?.trim()) update.title = title.trim();
    if (description?.trim()) update.description = description.trim();
    if (price != null) update.price = Number(price);
    if (location?.trim()) update.location = location.trim();
    if (duration?.trim()) update.duration = duration.trim();
    if (imageUrl?.trim()) update.imageUrl = imageUrl.trim();
    if (featured != null) update.featured = Boolean(featured);

    await getDb().collection('tours').updateOne({ id: tourId }, { $set: update });
    const tour = await findTourWithGuide(tourId);
    res.json({ tour });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, requireRole('guide'), async (req, res, next) => {
  try {
    const tourId = Number(req.params.id);
    const existing = await getDb().collection('tours').findOne({ id: tourId });
    if (!existing) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    if (existing.guideId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own tours' });
    }

    const db = getDb();
    await db.collection('bookings').deleteMany({ tourId });
    await db.collection('tours').deleteOne({ id: tourId });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
