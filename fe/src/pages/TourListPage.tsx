import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TourCard } from '../components/TourCard';
import { mockGetTours } from '../mock/service';

export function TourListPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const [search, setSearch] = useState(q);

  useEffect(() => {
    setSearch(q);
  }, [q]);

  const tours = useMemo(
    () => mockGetTours(q ? { search: q } : {}),
    [q]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = search.trim();
    setParams(next ? { q: next } : {});
  };

  return (
    <div className="page">
      <h1>Tour listings</h1>
      <p className="page-lead">Explore available tours from verified local guides.</p>

      <form className="search-bar search-bar--inline" onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="Filter by title or location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn--primary">
          Search
        </button>
      </form>

      {tours.length === 0 ? (
        <p className="page-status">No tours found. Try a different search.</p>
      ) : (
        <section className="tour-grid">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </section>
      )}
    </div>
  );
}
