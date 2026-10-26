import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/common/PageHeader';
import { INITIAL_MODELS } from '../../mock/models';
import { ModelMetric } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Cpu,
  RefreshCw,
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  BarChart2,
  Layers,
  Sliders,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

export const ModelMonitoringPage: React.FC = () => {
  const { addToast } = useApp();

  const [models, setModels] = useState<ModelMetric[]>(INITIAL_MODELS);
  const [activeModel, setActiveModel] = useState<ModelMetric>(INITIAL_MODELS[0]);
  const [showRetrainModal, setShowRetrainModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [isRetraining, setIsRetraining] = useState(false);

  const handleRetrainRequest = () => {
    setIsRetraining(true);
    setTimeout(() => {
      setIsRetraining(false);
      setShowRetrainModal(false);
      addToast('success', 'Retraining Job Queued', 'FastAPI worker scheduled async retraining on Scikit-learn random forest pipeline (Demo Simulation).');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Machine Learning Model Governance &amp; Monitoring"
        subtitle="Track statistical calibration metrics, feature importance weights, model drift detection, and automated retraining pipelines."
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Production Model v2.4 Active
          </span>
        }
        actions={
          <>
            <button
              onClick={() => setShowCompareModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#172033] bg-white border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition shadow-xs"
            >
              <GitCompare className="w-3.5 h-3.5 text-slate-600" />
              <span>Compare Versions</span>
            </button>
            <button
              onClick={() => setShowRetrainModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Request Model Retraining</span>
            </button>
          </>
        }
      />

      {/* Model Version Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {models.map(m => {
          const isSelected = activeModel.version === m.version;

          return (
            <div
              key={m.version}
              onClick={() => setActiveModel(m)}
              className={`bg-white rounded-xl border p-5 shadow-sm cursor-pointer transition-all ${
                isSelected ? 'border-blue-600 ring-2 ring-blue-600/10' : 'border-[#E2E8F0] hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-700 block">{m.version}</span>
                  <span className="text-[10px] text-[#64748B]">{m.algorithm.split('+')[0]}</span>
                </div>
                <StatusBadge status={m.status} />
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-[#64748B] uppercase font-bold">R² Score</span>
                  <p className="font-bold text-[#172033] mt-0.5">{m.r2Score}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] uppercase font-bold">MAE</span>
                  <p className="font-bold text-[#172033] mt-0.5">{m.mae}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] uppercase font-bold">Drift</span>
                  <p className={`font-bold mt-0.5 text-[11px] ${m.driftStatus === 'Stable' ? 'text-emerald-700' : 'text-amber-600'}`}>
                    {m.driftStatus.split(' ')[0]}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Model Deep Governance Panel */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-[#172033]">
                Model Specification: {activeModel.version}
              </h3>
              <StatusBadge status={activeModel.status} />
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">{activeModel.algorithm}</p>
          </div>

          <div className="text-xs text-[#64748B] flex items-center gap-4">
            <span>Trained: <strong>{activeModel.trainingDate}</strong></span>
            <span>&bull;</span>
            <span>Evaluated: <strong>{activeModel.evaluationDate}</strong></span>
          </div>
        </div>

        {/* 5 Core Evaluation Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] uppercase font-bold text-[#64748B]">Mean Absolute Error</span>
            <p className="text-xl font-bold text-[#172033] mt-1">{activeModel.mae}</p>
            <span className="text-[10px] text-[#94A3B8]">PCI points</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] uppercase font-bold text-[#64748B]">Root Mean Squared</span>
            <p className="text-xl font-bold text-[#172033] mt-1">{activeModel.rmse}</p>
            <span className="text-[10px] text-[#94A3B8]">RMSE error</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] uppercase font-bold text-[#64748B]">Coefficient R²</span>
            <p className="text-xl font-bold text-blue-700 mt-1">{activeModel.r2Score}</p>
            <span className="text-[10px] text-[#94A3B8]">Variance explained</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] uppercase font-bold text-[#64748B]">Accuracy</span>
            <p className="text-xl font-bold text-emerald-700 mt-1">{activeModel.accuracy}%</p>
            <span className="text-[10px] text-[#94A3B8]">Binary distress</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] uppercase font-bold text-[#64748B]">F1-Score</span>
            <p className="text-xl font-bold text-emerald-700 mt-1">{activeModel.f1Score}</p>
            <span className="text-[10px] text-[#94A3B8]">Harmonic balance</span>
          </div>
        </div>

        {/* Feature Importance Recharts Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                Feature Importance (Gini Impurity Decrease)
              </h4>
              <p className="text-[11px] text-[#64748B]">Relative influence on predicted pavement degradation</p>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activeModel.featureImportance}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 100, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                  <XAxis type="number" domain={[0, 0.5]} tick={{ fontSize: 9, fill: '#64748B' }} />
                  <YAxis type="category" dataKey="feature" tick={{ fontSize: 9, fill: '#64748B' }} />
                  <Tooltip formatter={(val: number) => [`${(val * 100).toFixed(1)}%`, 'Weight']} />
                  <Bar dataKey="importance" fill="#2563EB" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                Drift &amp; Data Quality Governance
              </h4>
              <p className="text-[11px] text-[#64748B]">Kolmogorov-Smirnov feature distribution test results</p>
            </div>

            <div className="divide-y divide-slate-100 border border-[#E2E8F0] rounded-xl overflow-hidden text-xs">
              <div className="p-3 flex items-center justify-between">
                <span className="text-[#64748B]">Overall Concept Drift Status:</span>
                <span className="font-semibold text-emerald-700">{activeModel.driftStatus}</span>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-[#64748B]">Training Sample Rows:</span>
                <strong className="text-[#172033]">{activeModel.trainingSamplesCount.toLocaleString()} ground-truth rows</strong>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-[#64748B]">Continuous Piezometer Readings:</span>
                <span className="text-[#172033]">Synchronized (0 missing values)</span>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-[#64748B]">Traffic Loop Sensor Ingestion:</span>
                <span className="text-[#172033]">100% active feed uptime</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[#64748B] text-[11px] leading-relaxed">
              <strong>Gov Transparency Standard:</strong> Model weights and precision benchmarks are validated against municipal physical core drill tests. Model predictions are advisory; civil sign-offs govern expenditure.
            </div>
          </div>
        </div>
      </div>

      {/* Retraining Request Modal */}
      {showRetrainModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E2E8F0] max-w-md w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#172033]">Dispatch Model Retraining Job</h3>
              <button onClick={() => setShowRetrainModal(false)} className="text-[#94A3B8] hover:text-[#172033]">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-[#64748B]">
                This will queue a retraining job on the FastAPI microservice using the latest 8,430 verified citizen distress reports and 320,400 inductive loop vehicle readings.
              </p>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 space-y-1 text-[11px]">
                <strong className="block">Target Pipeline:</strong>
                <span>Scikit-learn RandomForestRegressor + GeoPandas spatial kernel</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setShowRetrainModal(false)}
                className="px-3.5 py-1.5 border border-[#E2E8F0] rounded-lg font-medium text-[#64748B] hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRetraining}
                onClick={handleRetrainRequest}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
              >
                {isRetraining ? 'Queueing Job...' : 'Confirm Retrain Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Models Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E2E8F0] max-w-2xl w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#172033]">Compare Model Candidate Performance</h3>
              <button onClick={() => setShowCompareModal(false)} className="text-[#94A3B8] hover:text-[#172033]">
                ✕
              </button>
            </div>

            <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-4">Metric</th>
                    {models.map(m => (
                      <th key={m.version} className="py-2.5 px-4">
                        {m.version} {m.isActive && '(Active)'}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-[#172033]">R² Score</td>
                    {models.map(m => (
                      <td key={m.version} className="py-2.5 px-4 font-semibold text-blue-700">{m.r2Score}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-[#172033]">MAE (Points)</td>
                    {models.map(m => (
                      <td key={m.version} className="py-2.5 px-4">{m.mae}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-[#172033]">Binary Accuracy</td>
                    {models.map(m => (
                      <td key={m.version} className="py-2.5 px-4">{m.accuracy}%</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-[#172033]">Drift Status</td>
                    {models.map(m => (
                      <td key={m.version} className="py-2.5 px-4 font-medium text-slate-700">{m.driftStatus}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E2E8F0]">
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-lg text-xs"
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
