import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  GraduationCap, BookOpen, Award, User, LogOut, 
  ArrowLeft, CheckCircle2, Flame, Calendar, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/student', label: 'Monastic Overview', icon: GraduationCap, exact: true },
    { to: '/student/courses', label: 'My Courses & Shedra Curriculum', icon: BookOpen },
    { to: '/student/certificates', label: 'Conferred Certificates', icon: Award }
  ];

  const isLinkActive = (to, exact) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-white flex flex-col selection:bg-[#D4AF37] selection:text-[#070A12]">
      {/* Top Academic Header */}
      <header className="bg-[#090D16] border-b border-[#2A1E17] sticky top-0 z-40 shadow-2xl backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand & Back to Web */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              <Link 
                to="/" 
                className="flex items-center space-x-1.5 text-xs font-semibold text-[#94A3B8] hover:text-[#D4AF37] transition-colors"
                title="Return to Public Monastery Homepage"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Public Website</span>
              </Link>

              <span className="text-white/20 hidden sm:inline">|</span>

              <Link to="/student" className="flex items-center space-x-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-[#D4AF37]/50 flex items-center justify-center shadow-lg group-hover:border-[#D4AF37] transition-all">
                  <span className="text-[#D4AF37] text-lg font-serif font-bold group-hover:rotate-45 transition-transform">☸</span>
                </div>
                <div>
                  <div className="font-serif-brand font-bold text-sm tracking-wide text-white group-hover:text-[#D4AF37] transition-colors leading-tight">
                    SHEDRA MONASTIC ACADEMY
                  </div>
                  <div className="text-[10px] text-[#E11D48] font-bold tracking-wider uppercase">
                    Ordained Scholar Portal
                  </div>
                </div>
              </Link>
            </div>

            {/* Right: Scholar Identity & Controls */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
                  <span>{user?.fullName || 'Novice Scholar'}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                    Shedra Scholar
                  </span>
                </div>
                <div className="text-[10px] text-[#94A3B8] font-mono">{user?.email}</div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-[#CBD5E1] hover:text-red-400 text-xs font-bold flex items-center gap-1.5 border border-white/10 hover:border-red-500/30 transition-all shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit Portal</span>
              </button>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-4 border-t border-white/5 py-2 overflow-x-auto scrollbar-none">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.to, item.exact);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
                    active
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-[#090D16] shadow-md'
                      : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Student Portal Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#090D16] border-t border-[#2A1E17] py-4 px-6 text-center text-xs text-[#94A3B8]">
        <p>
          ☸ Shedra Monastic College of Buddhist Higher Studies • Drodul Phendey Ling Monastery, Gelephu, Bhutan.
        </p>
      </footer>
    </div>
  );
}
