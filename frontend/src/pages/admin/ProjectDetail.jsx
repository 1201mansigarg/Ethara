import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api';
import StatusBadge from '../../components/StatusBadge';

export default function AdminProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    status: 'todo',
  });
  const [addMemberId, setAddMemberId] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const [{ project: p }, { tasks: t }] = await Promise.all([
      api.project(id),
      api.tasks(`projectId=${id}`),
    ]);
    setProject(p);
    setTasks(t);
  };

  useEffect(() => {
    load();
    api.membersList().then((r) => setAllMembers(r.members)).catch(() => {});
  }, [id]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.createTask({
        ...taskForm,
        project: id,
        assignedTo: taskForm.assignedTo || undefined,
        dueDate: taskForm.dueDate || undefined,
      });
      setTaskForm({ title: '', description: '', assignedTo: '', dueDate: '', status: 'todo' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddMember = async () => {
    if (!addMemberId) return;
    await api.addMember(id, addMemberId);
    setAddMemberId('');
    load();
  };

  const handleRemoveMember = async (memberId) => {
    await api.removeMember(id, memberId);
    load();
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete task?')) return;
    await api.deleteTask(taskId);
    load();
  };

  if (!project) return <p>Loading…</p>;

  const teamIds = new Set(project.members.map((m) => m._id));
  const availableToAdd = allMembers.filter((m) => !teamIds.has(m._id));

  return (
    <div>
      <Link to="/admin/projects" className="back-link">
        ← Projects
      </Link>
      <header className="page-header">
        <h1>{project.name}</h1>
      </header>
      <p className="lead">{project.description}</p>

      <section className="panel">
        <h2>Team</h2>
        <ul className="team-list">
          {project.members.map((m) => (
            <li key={m._id}>
              {m.name} <small>{m.email}</small>
              <button type="button" onClick={() => handleRemoveMember(m._id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        {availableToAdd.length > 0 && (
          <div className="row-actions">
            <select value={addMemberId} onChange={(e) => setAddMemberId(e.target.value)}>
              <option value="">Add member…</option>
              {availableToAdd.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
            <button type="button" onClick={handleAddMember}>
              Add
            </button>
          </div>
        )}
      </section>

      <section className="panel">
        <h2>Tasks</h2>
        <form className="inline-form" onSubmit={handleAddTask}>
          <input
            required
            placeholder="Task title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          />
          <input
            placeholder="Description"
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
          />
          <select
            value={taskForm.assignedTo}
            onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
          >
            <option value="">Unassigned</option>
            {project.members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={taskForm.dueDate}
            onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
          />
          {error && <p className="form-error">{error}</p>}
          <button type="submit">Add task</button>
        </form>

        <ul className="task-list">
          {tasks.map((t) => (
            <li key={t._id}>
              <div>
                <strong>{t.title}</strong>
                <span className="task-meta">
                  {t.assignedTo?.name || 'Unassigned'} · due{' '}
                  {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                </span>
              </div>
              <StatusBadge status={t.status} />
              <button type="button" className="btn-danger-text" onClick={() => handleDeleteTask(t._id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
