import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import {
  RoadSegment,
  IssueReport,
  Inspection,
  RoadPrediction,
  MaintenancePlan,
  TeamMember,
  NotificationItem,
  SystemSettings
} from '../types';
import { apiService, DEFAULT_SETTINGS, DashboardSummary } from '../services/api';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  currentUser: TeamMember | null;
  settings: SystemSettings;
  updateSettings: (settings: SystemSettings) => void;
  resetAllData: () => void;
  seedDemoData: () => Promise<void>;
  resetToEmpty: () => Promise<void>;
  roads: RoadSegment[];
  reports: IssueReport[];
  inspections: Inspection[];
  predictions: RoadPrediction[];
  maintenancePlans: MaintenancePlan[];
  notifications: NotificationItem[];
  dashboardSummary: DashboardSummary | null;
  unreadNotificationCount: number;
  lastRefreshTime: string;
  isSyncing: boolean;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  refreshData: () => Promise<void>;
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  removeToast: (id: string) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
  createRoad: (data: Omit<RoadSegment, 'id'>) => Promise<RoadSegment>;
  updateRoad: (id: string, updates: Partial<RoadSegment>) => Promise<RoadSegment>;
  createReport: (data: {
    roadName: string;
    coordinates: [number, number];
    category: string;
    severity: string;
    description: string;
    imageUrl?: string;
    reporterName?: string;
    reporterContact?: string;
    source?: string;
    segmentId?: string;
    area?: string;
  }) => Promise<IssueReport>;
  updateReport: (id: string, updates: Partial<IssueReport>) => Promise<IssueReport>;
  verifyReport: (id: string, status: 'Verified' | 'Rejected', notes?: string, rejectionReason?: string) => Promise<any>;
  createInspection: (data: Omit<Inspection, 'id'>) => Promise<Inspection>;
  updateInspection: (id: string, updates: Partial<Inspection>) => Promise<Inspection>;
  createMaintenance: (data: Omit<MaintenancePlan, 'id'>) => Promise<MaintenancePlan>;
  updateMaintenance: (id: string, updates: Partial<MaintenancePlan>) => Promise<MaintenancePlan>;
  runPredictionSimulation: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [settings, setSettingsState] = useState<SystemSettings>(() => apiService.getSettings());
  const [roads, setRoads] = useState<RoadSegment[]>([]);
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [predictions, setPredictions] = useState<RoadPrediction[]>([]);
  const [maintenancePlans, setMaintenancePlans] = useState<MaintenancePlan[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('Just now');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const isRefreshingRef = useRef(false);

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshData = async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setIsSyncing(true);
    try {
      const [u, summary, r, rep, ins, pred, mnt, notif] = await Promise.all([
        apiService.getCurrentUser(),
        apiService.getDashboardSummary(),
        apiService.getRoads(),
        apiService.getReports(),
        apiService.getInspections(),
        apiService.getPredictions(),
        apiService.getMaintenance(),
        apiService.getNotifications(),
      ]);
      setCurrentUser(u);
      setDashboardSummary(summary);
      setRoads(r);
      setReports(rep);
      setInspections(ins);
      setPredictions(pred);
      setMaintenancePlans(mnt);
      setNotifications(notif);
      setLastRefreshTime(new Date().toLocaleTimeString());
    } catch (e) {
      console.error('Failed to load application data:', e);
    } finally {
      isRefreshingRef.current = false;
      setIsSyncing(false);
    }
  };

  // Initial load
  useEffect(() => {
    refreshData();
  }, []);

  // Section 12: Real-time background update polling (every 12 seconds, paused if tab hidden)
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden) return; // Stop unnecessary polling when tab inactive
      refreshData();
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const updateSettings = (newSettings: SystemSettings) => {
    apiService.saveSettings(newSettings);
    setSettingsState(newSettings);
    addToast('success', 'Settings Saved', 'System preferences and risk scoring parameters updated.');
  };

  const resetAllData = async () => {
    await apiService.seedDemoData();
    await refreshData();
    addToast('info', 'Reset Complete', 'Demo data restored to initial state.');
  };

  const seedDemoData = async () => {
    await apiService.seedDemoData();
    await refreshData();
    addToast('success', 'Demo Data Seeded', 'Loaded 3 demonstration corridors and sample workflow records.');
  };

  const resetToEmpty = async () => {
    await apiService.resetToEmpty();
    await refreshData();
    addToast('info', 'Database Cleared', 'All records cleared. Ready for new report submissions.');
  };

  const markNotificationRead = async (id: string) => {
    await apiService.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = async () => {
    await apiService.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast('info', 'Notifications Cleared', 'All notices marked as read.');
  };

  const createRoad = async (data: Omit<RoadSegment, 'id'>) => {
    const res = await apiService.createRoad(data);
    await refreshData();
    addToast('success', 'Segment Created', `Road segment ${res.name} (${res.id}) registered.`);
    return res;
  };

  const updateRoad = async (id: string, updates: Partial<RoadSegment>) => {
    const res = await apiService.updateRoad(id, updates);
    await refreshData();
    addToast('success', 'Segment Updated', `Road segment ${res.id} updated.`);
    return res;
  };

  const createReport = async (data: {
    roadName: string;
    coordinates: [number, number];
    category: string;
    severity: string;
    description: string;
    imageUrl?: string;
    reporterName?: string;
    reporterContact?: string;
    source?: string;
    segmentId?: string;
  }) => {
    const res = await apiService.createReport(data);
    await refreshData();
    addToast('success', 'Report Logged to Database', `Issue ${res.id} saved. Priority calculated: ${res.priorityLevel || (res as any).priority || res.severity || 'Medium'} (${(res as any).priorityScore ?? 'Calculated'}).`);
    return res;
  };

  const updateReport = async (id: string, updates: Partial<IssueReport>) => {
    const res = await apiService.updateReport(id, updates);
    await refreshData();
    addToast('info', 'Report Updated', `Status for ${res.id} changed to ${res.status}.`);
    return res;
  };

  const verifyReport = async (id: string, status: 'Verified' | 'Rejected', notes?: string, rejectionReason?: string) => {
    const res = await apiService.verifyReport(id, status, notes, rejectionReason);
    await refreshData();
    addToast(status === 'Verified' ? 'success' : 'warning', `Report ${status}`, `Complaint ${id} was marked as ${status}.`);
    return res;
  };

  const createInspection = async (data: Omit<Inspection, 'id'>) => {
    const res = await apiService.createInspection(data);
    await refreshData();
    addToast('success', 'Inspection Scheduled', `Task ${res.id} assigned to ${res.assignedInspector}.`);
    return res;
  };

  const updateInspection = async (id: string, updates: Partial<Inspection>) => {
    const res = await apiService.updateInspection(id, updates);
    await refreshData();
    addToast('info', 'Inspection Updated', `Inspection ${res.id} status updated to ${res.status}.`);
    return res;
  };

  const createMaintenance = async (data: Omit<MaintenancePlan, 'id'>) => {
    const res = await apiService.createMaintenance(data);
    await refreshData();
    addToast('success', 'Work Plan Created', `Maintenance plan ${res.id} queued.`);
    return res;
  };

  const updateMaintenance = async (id: string, updates: Partial<MaintenancePlan>) => {
    const res = await apiService.updateMaintenance(id, updates);
    await refreshData();
    addToast('info', 'Plan Updated', `Maintenance plan ${res.id} status is now ${res.status}.`);
    return res;
  };

  const runPredictionSimulation = async () => {
    const res = await apiService.runPredictionSimulation();
    await refreshData();
    addToast('success', 'Recommendation Engine Executed', res.message);
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        settings,
        updateSettings,
        resetAllData,
        seedDemoData,
        resetToEmpty,
        roads,
        reports,
        inspections,
        predictions,
        maintenancePlans,
        notifications,
        dashboardSummary,
        unreadNotificationCount,
        lastRefreshTime,
        isSyncing,
        markNotificationRead,
        markAllNotificationsRead,
        refreshData,
        toasts,
        addToast,
        removeToast,
        globalSearchQuery,
        setGlobalSearchQuery,
        createRoad,
        updateRoad,
        createReport,
        updateReport,
        verifyReport,
        createInspection,
        updateInspection,
        createMaintenance,
        updateMaintenance,
        runPredictionSimulation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
