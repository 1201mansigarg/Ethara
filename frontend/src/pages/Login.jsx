import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [params] = useSearchParams();
  const role = params.get('role') || 'member';
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login({ ...form, role });
      navigate(user.role === 'admin' ? '/admin' : '/member');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const isAdmin = role === 'admin';

  return (
    <div className={`auth-page ${isAdmin ? 'theme-admin' : 'theme-member'}`}>
      <Link to="/" className="back-link">
        ← Choose role
      </Link>
      <div className="auth-box">
        <p className="auth-badge">{isAdmin ? 'Admin panel' : 'Member panel'}</p>
        <h2>Log in</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={isAdmin ? 'admin@workdesk.io' : 'you@company.com'}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="auth-switch">
          No account? <Link to={`/signup?role=${role}`}>Sign up as {role}</Link>
        </p>
      </div>
    </div>
  );
}
