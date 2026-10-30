import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { ConditionBadge } from '../../components/common/ConditionBadge';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { Inspection, InspectionStatus, InspectionType, RoadCondition } from '../../types';
import { apiService } from '../../services/api';
import {
  CalendarCheck,
  PlusCircle,
  Eye,
  Filter,
  Clock,
  User,
  ClipboardList,
  MapPin,
  Camera,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';

export const InspectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { inspections, reports, roads, createInspection, updateInspection, addToast } = useApp();

  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showFindingsModal, setShowFindingsModal] = useState(false);
  const [activeInspectionForFindings, setActiveInspectionForFindings] = useState<Inspection | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Schedule form
  const [formSource, setFormSource] = useState<'report' | 'segment'>('report');
  const [formReportId, setFormReportId] = useState('');
  const [formSegmentId, setFormSegmentId] = useState(roads[0]?.id || 'RD-DEMO-01');
  const [formRoadName, setFormRoadName] = useState('');
  const [formWard, setFormWard] = useState('Central Ward');
  const [formInspector, setFormInspector] = useState('Municipal Authority Admin');
  const [formDate, setFormDate] = useState(new Date().toISOString().substring(0, 10));
  const [formType, setFormType] = useState<InspectionType>('Citizen Report Verification');
  const [formNotes, setFormNotes] = useState('');

  // Findings form
  const [findingCondition, setFindingCondition] = useState<RoadCondition>('Poor');
  const [findingPci, setFindingPci] = useState('42');
  const [findingIntegrity, setFindingIntegrity] = useState('50');
  const [findingDamageSpread, setFindingDamageSpread] = useState('35');
  const [findingDrainage, setFindingDrainage] = useState<'Adequate' | 'Partially Blocked' | 'Severely Compromised'>('Partially Blocked');
  const [findingActions, setFindingActions] = useState('Milling top 40mm wearing course & asphalt overlay');
  const [findingSummary, setFindingSummary] = useState('');
  const [findingPhotoUrl, setFindingPhotoUrl] = useState('');

  // Check if directed from ReportsPage with ?reportId=...
  useEffect(() => {
    const qReportId = searchParams.get('reportId');
    if (qReportId) {
      const targetReport = reports.find(r => r.id === qReportId || r.reportCode === qReportId);
      if (targetReport) {
        setFormSource('report');
        setFormReportId(targetReport.id);
        setFormRoadName(targetReport.roadName);
        setFormWard(targetReport.area || 'Municipal Ward');
        setFormNotes(`Damage verification inspection for citizen complaint ${targetReport.reportCode || targetReport.id} (${targetReport.category} - ${targetReport.severity}).`);
        setShowScheduleModal(true);
      }
    }
  }, [searchParams, reports]);

  // Synchronize road name and ward when report selection changes
  const handleReportSelectionChange = (repId: string) => {
    setFormReportId(repId);
    const rep = reports.find(r => r.id === repId);
    if (rep) {
      setFormRoadName(rep.roadName);
      setFormWard(rep.area || 'Municipal Ward');
    }
  };

  // Synchronize road name and ward when segment selection changes
  const handleSegmentSelectionChange = (segId: string) => {
    setFormSegmentId(segId);
    const road = roads.find(r => r.id === segId);
    if (road) {
      setFormRoadName(road.name);
      setFormWard(road.ward);
    }
  };

  const filteredInspections = useMemo(() => {
    return inspections.filter(i => {
      if (statusFilter !== 'ALL' && i.status !== statusFilter) return false;
      if (typeFilter !== 'ALL' && i.type !== typeFilter) return false;
      return true;
    });
  }, [inspections, statusFilter, typeFilter]);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalRoadName = formRoadName.trim() || (roads.find(r => r.id === formSegmentId)?.name || 'Municipal Road');
    const finalWard = formWard.trim() || 'Municipal Ward';

    await createInspection({
      segmentId: formSource === 'segment' ? formSegmentId : 'RD-REPORT',
      roadName: finalRoadName,
      ward: finalWard,
      assignedInspector: formInspector,
      inspectorRole: 'Municipal Authority Admin / Field Engineer',
      scheduledDate: formDate,
      type: formType,
      priority: 'High',
      status: 'Scheduled',
      notes: formNotes || `Inspection scheduled for ${finalRoadName}`,
      reportId: formSource === 'report' ? formReportId : undefined,
    } as any);

    setShowScheduleModal(false);
    setFormNotes('');
    addToast('success', 'Inspection Created', `Audit dispatched for ${finalRoadName}.`);
  };

  const openFindingsModal = (insp: Inspection) => {
    setActiveInspectionForFindings(insp);
    setFindingCondition((insp.verifiedCondition as RoadCondition) || 'Poor');
    setShowFindingsModal(true);
  };

  const handleFindingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInspectionForFindings) return;

    const photosList = findingPhotoUrl.trim() ? [findingPhotoUrl.trim()] : [];

    await updateInspection(activeInspectionForFindings.id, {
      status: 'Completed',
      verifiedCondition: findingCondition,
      photos: photosList,
      findings: {
        observedCondition: findingCondition,
        estimatedPci: parseInt(findingPci) || 45,
        structuralIntegrityScore: parseInt(findingIntegrity) || 50,
        damageSpreadPercentage: parseInt(findingDamageSpread) || 30,
        drainageCondition: findingDrainage,
        recommendedActions: findingActions.split(',').map(s => s.trim()),
        summaryNotes: findingSummary || 'Field audit concluded with actionable repair recommendations.',
        completedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      },
    } as any);

    setShowFindingsModal(false);
    setActiveInspectionForFindings(null);
    setFindingSummary('');
    setFindingPhotoUrl('');
    addToast('success', 'Findings Saved', 'Inspection marked as Completed with ground truth.');
  };

  const handleAdvanceStatus = async (insp: Inspection, nextStatus: InspectionStatus) => {
    await updateInspection(insp.id, { status: nextStatus });
    setSelectedInspection(prev => (prev ? { ...prev, status: nextStatus } : null));
    addToast('success', 'Status Updated', `Task moved to ${nextStatus}.`);
  };

  const columns: Column<Inspection>[] = [
    {
      key: 'id',
      header: 'Task ID',
      sortable: true,
      width: '110px',
      render: i => (
        <span className="font-mono text-xs font-bold text-[#C4B5FD] bg-[#8B5CF6]/20 px-2 py-0.5 rounded border border-[#8B5CF6]/30">
          {i.id}
        </span>
      ),
    },
    {
      key: 'roadName',
      header: 'Road Segment & Area',
      sortable: true,
      render: i => (
        <div>
          <span className="font-semibold text-[#F5F3FF] block">{i.roadName}</span>
          <span className="text-[11px] text-[#B9AECF]">
            {i.ward} {i.reportId ? `• Complaint: ${i.reportId}` : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'assignedInspector',
      header: 'Inspector / Officer',
      sortable: true,
      render: i => (
        <div className="flex items-center gap-1.5 text-xs text-[#F5F3FF] font-medium">
          <User className="w-3.5 h-3.5 text-[#A78BFA]" />
          <span>{i.assignedInspector}</span>
        </div>
      ),
    },
    {
      key: 'scheduledDate',
      header: 'Scheduled Date',
      sortable: true,
      render: i => (
        <span className="text-xs text-[#B9AECF] flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-[#A78BFA]" />
          {i.scheduledDate}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: i => <span className="text-xs text-[#B9AECF]">{i.type}</span>,
    },
    {
      key: 'verifiedCondition',
      header: 'Verified Condition',
      sortable: true,
      render: i => <ConditionBadge condition={(i.verifiedCondition as RoadCondition) || 'Fair'} />,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: i => <StatusBadge status={i.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: i => (
        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
          {i.status !== 'Completed' && i.status !== 'Cancelled' && (
            <button
              onClick={() => openFindingsModal(i)}
              className="px-2 py-1 text-[11px] font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded transition shadow-xs"
              title="Record verified condition and findings"
            >
              Record Findings
            </button>
          )}
          <button
            onClick={() => setSelectedInspection(i)}
            className="p-1.5 text-[#B9AECF] hover:text-[#A78BFA] rounded hover:bg-[#2B2042] transition"
            title="Inspect task details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 min-w-0">
      <PageHeader
        title="Road Inspection Management"
        subtitle="Schedule quality audits, record verified road condition, attach inspection photographs, and track field surveys."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30">
            {filteredInspections.length} Tasks
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-[#3B2D53] p-0.5 bg-[#140E22] text-xs">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  viewMode === 'list' ? 'bg-[#8B5CF6] text-white shadow-xs' : 'text-[#B9AECF]'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  viewMode === 'calendar' ? 'bg-[#8B5CF6] text-white shadow-xs' : 'text-[#B9AECF]'
                }`}
              >
                Calendar View
              </button>
            </div>

            <button
              onClick={() => {
                setFormSource('report');
                if (reports.length > 0) {
                  handleReportSelectionChange(reports[0].id);
                }
                setShowScheduleModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-lg shadow-xs transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Schedule Inspection</span>
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

        <div className="flex items-center gap-1.5">
          <span className="text-[#B9AECF]">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-1.5 border border-[#3B2D53] rounded-lg bg-[#140E22] font-medium text-[#F5F3FF] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[#B9AECF]">Type:</span>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="p-1.5 border border-[#3B2D53] rounded-lg bg-[#140E22] font-medium text-[#F5F3FF] focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="Citizen Report Verification">Report Verification</option>
            <option value="Routine">Routine Visual</option>
            <option value="Emergency">Emergency</option>
            <option value="Post-Severe-Weather">Post-Severe-Weather</option>
            <option value="Periodic Audit">Periodic Audit</option>
          </select>
        </div>

        {(statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
          <button
            onClick={() => {
              setStatusFilter('ALL');
              setTypeFilter('ALL');
            }}
            className="text-xs text-[#A78BFA] hover:underline font-semibold ml-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Content Area */}
      {viewMode === 'list' ? (
        <DataTable
          columns={columns}
          data={filteredInspections}
          searchKey={(i: Inspection) => `${i.id} ${i.roadName} ${i.assignedInspector} ${i.ward}`}
          searchPlaceholder="Search inspections by task ID, road name, or inspector..."
          exportFileName="roadwatch-inspections"
          onRowClick={i => setSelectedInspection(i)}
        />
      ) : (
        /* Calendar View */
        <div className="bg-[#211735] rounded-xl border border-[#3B2D53] shadow-xs p-5 space-y-4 min-w-0 text-[#F5F3FF]">
          <div className="flex items-center justify-between pb-3 border-b border-[#3B2D53]">
            <h3 className="text-sm font-bold text-[#F5F3FF]">Inspection Schedule</h3>
            <span className="text-xs text-[#B9AECF]">Active Pipeline</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {filteredInspections.map(insp => (
              <div
                key={insp.id}
                onClick={() => setSelectedInspection(insp)}
                className="p-3.5 rounded-xl border border-[#3B2D53] bg-[#140E22] hover:bg-[#2B2042] cursor-pointer transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#A78BFA]">{insp.id}</span>
                  <StatusBadge status={insp.status} />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-[#F5F3FF] truncate">{insp.roadName}</h4>
                  <p className="text-[11px] text-[#B9AECF]">{insp.ward}</p>
                </div>
                <div className="pt-2 border-t border-[#3B2D53] flex items-center justify-between text-[11px] text-[#B9AECF]">
                  <span>{insp.scheduledDate}</span>
                  <span className="font-medium text-[#F5F3FF]">{insp.assignedInspector}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inspection Detail Drawer */}
      <DetailDrawer
        isOpen={!!selectedInspection}
        onClose={() => setSelectedInspection(null)}
        title={selectedInspection ? `${selectedInspection.id} — ${selectedInspection.type}` : ''}
        subtitle={selectedInspection?.roadName}
        footer={
          selectedInspection && (
            <div className="flex items-center justify-between w-full flex-wrap gap-2">
              <button
                onClick={() => navigate(`/map?select=${selectedInspection.segmentId}`)}
                className="px-3 py-1.5 text-xs text-[#A78BFA] font-semibold hover:underline flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" /> View on Map
              </button>

              <div className="flex items-center gap-2">
                {selectedInspection.status === 'Scheduled' && (
                  <button
                    onClick={() => handleAdvanceStatus(selectedInspection, 'In Progress')}
                    className="px-3 py-1.5 rounded-lg bg-[#8B5CF6] text-white text-xs font-semibold hover:bg-[#7C3AED] transition"
                  >
                    Start Inspection
                  </button>
                )}
                {selectedInspection.status === 'In Progress' && (
                  <button
                    onClick={() => {
                      setSelectedInspection(null);
                      openFindingsModal(selectedInspection);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#10B981] text-white text-xs font-semibold hover:bg-emerald-600 transition"
                  >
                    Record Findings
                  </button>
                )}
                {selectedInspection.status !== 'Cancelled' && selectedInspection.status !== 'Completed' && (
                  <button
                    onClick={() => handleAdvanceStatus(selectedInspection, 'Cancelled')}
                    className="px-3 py-1.5 rounded-lg bg-[#FB7185]/20 hover:bg-[#FB7185]/30 text-[#FB7185] border border-[#FB7185]/40 text-xs font-semibold transition"
                  >
                    Cancel Task
                  </button>
                )}
              </div>
            </div>
          )
        }
      >
        {selectedInspection && (
          <div className="space-y-4 text-xs text-[#F5F3FF]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#8B5CF6]/20 font-bold text-[#C4B5FD] border border-[#8B5CF6]/30">
                {selectedInspection.id}
              </span>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedInspection.status} />
                <ConditionBadge condition={(selectedInspection.verifiedCondition as RoadCondition) || 'Fair'} />
              </div>
            </div>

            {/* Status direct update */}
            <div className="p-3.5 rounded-xl bg-[#140E22] border border-[#3B2D53] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold tracking-wider block">
                  Update Inspection Status
                </span>
                <span className="text-[11px] text-[#B9AECF]">
                  Municipal workflow control
                </span>
              </div>
              <select
                value={selectedInspection.status}
                onChange={e => handleAdvanceStatus(selectedInspection, e.target.value as InspectionStatus)}
                className="p-1.5 border border-[#8B5CF6]/40 rounded-lg bg-[#211735] text-xs font-semibold text-[#F5F3FF] focus:outline-none"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl border border-[#3B2D53] bg-[#140E22]">
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Assigned Inspector</span>
                <p className="font-bold text-[#F5F3FF]">{selectedInspection.assignedInspector}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Role</span>
                <p className="font-bold text-[#F5F3FF]">{selectedInspection.inspectorRole}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Scheduled Date</span>
                <p className="font-bold text-[#F5F3FF]">{selectedInspection.scheduledDate}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Inspection Type</span>
                <p className="font-bold text-[#F5F3FF]">{selectedInspection.type}</p>
              </div>
              {selectedInspection.reportId && (
                <div className="col-span-2">
                  <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Linked Road Complaint</span>
                  <p className="font-mono text-xs font-bold text-[#A78BFA]">{selectedInspection.reportId}</p>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-[#140E22] border border-[#3B2D53] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#B9AECF]">Inspection Notes &amp; Scope</span>
              <p className="text-xs text-[#F5F3FF] leading-relaxed">{selectedInspection.notes || 'No notes provided.'}</p>
            </div>

            {/* Inspection Photographs if any */}
            {(selectedInspection as any).photos && (selectedInspection as any).photos.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[#B9AECF] flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-[#A78BFA]" /> Inspection Photographs
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {(selectedInspection as any).photos.map((pUrl: string, idx: number) => (
                    <div key={idx} className="rounded-xl overflow-hidden border border-[#3B2D53] bg-black/40 max-h-36">
                      <img
                        src={pUrl.startsWith('/uploads') ? `http://localhost:8000${pUrl}` : pUrl}
                        alt={`Inspection Photo ${idx + 1}`}
                        className="w-full h-full object-cover max-h-36"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Findings Box if available */}
            {selectedInspection.findings && (
              <div className="p-4 rounded-xl border border-[#34D399]/40 bg-[#34D399]/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#34D399] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5" /> Recorded Ground-Truth Findings
                  </span>
                  <ConditionBadge condition={selectedInspection.findings.observedCondition} />
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Estimated PCI</span>
                    <p className="font-extrabold text-[#34D399]">{selectedInspection.findings.estimatedPci} / 100</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Integrity</span>
                    <p className="font-extrabold text-[#F5F3FF]">{selectedInspection.findings.structuralIntegrityScore}%</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Distress Spread</span>
                    <p className="font-extrabold text-[#F5F3FF]">{selectedInspection.findings.damageSpreadPercentage}%</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Summary Notes</span>
                  <p className="text-xs text-[#F5F3FF] mt-0.5 leading-relaxed">{selectedInspection.findings.summaryNotes}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </DetailDrawer>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#211735] rounded-xl shadow-2xl border border-[#3B2D53] max-w-lg w-full p-6 text-xs space-y-4 text-[#F5F3FF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#3B2D53]">
              <h3 className="text-sm font-bold text-[#F5F3FF]">Create Inspection Record</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-[#B9AECF] hover:text-[#F5F3FF]">
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3.5">
              {/* Select Source: Citizen Road Report or General Road Segment */}
              <div className="space-y-1">
                <label className="block font-semibold text-[#F5F3FF]">Select Inspection Target</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormSource('report');
                      if (reports.length > 0) handleReportSelectionChange(reports[0].id);
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold transition ${
                      formSource === 'report'
                        ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                        : 'bg-[#140E22] text-[#B9AECF] border-[#3B2D53]'
                    }`}
                  >
                    Citizen Road Report
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormSource('segment');
                      if (roads.length > 0) handleSegmentSelectionChange(roads[0].id);
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold transition ${
                      formSource === 'segment'
                        ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                        : 'bg-[#140E22] text-[#B9AECF] border-[#3B2D53]'
                    }`}
                  >
                    Road Network Corridor
                  </button>
                </div>
              </div>

              {formSource === 'report' ? (
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">
                    Select Road Report <span className="text-[#FB7185]">*</span>
                  </label>
                  <select
                    value={formReportId}
                    onChange={e => handleReportSelectionChange(e.target.value)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  >
                    {reports.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.reportCode || r.id} — {r.roadName} ({r.category}, {r.severity})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">
                    Select Road Segment <span className="text-[#FB7185]">*</span>
                  </label>
                  <select
                    value={formSegmentId}
                    onChange={e => handleSegmentSelectionChange(e.target.value)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  >
                    {roads.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.id}) &bull; {r.ward}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Road Name</label>
                  <input
                    type="text"
                    required
                    value={formRoadName}
                    onChange={e => setFormRoadName(e.target.value)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Ward / Area</label>
                  <input
                    type="text"
                    value={formWard}
                    onChange={e => setFormWard(e.target.value)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Inspection Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Inspection Type</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as any)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  >
                    <option value="Citizen Report Verification">Damage Verification</option>
                    <option value="Routine">Routine Visual</option>
                    <option value="Emergency">Emergency Hazard</option>
                    <option value="Post-Severe-Weather">Post-Severe-Weather</option>
                    <option value="Periodic Audit">Periodic Audit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#F5F3FF] mb-1">Inspection Notes</label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="Specific instructions or damage aspects to inspect..."
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] placeholder-[#B9AECF]/50 focus:border-[#A78BFA] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#3B2D53]">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3.5 py-1.5 border border-[#3B2D53] rounded-lg font-medium text-[#B9AECF] hover:bg-[#2B2042] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-lg shadow-xs transition"
                >
                  Create Inspection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Findings & Verified Condition Modal */}
      {showFindingsModal && activeInspectionForFindings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#211735] rounded-xl shadow-2xl border border-[#3B2D53] max-w-lg w-full p-6 text-xs space-y-4 text-[#F5F3FF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#3B2D53]">
              <div>
                <h3 className="text-sm font-bold text-[#F5F3FF]">Record Verified Road Condition</h3>
                <p className="text-[11px] text-[#B9AECF]">
                  Corridor: <strong>{activeInspectionForFindings.roadName} ({activeInspectionForFindings.id})</strong>
                </p>
              </div>
              <button onClick={() => setShowFindingsModal(false)} className="text-[#B9AECF] hover:text-[#F5F3FF]">
                ✕
              </button>
            </div>

            <form onSubmit={handleFindingsSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Verified Road Condition</label>
                  <select
                    value={findingCondition}
                    onChange={e => setFindingCondition(e.target.value as RoadCondition)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none font-semibold"
                  >
                    <option value="Good">Good (Minor / No Action)</option>
                    <option value="Fair">Fair (Routine Maintenance)</option>
                    <option value="Poor">Poor (Major Rehabilitation)</option>
                    <option value="Critical">Critical (Immediate Repair Required)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Estimated PCI (0–100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={findingPci}
                    onChange={e => setFindingPci(e.target.value)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#F5F3FF] mb-1">Inspection Photograph URL</label>
                <input
                  type="url"
                  value={findingPhotoUrl}
                  onChange={e => setFindingPhotoUrl(e.target.value)}
                  placeholder="https://... or /uploads/inspection-image.jpg"
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] placeholder-[#B9AECF]/50 focus:border-[#A78BFA] focus:outline-none text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#F5F3FF] mb-1">Inspection Findings &amp; Notes</label>
                <textarea
                  rows={3}
                  required
                  value={findingSummary}
                  onChange={e => setFindingSummary(e.target.value)}
                  placeholder="Describe observed road distress, crack severity, measurements, and recommended repair intervention..."
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] placeholder-[#B9AECF]/50 focus:border-[#A78BFA] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#3B2D53]">
                <button
                  type="button"
                  onClick={() => setShowFindingsModal(false)}
                  className="px-3.5 py-1.5 border border-[#3B2D53] rounded-lg font-medium text-[#B9AECF] hover:bg-[#2B2042] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-xs transition"
                >
                  Save &amp; Complete Inspection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
