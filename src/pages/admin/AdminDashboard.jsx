import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, Users, GraduationCap, FileText, Wallet, ArrowUpRight, ArrowDownRight,
  PlusCircle, UserPlus, Receipt, UserCheck, CalendarCheck, PackagePlus,
  FolderPlus, Grid, Calendar, Clock, AlertTriangle, ArrowRight, Download
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Time Series for Donation Overview Chart (Jan - Dec)
  const donationChartData = [
    { month: 'Jan', donations: 420000, donors: 180 },
    { month: 'Feb', donations: 510000, donors: 240 },
    { month: 'Mar', donations: 680000, donors: 310 },
    { month: 'Apr', donations: 590000, donors: 280 },
    { month: 'May', donations: 720000, donors: 360 },
    { month: 'Jun', donations: 640000, donors: 320 },
    { month: 'Jul', donations: 810000, donors: 420 },
    { month: 'Aug', donations: 485230, donors: 390 },
    { month: 'Sep', donations: 620000, donors: 340 },
    { month: 'Oct', donations: 740000, donors: 410 },
    { month: 'Nov', donations: 690000, donors: 380 },
    { month: 'Dec', donations: 880000, donors: 490 }
  ];

  // Financial Donut Data (Matching image 2)
  const financialDonutData = [
    { name: 'Donations', value: 485230, color: '#8B1E2F' },
    { name: 'Training Fees', value: 125000, color: '#D4AF37' },
    { name: 'Other Income', value: 75500, color: '#059669' },
    { name: 'Expenses', value: 236540, color: '#2563EB' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-[#EBE5D8] shadow-sm">
        <div>
          <h1 className="font-serif-brand font-bold text-lg sm:text-xl text-[#4A0E17]">
            Monastery & Foundation Overview
          </h1>
          <p className="text-xs text-gray-500">
            Real-time analytics and consolidated operational records for Gelephu headquarters.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/reports"
            className="bg-[#4A0E17] hover:bg-[#5A121E] text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Generate Report</span>
          </Link>
        </div>
      </div>

      {/* 1. TOP STAT CARDS (Matching image 2 exactly) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Donations */}
        <div className="monastery-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-gray-500">Total Donations (This Month)</span>
            <div className="w-8 h-8 rounded-full bg-[#FDF2E9] text-[#8B1E2F] flex items-center justify-center">
              <Heart className="w-4 h-4 fill-[#8B1E2F]" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="font-serif-brand font-bold text-xl text-[#4A0E17]">₹ 4,85,230</h3>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center mt-0.5">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> 18.6% vs last month
            </p>
          </div>
        </div>

        {/* Card 2: Total Donors */}
        <div className="monastery-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-gray-500">Total Donors</span>
            <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#7E22CE] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="font-serif-brand font-bold text-xl text-gray-900">1,248</h3>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center mt-0.5">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> 12.3% vs last month
            </p>
          </div>
        </div>

        {/* Card 3: Active Students / Monks */}
        <div className="monastery-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-gray-500">Active Students/Monks</span>
            <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="font-serif-brand font-bold text-xl text-gray-900">356</h3>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center mt-0.5">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> 7.5% vs last month
            </p>
          </div>
        </div>

        {/* Card 4: Total Receipts */}
        <div className="monastery-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-gray-500">Total Receipts (This Month)</span>
            <div className="w-8 h-8 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="font-serif-brand font-bold text-xl text-gray-900">892</h3>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center mt-0.5">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> 15.8% vs last month
            </p>
          </div>
        </div>

        {/* Card 5: Total Expenses */}
        <div className="monastery-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-gray-500">Total Expenses (This Month)</span>
            <div className="w-8 h-8 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="font-serif-brand font-bold text-xl text-gray-900">₹ 2,36,540</h3>
            <p className="text-[11px] text-red-600 font-semibold flex items-center mt-0.5">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> 5.3% vs last month
            </p>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE SECTION: Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Donation Overview Chart (Matching image 2) */}
        <div className="lg:col-span-8 monastery-card p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">Donation Overview</h3>
              <p className="text-[11px] text-gray-500">Monthly fundraising and donor volume trends</p>
            </div>
            <select className="text-xs border rounded px-2.5 py-1 bg-white text-gray-700">
              <option>This Year</option>
              <option>Previous Year</option>
            </select>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={donationChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                <Tooltip
                  formatter={(val, name) => [name === 'donations' ? `₹ ${val.toLocaleString()}` : val, name === 'donations' ? 'Donations (INR)' : 'Donors']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #EBE5D8', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="donations" name="Donations (INR)" fill="#8B1E2F" radius={[4, 4, 0, 0]} />
                <Bar dataKey="donors" name="Donors" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Recent Donations List (Matching image 2) */}
        <div className="lg:col-span-4 monastery-card p-5 space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">Recent Donations</h3>
            <Link to="/admin/donations" className="text-[11px] font-bold text-[#8B1E2F] hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-2.5 text-xs divide-y divide-gray-50">
            {[
              { name: 'Tashi Phuntsho', time: '25 Aug 2026, 10:35 AM', amount: '₹ 25,000', method: 'Online', initials: 'TP' },
              { name: 'Maria Wangmo', time: '25 Aug 2026, 09:12 AM', amount: '₹ 10,000', method: 'Online', initials: 'MW' },
              { name: 'Alan Johnson', time: '24 Aug 2026, 08:45 PM', amount: '₹ 5,500', method: 'Online', initials: 'AJ' },
              { name: 'Sonam Khandu', time: '24 Aug 2026, 06:30 PM', amount: '₹ 3,000', method: 'Bank Transfer', initials: 'SK' },
              { name: 'Ngawang Tenzin', time: '24 Aug 2026, 04:20 PM', amount: '₹ 2,100', method: 'Online', initials: 'NT' }
            ].map((d, i) => (
              <div key={i} className="flex justify-between items-center pt-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#FDF6E2] text-[#4A0E17] font-bold text-[10px] flex items-center justify-center border border-[#D4AF37]">
                    {d.initials}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 leading-tight">{d.name}</p>
                    <p className="text-[10px] text-gray-400">{d.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-700 font-mono">{d.amount}</p>
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200">
                    {d.method}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. SYSTEM QUICK LINKS (Matching image 2) */}
      <div className="monastery-card p-5">
        <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17] mb-3">
          System Quick Links
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center text-xs">
          <Link to="/admin/donations/add" className="p-3 bg-[#FAF5F0] hover:bg-[#FDF6E2] border border-[#EBE5D8] rounded-lg flex flex-col items-center gap-1.5 transition-all group">
            <Heart className="w-5 h-5 text-[#8B1E2F] group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-gray-800">Add Donation</span>
          </Link>
          <Link to="/admin/students" className="p-3 bg-[#FAF5F0] hover:bg-[#FDF6E2] border border-[#EBE5D8] rounded-lg flex flex-col items-center gap-1.5 transition-all group">
            <GraduationCap className="w-5 h-5 text-[#8B1E2F] group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-gray-800">Add Student</span>
          </Link>
          <Link to="/admin/accounts/expenses" className="p-3 bg-[#FAF5F0] hover:bg-[#FDF6E2] border border-[#EBE5D8] rounded-lg flex flex-col items-center gap-1.5 transition-all group">
            <Wallet className="w-5 h-5 text-[#8B1E2F] group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-gray-800">Add Expense</span>
          </Link>
          <Link to="/admin/receipts" className="p-3 bg-[#FAF5F0] hover:bg-[#FDF6E2] border border-[#EBE5D8] rounded-lg flex flex-col items-center gap-1.5 transition-all group">
            <Receipt className="w-5 h-5 text-[#8B1E2F] group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-gray-800">Issue Receipt</span>
          </Link>
          <Link to="/admin/hrm/employees" className="p-3 bg-[#FAF5F0] hover:bg-[#FDF6E2] border border-[#EBE5D8] rounded-lg flex flex-col items-center gap-1.5 transition-all group">
            <UserCheck className="w-5 h-5 text-[#8B1E2F] group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-gray-800">Add Employee</span>
          </Link>
          <Link to="/admin/hrm/attendance" className="p-3 bg-[#FAF5F0] hover:bg-[#FDF6E2] border border-[#EBE5D8] rounded-lg flex flex-col items-center gap-1.5 transition-all group">
            <CalendarCheck className="w-5 h-5 text-[#8B1E2F] group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-gray-800">Mark Attendance</span>
          </Link>
          <Link to="/admin/inventory" className="p-3 bg-[#FAF5F0] hover:bg-[#FDF6E2] border border-[#EBE5D8] rounded-lg flex flex-col items-center gap-1.5 transition-all group">
            <PackagePlus className="w-5 h-5 text-[#8B1E2F] group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-gray-800">Add Item</span>
          </Link>
          <Link to="/admin/projects" className="p-3 bg-[#FAF5F0] hover:bg-[#FDF6E2] border border-[#EBE5D8] rounded-lg flex flex-col items-center gap-1.5 transition-all group">
            <FolderPlus className="w-5 h-5 text-[#8B1E2F] group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-gray-800">Create Project</span>
          </Link>
        </div>
      </div>

      {/* 4. THIRD ROW: LMS Stats & Financial Donut & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Training & LMS Overview (Matching image 2) */}
        <div className="monastery-card p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">Training & LMS Overview</h3>
            <Link to="/admin/lms" className="text-[11px] text-[#8B1E2F] font-bold hover:underline">View All</Link>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs py-2 bg-gray-50 rounded-lg">
            <div>
              <p className="font-bold text-[#4A0E17] text-base">24</p>
              <p className="text-[10px] text-gray-500">Active Courses</p>
            </div>
            <div>
              <p className="font-bold text-blue-700 text-base">286</p>
              <p className="text-[10px] text-gray-500">Enrolled</p>
            </div>
            <div>
              <p className="font-bold text-emerald-700 text-base">156</p>
              <p className="text-[10px] text-gray-500">Completed</p>
            </div>
            <div>
              <p className="font-bold text-[#D4AF37] text-base">142</p>
              <p className="text-[10px] text-gray-500">Certificates</p>
            </div>
          </div>

          <div className="space-y-2 text-xs divide-y divide-gray-100">
            <div className="flex justify-between items-center pt-2">
              <div>
                <p className="font-semibold text-gray-800">Buddhist Philosophy - Level 1</p>
                <span className="text-[10px] text-gray-500">48 Students</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800">In Progress</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <div>
                <p className="font-semibold text-gray-800">Meditation & Mindfulness</p>
                <span className="text-[10px] text-gray-500">37 Students</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800">In Progress</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <div>
                <p className="font-semibold text-gray-800">Tibetan Language Basic</p>
                <span className="text-[10px] text-gray-500">29 Students</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800">In Progress</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <div>
                <p className="font-semibold text-gray-800">Buddha Dharma Studies</p>
                <span className="text-[10px] text-gray-500">62 Students</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">Completed</span>
            </div>
          </div>
        </div>

        {/* Financial Summary Donut (Matching image 2) */}
        <div className="monastery-card p-5 space-y-3">
          <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">Financial Summary (This Month)</h3>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={financialDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {financialDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `₹ ${val.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#8B1E2F]"></span> Donations</span>
              <span className="font-bold">₹ 4,85,230 (55%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#D4AF37]"></span> Training Fees</span>
              <span className="font-bold">₹ 1,25,000 (14%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#059669]"></span> Other Income</span>
              <span className="font-bold">₹ 75,500 (9%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#2563EB]"></span> Expenses</span>
              <span className="font-bold">₹ 2,36,540 (22%)</span>
            </div>
          </div>

          <div className="pt-2 border-t flex justify-between items-center">
            <span className="font-bold text-xs text-gray-700">Net Balance:</span>
            <span className="font-serif-brand font-bold text-sm text-emerald-700 font-mono">₹ 4,49,190</span>
          </div>
        </div>

        {/* Upcoming Events (Matching image 2) */}
        <div className="monastery-card p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">Upcoming Events</h3>
            <Link to="/admin/cms" className="text-[11px] text-[#8B1E2F] font-bold hover:underline">View All</Link>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg">
              <div className="text-center bg-[#4A0E17] text-white rounded p-1 min-w-[38px]">
                <span className="block font-bold text-xs leading-none">28</span>
                <span className="block text-[8px] uppercase tracking-wider text-[#D4AF37]">AUG</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">Ganachakra Prayer Ceremony</p>
                <p className="text-[10px] text-gray-500">Gelephu, Sarpang, Bhutan</p>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-purple-100 text-purple-800 rounded">Event</span>
            </div>

            <div className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg">
              <div className="text-center bg-[#4A0E17] text-white rounded p-1 min-w-[38px]">
                <span className="block font-bold text-xs leading-none">05</span>
                <span className="block text-[8px] uppercase tracking-wider text-[#D4AF37]">SEP</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">New Moon Prayer</p>
                <p className="text-[10px] text-gray-500">Drodul Phendey Ling</p>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-purple-100 text-purple-800 rounded">Event</span>
            </div>

            <div className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg">
              <div className="text-center bg-[#4A0E17] text-white rounded p-1 min-w-[38px]">
                <span className="block font-bold text-xs leading-none">12</span>
                <span className="block text-[8px] uppercase tracking-wider text-[#D4AF37]">SEP</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">Teaching by Khenpo Rinpoche</p>
                <p className="text-[10px] text-gray-500">Shedra Assembly Hall</p>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-800 rounded">Teaching</span>
            </div>

            <div className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg">
              <div className="text-center bg-[#4A0E17] text-white rounded p-1 min-w-[38px]">
                <span className="block font-bold text-xs leading-none">20</span>
                <span className="block text-[8px] uppercase tracking-wider text-[#D4AF37]">SEP</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">Buddha Dharma Class</p>
                <p className="text-[10px] text-gray-500">Online (Zoom)</p>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-blue-100 text-blue-800 rounded">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. FOURTH ROW: Inventory Low Stock Alerts & HR & Payroll Summary (Matching image 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Low Stock Alerts */}
        <div className="lg:col-span-8 monastery-card p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Inventory Low Stock Alerts</span>
            </h3>
            <Link to="/admin/inventory" className="text-[11px] text-[#8B1E2F] font-bold hover:underline">View All</Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg space-y-1">
              <p className="font-bold text-xs text-gray-900">Butter Lamp (Small)</p>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-gray-600 font-mono">Stock: <strong>18</strong></span>
                <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1 rounded">Low Stock</span>
              </div>
            </div>
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg space-y-1">
              <p className="font-bold text-xs text-gray-900">Torma Flour</p>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-gray-600 font-mono">Stock: <strong>12</strong></span>
                <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1 rounded">Low Stock</span>
              </div>
            </div>
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg space-y-1">
              <p className="font-bold text-xs text-gray-900">Incense (Tibetan)</p>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-gray-600 font-mono">Stock: <strong>25</strong></span>
                <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1 rounded">Low Stock</span>
              </div>
            </div>
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg space-y-1">
              <p className="font-bold text-xs text-gray-900">Maroon Robe</p>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-gray-600 font-mono">Stock: <strong>7</strong></span>
                <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1 rounded">Low Stock</span>
              </div>
            </div>
          </div>
        </div>

        {/* HR & Payroll Summary */}
        <div className="lg:col-span-4 monastery-card p-5 space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">HR & Payroll Summary</h3>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs bg-gray-50 p-2.5 rounded-lg">
            <div>
              <p className="text-[10px] text-gray-500">Total Staff</p>
              <p className="font-bold text-gray-900 text-base">24</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Active</p>
              <p className="font-bold text-emerald-700 text-base">18</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Casual</p>
              <p className="font-bold text-gray-900 text-base">36</p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div>
              <span className="text-[10px] text-gray-500 block">Payroll (This Month)</span>
              <span className="font-serif-brand font-bold text-base text-[#4A0E17] font-mono">₹ 1,78,600</span>
            </div>
            <Link
              to="/admin/payroll"
              className="bg-[#4A0E17] hover:bg-[#5A121E] text-white px-3.5 py-1.5 rounded text-xs font-bold shadow"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
