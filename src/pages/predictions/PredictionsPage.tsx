import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { ConditionBadge } from '../../components/common/ConditionBadge';
import { RoadPrediction } from '../../types';
import { apiService } from '../../services/api';
import {
  Cpu,
  Sparkles,
  Play,
  AlertTriangle,
  CheckCircle2,
  GitCompare,
  RefreshCw,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

export const PredictionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { predictions: contextPredictions, runPredictionSimulation, addToast } = useApp();

  const [predictions, setPredictions] = useState<RoadPrediction[]>(contextPredictions);
  const [selectedPrediction, setSelectedPrediction] = useState<RoadPrediction | null>(
    contextPredictions[0] || null
  );
  const [isRunning, setIsRunning] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareTarget, setCompareTarget] = useState<RoadPrediction | null>(contextPredictions[1] || null);
  const [modelStatus, setModelStatus] = useState<any>({
    is_trained: true,
    version: 'v2.4-RandomForest-Ensemble',
    algorithm: 'Random Forest Ensemble (Classifier & Regressor)',
    sample_count: 1200,
    status: 'Production Active'
  });

  // Load predictions and model status on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [preds, status] = await Promise.all([
          apiService.getPredictions(),
          apiService.getModelStatus()
        ]);
        if (isMounted) {
          if (preds && preds.length > 0) {
            setPredictions(preds);
            setSelectedPrediction(preds[0]);
            if (preds.length > 1) setCompareTarget(preds[1]);
          }
          if (status) setModelStatus(status);
        }
      } catch (e) {
        // Fallback to context
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [contextPredictions]);

  const totalEvaluated = predictions.length;
  const criticalRiskCount = predictions.filter(p => p.riskScore >= 80).length;
  const highRiskCount = predictions.filter(p => p.riskScore >= 60 && p.riskScore < 80).length;
  const lowMediumRiskCount = predictions.filter(p => p.riskScore < 60).length;

  const handleRunModel = async () => {
    setIsRunning(true);
    try {
      const res = await apiService.runPredictionSimulation();
      await runPredictionSimulation();
      const updated = await apiService.getPredictions();
      setPredictions(updated);
      addToast('success', 'Pipeline Executed', res.message || 'Model predictions recalculated.');
    } catch (err: any) {
      addToast('error', 'Execution Error', 'Model prediction calculation failed.');
    } finally {
      setIsRunning(false);
    }
  };

  const columns: Column<RoadPrediction>[] = [
    {
      key: 'segmentId',
      header: 'ID',
      sortable: true,
      width: '100px',
      render: p => (
        <span className="font-mono text-xs font-bold text-[#C4B5FD] bg-[#8B5CF6]/20 px-2 py-0.5 rounded border border-[#8B5CF6]/30">
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
          <span className="font-semibold text-[#F5F3FF] block">{p.roadName}</span>
          <span className="text-[11px] text-[#B9AECF]">{p.ward}</span>
        </div>
      ),
    },
    {
      key: 'riskScore',
      header: 'Urgency Score (0–100)',
      sortable: true,
      align: 'center',
      render: p => (
        <div className="flex items-center justify-center gap-1">
          <span className={`text-sm font-extrabold flex items-center gap-1 ${p.riskScore >= 80 ? 'text-[#FB7185]' : p.riskScore >= 60 ? 'text-[#FBBF24]' : p.riskScore >= 40 ? 'text-[#60A5FA]' : 'text-[#34D399]'}`}>
            <Zap className="w-3.5 h-3.5" />
            {p.riskScore}
          </span>
          <span className="text-[10px] text-[#B9AECF]">/ 100</span>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority Category',
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
      render: p => <span className="text-xs text-[#B9AECF] font-medium">{p.predictionHorizon}</span>,
    },
    {
      key: 'confidenceScore',
      header: 'Confidence',
      sortable: true,
      align: 'right',
      render: p => (
        <div className="text-right">
          <span className="font-semibold text-[#F5F3FF]">{p.confidenceScore}%</span>
          <span className="text-[10px] text-[#B9AECF] block">{p.uncertaintyMargin}</span>
        </div>
      ),
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
          className="text-xs font-semibold text-[#A78BFA] hover:underline inline-flex items-center gap-1 transition"
        >
          Inspect Why &rarr;
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 min-w-0">
      <PageHeader
        title="Road Priority Recommendation Engine"
        subtitle="Transparent multi-factor scoring engine evaluating damage severity, report density, traffic intensity, weather impact, and repair history."
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30">
            <Cpu className="w-3.5 h-3.5 text-[#A78BFA]" />
            Rule-Based Urgency Engine (0–100)
          </span>
        }
        actions={
          <>
            <button
              onClick={() => setShowCompareModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#F5F3FF] bg-[#2B2042] border border-[#3B2D53] rounded-lg hover:bg-[#3B2D53] transition shadow-xs"
            >
              <GitCompare className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Compare Corridors</span>
            </button>
            <button
              onClick={handleRunModel}
              disabled={isRunning}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-lg shadow-xs transition disabled:opacity-50"
            >
              {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'Computing...' : 'Run Pipeline'}</span>
            </button>
          </>
        }
      />

      {/* Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        <div className="bg-[#211735] p-4 rounded-xl border border-[#3B2D53] shadow-xs min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#B9AECF] uppercase tracking-wider">
              Evaluated Segments
            </span>
            <Cpu className="w-4 h-4 text-[#A78BFA]" />
          </div>
          <div className="text-2xl font-bold text-[#F5F3FF] mt-2">{totalEvaluated}</div>
          <span className="text-[11px] text-[#B9AECF] mt-1 block">Full GIS inventory scored</span>
        </div>

        <div className="bg-[#211735] p-4 rounded-xl border border-[#FB7185]/40 shadow-xs min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#FB7185] uppercase tracking-wider">
              Critical Urgency (80–100)
            </span>
            <AlertTriangle className="w-4 h-4 text-[#FB7185]" />
          </div>
          <div className="text-2xl font-bold text-[#FB7185] mt-2">{criticalRiskCount}</div>
          <span className="text-[11px] text-[#FB7185]/80 mt-1 block">Immediate inspection recommended</span>
        </div>

        <div className="bg-[#211735] p-4 rounded-xl border border-[#FBBF24]/40 shadow-xs min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#FBBF24] uppercase tracking-wider">
              High Urgency (60–79)
            </span>
            <AlertTriangle className="w-4 h-4 text-[#FBBF24]" />
          </div>
          <div className="text-2xl font-bold text-[#FBBF24] mt-2">{highRiskCount}</div>
          <span className="text-[11px] text-[#FBBF24]/80 mt-1 block">Priority inspection queue</span>
        </div>

        <div className="bg-[#211735] p-4 rounded-xl border border-[#34D399]/40 shadow-xs min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#34D399] uppercase tracking-wider">
              Low / Medium Urgency
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
          </div>
          <div className="text-2xl font-bold text-[#34D399] mt-2">{lowMediumRiskCount}</div>
          <span className="text-[11px] text-[#B9AECF] mt-1 block">Routine monitoring schedule</span>
        </div>
      </div>

      {/* Main Prediction Table */}
      <div className="space-y-3 min-w-0">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-xs font-bold text-[#F5F3FF] uppercase tracking-wider">
            Ranked Maintenance Urgency &amp; Recommendations
          </h2>
          <span className="text-xs text-[#B9AECF]">Click any row to view explainable risk decomposition below</span>
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
        <div className="bg-[#211735] rounded-xl border border-[#3B2D53] shadow-sm overflow-hidden animate-in fade-in duration-150 min-w-0 text-[#F5F3FF]">
          <div className="p-4 sm:p-5 border-b border-[#3B2D53] bg-[#140E22] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#C4B5FD] bg-[#8B5CF6]/20 px-2 py-0.5 rounded border border-[#8B5CF6]/30">
                  {selectedPrediction.segmentId}
                </span>
                <span className="text-xs text-[#B9AECF]">{selectedPrediction.ward}</span>
              </div>
              <h3 className="text-base font-bold text-[#F5F3FF] mt-1">
                Risk Explainability Analysis: {selectedPrediction.roadName}
              </h3>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <PriorityBadge priority={selectedPrediction.priority} />
              <div className="px-3 py-1 bg-[#211735] rounded-lg border border-[#3B2D53] text-xs">
                <span className="text-[#B9AECF]">Model Confidence: </span>
                <strong className="text-[#34D399]">{selectedPrediction.confidenceScore}%</strong>{' '}
                <span className="text-[#B9AECF]">({selectedPrediction.uncertaintyMargin})</span>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
            {/* Left 2 Cols: Drivers breakdown and Historical Chart */}
            <div className="lg:col-span-2 space-y-5 min-w-0">
              {/* Recommendation Narrative */}
              <div className="p-4 rounded-xl bg-[#140E22] border border-[#8B5CF6]/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
                    Why was this road assigned a {selectedPrediction.priority} priority?
                  </span>
                  <span className="text-[10px] text-[#B9AECF] font-mono">Horizon: {selectedPrediction.predictionHorizon}</span>
                </div>
                <p className="text-[#F5F3FF] leading-relaxed font-medium">
                  {selectedPrediction.explanation}
                </p>
                <div className="pt-2 border-t border-[#3B2D53] flex items-center justify-between text-[11px] text-[#A78BFA] flex-wrap gap-2">
                  <span>Advisory Recommended Action: <strong className="text-[#F5F3FF]">{selectedPrediction.recommendedAction}</strong></span>
                  <button
                    onClick={() => navigate(`/map?select=${selectedPrediction.segmentId}`)}
                    className="font-semibold underline hover:text-[#C4B5FD] transition"
                  >
                    Locate on Map &rarr;
                  </button>
                </div>
              </div>

              {/* 4 Contributing Factors Cards */}
              <div className="space-y-2 min-w-0">
                <h4 className="text-xs font-bold text-[#F5F3FF] uppercase tracking-wider">
                  Weighted Factor Decomposition
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs min-w-0">
                  {Object.entries(selectedPrediction.factors).map(([key, factor]) => (
                    <div key={key} className="p-3.5 rounded-xl border border-[#3B2D53] bg-[#140E22] space-y-2 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#F5F3FF] truncate">{factor.name}</span>
                        <span className="text-xs font-bold text-[#A78BFA]">{factor.score} / 100</span>
                      </div>
                      <div className="w-full bg-[#2B2042] rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${factor.score >= 80 ? 'bg-[#FB7185]' : factor.score >= 60 ? 'bg-[#FBBF24]' : 'bg-[#8B5CF6]'}`}
                          style={{ width: `${factor.score}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-[#B9AECF] leading-snug">{factor.description}</p>
                      <span className="text-[10px] font-semibold text-[#B9AECF]">Weight: {factor.weight}% of scoring matrix</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historical Trend Chart */}
              <div className="p-4 rounded-xl border border-[#3B2D53] bg-[#211735] space-y-3 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#F5F3FF] uppercase tracking-wider">
                      6-Month Condition &amp; Risk Trajectory
                    </h4>
                    <p className="text-[11px] text-[#B9AECF]">Actual past inspections compared with ML projection</p>
                  </div>
                  <span className="text-xs text-[#A78BFA] font-semibold">{selectedPrediction.segmentId}</span>
                </div>

                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedPrediction.historicalTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3B2D53" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#B9AECF' }} stroke="#3B2D53" />
                      <YAxis domain={[20, 100]} tick={{ fontSize: 10, fill: '#B9AECF' }} stroke="#3B2D53" />
                      <Tooltip contentStyle={{ backgroundColor: '#211735', borderColor: '#3B2D53', color: '#F5F3FF', borderRadius: '8px', fontSize: '11px' }} />
                      <Line
                        type="monotone"
                        dataKey="actualRisk"
                        name="Actual Measured Risk"
                        stroke="#A78BFA"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#A78BFA' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="predictedRisk"
                        name="Model Forecast"
                        stroke="#FB7185"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={{ r: 4, fill: '#FB7185' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right Column: Model Governance & Data Freshness */}
            <div className="space-y-4 min-w-0">
              <div className="p-4 rounded-xl border border-[#3B2D53] bg-[#140E22] space-y-3 text-xs min-w-0">
                <h4 className="font-bold text-[#F5F3FF] uppercase tracking-wider text-[10px]">
                  Model Metadata &amp; Governance
                </h4>
                <div className="divide-y divide-[#3B2D53] text-xs">
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-[#B9AECF]">Active Model:</span>
                    <strong className="text-[#F5F3FF] font-mono text-[11px]">{selectedPrediction.modelVersion}</strong>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-[#B9AECF]">Data Freshness:</span>
                    <span className="text-[#F5F3FF]">{selectedPrediction.dataFreshness}</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-[#B9AECF]">Prediction Horizon:</span>
                    <strong className="text-[#F5F3FF]">{selectedPrediction.predictionHorizon}</strong>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-[#B9AECF]">Confidence Score:</span>
                    <strong className="text-[#34D399]">{selectedPrediction.confidenceScore}%</strong>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#FBBF24]/10 border border-[#FBBF24]/30 text-[#FBBF24] text-[11px]">
                  <strong className="block text-[10px] uppercase font-bold text-[#FBBF24]">
                    Data Quality Note:
                  </strong>
                  <p className="mt-0.5 text-xs text-[#F5F3FF]">{selectedPrediction.dataQualityNotes}</p>
                </div>

                <div className="p-2.5 rounded-lg bg-[#211735] text-[#B9AECF] text-[10px] leading-relaxed border border-[#3B2D53]">
                  <strong>Advisory Disclaimer:</strong> Predictions represent model estimates from calibrated municipal features. Field allocations require sign-off by certified municipal engineers.
                </div>
              </div>

              {/* Thresholds Reference */}
              <div className="p-4 rounded-xl border border-[#3B2D53] bg-[#140E22] space-y-2 text-xs min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#F5F3FF] uppercase text-[10px]">Active Priority Framework</h4>
                  <Link to="/settings" className="text-[11px] text-[#A78BFA] hover:underline font-semibold transition">
                    Configure &rarr;
                  </Link>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#FB7185] font-semibold">Critical:</span>
                    <span className="text-[#F5F3FF]">80 – 100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#FBBF24] font-semibold">High:</span>
                    <span className="text-[#F5F3FF]">60 – 79</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#60A5FA] font-semibold">Medium:</span>
                    <span className="text-[#F5F3FF]">40 – 59</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#34D399] font-semibold">Low:</span>
                    <span className="text-[#F5F3FF]">0 – 39</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compare Predictions Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#211735] rounded-xl shadow-2xl border border-[#3B2D53] max-w-2xl w-full p-6 text-xs space-y-4 text-[#F5F3FF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#3B2D53]">
              <h3 className="text-sm font-bold text-[#F5F3FF]">Compare Road Segment Risk Profiles</h3>
              <button onClick={() => setShowCompareModal(false)} className="text-[#B9AECF] hover:text-[#F5F3FF] transition">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Road 1 */}
              <div className="p-3.5 rounded-xl border border-[#3B2D53] bg-[#140E22] space-y-2">
                <span className="font-bold text-xs text-[#A78BFA] block">Baseline Corridor</span>
                <p className="font-bold text-sm text-[#F5F3FF]">{selectedPrediction?.roadName}</p>
                <div className="text-lg font-black text-[#FB7185]">{selectedPrediction?.riskScore} / 100</div>
                <p className="text-[11px] text-[#B9AECF]">{selectedPrediction?.recommendedAction}</p>
              </div>

              {/* Road 2 Selector */}
              <div className="p-3.5 rounded-xl border border-[#3B2D53] bg-[#140E22] space-y-2">
                <span className="font-bold text-xs text-[#B9AECF] block">Comparison Candidate</span>
                <select
                  value={compareTarget?.segmentId}
                  onChange={e => {
                    const match = predictions.find(p => p.segmentId === e.target.value);
                    if (match) setCompareTarget(match);
                  }}
                  className="w-full p-1.5 border border-[#3B2D53] rounded bg-[#211735] text-xs font-medium text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                >
                  {predictions.map(p => (
                    <option key={p.segmentId} value={p.segmentId}>
                      {p.roadName} ({p.segmentId})
                    </option>
                  ))}
                </select>
                {compareTarget && (
                  <>
                    <div className="text-lg font-black text-[#A78BFA]">{compareTarget.riskScore} / 100</div>
                    <p className="text-[11px] text-[#B9AECF]">{compareTarget.recommendedAction}</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#3B2D53]">
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-4 py-1.5 bg-[#8B5CF6] text-white font-semibold rounded-lg text-xs hover:bg-[#7C3AED] transition"
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
