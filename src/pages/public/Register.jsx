import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Heart, GraduationCap, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Register() {
  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState('donor'); // 'donor', 'student'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [monasticName, setMonasticName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await register({
        accountType,
        fullName,
        email,
        password,
        phone,
        monasticName
      });
      success('Account registered successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-[#FCFBF9] relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#D4AF37]/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#4A0E17]/5 blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1A0B0E] via-[#4A0E17] to-[#1A0B0E] border-2 border-[#D4AF37] flex items-center justify-center mx-auto shadow-xl ring-4 ring-[#D4AF37]/20">
            <span className="text-[#D4AF37] text-3xl font-serif font-bold">☸</span>
          </div>
          <div>
            <span className="text-[10px] font-serif uppercase tracking-widest text-[#721C24] font-bold">
              ༄༅། །འབྲུག་འགྲོ་འདུལ་ཕན་བདེ་གླིང་།
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#1A0B0E] tracking-tight">
              Create Devotee Account
            </h2>
            <p className="text-xs font-serif text-gray-500 mt-1">
              Join Drodul Phendey Ling as a Devotee Donor or Monastic Scholar
            </p>
          </div>
        </div>

        <div className="glass-luxury-card rounded-3xl shadow-2xl border border-[#D4AF37]/30 overflow-hidden">
          {/* Account Type Selector */}
          <div className="grid grid-cols-2 bg-[#FAF5F0] p-1.5 border-b border-[#D4AF37]/20 text-xs font-serif font-bold">
            <button
              type="button"
              onClick={() => setAccountType('donor')}
              className={`py-2.5 px-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
                accountType === 'donor'
                  ? 'bg-gradient-to-r from-[#4A0E17] to-[#721C24] text-[#D4AF37] shadow-md'
                  : 'text-gray-600 hover:text-[#4A0E17]'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Devotee Donor</span>
            </button>
            <button
              type="button"
              onClick={() => setAccountType('student')}
              className={`py-2.5 px-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
                accountType === 'student'
                  ? 'bg-gradient-to-r from-[#4A0E17] to-[#721C24] text-[#D4AF37] shadow-md'
                  : 'text-gray-600 hover:text-[#4A0E17]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Monk</span>
            </button>
          </div>

          <form onSubmit={handleRegister} className="p-6 sm:p-8 space-y-4 text-xs font-serif">
            <div>
              <label className="block font-bold text-gray-700 mb-1.5">Full Legal Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Tashi Phuntsho / Karma Yangzom"
                className="w-full px-4 py-2.5 rounded-xl border border-[#D4AF37]/30 bg-[#FAF5F0]/50 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              />
            </div>

            {accountType === 'student' && (
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">Ordination / Monastic Name</label>
                <input
                  type="text"
                  value={monasticName}
                  onChange={(e) => setMonasticName(e.target.value)}
                  placeholder="e.g. Ven. Tenzin Norbu"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D4AF37]/30 bg-[#FAF5F0]/50 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>
            )}

            <div>
              <label className="block font-bold text-gray-700 mb-1.5">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="devotee@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-[#D4AF37]/30 bg-[#FAF5F0]/50 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1.5">Phone / WhatsApp</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+975 17556559"
                className="w-full px-4 py-2.5 rounded-xl border border-[#D4AF37]/30 bg-[#FAF5F0]/50 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1.5">Set Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-[#D4AF37]/30 bg-[#FAF5F0]/50 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="monastic-maroon-btn w-full py-3.5 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl mt-4"
            >
              <span>{loading ? 'Creating Sanctuary Account...' : 'Register Account'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            </button>
          </form>

          <div className="px-6 py-4 bg-[#FAF5F0] border-t border-[#D4AF37]/20 text-center text-xs font-serif text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#721C24] hover:underline">
              Log In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
