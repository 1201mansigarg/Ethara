import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');
    if (!token || !savedRole) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(({ user: u }) => {
        if (u.role === savedRole) setUser(u);
        else {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const { token, user: u } = await api.login(credentials);
    localStorage.setItem('token', token);
    localStorage.setItem('role', u.role);
    setUser(u);
    return u;
  };

  const register = async (data) => {
    const { token, user: u } = await api.register(data);
    localStorage.setItem('token', token);
    localStorage.setItem('role', u.role);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
