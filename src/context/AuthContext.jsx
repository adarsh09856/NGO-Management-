import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('dpl_user');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem('dpl_token');
    const cachedUser = localStorage.getItem('dpl_user');
    return !token && !cachedUser ? false : (!cachedUser);
  });

  // Initialize Auth state: verify token and session with backend in background
  useEffect(() => {
    async function verifyAuth() {
      const storedToken = localStorage.getItem('dpl_token');

      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('dpl_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          // Only invalidate and clear session if server explicitly rejected auth (401 / 403)
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            console.warn('[Auth] Stored session expired or invalid:', err?.message);
            localStorage.removeItem('dpl_token');
            localStorage.removeItem('dpl_refresh');
            localStorage.removeItem('dpl_user');
            setUser(null);
          }
        }
      } else {
        // Also check if an HTTP-only session cookie exists by calling /auth/me
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('dpl_user', JSON.stringify(res.data.user));
          }
        } catch (e) {
          setUser(null);
        }
      }
      setLoading(false);
    }
    verifyAuth();
  }, []);

  // Login
  const login = async (email, password, portal) => {
    const res = await api.post('/auth/login', { email, password, portal });
    if (res.data.success) {
      const { token, accessToken, refreshToken, user: userData } = res.data;
      const finalToken = accessToken || token;
      localStorage.setItem('dpl_token', finalToken);
      if (refreshToken) {
        localStorage.setItem('dpl_refresh', refreshToken);
      }
      localStorage.setItem('dpl_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  // Register
  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    return res.data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('dpl_token');
    localStorage.removeItem('dpl_refresh');
    localStorage.removeItem('dpl_user');
    setUser(null);
    window.location.href = '/login';
  };

  // Role checking helpers
  const isAdmin = user && ['super_admin', 'accountant', 'hr_manager', 'staff'].includes(user.role?.slug);
  const isDonor = user && (user.role?.slug === 'donor' || user.role?.slug === 'super_admin');
  const isStudent = user && (user.role?.slug === 'student_monk' || user.role?.slug === 'super_admin');

  const hasPermission = (moduleAction) => {
    if (!user) return false;
    if (user.role?.slug === 'super_admin') return true;
    return user.permissions && user.permissions.includes(moduleAction);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        setUser,
        isAdmin,
        isDonor,
        isStudent,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
