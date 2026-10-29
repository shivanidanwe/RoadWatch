import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { ConditionBadge } from '../../components/common/ConditionBadge';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { Inspection, InspectionStatus, InspectionType, RoadCondition } from '../../types';
import {
  CalendarCheck,
  PlusCircle,
  Eye,
  Filter,
  Clock,
  User,
  ClipboardList,
  MapPin
} from 'lucide-react';

export const InspectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { inspections, roads, createInspection, updateInspection, addToast } = useApp();

  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showFindingsModal, setShowFindingsModal] = useState(false);
  const [activeInspectionForFindings, setActiveInspectionForFindings] = useState<Inspection | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Schedule form
  const [formSegmentId, setFormSegmentId] = useState(roads[0]?.id || 'RD-DEMO-01');
  const [formInspector, setFormInspector] = useState('Er. Rajesh Verma');
  const [formDate, setFormDate] = useState('2024-11-05');
  const [formType, setFormType] = useState<InspectionType>('Routine');
  const [formNotes, setFormNotes] = useState('');

  // Findings form
  const [findingCondition, setFindingCondition] = useState<RoadCondition>('Poor');
  const [findingPci, setFindingPci] = useState('42');
  const [findingIntegrity, setFindingIntegrity] = useState('50');
  const [findingDamageSpread, setFindingDamageSpread] = useState('35');
  const [findingDrainage, setFindingDrainage] = useState<'Adequate' | 'Partially Blocked' | 'Severely Compromised'>('Partially Blocked');
  const [findingActions, setFindingActions] = useState('Milling top 40mm wearing course & crack routing');
  const [findingSummary, setFindingSummary] = useState('');

  const filteredInspections = useMemo(() => {
    return inspections.filter(i => {
      if (statusFilter !== 'ALL' && i.status !== statusFilter) return false;
      if (typeFilter !== 'ALL' && i.type !== typeFilter) return false;
      return true;
    });
  }, [inspections, statusFilter, typeFilter]);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const road = roads.find(r => r.id === formSegmentId);
    if (!road) return;

    await createInspection({
      segmentId: road.id,
      roadName: road.name,
      ward: road.ward,
      assignedInspector: formInspector,
      inspectorRole: 'Field Engineering Inspector',
      scheduledDate: formDate,
      type: formType,
      priority: road.priority,
      status: 'Scheduled',
      notes: formNotes || `Routine inspection scheduled for ${road.name}`,
    });

    setShowScheduleModal(false);
    setFormNotes('');
    addToast('success', 'Inspection Created', `Audit dispatched for ${road.name}.`);
  };

  const openFindingsModal = (insp: Inspection) => {
    setActiveInspectionForFindings(insp);
    setShowFindingsModal(true);
  };

  const handleFindingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInspectionForFindings) return;

    await updateInspection(activeInspectionForFindings.id, {
      status: 'Completed',
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
    });

    setShowFindingsModal(false);
    setActiveInspectionForFindings(null);
    setFindingSummary('');
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
      header: 'Road Segment',
      sortable: true,
      render: i => (
        <div>
          <span className="font-semibold text-[#F5F3FF] block">{i.roadName}</span>
          <span className="text-[11px] text-[#B9AECF]">{i.ward} &bull; {i.segmentId}</span>
        </div>
      ),
    },
    {
      key: 'assignedInspector',
      header: 'Inspector',
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
      header: 'Target Date',
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
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: i => <PriorityBadge priority={i.priority} />,
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
          {i.status !== 'Completed' && i.status !== 'Reviewed' && (
            <button
              onClick={() => openFindingsModal(i)}
              className="px-2 py-1 text-[11px] font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded transition shadow-xs"
              title="Record field survey findings"
            >
              Record Findings
            </button>
          )}
          <button
            onClick={() => setSelectedInspection(i)}
            className="p-1.5 text-[#B9AECF] hover:text-[#A78BFA] rounded hover:bg-[#2B2042] transition"
            title="Inspect task details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 min-w-0">
      <PageHeader
        title="Field Inspection Management"
        subtitle="Schedule quality audits, assign certified pavement inspectors, and record ground-truth structural findings."
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
              onClick={() => setShowScheduleModal(true)}
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
            <option value="Routine">Routine Visual</option>
            <option value="Citizen Report Verification">Report Verification</option>
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
          searchKey={(i: Inspection) => `${i.id} ${i.roadName} ${i.assignedInspector}`}
          searchPlaceholder="Search inspections by task ID, road name, or inspector..."
          exportFileName="roadwatch-inspections"
          onRowClick={i => setSelectedInspection(i)}
        />
      ) : (
        /* Calendar View */
        <div className="bg-[#211735] rounded-xl border border-[#3B2D53] shadow-xs p-5 space-y-4 min-w-0 text-[#F5F3FF]">
          <div className="flex items-center justify-between pb-3 border-b border-[#3B2D53]">
            <h3 className="text-sm font-bold text-[#F5F3FF]">Inspection Schedule (Current Period)</h3>
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
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => navigate(`/map?select=${selectedInspection.segmentId}`)}
                className="px-3 py-1.5 text-xs text-[#A78BFA] font-semibold hover:underline flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" /> View Road
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
                    className="px-3 py-1.5 rounded-lg bg-[#8B5CF6] text-white text-xs font-semibold hover:bg-[#7C3AED] transition"
                  >
                    Submit Findings
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
              <StatusBadge status={selectedInspection.status} />
            </div>

            <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl border border-[#3B2D53] bg-[#140E22]">
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Inspector</span>
                <p className="font-bold text-[#F5F3FF]">{selectedInspection.assignedInspector}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Role</span>
                <p className="font-bold text-[#F5F3FF]">{selectedInspection.inspectorRole}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Target Date</span>
                <p className="font-bold text-[#F5F3FF]">{selectedInspection.scheduledDate}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Inspection Type</span>
                <p className="font-bold text-[#F5F3FF]">{selectedInspection.type}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#140E22] border border-[#3B2D53] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#B9AECF]">Instructions &amp; Brief</span>
              <p className="text-xs text-[#F5F3FF] leading-relaxed">{selectedInspection.notes}</p>
            </div>

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
                    <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Audited PCI</span>
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
              <h3 className="text-sm font-bold text-[#F5F3FF]">Schedule Field Inspection</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-[#B9AECF] hover:text-[#F5F3FF]">
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-[#F5F3FF] mb-1">Target Road Segment</label>
                <select
                  value={formSegmentId}
                  onChange={e => setFormSegmentId(e.target.value)}
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
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
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Inspector</label>
                  <select
                    value={formInspector}
                    onChange={e => setFormInspector(e.target.value)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  >
                    <option value="Er. Rajesh Verma">Er. Rajesh Verma (Senior Pavement)</option>
                    <option value="Er. Meena Nair">Er. Meena Nair (Hydrology)</option>
                    <option value="Er. Vikram Singh">Er. Vikram Singh (Structural)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Target Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#F5F3FF] mb-1">Inspection Type</label>
                <select
                  value={formType}
                  onChange={e => setFormType(e.target.value as any)}
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                >
                  <option value="Routine">Routine Visual</option>
                  <option value="Citizen Report Verification">Report Verification</option>
                  <option value="Post-Severe-Weather">Post-Severe-Weather</option>
                  <option value="Periodic Audit">Periodic Audit</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#F5F3FF] mb-1">Special Instructions</label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="Focus points for field audit..."
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
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Findings Modal */}
      {showFindingsModal && activeInspectionForFindings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#211735] rounded-xl shadow-2xl border border-[#3B2D53] max-w-lg w-full p-6 text-xs space-y-4 text-[#F5F3FF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#3B2D53]">
              <div>
                <h3 className="text-sm font-bold text-[#F5F3FF]">Record Inspection Findings</h3>
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
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Observed Condition</label>
                  <select
                    value={findingCondition}
                    onChange={e => setFindingCondition(e.target.value as RoadCondition)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  >
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                    <option value="Critical">Critical</option>
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
                <label className="block font-semibold text-[#F5F3FF] mb-1">Summary Findings</label>
                <textarea
                  rows={3}
                  required
                  value={findingSummary}
                  onChange={e => setFindingSummary(e.target.value)}
                  placeholder="Describe crack severity, rutting measurements, and repair advice..."
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
                  className="px-4 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-lg shadow-xs transition"
                >
                  Save Findings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
