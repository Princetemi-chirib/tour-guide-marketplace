import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ToursAppShell } from '../components/ToursAppShell';
import { useAuth } from '../context/AuthContext';
import { MockError, mockCreateBooking, mockGetTourById } from '../mock/service';

export function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [peopleCount, setPeopleCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const tour = useMemo(() => {
    if (!id) return null;
    try {
      return mockGetTourById(Number(id));
    } catch {
      return null;
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tour || !user) return;
    setError('');
    setSubmitting(true);
    try {
      mockCreateBooking(user.id, {
        tourId: tour.id,
        date,
        peopleCount,
        paymentMethod,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof MockError ? err.message : 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!tour) {
    return (
      <ToursAppShell>
        <div className="tours-booking">
          <p className="tours-detail__error">Tour not found.</p>
          <Link to="/tours" className="tours-detail__back">
            Back to listings
          </Link>
        </div>
      </ToursAppShell>
    );
  }

  const total = tour.price * peopleCount;
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <ToursAppShell>
      <div className="tours-booking">
        <h1 className="tours-booking__title">Book tour</h1>
        <p className="tours-booking__lead">
          {tour.title} — {tour.location}
        </p>

        <form className="tours-booking__form" onSubmit={handleSubmit}>
          {error && <p className="tours-booking__alert tours-booking__alert--error">{error}</p>}
          <label>
            Date
            <input
              type="date"
              required
              min={minDate}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label>
            Number of people
            <input
              type="number"
              required
              min={1}
              max={20}
              value={peopleCount}
              onChange={(e) => setPeopleCount(Number(e.target.value))}
            />
          </label>
          <label>
            Payment method (demo)
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="transfer">Bank transfer</option>
            </select>
          </label>
          <p className="tours-booking__total">
            Estimated total: <strong>${total.toFixed(0)}</strong>
          </p>
          <div className="tours-booking__actions">
            <button type="submit" className="tours-detail__btn tours-detail__btn--primary" disabled={submitting}>
              {submitting ? 'Processing…' : 'Confirm booking'}
            </button>
            <Link to={`/tours/${tour.id}`} className="tours-detail__btn tours-detail__btn--ghost">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </ToursAppShell>
  );
}
