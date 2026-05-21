import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell admin-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="logo-mark">WD</span>
          <div>
            <strong>WorkDesk</strong>
            <small>Admin</small>
          </div>
        </div>
        <nav>
          <NavLink end to="/admin">
            Dashboard
          </NavLink>
          <NavLink to="/admin/projects">Projects</NavLink>
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
