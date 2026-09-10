import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotFound from '../../pages/public/NotFound';

/**
 * Enterprise Protected Route Guard
 * @param {string[]} allowedRoles - Roles permitted to access this route
 * @param {'admin' | 'authenticated'} zone - Security zone ('admin' yields 404 for unauthenticated scanners)
 * @param {React.ReactNode} children - Child component tree
 */
export default function ProtectedRoute({ allowedRoles = [], zone = 'authenticated', children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Prevent flashing private data while verifying session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070A14] text-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin mx-auto shadow-lg"></div>
          <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
            Verifying Sacred Credentials...
          </p>
        </div>
      </div>
    );
  }

  const roleSlug = user?.role?.slug || user?.role_slug;

  // 2. ADMIN ZONE GUARD
  if (zone === 'admin') {
    const adminRoles = allowedRoles.length > 0
      ? allowedRoles
      : ['super_admin', 'admin', 'accountant', 'hr_manager', 'staff'];

    if (!user || !roleSlug) {
      return <Navigate to="/admin/login" replace />;
    }
    if (!adminRoles.includes(roleSlug)) {
      return <NotFound />;
    }
    return children;
  }

  // 3. AUTHENTICATED MEMBER ZONE GUARD (/user/*, /student/*)
  if (zone === 'authenticated') {
    if (!user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(roleSlug) && roleSlug !== 'super_admin') {
      return <NotFound />;
    }

    return children;
  }

  return children;
}
