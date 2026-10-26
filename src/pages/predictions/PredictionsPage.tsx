import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { ConditionBadge } from '../../components/common/ConditionBadge';
import { RoadPrediction, PriorityLevel } from '../../types';
import {
  TrendingUp,
  Cpu,
  Sparkles,
  Play,
  Download,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sliders,
  BarChart2,
  Calendar,
  Layers,
  HelpCircle,
  GitCompare,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export const PredictionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { predictions, settings, runPredictionSimulation, addToast } = useApp();

  const [selectedPrediction, setSelectedPrediction] = useState<RoadPrediction | null>(
    predictions[0] || null
  );
  const [isRunning, setIsRunning] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareTarget, setCompareTarget] = useState<RoadPrediction | null>(predictions[1] || null);

  const totalEvaluated = predictions.length;
  const highRiskCount = predictions.filter(p => p.riskScore >= 75).length;
  const reviewRequiredCount = predictions.filter(p => p.confidenceScore < 85).length;

  const handleRunModel = async () => {
    setIsRunning(true);
    try {
      await runPredictionSimulation();
    } finally {
      setIsRunning(false);
    }
  };

  const columns: Column<RoadPrediction>[] = [
    {
      key: 'segmentId',
      header: 'Segment ID',
      sortable: true,
      width: '110px',
      render: p => (
        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {p.segmentId}
        </span>
      ),
    },
    {
      key: 'roadName',
      header: 'Road Segment',
      sortable: true,
      render: p => (
        <div>
          <span className="font-bold text-[#172033] block">{p.roadName}</span>
          <span className="text-[11px] text-[#64748B]">{p.ward}</span>
        </div>
      ),
    },
    {
      key: 'riskScore',
      header: 'Risk Score (0–100)',
      sortable: true,
      align: 'center',
      render: p => (
        <div className="flex items-center justify-center gap-1.5">
          <span className={`text-sm font-extrabold ${p.riskScore >= 75 ? 'text-red-600' : p.riskScore >= 50 ? 'text-orange-600' : 'text-blue-700'}`}>
            {p.riskScore}
          </span>
          <span className="text-[10px] text-[#94A3B8]">/ 100</span>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority Level',
      sortable: true,
      render: p => <PriorityBadge priority={p.priority} />,
    },
    {
      key: 'predictedCondition',
      header: 'Forecast Condition',
      sortable: true,
      render: p => <ConditionBadge condition={p.predictedCondition} />,
    },
    {
      key: 'predictionHorizon',
      header: 'Horizon',
      sortable: true,
      render: p => <span className="text-xs text-[#64748B] font-medium">{p.predictionHorizon}</span>,
    },
    {
      key: 'confidenceScore',
      header: 'Confidence',
      sortable: true,
      align: 'right',
      render: p => (
        <div className="text-right">
          <span className="font-semibold text-[#172033]">{p.confidenceScore}%</span>
          <span className="text-[10px] text-[#94A3B8] block">{p.uncertaintyMargin}</span>
        </div>
      ),
    },
    {
      key: 'lastUpdated',
      header: 'Last Scored',
      sortable: true,
      render: p => <span className="text-[11px] text-[#64748B]">{p.lastUpdated.substring(5)}</span>,
    },
    {
      key: 'actions',
      header: 'Explainability',
      align: 'right',
      render: p => (
        <button
          onClick={e => {
            e.stopPropagation();
            setSelectedPrediction(p);
          }}
          className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          Inspect Why &rarr;
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Predictive Risk Assessment &amp; Explainability"
        subtitle="Transparent machine learning model predictions estimating road degradation horizons, contributing stress factors, and advisory maintenance rankings."
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            Model: v2.4-RandomForest-Ensemble (Demo Mode)
          </span>
        }
        actions={
          <>
            <button
              onClick={() => setShowCompareModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#172033] bg-white border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition shadow-xs"
            >
              <GitCompare className="w-3.5 h-3.5 text-slate-600" />
              <span>Compare Predictions</span>
            </button>
            <button
              onClick={handleRunModel}
              disabled={isRunning}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRunning ? 'Computing Model...' : 'Run Prediction Pipeline'}</span>
            </button>
          </>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              Segments Evaluated
            </span>
            <Cpu className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-[#172033] mt-2">{totalEvaluated}</div>
          <span className="text-[11px] text-[#94A3B8] mt-1 block">100% spatial inventory evaluated</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              High / Critical Risk Segments
            </span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600 mt-2">{highRiskCount}</div>
          <span className="text-[11px] text-red-600/80 mt-1 block">Risk score &ge; 75 (Urgent action)</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              Predictions Requiring Review
            </span>
            <HelpCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{reviewRequiredCount}</div>
          <span className="text-[11px] text-[#94A3B8] mt-1 block">Confidence &lt; 85% or telemetry gap</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              Latest Model Evaluation
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">91.4%</div>
          <span className="text-[11px] text-[#94A3B8] mt-1 block">MAE: 3.42 points &bull; R²: 0.892</span>
        </div>
      </div>

      {/* Main Prediction Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#172033] uppercase tracking-wider">
            Predicted Risk Rankings (Advisory Framework)
          </h2>
          <span className="text-xs text-[#64748B]">Click any row to display explainability breakdown below</span>
        </div>

        <DataTable
          columns={columns}
          data={predictions}
          searchKey={(p: RoadPrediction) => `${p.segmentId} ${p.roadName} ${p.ward}`}
          searchPlaceholder="Search predictions by segment ID or road name..."
          exportFileName="roadwatch-predictions"
          onRowClick={p => setSelectedPrediction(p)}
        />
      </div>

      {/* Risk Detail & Explainability Panel */}
      {selectedPrediction && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden animate-in fade-in duration-150">
          <div className="p-5 border-b border-[#E2E8F0] bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                  {selectedPrediction.segmentId}
                </span>
                <span className="text-xs text-[#64748B]">{selectedPrediction.ward}</span>
              </div>
              <h3 className="text-base font-bold text-[#172033] mt-1">
                Risk Explainability Analysis: {selectedPrediction.roadName}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <PriorityBadge priority={selectedPrediction.priority} />
              <div className="px-3 py-1 bg-white rounded-lg border border-[#E2E8F0] text-xs">
                <span className="text-[#64748B]">Confidence: </span>
                <strong className="text-[#172033]">{selectedPrediction.confidenceScore}%</strong>{' '}
                <span className="text-[#94A3B8]">({selectedPrediction.uncertaintyMargin})</span>
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Drivers breakdown and Historical Chart */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recommendation Narrative */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Why was this road assigned a {selectedPrediction.priority} priority?
                  </span>
                  <span className="text-[10px] text-blue-800 font-mono">Horizon: {selectedPrediction.predictionHorizon}</span>
                </div>
                <p className="text-[#172033] leading-relaxed font-medium">
                  {selectedPrediction.explanation}
                </p>
                <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px] text-blue-900">
                  <span>Advisory Recommended Action: <strong>{selectedPrediction.recommendedAction}</strong></span>
                  <button
                    onClick={() => navigate(`/map?select=${selectedPrediction.segmentId}`)}
                    className="font-semibold underline hover:text-blue-700"
                  >
                    Locate on Map &rarr;
                  </button>
                </div>
              </div>

              {/* 4 Contributing Factors Cards */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                  Weighted Factor Decomposition
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {Object.entries(selectedPrediction.factors).map(([key, factor]) => (
                    <div key={key} className="p-3.5 rounded-xl border border-[#E2E8F0] bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#172033] truncate">{factor.name}</span>
                        <span className="text-xs font-extrabold text-blue-700">{factor.score} / 100</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${factor.score >= 80 ? 'bg-red-600' : factor.score >= 60 ? 'bg-orange-500' : 'bg-blue-600'}`}
                          style={{ width: `${factor.score}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-[#64748B] leading-snug">{factor.description}</p>
                      <span className="text-[10px] font-semibold text-[#94A3B8]">Weight: {factor.weight}% of scoring matrix</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historical Trend Chart */}
              <div className="p-4 rounded-xl border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                      6-Month Historical Condition &amp; Risk Trend
                    </h4>
                    <p className="text-[11px] text-[#64748B]">Actual past inspections compared with ML projection</p>
                  </div>
                  <span className="text-xs text-blue-600 font-semibold">{selectedPrediction.segmentId}</span>
                </div>

                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedPrediction.historicalTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                      <YAxis domain={[20, 100]} tick={{ fontSize: 10, fill: '#64748B' }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="actualRisk"
                        name="Actual Measured Risk"
                        stroke="#2563EB"
                        strokeWidth={2.5}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="predictedRisk"
                        name="Model Forecast"
                        stroke="#DC2626"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right Column: Model Governance & Data Freshness */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#E2E8F0] bg-slate-50 space-y-3 text-xs">
                <h4 className="font-bold text-[#172033] uppercase tracking-wider text-[10px]">
                  Model Metadata &amp; Governance
                </h4>
                <div className="divide-y divide-slate-200 text-xs">
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-[#64748B]">Active Model:</span>
                    <strong className="text-[#172033] font-mono text-[11px]">{selectedPrediction.modelVersion}</strong>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-[#64748B]">Data Freshness:</span>
                    <span className="text-[#172033]">{selectedPrediction.dataFreshness}</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-[#64748B]">Prediction Horizon:</span>
                    <strong className="text-[#172033]">{selectedPrediction.predictionHorizon}</strong>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-[#64748B]">Confidence Score:</span>
                    <strong className="text-emerald-700">{selectedPrediction.confidenceScore}%</strong>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                  <strong className="block text-[10px] uppercase font-bold text-amber-800">
                    Data Quality &amp; Uncertainty Note:
                  </strong>
                  <p className="mt-0.5">{selectedPrediction.dataQualityNotes}</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-100 text-[#64748B] text-[10px] leading-relaxed">
                  <strong>Advisory Disclaimer:</strong> Predictions represent model estimates from calibrated municipal features. Maintenance allocations require final sign-off by authorized civil engineers.
                </div>
              </div>

              {/* Thresholds Reference */}
              <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#172033] uppercase text-[10px]">Active Priority Framework</h4>
                  <Link to="/settings" className="text-[11px] text-blue-600 hover:underline">
                    Configure &rarr;
                  </Link>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-red-700 font-semibold">Critical:</span>
                    <span>75 – 100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-orange-700 font-semibold">High:</span>
                    <span>50 – 74</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-700 font-semibold">Medium:</span>
                    <span>25 – 49</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-700 font-semibold">Low:</span>
                    <span>0 – 24</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compare Predictions Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E2E8F0] max-w-2xl w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#172033]">Compare Road Segment Risk Profiles</h3>
              <button onClick={() => setShowCompareModal(false)} className="text-[#94A3B8] hover:text-[#172033]">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Road 1 */}
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/30 space-y-2">
                <span className="font-bold text-xs text-blue-900 block">Baseline Corridor</span>
                <p className="font-bold text-sm text-[#172033]">{selectedPrediction?.roadName}</p>
                <div className="text-lg font-black text-red-600">{selectedPrediction?.riskScore} / 100</div>
                <p className="text-[11px] text-[#64748B]">{selectedPrediction?.recommendedAction}</p>
              </div>

              {/* Road 2 Selector */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="font-bold text-xs text-[#64748B] block">Comparison Candidate</span>
                <select
                  value={compareTarget?.segmentId}
                  onChange={e => {
                    const match = predictions.find(p => p.segmentId === e.target.value);
                    if (match) setCompareTarget(match);
                  }}
                  className="w-full p-1.5 border rounded bg-white text-xs font-medium"
                >
                  {predictions.map(p => (
                    <option key={p.segmentId} value={p.segmentId}>
                      {p.roadName} ({p.segmentId})
                    </option>
                  ))}
                </select>
                {compareTarget && (
                  <>
                    <div className="text-lg font-black text-blue-700">{compareTarget.riskScore} / 100</div>
                    <p className="text-[11px] text-[#64748B]">{compareTarget.recommendedAction}</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E2E8F0]">
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-lg text-xs hover:bg-blue-700"
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
