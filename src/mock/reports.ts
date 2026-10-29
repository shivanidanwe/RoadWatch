import { IssueReport } from '../types';

export const INITIAL_ISSUE_REPORTS: IssueReport[] = [
  {
    id: 'REP-2024-001',
    segmentId: 'RD-101',
    roadName: 'Mahatma Gandhi Marg (Inner Ring)',
    category: 'Pothole',
    severity: 'Critical',
    source: 'Citizen App',
    reportDate: '2024-10-24 08:30',
    status: 'Inspection Scheduled',
    assignedTeam: 'Field Squad Alpha',
    description: 'Deep pothole (approx 1.2m across, 14cm deep) in center lane near Metro Pillar 142.',
    coordinates: [12.9716, 77.5946],
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    reporterName: 'Arun K. Sharma',
    reporterContact: 'arun.k@civicmail.net',
    verifiedBy: 'Inspector Rajesh Verma',
    statusHistory: [
      { status: 'Submitted', timestamp: '2024-10-24 08:30', updatedBy: 'Citizen Mobile App' },
      { status: 'Verified', timestamp: '2024-10-24 10:45', updatedBy: 'Traffic Control Desk' },
      { status: 'Inspection Scheduled', timestamp: '2024-10-24 11:30', updatedBy: 'Field Operations' }
    ]
  },
  {
    id: 'REP-2024-002',
    segmentId: 'RD-104',
    roadName: 'Lakeview Boulevard East',
    category: 'Waterlogging',
    severity: 'Critical',
    source: 'Field Officer',
    reportDate: '2024-10-25 07:15',
    status: 'Verified',
    assignedTeam: 'Drainage Unit 3',
    description: 'Stormwater accumulation across 80m roadway after heavy rain due to clogged culvert grating.',
    coordinates: [12.9832, 77.6189],
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
    reporterName: 'Suresh Babu',
    verifiedBy: 'Suresh Babu',
    statusHistory: [
      { status: 'Submitted', timestamp: '2024-10-25 07:15', updatedBy: 'Suresh Babu' },
      { status: 'Verified', timestamp: '2024-10-25 08:00', updatedBy: 'Asst Engineer Raman' }
    ]
  },
  {
    id: 'REP-2024-003',
    segmentId: 'RD-102',
    roadName: 'Old Airport Expressway',
    category: 'Surface Rutting',
    severity: 'High',
    source: 'Patrol Vehicle',
    reportDate: '2024-10-25 14:00',
    status: 'Under Review',
    assignedTeam: 'Expressway Patrol',
    description: 'Wheel rutting exceeding 18mm along commercial bus lane causing vehicle hydroplaning risk.',
    coordinates: [12.9592, 77.6534],
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80',
    reporterName: 'Vikram Singh',
    statusHistory: [
      { status: 'Submitted', timestamp: '2024-10-25 14:00', updatedBy: 'Patrol Vehicle 4' },
      { status: 'Under Review', timestamp: '2024-10-25 14:30', updatedBy: 'Central Dispatch' }
    ]
  },
  {
    id: 'REP-2024-004',
    segmentId: 'RD-103',
    roadName: 'Industrial Corridor Link 7',
    category: 'Edge Damage',
    severity: 'Medium',
    source: 'Citizen App',
    reportDate: '2024-10-23 16:45',
    status: 'In Progress',
    assignedTeam: 'South Hub Maintenance',
    description: 'Pavement edge subsidence near logistics gate 2 under heavy container truck turning radius.',
    coordinates: [12.9121, 77.6446],
    imageUrl: 'https://images.unsplash.com/photo-1578991624414-276ef23a534f?auto=format&fit=crop&w=600&q=80',
    reporterName: 'Kavita Nair',
    statusHistory: [
      { status: 'Submitted', timestamp: '2024-10-23 16:45', updatedBy: 'Citizen App' },
      { status: 'In Progress', timestamp: '2024-10-24 09:00', updatedBy: 'Maintenance Crew' }
    ]
  },
  {
    id: 'REP-2024-005',
    segmentId: 'RD-106',
    roadName: 'Metro North Link',
    category: 'Cracking',
    severity: 'Low',
    source: 'Routine Survey',
    reportDate: '2024-10-22 11:20',
    status: 'Resolved',
    assignedTeam: 'Civil Maintenance 2',
    description: 'Minor joint displacement and hair crack sealing completed under metro viaduct pier 18.',
    coordinates: [13.0150, 77.5850],
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    reporterName: 'Survey Unit Beta',
    verifiedBy: 'Inspector Mehra',
    statusHistory: [
      { status: 'Submitted', timestamp: '2024-10-22 11:20', updatedBy: 'Survey Unit Beta' },
      { status: 'Resolved', timestamp: '2024-10-24 16:00', updatedBy: 'Civil Maintenance 2' }
    ]
  }
];

