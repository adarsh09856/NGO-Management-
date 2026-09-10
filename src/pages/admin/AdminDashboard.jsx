import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, Users, GraduationCap, FileText, Wallet, ArrowUpRight, ArrowDownRight,
  PlusCircle, UserPlus, Receipt, UserCheck, CalendarCheck, PackagePlus,
  FolderPlus, Grid, Calendar, Clock, AlertTriangle, ArrowRight, Download,
  RefreshCw, CheckCircle2, DollarSign, Sparkles
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../../services/api';
import { GlassCard, GlassStatWidget, GlassBadge, GlassSkeleton } from '../../components/admin/GlassUI';

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
    <div className="space-y-6 animate-fadeIn relative z-10">
      {/* Top Banner Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-panel p-5 rounded-2xl border border-white/80 shadow-md">
        <div>
          <h1 className="font-serif-brand font-bold text-lg sm:text-xl text-[#0F172A] flex items-center gap-2">
            <span>Monastery & Foundation Overview</span>
            <span className="glow-pill-emerald text-[11px] px-2.5 py-0.5 rounded-full font-sans font-bold">
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
            className="glass-panel hover:bg-white text-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 flex items-center space-x-1.5 transition-all shadow-sm"
            title="Refresh Live Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#BE123C]' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/admin/reports"
            className="gold-gradient-btn text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-md border border-[#D4AF37]/40"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Generate Report</span>
          </Link>
        </div>
      </div>

      {/* 1. TOP STAT CARDS (Live Data from MySQL with Real SVG Sparklines) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <GlassSkeleton key={i} height="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <GlassStatWidget
            title="Donations (Month)"
            value={`₹ ${Number(metrics.totalDonationsMonth || 0).toLocaleString()}`}
            subtext={`${metrics.totalDonationsCount || 0} gifts received`}
            icon={Heart}
            color="#E11D48"
            badgeText="Live 30D"
            sparklineData={(metrics.sparkline30Days || []).map((d) => d.amount)}
          />

          <GlassStatWidget
            title="Registered Donors"
            value={metrics.totalDonors || 0}
            subtext="Sangha Patrons"
            icon={Users}
            color="#D4AF37"
            badgeText="Active"
            sparklineData={(metrics.sparkline30Days || []).map((d) => d.count)}
          />

          <GlassStatWidget
            title="Monk Scholars"
            value={metrics.totalStudentsMonks || 0}
            subtext="Shedra & Novice"
            icon={GraduationCap}
            color="#2563EB"
            badgeText="Enrolled"
          />

          <GlassStatWidget
            title="Receipts Issued"
            value={`₹ ${Number(metrics.totalReceiptsValue || 0).toLocaleString()}`}
            subtext={`${metrics.totalReceiptsMonth || 0} 80G receipts`}
            icon={Receipt}
            color="#059669"
            badgeText="Audited"
            sparklineData={(metrics.sparkline30Days || []).map((d) => d.amount)}
          />

          <GlassStatWidget
            title="Liquid Reserves"
            value={`₹ ${Number(metrics.totalCashBalance || 0).toLocaleString()}`}
            subtext="BOB + HDFC + Vault"
            icon={Wallet}
            color="#7C3AED"
            badgeText="Reconciled"
          />
        </div>
      )}

      {/* 2. CHARTS & RECENT ACTIVITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Monthly Inflow Chart */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-white/80 shadow-md flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-serif-brand font-bold text-base text-[#0F172A]">
                Monthly Financial Inflow Trends
              </h3>
              <p className="text-xs text-gray-500">Calculated live from verified donations and money receipts</p>
            </div>
            <span className="glow-pill-gold px-2.5 py-1 rounded text-[10px] font-bold">
              FY 2026-2027
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3EFE6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B5E59' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B5E59' }} />
                <Tooltip
                  formatter={(val) => [`₹ ${Number(val).toLocaleString()}`, 'Inflow Amount']}
                  contentStyle={{ backgroundColor: '#1C060C', borderColor: '#D4AF37', borderRadius: '12px', color: '#FFF' }}
                />
                <Bar dataKey="amount" fill="url(#goldGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#E11D48" stopOpacity={0.9} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 5 cols: Live Inventory Alerts & Quick Shortcuts */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Admin Actions */}
          <div className="glass-panel p-5 rounded-2xl border border-white/80 shadow-md">
            <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] mb-3">
              Quick Management Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <Link
                to="/admin/donations/new"
                className="p-2.5 rounded-xl bg-white/80 hover:bg-white border border-gray-200 text-[#0F172A] flex items-center space-x-2 transition-all hover:border-[#D4AF37] shadow-sm"
              >
                <PlusCircle className="w-4 h-4 text-[#D4AF37]" />
                <span>Add Donation</span>
              </Link>
              <Link
                to="/admin/receipts"
                className="p-2.5 rounded-xl bg-white/80 hover:bg-white border border-gray-200 text-[#0F172A] flex items-center space-x-2 transition-all hover:border-[#D4AF37] shadow-sm"
              >
                <Receipt className="w-4 h-4 text-[#D4AF37]" />
                <span>Issue Receipt</span>
              </Link>
              <Link
                to="/admin/blog"
                className="p-2.5 rounded-xl bg-white/80 hover:bg-white border border-gray-200 text-[#0F172A] flex items-center space-x-2 transition-all hover:border-[#D4AF37] shadow-sm"
              >
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                <span>Publish Article</span>
              </Link>
              <Link
                to="/admin/gallery"
                className="p-2.5 rounded-xl bg-white/80 hover:bg-white border border-gray-200 text-[#0F172A] flex items-center space-x-2 transition-all hover:border-[#D4AF37] shadow-sm"
              >
                <FolderPlus className="w-4 h-4 text-[#D4AF37]" />
                <span>Upload Media</span>
              </Link>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="glass-panel p-5 rounded-2xl border border-white/80 shadow-md">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-serif-brand font-bold text-sm text-[#0F172A] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Inventory & Store Alerts</span>
              </h3>
              <Link to="/admin/inventory" className="text-[11px] text-[#BE123C] font-bold hover:underline">
                View Store →
              </Link>
            </div>

            {metrics.lowStockItems && metrics.lowStockItems.length > 0 ? (
              <div className="space-y-2">
                {metrics.lowStockItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs">
                    <span className="font-bold text-gray-800">{item.item_name}</span>
                    <span className="text-amber-700 font-bold">{item.current_stock} {item.unit} left</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>All monastery and stupa supplies are adequately stocked.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
