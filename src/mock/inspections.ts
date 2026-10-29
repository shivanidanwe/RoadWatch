import { Inspection } from '../types';

export const INITIAL_INSPECTIONS: Inspection[] = [
  {
    id: 'INSP-2024-001',
    segmentId: 'RD-101',
    roadName: 'Mahatma Gandhi Marg (Inner Ring)',
    ward: 'Ward 4 - North Zone',
    assignedInspector: 'Er. Rajesh Verma',
    inspectorRole: 'Senior Pavement Inspector',
    scheduledDate: '2024-10-30',
    type: 'Citizen Report Verification',
    priority: 'Critical',
    status: 'Scheduled',
    notes: 'Verify pothole severity near Metro Pillar 142 and assess asphalt core integrity.'
  },
  {
    id: 'INSP-2024-002',
    segmentId: 'RD-104',
    roadName: 'Lakeview Boulevard East',
    ward: 'Ward 3 - Central Zone',
    assignedInspector: 'Er. Meena Nair',
    inspectorRole: 'Hydrological Specialist',
    scheduledDate: '2024-10-28',
    type: 'Post-Severe-Weather',
    priority: 'Critical',
    status: 'In Progress',
    notes: 'Audit culvert siltation and roadbed water saturation following overnight rains.'
  },
  {
    id: 'INSP-2024-003',
    segmentId: 'RD-102',
    roadName: 'Old Airport Expressway',
    ward: 'Ward 8 - East District',
    assignedInspector: 'Er. Vikram Singh',
    inspectorRole: 'Structural Engineer',
    scheduledDate: '2024-11-05',
    type: 'Periodic Audit',
    priority: 'High',
    status: 'Scheduled',
    notes: 'Measure lane 1 wheel rut depth and profile asphalt fatigue micro-cracking.'
  },
  {
    id: 'INSP-2024-004',
    segmentId: 'RD-105',
    roadName: 'Tech Hub Boulevard',
    ward: 'Ward 6 - Silicon Corridor',
    assignedInspector: 'Er. Rajesh Verma',
    inspectorRole: 'Senior Pavement Inspector',
    scheduledDate: '2024-10-10',
    type: 'Periodic Audit',
    priority: 'Low',
    status: 'Completed',
    notes: 'Routine biannual concrete joint survey completed with satisfactory results.',
    findings: {
      observedCondition: 'Good',
      estimatedPci: 76,
      structuralIntegrityScore: 82,
      damageSpreadPercentage: 4,
      drainageCondition: 'Optimal',
      recommendedActions: [
        'Apply silicone joint sealant during next scheduled cycle'
      ],
      summaryNotes: 'Concrete slabs in excellent condition with zero structural distress.',
      photoUrls: [
        'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=600&q=80'
      ],
      completedAt: '2024-10-10 14:00'
    }
  }
];

