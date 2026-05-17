import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import { apiGetTour } from '../api/services';
import { Loader } from '../components/Loader';
import { ToursAppShell } from '../components/ToursAppShell';
import { useAuth } from '../context/AuthContext';
import type { Tour } from '../types';

export function TourDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    apiGetTour(Number(id))
      .then((t) => {
        if (!cancelled) setTour(t);
      })
      .catch((err) => {
        if (!cancelled) {
          if (err instanceof ApiError && err.status === 404) {
            setNotFound(true);
          }
          setTour(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
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

  if (loading) {
    return (
      <ToursAppShell>
        <Loader variant="full" message="Unfolding your tour…" />
      </ToursAppShell>
    );
  }

  if (notFound || !tour) {
    return (
      <ToursAppShell>
        <div className="tours-detail">
          <p className="tours-detail__error">Tour not found.</p>
          <Link to="/tours" className="tours-detail__back">
            Back to listings
          </Link>
        </div>
      </ToursAppShell>
    );
  }

  return (
    <ToursAppShell>
      <article className="tours-detail">
        <div className="tours-detail__card">
          <img src={tour.imageUrl} alt={tour.title} className="tours-detail__hero" />
          <div className="tours-detail__content">
            <p className="tours-detail__location">{tour.location}</p>
            <h1 className="tours-detail__title">{tour.title}</h1>
            <p className="tours-detail__meta">
              <span>Duration: {tour.duration}</span>
              <span>Guide: {tour.guideName}</span>
              <span className="tours-detail__price">${tour.price.toFixed(0)}</span>
            </p>
            <p className="tours-detail__description">{tour.description}</p>
            <div className="tours-detail__actions">
              <button type="button" className="tours-detail__btn tours-detail__btn--primary" onClick={handleBook}>
                Book this tour
              </button>
              <Link to="/tours" className="tours-detail__btn tours-detail__btn--ghost">
                Back to listings
              </Link>
            </div>
          </div>
        </div>
      </article>
    </ToursAppShell>
  );
}
