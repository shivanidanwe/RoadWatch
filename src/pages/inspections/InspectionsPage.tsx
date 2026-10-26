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
  CheckCircle2,
  Calendar,
  Clock,
  User,
  ClipboardList,
  AlertTriangle,
  FileCheck,
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
  const [formSegmentId, setFormSegmentId] = useState('RD-101');
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
        summaryNotes: findingSummary || 'Field audit concluded. Pavement distressed beyond normal operational limits.',
        completedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      },
    });

    setShowFindingsModal(false);
    setActiveInspectionForFindings(null);
    setFindingSummary('');
  };

  const handleAdvanceStatus = async (insp: Inspection, nextStatus: InspectionStatus) => {
    await updateInspection(insp.id, { status: nextStatus });
    setSelectedInspection(prev => (prev ? { ...prev, status: nextStatus } : null));
  };

  const columns: Column<Inspection>[] = [
    {
      key: 'id',
      header: 'Task ID',
      sortable: true,
      width: '125px',
      render: i => (
        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
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
          <span className="font-bold text-[#172033] block">{i.roadName}</span>
          <span className="text-[11px] text-[#94A3B8]">{i.ward} &bull; {i.segmentId}</span>
        </div>
      ),
    },
    {
      key: 'assignedInspector',
      header: 'Inspector',
      sortable: true,
      render: i => (
        <div className="flex items-center gap-1.5 text-xs text-[#172033] font-medium">
          <User className="w-3.5 h-3.5 text-[#64748B]" />
          <span>{i.assignedInspector}</span>
        </div>
      ),
    },
    {
      key: 'scheduledDate',
      header: 'Target Date',
      sortable: true,
      render: i => (
        <span className="text-xs text-[#64748B] flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
          {i.scheduledDate}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Inspection Type',
      sortable: true,
      render: i => <span className="text-xs text-[#64748B]">{i.type}</span>,
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
              className="px-2 py-1 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition"
              title="Record field survey findings"
            >
              Record Findings
            </button>
          )}
          <button
            onClick={() => setSelectedInspection(i)}
            className="p-1.5 text-[#64748B] hover:text-blue-600 rounded hover:bg-slate-100 transition"
            title="Inspect task details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Field Inspection Management"
        subtitle="Schedule quality audits, assign certified pavement inspectors, and record ground-truth structural findings."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#172033] border border-slate-200">
            {filteredInspections.length} tasks
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-[#E2E8F0] p-0.5 bg-slate-100 text-xs">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  viewMode === 'list' ? 'bg-white text-[#172033] shadow-xs' : 'text-[#64748B]'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  viewMode === 'calendar' ? 'bg-white text-[#172033] shadow-xs' : 'text-[#64748B]'
                }`}
              >
                Calendar View
              </button>
            </div>

            <button
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Schedule Inspection</span>
            </button>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1 text-[#64748B] font-semibold">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>Filters:</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[#64748B]">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-1.5 border border-[#E2E8F0] rounded-lg bg-slate-50 font-medium text-[#172033] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Reviewed">Reviewed</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[#64748B]">Type:</span>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="p-1.5 border border-[#E2E8F0] rounded-lg bg-slate-50 font-medium text-[#172033] focus:outline-none"
          >
            <option value="ALL">All Inspection Types</option>
            <option value="Routine">Routine</option>
            <option value="Citizen Report Verification">Citizen Report Verification</option>
            <option value="Post-Severe-Weather">Post-Severe-Weather</option>
            <option value="Structural Assessment">Structural Assessment</option>
          </select>
        </div>
      </div>

      {viewMode === 'list' ? (
        <DataTable
          columns={columns}
          data={filteredInspections}
          searchKey={(i: Inspection) => `${i.id} ${i.roadName} ${i.assignedInspector} ${i.type}`}
          searchPlaceholder="Search by ID, road segment, inspector..."
          exportFileName="roadwatch-inspections"
          onRowClick={i => setSelectedInspection(i)}
        />
      ) : (
        /* Calendar View Matrix */
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <h3 className="font-bold text-xs uppercase text-[#172033] tracking-wider">
              October – November 2024 Inspection Schedule
            </h3>
            <span className="text-xs text-[#64748B]">Weekly Deployment Matrix</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {['Week 43 (Oct 21–27)', 'Week 44 (Oct 28–Nov 03)', 'Week 45 (Nov 04–10)', 'Week 46 (Nov 11–17)'].map(
              (wk, index) => {
                const wkInspections = inspections.filter((_, i) => i % 4 === index);

                return (
                  <div key={wk} className="rounded-xl border border-[#E2E8F0] bg-slate-50/70 p-3 space-y-3">
                    <div className="font-bold text-xs text-[#172033] border-b pb-1.5 border-slate-200">
                      {wk}
                    </div>

                    <div className="space-y-2">
                      {wkInspections.length === 0 ? (
                        <div className="p-3 text-center text-[11px] text-[#94A3B8]">No tasks slated</div>
                      ) : (
                        wkInspections.map(item => (
                          <div
                            key={item.id}
                            onClick={() => setSelectedInspection(item)}
                            className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] shadow-2xs hover:border-blue-300 cursor-pointer text-xs space-y-1 transition"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-bold text-blue-700">{item.id}</span>
                              <StatusBadge status={item.status} />
                            </div>
                            <div className="font-semibold text-[#172033] truncate">{item.roadName}</div>
                            <div className="text-[11px] text-[#64748B] flex items-center justify-between">
                              <span>{item.assignedInspector.split(' ')[1]}</span>
                              <span className="font-mono">{item.scheduledDate.substring(5)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              }
            )}
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
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" /> View Road on Map
              </button>

              <div className="flex items-center gap-2">
                {selectedInspection.status === 'Scheduled' && (
                  <button
                    onClick={() => handleAdvanceStatus(selectedInspection, 'In Progress')}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                  >
                    Start Inspection
                  </button>
                )}
                {selectedInspection.status === 'In Progress' && (
                  <button
                    onClick={() => openFindingsModal(selectedInspection)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                  >
                    Record Findings
                  </button>
                )}
                {selectedInspection.status === 'Completed' && (
                  <button
                    onClick={() => handleAdvanceStatus(selectedInspection, 'Reviewed')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                  >
                    Approve / Review
                  </button>
                )}
              </div>
            </div>
          )
        }
      >
        {selectedInspection && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center justify-between">
              <PriorityBadge priority={selectedInspection.priority} />
              <StatusBadge status={selectedInspection.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0]">
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Assigned Inspector</span>
                <p className="font-bold text-[#172033] mt-0.5">{selectedInspection.assignedInspector}</p>
                <p className="text-[10px] text-[#94A3B8]">{selectedInspection.inspectorRole}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Target Audit Date</span>
                <p className="font-bold text-[#172033] mt-0.5">{selectedInspection.scheduledDate}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#64748B]">Assignment Instructions</span>
              <p className="text-xs text-[#172033] leading-relaxed">{selectedInspection.notes}</p>
            </div>

            {/* Findings if recorded */}
            {selectedInspection.findings ? (
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-[#172033] uppercase text-[10px] tracking-wider text-emerald-800">
                  Recorded Ground-Truth Findings
                </h4>
                <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-emerald-800 font-bold uppercase">Observed Condition:</span>
                      <ConditionBadge condition={selectedInspection.findings.observedCondition} />
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-800 font-bold uppercase">Estimated PCI:</span>
                      <p className="font-bold text-emerald-950">{selectedInspection.findings.estimatedPci} / 100</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-800 font-bold uppercase">Structural Integrity:</span>
                      <p className="font-bold text-emerald-950">{selectedInspection.findings.structuralIntegrityScore}%</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-800 font-bold uppercase">Drainage Condition:</span>
                      <p className="font-bold text-emerald-950">{selectedInspection.findings.drainageCondition}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-emerald-800 font-bold uppercase block mb-1">
                      Summary Evaluation:
                    </span>
                    <p className="text-[11px] text-emerald-900 leading-snug">
                      {selectedInspection.findings.summaryNotes}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-emerald-800 font-bold uppercase block mb-1">
                      Recommended Engineering Actions:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-emerald-950">
                      {selectedInspection.findings.recommendedActions.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-[#64748B]">
                <ClipboardList className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                <p className="font-medium">No findings submitted yet</p>
                <p className="text-[11px] text-[#94A3B8]">Audit will update road segment condition once completed</p>
              </div>
            )}
          </div>
        )}
      </DetailDrawer>

      {/* Schedule Inspection Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E2E8F0] max-w-lg w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#172033]">Schedule Field Inspection</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-[#94A3B8] hover:text-[#172033]">
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-[#172033] mb-1">Target Road Segment</label>
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
                  <label className="block font-semibold text-[#172033] mb-1">Assigned Inspector</label>
                  <select
                    value={formInspector}
                    onChange={e => setFormInspector(e.target.value)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white"
                  >
                    <option value="Er. Rajesh Verma">Er. Rajesh Verma (Senior Pavement)</option>
                    <option value="Er. Meena Nair">Er. Meena Nair (Hydrology Specialist)</option>
                    <option value="Er. David Wilson">Er. David Wilson (Safety Auditor)</option>
                    <option value="Er. Sunita Patel">Er. Sunita Patel (Asset Surveyor)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1">Inspection Type</label>
                <select
                  value={formType}
                  onChange={e => setFormType(e.target.value as InspectionType)}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white"
                >
                  <option value="Routine">Routine Visual Survey</option>
                  <option value="Citizen Report Verification">Citizen Report Verification</option>
                  <option value="Post-Severe-Weather">Post-Severe-Weather Flood Survey</option>
                  <option value="Structural Assessment">Structural Core Assessment</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1">Briefing &amp; Scope</label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="Outline test procedures (e.g. penetrometer, visual distress density)..."
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3.5 py-1.5 border border-[#E2E8F0] rounded-lg font-medium text-[#64748B] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Findings Modal */}
      {showFindingsModal && activeInspectionForFindings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E2E8F0] max-w-lg w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <h3 className="text-sm font-bold text-[#172033]">
                  Record Field Audit Findings: {activeInspectionForFindings.id}
                </h3>
                <p className="text-[11px] text-[#64748B]">{activeInspectionForFindings.roadName}</p>
              </div>
              <button onClick={() => setShowFindingsModal(false)} className="text-[#94A3B8] hover:text-[#172033]">
                ✕
              </button>
            </div>

            <form onSubmit={handleFindingsSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Observed Road Condition</label>
                  <select
                    value={findingCondition}
                    onChange={e => setFindingCondition(e.target.value as RoadCondition)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white"
                  >
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Audited PCI (0–100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={findingPci}
                    onChange={e => setFindingPci(e.target.value)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Structural Integrity (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={findingIntegrity}
                    onChange={e => setFindingIntegrity(e.target.value)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Drainage State</label>
                  <select
                    value={findingDrainage}
                    onChange={e => setFindingDrainage(e.target.value as any)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white"
                  >
                    <option value="Adequate">Adequate</option>
                    <option value="Partially Blocked">Partially Blocked</option>
                    <option value="Severely Compromised">Severely Compromised</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1">Recommended Engineering Actions</label>
                <input
                  type="text"
                  required
                  value={findingActions}
                  onChange={e => setFindingActions(e.target.value)}
                  placeholder="e.g. Deep milling, asphalt overlay, roadside drainage clearing"
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1">Summary Findings &amp; Core Analysis</label>
                <textarea
                  rows={3}
                  required
                  value={findingSummary}
                  onChange={e => setFindingSummary(e.target.value)}
                  placeholder="Document sub-base conditions, moisture saturation, crack width, and vehicle rideability..."
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowFindingsModal(false)}
                  className="px-3.5 py-1.5 border border-[#E2E8F0] rounded-lg font-medium text-[#64748B] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save Findings &amp; Complete Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
