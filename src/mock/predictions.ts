import { RoadPrediction } from '../types';

export const INITIAL_PREDICTIONS: RoadPrediction[] = [
  {
    segmentId: 'RD-111',
    roadName: 'Wholesale Grain Market Approach',
    ward: 'Ward 7 - West Zone',
    riskScore: 92,
    priority: 'Critical',
    predictedCondition: 'Critical',
    predictionHorizon: '30 Days',
    confidenceScore: 94,
    uncertaintyMargin: '±2.4%',
    historicalTrend: [
      { month: 'May', actualRisk: 58, predictedRisk: 55 },
      { month: 'Jun', actualRisk: 68, predictedRisk: 66 },
      { month: 'Jul', actualRisk: 78, predictedRisk: 79 },
      { month: 'Aug', actualRisk: 86, predictedRisk: 85 },
      { month: 'Sep', actualRisk: 90, predictedRisk: 89 },
      { month: 'Oct (Current)', actualRisk: 92, predictedRisk: 92 },
      { month: 'Nov (Forecast)', actualRisk: 0, predictedRisk: 97 }
    ],
    factors: {
      damageSeverity: {
        name: 'Damage Severity & Cracking Index',
        score: 95,
        weight: 35,
        impact: 'High',
        description: 'Pavement distress density of 68% with recurrent structural subsidence in wheel tracks.'
      },
      trafficIntensity: {
        name: 'Traffic Volume & Axle Load',
        score: 90,
        weight: 25,
        impact: 'High',
        description: 'Repeated ESAL (Equivalent Single Axle Load) cycles from overloaded agricultural freight trucks.'
      },
      weatherExposure: {
        name: 'Monsoon Runoff & Flood Inundation',
        score: 92,
        weight: 20,
        impact: 'High',
        description: 'Persistent standing water due to 0% runoff slope into choked storm drain.'
      },
      repairHistory: {
        name: 'Maintenance Gap & Repair Age',
        score: 88,
        weight: 20,
        impact: 'High',
        description: 'Last full resurfacing was 34 months ago (overdue by 16 months for heavy freight zone).'
      }
    },
    recommendedAction: 'Immediate lane closure & full-depth base reconstruction',
    explanation: 'Risk score is driven by severe sub-base moisture saturation compounded by 3.8x baseline axle loading. Failure probability within 30 days is estimated at 94% without structural intervention.',
    dataFreshness: 'Updated 2 hours ago (Sensor + Inspector Survey)',
    modelVersion: 'v2.4-RandomForest-Ensemble',
    dataQualityNotes: 'High reliability: Verified by physical inspection INSP-2024-038 with core penetrometer ground truth.',
    lastUpdated: '2024-10-26 14:00'
  },
  {
    segmentId: 'RD-101',
    roadName: 'Mahatma Gandhi Marg (Inner Ring)',
    ward: 'Ward 4 - North Zone',
    riskScore: 89,
    priority: 'Critical',
    predictedCondition: 'Critical',
    predictionHorizon: '30 Days',
    confidenceScore: 91,
    uncertaintyMargin: '±3.1%',
    historicalTrend: [
      { month: 'May', actualRisk: 42, predictedRisk: 40 },
      { month: 'Jun', actualRisk: 52, predictedRisk: 50 },
      { month: 'Jul', actualRisk: 68, predictedRisk: 67 },
      { month: 'Aug', actualRisk: 79, predictedRisk: 78 },
      { month: 'Sep', actualRisk: 84, predictedRisk: 83 },
      { month: 'Oct (Current)', actualRisk: 89, predictedRisk: 89 },
      { month: 'Nov (Forecast)', actualRisk: 0, predictedRisk: 94 }
    ],
    factors: {
      damageSeverity: {
        name: 'Damage Severity & Cracking Index',
        score: 92,
        weight: 35,
        impact: 'High',
        description: '6 active reported potholes with wide alligator cracking propagation across lane 2.'
      },
      trafficIntensity: {
        name: 'Traffic Volume & Axle Load',
        score: 96,
        weight: 25,
        impact: 'High',
        description: 'Continuous metropolitan bus traffic & 52,000 Passenger Car Units per day.'
      },
      weatherExposure: {
        name: 'Monsoon Runoff & Flood Inundation',
        score: 85,
        weight: 20,
        impact: 'High',
        description: 'High runoff velocity overflowing roadside gutters during cloudbursts.'
      },
      repairHistory: {
        name: 'Maintenance Gap & Repair Age',
        score: 76,
        weight: 20,
        impact: 'Moderate',
        description: 'Patch repairs completed 18 months ago are now dislodging under heavy braking.'
      }
    },
    recommendedAction: 'Emergency deep milling, base stabilization & asphalt resurfacing',
    explanation: 'High traffic volume combined with asphalt stripping around potholes creates an accelerating domino degradation pattern.',
    dataFreshness: 'Updated 4 hours ago',
    modelVersion: 'v2.4-RandomForest-Ensemble',
    dataQualityNotes: 'Traffic sensor telemetry is complete (100% uptime); weather radar precipitation verified.',
    lastUpdated: '2024-10-26 12:30'
  },
  {
    segmentId: 'RD-104',
    roadName: 'Lakeview Boulevard East',
    ward: 'Ward 3 - Central Zone',
    riskScore: 83,
    priority: 'Critical',
    predictedCondition: 'Critical',
    predictionHorizon: '60 Days',
    confidenceScore: 88,
    uncertaintyMargin: '±4.5%',
    historicalTrend: [
      { month: 'May', actualRisk: 35, predictedRisk: 34 },
      { month: 'Jun', actualRisk: 46, predictedRisk: 48 },
      { month: 'Jul', actualRisk: 62, predictedRisk: 60 },
      { month: 'Aug', actualRisk: 74, predictedRisk: 72 },
      { month: 'Sep', actualRisk: 79, predictedRisk: 80 },
      { month: 'Oct (Current)', actualRisk: 83, predictedRisk: 83 },
      { month: 'Nov (Forecast)', actualRisk: 0, predictedRisk: 89 }
    ],
    factors: {
      damageSeverity: {
        name: 'Damage Severity & Cracking Index',
        score: 80,
        weight: 35,
        impact: 'High',
        description: 'Edge cracking and foundation erosion adjacent to stormwater retaining embankment.'
      },
      trafficIntensity: {
        name: 'Traffic Volume & Axle Load',
        score: 75,
        weight: 25,
        impact: 'Moderate',
        description: 'Moderate urban commuter flow with peak delivery van congestion.'
      },
      weatherExposure: {
        name: 'Monsoon Runoff & Flood Inundation',
        score: 98,
        weight: 20,
        impact: 'High',
        description: 'Submerged under water 4 times in September; water table remains at roadbed level.'
      },
      repairHistory: {
        name: 'Maintenance Gap & Repair Age',
        score: 82,
        weight: 20,
        impact: 'High',
        description: '27 months without seal coat or embankment retaining check.'
      }
    },
    recommendedAction: 'Drainage culvert reconstruction and road elevation lift',
    explanation: 'Lake seepage and poor runoff geometry are the dominant drivers. Asphalt repairs alone will fail within 60 days without hydrological drainage fix.',
    dataFreshness: 'Updated 6 hours ago',
    modelVersion: 'v2.4-RandomForest-Ensemble',
    dataQualityNotes: 'Water table estimation derived from municipal hydrological piezometers.',
    lastUpdated: '2024-10-26 10:15'
  },
  {
    segmentId: 'RD-102',
    roadName: 'Old Airport Expressway Section B',
    ward: 'Ward 8 - East District',
    riskScore: 78,
    priority: 'Critical',
    predictedCondition: 'Poor',
    predictionHorizon: '90 Days',
    confidenceScore: 89,
    uncertaintyMargin: '±3.6%',
    historicalTrend: [
      { month: 'May', actualRisk: 55, predictedRisk: 54 },
      { month: 'Jun', actualRisk: 60, predictedRisk: 61 },
      { month: 'Jul', actualRisk: 67, predictedRisk: 68 },
      { month: 'Aug', actualRisk: 72, predictedRisk: 71 },
      { month: 'Sep', actualRisk: 75, predictedRisk: 76 },
      { month: 'Oct (Current)', actualRisk: 78, predictedRisk: 78 },
      { month: 'Nov (Forecast)', actualRisk: 0, predictedRisk: 82 }
    ],
    factors: {
      damageSeverity: {
        name: 'Damage Severity & Cracking Index',
        score: 76,
        weight: 35,
        impact: 'High',
        description: 'Rut depth averaging 19mm along outer heavy-vehicle transit corridor.'
      },
      trafficIntensity: {
        name: 'Traffic Volume & Axle Load',
        score: 94,
        weight: 25,
        impact: 'High',
        description: 'Interstate airport logistics freight vehicles running round-the-clock.'
      },
      weatherExposure: {
        name: 'Monsoon Runoff & Flood Inundation',
        score: 65,
        weight: 20,
        impact: 'Moderate',
        description: 'Adequate longitudinal storm drains but cross-fall slope flattened by rutting.'
      },
      repairHistory: {
        name: 'Maintenance Gap & Repair Age',
        score: 74,
        weight: 20,
        impact: 'Moderate',
        description: 'Overlay was carried out 23 months ago with standard bitumen rather than polymer-modified.'
      }
    },
    recommendedAction: 'Structural mill and overlay with Polymer Modified Bitumen (PMB)',
    explanation: 'Rutting depth is rapidly approaching critical aquaplaning threshold (20mm). Pavement requires milling before winter rains.',
    dataFreshness: 'Updated 1 day ago',
    modelVersion: 'v2.4-RandomForest-Ensemble',
    dataQualityNotes: 'Laser profilometer mobile scan data ingested.',
    lastUpdated: '2024-10-25 18:20'
  },
  {
    segmentId: 'RD-109',
    roadName: 'Outer Ring Highway Exit 14-A',
    ward: 'Ward 10 - South East',
    riskScore: 76,
    priority: 'Critical',
    predictedCondition: 'Poor',
    predictionHorizon: '60 Days',
    confidenceScore: 86,
    uncertaintyMargin: '±4.0%',
    historicalTrend: [
      { month: 'May', actualRisk: 48, predictedRisk: 47 },
      { month: 'Jun', actualRisk: 55, predictedRisk: 56 },
      { month: 'Jul', actualRisk: 64, predictedRisk: 62 },
      { month: 'Aug', actualRisk: 69, predictedRisk: 70 },
      { month: 'Sep', actualRisk: 73, predictedRisk: 74 },
      { month: 'Oct (Current)', actualRisk: 76, predictedRisk: 76 },
      { month: 'Nov (Forecast)', actualRisk: 0, predictedRisk: 81 }
    ],
    factors: {
      damageSeverity: {
        name: 'Damage Severity & Cracking Index',
        score: 75,
        weight: 35,
        impact: 'High',
        description: 'Severe skid resistance loss and stone ravelling on tight curve.'
      },
      trafficIntensity: {
        name: 'Traffic Volume & Axle Load',
        score: 92,
        weight: 25,
        impact: 'High',
        description: 'High deceleration braking zone at interchange off-ramp.'
      },
      weatherExposure: {
        name: 'Monsoon Runoff & Flood Inundation',
        score: 60,
        weight: 20,
        impact: 'Moderate',
        description: 'Elevated ramp clears water well but wind-driven rain increases wet-skid hazard.'
      },
      repairHistory: {
        name: 'Maintenance Gap & Repair Age',
        score: 72,
        weight: 20,
        impact: 'Moderate',
        description: '29 months since last friction course treatment.'
      }
    },
    recommendedAction: 'Apply high-friction calcined bauxite epoxy surfacing',
    explanation: 'Safety critical priority: rapid loss of microtexture significantly elevates vehicle crash probability in wet weather.',
    dataFreshness: 'Updated 2 days ago',
    modelVersion: 'v2.4-RandomForest-Ensemble',
    dataQualityNotes: 'Skid resistance survey verified by Er. David Wilson.',
    lastUpdated: '2024-10-24 16:30'
  },
  {
    segmentId: 'RD-103',
    roadName: 'Industrial Corridor Link 7',
    ward: 'Ward 11 - South Hub',
    riskScore: 72,
    priority: 'High',
    predictedCondition: 'Poor',
    predictionHorizon: '90 Days',
    confidenceScore: 85,
    uncertaintyMargin: '±4.8%',
    historicalTrend: [
      { month: 'May', actualRisk: 44, predictedRisk: 42 },
      { month: 'Jun', actualRisk: 51, predictedRisk: 53 },
      { month: 'Jul', actualRisk: 59, predictedRisk: 61 },
      { month: 'Aug', actualRisk: 65, predictedRisk: 64 },
      { month: 'Sep', actualRisk: 68, predictedRisk: 69 },
      { month: 'Oct (Current)', actualRisk: 72, predictedRisk: 72 },
      { month: 'Nov (Forecast)', actualRisk: 0, predictedRisk: 77 }
    ],
    factors: {
      damageSeverity: {
        name: 'Damage Severity & Cracking Index',
        score: 71,
        weight: 35,
        impact: 'High',
        description: 'Edge breaks and emerging pothole clusters near factory dispatch bays.'
      },
      trafficIntensity: {
        name: 'Traffic Volume & Axle Load',
        score: 84,
        weight: 25,
        impact: 'High',
        description: 'Industrial heavy goods carriers and container flatbeds.'
      },
      weatherExposure: {
        name: 'Monsoon Runoff & Flood Inundation',
        score: 62,
        weight: 20,
        impact: 'Moderate',
        description: 'Flat topography leading to slow gutter runoff.'
      },
      repairHistory: {
        name: 'Maintenance Gap & Repair Age',
        score: 68,
        weight: 20,
        impact: 'Moderate',
        description: '21 months since patch maintenance.'
      }
    },
    recommendedAction: 'Shoulder edge beam installation & deep patching',
    explanation: 'Edge breakout is propagating inward. Installing concrete edge kerbs will contain lateral subgrade displacement.',
    dataFreshness: 'Updated 1 day ago',
    modelVersion: 'v2.4-RandomForest-Ensemble',
    dataQualityNotes: 'Traffic counts estimated from toll gantry sensor logs.',
    lastUpdated: '2024-10-25 11:00'
  },
  {
    segmentId: 'RD-108',
    roadName: 'Railway Colony Feeder Way',
    ward: 'Ward 2 - Central Railway',
    riskScore: 54,
    priority: 'High',
    predictedCondition: 'Fair',
    predictionHorizon: '180 Days',
    confidenceScore: 81,
    uncertaintyMargin: '±5.2%',
    historicalTrend: [
      { month: 'May', actualRisk: 38, predictedRisk: 37 },
      { month: 'Jun', actualRisk: 42, predictedRisk: 41 },
      { month: 'Jul', actualRisk: 46, predictedRisk: 47 },
      { month: 'Aug', actualRisk: 50, predictedRisk: 49 },
      { month: 'Sep', actualRisk: 52, predictedRisk: 53 },
      { month: 'Oct (Current)', actualRisk: 54, predictedRisk: 54 },
      { month: 'Nov (Forecast)', actualRisk: 0, predictedRisk: 59 }
    ],
    factors: {
      damageSeverity: {
        name: 'Damage Severity & Cracking Index',
        score: 52,
        weight: 35,
        impact: 'Moderate',
        description: 'Transverse thermal cracks with minimal raveling.'
      },
      trafficIntensity: {
        name: 'Traffic Volume & Axle Load',
        score: 55,
        weight: 25,
        impact: 'Moderate',
        description: 'Medium traffic consisting mainly of autorickshaws and delivery tempos.'
      },
      weatherExposure: {
        name: 'Monsoon Runoff & Flood Inundation',
        score: 72,
        weight: 20,
        impact: 'High',
        description: 'Low-lying depression near railway underpass prone to monsoon ponding.'
      },
      repairHistory: {
        name: 'Maintenance Gap & Repair Age',
        score: 42,
        weight: 20,
        impact: 'Low',
        description: 'Routine seal maintenance conducted 25 months ago.'
      }
    },
    recommendedAction: 'Crack sealing and micro-surfacing prior to winter',
    explanation: 'Early crack routing and rubberized bitumen sealing will prevent water intrusion into subgrade during the next seasonal rain spell.',
    dataFreshness: 'Updated 3 days ago',
    modelVersion: 'v2.4-RandomForest-Ensemble',
    dataQualityNotes: 'Moderate confidence: Ward 2 drainage plan update pending.',
    lastUpdated: '2024-10-23 09:40'
  },
  {
    segmentId: 'RD-105',
    roadName: 'Heritage Commercial Spine Road',
    ward: 'Ward 1 - Downtown Core',
    riskScore: 46,
    priority: 'Medium',
    predictedCondition: 'Fair',
    predictionHorizon: '180 Days',
    confidenceScore: 87,
    uncertaintyMargin: '±3.8%',
    historicalTrend: [
      { month: 'May', actualRisk: 32, predictedRisk: 30 },
      { month: 'Jun', actualRisk: 36, predictedRisk: 35 },
      { month: 'Jul', actualRisk: 40, predictedRisk: 41 },
      { month: 'Aug', actualRisk: 42, predictedRisk: 43 },
      { month: 'Sep', actualRisk: 45, predictedRisk: 44 },
      { month: 'Oct (Current)', actualRisk: 46, predictedRisk: 46 },
      { month: 'Nov (Forecast)', actualRisk: 0, predictedRisk: 49 }
    ],
    factors: {
      damageSeverity: {
        name: 'Damage Severity & Cracking Index',
        score: 45,
        weight: 35,
        impact: 'Moderate',
        description: 'Interlocking pavers showing minor differential settlement.'
      },
      trafficIntensity: {
        name: 'Traffic Volume & Axle Load',
        score: 68,
        weight: 25,
        impact: 'Moderate',
        description: 'High slow-moving delivery vehicle counts during morning shop loading.'
      },
      weatherExposure: {
        name: 'Monsoon Runoff & Flood Inundation',
        score: 30,
        weight: 20,
        impact: 'Low',
        description: 'Good gradient towards underground municipal drainage collectors.'
      },
      repairHistory: {
        name: 'Maintenance Gap & Repair Age',
        score: 38,
        weight: 20,
        impact: 'Low',
        description: 'Repaved 14 months ago; bedding sand stable.'
      }
    },
    recommendedAction: 'Targeted resetting of sunken pavers in pedestrian bays',
    explanation: 'Isolated paver settlement caused by delivery truck parking. Sub-base is intact; full resurfacing is unnecessary.',
    dataFreshness: 'Updated 2 days ago',
    modelVersion: 'v2.4-RandomForest-Ensemble',
    dataQualityNotes: 'High visual survey quality.',
    lastUpdated: '2024-10-24 11:20'
  }
];
