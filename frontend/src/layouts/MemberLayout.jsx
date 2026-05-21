import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MemberLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell member-shell">
      <aside className="sidebar member-sidebar">
        <div className="sidebar-brand">
          <span className="logo-mark member-mark">WD</span>
          <div>
            <strong>WorkDesk</strong>
            <small>Member</small>
          </div>
        </div>
        <nav>
          <NavLink end to="/member">
            Dashboard
          </NavLink>
          <NavLink to="/member/tasks">My tasks</NavLink>
          <NavLink to="/member/projects">Projects</NavLink>
        </nav>
        <div className="sidebar-foot">
          <span>{user?.name}</span>
          <button type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
