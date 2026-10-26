import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Search,
  CheckCircle,
  AlertTriangle,
  Info,
  Calendar,
  ExternalLink,
  Check,
  ChevronDown,
  User,
  Sliders,
  LogOut,
  Route
} from 'lucide-react';

interface TopNavProps {
  collapsed: boolean;
}

export const TopNavigation: React.FC<TopNavProps> = ({ collapsed }) => {
  const {
    currentUser,
    settings,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    roads,
    reports,
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [dateRange, setDateRange] = useState('Last 30 Days');

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute breadcrumbs
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const moduleNames: Record<string, string> = {
    dashboard: 'Executive Dashboard',
    map: 'Live Road Map',
    roads: 'Road Segments',
    reports: 'Issue Reports',
    inspections: 'Inspection Management',
    maintenance: 'Maintenance Planning',
    predictions: 'Risk Predictions',
    analytics: 'Analytics & Insights',
    data: 'Data Explorer',
    team: 'Team & Resources',
    models: 'Model Monitoring',
    settings: 'System Settings',
    'data-sources': 'Data Sources',
    login: 'Sign In',
  };

  const currentModuleTitle = moduleNames[pathSegments[0]] || 'Overview';

  // Search matches across roads & reports
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return { roads: [], reports: [] };
    const q = searchQuery.toLowerCase();
    const matchedRoads = roads.filter(
      r => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.ward.toLowerCase().includes(q)
    ).slice(0, 4);
    const matchedReports = reports.filter(
      rep => rep.id.toLowerCase().includes(q) || rep.roadName.toLowerCase().includes(q) || rep.category.toLowerCase().includes(q)
    ).slice(0, 4);
    return { roads: matchedRoads, reports: matchedReports };
  }, [searchQuery, roads, reports]);

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-white border-b border-[#E2E8F0] shadow-2xs transition-all duration-300 flex items-center justify-between px-4 sm:px-6 ${
        collapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Left: Breadcrumbs & Current Module */}
      <div className="flex flex-col justify-center">
        <nav className="flex items-center space-x-1.5 text-xs text-[#64748B]" aria-label="Breadcrumb">
          <Link to="/dashboard" className="hover:text-blue-600 transition font-medium">
            RoadWatch
          </Link>
          <span>/</span>
          {pathSegments.map((seg, idx) => {
            const isLast = idx === pathSegments.length - 1;
            const title = moduleNames[seg] || seg;
            return (
              <span key={seg} className="flex items-center space-x-1.5">
                <span className={isLast ? 'text-[#172033] font-semibold' : 'text-[#64748B]'}>
                  {title}
                </span>
                {!isLast && <span>/</span>}
              </span>
            );
          })}
        </nav>
        <span className="text-sm font-bold text-[#172033] leading-none mt-0.5 hidden sm:block">
          {currentModuleTitle}
        </span>
      </div>

      {/* Center: Global Search */}
      <div ref={searchRef} className="relative hidden md:block w-72 lg:w-96">
        <div className="relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setShowSearchDropdown(true)}
            onChange={e => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            placeholder="Search road name, segment ID (e.g. RD-101), report..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          />
        </div>

        {/* Search Results Dropdown */}
        {showSearchDropdown && searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-50 p-2 text-xs">
            {searchResults.roads.length === 0 && searchResults.reports.length === 0 ? (
              <div className="p-3 text-center text-[#64748B]">No roads or reports matching "{searchQuery}"</div>
            ) : (
              <div className="space-y-2">
                {searchResults.roads.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                      Road Segments
                    </div>
                    {searchResults.roads.map(r => (
                      <div
                        key={r.id}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                          navigate(`/roads?search=${r.id}`);
                        }}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Route className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-medium text-[#172033]">{r.name}</span>
                          <span className="text-[11px] text-[#94A3B8] font-mono">({r.id})</span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-500">{r.ward}</span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.reports.length > 0 && (
                  <div className="border-t border-slate-100 pt-1.5">
                    <div className="px-2 py-1 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                      Issue Reports
                    </div>
                    {searchResults.reports.map(rep => (
                      <div
                        key={rep.id}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                          navigate(`/reports?search=${rep.id}`);
                        }}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span className="font-medium text-[#172033]">{rep.category}</span>
                          <span className="text-[11px] text-[#94A3B8] font-mono">({rep.id})</span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-500">{rep.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Date Selector */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#64748B] bg-slate-50 border border-[#E2E8F0] rounded-lg">
          <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="bg-transparent text-xs text-[#172033] focus:outline-none cursor-pointer"
          >
            <option value="Current Quarter">Current Quarter (Q4 2024)</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Year to Date">Year to Date (FY 2024)</option>
            <option value="All Historical">All Historical Observations</option>
          </select>
        </div>

        {/* Environment Pill */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Demo Mode</span>
        </div>

        {/* Notifications Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-slate-100 transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-[#E2E8F0] rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-3.5 border-b border-[#E2E8F0] bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#172033]">Notifications</h4>
                  <p className="text-[11px] text-[#64748B]">
                    {unreadNotificationCount} unread alert{unreadNotificationCount === 1 ? '' : 's'}
                  </p>
                </div>
                {unreadNotificationCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#64748B]">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.link) {
                          setShowNotifDropdown(false);
                          navigate(n.link);
                        }
                      }}
                      className={`p-3 text-xs hover:bg-slate-50 cursor-pointer flex items-start gap-2.5 transition ${
                        !n.read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="mt-0.5">
                        {n.type === 'critical' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                        {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        {n.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                        {n.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${!n.read ? 'text-[#172033]' : 'text-slate-600'}`}>
                            {n.title}
                          </span>
                          <span className="text-[10px] text-[#94A3B8]">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-[#64748B] mt-0.5">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              {currentUser?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'RW'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-50 py-1 text-xs">
              <div className="px-4 py-2.5 border-b border-[#E2E8F0]">
                <p className="font-bold text-[#172033] truncate">{currentUser?.name}</p>
                <p className="text-[11px] text-[#64748B] truncate">{currentUser?.role}</p>
              </div>
              <Link
                to="/settings"
                onClick={() => setShowUserDropdown(false)}
                className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-[#172033]"
              >
                <Sliders className="w-4 h-4 text-[#64748B]" />
                <span>System Settings</span>
              </Link>
              <Link
                to="/settings/data-sources"
                onClick={() => setShowUserDropdown(false)}
                className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-[#172033]"
              >
                <ExternalLink className="w-4 h-4 text-[#64748B]" />
                <span>Data Sources</span>
              </Link>
              <div className="border-t border-[#E2E8F0] my-1" />
              <Link
                to="/login"
                onClick={() => setShowUserDropdown(false)}
                className="flex items-center gap-2.5 px-4 py-2 hover:bg-red-50 text-red-600"
              >
                <LogOut className="w-4 h-4 text-red-600" />
                <span>Sign Out / Switch</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
