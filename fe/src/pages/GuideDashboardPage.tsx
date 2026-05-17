import { useEffect, useMemo, useState } from 'react';
import { getErrorMessage } from '../api/client';
import {
  apiCreateTour,
  apiDeleteTour,
  apiGetGuideBookings,
  apiGetMyTours,
  apiUpdateTour,
} from '../api/services';
import { Loader } from '../components/Loader';
import { GuideDashboardLayout, type GuideNav } from '../components/GuideDashboardLayout';
import { useAuth } from '../context/AuthContext';
import type { Booking, Tour } from '../types';

const emptyTour = {
  title: '',
  description: '',
  price: '',
  location: '',
  duration: '',
  imageUrl: '',
  featured: false,
};

function formatDateLong(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function bookingBadgeClass(status: Booking['status']) {
  if (status === 'pending') return 'gd-badge--new';
  if (status === 'confirmed') return 'gd-badge--done';
  return 'gd-badge--cancelled';
}

function bookingBadgeLabel(status: Booking['status']) {
  if (status === 'pending') return 'New';
  if (status === 'confirmed') return 'Confirmed';
  return 'Cancelled';
}

function BookingTrendChart({ data }: { data: number[] }) {
  const w = 400;
  const h = 180;
  const pad = { t: 16, r: 16, b: 28, l: 16 };
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => {
    const x = pad.l + (i / (data.length - 1 || 1)) * (w - pad.l - pad.r);
    const y = pad.t + (1 - v / max) * (h - pad.t - pad.b);
    return `${x},${y}`;
  });
  const line = points.join(' ');
  const area = `${points[0]?.split(',')[0] ?? pad.l},${h - pad.b} ${line} ${points[points.length - 1]?.split(',')[0] ?? w - pad.r},${h - pad.b}`;

  return (
    <div className="gd-chart-wrap">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="gdChartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a6b5c" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#1a6b5c" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#gdChartFill)" />
        <polyline
          points={line}
          fill="none"
          stroke="#1a6b5c"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function GuideDashboardPage() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState<GuideNav>('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const [form, setForm] = useState(emptyTour);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [autoApprove, setAutoApprove] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('month');

  const [tours, setTours] = useState<Tour[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const reload = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setDataLoading(true);
    Promise.all([apiGetMyTours(), apiGetGuideBookings()])
      .then(([toursData, bookingsData]) => {
        if (!cancelled) {
          setTours(toursData);
          setBookings(bookingsData);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Could not load dashboard data'));
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, refreshKey]);

  const totalEarnings = useMemo(() => {
    return bookings.reduce((sum, b) => {
      const tour = tours.find((t) => t.id === b.tourId);
      return sum + (tour?.price ?? 0) * b.peopleCount;
    }, 0);
  }, [bookings, tours]);

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const fillRate =
    tours.length === 0 ? 0 : Math.min(100, Math.round((bookings.length / (tours.length * 4)) * 100));

  const chartData = useMemo(() => {
    const base = [2, 4, 3, 6, 5, 8, bookings.length + 4, bookings.length + 6];
    return chartPeriod === 'week' ? base.slice(-4) : base;
  }, [bookings.length, chartPeriod]);

  const activities = useMemo(() => {
    const items = bookings
      .map((b) => ({
        id: `b-${b.id}`,
        text: `New booking for ${b.tourTitle} — ${b.travelerName}`,
        time: relativeTime(b.createdAt),
        sort: new Date(b.createdAt).getTime(),
      }))
      .sort((a, b) => b.sort - a.sort);

    if (items.length === 0 && tours.length > 0) {
      return [
        {
          id: 't-1',
          text: `Your tour "${tours[0].title}" is live on the marketplace`,
          time: relativeTime(tours[0].createdAt),
          sort: 0,
        },
      ];
    }
    return items.slice(0, 5);
  }, [bookings, tours]);

  const headerSubtitle = `${formatDateLong(new Date())} | ${fillRate}% booking fill rate`;

  const resetForm = () => {
    setForm(emptyTour);
    setEditingId(null);
  };

  const openCreateTour = () => {
    resetForm();
    setActiveNav('tours');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (tour: Tour) => {
    setActiveNav('tours');
    setEditingId(tour.id);
    setForm({
      title: tour.title,
      description: tour.description,
      price: String(tour.price),
      location: tour.location,
      duration: tour.duration,
      imageUrl: tour.imageUrl,
      featured: tour.featured,
    });
  };

  const handleDelete = async (id: number) => {
    if (!user) return;
    if (!confirm('Delete this tour? Related bookings will be removed.')) return;
    setError('');
    try {
      await apiDeleteTour(id);
      setMessage('Tour deleted');
      reload();
      if (editingId === id) resetForm();
    } catch (err) {
      setError(getErrorMessage(err, 'Delete failed'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setMessage('');
    const body = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      location: form.location,
      duration: form.duration,
      imageUrl: form.imageUrl || undefined,
      featured: form.featured,
    };
    try {
      if (editingId) {
        await apiUpdateTour(editingId, body);
        setMessage('Tour updated');
      } else {
        await apiCreateTour(body);
        setMessage('Tour created');
      }
      resetForm();
      reload();
    } catch (err) {
      setError(getErrorMessage(err, 'Save failed'));
    }
  };

  if (!user) return null;

  return (
    <GuideDashboardLayout
      activeNav={activeNav}
      onNavChange={setActiveNav}
      onCreateTour={openCreateTour}
      headerSubtitle={headerSubtitle}
    >
      {error && <p className="gd-alert gd-alert--error">{error}</p>}
      {message && <p className="gd-alert gd-alert--success">{message}</p>}
      {dataLoading && (
        <Loader variant="section" message="Loading your guide hub…" />
      )}

      {activeNav === 'overview' && !dataLoading && (
        <>
          <div className="gd-stats">
            <article className="gd-card gd-stat">
              <p className="gd-stat__label">Active tours</p>
              <p className="gd-stat__value">{tours.length}</p>
              <span className="gd-stat__icon gd-stat__icon--teal" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                </svg>
              </span>
            </article>
            <article className="gd-card gd-stat">
              <p className="gd-stat__label">Total earnings</p>
              <p className="gd-stat__value">${totalEarnings.toLocaleString()}</p>
              <span className="gd-stat__icon gd-stat__icon--green" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </span>
            </article>
            <article className="gd-card gd-stat">
              <p className="gd-stat__label">Total bookings</p>
              <p className="gd-stat__value">{bookings.length}</p>
              <span className="gd-stat__icon gd-stat__icon--teal" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </span>
            </article>
            <article className="gd-card gd-stat">
              <p className="gd-stat__label">Pending requests</p>
              <p className="gd-stat__value">{pendingCount}</p>
              <span className="gd-stat__icon gd-stat__icon--green" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                </svg>
              </span>
            </article>
          </div>

          <div className="gd-grid-2-1">
            <article className="gd-card">
              <div className="gd-card__head">
                <h2 className="gd-card__title">Booking trends</h2>
                <select
                  className="gd-select"
                  value={chartPeriod}
                  onChange={(e) => setChartPeriod(e.target.value)}
                  aria-label="Chart period"
                >
                  <option value="month">This month</option>
                  <option value="week">This week</option>
                </select>
              </div>
              <BookingTrendChart data={chartData} />
            </article>

            <article className="gd-card">
              <div className="gd-card__head">
                <h2 className="gd-card__title">Recent activity</h2>
              </div>
              <ul className="gd-activity-list">
                {activities.map((a) => (
                  <li key={a.id} className="gd-activity-item">
                    <span className="gd-activity-item__icon" aria-hidden>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <path d="M22 4 12 14.01l-3-3" />
                      </svg>
                    </span>
                    <div>
                      <p className="gd-activity-item__text">{a.text}</p>
                      <p className="gd-activity-item__time">{a.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <button type="button" className="gd-card__link" onClick={() => setActiveNav('bookings')}>
                View all activity
              </button>
            </article>
          </div>

          <div className="gd-grid-1-1">
            <article className="gd-card">
              <div className="gd-card__head">
                <h2 className="gd-card__title">Upcoming schedule</h2>
              </div>
              {bookings.length === 0 ? (
                <p className="gd-empty">No upcoming bookings yet.</p>
              ) : (
                bookings.slice(0, 4).map((b) => (
                  <div key={b.id} className="gd-list-row">
                    <span>
                      {b.tourTitle} — {b.date}
                    </span>
                    <span className={`gd-badge ${bookingBadgeClass(b.status)}`}>
                      {b.status === 'confirmed' ? 'In progress' : bookingBadgeLabel(b.status)}
                    </span>
                  </div>
                ))
              )}
            </article>

            <article className="gd-card">
              <div className="gd-card__head">
                <h2 className="gd-card__title">Pending requests</h2>
              </div>
              <div className="gd-toggle-row">
                <span>Auto-approve bookings</span>
                <button
                  type="button"
                  className={`gd-toggle ${autoApprove ? 'is-on' : ''}`}
                  aria-pressed={autoApprove}
                  onClick={() => setAutoApprove((v) => !v)}
                />
              </div>
              {bookings.filter((b) => b.status === 'pending').length === 0 ? (
                <p className="gd-empty">No pending booking requests.</p>
              ) : (
                bookings
                  .filter((b) => b.status === 'pending')
                  .slice(0, 3)
                  .map((b) => (
                    <div key={b.id} className="gd-list-row">
                      <span>
                        {b.travelerName} — {b.tourTitle}
                      </span>
                      <span className="gd-badge gd-badge--new">New</span>
                    </div>
                  ))
              )}
              <button type="button" className="gd-card__link" onClick={() => setActiveNav('bookings')}>
                Review all
              </button>
            </article>
          </div>
        </>
      )}

      {activeNav === 'tours' && !dataLoading && (
        <>
          <h2 className="gd-panel-title">{editingId ? 'Edit tour' : 'My tours'}</h2>
          <p className="gd-panel-lead">Create and manage the experiences travelers can book.</p>

          <form className="gd-card gd-form" onSubmit={handleSubmit}>
            <label>
              Title
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>
            <label>
              Location
              <input
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </label>
            <label>
              Price (USD)
              <input
                type="number"
                required
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </label>
            <label>
              Duration
              <input
                required
                placeholder="e.g. 3 hours"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
            </label>
            <label className="full">
              Description
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <label className="full">
              Image URL
              <input
                type="url"
                placeholder="https://…"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
            </label>
            <label className="full gd-checkbox">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              Featured on home page
            </label>
            <div className="gd-form-actions">
              <button type="submit" className="gd-btn-primary">
                {editingId ? 'Save changes' : 'Add tour'}
              </button>
              {editingId && (
                <button type="button" className="gd-btn-ghost" onClick={resetForm}>
                  Cancel edit
                </button>
              )}
            </div>
          </form>

          <article className="gd-card gd-card--scroll-table">
            <div className="gd-card__head">
              <h2 className="gd-card__title">All tours ({tours.length})</h2>
            </div>
            {tours.length === 0 ? (
              <p className="gd-empty">No tours yet. Create your first tour above.</p>
            ) : (
              <div className="gd-table-wrap">
              <table className="gd-table gd-table--tours">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Location</th>
                    <th>Price</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tours.map((t) => (
                    <tr key={t.id}>
                      <td>{t.title}</td>
                      <td>{t.location}</td>
                      <td>${t.price}</td>
                      <td>{t.featured ? 'Yes' : 'No'}</td>
                      <td>
                        <div className="gd-table-actions">
                          <button type="button" className="gd-btn-ghost" onClick={() => handleEdit(t)}>
                            Edit
                          </button>
                          <button type="button" className="gd-btn-danger" onClick={() => handleDelete(t.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </article>
        </>
      )}

      {activeNav === 'bookings' && !dataLoading && (
        <>
          <h2 className="gd-panel-title">Bookings</h2>
          <p className="gd-panel-lead">Travelers who have reserved your tours.</p>
          <article className="gd-card gd-card--scroll-table">
            {bookings.length === 0 ? (
              <p className="gd-empty">No bookings yet.</p>
            ) : (
              <div className="gd-table-wrap">
              <table className="gd-table gd-table--bookings">
                <thead>
                  <tr>
                    <th>Tour</th>
                    <th>Traveler</th>
                    <th>Date</th>
                    <th>Guests</th>
                    <th>Payment</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td>{b.tourTitle}</td>
                      <td>
                        {b.travelerName}
                        <br />
                        <small>{b.travelerEmail}</small>
                      </td>
                      <td>{b.date}</td>
                      <td>{b.peopleCount}</td>
                      <td>{b.paymentMethod}</td>
                      <td>
                        <span className={`gd-badge ${bookingBadgeClass(b.status)}`}>
                          {bookingBadgeLabel(b.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </article>
        </>
      )}
    </GuideDashboardLayout>
  );
}
