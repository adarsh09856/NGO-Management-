import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Heart, LayoutDashboard, History, Calendar, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DonorLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Donor Dashboard', path: '/donor', icon: LayoutDashboard },
    { label: 'Donation History', path: '/donor/donations', icon: History },
    { label: 'Recurring Pledges', path: '/donor/pledges', icon: Calendar },
    { label: 'My Profile', path: '/donor/profile', icon: User }
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      {/* Header */}
      <header className="bg-[#4A0E17] text-white border-b-2 border-[#D4AF37] px-4 sm:px-8 py-3 flex justify-between items-center shadow-md">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-[#5A121E] border border-[#D4AF37] flex items-center justify-center">
            <Heart className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
          </div>
          <div>
            <h1 className="font-serif-brand font-bold text-sm sm:text-base tracking-wider">
              DONOR PORTAL · DRODUL PHENDEY LING
            </h1>
            <p className="text-[10px] text-[#D4AF37]">Tax Exemption Receipts & Giving History</p>
          </div>
        </Link>

        <div className="flex items-center space-x-4 text-xs">
          <span className="hidden sm:inline text-gray-300">Welcome, <strong>{user?.fullName}</strong></span>
          <button
            onClick={logout}
            className="flex items-center space-x-1 px-3 py-1 rounded bg-[#5A121E] hover:bg-[#7E1929] border border-[#D4AF37]/50 text-white font-semibold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Navigation Sub-bar */}
      <div className="bg-white border-b border-[#EBE5D8] px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex space-x-6 overflow-x-auto text-xs font-semibold">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`py-3.5 flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
                  active
                    ? 'border-[#4A0E17] text-[#4A0E17] font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#4A0E17]' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
