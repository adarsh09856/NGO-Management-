import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, Heart, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialPortal = searchParams.get('portal') === 'admin' ? 'admin' : 'user';
  const [portalTab, setPortalTab] = useState(initialPortal); // 'user', 'admin'
  const [email, setEmail] = useState(initialPortal === 'admin' ? 'admin@drodulphendeyling.org' : 'tashi.phuntsho@email.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (tab) => {
    setPortalTab(tab);
    if (tab === 'admin') {
      setEmail('admin@drodulphendeyling.org');
    } else {
      setEmail('tashi.phuntsho@email.com');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const user = await login(email, password, portalTab);
      success(`Welcome back, ${user.fullName}!`);

      if (user.role?.slug === 'super_admin' || user.role?.slug === 'accountant' || user.role?.slug === 'staff' || user.role?.slug === 'hr_manager') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } catch (err) {
      error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FDFBF7]">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Crest */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-[#4A0E17] border-2 border-[#D4AF37] flex items-center justify-center mx-auto shadow-md">
            <span className="text-[#D4AF37] text-2xl font-serif font-bold">☸</span>
          </div>
          <h2 className="font-serif-brand font-extrabold text-2xl text-[#4A0E17] tracking-wider uppercase">
            DRODUL PHENDEY LING
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Portal Type Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-[#F8F6F0] p-1.5 rounded-xl border border-[#EBE5D8]">
          <button
            type="button"
            onClick={() => handleTabChange('user')}
            className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              portalTab === 'user'
                ? 'bg-[#4A0E17] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>User / Member</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              portalTab === 'admin'
                ? 'bg-[#4A0E17] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Admin / Staff</span>
          </button>
        </div>

        {/* Login Form Card */}
        <div className="monastery-card p-6 sm:p-8 space-y-6 shadow-md">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7E1929] bg-[#FAF9F5]"
                  placeholder="name@drodulphendeyling.org"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-gray-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[11px] text-[#7E1929] hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7E1929] bg-[#FAF9F5]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7E1929] hover:bg-[#5A121E] text-white py-2.5 rounded font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow transition-all"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center">
              1-Click Demo Accounts (Password: password123)
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => { setPortalTab('admin'); setEmail('admin@drodulphendeyling.org'); }}
                className="p-1.5 rounded bg-gray-50 hover:bg-[#FDF6E2] text-left border border-gray-200"
              >
                <p className="font-bold text-[#4A0E17]">Super Admin</p>
                <p className="text-[9px] text-gray-500">Full System Control</p>
              </button>

              <button
                type="button"
                onClick={() => { setPortalTab('admin'); setEmail('accountant@drodulphendeyling.org'); }}
                className="p-1.5 rounded bg-gray-50 hover:bg-[#FDF6E2] text-left border border-gray-200"
              >
                <p className="font-bold text-[#4A0E17]">Accountant</p>
                <p className="text-[9px] text-gray-500">Finance & Payroll</p>
              </button>

              <button
                type="button"
                onClick={() => { setPortalTab('admin'); setEmail('staff@drodulphendeyling.org'); }}
                className="p-1.5 rounded bg-gray-50 hover:bg-[#FDF6E2] text-left border border-gray-200"
              >
                <p className="font-bold text-[#4A0E17]">Staff Coordinator</p>
                <p className="text-[9px] text-gray-500">Operations & CMS</p>
              </button>

              <button
                type="button"
                onClick={() => { setPortalTab('user'); setEmail('tashi.phuntsho@email.com'); }}
                className="p-1.5 rounded bg-gray-50 hover:bg-[#FDF6E2] text-left border border-gray-200"
              >
                <p className="font-bold text-[#4A0E17]">Devotee Member</p>
                <p className="text-[9px] text-gray-500">Donations & 80G Receipts</p>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500">
          Want to become a devotee member?{' '}
          <Link to="/register" className="text-[#7E1929] font-bold hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
