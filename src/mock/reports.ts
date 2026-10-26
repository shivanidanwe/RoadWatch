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
    description: 'Deep pothole (approx 1.2m across, 14cm deep) in center lane near Metro Pillar 142. Two two-wheelers sustained tire rim damage this morning.',
    coordinates: [12.9716, 77.5946],
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    reporterName: 'Arun K. Sharma',
    reporterContact: 'arun.k@civicmail.net',
    verifiedBy: 'Inspector Rajesh Verma',
    statusHistory: [
      { status: 'Submitted', timestamp: '2024-10-24 08:30', updatedBy: 'Citizen Mobile App' },
      { status: 'Under Review', timestamp: '2024-10-24 09:15', updatedBy: 'Central Dispatch Officer Priya S.' },
      { status: 'Verified', timestamp: '2024-10-24 10:45', updatedBy: 'Traffic Police Traffic Control' },
      { status: 'Inspection Scheduled', timestamp: '2024-10-24 11:30', updatedBy: 'Senior Engineer K. Murthy', notes: 'Priority field inspection dispatched for exact dimensional survey.' }
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
    assignedTeam: 'Drainage Rapid Unit 3',
    description: 'Stormwater backflow accumulating 30cm water across 80 meters of roadway following overnight downpour. Silt blocking roadside catchment grating.',
    coordinates: [12.9832, 77.6189],
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
    reporterName: 'Suresh Babu (Ward 3 Supervisor)',
    verifiedBy: 'Suresh Babu',
    statusHistory: [
      { status: 'Submitted', timestamp: '2024-10-25 07:15', updatedBy: 'Suresh Babu' },
      { status: 'Under Review', timestamp: '2024-10-25 07:45', updatedBy: 'Stormwater Control Desk' },
      { status: 'Verified', timestamp: '2024-10-25 08:00', updatedBy: 'Asst Exec Engineer Raman' }
    ]
  },
  {
    id: 'REP-2024-003',
    segmentId: 'RD-111',
    roadName: 'Wholesale Grain Market Approach',
    category: 'Road subsidence',
    severity: 'Critical',
    source: 'Municipal Patrol',
    reportDate: '2024-10-22 14:20',
    status: 'Maintenance Planned',
    assignedTeam: 'Heavy Civil Works Team B',
    description: 'Pavement subgrade depression of 75mm along 15m strip directly fronting Gate 2. Grain haulage trailers scraping chassis during transit.',
    coordinates: [12.9610, 77.5510],
    imageUrl: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=600&q=80',
    reporterName: 'Patrol Vehicle Unit 07',
    statusHistory: [
      { status: 'Submitted', timestamp: '2024-10-22 14:20', updatedBy: 'Patrol Unit 07' },
      { status: 'Under Review', timestamp: '2024-10-22 15:00', updatedBy: 'Dispatcher S. Rao' },
      { status: 'Verified', timestamp: '2024-10-22 16:30', updatedBy: 'Inspector Meena Nair' },
      { status: 'Inspection Scheduled', timestamp: '2024-10-23 09:00', updatedBy: 'Ward 7 Office' },
      { status: 'Maintenance Planned', timestamp: '2024-10-24 16:00', updatedBy: 'Chief Engineer Office', notes: 'Integrated into FY24 Emergency Road Renewal Plan.' }
    ]
  },
  {
    id: 'REP-2024-004',
    segmentId: 'RD-102',
    roadName: 'Old Airport Expressway Section B',
    category: 'Surface cracking',
    severity: 'High',
    source: 'Automated Sensor',
    reportDate: '2024-10-23 11:05',
    status: 'Under Review',
    description: 'Laser Profilometer detection: longitudinal alligator cracking index elevated past 35% threshold along lane 1 over 220 meters.',
    coordinates: [12.9592, 77.6534],
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    reporterName: 'SmartRoad Laser Unit 04',
    statusHistory: [
      { status: 'Submitted', timestamp: '2024-10-23 11:05', updatedBy: 'IoT Ingestion Worker' },
      { status: 'Under Review', timestamp: '2024-10-23 13:00', updatedBy: 'Automated QC Pipeline' }
    ]
  },
  {
    id: 'REP-2024-005',
    segmentId: 'RD-109',
    roadName: 'Outer Ring Highway Exit 14-A',
    category: 'Surface deterioration',
    severity: 'High',
    source: 'Citizen App',
    reportDate: '2024-10-21 16:45',
    status: 'Verified',
    assignedTeam: 'Field Squad Beta',
    description: 'Coarse aggregate raveling and loose gravel scatter on deceleration slip road. Motorcycles losing traction during braking.',
    coordinates: [12.9198, 77.6715],
    reporterName: 'Kavita Menon',
    reporterContact: 'kavita.m@gmail.com',
    verifiedBy: 'Inspector David Wilson',
    statusHistory: [
      { status: 'Submitted', timestamp: '2024-10-21 16:45', updatedBy: 'Citizen App' },
      { status: 'Under Review', timestamp: '2024-10-22 08:30', updatedBy: 'Dispatcher S. Rao' },
      { status: 'Verified', timestamp: '2024-10-22 11:00', updatedBy: 'Inspector David Wilson' }
    ]
  },
  {
    id: 'REP-2024-006',
    segmentId: 'RD-105',
    roadName: 'Heritage Commercial Spine Road',
    category: 'Edge failure',
    severity: 'Medium',
    source: 'Citizen App',
    reportDate: '2024-10-18 10:10',
    status: 'Resolved',
    assignedTeam: 'Civic Masonry Crew 2',
    description: 'Curbside concrete paver edging collapsed over 4 meters near bookshop plaza causing tripping hazard for pedestrians.',
    coordinates: [12.9778, 77.5855],
    reporterName: 'Vijay Narang',
    verifiedBy: 'Inspector David Wilson',
    statusHistory: [
      { status: 'Submitted', timestamp: '2024-10-18 10:10', updatedBy: 'Citizen App' },
      { status: 'Under Review', timestamp: '2024-10-18 11:00', updatedBy: 'Dispatcher S. Rao' },
      { status: 'Verified', timestamp: '2024-10-18 14:30', updatedBy: 'Inspector David Wilson' },
      { status: 'Maintenance Planned', timestamp: '2024-10-19 09:00', updatedBy: 'Ward 1 Lead' },
      { status: 'Resolved', timestamp: '2024-10-21 17:00', updatedBy: 'Civic Masonry Crew 2', notes: 'Curbs reset, concrete haunching reinforced, paved joints re-mortared.' }
    ]
  },
  {
    id: 'REP-2024-007',
    segmentId: 'RD-103',
    roadName: 'Industrial Corridor Link 7',
    category: 'Pothole',
    severity: 'Medium',
    source: 'Field Officer',
    reportDate: '2024-10-25 15:40',
    status: 'Submitted',
    description: 'Twin potholes developing adjacent to stormwater manhole cover in northbound lane.',
    coordinates: [12.9121, 77.6446],
    reporterName: 'Naveen Chandra (Junior Engineer)',
    statusHistory: [
      { status: 'Submitted', timestamp: '2024-10-25 15:40', updatedBy: 'Junior Engineer Naveen' }
    ]
  }
];
