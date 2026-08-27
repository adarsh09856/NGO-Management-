import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, Heart, GraduationCap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [portalTab, setPortalTab] = useState('admin'); // 'admin', 'donor', 'student'
  const [email, setEmail] = useState('admin@drodulphendeyling.org');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (tab) => {
    setPortalTab(tab);
    if (tab === 'admin') {
      setEmail('admin@drodulphendeyling.org');
    } else if (tab === 'donor') {
      setEmail('tashi.phuntsho@email.com');
    } else if (tab === 'student') {
      setEmail('tenzin.norbu@monastery.bt');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const user = await login(email, password, portalTab);
      success(`Welcome back, ${user.fullName}!`);

      if (user.role.slug === 'donor') {
        navigate('/donor');
      } else if (user.role.slug === 'student_monk') {
        navigate('/student');
      } else {
        navigate('/admin');
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
            Authentication & Unified Multi-Portal Access
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-xl border border-[#EBE5D8] overflow-hidden">
          {/* Portal Tabs */}
          <div className="grid grid-cols-3 bg-[#F8F6F0] p-1.5 border-b border-[#EBE5D8] text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleTabChange('admin')}
              className={`py-2 px-1 rounded-md flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                portalTab === 'admin' ? 'bg-[#4A0E17] text-white shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin / Staff</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('donor')}
              className={`py-2 px-1 rounded-md flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                portalTab === 'donor' ? 'bg-[#4A0E17] text-white shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Donor</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('student')}
              className={`py-2 px-1 rounded-md flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                portalTab === 'student' ? 'bg-[#4A0E17] text-white shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Monk / LMS</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@drodulphendeyling.org"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#4A0E17]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-700">Password</label>
                <span className="text-[11px] text-gray-400 font-mono">password123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#4A0E17]"
                />
              </div>
            </div>

            {/* Quick Demo Credentials Switcher */}
            <div className="p-3 bg-[#FAF5F0] border border-[#EBE5D8] rounded-md text-[11px] space-y-1 text-gray-600">
              <span className="font-bold text-[#4A0E17]">Quick Seeded Logins (Password: password123):</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => { setPortalTab('admin'); setEmail('admin@drodulphendeyling.org'); }}
                  className="px-2 py-0.5 bg-white border rounded text-[#4A0E17] hover:bg-gray-50"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => { setPortalTab('admin'); setEmail('accountant@drodulphendeyling.org'); }}
                  className="px-2 py-0.5 bg-white border rounded text-[#4A0E17] hover:bg-gray-50"
                >
                  Accountant
                </button>
                <button
                  type="button"
                  onClick={() => { setPortalTab('donor'); setEmail('tashi.phuntsho@email.com'); }}
                  className="px-2 py-0.5 bg-white border rounded text-[#4A0E17] hover:bg-gray-50"
                >
                  Donor (Tashi)
                </button>
                <button
                  type="button"
                  onClick={() => { setPortalTab('student'); setEmail('tenzin.norbu@monastery.bt'); }}
                  className="px-2 py-0.5 bg-white border rounded text-[#4A0E17] hover:bg-gray-50"
                >
                  Monk (Tenzin)
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4A0E17] hover:bg-[#5A121E] text-white font-bold py-2.5 rounded-md text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : `Log In to ${portalTab === 'admin' ? 'Admin Portal' : portalTab === 'donor' ? 'Donor Portal' : 'Student Portal'}`}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            </button>
          </form>

          {/* Footer Register Link */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#8B1E2F] hover:underline">
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
