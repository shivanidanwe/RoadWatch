import { DataSource } from '../types';

export const INITIAL_DATA_SOURCES: DataSource[] = [
  {
    id: 'DS-01',
    name: 'PostgreSQL 16 + PostGIS Spatial DB',
    category: 'Relational & Spatial DB',
    endpoint: 'postgresql://gis_admin@db-internal.roadwatch.local:5432/roadwatch_spatial',
    status: 'Connected',
    lastCheck: 'Just now (10s ago)',
    lastSync: '2024-10-26 17:30',
    recordsCount: 48920,
    syncFrequency: 'Real-time WAL streaming',
    latencyMs: 14,
    notes: 'Primary geospatial store storing MultiLineString road geometries, maintenance history tables, and citizen reports.'
  },
  {
    id: 'DS-02',
    name: 'FastAPI Prediction & Scoring Engine',
    category: 'REST Microservice',
    endpoint: 'http://localhost:8000/api/v1',
    status: 'Connected',
    lastCheck: '1 minute ago',
    lastSync: '2024-10-26 17:25',
    recordsCount: 12040,
    syncFrequency: 'On-demand REST polling',
    latencyMs: 38,
    notes: 'Python 3.11 service executing Scikit-learn random forest pipelines and urgency criteria weighting.'
  },
  {
    id: 'DS-03',
    name: 'Meteorological Doppler Weather API',
    category: 'Weather Telemetry',
    endpoint: 'https://telemetry.meteo-gov.in/v2/precipitation/zones',
    status: 'Connected',
    lastCheck: '15 minutes ago',
    lastSync: '2024-10-26 17:00',
    recordsCount: 720,
    syncFrequency: 'Every 15 minutes',
    latencyMs: 120,
    notes: 'Provides rainfall accumulation, soil saturation indexes, and stormwater flood hazard alerts.'
  },
  {
    id: 'DS-04',
    name: 'Municipal Traffic Management Center (ATCS)',
    category: 'Traffic & Congestion',
    endpoint: 'https://atcs-stream.transit.gov/sensors/pcu-feed',
    status: 'Connected',
    lastCheck: '5 minutes ago',
    lastSync: '2024-10-26 17:15',
    recordsCount: 18450,
    syncFrequency: 'Every 5 minutes',
    latencyMs: 82,
    notes: 'Radar loop detector vehicle counts and commercial heavy-axle freight volume measurements.'
  },
  {
    id: 'DS-05',
    name: 'OpenStreetMap Carto & Vector Tiles',
    category: 'GIS Basemaps',
    endpoint: 'https://demotiles.maplibre.org/style.json',
    status: 'Connected',
    lastCheck: '2 minutes ago',
    lastSync: '2024-10-26 17:28',
    recordsCount: 95000,
    syncFrequency: 'Static / CDN Cached',
    latencyMs: 24,
    notes: 'Vector tile server serving road networks, ward boundaries, and terrain contours for MapLibre GL.'
  },
  {
    id: 'DS-06',
    name: 'Mobile Inspection Tablet Fleet (Field App)',
    category: 'Sensor Network',
    endpoint: 'wss://field-sync.roadwatch.local/events',
    status: 'Connected',
    lastCheck: '3 minutes ago',
    lastSync: '2024-10-26 17:20',
    recordsCount: 3410,
    syncFrequency: 'WebSocket Push',
    latencyMs: 45,
    notes: 'Offline-first field inspection sync channel with encrypted photo upload buffer.'
  }
];
