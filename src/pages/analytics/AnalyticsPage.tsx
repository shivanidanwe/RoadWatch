import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/common/PageHeader';
import { ANALYTICS_DATA } from '../../mock/analytics';
import {
  BarChart3,
  Download,
  Printer,
  Filter,
  Calendar,
  Layers,
  Info,
  TrendingUp,
  AlertCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { addToast } = useApp();

  const [timeRange, setTimeRange] = useState('2024 YTD');
  const [selectedWard, setSelectedWard] = useState('ALL');

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Category,Value,Notes\n' +
      'Issue Volume,Potholes,142,38% of total\n' +
      'Issue Volume,Surface Cracking,86,23% of total\n' +
      'Issue Volume,Waterlogging,64,17% of total\n' +
      'Ward Risk,Ward 4 North,78,Critical\n' +
      'Ward Risk,Ward 7 West,74,Critical\n' +
      'Inspection Compliance,October,86.6%,39 completed\n' +
      'Maintenance Spend,October MTD,$234k,Pothole & Overlays';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `roadwatch-analytics-${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('success', 'Export Complete', 'Analytics dataset exported to CSV.');
  };

  const handlePrint = () => {
    window.print();
  };

  const COLORS = ['#DC2626', '#EA580C', '#2563EB', '#0F766E', '#64748B', '#D97706'];

  return (
    <div className="space-y-6 print:space-y-4 print:p-0">
      <PageHeader
        title="Analytics &amp; Infrastructure Insights"
        subtitle="Empirical engineering analytics evaluating network condition trends, distress distributions, and resource allocation efficiency."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#172033] border border-slate-200">
            10 Analytic Views
          </span>
        }
        actions={
          <>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#172033] bg-white border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Print Report</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Raw Data</span>
            </button>
          </>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[#64748B] font-semibold">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Scope:</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[#64748B]">Time Period:</span>
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className="p-1.5 border border-[#E2E8F0] rounded-lg bg-slate-50 font-medium text-[#172033]"
            >
              <option value="2024 YTD">2024 Year-to-Date</option>
              <option value="Past 12 Months">Past 12 Months</option>
              <option value="All Historical">Complete Historical (2022–2024)</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[#64748B]">Ward Zone:</span>
            <select
              value={selectedWard}
              onChange={e => setSelectedWard(e.target.value)}
              className="p-1.5 border border-[#E2E8F0] rounded-lg bg-slate-50 font-medium text-[#172033]"
            >
              <option value="ALL">All Municipal Wards</option>
              <option value="North Zone">North Zone (Wards 3 &amp; 4)</option>
              <option value="East Zone">East District (Ward 8)</option>
              <option value="South Zone">South Hub (Wards 10 &amp; 11)</option>
              <option value="West Zone">West Zone (Ward 7)</option>
            </select>
          </div>
        </div>

        <span className="text-[11px] text-[#94A3B8]">
          Aggregated across 1,420 km network segments
        </span>
      </div>

      {/* Visualizations Grid (10 Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Road Condition Trends Over Time */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                1. Road Condition Distribution Over Time (%)
              </h3>
              <p className="text-[11px] text-[#64748B]">Quarterly historical progression across network</p>
            </div>
            <span className="text-[10px] font-mono text-[#94A3B8]">8 Quarters</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ANALYTICS_DATA.conditionTrends} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Area type="monotone" dataKey="Good" stackId="1" stroke="#15803D" fill="#15803D" fillOpacity={0.8} />
                <Area type="monotone" dataKey="Fair" stackId="1" stroke="#2563EB" fill="#2563EB" fillOpacity={0.8} />
                <Area type="monotone" dataKey="Poor" stackId="1" stroke="#D97706" fill="#D97706" fillOpacity={0.8} />
                <Area type="monotone" dataKey="Critical" stackId="1" stroke="#DC2626" fill="#DC2626" fillOpacity={0.8} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Issue Frequency by Category */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                2. Distress Ticket Intake Frequency by Category
              </h3>
              <p className="text-[11px] text-[#64748B]">Distribution of logged citizen &amp; patrol distress incidents</p>
            </div>
            <span className="text-[11px] font-bold text-red-600">38% Potholes</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ANALYTICS_DATA.issuesByCategory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="category" tick={{ fontSize: 9, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip />
                <Bar dataKey="count" name="Logged Reports" radius={[4, 4, 0, 0]}>
                  {ANALYTICS_DATA.issuesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Risk Distribution by Ward */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                3. Average Predicted Risk by Ward Territory
              </h3>
              <p className="text-[11px] text-[#64748B]">Geographic comparison of pavement vulnerability</p>
            </div>
            <span className="text-[10px] text-red-600 font-semibold">Ward 4 Highest</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ANALYTICS_DATA.riskByWard}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 60, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis type="category" dataKey="ward" tick={{ fontSize: 9, fill: '#64748B' }} />
                <Tooltip />
                <Bar dataKey="avgRisk" name="Avg Risk Score (0-100)" fill="#2563EB" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. High-Risk Road Clusters */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                  4. High-Risk Road Geographic Clusters
                </h3>
                <p className="text-[11px] text-[#64748B]">Spatial corridors exhibiting co-located distress triggers</p>
              </div>
              <span className="text-[10px] font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                4 Critical Corridors
              </span>
            </div>

            <div className="space-y-3">
              {ANALYTICS_DATA.highRiskClusters.map(cluster => (
                <div key={cluster.clusterName} className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#172033]">{cluster.clusterName}</span>
                    <span className="font-extrabold text-red-600 text-sm">{cluster.avgRisk} / 100</span>
                  </div>
                  <div className="flex items-center justify-between text-[#64748B] text-[11px]">
                    <span>Segments: <strong>{cluster.segmentCount}</strong></span>
                    <span>Dominant Stressor: <strong>{cluster.dominantFactor}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-[#94A3B8]">
            Note: Clustering calculated using DBSCAN spatial proximity and heavy-axle freight weight density.
          </div>
        </div>

        {/* 5. Inspection Completion Rate */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                5. Field Inspection Throughput &amp; Compliance (%)
              </h3>
              <p className="text-[11px] text-[#64748B]">Monthly scheduled vs completed audit execution</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Avg 89.8% Completion
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ANALYTICS_DATA.inspectionCompletion} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="rate"
                  name="Completion Compliance %"
                  stroke="#0F766E"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0F766E' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Average Issue Resolution Time */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                6. Issue Resolution Turnaround (Days by Severity)
              </h3>
              <p className="text-[11px] text-[#64748B]">Service Level Agreement (SLA) target vs actual field turnaround</p>
            </div>
            <span className="text-[10px] text-blue-600 font-semibold">SLA Tracked</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ANALYTICS_DATA.resolutionTimeBySeverity} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="severity" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="avgDaysTarget" name="SLA Target (Days)" fill="#94A3B8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="avgDaysActual" name="Actual Mean (Days)" fill="#2563EB" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7. Maintenance Spending Over Time */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                7. Capital Maintenance Spending Trajectory ($k)
              </h3>
              <p className="text-[11px] text-[#64748B]">Monthly outlay across repair disciplines</p>
            </div>
            <span className="text-[10px] text-[#64748B] font-mono">Total $1,142k</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ANALYTICS_DATA.maintenanceSpending} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="structuralOverlays" name="Structural Overlays" stackId="a" fill="#1A237E" />
                <Bar dataKey="routineRepairs" name="Routine Maintenance" stackId="a" fill="#2563EB" />
                <Bar dataKey="emergencyPothole" name="Emergency Pothole Patching" stackId="a" fill="#EA580C" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 8. Planned Versus Completed Maintenance */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                8. Planned vs Completed Work Orders
              </h3>
              <p className="text-[11px] text-[#64748B]">Project milestone execution adherence</p>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              84 Projects
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ANALYTICS_DATA.plannedVsCompleted} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="planned" name="Planned Works" fill="#2563EB" radius={[3, 3, 0, 0]} />
                <Bar dataKey="completed" name="Completed Works" fill="#15803D" radius={[3, 3, 0, 0]} />
                <Bar dataKey="deferred" name="Deferred / Rescheduled" fill="#DC2626" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 9. Risk-Score Distribution Histogram */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                9. Network Risk Score Distribution (Histogram)
              </h3>
              <p className="text-[11px] text-[#64748B]">Count of road segments within each 10-point risk band</p>
            </div>
            <span className="text-[10px] font-mono text-[#94A3B8]">Gaussian Spread</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ANALYTICS_DATA.riskScoreDistribution} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="range" tick={{ fontSize: 8, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip />
                <Bar dataKey="count" name="Corridor Count" fill="#283593" radius={[4, 4, 0, 0]}>
                  {ANALYTICS_DATA.riskScoreDistribution.map((entry, index) => (
                    <Cell
                      key={`hist-${index}`}
                      fill={index >= 6 ? '#DC2626' : index >= 4 ? '#EA580C' : '#2563EB'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 10. Risk Factors by Road Network */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                  10. Network Risk Stress Factor Summary
                </h3>
                <p className="text-[11px] text-[#64748B]">Average environmental and loading scores across all city sectors</p>
              </div>
              <span className="text-[10px] text-blue-600 font-bold">100% Weight Sum</span>
            </div>

            <div className="space-y-3">
              {ANALYTICS_DATA.networkFactorWeights.map(factor => (
                <div key={factor.factor} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#172033]">{factor.factor}</span>
                    <span className="text-slate-600">
                      Mean Stress: <strong>{factor.avgNetworkScore} / 100</strong> (Weight: {factor.importance}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${factor.avgNetworkScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[10px] text-[#94A3B8]">
            Telemetry disclaimer: Correlations between environmental variables and distress rates do not imply single-point causation.
          </div>
        </div>
      </div>
    </div>
  );
};
