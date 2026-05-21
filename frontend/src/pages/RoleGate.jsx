import { Link } from 'react-router-dom';

export default function RoleGate() {
  return (
    <div className="gate-page">
      <header className="gate-header">
        <span className="logo-mark">WD</span>
        <h1>WorkDesk</h1>
        <p className="tagline">Team task manager for small crews</p>
      </header>

      <p className="gate-prompt">Sign in as</p>

      <div className="role-cards">
        <Link to="/login?role=admin" className="role-card admin-card">
          <span className="role-icon">◆</span>
          <strong>Admin</strong>
          <span>Create projects, assign work, manage the team</span>
        </Link>
        <Link to="/login?role=member" className="role-card member-card">
          <span className="role-icon">○</span>
          <strong>Member</strong>
          <span>View assignments, update status, track deadlines</span>
        </Link>
      </div>

      <p className="gate-footer">
        New here?{' '}
        <Link to="/signup?role=admin">Admin signup</Link>
        {' · '}
        <Link to="/signup?role=member">Member signup</Link>
      </p>
    </div>
  );
}
