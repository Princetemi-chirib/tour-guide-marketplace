import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import { AuthSplitVisual } from '../components/AuthSplitVisual';
import { useAuth } from '../context/AuthContext';
import '../styles/auth-split.css';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      const dest = from || (user.role === 'guide' ? '/guide' : '/dashboard');
      navigate(dest, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-split">
      <AuthSplitVisual message="Welcome back — pick up where you left off and explore your next adventure." />

      <div className="auth-split__form-panel">
        <div className="auth-split__inner">
          <Link to="/" className="auth-split__logo">
            TGM
          </Link>

          <h1 className="auth-split__title">Welcome back</h1>
          <p className="auth-split__subtitle">
            Sign in to book tours, view your bookings, or manage your guide dashboard.
          </p>

          <p className="auth-split__hint">
            Demo: <strong>traveler@marketplace.test</strong> or{' '}
            <strong>guide@marketplace.test</strong> · password <strong>password123</strong>
          </p>

          <form className="auth-split__form" onSubmit={handleSubmit}>
            {error && <p className="auth-split__alert auth-split__alert--error">{error}</p>}

            <div className="auth-split__field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="auth-split__field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                required
                minLength={6}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="auth-split__submit" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Continue'}
            </button>
          </form>

          <p className="auth-split__footer">
            Don&apos;t have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
