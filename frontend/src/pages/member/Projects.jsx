import { useEffect, useState } from 'react';
import { api } from '../../api';

export default function MemberProjects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.projects().then((r) => setProjects(r.projects));
  }, []);

  return (
    <div>
      <header className="page-header">
        <h1>My projects</h1>
      </header>
      <div className="project-grid">
        {projects.map((p) => (
          <article key={p._id} className="project-card member-card">
            <h3>{p.name}</h3>
            <p>{p.description || 'No description'}</p>
            <p className="card-meta">Lead: {p.owner?.name}</p>
            <p className="card-meta">Team: {p.members?.map((m) => m.name).join(', ')}</p>
          </article>
        ))}
      </div>
      {projects.length === 0 && (
        <p className="empty-note">You are not on any projects yet. Ask your admin to add you.</p>
      )}
    </div>
  );
}
