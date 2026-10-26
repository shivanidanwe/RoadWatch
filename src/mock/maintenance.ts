import { MaintenancePlan } from '../types';

export const INITIAL_MAINTENANCE_PLANS: MaintenancePlan[] = [
  {
    id: 'MNT-2024-101',
    segmentId: 'RD-111',
    roadName: 'Wholesale Grain Market Approach',
    ward: 'Ward 7 - West Zone',
    title: 'Emergency Sub-Base Reconstruction & Geogrid Reinforcement',
    maintenanceType: 'Full Reconstruction',
    priority: 'Critical',
    status: 'Approved',
    assignedCrew: 'Metropolitan Heavy Civil Unit 1',
    crewLeader: 'Supervisor Rajesh G.',
    estimatedCost: 145000,
    startDate: '2024-11-02',
    targetCompletionDate: '2024-11-18',
    requiredResources: [
      'Excavator 20T (2 units)',
      'Vibratory Soil Compactor',
      'Biaxial Geogrid Membrane (3500 sqm)',
      'Wet Mix Macadam Aggregate (1200 MT)',
      'Bituminous Concrete 50mm wearing course'
    ],
    justification: 'Severe sub-base liquefaction and 75mm pavement subsidence under grain transport axle loads. Risk score 92/100.',
    budgetStatus: 'Requires Approval'
  },
  {
    id: 'MNT-2024-102',
    segmentId: 'RD-101',
    roadName: 'Mahatma Gandhi Marg (Inner Ring)',
    ward: 'Ward 4 - North Zone',
    title: 'Rapid Night Milling & Asphalt Inlay Phase 1',
    maintenanceType: 'Resurfacing',
    priority: 'Critical',
    status: 'Scheduled',
    assignedCrew: 'Rapid Asphalt Paving Squadron A',
    crewLeader: 'Eng. Ramesh Nair',
    estimatedCost: 88000,
    startDate: '2024-10-31',
    targetCompletionDate: '2024-11-04',
    requiredResources: [
      'Cold Planer / Milling Machine 2.0m width',
      'Electronic Paver Finisher',
      'Tandem Steel Roller (10 Ton)',
      'Pneumatic Tired Roller',
      'Polymer Modified Bitumen PMB-40 (650 MT)'
    ],
    justification: 'High-density pothole clusters and severe fatigue cracking on key BRT transport corridor. Night-shift execution required.',
    budgetStatus: 'Within Allocation'
  },
  {
    id: 'MNT-2024-103',
    segmentId: 'RD-104',
    roadName: 'Lakeview Boulevard East',
    ward: 'Ward 3 - Central Zone',
    title: 'Stormwater Culvert Enhancement & Subgrade Drainage Lift',
    maintenanceType: 'Drainage Rectification',
    priority: 'Critical',
    status: 'Under Review',
    assignedCrew: 'Municipal Drainage & Culvert Brigade',
    crewLeader: 'Supervisor K. Srinivas',
    estimatedCost: 62000,
    startDate: '2024-11-08',
    targetCompletionDate: '2024-11-22',
    requiredResources: [
      'Precast Concrete Box Culverts (900mm dia, 40m)',
      'Trenching Backhoe',
      'Crushed Stone Drainage Bedding',
      'Slurry Seal Paving Cart'
    ],
    justification: 'Prevent repeated 30cm flood inundation that destroys newly laid asphalt wearing courses.',
    budgetStatus: 'Contingency Draw'
  },
  {
    id: 'MNT-2024-104',
    segmentId: 'RD-109',
    roadName: 'Outer Ring Highway Exit 14-A',
    ward: 'Ward 10 - South East',
    title: 'High-Friction Anti-Skid Calcined Bauxite Surfacing',
    maintenanceType: 'Resurfacing',
    priority: 'High',
    status: 'Proposed',
    assignedCrew: 'Highways Safety Surface Specialists',
    crewLeader: 'Eng. Vijay Kumar',
    estimatedCost: 34000,
    startDate: '2024-11-12',
    targetCompletionDate: '2024-11-15',
    requiredResources: [
      'Shot Blaster Surface Preparation Rig',
      'Polyurethane / Epoxy Binder Spreader',
      'Calcined Bauxite Aggregate (1-3mm PSV > 70)'
    ],
    justification: 'Restore Skid Resistance Value from 38 to > 65 on curved deceleration ramp to mitigate wet weather slip accidents.',
    budgetStatus: 'Within Allocation'
  },
  {
    id: 'MNT-2024-098',
    segmentId: 'RD-105',
    roadName: 'Heritage Commercial Spine Road',
    ward: 'Ward 1 - Downtown Core',
    title: 'Pedestrian Crossing Paver Bedding Alignment & Edge Beam Restoration',
    maintenanceType: 'Crack Sealing',
    priority: 'Medium',
    status: 'Completed',
    assignedCrew: 'Civic Masonry Crew 2',
    crewLeader: 'Foreman Anthony D.',
    estimatedCost: 12500,
    actualCost: 11800,
    startDate: '2024-10-18',
    targetCompletionDate: '2024-10-21',
    actualCompletionDate: '2024-10-21',
    requiredResources: [
      'Vibratory Plate Compactor with rubber mat',
      'Fine Silica Joint Sand',
      'Precast Concrete Curb Units'
    ],
    justification: 'Resetting sunken pavers fronting retail shopping arcade.',
    completionNotes: 'All 85 sqm of displaced pavers reset over freshly compacted bedding sand. Kerb stones re-mortared. Surface tolerance < 3mm achieved.',
    budgetStatus: 'Within Allocation'
  }
];
