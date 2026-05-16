import { Router } from 'express';
import { getDb } from '../db/init.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

function formatTour(row) {
  return {
    id: row.id,
    guideId: row.guide_id,
    title: row.title,
    description: row.description,
    price: row.price,
    location: row.location,
    duration: row.duration,
    imageUrl: row.image_url,
    featured: Boolean(row.featured),
    guideName: row.guide_name ?? undefined,
    createdAt: row.created_at,
  };
}

const tourSelect = `
  SELECT t.*, u.name AS guide_name
  FROM tours t
  JOIN users u ON u.id = t.guide_id
`;

router.get('/mine', authenticate, requireRole('guide'), (req, res) => {
  const db = getDb();
  const rows = db
    .prepare(`${tourSelect} WHERE t.guide_id = ? ORDER BY t.created_at DESC`)
    .all(req.user.id);
  res.json({ tours: rows.map(formatTour) });
});

router.get('/', (req, res) => {
  const { search, featured } = req.query;
  const db = getDb();
  let sql = `${tourSelect} WHERE 1=1`;
  const params = [];

  if (featured === 'true') {
    sql += ' AND t.featured = 1';
  }
  if (search?.trim()) {
    sql += ' AND (t.title LIKE ? OR t.location LIKE ? OR t.description LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  sql += ' ORDER BY t.featured DESC, t.created_at DESC';
  const rows = db.prepare(sql).all(...params);
  res.json({ tours: rows.map(formatTour) });
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const row = db.prepare(`${tourSelect} WHERE t.id = ?`).get(req.params.id);
  if (!row) {
    return res.status(404).json({ message: 'Tour not found' });
  }
  res.json({ tour: formatTour(row) });
});

router.post('/', authenticate, requireRole('guide'), (req, res) => {
  const { title, description, price, location, duration, imageUrl, featured } = req.body;

  if (!title?.trim() || !description?.trim() || !location?.trim() || !duration?.trim()) {
    return res.status(400).json({ message: 'Title, description, location, and duration are required' });
  }
  if (price == null || Number(price) < 0) {
    return res.status(400).json({ message: 'Valid price is required' });
  }

  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO tours (guide_id, title, description, price, location, duration, image_url, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.user.id,
      title.trim(),
      description.trim(),
      Number(price),
      location.trim(),
      duration.trim(),
      imageUrl?.trim() || 'https://images.unsplash.com/photo-1469854523086-cc02afe5c88d?w=800&q=80',
      featured ? 1 : 0
    );

  const row = db.prepare(`${tourSelect} WHERE t.id = ?`).get(result.lastInsertRowid);
  res.status(201).json({ tour: formatTour(row) });
});

router.put('/:id', authenticate, requireRole('guide'), (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM tours WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: 'Tour not found' });
  }
  if (existing.guide_id !== req.user.id) {
    return res.status(403).json({ message: 'You can only edit your own tours' });
  }

  const { title, description, price, location, duration, imageUrl, featured } = req.body;

  db.prepare(
    `UPDATE tours SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      price = COALESCE(?, price),
      location = COALESCE(?, location),
      duration = COALESCE(?, duration),
      image_url = COALESCE(?, image_url),
      featured = COALESCE(?, featured)
     WHERE id = ?`
  ).run(
    title?.trim() ?? null,
    description?.trim() ?? null,
    price != null ? Number(price) : null,
    location?.trim() ?? null,
    duration?.trim() ?? null,
    imageUrl?.trim() ?? null,
    featured != null ? (featured ? 1 : 0) : null,
    req.params.id
  );

  const row = db.prepare(`${tourSelect} WHERE t.id = ?`).get(req.params.id);
  res.json({ tour: formatTour(row) });
});

router.delete('/:id', authenticate, requireRole('guide'), (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM tours WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: 'Tour not found' });
  }
  if (existing.guide_id !== req.user.id) {
    return res.status(403).json({ message: 'You can only delete your own tours' });
  }

  db.prepare('DELETE FROM bookings WHERE tour_id = ?').run(req.params.id);
  db.prepare('DELETE FROM tours WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

export default router;
