import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Heart, FileText, Flame, User, LogOut, ShieldCheck, Home, ArrowLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Top Bar for User Panel */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 text-xs font-semibold text-gray-500 hover:text-[#0F172A]">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Website</span>
            </Link>
            <span className="text-gray-300">|</span>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-[#0F172A] text-[#D4AF37] flex items-center justify-center font-bold text-xs">
                ☸
              </div>
              <span className="font-serif-brand font-bold text-sm text-[#0F172A]">
                User & Member Portal
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-[#0F172A]">{user?.fullName || 'Devotee Member'}</p>
              <p className="text-[10px] text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-full bg-[#FAF5F0] hover:bg-red-50 text-red-700 text-xs font-bold flex items-center gap-1 border border-red-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* User Panel Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-4 px-6 text-center text-xs text-gray-500">
        <p>© 2026 Drodul Phendey Ling Foundation. All tax exemption certificates are issued under 80G approval DPL/TAX-EXEMPT/BTN/2026/80G-092.</p>
      </footer>
    </div>
  );
}
