import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth state from localStorage and verify with backend
  useEffect(() => {
    async function verifyAuth() {
      const storedToken = localStorage.getItem('dpl_token');
      const storedUser = localStorage.getItem('dpl_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('dpl_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('[Auth] Stored session expired or invalid');
          localStorage.removeItem('dpl_token');
          localStorage.removeItem('dpl_user');
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
      const { token, user: userData } = res.data;
      localStorage.setItem('dpl_token', token);
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
