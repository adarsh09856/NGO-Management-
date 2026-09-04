import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter your email and password');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password, 'user');
      success(`Welcome back, ${user.fullName}!`);

      if (['super_admin', 'accountant', 'staff', 'hr_manager'].includes(user.role?.slug)) {
        navigate('/admin');
      } else if (user.role?.slug === 'student_monk') {
        navigate('/student');
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
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Crest */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-[#0F172A] border-2 border-[#D4AF37] flex items-center justify-center mx-auto shadow-md">
            <span className="text-[#D4AF37] text-2xl font-serif font-bold">☸</span>
          </div>
          <h1 className="font-serif-brand font-extrabold text-2xl text-[#0F172A] tracking-wider uppercase">
            DRODUL PHENDEY LING
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Devotee & Member Portal Login
          </p>
        </div>

        {/* Login Form Card */}
        <div className="monastery-card p-6 sm:p-8 space-y-6 shadow-md">
          <div className="space-y-1">
            <h2 className="font-serif-brand font-bold text-base text-[#0F172A]">
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
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#E11D48] bg-[#FAF9F5]"
                  placeholder="Enter your registered email"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-gray-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[11px] text-[#E11D48] hover:underline">
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
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#E11D48] bg-[#FAF9F5]"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E11D48] hover:bg-[#1E293B] text-white py-2.5 rounded font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow transition-all"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to User Panel'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2 px-1">
          <p>
            New devotee?{' '}
            <Link to="/register" className="text-[#E11D48] font-bold hover:underline">
              Create an Account
            </Link>
          </p>
          <Link to="/admin/login" className="text-gray-400 hover:text-[#0F172A] font-medium">
            Staff / Admin Login →
          </Link>
        </div>
      </div>
    </div>
  );
}
