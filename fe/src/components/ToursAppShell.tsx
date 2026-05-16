import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/tours-page.css';

function userInitials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export interface ToursAppShellProps {
  children: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (query: string) => void;
}

export function ToursAppShell({
  children,
  searchValue: controlledSearch,
  onSearchChange,
  onSearchSubmit,
}: ToursAppShellProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState('');

  const search = controlledSearch ?? internalSearch;
  const setSearch = onSearchChange ?? setInternalSearch;

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const next = search.trim();
    if (onSearchSubmit) {
      onSearchSubmit(next);
      return;
    }
    navigate(next ? `/tours?q=${encodeURIComponent(next)}` : '/tours');
  };

  return (
    <div className="tours-page">
      <div className="tours-page__shell">
        <header className="tours-topbar">
          <Link to="/" className="tours-topbar__logo" aria-label="TGM home">
            TGM
            <span>Tour Guide Marketplace</span>
          </Link>

          <form className="tours-topbar__search" onSubmit={handleSearch}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              placeholder="Search by city, area, or tour name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search tours"
            />
          </form>

          <div className="tours-topbar__actions">
            <button type="button" className="tours-icon-btn" aria-label="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>

            {user ? (
              <div className="tours-user">
                <span className="tours-user__avatar">{userInitials(user.name)}</span>
                <span className="tours-user__info">
                  <span className="tours-user__name">{user.name}</span>
                  <span className="tours-user__email">{user.email}</span>
                </span>
              </div>
            ) : (
              <div className="tours-auth-links">
                <Link to="/login">Log in</Link>
                <Link to="/register" className="tours-btn-sm">
                  Get started
                </Link>
              </div>
            )}

            <button
              type="button"
              className="tours-icon-btn"
              aria-label="Menu"
              onClick={() => setMenuOpen(true)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        {children}
      </div>

      {menuOpen && (
        <div
          className="tours-mobile-menu is-open"
          role="dialog"
          aria-modal="true"
          onClick={() => setMenuOpen(false)}
        >
          <div className="tours-mobile-menu__panel" onClick={(e) => e.stopPropagation()}>
            <Link to="/" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link to="/tours" onClick={() => setMenuOpen(false)}>
              Tours
            </Link>
            {user ? (
              <>
                {user.role === 'traveler' && (
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                    My bookings
                  </Link>
                )}
                {user.role === 'guide' && (
                  <Link to="/guide" onClick={() => setMenuOpen(false)}>
                    Guide dashboard
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                    navigate('/');
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  Log in
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
