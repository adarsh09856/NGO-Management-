import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Heart, GraduationCap, ArrowRight } from 'lucide-react';
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
      success('Account registered successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FDFBF7]">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-[#4A0E17] border-2 border-[#D4AF37] flex items-center justify-center mx-auto shadow-md">
            <span className="text-[#D4AF37] text-2xl font-serif font-bold">☸</span>
          </div>
          <h2 className="font-serif-brand font-extrabold text-2xl text-[#4A0E17] tracking-wider uppercase">
            Create Portal Account
          </h2>
          <p className="text-xs text-gray-500">
            Join Drodul Phendey Ling Foundation as a Devotee Donor or Monastic Scholar
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xl border border-[#EBE5D8] overflow-hidden">
          {/* Account Type Selector */}
          <div className="grid grid-cols-2 bg-[#F8F6F0] p-1.5 border-b border-[#EBE5D8] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAccountType('donor')}
              className={`py-2 px-1 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                accountType === 'donor' ? 'bg-[#4A0E17] text-white shadow' : 'text-gray-600'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Donor Account</span>
            </button>
            <button
              type="button"
              onClick={() => setAccountType('student')}
              className={`py-2 px-1 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                accountType === 'student' ? 'bg-[#4A0E17] text-white shadow' : 'text-gray-600'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student / Monk</span>
            </button>
          </div>

          <form onSubmit={handleRegister} className="p-6 space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Tashi Phuntsho"
                className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
              />
            </div>

            {accountType === 'student' && (
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Ordination / Monastic Name</label>
                <input
                  type="text"
                  value={monasticName}
                  onChange={(e) => setMonasticName(e.target.value)}
                  placeholder="e.g. Tenzin Norbu"
                  className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+975 17556559"
                className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Set Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4A0E17] hover:bg-[#5A121E] text-white font-bold py-3 rounded-md text-xs uppercase tracking-wider shadow mt-4 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            </button>
          </form>

          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#8B1E2F] hover:underline">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
