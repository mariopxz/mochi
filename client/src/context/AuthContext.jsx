import { useState, useEffect } from "react";
import { AuthContext } from './authContext';

export { AuthContext } from './authContext';

export function AuthProvider ({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la app comprueba si hay sesión guardada
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('mochi_token');
      const savedUser = localStorage.getItem('mochi_user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (token, username) => {
    setToken(token);
    setUser({ username });
    localStorage.setItem('mochi_token', token);
    localStorage.setItem('mochi_user', JSON.stringify({ username }));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('mochi_token');
    localStorage.removeItem('mochi_user');
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
