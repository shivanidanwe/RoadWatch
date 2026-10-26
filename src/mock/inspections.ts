import { Inspection } from '../types';

export const INITIAL_INSPECTIONS: Inspection[] = [
  {
    id: 'INSP-2024-041',
    segmentId: 'RD-101',
    roadName: 'Mahatma Gandhi Marg (Inner Ring)',
    ward: 'Ward 4 - North Zone',
    assignedInspector: 'Er. Rajesh Verma',
    inspectorRole: 'Senior Pavement Quality Inspector',
    scheduledDate: '2024-10-30',
    type: 'Citizen Report Verification',
    priority: 'Critical',
    status: 'Scheduled',
    notes: 'Verify multiple pothole complaints near Metro Pillar 142. Take core penetrometer readings and check stormwater runoff grades.'
  },
  {
    id: 'INSP-2024-042',
    segmentId: 'RD-104',
    roadName: 'Lakeview Boulevard East',
    ward: 'Ward 3 - Central Zone',
    assignedInspector: 'Er. Meena Nair',
    inspectorRole: 'Hydrological & Roadbed Specialist',
    scheduledDate: '2024-10-28',
    type: 'Post-Severe-Weather',
    priority: 'Critical',
    status: 'In Progress',
    notes: 'Investigating recurrent subgrade saturation following heavy thunderstorm. Assessing culvert intake siltation.'
  },
  {
    id: 'INSP-2024-038',
    segmentId: 'RD-111',
    roadName: 'Wholesale Grain Market Approach',
    ward: 'Ward 7 - West Zone',
    assignedInspector: 'Er. Rajesh Verma',
    inspectorRole: 'Senior Pavement Quality Inspector',
    scheduledDate: '2024-10-23',
    type: 'Structural Assessment',
    priority: 'Critical',
    status: 'Completed',
    notes: 'Complete deflection survey and visual distress mapping.',
    findings: {
      observedCondition: 'Critical',
      estimatedPci: 28,
      structuralIntegrityScore: 32,
      damageSpreadPercentage: 68,
      drainageCondition: 'Severely Compromised',
      recommendedActions: [
        'Immediate traffic diversion of multi-axle freight to secondary bypass',
        'Excavation down to sub-base level and geotextile installation',
        'Replacement of fractured concrete drainage catchments'
      ],
      summaryNotes: 'Sub-base completely liquefied along 120m stretch due to water stagnation underneath cracked bitumen. Reconstruction mandatory before upcoming festive logistics surge.',
      photoUrls: [
        'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=600&q=80'
      ],
      completedAt: '2024-10-23 15:30'
    }
  },
  {
    id: 'INSP-2024-039',
    segmentId: 'RD-109',
    roadName: 'Outer Ring Highway Exit 14-A',
    ward: 'Ward 10 - South East',
    assignedInspector: 'Er. David Wilson',
    inspectorRole: 'Highways & Safety Auditor',
    scheduledDate: '2024-10-22',
    type: 'Routine',
    priority: 'High',
    status: 'Reviewed',
    notes: 'Friction test on ramp curves and surface macrotexture verification.',
    findings: {
      observedCondition: 'Poor',
      estimatedPci: 46,
      structuralIntegrityScore: 58,
      damageSpreadPercentage: 35,
      drainageCondition: 'Partially Blocked',
      recommendedActions: [
        'Cold milling top 40mm wearing course',
        'Installation of high-friction calcined bauxite surfacing on ramp curve'
      ],
      summaryNotes: 'Skid resistance value (SRV) measured at 38, well below highway safety threshold of 55 for high-speed curved ramps.',
      photoUrls: [],
      completedAt: '2024-10-22 12:15'
    }
  },
  {
    id: 'INSP-2024-040',
    segmentId: 'RD-107',
    roadName: 'Greenfield Technology Parkway',
    ward: 'Ward 9 - Tech Corridor',
    assignedInspector: 'Er. Sunita Patel',
    inspectorRole: 'Municipal Asset Surveyor',
    scheduledDate: '2024-11-04',
    type: 'Routine',
    priority: 'Low',
    status: 'Scheduled',
    notes: 'Biannual expansion joint thermal displacement audit.'
  }
];
