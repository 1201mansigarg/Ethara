import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', memberIds: [] });
  const [error, setError] = useState('');

  const load = () => {
    api.projects().then((r) => setProjects(r.projects));
    api.membersList().then((r) => setMembers(r.members)).catch(() => {});
  };

  useEffect(load, []);

  const toggleMember = (id) => {
    setForm((f) => ({
      ...f,
      memberIds: f.memberIds.includes(id)
        ? f.memberIds.filter((x) => x !== id)
        : [...f.memberIds, id],
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.createProject(form);
      setForm({ name: '', description: '', memberIds: [] });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    await api.deleteProject(id);
    load();
  };

  return (
    <div>
      <header className="page-header">
        <h1>Projects</h1>
        <button type="button" className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New project'}
        </button>
      </header>

      {showForm && (
        <form className="inline-form panel" onSubmit={handleCreate}>
          <label>
            Name
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Description
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          {members.length > 0 && (
            <fieldset className="member-pick">
              <legend>Add members</legend>
              {members.map((m) => (
                <label key={m._id} className="check-row">
                  <input
                    type="checkbox"
                    checked={form.memberIds.includes(m._id)}
                    onChange={() => toggleMember(m._id)}
                  />
                  {m.name} ({m.email})
                </label>
              ))}
            </fieldset>
          )}
          {error && <p className="form-error">{error}</p>}
          <button type="submit">Create project</button>
        </form>
      )}

      <div className="project-grid">
        {projects.map((p) => (
          <article key={p._id} className="project-card">
            <h3>
              <Link to={`/admin/projects/${p._id}`}>{p.name}</Link>
            </h3>
            <p>{p.description || 'No description'}</p>
            <p className="card-meta">{p.members?.length || 0} members</p>
            <button type="button" className="btn-danger-text" onClick={() => handleDelete(p._id)}>
              Delete
            </button>
          </article>
        ))}
      </div>
      {projects.length === 0 && <p className="empty-note">Create your first project above.</p>}
    </div>
  );
}
