import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminLogin() {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter your official administrator email and password');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password, 'admin');
      success(`Welcome back, ${user.fullName}!`);
      navigate('/admin');
    } catch (err) {
      error(err.message || 'Administrative login failed. Access restricted to authorized personnel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#070A12] via-[#0B0F19] to-[#120205] text-white">
      <div className="max-w-md w-full space-y-6">
        {/* Top Back Link */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-xs text-gray-400 hover:text-[#D4AF37] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Website</span>
          </Link>
        </div>

        {/* Brand Crest Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-[#0F172A] border-2 border-[#D4AF37] flex items-center justify-center mx-auto shadow-2xl">
            <span className="text-[#D4AF37] text-3xl font-serif font-bold">☸</span>
          </div>
          <h1 className="font-serif-brand font-extrabold text-2xl text-white tracking-wider uppercase">
            DRODUL PHENDEY LING
          </h1>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#0F172A]/80 border border-[#D4AF37]/40 text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Administrative & Staff Portal</span>
          </div>
          <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
            Authorized access only for Super Admin, Accountants, and Staff Coordinators. Logins are issued by the Super Administrator.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0B0F19]/90 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-[#D4AF37]/30 shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Admin / Staff Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#070A12] border border-[#1E293B] text-white rounded focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  placeholder="Enter official email"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#070A12] border border-[#1E293B] text-white rounded focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E11D48] hover:bg-[#BE123C] text-white py-2.5 rounded font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-lg border border-[#D4AF37]/40 transition-all"
            >
              <span>{loading ? 'Verifying Credentials...' : 'Access Admin Shell'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500">
          Not administrative staff?{' '}
          <Link to="/login" className="text-[#D4AF37] font-bold hover:underline">
            Go to Devotee Member Login
          </Link>
        </p>
      </div>
    </div>
  );
}
