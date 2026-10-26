export const ANALYTICS_DATA = {
  // 1. Road condition trends over time (Quarterly)
  conditionTrends: [
    { period: '2023 Q1', Good: 48, Fair: 32, Poor: 14, Critical: 6 },
    { period: '2023 Q2', Good: 46, Fair: 34, Poor: 15, Critical: 5 },
    { period: '2023 Q3', Good: 39, Fair: 33, Poor: 20, Critical: 8 },
    { period: '2023 Q4', Good: 42, Fair: 35, Poor: 16, Critical: 7 },
    { period: '2024 Q1', Good: 44, Fair: 34, Poor: 16, Critical: 6 },
    { period: '2024 Q2', Good: 43, Fair: 32, Poor: 18, Critical: 7 },
    { period: '2024 Q3', Good: 38, Fair: 31, Poor: 21, Critical: 10 },
    { period: '2024 Q4 (Est)', Good: 40, Fair: 32, Poor: 19, Critical: 9 },
  ],

  // 2. Issue frequency by category
  issuesByCategory: [
    { category: 'Pothole', count: 142, percentage: 38 },
    { category: 'Surface cracking', count: 86, percentage: 23 },
    { category: 'Waterlogging', count: 64, percentage: 17 },
    { category: 'Surface deterioration', count: 42, percentage: 11 },
    { category: 'Road subsidence', count: 26, percentage: 7 },
    { category: 'Edge failure', count: 16, percentage: 4 },
  ],

  // 3. Risk distribution by ward
  riskByWard: [
    { ward: 'Ward 4 (North Zone)', avgRisk: 78, criticalCount: 3, highCount: 4, totalKm: 28.4 },
    { ward: 'Ward 7 (West Zone)', avgRisk: 74, criticalCount: 2, highCount: 5, totalKm: 32.1 },
    { ward: 'Ward 3 (Central Zone)', avgRisk: 68, criticalCount: 2, highCount: 3, totalKm: 22.0 },
    { ward: 'Ward 8 (East District)', avgRisk: 65, criticalCount: 2, highCount: 3, totalKm: 36.8 },
    { ward: 'Ward 10 (South East)', avgRisk: 61, criticalCount: 1, highCount: 4, totalKm: 25.6 },
    { ward: 'Ward 11 (South Hub)', avgRisk: 58, criticalCount: 1, highCount: 3, totalKm: 29.2 },
    { ward: 'Ward 1 (Downtown Core)', avgRisk: 42, criticalCount: 0, highCount: 2, totalKm: 18.5 },
    { ward: 'Ward 9 (Tech Corridor)', avgRisk: 28, criticalCount: 0, highCount: 1, totalKm: 42.0 },
  ],

  // 4. High-risk road clusters
  highRiskClusters: [
    { clusterName: 'Industrial Freight Gateway (Wards 7 & 11)', segmentCount: 8, avgRisk: 82, dominantFactor: 'Overweight Axle Load' },
    { clusterName: 'Monsoon Floodplain Lowlands (Wards 3 & 4)', segmentCount: 6, avgRisk: 79, dominantFactor: 'Water Table Saturation' },
    { clusterName: 'Highway Off-Ramp Deceleration Zones (Ward 10)', segmentCount: 4, avgRisk: 74, dominantFactor: 'Braking Shear Ravelling' },
    { clusterName: 'Old City Transit Corridor (Wards 1 & 2)', segmentCount: 5, avgRisk: 62, dominantFactor: 'Utility Trench Cuts' },
  ],

  // 5. Inspection completion rate (Monthly)
  inspectionCompletion: [
    { month: 'May', scheduled: 28, completed: 26, rate: 92.8 },
    { month: 'Jun', scheduled: 34, completed: 31, rate: 91.1 },
    { month: 'Jul', scheduled: 42, completed: 37, rate: 88.0 },
    { month: 'Aug', scheduled: 48, completed: 41, rate: 85.4 },
    { month: 'Sep', scheduled: 38, completed: 36, rate: 94.7 },
    { month: 'Oct', scheduled: 45, completed: 39, rate: 86.6 },
  ],

  // 6. Average issue resolution time (in days by severity)
  resolutionTimeBySeverity: [
    { severity: 'Critical', avgDaysTarget: 2.0, avgDaysActual: 3.2, compliancePct: 78 },
    { severity: 'High', avgDaysTarget: 7.0, avgDaysActual: 8.5, compliancePct: 82 },
    { severity: 'Medium', avgDaysTarget: 21.0, avgDaysActual: 18.2, compliancePct: 91 },
    { severity: 'Low', avgDaysTarget: 45.0, avgDaysActual: 36.4, compliancePct: 95 },
  ],

  // 7. Maintenance spending over time (Monthly in $k)
  maintenanceSpending: [
    { month: 'May', routineRepairs: 42, structuralOverlays: 95, emergencyPothole: 18, total: 155 },
    { month: 'Jun', routineRepairs: 38, structuralOverlays: 110, emergencyPothole: 24, total: 172 },
    { month: 'Jul', routineRepairs: 28, structuralOverlays: 80, emergencyPothole: 62, total: 170 },
    { month: 'Aug', routineRepairs: 31, structuralOverlays: 75, emergencyPothole: 85, total: 191 },
    { month: 'Sep', routineRepairs: 45, structuralOverlays: 120, emergencyPothole: 55, total: 220 },
    { month: 'Oct (MTD)', routineRepairs: 52, structuralOverlays: 140, emergencyPothole: 42, total: 234 },
  ],

  // 8. Planned versus completed maintenance (Count)
  plannedVsCompleted: [
    { month: 'May', planned: 12, completed: 11, deferred: 1 },
    { month: 'Jun', planned: 15, completed: 13, deferred: 2 },
    { month: 'Jul', planned: 14, completed: 10, deferred: 4 },
    { month: 'Aug', planned: 18, completed: 14, deferred: 4 },
    { month: 'Sep', planned: 16, completed: 15, deferred: 1 },
    { month: 'Oct', planned: 20, completed: 16, deferred: 4 },
  ],

  // 9. Risk-score distribution histogram (across all municipal segments)
  riskScoreDistribution: [
    { range: '0–10 (Minimal)', count: 24 },
    { range: '11–24 (Low)', count: 48 },
    { range: '25–39 (Moderate-Low)', count: 38 },
    { range: '40–49 (Medium)', count: 32 },
    { range: '50–64 (High-Moderate)', count: 26 },
    { range: '65–74 (High)', count: 18 },
    { range: '75–84 (Critical-Elevated)', count: 12 },
    { range: '85–100 (Immediate Critical)', count: 6 },
  ],

  // 10. Contributing risk factors across network
  networkFactorWeights: [
    { factor: 'Pavement Damage & Cracking', importance: 35, avgNetworkScore: 61 },
    { factor: 'Traffic Volume & Axle Loading', importance: 25, avgNetworkScore: 68 },
    { factor: 'Monsoon Rain & Drainage Exposure', importance: 20, avgNetworkScore: 54 },
    { factor: 'Maintenance Age & Surface Gap', importance: 20, avgNetworkScore: 59 },
  ]
};
