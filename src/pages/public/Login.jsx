import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
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
      success(`Tashi Delek! Welcome back, ${user.fullName}!`);

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
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-[#FCFBF9] relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#D4AF37]/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#4A0E17]/5 blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Brand Crest */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1A0B0E] via-[#4A0E17] to-[#1A0B0E] border-2 border-[#D4AF37] flex items-center justify-center mx-auto shadow-xl ring-4 ring-[#D4AF37]/20">
            <span className="text-[#D4AF37] text-3xl font-serif font-bold animate-spin" style={{ animationDuration: '30s' }}>☸</span>
          </div>
          <div>
            <span className="text-[10px] font-serif uppercase tracking-widest text-[#721C24] font-bold">
              ༄༅། །འབྲུག་འགྲོ་འདུལ་ཕན་བདེ་གླིང་།
            </span>
            <h1 className="font-editorial text-2xl sm:text-3xl text-[#1A0B0E] tracking-tight">
              Drodul Phendey Ling
            </h1>
            <p className="text-xs font-serif text-gray-500 mt-1">
              Devotee & Member Sanctuary Portal
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="glass-luxury-card p-8 space-y-6 shadow-2xl rounded-3xl border border-[#D4AF37]/30">
          <div className="space-y-1 text-center">
            <h2 className="font-editorial text-xl text-[#1A0B0E]">
              Sign In to Your Sanctuary
            </h2>
            <p className="text-xs text-gray-500 font-serif">
              View your merit offerings, 80G tax receipts, and dedicated prayer pujas.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-serif font-bold text-gray-700 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-[#D4AF37]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-[#FAF5F0]/60 font-serif"
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-serif font-bold text-gray-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[11px] font-serif text-[#721C24] hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-[#D4AF37]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-[#FAF5F0]/60 font-serif"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="monastic-maroon-btn w-full py-3.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-xl"
            >
              <span>{loading ? 'Verifying Credentials...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            </button>
          </form>

          <div className="pt-4 border-t border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between text-xs font-serif text-gray-500 gap-2">
            <p>
              New devotee?{' '}
              <Link to="/register" className="text-[#721C24] font-bold hover:underline">
                Create an Account
              </Link>
            </p>
            <Link to="/admin/login" className="text-gray-400 hover:text-[#1A0B0E] font-medium transition-colors">
              Staff / Admin Portal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
