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
  ChevronDown,
  Sliders,
  LogOut,
  Route,
  RefreshCw
} from 'lucide-react';

interface TopNavProps {
  collapsed: boolean;
}

export const TopNavigation: React.FC<TopNavProps> = ({ collapsed }) => {
  const {
    currentUser,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    roads,
    reports,
    lastRefreshTime,
    isSyncing,
    refreshData
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

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const moduleNames: Record<string, string> = {
    dashboard: 'Dashboard',
    map: 'Road Map',
    roads: 'Roads',
    reports: 'Reports',
    inspections: 'Inspections',
    maintenance: 'Maintenance',
    predictions: 'Predictions',
    analytics: 'Analytics',
    data: 'Data Explorer',
    team: 'Team',
    models: 'Models',
    settings: 'Settings',
    'data-sources': 'Data Sources',
    login: 'Sign In',
  };

  const currentModuleTitle = moduleNames[pathSegments[0]] || 'Overview';

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
      className={`fixed top-0 right-0 z-30 h-16 bg-[#140E22] border-b border-[#3B2D53] shadow-md transition-all duration-300 flex items-center justify-between px-4 sm:px-6 ${
        collapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Left: Breadcrumbs & Current Module */}
      <div className="flex flex-col justify-center">
        <nav className="flex items-center space-x-1.5 text-xs text-[#B9AECF]" aria-label="Breadcrumb">
          <Link to="/dashboard" className="hover:text-[#F5F3FF] transition font-medium">
            RoadWatch
          </Link>
          <span>/</span>
          {pathSegments.map((seg, idx) => {
            const isLast = idx === pathSegments.length - 1;
            const title = moduleNames[seg] || seg;
            return (
              <span key={seg} className="flex items-center space-x-1.5">
                <span className={isLast ? 'text-[#F5F3FF] font-semibold' : 'text-[#B9AECF]'}>
                  {title}
                </span>
                {!isLast && <span>/</span>}
              </span>
            );
          })}
        </nav>
        <span className="text-sm font-bold text-[#F5F3FF] leading-none mt-0.5 hidden sm:block">
          {currentModuleTitle}
        </span>
      </div>

      {/* Center: Global Search */}
      <div ref={searchRef} className="relative hidden md:block w-72 lg:w-80">
        <div className="relative">
          <Search className="w-4 h-4 text-[#B9AECF] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setShowSearchDropdown(true)}
            onChange={e => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            placeholder="Search road or issue (e.g. MG Marg)..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#100B1D] text-[#F5F3FF] placeholder-[#B9AECF]/60 border border-[#3B2D53] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition"
          />
        </div>

        {/* Search Results Dropdown */}
        {showSearchDropdown && searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#211735] border border-[#3B2D53] rounded-xl shadow-2xl z-50 p-2 text-xs">
            {searchResults.roads.length === 0 && searchResults.reports.length === 0 ? (
              <div className="p-3 text-center text-[#B9AECF]">No records matching "{searchQuery}"</div>
            ) : (
              <div className="space-y-2">
                {searchResults.roads.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[10px] font-bold text-[#A78BFA] uppercase tracking-wider">
                      Road Corridors
                    </div>
                    {searchResults.roads.map(r => (
                      <div
                        key={r.id}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                          navigate(`/roads?search=${r.id}`);
                        }}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-[#2B2042] cursor-pointer flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-2">
                          <Route className="w-3.5 h-3.5 text-[#A78BFA]" />
                          <span className="font-medium text-[#F5F3FF]">{r.name}</span>
                          <span className="text-[11px] text-[#B9AECF] font-mono">({r.id})</span>
                        </div>
                        <span className="text-[11px] font-medium text-[#B9AECF]">{r.ward}</span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.reports.length > 0 && (
                  <div className="border-t border-[#3B2D53] pt-1.5">
                    <div className="px-2 py-1 text-[10px] font-bold text-[#A78BFA] uppercase tracking-wider">
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
                        className="px-2.5 py-1.5 rounded-lg hover:bg-[#2B2042] cursor-pointer flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#FBBF24]" />
                          <span className="font-medium text-[#F5F3FF]">{rep.category}</span>
                          <span className="text-[11px] text-[#B9AECF] font-mono">({rep.id})</span>
                        </div>
                        <span className="text-[11px] font-medium text-[#B9AECF]">{rep.status}</span>
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
        {/* Real-Time Sync Indicator & Manual Refresh Button */}
        <div className="flex items-center gap-1.5 bg-[#100B1D] border border-[#3B2D53] rounded-lg px-2.5 py-1 text-xs text-[#B9AECF]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline text-[11px]">Sync: {lastRefreshTime}</span>
          <button
            onClick={() => refreshData()}
            disabled={isSyncing}
            className="p-1 hover:text-[#F5F3FF] transition"
            title="Refresh from FastAPI backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#A78BFA]' : ''}`} />
          </button>
        </div>

        {/* Notifications Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2 rounded-lg text-[#B9AECF] hover:text-[#F5F3FF] hover:bg-[#211735] transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#8B5CF6] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#211735] border border-[#3B2D53] rounded-xl shadow-2xl z-50 overflow-hidden text-xs">
              <div className="p-3.5 border-b border-[#3B2D53] bg-[#2B2042] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#F5F3FF]">Municipal Alerts</h4>
                  <p className="text-[11px] text-[#B9AECF]">
                    {unreadNotificationCount} unread alert{unreadNotificationCount === 1 ? '' : 's'}
                  </p>
                </div>
                {unreadNotificationCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-[#A78BFA] hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#3B2D53]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#B9AECF]">No notifications</div>
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
                      className={`p-3 text-xs hover:bg-[#2B2042] cursor-pointer flex items-start gap-2.5 transition ${
                        !n.read ? 'bg-[#8B5CF6]/10' : ''
                      }`}
                    >
                      <div className="mt-0.5">
                        {n.type === 'critical' && <AlertTriangle className="w-4 h-4 text-[#FB7185]" />}
                        {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-[#FBBF24]" />}
                        {n.type === 'success' && <CheckCircle className="w-4 h-4 text-[#34D399]" />}
                        {n.type === 'info' && <Info className="w-4 h-4 text-[#60A5FA]" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${!n.read ? 'text-[#F5F3FF]' : 'text-[#B9AECF]'}`}>
                            {n.title}
                          </span>
                          <span className="text-[10px] text-[#B9AECF]">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-[#B9AECF] mt-0.5">{n.message}</p>
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
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#211735] transition"
          >
            <div className="w-7 h-7 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {currentUser?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'RW'}
            </div>
            <span className="text-xs font-semibold text-[#F5F3FF] hidden md:block">
              {currentUser?.name?.split(' ')[0] || 'User'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#B9AECF] hidden md:block" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#211735] border border-[#3B2D53] rounded-xl shadow-2xl z-50 p-1.5 text-xs">
              <div className="p-2 border-b border-[#3B2D53]">
                <div className="font-semibold text-[#F5F3FF]">{currentUser?.name}</div>
                <div className="text-[11px] text-[#B9AECF]">{currentUser?.email}</div>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30">
                  {currentUser?.role}
                </span>
              </div>
              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#B9AECF] hover:text-[#F5F3FF] hover:bg-[#2B2042] transition"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#A78BFA]" />
                  <span>Platform Settings</span>
                </Link>
                <Link
                  to="/login"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#FB7185] hover:bg-rose-950/30 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
