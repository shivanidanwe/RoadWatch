import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Map as MapIcon,
  Route,
  AlertTriangle,
  CalendarCheck,
  Hammer,
  TrendingUp,
  BarChart3,
  Database,
  Users,
  Cpu,
  Settings,
  Server,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export const ApplicationSidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { currentUser } = useApp();
  const location = useLocation();

  const navigationSections = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Executive Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Live Road Map', path: '/map', icon: MapIcon },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Road Segments', path: '/roads', icon: Route },
        { name: 'Issue Reports', path: '/reports', icon: AlertTriangle },
        { name: 'Inspection Management', path: '/inspections', icon: CalendarCheck },
        { name: 'Maintenance Planning', path: '/maintenance', icon: Hammer },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { name: 'Risk Predictions', path: '/predictions', icon: TrendingUp },
        { name: 'Analytics & Insights', path: '/analytics', icon: BarChart3 },
        { name: 'Data Explorer', path: '/data', icon: Database },
      ],
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { name: 'Team & Resources', path: '/team', icon: Users },
        { name: 'Data Sources', path: '/settings/data-sources', icon: Server },
        { name: 'Model Monitoring', path: '/models', icon: Cpu },
        { name: 'System Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-[#1A237E] text-white transition-all duration-300 shadow-xl ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-indigo-900/60 bg-[#161D6E]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 text-blue-400 shadow-inner">
            {/* Minimal road route symbol + pin icon */}
            <svg
              className="w-5 h-5 text-blue-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
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
              <span className="font-bold text-sm tracking-tight text-white leading-tight">
                RoadWatch
              </span>
              <span className="text-[10px] text-blue-200/80 font-medium tracking-wide truncate">
                Predictive Infrastructure
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-blue-200/70 hover:text-white hover:bg-white/10 transition shrink-0"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6 scrollbar-thin scrollbar-thumb-indigo-900">
        {navigationSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <h3 className="px-3 text-[10px] font-bold text-blue-200/60 tracking-wider uppercase">
                {section.title}
              </h3>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.name : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition group relative ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-300/80 group-hover:text-white'}`} />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                    {collapsed && (
                      <div className="absolute left-full ml-2 z-50 hidden group-hover:block whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white shadow-lg">
                        {item.name}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-indigo-900/60 bg-[#161D6E]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 ring-2 ring-blue-400/30">
            {currentUser?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'RW'}
          </div>
          {!collapsed && (
            <div className="flex-1 truncate">
              <div className="text-xs font-semibold text-white truncate leading-tight">
                {currentUser?.name || 'Administrator'}
              </div>
              <div className="text-[10px] text-blue-200/80 truncate">
                {currentUser?.role || 'Municipal Admin'}
              </div>
            </div>
          )}
          {!collapsed && (
            <NavLink
              to="/login"
              className="p-1.5 text-blue-200/70 hover:text-white rounded hover:bg-white/10 transition"
              title="Switch user or sign out"
            >
              <LogOut className="w-4 h-4" />
            </NavLink>
          )}
        </div>
      </div>
    </aside>
  );
};
