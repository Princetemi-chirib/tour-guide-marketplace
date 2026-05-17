import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import { apiListTours } from '../api/services';
import { Loader } from '../components/Loader';
import { TourListingCard } from '../components/TourListingCard';
import { ToursAppShell } from '../components/ToursAppShell';
import type { Tour } from '../types';

const FAV_KEY = 'tgm_favorites';

function loadFavorites(): number[] {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function saveFavorites(ids: number[]) {
  localStorage.setItem(FAV_KEY, JSON.stringify(ids));
}

export function TourListPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const [search, setSearch] = useState(q);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');
  const [sort, setSort] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(loadFavorites);
  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    setSearch(q);
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError('');
    apiListTours({
      search: q || undefined,
      featured: featuredOnly || undefined,
    })
      .then((tours) => {
        if (!cancelled) setAllTours(tours);
      })
      .catch((err) => {
        if (!cancelled) setFetchError(getErrorMessage(err, 'Could not load tours'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q, featuredOnly]);

  const locations = useMemo(() => {
    const set = new Set(allTours.map((t) => t.location));
    return Array.from(set).sort();
  }, [allTours]);

  const tours = useMemo(() => {
    let list = [...allTours];
    if (locationFilter) {
      list = list.filter((t) => t.location === locationFilter);
    }
    if (sort === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    }
    return list;
  }, [allTours, locationFilter, sort]);

  const areaLabel = locationFilter || (q.trim() ? q.trim() : 'Africa');

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveFavorites(next);
      return next;
    });
  }, []);

  const handleSearchSubmit = (next: string) => {
    setParams(next ? { q: next } : {});
  };

  return (
    <ToursAppShell
      searchValue={search}
      onSearchChange={setSearch}
      onSearchSubmit={handleSearchSubmit}
    >
      <div className="tours-toolbar">
        <div className="tours-toolbar__count">
          {loading ? (
            <Loader variant="inline" message="Finding tours…" />
          ) : (
            <p className="tours-toolbar__count-text">
              Over <strong>{tours.length}</strong> tours in <strong>{areaLabel}</strong>
            </p>
          )}
        </div>
        <div className="tours-toolbar__controls">
          <button
            type="button"
            className={`tours-filter-btn ${filterOpen ? 'is-open' : ''}`}
            onClick={() => setFilterOpen((o) => !o)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filter
          </button>
          <div className="tours-view-toggle" role="group" aria-label="View mode">
            <button
              type="button"
              className={view === 'grid' ? 'is-active' : ''}
              onClick={() => setView('grid')}
              aria-label="Grid view"
              aria-pressed={view === 'grid'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>
            <button
              type="button"
              className={view === 'list' ? 'is-active' : ''}
              onClick={() => setView('list')}
              aria-label="List view"
              aria-pressed={view === 'list'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {filterOpen && (
        <div className="tours-filter-panel">
          <label>
            Location
            <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
              <option value="">All locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </label>
          <label>
            Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
              <option value="default">Recommended</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
          <label style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
            />
            Featured only
          </label>
        </div>
      )}

      {fetchError && <p className="tours-empty">{fetchError}</p>}

      <section className={`tours-grid ${view === 'list' ? 'tours-grid--list' : ''}`}>
        {loading ? (
          <Loader variant="section" message="Rolling out tours…" className="tours-empty-loader" />
        ) : tours.length === 0 && !fetchError ? (
          <p className="tours-empty">No tours found. Try a different search or filter.</p>
        ) : (
          tours.map((tour) => (
            <TourListingCard
              key={tour.id}
              tour={tour}
              view={view}
              isFavorite={favorites.includes(tour.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))
        )}
      </section>
    </ToursAppShell>
  );
}
