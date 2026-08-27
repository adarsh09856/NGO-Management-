import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Mail, HelpCircle, Calendar, Menu, LogOut, User, FileText, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AdminTopbar({ onToggleSidebar, title = 'Dashboard', breadcrumbs = [] }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const searchRef = useRef(null);

  // Live Search Query
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.data.success) {
          setSearchResults(res.data.data);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-[#EBE5D8] px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between shadow-sm gap-2">
      {/* Left: Hamburger & Breadcrumbs */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded-md text-gray-700 hover:bg-gray-100 border border-gray-200"
          aria-label="Open Sidebar Menu"
        >
          <Menu className="w-5 h-5 text-[#4A0E17]" />
        </button>

        {/* Breadcrumb Path */}
        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-gray-500 font-medium truncate max-w-[200px] md:max-w-none">
          <Link to="/admin" className="hover:text-[#4A0E17]">Dashboard</Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              {crumb.link ? (
                <Link to={crumb.link} className="hover:text-[#4A0E17] truncate">{crumb.label}</Link>
              ) : (
                <span className="text-[#4A0E17] font-semibold truncate">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Center: Live Global Search */}
      <div ref={searchRef} className="relative flex-1 max-w-md mx-2 hidden sm:block">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search donors, students, receipts, items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearchDropdown(true)}
            className="w-full text-xs pl-9 pr-4 py-1.5 sm:py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#4A0E17] bg-[#FDFBF7]"
          />
        </div>

        {/* Live Search Results Dropdown */}
        {showSearchDropdown && searchResults && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-lg shadow-xl border border-[#EBE5D8] max-h-80 overflow-y-auto z-50 p-2 animate-fadeIn text-xs">
            {searchLoading ? (
              <p className="text-gray-400 text-center py-3">Searching database...</p>
            ) : (
              <div>
                {/* Donors */}
                {searchResults.donors?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] font-bold text-[#4A0E17] uppercase tracking-wider px-2 py-1 bg-gray-50 rounded">Donors</p>
                    {searchResults.donors.map(d => (
                      <Link
                        key={d.id}
                        to={d.link}
                        onClick={() => setShowSearchDropdown(false)}
                        className="block px-2 py-1.5 hover:bg-[#FDF6E2] rounded flex justify-between items-center"
                      >
                        <span className="font-semibold text-gray-800">{d.title}</span>
                        <span className="text-[10px] text-gray-500">{d.subtitle}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Students */}
                {searchResults.students?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] font-bold text-[#4A0E17] uppercase tracking-wider px-2 py-1 bg-gray-50 rounded">Monks & Students</p>
                    {searchResults.students.map(s => (
                      <Link
                        key={s.id}
                        to={s.link}
                        onClick={() => setShowSearchDropdown(false)}
                        className="block px-2 py-1.5 hover:bg-[#FDF6E2] rounded flex justify-between items-center"
                      >
                        <span className="font-semibold text-gray-800">{s.title}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{s.subtitle}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Receipts */}
                {searchResults.receipts?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] font-bold text-[#4A0E17] uppercase tracking-wider px-2 py-1 bg-gray-50 rounded">Money Receipts</p>
                    {searchResults.receipts.map(r => (
                      <Link
                        key={r.id}
                        to={r.link}
                        onClick={() => setShowSearchDropdown(false)}
                        className="block px-2 py-1.5 hover:bg-[#FDF6E2] rounded flex justify-between items-center"
                      >
                        <span className="font-semibold text-emerald-700 font-mono">{r.title}</span>
                        <span className="text-[10px] text-gray-500">{r.subtitle}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Store Items */}
                {searchResults.items?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] font-bold text-[#4A0E17] uppercase tracking-wider px-2 py-1 bg-gray-50 rounded">Store Inventory</p>
                    {searchResults.items.map(i => (
                      <Link
                        key={i.id}
                        to={i.link}
                        onClick={() => setShowSearchDropdown(false)}
                        className="block px-2 py-1.5 hover:bg-[#FDF6E2] rounded flex justify-between items-center"
                      >
                        <span className="font-semibold text-gray-800">{i.title}</span>
                        <span className="text-[10px] text-gray-500">{i.subtitle}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* No results */}
                {searchResults.donors?.length === 0 && searchResults.students?.length === 0 && searchResults.receipts?.length === 0 && (
                  <p className="text-gray-400 text-center py-3">No matching records found.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Search Toggle (Mobile), Notifications, Messages, Date, Profile */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          className="sm:hidden p-1.5 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
          aria-label="Toggle Search"
        >
          {mobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#7E1929] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
              8
            </span>
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 max-w-[90vw] bg-white rounded-lg shadow-xl border border-[#EBE5D8] py-2 z-50 text-xs animate-fadeIn">
              <div className="px-3 py-1.5 border-b border-gray-100 font-bold text-gray-800 flex justify-between items-center">
                <span>Notifications</span>
                <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">8 Unread</span>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                <div className="p-2.5 hover:bg-gray-50">
                  <p className="font-semibold text-gray-800">New Donation Received</p>
                  <p className="text-[11px] text-gray-500">Tashi Phuntsho donated ₹25,000 via Razorpay</p>
                  <span className="text-[9px] text-gray-400">10 mins ago</span>
                </div>
                <div className="p-2.5 hover:bg-gray-50">
                  <p className="font-semibold text-gray-800">Low Stock Alert</p>
                  <p className="text-[11px] text-gray-500">Butter Lamp (Small) stock is at 18 (Min: 50)</p>
                  <span className="text-[9px] text-gray-400">1 hour ago</span>
                </div>
                <div className="p-2.5 hover:bg-gray-50">
                  <p className="font-semibold text-gray-800">Leave Request</p>
                  <p className="text-[11px] text-gray-500">Lopen Karma Samten requested 3-day monastic retreat leave</p>
                  <span className="text-[9px] text-gray-400">2 hours ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Icon */}
        <div className="relative">
          <Link
            to="/admin/crm"
            className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 relative block"
            aria-label="Messages"
          >
            <Mail className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#7E1929] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
              4
            </span>
          </Link>
        </div>

        {/* Date Display (Hidden on phone) */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#FDFBF7] border border-[#EBE5D8] rounded text-xs text-gray-700 font-medium">
          <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{currentDate}</span>
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center space-x-2 pl-1.5 sm:pl-2 border-l border-gray-200 hover:opacity-90"
            aria-label="User Menu"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#4A0E17] border border-[#D4AF37] flex items-center justify-center text-xs font-bold text-[#D4AF37] flex-shrink-0">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-gray-800 leading-tight truncate max-w-[120px]">{user?.fullName || 'Admin User'}</p>
              <p className="text-[10px] text-gray-500 truncate max-w-[120px]">{user?.role?.name || 'Super Administrator'}</p>
            </div>
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-[#EBE5D8] py-1.5 z-50 text-xs animate-fadeIn">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="font-bold text-gray-800 truncate">{user?.fullName}</p>
                <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
              </div>
              <Link to="/admin/settings" onClick={() => setUserDropdownOpen(false)} className="block px-3 py-1.5 hover:bg-gray-50 text-gray-700">
                System Settings
              </Link>
              <Link to="/" onClick={() => setUserDropdownOpen(false)} className="block px-3 py-1.5 hover:bg-gray-50 text-gray-700">
                View Public Website
              </Link>
              <button
                type="button"
                onClick={() => { logout(); setUserDropdownOpen(false); }}
                className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 font-medium flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Overlay Bar */}
      {mobileSearchOpen && (
        <div className="sm:hidden absolute top-full left-0 right-0 bg-white border-b border-[#EBE5D8] p-3 shadow-md z-30">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search database..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-8 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-[#FDFBF7]"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
