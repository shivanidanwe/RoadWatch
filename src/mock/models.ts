import { ModelMetric } from '../types';

export const INITIAL_MODELS: ModelMetric[] = [
  {
    version: 'v2.4-RandomForest-Ensemble',
    algorithm: 'Random Forest Ensemble (Classifier & Regressor)',
    trainingDate: '2024-10-15',
    evaluationDate: '2024-10-25',
    trainingSamplesCount: 1200,
    mae: 3.42,
    rmse: 4.88,
    r2Score: 0.892,
    accuracy: 91.4,
    f1Score: 0.902,
    driftStatus: 'Stable',
    featureImportance: [
      { feature: 'Pavement Condition (PCI)', importance: 0.32 },
      { feature: 'Traffic Volume & Axle Load', importance: 0.25 },
      { feature: 'Monsoon Runoff & Flood Risk', importance: 0.20 },
      { feature: 'Time Since Last Repair', importance: 0.15 },
      { feature: 'Recent Report Frequency', importance: 0.08 }
    ],
    isActive: true,
    status: 'Production Active'
  },
  {
    version: 'v1.0-Linear-Baseline',
    algorithm: 'Linear Regression Baseline',
    trainingDate: '2024-03-10',
    evaluationDate: '2024-04-15',
    trainingSamplesCount: 850,
    mae: 6.84,
    rmse: 8.95,
    r2Score: 0.732,
    accuracy: 76.5,
    f1Score: 0.748,
    driftStatus: 'Stable',
    featureImportance: [
      { feature: 'Pavement Condition (PCI)', importance: 0.40 },
      { feature: 'Traffic Volume', importance: 0.25 },
      { feature: 'Repair History', importance: 0.20 },
      { feature: 'Weather Exposure', importance: 0.15 }
    ],
    isActive: false,
    status: 'Archived Baseline'
  }
];

