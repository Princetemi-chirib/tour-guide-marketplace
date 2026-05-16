import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/landing.css';

const IMAGES = {
  hero: '/images/zew zea.jpg',
  howItWorks: '/images/how it works.jpg',
  macbook: '/images/MacBook Pro 1.png',
  testimonials: [
    '/images/e8e1c5d3187c7ca20ca7c88d14f77298c9872cbb.jpg',
    '/images/8a2c28c27137421be81208522fcf27eb75f2e3ac.jpg',
    '/images/4e0cb65950225e09a4c464baaf7f7d4c02c3db20.jpg',
    '/images/da28707915dca9afc6fd3632a126257f953d7c6f.jpg',
  ],
} as const;

const WHY = [
  {
    title: 'Expert Local Guides',
    text: 'Every tour is led by verified guides who know their city inside out.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    title: 'Secure Booking',
    text: 'Book with confidence — simple checkout and clear cancellation policies.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: 'Best Value Tours',
    text: 'Compare experiences and prices so you always get fair, transparent rates.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: '24/7 Support',
    text: 'Our team is here before, during, and after your adventure.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

const STEPS = [
  {
    variant: 'mint' as const,
    title: 'Find a Tour',
    text: 'Search by destination, date, or interest. Browse curated experiences across Africa.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    variant: 'yellow' as const,
    title: 'Book & Pay',
    text: 'Choose your date, group size, and payment method. Confirm in just a few clicks.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <path d="M1 10h22" />
      </svg>
    ),
  },
  {
    variant: 'peach' as const,
    title: 'Enjoy Your Trip',
    text: 'Meet your guide, explore with locals, and create memories that last a lifetime.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const FEATURES = [
  'Browse hundreds of tours in one place',
  'Read reviews from real travelers',
  'Instant booking confirmation',
  'Manage bookings from your dashboard',
  'Become a guide and list your own tours',
];

const TESTIMONIALS = [
  {
    quote:
      'The Lagos city tour was incredible. Our guide knew every hidden gem — felt like exploring with a friend.',
    name: 'Amara Osei',
    role: 'Lagos, Nigeria',
  },
  {
    quote:
      'Booking through TGM was seamless. I found a Cape Town hike, paid securely, and showed up stress-free.',
    name: 'David Chen',
    role: 'Cape Town, SA',
  },
  {
    quote:
      'As a guide, TGM helped me reach travelers I would never have found on my own. Highly recommend.',
    name: 'Fatima Hassan',
    role: 'Marrakech, Morocco',
  },
  {
    quote:
      'The medina food walk was the highlight of our trip. Authentic, safe, and unforgettable.',
    name: 'Elena Rossi',
    role: 'Solo Traveler',
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/tours?q=${encodeURIComponent(q)}` : '/tours');
  };

  return (
    <div className="landing">
      <header className="landing-header">
        <Link to="/" className="landing-logo">
          TGM
        </Link>
        <div className="landing-header__actions">
          {user ? (
            <>
              <Link
                to={user.role === 'guide' ? '/guide' : '/dashboard'}
                className="landing-login"
              >
                Dashboard
              </Link>
              <button type="button" className="landing-btn-pill landing-btn-pill--primary" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="landing-login">
                Login
              </Link>
              <Link to="/register" className="landing-btn-pill landing-btn-pill--primary">
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero__intro">
          <h1 className="landing-hero__title">
            Find Your <em>Next Adventure</em>, Stress-Free.
          </h1>
          <p className="landing-hero__desc">
            Discover unforgettable tours with trusted local guides. From city walks to safaris —
            book your perfect experience in minutes, without the hassle.
          </p>
        </div>
        <div className="landing-hero__frame">
          <img src={IMAGES.hero} alt="Travelers on a guided tour" />
          <form className="landing-search-float" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search tours by city, country, or experience…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search tours"
            />
            <button type="submit">Search Tours</button>
          </form>
        </div>
      </section>

      <section className="landing-section" id="about">
        <h2 className="landing-h2">Why Use TGM</h2>
        <div className="landing-why-grid">
          {WHY.map((item) => (
            <article key={item.title} className="landing-why-card">
              <div className="landing-why-card__icon" aria-hidden>
                {item.icon}
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section" id="how">
        <h2 className="landing-h2">How It Works</h2>
        <div className="landing-how-wrap">
          <div className="landing-how-photo">
            <img src={IMAGES.howItWorks} alt="Guide leading a group tour" />
          </div>
          <div className="landing-how-steps">
            {STEPS.map((step) => (
              <article
                key={step.title}
                className={`landing-step-card landing-step-card--${step.variant}`}
              >
                <div className="landing-step-card__icon" aria-hidden>
                  {step.icon}
                </div>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section" id="features">
        <h2 className="landing-h2">Key Features for Travelers</h2>
        <div className="landing-features-wrap">
          <ul className="landing-features-list">
            {FEATURES.map((f) => (
              <li key={f}>
                <span className="check" aria-hidden>
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>
          <div className="landing-features-mac">
            <img src={IMAGES.macbook} alt="TGM marketplace on MacBook" />
          </div>
        </div>
      </section>

      <section className="landing-section" id="testimonials">
        <h2 className="landing-h2">Testimonials</h2>
        <div className="landing-testimonials-row">
          {TESTIMONIALS.map((t, i) => (
            <article key={t.name} className="landing-testimonial-card">
              <img src={IMAGES.testimonials[i]} alt="" />
              <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
              <strong>{t.name}</strong>
              <span>{t.role}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-cta-section">
        <div className="landing-cta-banner">
          <h2>Your dream tour is just a click away.</h2>
          <Link to="/tours" className="landing-btn-pill landing-btn-pill--cta">
            Get Started Now
          </Link>
        </div>
      </section>

      <footer className="landing-footer" id="contact">
        <div className="landing-footer__deco" aria-hidden />
        <div className="landing-footer__grid">
          <div>
            <span className="landing-footer__logo">TGM</span>
            <p className="landing-footer__built">
              Built by <strong>Tour Guide Marketplace</strong>
            </p>
            <p className="landing-footer__contact-lines">
              +234 800 TGM HELP
              <br />
              hello@tgm.market
            </p>
            <div className="landing-footer__socials">
              <a href="#" aria-label="Facebook">
                f
              </a>
              <a href="#" aria-label="Instagram">
                in
              </a>
              <a href="#" aria-label="LinkedIn">
                li
              </a>
            </div>
          </div>
          <div className="landing-footer__col">
            <h4>Company</h4>
            <ul>
              <li>
                <a href="#about" onClick={(e) => { e.preventDefault(); scrollTo('about'); }}>
                  About us
                </a>
              </li>
              <li>
                <Link to="/tours">Our tours</Link>
              </li>
              <li>
                <Link to="/register">Become a guide</Link>
              </li>
            </ul>
          </div>
          <div className="landing-footer__col">
            <h4>Support</h4>
            <ul>
              <li>
                <a href="#contact">Help center</a>
              </li>
              <li>
                <a href="#contact">FAQ</a>
              </li>
              <li>
                <a href="#contact">Contact us</a>
              </li>
            </ul>
          </div>
          <div className="landing-footer__col">
            <h4>Legal</h4>
            <ul>
              <li>
                <a href="#">Privacy policy</a>
              </li>
              <li>
                <a href="#">Terms of service</a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
