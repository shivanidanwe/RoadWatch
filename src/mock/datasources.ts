import { DataSource } from '../types';

export const INITIAL_DATA_SOURCES: DataSource[] = [
  {
    id: 'DS-01',
    name: 'Municipal GIS & Road Inventory',
    category: 'Spatial DB',
    endpoint: 'http://localhost:8000/api/v1/roads',
    status: 'Connected',
    lastCheck: 'Just now',
    lastSync: '2024-10-26 17:30',
    recordsCount: 6,
    syncFrequency: 'Real-time sync',
    latencyMs: 14,
    notes: 'Geospatial road centerline coordinates and pavement attributes.'
  },
  {
    id: 'DS-02',
    name: 'FastAPI Prediction Engine',
    category: 'REST Microservice',
    endpoint: 'http://localhost:8000/api/v1/predictions',
    status: 'Connected',
    lastCheck: '1 minute ago',
    lastSync: '2024-10-26 17:25',
    recordsCount: 6,
    syncFrequency: 'On-demand polling',
    latencyMs: 38,
    notes: 'Scikit-Learn ML inference and configurable urgency scoring.'
  },
  {
    id: 'DS-03',
    name: 'Meteorological Rain Telemetry',
    category: 'Weather Service',
    endpoint: 'https://telemetry.meteo-gov.in/v2',
    status: 'Connected',
    lastCheck: '15 minutes ago',
    lastSync: '2024-10-26 17:00',
    recordsCount: 120,
    syncFrequency: 'Every 15 min',
    latencyMs: 85,
    notes: 'Precipitation accumulation and monsoon flood alert feeds.'
  },
  {
    id: 'DS-04',
    name: 'Traffic Vehicle Counts Feed',
    category: 'Traffic Sensors',
    endpoint: 'https://atcs-stream.transit.gov',
    status: 'Connected',
    lastCheck: '5 minutes ago',
    lastSync: '2024-10-26 17:15',
    recordsCount: 450,
    syncFrequency: 'Every 5 min',
    latencyMs: 62,
    notes: 'Loop detectors measuring commercial axle volumes.'
  }
];

