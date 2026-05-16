import { Link } from 'react-router-dom';
import type { Tour } from '../types';

interface Props {
  tour: Tour;
  view: 'grid' | 'list';
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}

function mockRating(id: number) {
  return (4.5 + (id % 5) * 0.1).toFixed(1);
}

export function TourListingCard({ tour, view, isFavorite, onToggleFavorite }: Props) {
  return (
    <article className={`tour-listing-card ${view === 'list' ? 'tour-listing-card--list' : ''}`}>
      <Link to={`/tours/${tour.id}`} className="tour-listing-card__media">
        <img src={tour.imageUrl} alt={tour.title} />
        <button
          type="button"
          className={`tour-listing-card__fav ${isFavorite ? 'is-active' : ''}`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(tour.id);
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        <span className="tour-listing-card__nav tour-listing-card__nav--prev" aria-hidden>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </span>
        <span className="tour-listing-card__nav tour-listing-card__nav--next" aria-hidden>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </span>
      </Link>
      <div className="tour-listing-card__body">
        <Link to={`/tours/${tour.id}`}>
          <h3 className="tour-listing-card__title">{tour.title}</h3>
        </Link>
        <p className="tour-listing-card__desc">
          {tour.duration} · Guided by {tour.guideName ?? 'local expert'}
        </p>
        <p className="tour-listing-card__location">{tour.location}</p>
        <div className="tour-listing-card__footer">
          <span className="tour-listing-card__rating">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {mockRating(tour.id)}
          </span>
          <span className="tour-listing-card__price">${tour.price.toFixed(0)}</span>
        </div>
      </div>
    </article>
  );
}
