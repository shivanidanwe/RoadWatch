export type RoadCondition = 'Good' | 'Fair' | 'Poor' | 'Critical';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type IssueCategory = 
  | 'Pothole' 
  | 'Surface cracking' 
  | 'Waterlogging' 
  | 'Road subsidence' 
  | 'Surface deterioration' 
  | 'Edge failure'
  | 'Other';

export type ReportSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type ReportStatus = 
  | 'Submitted' 
  | 'Under Review' 
  | 'Verified' 
  | 'Inspection Scheduled' 
  | 'Maintenance Planned' 
  | 'Resolved';

export type InspectionStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Reviewed';
export type InspectionType = 'Routine' | 'Post-Severe-Weather' | 'Citizen Report Verification' | 'Structural Assessment';

export type MaintenanceStatus = 'Proposed' | 'Under Review' | 'Approved' | 'Scheduled' | 'In Progress' | 'Completed';
export type MaintenanceType = 'Pothole Patching' | 'Resurfacing' | 'Full Reconstruction' | 'Drainage Rectification' | 'Crack Sealing';

export interface RoadSegment {
  id: string; // e.g. "RD-7041"
  name: string; // e.g. "MG Road Sector 4"
  ward: string; // e.g. "Ward 12 - Central"
  lengthKm: number;
  roadType: 'Arterial' | 'Sub-Arterial' | 'Collector' | 'Local Access';
  surfaceType: 'Asphalt' | 'Concrete' | 'Bituminous Macadam' | 'Paver Blocks';
  currentCondition: RoadCondition;
  pciScore: number; // Pavement Condition Index 0-100
  riskScore: number; // 0-100 predicted risk
  priority: PriorityLevel;
  trafficIntensity: 'Very Low' | 'Moderate' | 'Heavy' | 'Extreme High-Volume';
  weatherExposure: 'Low' | 'Moderate' | 'High Monsoon Flood Zone' | 'High Thermal Stress';
  lastInspectionDate: string;
  nextInspectionDate: string;
  lastMaintenanceDate: string;
  openReportsCount: number;
  coordinates: [number, number]; // [lat, lng]
  pathCoordinates?: [number, number][]; // Line coordinates [[lat, lng], ...]
  recommendedAction: string;
  recommendationReason: string;
  notes?: string;
}

export interface IssueReport {
  id: string; // e.g. "REP-2024-089"
  segmentId: string;
  roadName: string;
  category: IssueCategory;
  severity: ReportSeverity;
  source: 'Citizen App' | 'Field Officer' | 'Automated Sensor' | 'Municipal Patrol';
  reportDate: string;
  status: ReportStatus;
  assignedTeam?: string;
  description: string;
  coordinates: [number, number];
  imageUrl?: string;
  reporterName?: string;
  reporterContact?: string;
  verifiedBy?: string;
  statusHistory: {
    status: ReportStatus;
    timestamp: string;
    updatedBy: string;
    notes?: string;
  }[];
}

export interface Inspection {
  id: string; // e.g. "INSP-2024-042"
  segmentId: string;
  roadName: string;
  ward: string;
  assignedInspector: string;
  inspectorRole: string;
  scheduledDate: string;
  type: InspectionType;
  priority: PriorityLevel;
  status: InspectionStatus;
  notes: string;
  findings?: {
    observedCondition: RoadCondition;
    estimatedPci: number;
    structuralIntegrityScore: number; // 0-100
    damageSpreadPercentage: number;
    drainageCondition: 'Adequate' | 'Partially Blocked' | 'Severely Compromised';
    recommendedActions: string[];
    summaryNotes: string;
    photoUrls?: string[];
    completedAt?: string;
  };
}

export interface PredictionFactor {
  name: string;
  score: number; // 0-100
  weight: number; // percentage
  impact: 'High' | 'Moderate' | 'Low';
  description: string;
}

export interface RoadPrediction {
  segmentId: string;
  roadName: string;
  ward: string;
  riskScore: number; // 0-100
  priority: PriorityLevel;
  predictedCondition: RoadCondition;
  predictionHorizon: '30 Days' | '60 Days' | '90 Days' | '180 Days';
  confidenceScore: number; // percentage e.g. 88%
  uncertaintyMargin: string; // e.g. "+/- 4.2%"
  historicalTrend: { month: string; actualRisk: number; predictedRisk: number }[];
  factors: {
    damageSeverity: PredictionFactor;
    trafficIntensity: PredictionFactor;
    weatherExposure: PredictionFactor;
    repairHistory: PredictionFactor;
  };
  recommendedAction: string;
  explanation: string;
  dataFreshness: string;
  modelVersion: string;
  dataQualityNotes: string;
  lastUpdated: string;
}

export interface MaintenancePlan {
  id: string; // e.g. "MNT-2024-118"
  segmentId: string;
  roadName: string;
  ward: string;
  title: string;
  maintenanceType: MaintenanceType;
  priority: PriorityLevel;
  status: MaintenanceStatus;
  assignedCrew: string;
  crewLeader: string;
  estimatedCost: number; // in USD or INR equivalent
  actualCost?: number;
  startDate: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  requiredResources: string[];
  justification: string;
  completionNotes?: string;
  budgetStatus: 'Within Allocation' | 'Requires Approval' | 'Contingency Draw';
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Municipal Administrator' | 'Chief Road Engineer' | 'Field Inspector' | 'Data Analyst' | 'Maintenance Supervisor';
  department: string;
  avatarUrl?: string;
  phone: string;
  activeAssignmentsCount: number;
  completedTasksCount: number;
  status: 'Active' | 'On Leave' | 'In Field';
  wardCoverage: string[];
}

export interface ModelMetric {
  version: string;
  algorithm: string;
  trainingDate: string;
  evaluationDate: string;
  trainingSamplesCount: number;
  mae: number; // Mean Absolute Error
  rmse: number;
  r2Score: number;
  accuracy: number;
  f1Score: number;
  driftStatus: 'Stable' | 'Minor Drift Detected' | 'Significant Drift — Retraining Recommended';
  featureImportance: { feature: string; importance: number }[];
  isActive: boolean;
  status: 'Production Active' | 'Candidate Staged' | 'Archived';
}

export interface DataSource {
  id: string;
  name: string;
  category: 'Relational & Spatial DB' | 'REST Microservice' | 'Weather Telemetry' | 'Traffic & Congestion' | 'GIS Basemaps' | 'Sensor Network';
  endpoint: string;
  status: 'Connected' | 'Syncing' | 'Degraded' | 'Offline';
  lastCheck: string;
  lastSync: string;
  recordsCount: number;
  syncFrequency: string;
  latencyMs: number;
  notes: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  read: boolean;
  link?: string;
  category: 'Report' | 'Inspection' | 'Maintenance' | 'Model' | 'System';
}

export interface SystemSettings {
  demoMode: boolean;
  theme: 'light' | 'dark' | 'system';
  mapDefaultStyle: 'standard' | 'satellite' | 'dark';
  refreshIntervalSeconds: number;
  riskThresholds: {
    lowMax: number; // default 24
    mediumMax: number; // default 49
    highMax: number; // default 74
    criticalMin: number; // default 75
  };
  factorWeights: {
    damageSeverity: number; // e.g. 35%
    trafficIntensity: number; // e.g. 25%
    weatherExposure: number; // e.g. 20%
    repairHistory: number; // e.g. 20%
  };
  notifications: {
    criticalAlertsEmail: boolean;
    weeklyDigest: boolean;
    modelDriftAlerts: boolean;
  };
}
