import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ApplicationSidebar } from './ApplicationSidebar';
import { TopNavigation } from './TopNavigation';
import { ToastContainer } from '../common/ToastContainer';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#100B1D] text-[#F5F3FF] flex flex-col font-sans w-full overflow-x-hidden">
      {/* Sidebar */}
      <ApplicationSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Top Navbar */}
      <TopNavigation collapsed={collapsed} />

      {/* Main Content Area */}
      <main
        className={`flex-1 transition-all duration-300 pt-16 min-w-0 overflow-x-hidden ${
          collapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
          <Outlet />
        </div>
      </main>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};
