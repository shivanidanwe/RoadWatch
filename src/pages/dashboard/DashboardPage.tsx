import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/common/PageHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { ConditionBadge } from '../../components/common/ConditionBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Route,
  AlertTriangle,
  CalendarCheck,
  Hammer,
  TrendingUp,
  Map as MapIcon,
  PlusCircle,
  Download,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { roads, reports, inspections, maintenancePlans, predictions, addToast } = useApp();

  // Compute metrics
  const totalSegments = roads.length;
  const totalLengthKm = roads.reduce((acc, r) => acc + r.lengthKm, 0).toFixed(1);
  const openReports = reports.filter(r => r.status !== 'Resolved').length;
  const criticalSegments = roads.filter(r => r.priority === 'Critical').length;
  const inspectionsDue = inspections.filter(i => i.status === 'Scheduled' || i.status === 'In Progress').length;
  const maintenanceBacklogCost = maintenancePlans
    .filter(m => m.status !== 'Completed')
    .reduce((acc, m) => acc + m.estimatedCost, 0);
  const avgRiskScore = Math.round(
    roads.reduce((acc, r) => acc + r.riskScore, 0) / (roads.length || 1)
  );

  // A. Condition Distribution Data
  const conditionData = [
    { name: 'Good', value: roads.filter(r => r.currentCondition === 'Good').length, color: '#15803D' },
    { name: 'Fair', value: roads.filter(r => r.currentCondition === 'Fair').length, color: '#2563EB' },
    { name: 'Poor', value: roads.filter(r => r.currentCondition === 'Poor').length, color: '#D97706' },
    { name: 'Critical', value: roads.filter(r => r.currentCondition === 'Critical').length, color: '#DC2626' },
  ];

  // B. Priority Distribution Data
  const priorityData = [
    { name: 'Critical', count: roads.filter(r => r.priority === 'Critical').length, fill: '#DC2626' },
    { name: 'High', count: roads.filter(r => r.priority === 'High').length, fill: '#EA580C' },
    { name: 'Medium', count: roads.filter(r => r.priority === 'Medium').length, fill: '#D97706' },
    { name: 'Low', count: roads.filter(r => r.priority === 'Low').length, fill: '#15803D' },
  ];

  // C. Road Risk Trend (Actual vs Predicted)
  const riskTrendData = [
    { month: 'May', actualRisk: 48, predictedRisk: 46 },
    { month: 'Jun', actualRisk: 55, predictedRisk: 54 },
    { month: 'Jul', actualRisk: 64, predictedRisk: 63 },
    { month: 'Aug', actualRisk: 72, predictedRisk: 71 },
    { month: 'Sep', actualRisk: 76, predictedRisk: 77 },
    { month: 'Oct (Current)', actualRisk: avgRiskScore, predictedRisk: avgRiskScore },
    { month: 'Nov (Forecast)', predictedRisk: 82 },
    { month: 'Dec (Forecast)', predictedRisk: 86 },
  ];

  // D. Issue Reports Over Time
  const reportVolumeData = [
    { week: 'Wk 39', submitted: 18, resolved: 14 },
    { week: 'Wk 40', submitted: 24, resolved: 16 },
    { week: 'Wk 41', submitted: 32, resolved: 21 },
    { week: 'Wk 42', submitted: 28, resolved: 24 },
    { week: 'Wk 43', submitted: 36, resolved: 20 },
    { week: 'Current', submitted: openReports, resolved: reports.filter(r => r.status === 'Resolved').length },
  ];

  // E. Radar / Contributing Risk Factors
  const contributingFactors = [
    { factor: 'Pavement Damage', weight: 88, fullMark: 100 },
    { factor: 'Traffic Load', weight: 92, fullMark: 100 },
    { factor: 'Monsoon Exposure', weight: 84, fullMark: 100 },
    { factor: 'Repair History Gap', weight: 76, fullMark: 100 },
    { factor: 'Drainage Gradient', weight: 70, fullMark: 100 },
  ];

  // Highest priority road segments
  const topCriticalRoads = [...roads]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  const handleExportDashboard = () => {
    addToast('success', 'Report Exported', 'Executive Infrastructure Briefing downloaded as PDF summary.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Infrastructure Overview"
        subtitle="Monitor road conditions, maintenance priorities, and predicted infrastructure risks across municipal wards."
        badge={
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Sparkles className="w-3 h-3 text-blue-600" />
            AI-Assisted Prediction v2.4 Active
          </span>
        }
        actions={
          <>
            <button
              onClick={() => navigate('/map')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#172033] bg-white border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition shadow-xs"
            >
              <MapIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>View Road Map</span>
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Road Report</span>
            </button>
            <button
              onClick={handleExportDashboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#64748B] hover:text-[#172033] bg-white border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition"
              title="Export executive brief"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Brief</span>
            </button>
          </>
        }
      />

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Road Segments"
          value={`${totalSegments}`}
          icon={<Route className="w-5 h-5 text-blue-700" />}
          trend={{ value: `${totalLengthKm} km`, isPositive: true, label: 'mapped network' }}
          tooltip="Total inventoried road corridors registered under municipal GIS"
        />
        <MetricCard
          title="Open Road Issues"
          value={openReports}
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
          trend={{ value: '+2', isPositive: false, label: 'vs last week' }}
          tooltip="Citizen and patrol reports currently pending verification or repair"
          highlightCritical={openReports > 5}
        />
        <MetricCard
          title="Critical Priority"
          value={criticalSegments}
          icon={<ShieldAlert className="w-5 h-5 text-red-600" />}
          trend={{ value: `${Math.round((criticalSegments / totalSegments) * 100)}%`, isPositive: false, label: 'of network' }}
          tooltip="Segments with predicted risk >= 75 requiring urgent engineering intervention"
          highlightCritical={criticalSegments > 0}
        />
        <MetricCard
          title="Inspections Due"
          value={inspectionsDue}
          icon={<CalendarCheck className="w-5 h-5 text-blue-600" />}
          trend={{ value: '3 this week', isPositive: true, label: 'scheduled' }}
          tooltip="Field audits and post-weather structural surveys currently assigned"
        />
        <MetricCard
          title="Maintenance Backlog"
          value={`$${(maintenanceBacklogCost / 1000).toFixed(0)}k`}
          icon={<Hammer className="w-5 h-5 text-indigo-600" />}
          trend={{ value: '4 projects', isPositive: false, label: 'in queue' }}
          tooltip="Estimated budget required to address pending proposed work plans"
        />
        <MetricCard
          title="Avg Predicted Risk"
          value={`${avgRiskScore}/100`}
          icon={<TrendingUp className="w-5 h-5 text-rose-600" />}
          trend={{ value: '+4.2%', isPositive: false, label: 'post-monsoon' }}
          tooltip="Aggregate predicted risk score across entire active network"
        />
      </div>

      {/* Primary Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart A: Road Condition Distribution */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                Road Condition Breakdown
              </h3>
              <p className="text-[11px] text-[#64748B]">Inventoried network condition classes</p>
            </div>
            <span className="text-[10px] font-mono text-[#94A3B8]">{totalSegments} Segments</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={conditionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {conditionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${val} Segments (${Math.round((val / totalSegments) * 100)}%)`, 'Count']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
            <span>Poor/Critical: <strong>{roads.filter(r => ['Poor', 'Critical'].includes(r.currentCondition)).length} segments</strong></span>
            <Link to="/roads" className="text-blue-600 hover:underline flex items-center gap-1 font-medium">
              View Inventory <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Chart B: Maintenance Priority Distribution */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                Maintenance Priority Spread
              </h3>
              <p className="text-[11px] text-[#64748B]">Urgency classification by risk algorithm</p>
            </div>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
              Demo Model
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
            <span>Critical Priority: <strong>{criticalSegments} corridors</strong></span>
            <Link to="/predictions" className="text-blue-600 hover:underline flex items-center gap-1 font-medium">
              Scoring Details <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Chart E: Radar Contributing Factors */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                Contributing Risk Drivers
              </h3>
              <p className="text-[11px] text-[#64748B]">Weighted model feature impact</p>
            </div>
            <span className="text-[10px] text-blue-600 font-semibold">City-Wide</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={contributingFactors}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="factor" tick={{ fontSize: 9, fill: '#64748B' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                <Radar
                  name="Network Factor Stress"
                  dataKey="weight"
                  stroke="#2563EB"
                  fill="#2563EB"
                  fillOpacity={0.45}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
            <span>Leading driver: <strong>Traffic Load &amp; Axle Weight</strong></span>
            <Link to="/analytics" className="text-blue-600 hover:underline flex items-center gap-1 font-medium">
              Deep Analytics <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Charts: Risk Trends & Report Volumes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart C: Road Risk Trend (Actual vs Forecast) */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                Network Risk Trajectory (Actual vs Model Forecast)
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Historic observations compared with ML projected 60-day horizon
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-[11px] text-blue-700">
                <span className="w-2.5 h-0.5 bg-blue-600 inline-block" /> Actual
              </span>
              <span className="flex items-center gap-1 text-[11px] text-rose-600">
                <span className="w-2.5 h-0.5 bg-rose-500 border-dashed border-b-2 inline-block" /> Forecast
              </span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={[30, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="actualRisk"
                  name="Historical Actual Risk"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#2563EB' }}
                />
                <Line
                  type="monotone"
                  dataKey="predictedRisk"
                  name="Model Risk Estimate"
                  stroke="#DC2626"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: '#DC2626' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart D: Issue Reports Over Time */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                Citizen &amp; Patrol Issue Volume (Weekly)
              </h3>
              <p className="text-[11px] text-[#64748B]">Report intake throughput vs resolution rate</p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              78% Resolution Compliance
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="submitted" name="New Distress Reports" fill="#2563EB" radius={[3, 3, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved Work Orders" fill="#15803D" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Dashboard Lower Section: Highest Priority Roads & Operational Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Highest Priority Road Segments (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50/60">
            <div>
              <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                Urgent Attention Segments
              </h3>
              <p className="text-[11px] text-[#64748B]">Highest predicted risk scores requiring field dispatch</p>
            </div>
            <Link
              to="/roads"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              All Segments <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-[#E2E8F0] text-[#64748B] font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-4">Segment</th>
                  <th className="py-2.5 px-3">Ward</th>
                  <th className="py-2.5 px-3">Condition</th>
                  <th className="py-2.5 px-3">Risk Score</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {topCriticalRoads.map(road => (
                  <tr
                    key={road.id}
                    onClick={() => navigate(`/map?select=${road.id}`)}
                    className="hover:bg-blue-50/40 cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-semibold text-[#172033]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {road.id}
                        </span>
                        <span className="truncate max-w-[180px]">{road.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#64748B]">{road.ward}</td>
                    <td className="py-3 px-3">
                      <ConditionBadge condition={road.currentCondition} />
                    </td>
                    <td className="py-3 px-3 font-bold text-red-600">
                      {road.riskScore} / 100
                    </td>
                    <td className="py-3 px-3">
                      <PriorityBadge priority={road.priority} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-[11px] font-semibold text-blue-600 hover:underline">
                        Inspect Map &rarr;
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational Feeds: Upcoming Inspections & Data Quality */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Upcoming Inspections Box */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 flex-1">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E2E8F0]">
              <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                Upcoming Inspections
              </h3>
              <Link to="/inspections" className="text-[11px] text-blue-600 font-semibold hover:underline">
                View Calendar
              </Link>
            </div>

            <div className="space-y-3">
              {inspections.slice(0, 3).map(insp => (
                <div key={insp.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-blue-700">{insp.id}</span>
                    <StatusBadge status={insp.status} />
                  </div>
                  <div className="font-semibold text-[#172033] truncate">{insp.roadName}</div>
                  <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                    <span>Inspector: {insp.assignedInspector}</span>
                    <span className="font-medium text-slate-700">{insp.scheduledDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model & Data Quality Summary */}
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-emerald-400" /> Model Pipeline Status
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                v2.4 Active
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Trained on 24,500 pavement distress segments. Mean Absolute Error: 3.42 PCI points. Zero drift detected in October telemetry.
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>Next scheduled retraining: Nov 01</span>
              <Link to="/models" className="text-blue-400 hover:underline">
                Monitoring Portal &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
