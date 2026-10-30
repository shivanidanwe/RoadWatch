import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { IssueReport, IssueCategory, ReportSeverity, ReportStatus } from '../../types';
import { apiService } from '../../services/api';
import {
  AlertTriangle,
  PlusCircle,
  Eye,
  Filter,
  FileImage,
  MapPin,
  Navigation,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Sparkles,
  Zap,
  Calendar,
  Wrench,
  ShieldCheck,
  Ban
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { reports, roads, createReport, updateReport, verifyReport, addToast } = useApp();

  const [selectedReport, setSelectedReport] = useState<IssueReport | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [areaFilter, setAreaFilter] = useState('ALL');
  const [verificationFilter, setVerificationFilter] = useState('ALL');

  // New Report Form fields
  const [formRoadName, setFormRoadName] = useState('');
  const [formArea, setFormArea] = useState('City Central');
  const [formLat, setFormLat] = useState('12.9716');
  const [formLng, setFormLng] = useState('77.5946');
  const [formCategory, setFormCategory] = useState<IssueCategory>('Pothole');
  const [formSeverity, setFormSeverity] = useState<ReportSeverity>('High');
  const [formDescription, setFormDescription] = useState('');
  const [formReporterName, setFormReporterName] = useState('Citizen Reporter');
  const [formReporterContact, setFormReporterContact] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  // Extract unique areas for the filter dropdown
  const uniqueAreas = useMemo(() => {
    const set = new Set<string>();
    reports.forEach(r => {
      if (r.area && r.area.trim()) set.add(r.area.trim());
    });
    return Array.from(set).sort();
  }, [reports]);

  // Sync selected report from URL or updates
  React.useEffect(() => {
    const q = searchParams.get('search');
    if (q) {
      const match = reports.find(r => r.id === q || r.reportCode === q);
      if (match) setSelectedReport(match);
    }
  }, [searchParams, reports]);

  // Keep selectedReport synchronized with latest reports list
  React.useEffect(() => {
    if (selectedReport) {
      const current = reports.find(r => r.id === selectedReport.id);
      if (current) setSelectedReport(current);
    }
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;
      if (severityFilter !== 'ALL' && r.severity !== severityFilter) return false;
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (areaFilter !== 'ALL' && r.area !== areaFilter) return false;
      if (verificationFilter !== 'ALL') {
        const vStatus = r.verificationStatus || 'Pending';
        if (vStatus !== verificationFilter) return false;
      }
      return true;
    });
  }, [reports, categoryFilter, severityFilter, statusFilter, areaFilter, verificationFilter]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      addToast('warning', 'Geolocation Unavailable', 'Your browser does not support GPS geolocation.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormLat(position.coords.latitude.toFixed(6));
        setFormLng(position.coords.longitude.toFixed(6));
        setIsLocating(false);
        addToast('success', 'Location Acquired', `GPS: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
      },
      () => {
        setIsLocating(false);
        addToast('info', 'Manual Location Fallback', 'Could not obtain GPS lock. Using manual coordinates.');
      },
      { timeout: 8000 }
    );
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoadName.trim()) {
      addToast('warning', 'Missing Road Name', 'Please provide the name of the road.');
      return;
    }
    if (!formDescription.trim()) {
      addToast('warning', 'Missing Description', 'Please provide distress details.');
      return;
    }

    setIsSubmitting(true);
    try {
      const lat = parseFloat(formLat) || 12.9716;
      const lng = parseFloat(formLng) || 77.5946;

      const created = await createReport({
        roadName: formRoadName.trim(),
        coordinates: [lat, lng],
        category: formCategory,
        severity: formSeverity,
        description: formDescription.trim(),
        imageUrl: formImageUrl.trim() || undefined,
        reporterName: formReporterName.trim() || 'Citizen Reporter',
        reporterContact: formReporterContact.trim() || undefined,
        source: 'Citizen App',
      });

      setShowAddModal(false);
      setFormRoadName('');
      setFormDescription('');
      setFormImageUrl('');
      setFormReporterContact('');
      addToast(
        'success',
        'Report Submitted',
        `Report ${created.id} saved with priority ${created.priorityLevel || 'High'}.`
      );
    } catch (err) {
      addToast('error', 'Submission Failed', 'Could not save report to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdvanceStatus = async (report: IssueReport, nextStatus: ReportStatus) => {
    try {
      await updateReport(report.id, {
        status: nextStatus,
        verifiedBy: 'Municipal Authority Admin',
      });
      setSelectedReport(prev => (prev ? { ...prev, status: nextStatus } : null));
    } catch {
      addToast('error', 'Update Failed', 'Failed to update report status.');
    }
  };

  const handleVerify = async (report: IssueReport) => {
    setIsVerifying(true);
    try {
      await verifyReport(report.id, 'Verified', 'Verified by Municipal Authority Admin');
      setSelectedReport(prev => prev ? { ...prev, verificationStatus: 'Verified', status: 'Verified' } : null);
    } catch {
      addToast('error', 'Verification Failed', 'Could not verify report.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReject = async (report: IssueReport) => {
    if (!rejectionReason.trim()) {
      addToast('warning', 'Reason Required', 'Please provide a justification for rejecting this report.');
      return;
    }
    setIsVerifying(true);
    try {
      await verifyReport(report.id, 'Rejected', 'Rejected by Municipal Authority Admin', rejectionReason.trim());
      setSelectedReport(prev => prev ? { ...prev, verificationStatus: 'Rejected', status: 'Rejected', rejectionReason: rejectionReason.trim() } : null);
      setShowRejectModal(false);
      setRejectionReason('');
    } catch {
      addToast('error', 'Rejection Failed', 'Could not reject report.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleExportCSV = () => {
    window.open(apiService.getExportCsvUrl(), '_blank');
  };

  const getFullImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('/uploads')) {
      return `http://localhost:8000${url}`;
    }
    return url;
  };

  const columns: Column<IssueReport>[] = [
    {
      key: 'id',
      header: 'Complaint ID',
      sortable: true,
      width: '130px',
      render: r => (
        <span className="font-mono text-xs font-bold text-[#C4B5FD] bg-[#8B5CF6]/20 px-2 py-0.5 rounded border border-[#8B5CF6]/30">
          {r.reportCode || r.id}
        </span>
      ),
    },
    {
      key: 'roadName',
      header: 'Road Corridor & Area',
      sortable: true,
      render: r => (
        <div>
          <span className="font-semibold text-[#F5F3FF] block">{r.roadName}</span>
          <span className="text-[11px] text-[#B9AECF]">
            {r.area ? `${r.area} • ` : ''}
            {r.coordinates ? `${r.coordinates[0].toFixed(4)}, ${r.coordinates[1].toFixed(4)}` : r.segmentId}
          </span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Damage Type',
      sortable: true,
      render: r => (
        <span className="font-medium text-[#F5F3FF] flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-[#FBBF24]" />
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
          Critical: 'text-[#FB7185] bg-[#FB7185]/15 border-[#FB7185]/40',
          High: 'text-[#FBBF24] bg-[#FBBF24]/15 border-[#FBBF24]/40',
          Medium: 'text-[#60A5FA] bg-[#60A5FA]/15 border-[#60A5FA]/40',
          Low: 'text-[#34D399] bg-[#34D399]/15 border-[#34D399]/40',
        }[r.severity];
        return (
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
            {r.severity}
          </span>
        );
      },
    },
    {
      key: 'verificationStatus',
      header: 'Verification',
      sortable: true,
      render: r => {
        const vStatus = r.verificationStatus || 'Pending';
        if (vStatus === 'Verified') {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#34D399] bg-[#34D399]/15 px-2 py-0.5 rounded-full border border-[#34D399]/30">
              <ShieldCheck className="w-3 h-3" /> Verified
            </span>
          );
        }
        if (vStatus === 'Rejected') {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FB7185] bg-[#FB7185]/15 px-2 py-0.5 rounded-full border border-[#FB7185]/30">
              <Ban className="w-3 h-3" /> Rejected
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FBBF24] bg-[#FBBF24]/15 px-2 py-0.5 rounded-full border border-[#FBBF24]/30">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
      },
    },
    {
      key: 'reportDate',
      header: 'Submitted',
      sortable: true,
      render: r => <span className="text-[11px] text-[#B9AECF]">{r.reportDate}</span>,
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
          className="p-1.5 text-[#B9AECF] hover:text-[#A78BFA] rounded hover:bg-[#2B2042] transition"
          title="Inspect details"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 min-w-0">
      <PageHeader
        title="Road Damage Reports"
        subtitle="Review, verify, and prioritize incoming citizen distress complaints and road maintenance tickets."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30">
            {filteredReports.length} Complaints Displayed
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#F5F3FF] bg-[#2B2042] hover:bg-[#3B2D53] border border-[#3B2D53] rounded-lg shadow-xs transition"
              title="Download CSV export of reports"
            >
              <Download className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-lg shadow-xs transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Submit Report</span>
            </button>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="bg-[#211735] p-3.5 rounded-xl border border-[#3B2D53] shadow-xs flex flex-wrap items-center gap-3 text-xs min-w-0 text-[#F5F3FF]">
        <div className="flex items-center gap-1 text-[#B9AECF] font-semibold">
          <Filter className="w-3.5 h-3.5 text-[#A78BFA]" />
          <span>Filters:</span>
        </div>

        {/* Damage Type Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#B9AECF]">Type:</span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="p-1.5 border border-[#3B2D53] rounded-lg bg-[#140E22] font-medium text-[#F5F3FF] focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="Pothole">Pothole</option>
            <option value="Road cracks">Road cracks</option>
            <option value="Surface damage">Surface damage</option>
            <option value="Waterlogging">Waterlogging</option>
            <option value="Broken road">Broken road</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#B9AECF]">Severity:</span>
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="p-1.5 border border-[#3B2D53] rounded-lg bg-[#140E22] font-medium text-[#F5F3FF] focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Area Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#B9AECF]">Area:</span>
          <select
            value={areaFilter}
            onChange={e => setAreaFilter(e.target.value)}
            className="p-1.5 border border-[#3B2D53] rounded-lg bg-[#140E22] font-medium text-[#F5F3FF] focus:outline-none"
          >
            <option value="ALL">All Areas</option>
            {uniqueAreas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#B9AECF]">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-1.5 border border-[#3B2D53] rounded-lg bg-[#140E22] font-medium text-[#F5F3FF] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="New">New</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Verified">Verified</option>
            <option value="Inspection Scheduled">Inspection Scheduled</option>
            <option value="Maintenance Planned">Maintenance Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Verification Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#B9AECF]">Verification:</span>
          <select
            value={verificationFilter}
            onChange={e => setVerificationFilter(e.target.value)}
            className="p-1.5 border border-[#3B2D53] rounded-lg bg-[#140E22] font-medium text-[#F5F3FF] focus:outline-none"
          >
            <option value="ALL">All Records</option>
            <option value="Pending">Pending Review</option>
            <option value="Verified">Verified Only</option>
            <option value="Rejected">Rejected Only</option>
          </select>
        </div>

        {(categoryFilter !== 'ALL' || severityFilter !== 'ALL' || statusFilter !== 'ALL' || areaFilter !== 'ALL' || verificationFilter !== 'ALL') && (
          <button
            onClick={() => {
              setCategoryFilter('ALL');
              setSeverityFilter('ALL');
              setStatusFilter('ALL');
              setAreaFilter('ALL');
              setVerificationFilter('ALL');
            }}
            className="text-xs text-[#A78BFA] hover:underline font-semibold ml-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredReports}
        searchKey={(r: IssueReport) => `${r.id} ${r.reportCode || ''} ${r.roadName} ${r.area || ''} ${r.category} ${r.description}`}
        searchPlaceholder="Search by road name, complaint ID, or description..."
        exportFileName="roadwatch-citizen-damage-reports"
        onRowClick={r => setSelectedReport(r)}
      />

      {/* Report Detail Drawer */}
      <DetailDrawer
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title={selectedReport ? `${selectedReport.category} — ${selectedReport.reportCode || selectedReport.id}` : ''}
        subtitle={selectedReport ? `${selectedReport.roadName} (${selectedReport.area || 'Municipal Ward'})` : ''}
        footer={
          selectedReport && (
            <div className="flex items-center justify-between w-full flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/map?select=${selectedReport.segmentId || selectedReport.id}`)}
                  className="px-3 py-1.5 text-xs text-[#A78BFA] font-semibold hover:underline flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5" /> View on Map
                </button>
                <button
                  onClick={() => navigate(`/inspections?reportId=${selectedReport.id}`)}
                  className="px-3 py-1.5 text-xs text-[#60A5FA] font-semibold hover:underline flex items-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5" /> Schedule Inspection
                </button>
                <button
                  onClick={() => navigate(`/maintenance?reportId=${selectedReport.id}`)}
                  className="px-3 py-1.5 text-xs text-[#34D399] font-semibold hover:underline flex items-center gap-1"
                >
                  <Wrench className="w-3.5 h-3.5" /> Plan Repair
                </button>
              </div>

              <div className="flex items-center gap-2">
                {selectedReport.verificationStatus !== 'Verified' && selectedReport.status !== 'Rejected' && (
                  <>
                    <button
                      onClick={() => handleVerify(selectedReport)}
                      disabled={isVerifying}
                      className="px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Verify Distress</span>
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={isVerifying}
                      className="px-3 py-1.5 rounded-lg bg-[#FB7185]/20 hover:bg-[#FB7185]/30 text-[#FB7185] border border-[#FB7185]/40 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        }
      >
        {selectedReport && (
          <div className="space-y-4 text-xs text-[#F5F3FF]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#8B5CF6]/20 font-bold text-[#C4B5FD] border border-[#8B5CF6]/30">
                {selectedReport.reportCode || selectedReport.id}
              </span>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedReport.status} />
                {selectedReport.verificationStatus === 'Verified' && (
                  <span className="text-[11px] font-semibold text-[#34D399] bg-[#34D399]/15 px-2 py-0.5 rounded-full border border-[#34D399]/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                )}
                {selectedReport.verificationStatus === 'Rejected' && (
                  <span className="text-[11px] font-semibold text-[#FB7185] bg-[#FB7185]/15 px-2 py-0.5 rounded-full border border-[#FB7185]/30 flex items-center gap-1">
                    <Ban className="w-3 h-3" /> Rejected
                  </span>
                )}
              </div>
            </div>

            {/* Rejection notice if rejected */}
            {selectedReport.verificationStatus === 'Rejected' && selectedReport.rejectionReason && (
              <div className="p-3.5 rounded-xl bg-[#FB7185]/10 border border-[#FB7185]/30 text-[#FB7185] space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Report Rejected by Authority
                </span>
                <p className="text-xs leading-relaxed text-[#F5F3FF]">
                  {selectedReport.rejectionReason}
                </p>
              </div>
            )}

            {/* Quick Status Update Selector */}
            <div className="p-3.5 rounded-xl bg-[#140E22] border border-[#3B2D53] flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold tracking-wider block">
                  Update Report Status
                </span>
                <span className="text-[11px] text-[#B9AECF]">
                  Transition workflow stage directly
                </span>
              </div>
              <select
                value={selectedReport.status}
                onChange={e => handleAdvanceStatus(selectedReport, e.target.value as ReportStatus)}
                className="p-1.5 border border-[#8B5CF6]/40 rounded-lg bg-[#211735] text-xs font-semibold text-[#F5F3FF] focus:outline-none"
              >
                <option value="New">New</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Verified">Verified</option>
                <option value="Inspection Scheduled">Inspection Scheduled</option>
                <option value="Maintenance Planned">Maintenance Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Urgency Score Card */}
            {selectedReport.priorityScore !== undefined && (
              <div className="p-3.5 rounded-xl bg-[#140E22] border border-[#3B2D53] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#B9AECF] uppercase font-bold tracking-wider">Computed Urgency Score</span>
                  <div className="text-lg font-bold text-[#FB7185] flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-[#FBBF24]" />
                    {selectedReport.priorityScore} / 100
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Priority Class</span>
                  <div className="text-xs font-bold text-[#A78BFA]">{selectedReport.priorityLevel || selectedReport.severity}</div>
                </div>
              </div>
            )}

            {/* Photo preview */}
            {selectedReport.imageUrl && (
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[#B9AECF] flex items-center gap-1">
                  <FileImage className="w-3.5 h-3.5 text-[#A78BFA]" /> Uploaded Road Damage Photograph
                </span>
                <div className="relative rounded-xl overflow-hidden border border-[#3B2D53] max-h-56 bg-black/40">
                  <img
                    src={getFullImageUrl(selectedReport.imageUrl)}
                    alt={selectedReport.category}
                    className="w-full h-full object-contain max-h-56 mx-auto"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <div className="p-3.5 rounded-xl bg-[#140E22] border border-[#3B2D53] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#B9AECF]">Distress Description</span>
              <p className="text-xs text-[#F5F3FF] leading-relaxed">{selectedReport.description}</p>
            </div>

            {/* Meta Attributes */}
            <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl border border-[#3B2D53] bg-[#140E22]">
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Road Corridor</span>
                <p className="font-bold text-[#F5F3FF]">{selectedReport.roadName}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Locality / Area</span>
                <p className="font-bold text-[#F5F3FF]">{selectedReport.area || 'Municipal Ward'}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Coordinates</span>
                <p className="font-mono text-[11px] text-[#F5F3FF]">
                  {selectedReport.coordinates ? `${selectedReport.coordinates[0].toFixed(5)}, ${selectedReport.coordinates[1].toFixed(5)}` : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Severity</span>
                <p className="font-bold text-[#F5F3FF]">{selectedReport.severity}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Reporter</span>
                <p className="font-bold text-[#F5F3FF]">{selectedReport.reporterName || 'Citizen Portal'}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Source</span>
                <p className="font-bold text-[#F5F3FF]">{selectedReport.source || 'Citizen App'}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Submitted Date</span>
                <p className="font-medium text-[#B9AECF]">{selectedReport.reportDate}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Assigned Squad</span>
                <p className="font-bold text-[#F5F3FF]">{selectedReport.assignedTeam || 'Unassigned'}</p>
              </div>
            </div>

            {/* Workflow Progress Timeline */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[10px] uppercase font-bold text-[#B9AECF] tracking-wider">
                Status History &amp; Audit Trail
              </h4>
              <div className="border-l-2 border-[#8B5CF6]/40 ml-2 pl-4 space-y-3">
                {selectedReport.statusHistory?.map((step, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
                    <div className="font-bold text-[#F5F3FF]">{step.status}</div>
                    <div className="text-[10px] text-[#B9AECF]">
                      {step.timestamp} &bull; {step.updatedBy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* Reject Confirmation Dialog */}
      {showRejectModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#211735] rounded-xl shadow-2xl border border-[#3B2D53] max-w-md w-full p-6 text-xs space-y-4 text-[#F5F3FF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#3B2D53]">
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4 text-[#FB7185]" />
                <h3 className="text-sm font-bold text-[#F5F3FF]">Reject Complaint</h3>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-[#B9AECF] hover:text-[#F5F3FF] text-base"
              >
                ✕
              </button>
            </div>

            <p className="text-[#B9AECF] leading-relaxed">
              Please enter an official reason for rejecting complaint <strong className="text-[#F5F3FF]">{selectedReport.reportCode || selectedReport.id}</strong>. This explanation will be recorded in the audit trail.
            </p>

            <div>
              <label className="block font-semibold text-[#F5F3FF] mb-1">
                Rejection Reason <span className="text-[#FB7185]">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g. Duplicate report, private property not under municipal jurisdiction, or no distress found during preliminary check..."
                className="w-full p-2.5 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] placeholder-[#B9AECF]/50 focus:border-[#FB7185] focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#3B2D53]">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-3.5 py-1.5 rounded-lg border border-[#3B2D53] text-[#B9AECF] hover:text-[#F5F3FF] hover:bg-[#2B2042] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReject(selectedReport)}
                disabled={isVerifying || !rejectionReason.trim()}
                className="px-4 py-1.5 rounded-lg bg-[#FB7185] hover:bg-[#E11D48] text-white font-semibold transition disabled:opacity-50"
              >
                {isVerifying ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Road Issue Report Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#211735] rounded-xl shadow-2xl border border-[#3B2D53] max-w-lg w-full p-6 text-xs space-y-4 text-[#F5F3FF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#3B2D53]">
              <div>
                <h3 className="text-sm font-bold text-[#F5F3FF]">Submit Road Damage Report</h3>
                <p className="text-[11px] text-[#B9AECF]">Report road distress for immediate algorithmic priority scoring</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#B9AECF] hover:text-[#F5F3FF] text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">
                    Road Name <span className="text-[#FB7185]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formRoadName}
                    onChange={e => setFormRoadName(e.target.value)}
                    placeholder="e.g. Outer Ring Road, MG Road"
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] placeholder-[#B9AECF]/50 focus:border-[#A78BFA] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">
                    Area / Locality
                  </label>
                  <input
                    type="text"
                    value={formArea}
                    onChange={e => setFormArea(e.target.value)}
                    placeholder="e.g. Koramangala, Indiranagar"
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] placeholder-[#B9AECF]/50 focus:border-[#A78BFA] focus:outline-none"
                  />
                </div>
              </div>

              {/* Location (Latitude, Longitude + GPS button) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-[#F5F3FF]">
                    Location Coordinates <span className="text-[#FB7185]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={isLocating}
                    className="inline-flex items-center gap-1 text-[11px] text-[#A78BFA] hover:text-[#C4B5FD] font-semibold"
                  >
                    <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'Locating...' : 'Use My Location'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-[#B9AECF]">Latitude</span>
                    <input
                      type="text"
                      required
                      value={formLat}
                      onChange={e => setFormLat(e.target.value)}
                      placeholder="12.9716"
                      className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] text-xs font-mono focus:border-[#A78BFA] focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#B9AECF]">Longitude</span>
                    <input
                      type="text"
                      required
                      value={formLng}
                      onChange={e => setFormLng(e.target.value)}
                      placeholder="77.5946"
                      className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] text-xs font-mono focus:border-[#A78BFA] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Damage Type and Severity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Damage Type</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as IssueCategory)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  >
                    <option value="Pothole">Pothole</option>
                    <option value="Road cracks">Road cracks</option>
                    <option value="Surface damage">Surface damage</option>
                    <option value="Waterlogging">Waterlogging</option>
                    <option value="Broken road">Broken road</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Severity</label>
                  <select
                    value={formSeverity}
                    onChange={e => setFormSeverity(e.target.value as ReportSeverity)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  >
                    <option value="Critical">Critical (Immediate Hazard)</option>
                    <option value="High">High (Impacting Traffic)</option>
                    <option value="Medium">Medium (Moderate Wear)</option>
                    <option value="Low">Low (Early Stage Minor)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-[#F5F3FF] mb-1">
                  Description <span className="text-[#FB7185]">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Describe the pavement distress, approximate size, depth, or safety hazard..."
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] placeholder-[#B9AECF]/50 focus:border-[#A78BFA] focus:outline-none resize-none"
                />
              </div>

              {/* Optional Fields: Image URL & Reporter */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#B9AECF] mb-1">Photo URL (Optional)</label>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={e => setFormImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] placeholder-[#B9AECF]/50 focus:border-[#A78BFA] focus:outline-none text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#B9AECF] mb-1">Reporter Name (Optional)</label>
                  <input
                    type="text"
                    value={formReporterName}
                    onChange={e => setFormReporterName(e.target.value)}
                    placeholder="Citizen / Patrol Officer"
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] placeholder-[#B9AECF]/50 focus:border-[#A78BFA] focus:outline-none text-[11px]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#3B2D53]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-[#3B2D53] text-[#B9AECF] hover:text-[#F5F3FF] hover:bg-[#2B2042] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting &amp; Scoring...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Submit &amp; Compute Priority</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
