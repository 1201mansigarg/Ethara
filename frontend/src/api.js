const API = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  dashboard: () => request('/dashboard'),
  projects: () => request('/projects'),
  project: (id) => request(`/projects/${id}`),
  createProject: (body) => request('/projects', { method: 'POST', body: JSON.stringify(body) }),
  updateProject: (id, body) =>
    request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  membersList: () => request('/projects/meta/members-list'),
  addMember: (projectId, memberId) =>
    request(`/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ memberId }),
    }),
  removeMember: (projectId, memberId) =>
    request(`/projects/${projectId}/members/${memberId}`, { method: 'DELETE' }),
  tasks: (params = '') => request(`/tasks${params ? `?${params}` : ''}`),
  createTask: (body) => request('/tasks', { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (id, body) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
};
