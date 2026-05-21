const labels = { todo: 'To do', in_progress: 'In progress', done: 'Done' };

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{labels[status] || status}</span>;
}
