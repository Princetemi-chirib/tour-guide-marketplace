import { Link } from 'react-router-dom';
import type { Tour } from '../types';

interface Props {
  tour: Tour;
}

export function TourCard({ tour }: Props) {
  return (
    <article className="tour-card">
      <img src={tour.imageUrl} alt={tour.title} className="tour-card__image" />
      <div className="tour-card__body">
        <h3>{tour.title}</h3>
        <p className="tour-card__location">{tour.location}</p>
        <p className="tour-card__price">${tour.price.toFixed(0)}</p>
        <Link to={`/tours/${tour.id}`} className="btn btn--secondary">
          View Details
        </Link>
      </div>
    </article>
  );
}
