import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/common/PageHeader';
import { ANALYTICS_DATA } from '../../mock/analytics';
import {
  Download,
  Printer,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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
      'Metric,Category,Value\n' +
      'Potholes,Issue Volume,42\n' +
      'Surface Cracking,Issue Volume,28\n' +
      'Waterlogging,Issue Volume,18\n' +
      'Inspection Compliance,October,92%\n' +
      'Maintenance Spend,MTD,$185k';

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

  const COLORS = ['#FB7185', '#FBBF24', '#A78BFA', '#34D399', '#60A5FA', '#C4B5FD'];

  const tooltipStyle = {
    backgroundColor: '#211735',
    borderColor: '#3B2D53',
    color: '#F5F3FF',
    borderRadius: '8px',
    fontSize: '11px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
  };

  return (
    <div className="space-y-6 print:space-y-4 print:p-0 min-w-0">
      <PageHeader
        title="Analytics &amp; Infrastructure Insights"
        subtitle="Empirical engineering analytics evaluating network condition trends, distress distributions, and resource allocation."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30">
            Analytics Suite
          </span>
        }
        actions={
          <>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#F5F3FF] bg-[#2B2042] border border-[#3B2D53] rounded-lg hover:bg-[#3B2D53] transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#B9AECF]" />
              <span>Print</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-lg shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </>
        }
      />

      {/* Filter Bar */}
      <div className="bg-[#211735] p-3.5 rounded-xl border border-[#3B2D53] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs print:hidden min-w-0 text-[#F5F3FF]">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 text-[#B9AECF] font-semibold">
            <Filter className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Scope:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#B9AECF]">Time Period:</span>
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className="p-1.5 border border-[#3B2D53] rounded-lg bg-[#140E22] font-medium text-[#F5F3FF] focus:outline-none"
            >
              <option value="2024 YTD">2024 Year-to-Date</option>
              <option value="Past 12 Months">Past 12 Months</option>
              <option value="All Historical">Historical Records</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#B9AECF]">Ward Zone:</span>
            <select
              value={selectedWard}
              onChange={e => setSelectedWard(e.target.value)}
              className="p-1.5 border border-[#3B2D53] rounded-lg bg-[#140E22] font-medium text-[#F5F3FF] focus:outline-none"
            >
              <option value="ALL">All Municipal Wards</option>
              <option value="North Zone">North Zone (Ward 4)</option>
              <option value="East Zone">East District (Ward 8)</option>
              <option value="South Zone">South Hub (Ward 11)</option>
              <option value="Central Zone">Central Zone (Ward 3)</option>
            </select>
          </div>
        </div>

        <span className="text-[11px] text-[#B9AECF]">
          Network Telemetry Aggregated
        </span>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        {/* 1. Road Condition Trends Over Time */}
        <div className="bg-[#211735] p-5 rounded-xl border border-[#3B2D53] shadow-xs min-w-0 overflow-hidden text-[#F5F3FF]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#F5F3FF] uppercase tracking-wider">
                1. Road Condition Distribution Over Time (%)
              </h3>
              <p className="text-[11px] text-[#B9AECF]">Historical condition progression across network</p>
            </div>
            <span className="text-[10px] font-mono text-[#B9AECF]">Quarterly</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ANALYTICS_DATA.conditionTrends} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3B2D53" />
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#B9AECF' }} stroke="#3B2D53" />
                <YAxis tick={{ fontSize: 10, fill: '#B9AECF' }} stroke="#3B2D53" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px', color: '#B9AECF' }} />
                <Area type="monotone" dataKey="Good" stackId="1" stroke="#34D399" fill="#34D399" fillOpacity={0.8} />
                <Area type="monotone" dataKey="Fair" stackId="1" stroke="#60A5FA" fill="#60A5FA" fillOpacity={0.8} />
                <Area type="monotone" dataKey="Poor" stackId="1" stroke="#FBBF24" fill="#FBBF24" fillOpacity={0.8} />
                <Area type="monotone" dataKey="Critical" stackId="1" stroke="#FB7185" fill="#FB7185" fillOpacity={0.8} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Issue Frequency by Category */}
        <div className="bg-[#211735] p-5 rounded-xl border border-[#3B2D53] shadow-xs min-w-0 overflow-hidden text-[#F5F3FF]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#F5F3FF] uppercase tracking-wider">
                2. Distress Ticket Intake Frequency
              </h3>
              <p className="text-[11px] text-[#B9AECF]">Distribution of logged citizen &amp; patrol distress reports</p>
            </div>
            <span className="text-[11px] font-bold text-[#FB7185]">Potholes Leading</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ANALYTICS_DATA.issuesByCategory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3B2D53" />
                <XAxis dataKey="category" tick={{ fontSize: 9, fill: '#B9AECF' }} stroke="#3B2D53" />
                <YAxis tick={{ fontSize: 10, fill: '#B9AECF' }} stroke="#3B2D53" />
                <Tooltip contentStyle={tooltipStyle} />
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
        <div className="bg-[#211735] p-5 rounded-xl border border-[#3B2D53] shadow-xs min-w-0 overflow-hidden text-[#F5F3FF]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#F5F3FF] uppercase tracking-wider">
                3. Predicted Risk by Ward
              </h3>
              <p className="text-[11px] text-[#B9AECF]">Geographic comparison of pavement vulnerability</p>
            </div>
            <span className="text-[10px] text-[#FB7185] font-semibold">Ward 4 Highest</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ANALYTICS_DATA.riskByWard}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 60, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#3B2D53" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#B9AECF' }} stroke="#3B2D53" />
                <YAxis type="category" dataKey="ward" tick={{ fontSize: 9, fill: '#B9AECF' }} stroke="#3B2D53" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="avgRisk" name="Avg Risk (0-100)" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. High-Risk Road Clusters */}
        <div className="bg-[#211735] p-5 rounded-xl border border-[#3B2D53] shadow-xs flex flex-col justify-between min-w-0 overflow-hidden text-[#F5F3FF]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-[#F5F3FF] uppercase tracking-wider">
                  4. High-Risk Road Clusters
                </h3>
                <p className="text-[11px] text-[#B9AECF]">Spatial corridors with co-located distress triggers</p>
              </div>
              <span className="text-[10px] font-mono text-[#FB7185] bg-[#FB7185]/15 px-2 py-0.5 rounded border border-[#FB7185]/30">
                Critical Corridors
              </span>
            </div>

            <div className="space-y-2.5">
              {ANALYTICS_DATA.highRiskClusters.map(cluster => (
                <div key={cluster.clusterName} className="p-3 rounded-lg border border-[#3B2D53] bg-[#140E22] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F5F3FF]">{cluster.clusterName}</span>
                    <span className="font-extrabold text-[#FB7185] text-sm">{cluster.avgRisk} / 100</span>
                  </div>
                  <div className="flex items-center justify-between text-[#B9AECF] text-[11px]">
                    <span>Segments: <strong className="text-[#F5F3FF]">{cluster.segmentCount}</strong></span>
                    <span>Stressor: <strong className="text-[#A78BFA]">{cluster.dominantFactor}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Inspection Completion Rate */}
        <div className="bg-[#211735] p-5 rounded-xl border border-[#3B2D53] shadow-xs min-w-0 overflow-hidden text-[#F5F3FF]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#F5F3FF] uppercase tracking-wider">
                5. Inspection Execution &amp; Compliance (%)
              </h3>
              <p className="text-[11px] text-[#B9AECF]">Monthly scheduled vs completed audit execution</p>
            </div>
            <span className="text-[11px] font-bold text-[#34D399] bg-[#34D399]/15 px-2.5 py-0.5 rounded border border-[#34D399]/30">
              Avg 90% Rate
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ANALYTICS_DATA.inspectionCompletion} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3B2D53" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#B9AECF' }} stroke="#3B2D53" />
                <YAxis domain={[70, 100]} tick={{ fontSize: 10, fill: '#B9AECF' }} stroke="#3B2D53" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="rate"
                  name="Compliance %"
                  stroke="#34D399"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#34D399' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Capital Maintenance Spending */}
        <div className="bg-[#211735] p-5 rounded-xl border border-[#3B2D53] shadow-xs min-w-0 overflow-hidden text-[#F5F3FF]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#F5F3FF] uppercase tracking-wider">
                6. Capital Maintenance Spending ($k)
              </h3>
              <p className="text-[11px] text-[#B9AECF]">Monthly outlay across repair disciplines</p>
            </div>
            <span className="text-[10px] text-[#B9AECF] font-mono">FY24 Outlay</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ANALYTICS_DATA.maintenanceSpending} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3B2D53" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#B9AECF' }} stroke="#3B2D53" />
                <YAxis tick={{ fontSize: 10, fill: '#B9AECF' }} stroke="#3B2D53" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px', color: '#B9AECF' }} />
                <Bar dataKey="structuralOverlays" name="Overlays" stackId="a" fill="#8B5CF6" />
                <Bar dataKey="routineRepairs" name="Routine Repairs" stackId="a" fill="#60A5FA" />
                <Bar dataKey="emergencyPothole" name="Pothole Patching" stackId="a" fill="#FBBF24" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
