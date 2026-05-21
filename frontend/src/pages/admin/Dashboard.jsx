import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import StatusBadge from '../../components/StatusBadge';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.dashboard().then(setData).catch((e) => setErr(e.message));
  }, []);

  if (err) return <p className="form-error">{err}</p>;
  if (!data) return <p>Loading dashboard…</p>;

  const { stats, overdueTasks, recentTasks } = data;

  return (
    <div>
      <header className="page-header">
        <h1>Dashboard</h1>
        <Link to="/admin/projects" className="btn-primary">
          Manage projects
        </Link>
      </header>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-num">{stats.projects}</span>
          <span>Projects</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{stats.tasks.total}</span>
          <span>Total tasks</span>
        </div>
        <div className="stat-card warn">
          <span className="stat-num">{stats.overdue}</span>
          <span>Overdue</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{stats.tasks.done}</span>
          <span>Completed</span>
        </div>
      </div>

      <div className="status-pills">
        <span>To do: {stats.tasks.todo}</span>
        <span>In progress: {stats.tasks.in_progress}</span>
        <span>Done: {stats.tasks.done}</span>
      </div>

      <section className="panel">
        <h2>Overdue tasks</h2>
        {overdueTasks.length === 0 ? (
          <p className="empty-note">Nothing overdue — nice.</p>
        ) : (
          <ul className="task-list compact">
            {overdueTasks.map((t) => (
              <li key={t._id} className="overdue">
                <strong>{t.title}</strong>
                <span>
                  {t.project?.name} · {t.assignedTo?.name || 'Unassigned'}
                </span>
                <StatusBadge status={t.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <h2>Recent activity</h2>
        <ul className="task-list compact">
          {recentTasks.map((t) => (
            <li key={t._id}>
              <strong>{t.title}</strong>
              <span>{t.project?.name}</span>
              <StatusBadge status={t.status} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
