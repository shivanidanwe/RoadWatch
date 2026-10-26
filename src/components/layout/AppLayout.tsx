import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ApplicationSidebar } from './ApplicationSidebar';
import { TopNavigation } from './TopNavigation';
import { ToastContainer } from '../common/ToastContainer';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#172033] flex flex-col font-sans">
      {/* Sidebar */}
      <ApplicationSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Top Navbar */}
      <TopNavigation collapsed={collapsed} />

      {/* Main Content Area */}
      <main
        className={`flex-1 transition-all duration-300 pt-16 ${
          collapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};
