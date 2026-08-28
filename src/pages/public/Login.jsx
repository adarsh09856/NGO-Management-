import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Heart, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('tashi.phuntsho@email.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const user = await login(email, password, 'user');
      success(`Welcome back, ${user.fullName}!`);

      if (['super_admin', 'accountant', 'staff', 'hr_manager'].includes(user.role?.slug)) {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } catch (err) {
      error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FDFBF7]">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Crest */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-[#4A0E17] border-2 border-[#D4AF37] flex items-center justify-center mx-auto shadow-md">
            <span className="text-[#D4AF37] text-2xl font-serif font-bold">☸</span>
          </div>
          <h1 className="font-serif-brand font-extrabold text-2xl text-[#4A0E17] tracking-wider uppercase">
            DRODUL PHENDEY LING
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Devotee & Member Portal Login
          </p>
        </div>

        {/* Login Form Card */}
        <div className="monastery-card p-6 sm:p-8 space-y-6 shadow-md">
          <div className="space-y-1">
            <h2 className="font-serif-brand font-bold text-base text-[#4A0E17]">
              Sign In to Your User Panel
            </h2>
            <p className="text-xs text-gray-500">
              Access your donation history, 80G tax receipts, and prayer requests.
            </p>
          </div>

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
                  placeholder="devotee@email.com"
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
              <span>{loading ? 'Authenticating...' : 'Sign In to User Panel'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Login */}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center">
              Demo Devotee Login (Password: password123)
            </p>
            <button
              type="button"
              onClick={() => setEmail('tashi.phuntsho@email.com')}
              className="w-full p-2 rounded bg-[#FAF9F5] hover:bg-[#FDF6E2] text-left border border-gray-200 flex items-center justify-between"
            >
              <div>
                <p className="font-bold text-xs text-[#4A0E17]">Tashi Phuntsho (Devotee Donor)</p>
                <p className="text-[10px] text-gray-500">tashi.phuntsho@email.com</p>
              </div>
              <UserCheck className="w-4 h-4 text-[#D4AF37]" />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2 px-1">
          <p>
            New devotee?{' '}
            <Link to="/register" className="text-[#7E1929] font-bold hover:underline">
              Create an Account
            </Link>
          </p>
          <Link to="/admin/login" className="text-gray-400 hover:text-[#4A0E17] font-medium">
            Staff / Admin Login →
          </Link>
        </div>
      </div>
    </div>
  );
}
