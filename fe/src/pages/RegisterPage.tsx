import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import type { UserRole } from '../types';
import { AuthSplitVisual } from '../components/AuthSplitVisual';
import '../styles/auth-split.css';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('traveler');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const name = `${firstName.trim()} ${lastName.trim()}`.trim();
      const user = await register(name, email, password, role);
      navigate(user.role === 'guide' ? '/guide' : '/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-split">
      <AuthSplitVisual />

      <div className="auth-split__form-panel">
        <div className="auth-split__inner">
          <Link to="/" className="auth-split__logo">
            TGM
          </Link>

          <h1 className="auth-split__title">Let us get to know you</h1>
          <p className="auth-split__subtitle">
            Join Tour Guide Marketplace to discover adventures or share your expertise as a
            guide.
          </p>

          <form className="auth-split__form" onSubmit={handleSubmit} noValidate>
            {error && <p className="auth-split__alert auth-split__alert--error">{error}</p>}

            <div className="auth-split__field">
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                type="text"
                required
                autoComplete="given-name"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="auth-split__field">
              <label htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                type="text"
                required
                autoComplete="family-name"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="auth-split__field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="auth-split__field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Create a password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <fieldset className="auth-split__field auth-split__fieldset">
              <legend>I want to</legend>
              <div className="auth-split__role-options">
                <label className="auth-split__role-option">
                  <input
                    type="radio"
                    name="role"
                    value="traveler"
                    checked={role === 'traveler'}
                    onChange={() => setRole('traveler')}
                  />
                  <span>Book tours</span>
                </label>
                <label className="auth-split__role-option">
                  <input
                    type="radio"
                    name="role"
                    value="guide"
                    checked={role === 'guide'}
                    onChange={() => setRole('guide')}
                  />
                  <span>List tours as a guide</span>
                </label>
              </div>
            </fieldset>

            <button type="submit" className="auth-split__submit" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Continue'}
            </button>
          </form>

          <p className="auth-split__footer">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
