import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';
import {
  LayoutDashboard,
  AlertTriangle,
  Map as MapIcon,
  TrendingUp,
  CalendarCheck,
  Hammer,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export const ApplicationSidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { currentUser, addToast } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Section 8: Sidebar contains ONLY these items
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Road Reports', path: '/reports', icon: AlertTriangle },
    { name: 'Road Map', path: '/map', icon: MapIcon },
    { name: 'AI Recommendations', path: '/predictions', icon: TrendingUp },
    { name: 'Inspections', path: '/inspections', icon: CalendarCheck },
    { name: 'Maintenance', path: '/maintenance', icon: Hammer },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await apiService.logout();
      addToast('info', 'Signed Out', 'Municipal Authority session ended.');
    } catch {
      // ignore
    }
    navigate('/login');
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-[#140E22] text-[#F5F3FF] transition-all duration-300 border-r border-[#3B2D53] shadow-lg ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#3B2D53] bg-[#140E22]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-[#8B5CF6] flex items-center justify-center shrink-0 text-white shadow-xs">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19L12 3l8 16" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm tracking-tight text-[#F5F3FF] leading-tight">
                RoadWatch
              </span>
              <span className="text-[10px] text-[#A78BFA] font-semibold tracking-wide truncate">
                Municipal Authority Admin
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-[#B9AECF] hover:text-[#F5F3FF] hover:bg-[#211735] transition shrink-0"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.name : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition group relative ${
                isActive
                  ? 'bg-[#8B5CF6] text-white shadow-xs'
                  : 'text-[#B9AECF] hover:text-[#F5F3FF] hover:bg-[#211735]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#B9AECF] group-hover:text-[#A78BFA]'}`} />
              {!collapsed && <span className="truncate">{item.name}</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 z-50 hidden group-hover:block whitespace-nowrap rounded bg-[#211735] border border-[#3B2D53] px-2.5 py-1 text-xs text-[#F5F3FF] shadow-xl">
                  {item.name}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Public Citizen Reporting Button (Prompt Section 4 & 8) */}
      <div className="p-3 border-t border-[#3B2D53] bg-[#140E22]">
        {!collapsed ? (
          <NavLink
            to="/report"
            className="flex items-center justify-between p-2.5 rounded-xl bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 border border-[#8B5CF6]/40 text-[#F5F3FF] transition group"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#A78BFA]" />
              <div className="text-left">
                <span className="block text-xs font-semibold">Citizen Reporting</span>
                <span className="text-[10px] text-[#A78BFA]">Public Portal (No Login)</span>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-[#B9AECF] group-hover:text-white" />
          </NavLink>
        ) : (
          <NavLink
            to="/report"
            title="Public Citizen Reporting Portal"
            className="flex items-center justify-center p-2.5 rounded-xl bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 text-[#A78BFA] transition"
          >
            <ShieldAlert className="w-4 h-4" />
          </NavLink>
        )}
      </div>

      {/* User Footer & Logout (Item 9: Logout) */}
      <div className="p-3 border-t border-[#3B2D53] bg-[#100B1D]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {currentUser?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'MA'}
          </div>
          {!collapsed && (
            <div className="flex-1 truncate">
              <div className="text-xs font-semibold text-[#F5F3FF] truncate leading-tight">
                {currentUser?.name || 'Municipal Admin'}
              </div>
              <div className="text-[10px] text-[#A78BFA] font-medium truncate">
                Municipal Authority Admin
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="p-1.5 text-[#B9AECF] hover:text-[#FB7185] rounded-lg hover:bg-[#211735] transition shrink-0"
            title="Logout of Municipal Authority Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
