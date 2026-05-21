import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [params] = useSearchParams();
  const role = params.get('role') || 'member';
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await register({ ...form, role });
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
        <p className="auth-badge">{isAdmin ? 'Admin account' : 'Member account'}</p>
        <h2>Create account</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Password (min 6)
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
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="auth-switch">
          Already have one? <Link to={`/login?role=${role}`}>Log in as {role}</Link>
        </p>
      </div>
    </div>
  );
}
