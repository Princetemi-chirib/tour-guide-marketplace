import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MockError } from '../mock/service';
import type { UserRole } from '../types';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
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
      const user = await register(name, email, password, role);
      navigate(user.role === 'guide' ? '/guide' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof MockError ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page auth-page">
      <h1>Create account</h1>
      <p className="page-lead">Join as a traveler to book tours, or as a guide to list your own.</p>
      <form className="form-card" onSubmit={handleSubmit}>
        {error && <p className="alert alert--error">{error}</p>}
        <label>
          Name
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
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
        <label>
          I am a
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
            <option value="traveler">Traveler (book tours)</option>
            <option value="guide">Guide (list tours)</option>
          </select>
        </label>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
      <p className="auth-page__footer">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
