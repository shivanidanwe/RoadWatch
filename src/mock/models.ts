import { ModelMetric } from '../types';

export const INITIAL_MODELS: ModelMetric[] = [
  {
    version: 'v2.4-RandomForest-Ensemble',
    algorithm: 'Ensemble Gradient Boosted Trees + Spatial Autoregressive Regressor',
    trainingDate: '2024-10-15',
    evaluationDate: '2024-10-25',
    trainingSamplesCount: 24500,
    mae: 3.42,
    rmse: 4.88,
    r2Score: 0.892,
    accuracy: 91.4,
    f1Score: 0.902,
    driftStatus: 'Stable',
    featureImportance: [
      { feature: 'Pavement Condition Index (PCI)', importance: 0.32 },
      { feature: 'Cumulative Heavy Axle Loads (ESAL)', importance: 0.24 },
      { feature: 'Stormwater Runoff / Flood Recurrence', importance: 0.18 },
      { feature: 'Months Since Last Bituminous Overlay', importance: 0.14 },
      { feature: 'Citizen Distress Report Density (30d)', importance: 0.08 },
      { feature: 'Seasonal Soil Moisture Index', importance: 0.04 }
    ],
    isActive: true,
    status: 'Production Active'
  },
  {
    version: 'v2.3-XGBoost-Spatial',
    algorithm: 'XGBoost with GeoPandas Spatial Lag Kernels',
    trainingDate: '2024-07-20',
    evaluationDate: '2024-09-30',
    trainingSamplesCount: 21200,
    mae: 4.15,
    rmse: 5.62,
    r2Score: 0.854,
    accuracy: 87.8,
    f1Score: 0.865,
    driftStatus: 'Minor Drift Detected',
    featureImportance: [
      { feature: 'Pavement Condition Index (PCI)', importance: 0.35 },
      { feature: 'Cumulative Heavy Axle Loads (ESAL)', importance: 0.22 },
      { feature: 'Months Since Last Bituminous Overlay', importance: 0.18 },
      { feature: 'Citizen Distress Report Density (30d)', importance: 0.13 },
      { feature: 'Stormwater Runoff / Flood Recurrence', importance: 0.12 }
    ],
    isActive: false,
    status: 'Candidate Staged'
  },
  {
    version: 'v2.1-Ridge-Linear-Baseline',
    algorithm: 'Regularized Linear Multi-Task Regression',
    trainingDate: '2024-01-10',
    evaluationDate: '2024-04-15',
    trainingSamplesCount: 16000,
    mae: 6.84,
    rmse: 8.95,
    r2Score: 0.732,
    accuracy: 76.5,
    f1Score: 0.748,
    driftStatus: 'Significant Drift — Retraining Recommended',
    featureImportance: [
      { feature: 'Pavement Condition Index (PCI)', importance: 0.45 },
      { feature: 'Months Since Last Bituminous Overlay', importance: 0.30 },
      { feature: 'Traffic Volume Band', importance: 0.25 }
    ],
    isActive: false,
    status: 'Archived'
  }
];
