import { RoadPrediction } from '../types';

export const INITIAL_PREDICTIONS: RoadPrediction[] = [
  {
    segmentId: 'RD-101',
    roadName: 'Mahatma Gandhi Marg (Inner Ring)',
    ward: 'Ward 4 - North Zone',
    riskScore: 89,
    priority: 'Critical',
    predictedCondition: 'Critical',
    predictionHorizon: '30 Days',
    confidenceScore: 92,
    uncertaintyMargin: '±2.8%',
    historicalTrend: [
      { month: 'Jun', actualRisk: 52, predictedRisk: 50 },
      { month: 'Jul', actualRisk: 68, predictedRisk: 67 },
      { month: 'Aug', actualRisk: 79, predictedRisk: 78 },
      { month: 'Sep', actualRisk: 84, predictedRisk: 83 },
      { month: 'Oct (Current)', actualRisk: 89, predictedRisk: 89 },
      { month: 'Nov (Forecast)', actualRisk: 0, predictedRisk: 94 }
    ],
    factors: {
      damageSeverity: {
        name: 'Damage Severity & Cracks',
        score: 92,
        weight: 35,
        impact: 'High',
        description: '4 active pothole clusters with alligator cracking propagation across lane 2.'
      },
      trafficIntensity: {
        name: 'Traffic Volume & Axle Load',
        score: 95,
        weight: 25,
        impact: 'High',
        description: 'Metropolitan bus route carrying over 48,000 PCU daily.'
      },
      weatherExposure: {
        name: 'Monsoon Flood Inundation',
        score: 85,
        weight: 20,
        impact: 'High',
        description: 'Stormwater overflow saturates road base during high-intensity rain.'
      },
      repairHistory: {
        name: 'Maintenance Gap',
        score: 80,
        weight: 20,
        impact: 'High',
        description: 'Last resurfaced 18 months ago, exceeding recommended 12-month heavy cycle.'
      }
    },
    recommendedAction: 'Emergency deep milling, base stabilization & asphalt resurfacing',
    explanation: 'Urgent intervention needed: High axle loads and sub-base moisture saturation are accelerating cracking toward full structural failure.',
    dataFreshness: 'Updated 2h ago (Sensors + Inspector Verification)',
    modelVersion: 'v2.4-RandomForest-Ensemble',
    dataQualityNotes: 'High reliability: Verified by field inspection INSP-2024-001.',
    lastUpdated: '2024-10-26 14:00'
  },
  {
    segmentId: 'RD-104',
    roadName: 'Lakeview Boulevard East',
    ward: 'Ward 3 - Central Zone',
    riskScore: 83,
    priority: 'Critical',
    predictedCondition: 'Critical',
    predictionHorizon: '30 Days',
    confidenceScore: 89,
    uncertaintyMargin: '±3.2%',
    historicalTrend: [
      { month: 'Jun', actualRisk: 45, predictedRisk: 44 },
      { month: 'Jul', actualRisk: 58, predictedRisk: 60 },
      { month: 'Aug', actualRisk: 72, predictedRisk: 70 },
      { month: 'Sep', actualRisk: 79, predictedRisk: 78 },
      { month: 'Oct (Current)', actualRisk: 83, predictedRisk: 83 },
      { month: 'Nov (Forecast)', actualRisk: 0, predictedRisk: 88 }
    ],
    factors: {
      damageSeverity: {
        name: 'Damage Severity & Cracks',
        score: 86,
        weight: 35,
        impact: 'High',
        description: 'Edge subsidence and 3 severe potholes reported by patrol units.'
      },
      trafficIntensity: {
        name: 'Traffic Volume & Axle Load',
        score: 75,
        weight: 25,
        impact: 'Moderate',
        description: 'Substantial commuter traffic connecting central business district.'
      },
      weatherExposure: {
        name: 'Monsoon Flood Inundation',
        score: 94,
        weight: 20,
        impact: 'High',
        description: 'Frequent lake level rise backs up into drainage culverts.'
      },
      repairHistory: {
        name: 'Maintenance Gap',
        score: 78,
        weight: 20,
        impact: 'High',
        description: '26 months since last full asphalt overlay.'
      }
    },
    recommendedAction: 'Stormwater culvert reconstruction & full pavement rehabilitation',
    explanation: 'Sub-base soil erosion from lake water backflow is the primary cause of sudden surface collapse risk.',
    dataFreshness: 'Updated 3h ago (Patrol Survey)',
    modelVersion: 'v2.4-RandomForest-Ensemble',
    dataQualityNotes: 'High reliability: Cross-referenced with citizen drainage reports.',
    lastUpdated: '2024-10-26 13:15'
  },
  {
    segmentId: 'RD-102',
    roadName: 'Old Airport Expressway',
    ward: 'Ward 8 - East District',
    riskScore: 78,
    priority: 'Critical',
    predictedCondition: 'Poor',
    predictionHorizon: '60 Days',
    confidenceScore: 91,
    uncertaintyMargin: '±2.5%',
    historicalTrend: [
      { month: 'Jun', actualRisk: 50, predictedRisk: 48 },
      { month: 'Jul', actualRisk: 60, predictedRisk: 59 },
      { month: 'Aug', actualRisk: 68, predictedRisk: 67 },
      { month: 'Sep', actualRisk: 74, predictedRisk: 73 },
      { month: 'Oct (Current)', actualRisk: 78, predictedRisk: 78 },
      { month: 'Nov (Forecast)', actualRisk: 0, predictedRisk: 83 }
    ],
    factors: {
      damageSeverity: {
        name: 'Damage Severity & Cracks',
        score: 76,
        weight: 35,
        impact: 'High',
        description: '18mm wheel-path rutting and longitudinal micro-cracks.'
      },
      trafficIntensity: {
        name: 'Traffic Volume & Axle Load',
        score: 92,
        weight: 25,
        impact: 'High',
        description: 'Continuous night freight logistics corridor.'
      },
      weatherExposure: {
        name: 'Monsoon Flood Inundation',
        score: 65,
        weight: 20,
        impact: 'Moderate',
        description: 'Moderate surface runoff with functioning side ditches.'
      },
      repairHistory: {
        name: 'Maintenance Gap',
        score: 72,
        weight: 20,
        impact: 'Moderate',
        description: '23 months since last bituminous maintenance.'
      }
    },
    recommendedAction: 'Structural asphalt overlay with polymer-modified binder',
    explanation: 'Repetitive heavy axle load is consolidating the surface layer; mill-and-fill will restore skid resistance.',
    dataFreshness: 'Updated 5h ago (Automated Traffic Counters)',
    modelVersion: 'v2.4-RandomForest-Ensemble',
    dataQualityNotes: 'Verified with Weigh-In-Motion sensors.',
    lastUpdated: '2024-10-26 11:30'
  },
  {
    segmentId: 'RD-103',
    roadName: 'Industrial Corridor Link 7',
    ward: 'Ward 11 - South Hub',
    riskScore: 72,
    priority: 'High',
    predictedCondition: 'Poor',
    predictionHorizon: '60 Days',
    confidenceScore: 88,
    uncertaintyMargin: '±3.5%',
    historicalTrend: [
      { month: 'Jun', actualRisk: 46, predictedRisk: 45 },
      { month: 'Jul', actualRisk: 54, predictedRisk: 53 },
      { month: 'Aug', actualRisk: 62, predictedRisk: 61 },
      { month: 'Sep', actualRisk: 67, predictedRisk: 68 },
      { month: 'Oct (Current)', actualRisk: 72, predictedRisk: 72 },
      { month: 'Nov (Forecast)', actualRisk: 0, predictedRisk: 76 }
    ],
    factors: {
      damageSeverity: {
        name: 'Damage Severity & Cracks',
        score: 70,
        weight: 35,
        impact: 'Moderate',
        description: 'Localized edge raveling and 2 isolated pothole clusters.'
      },
      trafficIntensity: {
        name: 'Traffic Volume & Axle Load',
        score: 84,
        weight: 25,
        impact: 'High',
        description: 'Heavy industrial vehicle turnaround zone.'
      },
      weatherExposure: {
        name: 'Monsoon Flood Inundation',
        score: 60,
        weight: 20,
        impact: 'Moderate',
        description: 'Adequate culvert gradient with localized ponding.'
      },
      repairHistory: {
        name: 'Maintenance Gap',
        score: 68,
        weight: 20,
        impact: 'Moderate',
        description: '21 months since edge seal coat was placed.'
      }
    },
    recommendedAction: 'Selective pothole patching, edge reinforcement & seal coat',
    explanation: 'Truck turning maneuvers are breaking up outer lane edges; reinforced shoulder apron will halt degradation.',
    dataFreshness: 'Updated 6h ago',
    modelVersion: 'v2.4-RandomForest-Ensemble',
    dataQualityNotes: 'Standard confidence rating.',
    lastUpdated: '2024-10-26 10:00'
  },
  {
    segmentId: 'RD-106',
    roadName: 'Metro North Link',
    ward: 'Ward 2 - Uptown',
    riskScore: 52,
    priority: 'Medium',
    predictedCondition: 'Fair',
    predictionHorizon: '90 Days',
    confidenceScore: 90,
    uncertaintyMargin: '±2.2%',
    historicalTrend: [
      { month: 'Jun', actualRisk: 38, predictedRisk: 37 },
      { month: 'Jul', actualRisk: 42, predictedRisk: 43 },
      { month: 'Aug', actualRisk: 46, predictedRisk: 46 },
      { month: 'Sep', actualRisk: 49, predictedRisk: 50 },
      { month: 'Oct (Current)', actualRisk: 52, predictedRisk: 52 },
      { month: 'Nov (Forecast)', actualRisk: 0, predictedRisk: 55 }
    ],
    factors: {
      damageSeverity: {
        name: 'Damage Severity & Cracks',
        score: 48,
        weight: 35,
        impact: 'Moderate',
        description: 'Minor joint spalling and fine hairline cracks.'
      },
      trafficIntensity: {
        name: 'Traffic Volume & Axle Load',
        score: 55,
        weight: 25,
        impact: 'Moderate',
        description: 'Moderate passenger car and light commercial volume.'
      },
      weatherExposure: {
        name: 'Monsoon Flood Inundation',
        score: 45,
        weight: 20,
        impact: 'Low',
        description: 'Elevated terrain with fast stormwater disposal.'
      },
      repairHistory: {
        name: 'Maintenance Gap',
        score: 56,
        weight: 20,
        impact: 'Moderate',
        description: '16 months since joint sealant renewal.'
      }
    },
    recommendedAction: 'Localized crack sealing & surface grinding',
    explanation: 'Concrete slabs are structurally solid; preventative joint sealing will keep water out of base layers.',
    dataFreshness: 'Updated 1 day ago',
    modelVersion: 'v2.4-RandomForest-Ensemble',
    dataQualityNotes: 'High visual survey quality.',
    lastUpdated: '2024-10-25 16:30'
  },
  {
    segmentId: 'RD-105',
    roadName: 'Tech Hub Boulevard',
    ward: 'Ward 6 - Silicon Corridor',
    riskScore: 28,
    priority: 'Low',
    predictedCondition: 'Good',
    predictionHorizon: '90 Days',
    confidenceScore: 95,
    uncertaintyMargin: '±1.8%',
    historicalTrend: [
      { month: 'Jun', actualRisk: 22, predictedRisk: 21 },
      { month: 'Jul', actualRisk: 24, predictedRisk: 23 },
      { month: 'Aug', actualRisk: 26, predictedRisk: 25 },
      { month: 'Sep', actualRisk: 27, predictedRisk: 27 },
      { month: 'Oct (Current)', actualRisk: 28, predictedRisk: 28 },
      { month: 'Nov (Forecast)', actualRisk: 0, predictedRisk: 30 }
    ],
    factors: {
      damageSeverity: {
        name: 'Damage Severity & Cracks',
        score: 20,
        weight: 35,
        impact: 'Low',
        description: 'Zero potholes; concrete slabs in excellent condition.'
      },
      trafficIntensity: {
        name: 'Traffic Volume & Axle Load',
        score: 50,
        weight: 25,
        impact: 'Moderate',
        description: 'High commuter volume but light vehicle weight class.'
      },
      weatherExposure: {
        name: 'Monsoon Flood Inundation',
        score: 25,
        weight: 20,
        impact: 'Low',
        description: 'Engineered underground stormwater drains.'
      },
      repairHistory: {
        name: 'Maintenance Gap',
        score: 18,
        weight: 20,
        impact: 'Low',
        description: 'Recently constructed with durable concrete specifications.'
      }
    },
    recommendedAction: 'Routine visual inspection & joint seal maintenance',
    explanation: 'Pavement performance is optimal with low probability of deterioration over next 180 days.',
    dataFreshness: 'Updated 2 days ago',
    modelVersion: 'v2.4-RandomForest-Ensemble',
    dataQualityNotes: 'Sensor telemetry operational.',
    lastUpdated: '2024-10-24 15:00'
  }
];
