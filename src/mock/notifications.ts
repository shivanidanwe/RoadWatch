import { NotificationItem } from '../types';

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTIF-01',
    title: 'Critical Pothole Alert on BRT Corridor',
    message: 'Report REP-2024-001 on MG Marg reached severity threshold (14cm deep). Inspection dispatched.',
    timestamp: '10 minutes ago',
    type: 'critical',
    read: false,
    link: '/reports',
    category: 'Report'
  },
  {
    id: 'NOTIF-02',
    title: 'Inspection Due Today',
    message: 'Post-Severe-Weather inspection on Lakeview Blvd East (RD-104) is scheduled for today.',
    timestamp: '45 minutes ago',
    type: 'warning',
    read: false,
    link: '/inspections',
    category: 'Inspection'
  },
  {
    id: 'NOTIF-03',
    title: 'Maintenance Plan Approved',
    message: 'Plan MNT-2024-101 (Emergency Sub-Base Reconstruction) has been approved by Chief Engineer.',
    timestamp: '2 hours ago',
    type: 'success',
    read: false,
    link: '/maintenance',
    category: 'Maintenance'
  },
  {
    id: 'NOTIF-04',
    title: 'Model Evaluation Completed',
    message: 'Model v2.4-RandomForest-Ensemble evaluation passed with 91.4% accuracy. Drift status: Stable.',
    timestamp: '4 hours ago',
    type: 'info',
    read: true,
    link: '/models',
    category: 'Model'
  },
  {
    id: 'NOTIF-05',
    title: 'Traffic Sensor Telemetry Synced',
    message: 'Municipal ATCS ingested 18,450 loop detector PCU readings for Ward 4 and Ward 8.',
    timestamp: '6 hours ago',
    type: 'info',
    read: true,
    link: '/settings/data-sources',
    category: 'System'
  }
];
