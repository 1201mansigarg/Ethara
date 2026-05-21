import StatusBadge from './StatusBadge';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function isOverdue(task) {
  if (!task.dueDate || task.status === 'done') return false;
  return new Date(task.dueDate) < new Date();
}

export default function TaskList({ tasks, onStatusChange, editable }) {
  if (!tasks?.length) return <p className="empty-note">No tasks yet.</p>;

  return (
    <ul className="task-list">
      {tasks.map((t) => (
        <li key={t._id} className={isOverdue(t) ? 'overdue' : ''}>
          <div className="task-main">
            <strong>{t.title}</strong>
            <span className="task-meta">
              {t.project?.name && <em>{t.project.name}</em>}
              {t.assignedTo?.name && <> · {t.assignedTo.name}</>}
              <> · due {formatDate(t.dueDate)}</>
            </span>
          </div>
          <div className="task-actions">
            {editable && onStatusChange ? (
              <select
                value={t.status}
                onChange={(e) => onStatusChange(t._id, e.target.value)}
              >
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
            ) : (
              <StatusBadge status={t.status} />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
