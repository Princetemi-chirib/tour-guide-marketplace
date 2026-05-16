import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/guide-dashboard.css';

export type GuideNav = 'overview' | 'tours' | 'bookings';

interface Props {
  activeNav: GuideNav;
  onNavChange: (nav: GuideNav) => void;
  onCreateTour: () => void;
  headerSubtitle: string;
  children: React.ReactNode;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  tours: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  bookings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  messages: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
};

export function GuideDashboardLayout({
  activeNav,
  onNavChange,
  onCreateTour,
  headerSubtitle,
  children,
}: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const firstName = user.name.split(/\s+/)[0];

  const navBtn = (id: GuideNav, label: string, icon: React.ReactNode) => (
    <li>
      <button
        type="button"
        className={`gd-sidebar__link ${activeNav === id ? 'is-active' : ''}`}
        onClick={() => onNavChange(id)}
      >
        {icon}
        {label}
      </button>
    </li>
  );

  return (
    <div className="gd-app">
      <aside className="gd-sidebar">
        <Link to="/" className="gd-sidebar__logo">
          TGM
          <span>Tour Guide Marketplace</span>
        </Link>

        <div className="gd-sidebar__group">
          <span className="gd-sidebar__label">Main menu</span>
          <ul className="gd-sidebar__nav">
            {navBtn('overview', 'Dashboard', icons.dashboard)}
            {navBtn('tours', 'My tours', icons.tours)}
            {navBtn('bookings', 'Bookings', icons.bookings)}
          </ul>
        </div>

        <div className="gd-sidebar__group">
          <span className="gd-sidebar__label">Support</span>
          <ul className="gd-sidebar__nav">
            <li>
              <button type="button" className="gd-sidebar__link" disabled title="Coming soon">
                {icons.messages}
                Messages
              </button>
            </li>
            <li>
              <button type="button" className="gd-sidebar__link" disabled title="Coming soon">
                {icons.settings}
                Settings
              </button>
            </li>
          </ul>
        </div>

        <div className="gd-sidebar__spacer" />

        <button
          type="button"
          className="gd-sidebar__link gd-sidebar__logout"
          onClick={() => {
            logout();
            navigate('/');
          }}
        >
          {icons.logout}
          Log out
        </button>
      </aside>

      <main className="gd-main">
        <header className="gd-header">
          <div>
            <h1 className="gd-header__title">
              {greeting()}, {firstName}!
            </h1>
            <p className="gd-header__sub">{headerSubtitle}</p>
          </div>
          <div className="gd-header__actions">
            <button type="button" className="gd-btn-primary" onClick={onCreateTour}>
              Create new tour +
            </button>
            <button type="button" className="gd-icon-btn" aria-label="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <div className="gd-header__user">
              <span className="gd-header__avatar">{initials(user.name)}</span>
              <span className="gd-header__name">{user.name}</span>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
