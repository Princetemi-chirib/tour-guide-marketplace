import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockResetStore } from '../mock/service';

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="logo logo--tgm">
          TGM
        </Link>
        <nav className="nav">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/tours">Tours</NavLink>
          {user?.role === 'traveler' && <NavLink to="/dashboard">My Bookings</NavLink>}
          {user?.role === 'guide' && <NavLink to="/guide">Guide Dashboard</NavLink>}
          {user ? (
            <>
              <span className="nav__user">Hi, {user.name}</span>
              <button type="button" className="btn btn--ghost" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/register" className="btn btn--primary btn--sm">
                Sign up
              </NavLink>
            </>
          )}
        </nav>
      </header>
      <div className="mock-banner">
        <span>
          <strong>Mock mode</strong> — UI runs on local sample data. Backend is not connected.
        </span>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => {
            if (confirm('Reset all mock tours, users, and bookings to defaults?')) {
              mockResetStore();
              logout();
              window.location.href = '/';
            }
          }}
        >
          Reset mock data
        </button>
      </div>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <p>© {new Date().getFullYear()} TourGuide Marketplace — Discover Africa with local guides.</p>
      </footer>
    </div>
  );
}
