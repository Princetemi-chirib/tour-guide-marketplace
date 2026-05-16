import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockGetBookingsForUser } from '../mock/service';

export function UserDashboardPage() {
  const { user } = useAuth();

  const bookings = useMemo(
    () => (user ? mockGetBookingsForUser(user.id) : []),
    [user]
  );

  return (
    <div className="page dashboard">
      <h1>My dashboard</h1>

      <section className="dashboard-section">
        <h2>Profile</h2>
        {user && (
          <dl className="profile-card">
            <dt>Name</dt>
            <dd>{user.name}</dd>
            <dt>Email</dt>
            <dd>{user.email}</dd>
            <dt>Role</dt>
            <dd className="badge">{user.role}</dd>
          </dl>
        )}
      </section>

      <section className="dashboard-section">
        <div className="section__head">
          <h2>Booked tours</h2>
          <Link to="/tours" className="btn btn--secondary btn--sm">
            Browse tours
          </Link>
        </div>
        {bookings.length === 0 ? (
          <p className="page-status">No bookings yet. Find a tour to reserve.</p>
        ) : (
          <div className="booking-list">
            {bookings.map((b) => (
              <article key={b.id} className="booking-item">
                {b.tourImageUrl && (
                  <img src={b.tourImageUrl} alt="" className="booking-item__img" />
                )}
                <div>
                  <h3>{b.tourTitle}</h3>
                  <p>{b.tourLocation}</p>
                  <p>
                    {b.date} · {b.peopleCount} guest{b.peopleCount > 1 ? 's' : ''} ·{' '}
                    {b.paymentMethod}
                  </p>
                  <span className={`status status--${b.status}`}>{b.status}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
