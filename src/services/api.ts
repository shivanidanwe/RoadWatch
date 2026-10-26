import {
  RoadSegment,
  IssueReport,
  Inspection,
  RoadPrediction,
  MaintenancePlan,
  TeamMember,
  ModelMetric,
  DataSource,
  NotificationItem,
  SystemSettings
} from '../types';
import { INITIAL_ROAD_SEGMENTS } from '../mock/roads';
import { INITIAL_ISSUE_REPORTS } from '../mock/reports';
import { INITIAL_INSPECTIONS } from '../mock/inspections';
import { INITIAL_PREDICTIONS } from '../mock/predictions';
import { INITIAL_MAINTENANCE_PLANS } from '../mock/maintenance';
import { INITIAL_TEAM_MEMBERS } from '../mock/team';
import { INITIAL_MODELS } from '../mock/models';
import { INITIAL_DATA_SOURCES } from '../mock/datasources';
import { INITIAL_NOTIFICATIONS } from '../mock/notifications';
import { INITIAL_DATASETS, DatasetMeta } from '../mock/datasets';
import { ANALYTICS_DATA } from '../mock/analytics';

const STORAGE_KEYS = {
  ROADS: 'roadwatch_demo_roads',
  REPORTS: 'roadwatch_demo_reports',
  INSPECTIONS: 'roadwatch_demo_inspections',
  PREDICTIONS: 'roadwatch_demo_predictions',
  MAINTENANCE: 'roadwatch_demo_maintenance',
  TEAM: 'roadwatch_demo_team',
  MODELS: 'roadwatch_demo_models',
  DATA_SOURCES: 'roadwatch_demo_datasources',
  NOTIFICATIONS: 'roadwatch_demo_notifications',
  DATASETS: 'roadwatch_demo_datasets',
  SETTINGS: 'roadwatch_demo_settings',
  AUTH_USER: 'roadwatch_auth_user',
};

// Initialize localStorage with initial data if absent
function getStored<T>(key: string, defaultData: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Error reading localStorage for key ${key}:`, e);
    return defaultData;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error writing localStorage for key ${key}:`, e);
  }
}

export const DEFAULT_SETTINGS: SystemSettings = {
  demoMode: true,
  theme: 'light',
  mapDefaultStyle: 'standard',
  refreshIntervalSeconds: 30,
  riskThresholds: {
    lowMax: 24,
    mediumMax: 49,
    highMax: 74,
    criticalMin: 75,
  },
  factorWeights: {
    damageSeverity: 35,
    trafficIntensity: 25,
    weatherExposure: 20,
    repairHistory: 20,
  },
  notifications: {
    criticalAlertsEmail: true,
    weeklyDigest: true,
    modelDriftAlerts: true,
  },
};

export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

class ApiService {
  private isDemoMode(): boolean {
    const settings = getStored<SystemSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    return settings.demoMode;
  }

  // --- Auth Endpoints ---
  async login(email: string, password: string):Promise<{ user: TeamMember; token: string }> {
    if (this.isDemoMode()) {
      await new Promise(r => setTimeout(r, 600)); // simulated latency
      const team = getStored<TeamMember[]>(STORAGE_KEYS.TEAM, INITIAL_TEAM_MEMBERS);
      const user = team.find(u => u.email.toLowerCase() === email.toLowerCase()) || team[0];
      const token = `demo-token-${Date.now()}`;
      setStored(STORAGE_KEYS.AUTH_USER, user);
      return { user, token };
    }
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(`Authentication failed with status ${res.status}`);
    return res.json();
  }

  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  }

  async getCurrentUser(): Promise<TeamMember | null> {
    const user = getStored<TeamMember | null>(STORAGE_KEYS.AUTH_USER, INITIAL_TEAM_MEMBERS[0]);
    return user;
  }

  // --- Roads Endpoints ---
  async getRoads(): Promise<RoadSegment[]> {
    if (this.isDemoMode()) {
      return getStored<RoadSegment[]>(STORAGE_KEYS.ROADS, INITIAL_ROAD_SEGMENTS);
    }
    const res = await fetch(`${API_BASE_URL}/roads`);
    if (!res.ok) throw new Error(`Failed to fetch roads from backend: ${res.statusText}`);
    return res.json();
  }

  async getRoadById(id: string): Promise<RoadSegment | undefined> {
    const roads = await this.getRoads();
    return roads.find(r => r.id === id);
  }

  async createRoad(road: Omit<RoadSegment, 'id'>): Promise<RoadSegment> {
    if (this.isDemoMode()) {
      const roads = getStored<RoadSegment[]>(STORAGE_KEYS.ROADS, INITIAL_ROAD_SEGMENTS);
      const newRoad: RoadSegment = {
        ...road,
        id: `RD-${Math.floor(100 + Math.random() * 900)}`,
      };
      roads.unshift(newRoad);
      setStored(STORAGE_KEYS.ROADS, roads);
      return newRoad;
    }
    const res = await fetch(`${API_BASE_URL}/roads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(road),
    });
    if (!res.ok) throw new Error('Failed to create road');
    return res.json();
  }

  async updateRoad(id: string, updates: Partial<RoadSegment>): Promise<RoadSegment> {
    if (this.isDemoMode()) {
      const roads = getStored<RoadSegment[]>(STORAGE_KEYS.ROADS, INITIAL_ROAD_SEGMENTS);
      const idx = roads.findIndex(r => r.id === id);
      if (idx === -1) throw new Error('Road segment not found');
      roads[idx] = { ...roads[idx], ...updates };
      setStored(STORAGE_KEYS.ROADS, roads);
      return roads[idx];
    }
    const res = await fetch(`${API_BASE_URL}/roads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update road segment');
    return res.json();
  }

  // --- Reports Endpoints ---
  async getReports(): Promise<IssueReport[]> {
    if (this.isDemoMode()) {
      return getStored<IssueReport[]>(STORAGE_KEYS.REPORTS, INITIAL_ISSUE_REPORTS);
    }
    const res = await fetch(`${API_BASE_URL}/reports`);
    if (!res.ok) throw new Error('Failed to fetch issue reports');
    return res.json();
  }

  async createReport(report: Omit<IssueReport, 'id' | 'statusHistory'>): Promise<IssueReport> {
    if (this.isDemoMode()) {
      const reports = getStored<IssueReport[]>(STORAGE_KEYS.REPORTS, INITIAL_ISSUE_REPORTS);
      const newReport: IssueReport = {
        ...report,
        id: `REP-2024-${String(reports.length + 1).padStart(3, '0')}`,
        statusHistory: [
          { status: report.status || 'Submitted', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16), updatedBy: 'Web Console' }
        ]
      };
      reports.unshift(newReport);
      setStored(STORAGE_KEYS.REPORTS, reports);

      // Increment openReportsCount on corresponding road segment
      const roads = getStored<RoadSegment[]>(STORAGE_KEYS.ROADS, INITIAL_ROAD_SEGMENTS);
      const roadIdx = roads.findIndex(r => r.id === report.segmentId);
      if (roadIdx !== -1) {
        roads[roadIdx].openReportsCount = (roads[roadIdx].openReportsCount || 0) + 1;
        setStored(STORAGE_KEYS.ROADS, roads);
      }

      return newReport;
    }
    const res = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    if (!res.ok) throw new Error('Failed to create report');
    return res.json();
  }

  async updateReport(id: string, updates: Partial<IssueReport>): Promise<IssueReport> {
    if (this.isDemoMode()) {
      const reports = getStored<IssueReport[]>(STORAGE_KEYS.REPORTS, INITIAL_ISSUE_REPORTS);
      const idx = reports.findIndex(r => r.id === id);
      if (idx === -1) throw new Error('Report not found');
      
      const oldStatus = reports[idx].status;
      const updated = { ...reports[idx], ...updates };
      
      if (updates.status && updates.status !== oldStatus) {
        updated.statusHistory = [
          ...(updated.statusHistory || []),
          {
            status: updates.status,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            updatedBy: updates.verifiedBy || 'Municipal Staff',
            notes: `Status advanced from ${oldStatus} to ${updates.status}`
          }
        ];
      }

      reports[idx] = updated;
      setStored(STORAGE_KEYS.REPORTS, reports);
      return updated;
    }
    const res = await fetch(`${API_BASE_URL}/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update report');
    return res.json();
  }

  // --- Inspections Endpoints ---
  async getInspections(): Promise<Inspection[]> {
    if (this.isDemoMode()) {
      return getStored<Inspection[]>(STORAGE_KEYS.INSPECTIONS, INITIAL_INSPECTIONS);
    }
    const res = await fetch(`${API_BASE_URL}/inspections`);
    if (!res.ok) throw new Error('Failed to fetch inspections');
    return res.json();
  }

  async createInspection(inspection: Omit<Inspection, 'id'>): Promise<Inspection> {
    if (this.isDemoMode()) {
      const list = getStored<Inspection[]>(STORAGE_KEYS.INSPECTIONS, INITIAL_INSPECTIONS);
      const newInsp: Inspection = {
        ...inspection,
        id: `INSP-2024-${String(list.length + 43).padStart(3, '0')}`,
      };
      list.unshift(newInsp);
      setStored(STORAGE_KEYS.INSPECTIONS, list);
      return newInsp;
    }
    const res = await fetch(`${API_BASE_URL}/inspections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inspection),
    });
    if (!res.ok) throw new Error('Failed to create inspection');
    return res.json();
  }

  async updateInspection(id: string, updates: Partial<Inspection>): Promise<Inspection> {
    if (this.isDemoMode()) {
      const list = getStored<Inspection[]>(STORAGE_KEYS.INSPECTIONS, INITIAL_INSPECTIONS);
      const idx = list.findIndex(i => i.id === id);
      if (idx === -1) throw new Error('Inspection not found');
      list[idx] = { ...list[idx], ...updates };
      setStored(STORAGE_KEYS.INSPECTIONS, list);

      // If condition was updated in findings, update the road segment condition as well
      if (updates.findings?.observedCondition) {
        const roads = getStored<RoadSegment[]>(STORAGE_KEYS.ROADS, INITIAL_ROAD_SEGMENTS);
        const roadIdx = roads.findIndex(r => r.id === list[idx].segmentId);
        if (roadIdx !== -1) {
          roads[roadIdx].currentCondition = updates.findings.observedCondition;
          if (updates.findings.estimatedPci) {
            roads[roadIdx].pciScore = updates.findings.estimatedPci;
          }
          roads[roadIdx].lastInspectionDate = new Date().toISOString().substring(0, 10);
          setStored(STORAGE_KEYS.ROADS, roads);
        }
      }

      return list[idx];
    }
    const res = await fetch(`${API_BASE_URL}/inspections/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update inspection');
    return res.json();
  }

  // --- Predictions Endpoints ---
  async getPredictions(): Promise<RoadPrediction[]> {
    if (this.isDemoMode()) {
      return getStored<RoadPrediction[]>(STORAGE_KEYS.PREDICTIONS, INITIAL_PREDICTIONS);
    }
    const res = await fetch(`${API_BASE_URL}/predictions`);
    if (!res.ok) throw new Error('Failed to fetch predictions');
    return res.json();
  }

  async runPredictionSimulation(): Promise<{ message: string; evaluatedCount: number; timestamp: string }> {
    if (this.isDemoMode()) {
      await new Promise(r => setTimeout(r, 1200)); // Simulate model computation
      return {
        message: 'Prediction pipeline executed successfully on 12 road segments using v2.4-RandomForest-Ensemble model (Demo Simulation).',
        evaluatedCount: 12,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
    }
    const res = await fetch(`${API_BASE_URL}/predictions/run`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to run predictions');
    return res.json();
  }

  // --- Maintenance Endpoints ---
  async getMaintenance(): Promise<MaintenancePlan[]> {
    if (this.isDemoMode()) {
      return getStored<MaintenancePlan[]>(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE_PLANS);
    }
    const res = await fetch(`${API_BASE_URL}/maintenance`);
    if (!res.ok) throw new Error('Failed to fetch maintenance plans');
    return res.json();
  }

  async createMaintenance(plan: Omit<MaintenancePlan, 'id'>): Promise<MaintenancePlan> {
    if (this.isDemoMode()) {
      const list = getStored<MaintenancePlan[]>(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE_PLANS);
      const newPlan: MaintenancePlan = {
        ...plan,
        id: `MNT-2024-${String(list.length + 105).padStart(3, '0')}`,
      };
      list.unshift(newPlan);
      setStored(STORAGE_KEYS.MAINTENANCE, list);
      return newPlan;
    }
    const res = await fetch(`${API_BASE_URL}/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan),
    });
    if (!res.ok) throw new Error('Failed to create maintenance plan');
    return res.json();
  }

  async updateMaintenance(id: string, updates: Partial<MaintenancePlan>): Promise<MaintenancePlan> {
    if (this.isDemoMode()) {
      const list = getStored<MaintenancePlan[]>(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE_PLANS);
      const idx = list.findIndex(m => m.id === id);
      if (idx === -1) throw new Error('Maintenance plan not found');
      list[idx] = { ...list[idx], ...updates };
      setStored(STORAGE_KEYS.MAINTENANCE, list);
      return list[idx];
    }
    const res = await fetch(`${API_BASE_URL}/maintenance/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update maintenance plan');
    return res.json();
  }

  // --- Team Endpoints ---
  async getTeam(): Promise<TeamMember[]> {
    return getStored<TeamMember[]>(STORAGE_KEYS.TEAM, INITIAL_TEAM_MEMBERS);
  }

  async createTeamMember(member: Omit<TeamMember, 'id'>): Promise<TeamMember> {
    const list = getStored<TeamMember[]>(STORAGE_KEYS.TEAM, INITIAL_TEAM_MEMBERS);
    const newMember: TeamMember = {
      ...member,
      id: `USR-${String(list.length + 1).padStart(3, '0')}`,
    };
    list.push(newMember);
    setStored(STORAGE_KEYS.TEAM, list);
    return newMember;
  }

  // --- Models Endpoints ---
  async getModels(): Promise<ModelMetric[]> {
    return getStored<ModelMetric[]>(STORAGE_KEYS.MODELS, INITIAL_MODELS);
  }

  // --- Data Sources Endpoints ---
  async getDataSources(): Promise<DataSource[]> {
    return getStored<DataSource[]>(STORAGE_KEYS.DATA_SOURCES, INITIAL_DATA_SOURCES);
  }

  // --- Notifications Endpoints ---
  async getNotifications(): Promise<NotificationItem[]> {
    return getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const list = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = list.map(n => (n.id === id ? { ...n, read: true } : n));
    setStored(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  async markAllNotificationsAsRead(): Promise<void> {
    const list = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = list.map(n => ({ ...n, read: true }));
    setStored(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  // --- Datasets Endpoints ---
  async getDatasets(): Promise<DatasetMeta[]> {
    return getStored<DatasetMeta[]>(STORAGE_KEYS.DATASETS, INITIAL_DATASETS);
  }

  // --- Analytics ---
  async getAnalytics() {
    return ANALYTICS_DATA;
  }

  // --- Settings ---
  getSettings(): SystemSettings {
    return getStored<SystemSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  updateSettings(settings: SystemSettings): void {
    setStored(STORAGE_KEYS.SETTINGS, settings);
  }

  resetAllDemoData(): void {
    setStored(STORAGE_KEYS.ROADS, INITIAL_ROAD_SEGMENTS);
    setStored(STORAGE_KEYS.REPORTS, INITIAL_ISSUE_REPORTS);
    setStored(STORAGE_KEYS.INSPECTIONS, INITIAL_INSPECTIONS);
    setStored(STORAGE_KEYS.PREDICTIONS, INITIAL_PREDICTIONS);
    setStored(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE_PLANS);
    setStored(STORAGE_KEYS.TEAM, INITIAL_TEAM_MEMBERS);
    setStored(STORAGE_KEYS.MODELS, INITIAL_MODELS);
    setStored(STORAGE_KEYS.DATA_SOURCES, INITIAL_DATA_SOURCES);
    setStored(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    setStored(STORAGE_KEYS.DATASETS, INITIAL_DATASETS);
    setStored(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }
}

export const apiService = new ApiService();
