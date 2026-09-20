import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import AdminErrorBoundary from '../../components/admin/AdminErrorBoundary';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Auto-generate breadcrumbs from route path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part, index) => {
    const url = '/' + pathParts.slice(0, index + 1).join('/');
    const formatted = part
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      label: formatted === 'Admin' ? 'Overview' : formatted,
      path: url,
      isLast: index === pathParts.length - 1
    };
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex selection:bg-[#D4AF37] selection:text-[#0F172A]">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Wrap */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 transition-all duration-300">
        {/* Topbar */}
        <AdminTopbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          breadcrumbs={breadcrumbs}
        />

        {/* Page View Area - protected with error boundary */}
        <main className="flex-1 p-3 sm:p-5 lg:p-7 max-w-7xl w-full mx-auto">
          <AdminErrorBoundary>
            <Outlet />
          </AdminErrorBoundary>
        </main>

        {/* Admin Footer */}
        <footer className="px-4 sm:px-7 py-3.5 bg-white border-t border-[#E2E8F0] text-[11px] text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>© 2026 Drodul Phendey Ling Foundation • Monastic & NGO Management</span>
          </div>
          <div className="text-gray-400 font-mono text-[10px]">
            Gelephu, Sarpang, Bhutan • v1.0.0
          </div>
        </footer>
      </div>
    </div>
  );
}
