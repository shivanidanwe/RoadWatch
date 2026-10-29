import { MaintenancePlan } from '../types';

export const INITIAL_MAINTENANCE_PLANS: MaintenancePlan[] = [
  {
    id: 'MNT-2024-101',
    segmentId: 'RD-101',
    roadName: 'Mahatma Gandhi Marg (Inner Ring)',
    ward: 'Ward 4 - North Zone',
    title: 'Rapid Night Milling & Asphalt Inlay Phase 1',
    maintenanceType: 'Resurfacing',
    priority: 'Critical',
    status: 'Scheduled',
    assignedCrew: 'Rapid Asphalt Squadron A',
    crewLeader: 'Eng. Ramesh Nair',
    estimatedCost: 65000,
    startDate: '2024-10-31',
    targetCompletionDate: '2024-11-04',
    requiredResources: [
      'Cold Planer / Milling Machine',
      'Electronic Asphalt Paver',
      'Polymer Modified Bitumen (450 MT)'
    ],
    justification: 'Pothole clusters and fatigue cracking along high-frequency municipal bus corridor.',
    budgetStatus: 'Within Allocation'
  },
  {
    id: 'MNT-2024-102',
    segmentId: 'RD-104',
    roadName: 'Lakeview Boulevard East',
    ward: 'Ward 3 - Central Zone',
    title: 'Culvert Drainage Overhaul & Base Stabilization',
    maintenanceType: 'Drainage Rectification',
    priority: 'Critical',
    status: 'Under Review',
    assignedCrew: 'Civic Drainage Unit 3',
    crewLeader: 'Supervisor Anand K.',
    estimatedCost: 42000,
    startDate: '2024-11-05',
    targetCompletionDate: '2024-11-12',
    requiredResources: [
      'Excavator 14T',
      'Precast Concrete Box Culverts (40m)',
      'Sub-base Crushed Stone Aggregate'
    ],
    justification: 'Stormwater overflow backs up into roadbed during storms; new culvert prevents saturation.',
    budgetStatus: 'Requires Approval'
  },
  {
    id: 'MNT-2024-103',
    segmentId: 'RD-102',
    roadName: 'Old Airport Expressway',
    ward: 'Ward 8 - East District',
    title: 'Rutting Remediation & Polymer Asphalt Overlay',
    maintenanceType: 'Overlay',
    priority: 'High',
    status: 'Proposed',
    assignedCrew: 'Expressway Highway Division',
    crewLeader: 'Supervisor David M.',
    estimatedCost: 78000,
    startDate: '2024-11-15',
    targetCompletionDate: '2024-11-22',
    requiredResources: [
      'Milling machine',
      'Heavy vibratory compactor',
      'High-friction asphalt wearing course'
    ],
    justification: 'Wheel rutting exceeding 18mm under heavy commercial vehicle freight traffic.',
    budgetStatus: 'Within Allocation'
  },
  {
    id: 'MNT-2024-104',
    segmentId: 'RD-103',
    roadName: 'Industrial Corridor Link 7',
    ward: 'Ward 11 - South Hub',
    title: 'Shoulder Reinforcement & Edge Patching',
    maintenanceType: 'Patching',
    priority: 'Medium',
    status: 'Completed',
    assignedCrew: 'South Hub Road Crew',
    crewLeader: 'Eng. Vikram S.',
    estimatedCost: 18000,
    startDate: '2024-10-18',
    targetCompletionDate: '2024-10-21',
    requiredResources: [
      'Patching hot-box',
      'Hand-guided vibratory plate'
    ],
    justification: 'Prevent progressive asphalt edge breakout along heavy transport access gates.',
    budgetStatus: 'Within Allocation'
  }
];

