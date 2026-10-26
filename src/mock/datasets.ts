export interface DatasetMeta {
  id: string;
  name: string;
  source: string;
  lastUpdated: string;
  recordCount: number;
  missingValuesPct: number;
  validationStatus: 'Passed Validated' | 'Warnings Detected' | 'Failed Schema Validation';
  freshness: string;
  importStatus: 'Ready' | 'Processing' | 'Archived';
  description: string;
  schema: { name: string; type: string; nullable: boolean; description: string }[];
  sampleRecords: Record<string, any>[];
}

export const INITIAL_DATASETS: DatasetMeta[] = [
  {
    id: 'DS-ROAD-INV',
    name: 'Municipal Road Inventory (GeoJSON / MultiLineString)',
    source: 'PostgreSQL / PostGIS `roads_geometry` layer',
    lastUpdated: '2024-10-26 14:30',
    recordCount: 1420,
    missingValuesPct: 0.2,
    validationStatus: 'Passed Validated',
    freshness: '2 hours ago',
    importStatus: 'Ready',
    description: 'Master spatial inventory of all classified arterial, collector, and local roads including length, surface grade, and ward assignment.',
    schema: [
      { name: 'segment_id', type: 'VARCHAR(24) PRIMARY KEY', nullable: false, description: 'Unique municipal identifier e.g. RD-101' },
      { name: 'road_name', type: 'VARCHAR(128)', nullable: false, description: 'Gazetted street name' },
      { name: 'ward_code', type: 'VARCHAR(32)', nullable: false, description: 'Electoral and administrative ward' },
      { name: 'surface_type', type: 'VARCHAR(32)', nullable: false, description: 'Asphalt / Concrete / Macadam / Pavers' },
      { name: 'length_meters', type: 'NUMERIC(8,2)', nullable: false, description: 'GIS centerline surveyed distance' },
      { name: 'geom', type: 'GEOMETRY(LineString, 4326)', nullable: false, description: 'WGS84 EPSG:4326 path coordinates' }
    ],
    sampleRecords: [
      { segment_id: 'RD-101', road_name: 'Mahatma Gandhi Marg', ward_code: 'Ward 4', surface_type: 'Asphalt', length_meters: 4800, pci: 32 },
      { segment_id: 'RD-102', road_name: 'Old Airport Expressway', ward_code: 'Ward 8', surface_type: 'Asphalt', length_meters: 6200, pci: 44 },
      { segment_id: 'RD-103', road_name: 'Industrial Corridor Link 7', ward_code: 'Ward 11', surface_type: 'Macadam', length_meters: 3500, pci: 48 },
      { segment_id: 'RD-104', road_name: 'Lakeview Boulevard East', ward_code: 'Ward 3', surface_type: 'Asphalt', length_meters: 2100, pci: 36 },
      { segment_id: 'RD-105', road_name: 'Heritage Commercial Spine', ward_code: 'Ward 1', surface_type: 'Paver Blocks', length_meters: 1900, pci: 59 },
    ]
  },
  {
    id: 'DS-CITIZEN-REP',
    name: 'Citizen & Officer Issue Reports',
    source: 'Civic Mobile App & Web Portal REST Feed',
    lastUpdated: '2024-10-26 16:50',
    recordCount: 8430,
    missingValuesPct: 2.1,
    validationStatus: 'Passed Validated',
    freshness: '15 minutes ago',
    importStatus: 'Ready',
    description: 'Crowdsourced public and field worker distress notifications tagged with GPS coordinates and photos.',
    schema: [
      { name: 'report_id', type: 'VARCHAR(32) PRIMARY KEY', nullable: false, description: 'Unique ticket tracking token' },
      { name: 'segment_id', type: 'VARCHAR(24) REFERENCES roads', nullable: false, description: 'Spatial link to road segment' },
      { name: 'category', type: 'VARCHAR(48)', nullable: false, description: 'Distress type classification' },
      { name: 'severity', type: 'VARCHAR(16)', nullable: false, description: 'Low / Medium / High / Critical' },
      { name: 'lat', type: 'FLOAT8', nullable: false, description: 'WGS84 Latitude' },
      { name: 'lng', type: 'FLOAT8', nullable: false, description: 'WGS84 Longitude' },
      { name: 'status', type: 'VARCHAR(32)', nullable: false, description: 'Current progression workflow step' }
    ],
    sampleRecords: [
      { report_id: 'REP-2024-001', segment_id: 'RD-101', category: 'Pothole', severity: 'Critical', lat: 12.9716, lng: 77.5946, status: 'Inspection Scheduled' },
      { report_id: 'REP-2024-002', segment_id: 'RD-104', category: 'Waterlogging', severity: 'Critical', lat: 12.9832, lng: 77.6189, status: 'Verified' },
      { report_id: 'REP-2024-003', segment_id: 'RD-111', category: 'Road subsidence', severity: 'Critical', lat: 12.9610, lng: 77.5510, status: 'Maintenance Planned' },
      { report_id: 'REP-2024-004', segment_id: 'RD-102', category: 'Surface cracking', severity: 'High', lat: 12.9592, lng: 77.6534, status: 'Under Review' },
    ]
  },
  {
    id: 'DS-TRAFFIC-TELEMETRY',
    name: 'Loop Detector Traffic Volume (PCU/hr)',
    source: 'ATCS SCADA Inductive Loop Detectors',
    lastUpdated: '2024-10-26 17:15',
    recordCount: 320400,
    missingValuesPct: 4.8,
    validationStatus: 'Warnings Detected',
    freshness: '30 minutes ago',
    importStatus: 'Ready',
    description: 'Hourly traffic density and commercial freight axle counts ingested across 84 key municipal junctions.',
    schema: [
      { name: 'detector_id', type: 'VARCHAR(32)', nullable: false, description: 'Inductive loop hardware serial' },
      { name: 'segment_id', type: 'VARCHAR(24)', nullable: false, description: 'Monitored road segment' },
      { name: 'timestamp', type: 'TIMESTAMPTZ', nullable: false, description: 'Sensor logging epoch' },
      { name: 'pcu_count', type: 'INTEGER', nullable: false, description: 'Passenger Car Units per hour' },
      { name: 'heavy_commercial_pct', type: 'NUMERIC(5,2)', nullable: true, description: 'Truck / Bus axle proportion' }
    ],
    sampleRecords: [
      { detector_id: 'LD-402', segment_id: 'RD-101', timestamp: '2024-10-26 16:00', pcu_count: 4250, heavy_commercial_pct: 22.4 },
      { detector_id: 'LD-403', segment_id: 'RD-101', timestamp: '2024-10-26 17:00', pcu_count: 4890, heavy_commercial_pct: 19.8 },
      { detector_id: 'LD-810', segment_id: 'RD-102', timestamp: '2024-10-26 16:00', pcu_count: 5100, heavy_commercial_pct: 31.2 },
      { detector_id: 'LD-112', segment_id: 'RD-103', timestamp: '2024-10-26 16:00', pcu_count: 2400, heavy_commercial_pct: 48.6 },
    ]
  },
  {
    id: 'DS-WEATHER-DOPPLER',
    name: 'Doppler Radar Precipitation & Soil Saturation',
    source: 'National Meteorological Service Regional Radar',
    lastUpdated: '2024-10-26 17:00',
    recordCount: 14400,
    missingValuesPct: 0.0,
    validationStatus: 'Passed Validated',
    freshness: '45 minutes ago',
    importStatus: 'Ready',
    description: 'Spatial precipitation accumulation in mm/hr mapped across ward boundary polygon grids.',
    schema: [
      { name: 'grid_cell_id', type: 'VARCHAR(20)', nullable: false, description: '1km x 1km centroid identifier' },
      { name: 'ward_code', type: 'VARCHAR(32)', nullable: false, description: 'Enclosing ward' },
      { name: 'precipitation_mm_24h', type: 'NUMERIC(6,2)', nullable: false, description: 'Cumulative rainfall' },
      { name: 'soil_moisture_saturation_pct', type: 'NUMERIC(5,2)', nullable: false, description: 'Subgrade water level factor' }
    ],
    sampleRecords: [
      { grid_cell_id: 'CELL-W4-09', ward_code: 'Ward 4', precipitation_mm_24h: 42.5, soil_moisture_saturation_pct: 88.4 },
      { grid_cell_id: 'CELL-W3-04', ward_code: 'Ward 3', precipitation_mm_24h: 58.2, soil_moisture_saturation_pct: 94.1 },
      { grid_cell_id: 'CELL-W7-11', ward_code: 'Ward 7', precipitation_mm_24h: 36.0, soil_moisture_saturation_pct: 82.0 },
    ]
  }
];
