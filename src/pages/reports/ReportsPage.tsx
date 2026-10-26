import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { IssueReport, IssueCategory, ReportSeverity, ReportStatus } from '../../types';
import {
  AlertTriangle,
  PlusCircle,
  Eye,
  Filter,
  CheckCircle2,
  Clock,
  UserCheck,
  CalendarCheck,
  FileImage,
  ArrowRight,
  ExternalLink,
  MapPin
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { reports, roads, createReport, updateReport, addToast } = useApp();

  const [selectedReport, setSelectedReport] = useState<IssueReport | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Add form fields
  const [formSegmentId, setFormSegmentId] = useState('RD-101');
  const [formCategory, setFormCategory] = useState<IssueCategory>('Pothole');
  const [formSeverity, setFormSeverity] = useState<ReportSeverity>('High');
  const [formDescription, setFormDescription] = useState('');
  const [formSource, setFormSource] = useState<'Citizen App' | 'Field Officer' | 'Automated Sensor' | 'Municipal Patrol'>('Field Officer');
  const [formReporterName, setFormReporterName] = useState('Er. Inspection Desk');
  const [formImageUrl, setFormImageUrl] = useState('');

  // Check search param
  React.useEffect(() => {
    const q = searchParams.get('search');
    if (q) {
      const match = reports.find(r => r.id === q);
      if (match) setSelectedReport(match);
    }
  }, [searchParams, reports]);

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;
      if (severityFilter !== 'ALL' && r.severity !== severityFilter) return false;
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      return true;
    });
  }, [reports, categoryFilter, severityFilter, statusFilter]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription.trim()) {
      addToast('warning', 'Missing Description', 'Please provide distress details.');
      return;
    }

    const road = roads.find(r => r.id === formSegmentId);
    if (!road) return;

    await createReport({
      segmentId: formSegmentId,
      roadName: road.name,
      category: formCategory,
      severity: formSeverity,
      source: formSource,
      reportDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Submitted',
      assignedTeam: 'Central Inspection Desk',
      description: formDescription,
      coordinates: road.coordinates,
      imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
      reporterName: formReporterName,
    });

    setShowAddModal(false);
    setFormDescription('');
    setFormImageUrl('');
  };

  const handleAdvanceStatus = async (report: IssueReport, nextStatus: ReportStatus) => {
    await updateReport(report.id, {
      status: nextStatus,
      verifiedBy: 'Chief Engineer Office',
    });
    setSelectedReport(prev => (prev ? { ...prev, status: nextStatus } : null));
  };

  const columns: Column<IssueReport>[] = [
    {
      key: 'id',
      header: 'Report ID',
      sortable: true,
      width: '120px',
      render: r => (
        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {r.id}
        </span>
      ),
    },
    {
      key: 'roadName',
      header: 'Road Segment',
      sortable: true,
      render: r => (
        <div>
          <span className="font-bold text-[#172033] block">{r.roadName}</span>
          <span className="text-[11px] font-mono text-[#94A3B8]">{r.segmentId}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: r => (
        <span className="font-medium text-[#172033] flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          {r.category}
        </span>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      sortable: true,
      render: r => {
        const color = {
          Critical: 'text-red-700 bg-red-50 border-red-200',
          High: 'text-orange-700 bg-orange-50 border-orange-200',
          Medium: 'text-amber-700 bg-amber-50 border-amber-200',
          Low: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        }[r.severity];
        return (
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${color}`}>
            {r.severity}
          </span>
        );
      },
    },
    {
      key: 'source',
      header: 'Source',
      sortable: true,
      render: r => <span className="text-xs text-[#64748B]">{r.source}</span>,
    },
    {
      key: 'reportDate',
      header: 'Report Date',
      sortable: true,
      render: r => <span className="text-[11px] text-[#64748B]">{r.reportDate}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: r => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: r => (
        <button
          onClick={e => {
            e.stopPropagation();
            setSelectedReport(r);
          }}
          className="p-1.5 text-[#64748B] hover:text-blue-600 rounded hover:bg-slate-100 transition"
          title="Inspect details and status workflow"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Distress &amp; Issue Reports"
        subtitle="Manage citizen, automated sensor, and patrol road distress tickets through multi-stage municipal verification."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#172033] border border-slate-200">
            {filteredReports.length} records
          </span>
        }
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Issue Report</span>
          </button>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1 text-[#64748B] font-semibold">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>Filters:</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[#64748B]">Category:</span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="p-1.5 border border-[#E2E8F0] rounded-lg bg-slate-50 font-medium text-[#172033] focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Pothole">Pothole</option>
            <option value="Surface cracking">Surface cracking</option>
            <option value="Waterlogging">Waterlogging</option>
            <option value="Road subsidence">Road subsidence</option>
            <option value="Surface deterioration">Surface deterioration</option>
            <option value="Edge failure">Edge failure</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[#64748B]">Severity:</span>
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="p-1.5 border border-[#E2E8F0] rounded-lg bg-slate-50 font-medium text-[#172033] focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[#64748B]">Workflow Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-1.5 border border-[#E2E8F0] rounded-lg bg-slate-50 font-medium text-[#172033] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Verified">Verified</option>
            <option value="Inspection Scheduled">Inspection Scheduled</option>
            <option value="Maintenance Planned">Maintenance Planned</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {(categoryFilter !== 'ALL' || severityFilter !== 'ALL' || statusFilter !== 'ALL') && (
          <button
            onClick={() => {
              setCategoryFilter('ALL');
              setSeverityFilter('ALL');
              setStatusFilter('ALL');
            }}
            className="text-xs text-blue-600 hover:underline font-medium ml-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredReports}
        searchKey={(r: IssueReport) => `${r.id} ${r.roadName} ${r.category} ${r.description}`}
        searchPlaceholder="Search by report ID, road name, or description..."
        exportFileName="roadwatch-issue-reports"
        onRowClick={r => setSelectedReport(r)}
      />

      {/* Report Detail Drawer */}
      <DetailDrawer
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title={selectedReport ? `${selectedReport.category} — ${selectedReport.id}` : ''}
        subtitle={selectedReport?.roadName}
        footer={
          selectedReport && (
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => navigate(`/map?select=${selectedReport.segmentId}`)}
                className="px-3 py-1.5 text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" /> View on Map
              </button>

              <div className="flex items-center gap-2">
                {selectedReport.status === 'Submitted' && (
                  <button
                    onClick={() => handleAdvanceStatus(selectedReport, 'Under Review')}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                  >
                    Mark Under Review
                  </button>
                )}
                {selectedReport.status === 'Under Review' && (
                  <button
                    onClick={() => handleAdvanceStatus(selectedReport, 'Verified')}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                  >
                    Verify Distress
                  </button>
                )}
                {selectedReport.status === 'Verified' && (
                  <button
                    onClick={() => handleAdvanceStatus(selectedReport, 'Inspection Scheduled')}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                  >
                    Schedule Field Inspection
                  </button>
                )}
                {selectedReport.status === 'Inspection Scheduled' && (
                  <button
                    onClick={() => handleAdvanceStatus(selectedReport, 'Maintenance Planned')}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                  >
                    Integrate to Work Plan
                  </button>
                )}
                {selectedReport.status === 'Maintenance Planned' && (
                  <button
                    onClick={() => handleAdvanceStatus(selectedReport, 'Resolved')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          )
        }
      >
        {selectedReport && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-800 border">
                {selectedReport.id}
              </span>
              <StatusBadge status={selectedReport.status} />
            </div>

            {/* Photo preview if present */}
            {selectedReport.imageUrl && (
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[#64748B] flex items-center gap-1">
                  <FileImage className="w-3.5 h-3.5" /> Distress Photograph Attachment
                </span>
                <div className="relative rounded-xl overflow-hidden border border-[#E2E8F0] max-h-48">
                  <img
                    src={selectedReport.imageUrl}
                    alt={selectedReport.category}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded">
                    Visual Evidence Validated
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#64748B]">Distress Narrative</span>
              <p className="text-xs text-[#172033] leading-relaxed">{selectedReport.description}</p>
            </div>

            {/* Meta Attributes */}
            <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl border border-[#E2E8F0]">
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Severity</span>
                <p className="font-bold text-[#172033]">{selectedReport.severity}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Intake Channel</span>
                <p className="font-bold text-[#172033]">{selectedReport.source}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Reported By</span>
                <p className="font-bold text-[#172033]">{selectedReport.reporterName || 'Civic Portal'}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Assigned Squad</span>
                <p className="font-bold text-[#172033]">{selectedReport.assignedTeam || 'Unassigned'}</p>
              </div>
            </div>

            {/* Workflow Progress Timeline */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">
                Workflow Progress History
              </h4>
              <div className="border-l-2 border-blue-200 ml-2 pl-4 space-y-4">
                {selectedReport.statusHistory?.map((step, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-white" />
                    <div className="font-bold text-[#172033]">{step.status}</div>
                    <div className="text-[10px] text-[#94A3B8]">
                      {step.timestamp} &bull; {step.updatedBy}
                    </div>
                    {step.notes && <p className="text-[11px] text-[#64748B] mt-0.5">{step.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* Add Issue Report Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E2E8F0] max-w-lg w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#172033]">Submit Municipal Issue Report</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#94A3B8] hover:text-[#172033]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-[#172033] mb-1">Affected Road Segment</label>
                <select
                  value={formSegmentId}
                  onChange={e => setFormSegmentId(e.target.value)}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white"
                >
                  {roads.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.id}) &bull; {r.ward}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Distress Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as IssueCategory)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white"
                  >
                    <option value="Pothole">Pothole</option>
                    <option value="Surface cracking">Surface cracking</option>
                    <option value="Waterlogging">Waterlogging</option>
                    <option value="Road subsidence">Road subsidence</option>
                    <option value="Surface deterioration">Surface deterioration</option>
                    <option value="Edge failure">Edge failure</option>
                    <option value="Other">Other Distress</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Severity Level</label>
                  <select
                    value={formSeverity}
                    onChange={e => setFormSeverity(e.target.value as ReportSeverity)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white"
                  >
                    <option value="Critical">Critical (Immediate hazard)</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1">Detailed Description &amp; Dimensions</label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="State exact landmark, lane number, depth/extent, and traffic hazard..."
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Reporting Source</label>
                  <select
                    value={formSource}
                    onChange={e => setFormSource(e.target.value as any)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white"
                  >
                    <option value="Field Officer">Field Officer</option>
                    <option value="Citizen App">Citizen App</option>
                    <option value="Municipal Patrol">Municipal Patrol</option>
                    <option value="Automated Sensor">Automated Sensor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Reporter Reference / Officer</label>
                  <input
                    type="text"
                    value={formReporterName}
                    onChange={e => setFormReporterName(e.target.value)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1">Distress Photo URL (Optional)</label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={e => setFormImageUrl(e.target.value)}
                  placeholder="https://... (or leave blank for standard distress thumbnail)"
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 border border-[#E2E8F0] rounded-lg font-medium text-[#64748B] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Register Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
