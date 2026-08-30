import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, Users, GraduationCap, FileText, Wallet, ArrowUpRight, ArrowDownRight,
  PlusCircle, UserPlus, Receipt, UserCheck, CalendarCheck, PackagePlus,
  FolderPlus, Grid, Calendar, Clock, AlertTriangle, ArrowRight, Download,
  RefreshCw, CheckCircle2, DollarSign
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalDonationsMonth: 0,
    totalDonationsCount: 0,
    totalDonationsAllTime: 0,
    totalDonors: 0,
    totalStudentsMonks: 0,
    totalReceiptsMonth: 0,
    totalReceiptsValue: 0,
    totalCashBalance: 0,
    recentDonations: [],
    recentReceipts: [],
    lowStockItems: [],
    monthlyTrend: []
  });

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setMetrics(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-5 rounded-xl border border-[#EBE5D8] shadow-sm">
        <div>
          <h1 className="font-serif-brand font-bold text-lg sm:text-xl text-[#4A0E17] flex items-center gap-2">
            <span>Monastery & Foundation Overview</span>
            <span className="text-xs bg-[#FAF5F0] text-[#8B1E2F] px-2 py-0.5 rounded-full border border-[#D4AF37]/40 font-sans font-semibold">
              Live Database Connected
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time analytics and consolidated operational records for Gelephu headquarters.
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchDashboardMetrics}
            className="bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded text-xs font-semibold border border-gray-300 flex items-center space-x-1.5 transition-all"
            title="Refresh Live Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#8B1E2F]' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/admin/reports"
            className="bg-[#4A0E17] hover:bg-[#5A121E] text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow transition-all border border-[#D4AF37]/40"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Generate Report</span>
          </Link>
        </div>
      </div>

      {/* 1. TOP STAT CARDS (Live Data from MySQL) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Donations */}
        <div className="monastery-card p-4 flex flex-col justify-between monastery-card-hover">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-gray-500">Total Donations (This Month)</span>
            <div className="w-8 h-8 rounded-full bg-[#FDF2E9] text-[#8B1E2F] flex items-center justify-center">
              <Heart className="w-4 h-4 fill-[#8B1E2F]" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="font-serif-brand font-bold text-xl text-[#4A0E17]">
              ₹ {metrics.totalDonationsMonth.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] text-gray-500 flex items-center mt-0.5">
              <span>{metrics.totalDonationsCount} donations recorded</span>
            </p>
          </div>
        </div>

        {/* Card 2: Total Donors */}
        <div className="monastery-card p-4 flex flex-col justify-between monastery-card-hover">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-gray-500">Registered Donors</span>
            <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#7E22CE] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="font-serif-brand font-bold text-xl text-gray-900">
              {metrics.totalDonors.toLocaleString()}
            </h3>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center mt-0.5">
              <CheckCircle2 className="w-3 h-3 mr-0.5" /> Active in database
            </p>
          </div>
        </div>

        {/* Card 3: Active Students / Monks */}
        <div className="monastery-card p-4 flex flex-col justify-between monastery-card-hover">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-gray-500">Active Students/Monks</span>
            <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="font-serif-brand font-bold text-xl text-gray-900">
              {metrics.totalStudentsMonks.toLocaleString()}
            </h3>
            <p className="text-[10px] text-blue-600 font-semibold flex items-center mt-0.5">
              <span>Enrolled in Shedra</span>
            </p>
          </div>
        </div>

        {/* Card 4: Total Receipts */}
        <div className="monastery-card p-4 flex flex-col justify-between monastery-card-hover">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-gray-500">Receipts Issued (This Month)</span>
            <div className="w-8 h-8 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="font-serif-brand font-bold text-xl text-gray-900">
              {metrics.totalReceiptsMonth.toLocaleString()}
            </h3>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center mt-0.5">
              <span>₹ {metrics.totalReceiptsValue.toLocaleString('en-IN')} value</span>
            </p>
          </div>
        </div>

        {/* Card 5: Bank & Vault Cash */}
        <div className="monastery-card p-4 flex flex-col justify-between monastery-card-hover">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-gray-500">Total Liquid Reserves</span>
            <div className="w-8 h-8 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="font-serif-brand font-bold text-xl text-gray-900">
              ₹ {metrics.totalCashBalance.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] text-gray-500 flex items-center mt-0.5">
              <span>BOB, HDFC & Vault</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE SECTION: Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Donation Overview Chart */}
        <div className="lg:col-span-8 monastery-card p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">Donation Inflow Trajectory</h3>
              <p className="text-[11px] text-gray-500">Live fundraising and donor volume trends</p>
            </div>
            <span className="text-xs bg-[#F8F6F0] text-gray-700 px-2.5 py-1 rounded border border-gray-200 font-medium">
              Live Database Feed
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

        {/* Right: Recent Donations List */}
        <div className="lg:col-span-4 monastery-card p-5 space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17]">Recent Donations</h3>
            <Link to="/admin/donations" className="text-[11px] font-bold text-[#8B1E2F] hover:underline">
              View All
            </Link>
          </div>

          {metrics.recentDonations.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs">
              No recent donations recorded yet.
            </div>
          ) : (
            <div className="space-y-2.5 text-xs divide-y divide-gray-50">
              {metrics.recentDonations.map((d, i) => (
                <div key={d.id || i} className="flex justify-between items-center pt-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#FDF6E2] text-[#4A0E17] font-bold text-[10px] flex items-center justify-center border border-[#D4AF37]">
                      {d.donor_name ? d.donor_name.substring(0, 2).toUpperCase() : 'DN'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 leading-tight">{d.donor_name}</p>
                      <p className="text-[10px] text-gray-400">
                        {d.payment_date ? new Date(d.payment_date).toLocaleDateString() : 'Recent'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-700 font-mono">₹ {parseFloat(d.amount).toLocaleString('en-IN')}</p>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200">
                      {d.payment_status || 'completed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link
            to="/admin/donations/add"
            className="w-full mt-2 py-2 bg-[#FAF5F0] hover:bg-[#FDF6E2] text-[#4A0E17] font-bold text-xs rounded border border-[#D4AF37]/40 flex items-center justify-center gap-1 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#8B1E2F]" />
            <span>Record New Donation</span>
          </Link>
        </div>
      </div>

      {/* 3. SYSTEM QUICK LINKS */}
      <div className="monastery-card p-5">
        <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17] mb-3">
          Administrative Quick Actions
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
            <span className="font-semibold text-gray-800">Store Items</span>
          </Link>
          <Link to="/admin/projects" className="p-3 bg-[#FAF5F0] hover:bg-[#FDF6E2] border border-[#EBE5D8] rounded-lg flex flex-col items-center gap-1.5 transition-all group">
            <FolderPlus className="w-5 h-5 text-[#8B1E2F] group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-gray-800">Projects</span>
          </Link>
        </div>
      </div>

      {/* 4. FOURTH ROW: Inventory Low Stock Alerts & Recent Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Low Stock Alerts */}
        <div className="lg:col-span-6 monastery-card p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Real-Time Low Stock Alerts</span>
            </h3>
            <Link to="/admin/inventory" className="text-[11px] text-[#8B1E2F] font-bold hover:underline">View Store</Link>
          </div>

          {metrics.lowStockItems.length === 0 ? (
            <div className="text-center py-8 text-emerald-600 text-xs font-semibold flex flex-col items-center gap-1">
              <CheckCircle2 className="w-6 h-6" />
              <span>All store item inventory levels are optimal!</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {metrics.lowStockItems.map((item) => (
                <div key={item.id} className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg space-y-1">
                  <p className="font-bold text-xs text-gray-900 truncate">{item.item_name}</p>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-600 font-mono">Stock: <strong>{item.current_stock} {item.unit_symbol || 'units'}</strong></span>
                    <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1 rounded">
                      Min: {item.min_stock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Issued Receipts */}
        <div className="lg:col-span-6 monastery-card p-5 space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h3 className="font-serif-brand font-bold text-sm text-[#4A0E17] flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>Recent Money Receipts</span>
            </h3>
            <Link to="/admin/receipts" className="text-[11px] text-[#8B1E2F] font-bold hover:underline">
              All Receipts
            </Link>
          </div>

          {metrics.recentReceipts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              No recent receipts issued yet.
            </div>
          ) : (
            <div className="space-y-2 text-xs divide-y divide-gray-100">
              {metrics.recentReceipts.map((r) => (
                <div key={r.id} className="flex justify-between items-center pt-2">
                  <div>
                    <p className="font-bold text-gray-800">{r.recipient_name}</p>
                    <span className="text-[10px] text-gray-500 font-mono">{r.receipt_number}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#4A0E17] font-mono">₹ {parseFloat(r.amount).toLocaleString('en-IN')}</span>
                    <p className="text-[9px] text-emerald-600 font-semibold">{r.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t flex justify-between items-center">
            <span className="text-xs text-gray-500">Official 80G Tax-Deductible</span>
            <Link
              to="/admin/receipts"
              className="bg-[#4A0E17] hover:bg-[#5A121E] text-white px-3.5 py-1.5 rounded text-xs font-bold shadow"
            >
              Manage Receipts
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
