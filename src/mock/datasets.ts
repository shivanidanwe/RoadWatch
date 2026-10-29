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
    name: 'Municipal Road Inventory',
    source: 'GIS Vector Layer',
    lastUpdated: '2024-10-26 14:30',
    recordCount: 6,
    missingValuesPct: 0.0,
    validationStatus: 'Passed Validated',
    freshness: '2 hours ago',
    importStatus: 'Ready',
    description: 'Master spatial inventory of road segments with length, surface type, and condition.',
    schema: [
      { name: 'segment_id', type: 'VARCHAR(24) PK', nullable: false, description: 'Road ID e.g. RD-101' },
      { name: 'road_name', type: 'VARCHAR(128)', nullable: false, description: 'Corridor name' },
      { name: 'ward', type: 'VARCHAR(32)', nullable: false, description: 'Administrative Ward' },
      { name: 'surface_type', type: 'VARCHAR(32)', nullable: false, description: 'Asphalt / Concrete' },
      { name: 'length_km', type: 'FLOAT', nullable: false, description: 'Length in km' },
      { name: 'pci_score', type: 'INT', nullable: false, description: 'Pavement Condition Index' }
    ],
    sampleRecords: [
      { segment_id: 'RD-101', road_name: 'Mahatma Gandhi Marg', ward: 'Ward 4', surface_type: 'Asphalt', length_km: 4.8, pci_score: 32 },
      { segment_id: 'RD-102', road_name: 'Old Airport Expressway', ward: 'Ward 8', surface_type: 'Asphalt', length_km: 6.2, pci_score: 44 },
      { segment_id: 'RD-103', road_name: 'Industrial Corridor Link 7', ward: 'Ward 11', surface_type: 'Bituminous Macadam', length_km: 3.5, pci_score: 48 },
      { segment_id: 'RD-104', road_name: 'Lakeview Boulevard East', ward: 'Ward 3', surface_type: 'Asphalt', length_km: 2.1, pci_score: 36 },
      { segment_id: 'RD-105', road_name: 'Tech Hub Boulevard', ward: 'Ward 6', surface_type: 'Concrete', length_km: 5.4, pci_score: 76 }
    ]
  },
  {
    id: 'DS-CITIZEN-REP',
    name: 'Citizen & Patrol Issue Reports',
    source: 'Civic Mobile App & Web Portal Feed',
    lastUpdated: '2024-10-26 16:50',
    recordCount: 5,
    missingValuesPct: 0.0,
    validationStatus: 'Passed Validated',
    freshness: '15 minutes ago',
    importStatus: 'Ready',
    description: 'Distress notifications tagged with GPS coordinates and severity rankings.',
    schema: [
      { name: 'report_id', type: 'VARCHAR(32) PK', nullable: false, description: 'Tracking ID' },
      { name: 'segment_id', type: 'VARCHAR(24)', nullable: false, description: 'Associated Road ID' },
      { name: 'category', type: 'VARCHAR(48)', nullable: false, description: 'Pothole / Waterlogging' },
      { name: 'severity', type: 'VARCHAR(16)', nullable: false, description: 'Critical / High / Medium / Low' },
      { name: 'status', type: 'VARCHAR(32)', nullable: false, description: 'Resolution status' }
    ],
    sampleRecords: [
      { report_id: 'REP-2024-001', segment_id: 'RD-101', category: 'Pothole', severity: 'Critical', status: 'Inspection Scheduled' },
      { report_id: 'REP-2024-002', segment_id: 'RD-104', category: 'Waterlogging', severity: 'Critical', status: 'Verified' },
      { report_id: 'REP-2024-003', segment_id: 'RD-102', category: 'Surface Rutting', severity: 'High', status: 'Under Review' },
      { report_id: 'REP-2024-004', segment_id: 'RD-103', category: 'Edge Damage', severity: 'Medium', status: 'In Progress' }
    ]
  },
  {
    id: 'DS-MAINT-HIST',
    name: 'Maintenance Logs & Work Orders',
    source: 'Public Works ERP',
    lastUpdated: '2024-10-26 12:00',
    recordCount: 4,
    missingValuesPct: 0.0,
    validationStatus: 'Passed Validated',
    freshness: '4 hours ago',
    importStatus: 'Ready',
    description: 'Historical and active road maintenance actions, costs, and contractor assignments.',
    schema: [
      { name: 'work_order_id', type: 'VARCHAR(32) PK', nullable: false, description: 'Order ID' },
      { name: 'segment_id', type: 'VARCHAR(24)', nullable: false, description: 'Road segment' },
      { name: 'maintenance_type', type: 'VARCHAR(48)', nullable: false, description: 'Overlay / Patching' },
      { name: 'estimated_cost', type: 'NUMERIC', nullable: false, description: 'Cost in USD' },
      { name: 'status', type: 'VARCHAR(32)', nullable: false, description: 'Order status' }
    ],
    sampleRecords: [
      { work_order_id: 'MNT-2024-101', segment_id: 'RD-101', maintenance_type: 'Resurfacing', estimated_cost: 65000, status: 'Scheduled' },
      { work_order_id: 'MNT-2024-102', segment_id: 'RD-104', maintenance_type: 'Drainage Rectification', estimated_cost: 42000, status: 'Under Review' },
      { work_order_id: 'MNT-2024-103', segment_id: 'RD-102', maintenance_type: 'Overlay', estimated_cost: 78000, status: 'Proposed' }
    ]
  }
];
