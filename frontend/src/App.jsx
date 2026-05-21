import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import RoleGate from './pages/RoleGate';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLayout from './layouts/AdminLayout';
import MemberLayout from './layouts/MemberLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProjects from './pages/admin/Projects';
import AdminProjectDetail from './pages/admin/ProjectDetail';
import MemberDashboard from './pages/member/Dashboard';
import MemberTasks from './pages/member/Tasks';
import MemberProjects from './pages/member/Projects';

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading…</div>;
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="page-loading">Loading…</div>;

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/member'} /> : <RoleGate />}
      />
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />

      <Route
        path="/admin"
        element={
          <PrivateRoute role="admin">
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="projects/:id" element={<AdminProjectDetail />} />
      </Route>

      <Route
        path="/member"
        element={
          <PrivateRoute role="member">
            <MemberLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<MemberDashboard />} />
        <Route path="tasks" element={<MemberTasks />} />
        <Route path="projects" element={<MemberProjects />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
