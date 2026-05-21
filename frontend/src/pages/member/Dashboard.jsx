import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import TaskList from '../../components/TaskList';

export default function MemberDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.dashboard().then(setData);
  }, []);

  const handleStatus = async (id, status) => {
    await api.updateTask(id, { status });
    const fresh = await api.dashboard();
    setData(fresh);
  };

  if (!data) return <p>Loading…</p>;

  const { stats, overdueTasks, recentTasks } = data;

  return (
    <div>
      <header className="page-header">
        <h1>My dashboard</h1>
        <Link to="/member/tasks" className="btn-primary member-btn">
          All tasks
        </Link>
      </header>

      <div className="stat-grid member-stats">
        <div className="stat-card">
          <span className="stat-num">{stats.tasks.total}</span>
          <span>Assigned</span>
        </div>
        <div className="stat-card warn">
          <span className="stat-num">{stats.overdue}</span>
          <span>Overdue</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{stats.tasks.in_progress}</span>
          <span>In progress</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{stats.tasks.done}</span>
          <span>Done</span>
        </div>
      </div>

      <section className="panel">
        <h2>Needs attention</h2>
        <TaskList tasks={overdueTasks} editable onStatusChange={handleStatus} />
      </section>

      <section className="panel">
        <h2>Recent</h2>
        <TaskList tasks={recentTasks} editable onStatusChange={handleStatus} />
      </section>
    </div>
  );
}
