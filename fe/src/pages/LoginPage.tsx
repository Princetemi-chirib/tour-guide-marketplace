import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MockError } from '../mock/service';

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
      setError(err instanceof MockError ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page auth-page">
      <h1>Log in</h1>
      <p className="page-lead">Welcome back. Sign in to book tours or manage your guide account.</p>
      <p className="mock-hint">
        Demo: <code>traveler@marketplace.test</code> or <code>guide@marketplace.test</code> /{' '}
        <code>password123</code>
      </p>
      <form className="form-card" onSubmit={handleSubmit}>
        {error && <p className="alert alert--error">{error}</p>}
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Log in'}
        </button>
      </form>
      <p className="auth-page__footer">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}
