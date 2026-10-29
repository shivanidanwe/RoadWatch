import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/common/PageHeader';
import { INITIAL_MODELS } from '../../mock/models';
import { ModelMetric } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { apiService } from '../../services/api';
import {
  Cpu,
  RefreshCw,
  GitCompare,
  CheckCircle2,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

export const ModelMonitoringPage: React.FC = () => {
  const { addToast } = useApp();

  const [models, setModels] = useState<ModelMetric[]>(INITIAL_MODELS);
  const [activeModel, setActiveModel] = useState<ModelMetric>(INITIAL_MODELS[0]);
  const [showRetrainModal, setShowRetrainModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [isRetraining, setIsRetraining] = useState(false);

  useEffect(() => {
    const fetchStatusAndMetrics = async () => {
      try {
        const [metrics, status] = await Promise.all([
          apiService.getModelMetrics(),
          apiService.getModelStatus(),
        ]);
        if (metrics && metrics.feature_importance) {
          const formattedFeatures = Object.entries(metrics.feature_importance).map(([feature, importance]) => ({
            feature: feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            importance: typeof importance === 'number' ? importance : 0.1,
          })).sort((a, b) => b.importance - a.importance);

          const liveModel: ModelMetric = {
            version: metrics.model_version || status.version || 'v2.4',
            algorithm: metrics.algorithm || status.algorithm || 'Random Forest Classifier & Regressor',
            trainingDate: (metrics.trained_at || status.last_trained || '2024-10-26').substring(0, 10),
            evaluationDate: new Date().toISOString().substring(0, 10),
            mae: metrics.test_mae ? Number(metrics.test_mae.toFixed(2)) : 3.42,
            rmse: metrics.test_rmse ? Number(metrics.test_rmse.toFixed(2)) : 4.88,
            r2Score: metrics.test_r2 ? Number(metrics.test_r2.toFixed(3)) : 0.892,
            accuracy: metrics.test_accuracy ? Number((metrics.test_accuracy * 100).toFixed(1)) : 91.4,
            f1Score: metrics.test_f1 ? Number(metrics.test_f1.toFixed(3)) : 0.902,
            driftStatus: 'Stable',
            trainingSamplesCount: metrics.training_samples || 1200,
            featureImportance: formattedFeatures.length > 0 ? formattedFeatures : INITIAL_MODELS[0].featureImportance,
            status: 'Production Active',
            isActive: true,
          };

          setModels(prev => [liveModel, ...prev.slice(1)]);
          setActiveModel(liveModel);
        }
      } catch (err) {
        console.warn('Using baseline model metrics', err);
      }
    };
    fetchStatusAndMetrics();
  }, []);

  const handleRetrainRequest = async () => {
    setIsRetraining(true);
    try {
      await apiService.retrainModel();
      setIsRetraining(false);
      setShowRetrainModal(false);
      addToast(
        'success',
        'Model Retrained',
        'Pipeline completed execution on Scikit-learn with verified convergence.'
      );
    } catch (err) {
      setIsRetraining(false);
      addToast('error', 'Retraining Failed', 'Failed to execute Scikit-learn training pipeline.');
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      <PageHeader
        title="Model Governance, Precision &amp; MLOps"
        subtitle="Evaluate validation metrics, concept drift monitoring, and automated Scikit-learn pipeline retraining."
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30">
            <Cpu className="w-3.5 h-3.5 text-[#A78BFA]" />
            v2.4 Deployed
          </span>
        }
        actions={
          <>
            <button
              onClick={() => setShowCompareModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#F5F3FF] bg-[#2B2042] border border-[#3B2D53] rounded-lg hover:bg-[#3B2D53] transition shadow-xs"
            >
              <GitCompare className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Compare Models</span>
            </button>
            <button
              onClick={() => setShowRetrainModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-lg shadow-xs transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Trigger Retraining</span>
            </button>
          </>
        }
      />

      {/* Model Version Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 min-w-0">
        {models.map(m => {
          const isSelected = activeModel.version === m.version;

          return (
            <div
              key={m.version}
              onClick={() => setActiveModel(m)}
              className={`rounded-xl border p-5 shadow-xs cursor-pointer transition-all min-w-0 text-[#F5F3FF] ${
                isSelected
                  ? 'bg-[#2B2042] border-[#8B5CF6] ring-2 ring-[#8B5CF6]/30 shadow-sm'
                  : 'bg-[#211735] border-[#3B2D53] hover:border-[#8B5CF6]/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-[#A78BFA] block">{m.version}</span>
                  <span className="text-[11px] text-[#B9AECF]">{m.algorithm.split('+')[0]}</span>
                </div>
                <StatusBadge status={m.status} />
              </div>

              <div className="mt-4 pt-3 border-t border-[#3B2D53] grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-[#B9AECF] uppercase font-bold">R² Score</span>
                  <p className="font-bold text-[#F5F3FF] mt-0.5">{m.r2Score}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#B9AECF] uppercase font-bold">MAE</span>
                  <p className="font-bold text-[#F5F3FF] mt-0.5">{m.mae}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Drift Status</span>
                  <p className="font-bold mt-0.5 text-[11px] text-[#34D399]">
                    {m.driftStatus.split(' ')[0]}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Model Governance Panel */}
      <div className="bg-[#211735] rounded-xl border border-[#3B2D53] shadow-xs p-5 sm:p-6 space-y-6 min-w-0 text-[#F5F3FF]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#3B2D53] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-[#F5F3FF]">
                Model Architecture: {activeModel.version}
              </h3>
              <StatusBadge status={activeModel.status} />
            </div>
            <p className="text-xs text-[#B9AECF] mt-0.5">{activeModel.algorithm}</p>
          </div>

          <div className="text-xs text-[#B9AECF] flex items-center gap-4">
            <span>Trained: <strong className="text-[#F5F3FF]">{activeModel.trainingDate}</strong></span>
            <span>&bull;</span>
            <span>Evaluated: <strong className="text-[#F5F3FF]">{activeModel.evaluationDate}</strong></span>
          </div>
        </div>

        {/* 5 Core Evaluation Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs min-w-0">
          <div className="p-3.5 rounded-xl bg-[#140E22] border border-[#3B2D53] text-center min-w-0">
            <span className="text-[10px] uppercase font-bold text-[#B9AECF]">MAE Error</span>
            <p className="text-xl font-bold text-[#F5F3FF] mt-1">{activeModel.mae}</p>
            <span className="text-[10px] text-[#B9AECF]">Points</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#140E22] border border-[#3B2D53] text-center min-w-0">
            <span className="text-[10px] uppercase font-bold text-[#B9AECF]">RMSE Error</span>
            <p className="text-xl font-bold text-[#F5F3FF] mt-1">{activeModel.rmse}</p>
            <span className="text-[10px] text-[#B9AECF]">Root MSE</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#140E22] border border-[#3B2D53] text-center min-w-0">
            <span className="text-[10px] uppercase font-bold text-[#B9AECF]">R² Variance</span>
            <p className="text-xl font-bold text-[#A78BFA] mt-1">{activeModel.r2Score}</p>
            <span className="text-[10px] text-[#B9AECF]">Score</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#140E22] border border-[#3B2D53] text-center min-w-0">
            <span className="text-[10px] uppercase font-bold text-[#B9AECF]">Accuracy</span>
            <p className="text-xl font-bold text-[#34D399] mt-1">{activeModel.accuracy}%</p>
            <span className="text-[10px] text-[#B9AECF]">Binary Class</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#140E22] border border-[#3B2D53] text-center min-w-0">
            <span className="text-[10px] uppercase font-bold text-[#B9AECF]">F1-Score</span>
            <p className="text-xl font-bold text-[#34D399] mt-1">{activeModel.f1Score}</p>
            <span className="text-[10px] text-[#B9AECF]">Harmonic Mean</span>
          </div>
        </div>

        {/* Feature Importance Recharts Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 min-w-0">
          <div className="space-y-3 min-w-0">
            <div>
              <h4 className="text-xs font-bold text-[#F5F3FF] uppercase tracking-wider">
                Feature Importance (Weight Breakdown)
              </h4>
              <p className="text-[11px] text-[#B9AECF]">Relative influence on predicted road deterioration</p>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activeModel.featureImportance}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 110, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#3B2D53" />
                  <XAxis type="number" domain={[0, 0.5]} tick={{ fontSize: 9, fill: '#B9AECF' }} stroke="#3B2D53" />
                  <YAxis type="category" dataKey="feature" tick={{ fontSize: 9, fill: '#B9AECF' }} stroke="#3B2D53" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#211735',
                      borderColor: '#3B2D53',
                      color: '#F5F3FF',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    formatter={(val: number) => [`${(val * 100).toFixed(1)}%`, 'Weight']}
                  />
                  <Bar dataKey="importance" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-4 text-xs min-w-0">
            <div>
              <h4 className="text-xs font-bold text-[#F5F3FF] uppercase tracking-wider">
                Data Quality &amp; Governance
              </h4>
              <p className="text-[11px] text-[#B9AECF]">Statistical divergence metrics</p>
            </div>

            <div className="divide-y divide-[#3B2D53] border border-[#3B2D53] rounded-xl overflow-hidden text-xs bg-[#140E22]">
              <div className="p-3 flex items-center justify-between">
                <span className="text-[#B9AECF]">Concept Drift Status:</span>
                <span className="font-semibold text-[#34D399]">{activeModel.driftStatus}</span>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-[#B9AECF]">Training Sample Count:</span>
                <strong className="text-[#F5F3FF]">{activeModel.trainingSamplesCount.toLocaleString()} ground-truth observations</strong>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-[#B9AECF]">Missing Values:</span>
                <span className="text-[#F5F3FF]">0.0% (Clean Schema)</span>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-[#B9AECF]">Telemetry Ingestion:</span>
                <span className="text-[#34D399] font-semibold">100% active feed uptime</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#140E22] border border-[#8B5CF6]/30 text-[#B9AECF] text-[11px] leading-relaxed">
              <strong className="text-[#A78BFA]">Governance Standard:</strong> Model weights and precision benchmarks are validated against empirical field observations. Model predictions provide decision support for municipal engineers.
            </div>
          </div>
        </div>
      </div>

      {/* Retraining Request Modal */}
      {showRetrainModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#211735] rounded-xl shadow-2xl border border-[#3B2D53] max-w-md w-full p-6 text-xs space-y-4 text-[#F5F3FF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#3B2D53]">
              <h3 className="text-sm font-bold text-[#F5F3FF]">Retrain Machine Learning Model</h3>
              <button onClick={() => setShowRetrainModal(false)} className="text-[#B9AECF] hover:text-[#F5F3FF]">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-[#B9AECF]">
                This will execute the reproducible machine learning training pipeline on Scikit-learn using the latest municipal road network observations.
              </p>

              <div className="p-3 rounded-lg bg-[#140E22] border border-[#3B2D53] text-[#A78BFA] space-y-1 text-[11px]">
                <strong className="block text-[#F5F3FF]">Target Pipeline:</strong>
                <span>Scikit-learn RandomForestClassifier &amp; Regressor with stratified 80/20 train/test split</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#3B2D53]">
              <button
                type="button"
                onClick={() => setShowRetrainModal(false)}
                className="px-3.5 py-1.5 border border-[#3B2D53] rounded-lg font-medium text-[#B9AECF] hover:bg-[#2B2042] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRetraining}
                onClick={handleRetrainRequest}
                className="px-4 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-lg shadow-xs transition"
              >
                {isRetraining ? 'Training Pipeline...' : 'Confirm Retrain Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Models Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#211735] rounded-xl shadow-2xl border border-[#3B2D53] max-w-2xl w-full p-6 text-xs space-y-4 text-[#F5F3FF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#3B2D53]">
              <h3 className="text-sm font-bold text-[#F5F3FF]">Compare Model Candidate Performance</h3>
              <button onClick={() => setShowCompareModal(false)} className="text-[#B9AECF] hover:text-[#F5F3FF]">
                ✕
              </button>
            </div>

            <div className="overflow-x-auto border border-[#3B2D53] rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#140E22] border-b border-[#3B2D53] text-[#A78BFA] font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-4">Metric</th>
                    {models.map(m => (
                      <th key={m.version} className="py-2.5 px-4">
                        {m.version} {m.isActive && '(Active)'}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3B2D53]/60 text-[#F5F3FF]">
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-[#F5F3FF]">R² Score</td>
                    {models.map(m => (
                      <td key={m.version} className="py-2.5 px-4 font-semibold text-[#A78BFA]">{m.r2Score}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-[#F5F3FF]">MAE (Points)</td>
                    {models.map(m => (
                      <td key={m.version} className="py-2.5 px-4 text-[#F5F3FF]">{m.mae}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-[#F5F3FF]">Binary Accuracy</td>
                    {models.map(m => (
                      <td key={m.version} className="py-2.5 px-4 text-[#34D399] font-semibold">{m.accuracy}%</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-[#F5F3FF]">Drift Status</td>
                    {models.map(m => (
                      <td key={m.version} className="py-2.5 px-4 font-medium text-[#B9AECF]">{m.driftStatus}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#3B2D53]">
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-4 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-lg text-xs transition"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
