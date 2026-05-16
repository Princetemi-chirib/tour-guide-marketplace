import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MockError, mockGetTourById } from '../mock/service';

export function TourDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const tour = useMemo(() => {
    if (!id) return null;
    try {
      return mockGetTourById(Number(id));
    } catch (e) {
      if (e instanceof MockError) return null;
      throw e;
    }
  }, [id]);

  const handleBook = () => {
    if (!user) {
      navigate('/login', { state: { from: `/tours/${id}/book` } });
      return;
    }
    if (user.role !== 'traveler') {
      alert('Only travelers can book tours. Sign in with a traveler account.');
      return;
    }
    navigate(`/tours/${id}/book`);
  };

  if (!tour) {
    return <p className="alert alert--error">Tour not found</p>;
  }

  return (
    <article className="page tour-detail">
      <img src={tour.imageUrl} alt={tour.title} className="tour-detail__hero" />
      <div className="tour-detail__content">
        <p className="tour-detail__location">{tour.location}</p>
        <h1>{tour.title}</h1>
        <p className="tour-detail__meta">
          <span>Duration: {tour.duration}</span>
          <span>Guide: {tour.guideName}</span>
          <span className="tour-detail__price">${tour.price.toFixed(0)}</span>
        </p>
        <p className="tour-detail__description">{tour.description}</p>
        <div className="tour-detail__actions">
          <button type="button" className="btn btn--primary" onClick={handleBook}>
            Book this tour
          </button>
          <Link to="/tours" className="btn btn--ghost">
            Back to listings
          </Link>
        </div>
      </div>
    </article>
  );
}
