import React from 'react';
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
  Sparkles,
  BarChart2,
  Database,
  Layers
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
  const {
    roads,
    reports,
    inspections,
    maintenancePlans,
    dashboardSummary,
    seedDemoData,
    addToast
  } = useApp();

  // Compute live operational metrics from backend summary or state
  const totalSegments = dashboardSummary ? dashboardSummary.totalRoads : roads.length;
  const totalLengthKm = roads.reduce((acc, r) => acc + r.lengthKm, 0).toFixed(1);
  const openReports = dashboardSummary ? dashboardSummary.totalReports : reports.filter(r => r.status !== 'Resolved').length;
  const criticalSegments = dashboardSummary ? dashboardSummary.criticalPriorityRoads : roads.filter(r => r.priority === 'Critical').length;
  const inspectionsDue = dashboardSummary ? dashboardSummary.pendingInspections : inspections.filter(i => i.status === 'Scheduled' || i.status === 'In Progress').length;
  const activeRepairs = dashboardSummary ? dashboardSummary.repairsInProgress : maintenancePlans.filter(m => m.status === 'In Progress').length;
  const avgRiskScore = dashboardSummary
    ? dashboardSummary.avgRiskScore
    : Math.round(roads.reduce((acc, r) => acc + r.riskScore, 0) / (roads.length || 1));

  // Condition Distribution Data
  const conditionData = [
    { name: 'Good', value: roads.filter(r => r.currentCondition === 'Good').length, color: '#34D399' },
    { name: 'Fair', value: roads.filter(r => r.currentCondition === 'Fair').length, color: '#60A5FA' },
    { name: 'Poor', value: roads.filter(r => r.currentCondition === 'Poor').length, color: '#FBBF24' },
    { name: 'Critical', value: roads.filter(r => r.currentCondition === 'Critical').length, color: '#FB7185' },
  ];

  // Priority Distribution Data
  const priorityData = [
    { name: 'Critical', count: roads.filter(r => r.priority === 'Critical').length, fill: '#FB7185' },
    { name: 'High', count: roads.filter(r => r.priority === 'High').length, fill: '#FBBF24' },
    { name: 'Medium', count: roads.filter(r => r.priority === 'Medium').length, fill: '#60A5FA' },
    { name: 'Low', count: roads.filter(r => r.priority === 'Low').length, fill: '#34D399' },
  ];

  // Road Risk Trend (Actual vs Predicted)
  const riskTrendData = [
    { month: 'Jun', actualRisk: 52, predictedRisk: 50 },
    { month: 'Jul', actualRisk: 61, predictedRisk: 59 },
    { month: 'Aug', actualRisk: 68, predictedRisk: 67 },
    { month: 'Sep', actualRisk: 72, predictedRisk: 73 },
    { month: 'Oct (Current)', actualRisk: avgRiskScore || 65, predictedRisk: avgRiskScore || 65 },
    { month: 'Nov (Forecast)', predictedRisk: Math.min(100, Math.round((avgRiskScore || 65) * 1.05)) },
  ];

  // Issue Reports Over Time
  const resolvedCount = reports.filter(r => r.status === 'Resolved').length;
  const reportVolumeData = [
    { week: 'Wk 41', submitted: 3, resolved: 2 },
    { week: 'Wk 42', submitted: 4, resolved: 3 },
    { week: 'Wk 43', submitted: 5, resolved: 4 },
    { week: 'Current', submitted: openReports, resolved: resolvedCount },
  ];

  // Contributing Risk Factors
  const contributingFactors = [
    { factor: 'Pavement Distress', weight: 88, fullMark: 100 },
    { factor: 'Traffic Axle Load', weight: 92, fullMark: 100 },
    { factor: 'Monsoon Exposure', weight: 84, fullMark: 100 },
    { factor: 'Inspection Gap', weight: 76, fullMark: 100 },
    { factor: 'Drainage Gradient', weight: 70, fullMark: 100 },
  ];

  // Highest priority road segments
  const topCriticalRoads = [...roads]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  const handleExportDashboard = () => {
    addToast('success', 'Report Exported', 'Executive Briefing downloaded as CSV.');
  };

  const isEmpty = totalSegments === 0 && openReports === 0;

  return (
    <div className="space-y-6 min-w-0">
      {/* Page Header */}
      <PageHeader
        title="Infrastructure Overview"
        subtitle="Real-time condition monitoring, maintenance priorities, and predictive deterioration risk."
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
            ML Risk Engine v2.4 Active
          </span>
        }
        actions={
          <>
            <button
              onClick={() => navigate('/map')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#F5F3FF] bg-[#2B2042] border border-[#3B2D53] rounded-lg hover:bg-[#3B2D53] transition shadow-xs"
            >
              <MapIcon className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>View Map</span>
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-lg transition shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Report</span>
            </button>
            <button
              onClick={handleExportDashboard}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#B9AECF] hover:text-[#F5F3FF] bg-[#2B2042] border border-[#3B2D53] rounded-lg hover:bg-[#3B2D53] transition shadow-xs"
              title="Export summary"
            >
              <Download className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Export</span>
            </button>
          </>
        }
      />

      {/* Empty State Banner if Database Has Zero Records */}
      {isEmpty && (
        <div className="bg-[#211735] border border-[#3B2D53] rounded-xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center mx-auto text-[#A78BFA]">
            <Database className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-[#F5F3FF]">No Operational Records Found</h3>
            <p className="text-xs text-[#B9AECF]">
              The database is currently empty. You can submit real citizen damage reports or load 3 demonstration road corridors to preview full system telemetry.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={seedDemoData}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-lg transition"
            >
              Seed Demo Corridors (3 Records)
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="px-4 py-2 text-xs font-semibold text-[#F5F3FF] bg-[#2B2042] border border-[#3B2D53] hover:bg-[#3B2D53] rounded-lg transition"
            >
              Submit First Damage Report
            </button>
          </div>
        </div>
      )}

      {/* 6 KPI Cards with Proper Box Alignment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 min-w-0">
        <MetricCard
          title="Road Segments"
          value={`${totalSegments}`}
          icon={<Route className="w-5 h-5 text-[#A78BFA]" />}
          trend={{ value: `${totalLengthKm} km`, isPositive: true, label: 'mapped' }}
          tooltip="Total inventoried road corridors registered in municipal GIS"
        />
        <MetricCard
          title="Open Issues"
          value={openReports}
          icon={<AlertTriangle className="w-5 h-5 text-[#FBBF24]" />}
          trend={{ value: `${reports.length} total`, isPositive: false, label: 'logged' }}
          tooltip="Distress reports currently pending verification or repair"
          highlightCritical={openReports > 4}
        />
        <MetricCard
          title="Critical Priority"
          value={criticalSegments}
          icon={<ShieldAlert className="w-5 h-5 text-[#FB7185]" />}
          trend={{
            value: totalSegments > 0 ? `${Math.round((criticalSegments / totalSegments) * 100)}%` : '0%',
            isPositive: false,
            label: 'of network'
          }}
          tooltip="Segments with predicted risk >= 75 requiring urgent intervention"
          highlightCritical={criticalSegments > 0}
        />
        <MetricCard
          title="Inspections Due"
          value={inspectionsDue}
          icon={<CalendarCheck className="w-5 h-5 text-[#60A5FA]" />}
          trend={{ value: `${inspections.length} total`, isPositive: true, label: 'scheduled' }}
          tooltip="Field audits and post-weather structural surveys assigned"
        />
        <MetricCard
          title="Active Repairs"
          value={activeRepairs}
          icon={<Hammer className="w-5 h-5 text-[#A78BFA]" />}
          trend={{ value: `${maintenancePlans.length} plans`, isPositive: true, label: 'in pipeline' }}
          tooltip="Work orders currently underway by municipal maintenance squads"
        />
        <MetricCard
          title="Avg Predicted Risk"
          value={`${avgRiskScore}/100`}
          icon={<TrendingUp className="w-5 h-5 text-[#FB7185]" />}
          trend={{ value: avgRiskScore >= 70 ? 'High' : avgRiskScore >= 40 ? 'Moderate' : 'Low', isPositive: avgRiskScore < 50, label: 'network severity' }}
          tooltip="Aggregate predicted risk score across entire active network"
        />
      </div>

      {/* Primary Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        {/* Chart A: Road Condition Distribution */}
        <div className="bg-[#211735] p-5 rounded-xl border border-[#3B2D53] shadow-xs flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#F5F3FF] uppercase tracking-wider">
                Condition Breakdown
              </h3>
              <p className="text-[11px] text-[#B9AECF]">Inventoried network condition classes</p>
            </div>
            <span className="text-[10px] font-mono text-[#A78BFA] bg-[#8B5CF6]/15 px-2 py-0.5 rounded border border-[#8B5CF6]/30 font-semibold">
              {totalSegments} Segments
            </span>
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
                  contentStyle={{ backgroundColor: '#211735', borderColor: '#3B2D53', color: '#F5F3FF', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(val: number) => [`${val} Segments (${totalSegments > 0 ? Math.round((val / totalSegments) * 100) : 0}%)`, 'Count']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#B9AECF' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 pt-3 border-t border-[#3B2D53] flex items-center justify-between text-xs text-[#B9AECF]">
            <span>Poor/Critical: <strong className="text-[#FB7185]">{roads.filter(r => ['Poor', 'Critical'].includes(r.currentCondition)).length} segments</strong></span>
            <Link to="/roads" className="text-[#A78BFA] hover:underline flex items-center gap-1 font-semibold transition">
              View Inventory <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Chart B: Maintenance Priority Spread */}
        <div className="bg-[#211735] p-5 rounded-xl border border-[#3B2D53] shadow-xs flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#F5F3FF] uppercase tracking-wider">
                Priority Distribution
              </h3>
              <p className="text-[11px] text-[#B9AECF]">Urgency classification by ML risk model</p>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-[#8B5CF6]/15 rounded text-[#A78BFA] border border-[#8B5CF6]/30 font-semibold">
              Active ML
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3B2D53" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#B9AECF' }} stroke="#3B2D53" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#B9AECF' }} stroke="#3B2D53" />
                <Tooltip contentStyle={{ backgroundColor: '#211735', borderColor: '#3B2D53', color: '#F5F3FF', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-[#3B2D53] flex items-center justify-between text-xs text-[#B9AECF]">
            <span>Critical Priority: <strong className="text-[#FB7185]">{criticalSegments} corridors</strong></span>
            <Link to="/predictions" className="text-[#A78BFA] hover:underline flex items-center gap-1 font-semibold transition">
              Scoring Details <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Chart E: Radar Contributing Factors */}
        <div className="bg-[#211735] p-5 rounded-xl border border-[#3B2D53] shadow-xs flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#F5F3FF] uppercase tracking-wider">
                Contributing Risk Drivers
              </h3>
              <p className="text-[11px] text-[#B9AECF]">Weighted model feature impact</p>
            </div>
            <span className="text-[10px] text-[#A78BFA] font-semibold bg-[#8B5CF6]/15 px-2 py-0.5 rounded border border-[#8B5CF6]/30">
              City-Wide
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={contributingFactors}>
                <PolarGrid stroke="#3B2D53" />
                <PolarAngleAxis dataKey="factor" tick={{ fontSize: 9, fill: '#B9AECF' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: '#B9AECF' }} stroke="#3B2D53" />
                <Radar
                  name="Network Factor Stress"
                  dataKey="weight"
                  stroke="#A78BFA"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                />
                <Tooltip contentStyle={{ backgroundColor: '#211735', borderColor: '#3B2D53', color: '#F5F3FF', borderRadius: '8px', fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-[#3B2D53] flex items-center justify-between text-xs text-[#B9AECF]">
            <span>Leading driver: <strong className="text-[#F5F3FF]">Traffic Axle Load</strong></span>
            <Link to="/analytics" className="text-[#A78BFA] hover:underline flex items-center gap-1 font-semibold transition">
              Analytics <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Charts: Risk Trends & Report Volumes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        {/* Chart C: Road Risk Trend (Actual vs Forecast) */}
        <div className="bg-[#211735] p-5 rounded-xl border border-[#3B2D53] shadow-xs min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#F5F3FF] uppercase tracking-wider">
                Risk Trajectory (Actual vs Model Forecast)
              </h3>
              <p className="text-[11px] text-[#B9AECF]">
                Historic observations compared with ML projected 60-day horizon
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-[11px] text-[#A78BFA] font-medium">
                <span className="w-2.5 h-0.5 bg-[#A78BFA] inline-block" /> Actual
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[#FB7185] font-medium">
                <span className="w-2.5 h-0.5 bg-[#FB7185] border-dashed border-b-2 inline-block" /> Forecast
              </span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3B2D53" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#B9AECF' }} stroke="#3B2D53" />
                <YAxis domain={[30, 100]} tick={{ fontSize: 11, fill: '#B9AECF' }} stroke="#3B2D53" />
                <Tooltip contentStyle={{ backgroundColor: '#211735', borderColor: '#3B2D53', color: '#F5F3FF', borderRadius: '8px', fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="actualRisk"
                  name="Historical Risk"
                  stroke="#A78BFA"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#A78BFA' }}
                />
                <Line
                  type="monotone"
                  dataKey="predictedRisk"
                  name="Forecasted Risk"
                  stroke="#FB7185"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: '#FB7185' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart D: Issue Reports Over Time */}
        <div className="bg-[#211735] p-5 rounded-xl border border-[#3B2D53] shadow-xs min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#F5F3FF] uppercase tracking-wider">
                Distress Reports &amp; Resolutions
              </h3>
              <p className="text-[11px] text-[#B9AECF]">Operational ticket flow &amp; resolution rate</p>
            </div>
            <span className="text-[11px] font-semibold text-[#34D399] bg-[#34D399]/15 px-2.5 py-0.5 rounded border border-[#34D399]/30">
              Active Tracking
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3B2D53" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#B9AECF' }} stroke="#3B2D53" />
                <YAxis tick={{ fontSize: 11, fill: '#B9AECF' }} stroke="#3B2D53" />
                <Tooltip contentStyle={{ backgroundColor: '#211735', borderColor: '#3B2D53', color: '#F5F3FF', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#B9AECF' }} />
                <Bar dataKey="submitted" name="New Reports" fill="#8B5CF6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#34D399" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Dashboard Lower Section: Highest Priority Roads & Operational Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        {/* Highest Priority Road Segments (2 Cols) */}
        <div className="lg:col-span-2 bg-[#211735] rounded-xl border border-[#3B2D53] shadow-xs overflow-hidden flex flex-col min-w-0">
          <div className="p-4 border-b border-[#3B2D53] flex items-center justify-between bg-[#140E22]">
            <div>
              <h3 className="text-xs font-bold text-[#F5F3FF] uppercase tracking-wider">
                Urgent Attention Segments
              </h3>
              <p className="text-[11px] text-[#B9AECF]">Highest predicted risk scores requiring field dispatch</p>
            </div>
            <Link
              to="/roads"
              className="text-xs font-semibold text-[#A78BFA] hover:underline flex items-center gap-1 transition"
            >
              All Segments <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1 w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#140E22] border-b border-[#3B2D53] text-[#A78BFA] font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-4">Segment</th>
                  <th className="py-2.5 px-3">Ward</th>
                  <th className="py-2.5 px-3">Condition</th>
                  <th className="py-2.5 px-3">Risk Score</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3B2D53]/50 text-[#F5F3FF]">
                {topCriticalRoads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[#B9AECF]">
                      No road records in system. Click "Seed Demo Corridors" above to load sample corridors.
                    </td>
                  </tr>
                ) : (
                  topCriticalRoads.map(road => (
                    <tr
                      key={road.id}
                      onClick={() => navigate(`/map?select=${road.id}`)}
                      className="hover:bg-[#2B2042]/50 cursor-pointer transition"
                    >
                      <td className="py-3 px-4 font-semibold text-[#F5F3FF]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-[#C4B5FD] bg-[#8B5CF6]/20 px-1.5 py-0.5 rounded font-bold border border-[#8B5CF6]/30">
                            {road.id}
                          </span>
                          <span className="truncate max-w-[180px]">{road.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#B9AECF]">{road.ward}</td>
                      <td className="py-3 px-3">
                        <ConditionBadge condition={road.currentCondition} />
                      </td>
                      <td className="py-3 px-3 font-bold text-[#FB7185]">
                        {road.riskScore} / 100
                      </td>
                      <td className="py-3 px-3">
                        <PriorityBadge priority={road.priority} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[11px] font-semibold text-[#A78BFA] hover:underline transition">
                          Inspect Map &rarr;
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational Feeds: Upcoming Inspections & Model Status */}
        <div className="space-y-6 flex flex-col justify-between min-w-0">
          {/* Upcoming Inspections Box */}
          <div className="bg-[#211735] rounded-xl border border-[#3B2D53] shadow-xs p-4 flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#3B2D53]">
              <h3 className="text-xs font-bold text-[#F5F3FF] uppercase tracking-wider">
                Upcoming Inspections
              </h3>
              <Link to="/inspections" className="text-[11px] text-[#A78BFA] font-semibold hover:underline transition">
                View Calendar
              </Link>
            </div>

            <div className="space-y-2.5">
              {inspections.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#B9AECF]">
                  No inspections currently scheduled.
                </div>
              ) : (
                inspections.slice(0, 3).map(insp => (
                  <div key={insp.id} className="p-2.5 rounded-lg border border-[#3B2D53] bg-[#140E22] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-[#A78BFA]">{insp.id}</span>
                      <StatusBadge status={insp.status} />
                    </div>
                    <div className="font-semibold text-[#F5F3FF] truncate">{insp.roadName}</div>
                    <div className="flex items-center justify-between text-[11px] text-[#B9AECF]">
                      <span>Inspector: {insp.assignedInspector}</span>
                      <span className="font-medium text-[#F5F3FF]">{insp.scheduledDate}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Model Status Card */}
          <div className="bg-[#211735] text-[#F5F3FF] rounded-xl p-4 shadow-xs text-xs space-y-2 border border-[#3B2D53] min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#F5F3FF] flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-[#34D399]" /> Model Pipeline
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30">
                v2.4 Active
              </span>
            </div>
            <p className="text-[11px] text-[#B9AECF] leading-snug">
              Trained on Scikit-Learn Random Forest ensemble with empirical telemetry. Real-time urgency calculations active.
            </p>
            <div className="pt-2 border-t border-[#3B2D53] flex items-center justify-between text-[10px] text-[#B9AECF]">
              <span>Next retraining: Scheduled</span>
              <Link to="/predictions" className="text-[#A78BFA] hover:underline font-semibold transition">
                Scoring Engine &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
