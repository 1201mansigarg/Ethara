import { useEffect, useState } from 'react';
import { api } from '../../api';
import TaskList from '../../components/TaskList';

export default function MemberTasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('');

  const load = () => {
    const q = filter ? `status=${filter}` : '';
    api.tasks(q).then((r) => setTasks(r.tasks));
  };

  useEffect(load, [filter]);

  const handleStatus = async (id, status) => {
    await api.updateTask(id, { status });
    load();
  };

  return (
    <div>
      <header className="page-header">
        <h1>My tasks</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
      </header>
      <TaskList tasks={tasks} editable onStatusChange={handleStatus} />
    </div>
  );
}
