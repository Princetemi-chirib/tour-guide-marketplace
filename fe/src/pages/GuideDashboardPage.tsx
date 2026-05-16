import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  MockError,
  mockCreateTour,
  mockDeleteTour,
  mockGetBookingsForGuide,
  mockGetToursByGuide,
  mockUpdateTour,
} from '../mock/service';
import type { Tour } from '../types';

const emptyTour = {
  title: '',
  description: '',
  price: '',
  location: '',
  duration: '',
  imageUrl: '',
  featured: false,
};

export function GuideDashboardPage() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [form, setForm] = useState(emptyTour);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const tours = useMemo(
    () => (user ? mockGetToursByGuide(user.id) : []),
    [user, refreshKey]
  );

  const bookings = useMemo(
    () => (user ? mockGetBookingsForGuide(user.id) : []),
    [user, refreshKey]
  );

  const reload = () => setRefreshKey((k) => k + 1);

  const resetForm = () => {
    setForm(emptyTour);
    setEditingId(null);
  };

  const handleEdit = (tour: Tour) => {
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

  const handleDelete = (id: number) => {
    if (!user) return;
    if (!confirm('Delete this tour? Related bookings will be removed.')) return;
    try {
      mockDeleteTour(id, user.id);
      setMessage('Tour deleted');
      reload();
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err instanceof MockError ? err.message : 'Delete failed');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
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
        mockUpdateTour(editingId, user.id, body);
        setMessage('Tour updated');
      } else {
        mockCreateTour(user.id, body);
        setMessage('Tour created');
      }
      resetForm();
      reload();
    } catch (err) {
      setError(err instanceof MockError ? err.message : 'Save failed');
    }
  };

  if (!user) return null;

  return (
    <div className="page dashboard guide-dashboard">
      <h1>Guide dashboard</h1>
      <p className="page-lead">Add and edit your tours, and view traveler bookings.</p>

      {error && <p className="alert alert--error">{error}</p>}
      {message && <p className="alert alert--success">{message}</p>}

      <section className="dashboard-section">
        <h2>{editingId ? 'Edit tour' : 'Add new tour'}</h2>
        <form className="form-card form-card--grid" onSubmit={handleSubmit}>
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
          <label className="full-width">
            Description
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label className="full-width">
            Image URL
            <input
              type="url"
              placeholder="https://…"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            Featured on home page
          </label>
          <div className="form-actions full-width">
            <button type="submit" className="btn btn--primary">
              {editingId ? 'Save changes' : 'Add tour'}
            </button>
            {editingId && (
              <button type="button" className="btn btn--ghost" onClick={resetForm}>
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="dashboard-section">
        <h2>My tours ({tours.length})</h2>
        {tours.length === 0 ? (
          <p className="page-status">No tours yet. Add your first tour above.</p>
        ) : (
          <table className="data-table">
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
                  <td className="table-actions">
                    <button type="button" className="btn btn--sm" onClick={() => handleEdit(t)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn--sm btn--danger"
                      onClick={() => handleDelete(t.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Bookings on my tours ({bookings.length})</h2>
        {bookings.length === 0 ? (
          <p className="page-status">No bookings yet.</p>
        ) : (
          <table className="data-table">
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
                    <span className={`status status--${b.status}`}>{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
