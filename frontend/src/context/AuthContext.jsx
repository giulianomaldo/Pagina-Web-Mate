import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminApi } from '../utils/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'admin_token';
const ADMIN_KEY = 'admin_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem(ADMIN_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!token && !!admin;

  // Si hay token guardado, verificar que sigue válido al cargar la app
  useEffect(() => {
    if (token && !admin) {
      adminApi.get('/auth/me')
        .then((data) => setAdmin(data.data?.admin ?? null))
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(ADMIN_KEY);
          setToken(null);
          setAdmin(null);
        });
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await adminApi.post('/auth/login', { email, password });
      const { accessToken, admin: adminData } = data.data;
      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(ADMIN_KEY, JSON.stringify(adminData));
      setToken(accessToken);
      setAdmin(adminData);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message || 'Credenciales incorrectas' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminApi.post('/auth/logout', {});
    } catch (_) { /* silencioso */ }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
    setToken(null);
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, admin, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
