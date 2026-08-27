import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function AdminLayout({ breadcrumbs }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Wrap */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Topbar */}
        <AdminTopbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          breadcrumbs={breadcrumbs || []}
        />

        {/* Page View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        {/* Admin Footer (Matching screenshot) */}
        <footer className="px-6 py-4 bg-white border-t border-[#EBE5D8] text-[11px] text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            © 2026 Drodul Phendey Ling Foundation. All Rights Reserved.
          </div>
          <div>
            Designed & Developed by <span className="font-medium text-[#4A0E17]">Netlink Group, Kolkata, India</span> &nbsp;·&nbsp; v1.0.0
          </div>
        </footer>
      </div>
    </div>
  );
}
