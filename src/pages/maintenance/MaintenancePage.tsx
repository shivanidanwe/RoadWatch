import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { MaintenancePlan, MaintenanceStatus, MaintenanceType, PriorityLevel } from '../../types';
import {
  Hammer,
  PlusCircle,
  Eye,
  Filter,
  DollarSign,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Check,
  XCircle,
  FileText,
  MapPin
} from 'lucide-react';

export const MaintenancePage: React.FC = () => {
  const navigate = useNavigate();
  const { maintenancePlans, roads, createMaintenance, updateMaintenance, addToast } = useApp();

  const [selectedPlan, setSelectedPlan] = useState<MaintenancePlan | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [activePlanForCompletion, setActivePlanForCompletion] = useState<MaintenancePlan | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Create Plan Form
  const [formSegmentId, setFormSegmentId] = useState('RD-101');
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<MaintenanceType>('Resurfacing');
  const [formPriority, setFormPriority] = useState<PriorityLevel>('Critical');
  const [formCrew, setFormCrew] = useState('Rapid Asphalt Paving Squadron A');
  const [formLeader, setFormLeader] = useState('Eng. Ramesh Nair');
  const [formCost, setFormCost] = useState('45000');
  const [formStartDate, setFormStartDate] = useState('2024-11-10');
  const [formTargetDate, setFormTargetDate] = useState('2024-11-20');
  const [formResources, setFormResources] = useState('Cold milling planer, Bituminous asphalt paver, Steel roller');
  const [formJustification, setFormJustification] = useState('');

  // Complete Plan Form
  const [completeActualCost, setCompleteActualCost] = useState('');
  const [completeNotes, setCompleteNotes] = useState('');

  // Budget calculations
  const totalCommitted = maintenancePlans
    .filter(m => ['Approved', 'Scheduled', 'In Progress'].includes(m.status))
    .reduce((acc, m) => acc + m.estimatedCost, 0);

  const totalBacklog = maintenancePlans
    .filter(m => m.status === 'Proposed' || m.status === 'Under Review')
    .reduce((acc, m) => acc + m.estimatedCost, 0);

  const totalCompletedCost = maintenancePlans
    .filter(m => m.status === 'Completed')
    .reduce((acc, m) => acc + (m.actualCost || m.estimatedCost), 0);

  const filteredPlans = useMemo(() => {
    return maintenancePlans.filter(m => {
      if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
      if (typeFilter !== 'ALL' && m.maintenanceType !== typeFilter) return false;
      return true;
    });
  }, [maintenancePlans, statusFilter, typeFilter]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const road = roads.find(r => r.id === formSegmentId);
    if (!road) return;

    await createMaintenance({
      segmentId: road.id,
      roadName: road.name,
      ward: road.ward,
      title: formTitle || `${formType} on ${road.name}`,
      maintenanceType: formType,
      priority: formPriority,
      status: 'Proposed',
      assignedCrew: formCrew,
      crewLeader: formLeader,
      estimatedCost: parseInt(formCost) || 50000,
      startDate: formStartDate,
      targetCompletionDate: formTargetDate,
      requiredResources: formResources.split(',').map(s => s.trim()),
      justification: formJustification || `Structural rehabilitation necessitated by risk score ${road.riskScore}/100`,
      budgetStatus: 'Within Allocation',
    });

    setShowCreateModal(false);
    setFormTitle('');
    setFormJustification('');
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlanForCompletion) return;

    await updateMaintenance(activePlanForCompletion.id, {
      status: 'Completed',
      actualCost: parseInt(completeActualCost) || activePlanForCompletion.estimatedCost,
      actualCompletionDate: new Date().toISOString().substring(0, 10),
      completionNotes: completeNotes || 'Work completed to municipal highway specifications. Surface passed rideability audit.',
    });

    setShowCompleteModal(false);
    setActivePlanForCompletion(null);
    setCompleteNotes('');
  };

  const handleStatusChange = async (plan: MaintenancePlan, nextStatus: MaintenanceStatus) => {
    await updateMaintenance(plan.id, { status: nextStatus });
    setSelectedPlan(prev => (prev ? { ...prev, status: nextStatus } : null));
  };

  const columns: Column<MaintenancePlan>[] = [
    {
      key: 'id',
      header: 'Plan ID',
      sortable: true,
      width: '120px',
      render: m => (
        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {m.id}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Project Title & Scope',
      sortable: true,
      render: m => (
        <div>
          <span className="font-bold text-[#172033] block">{m.title}</span>
          <span className="text-[11px] text-[#64748B]">{m.roadName} &bull; {m.ward}</span>
        </div>
      ),
    },
    {
      key: 'maintenanceType',
      header: 'Intervention',
      sortable: true,
      render: m => <span className="font-medium text-xs text-[#172033]">{m.maintenanceType}</span>,
    },
    {
      key: 'estimatedCost',
      header: 'Estimated Cost',
      sortable: true,
      align: 'right',
      render: m => (
        <div className="text-right">
          <span className="font-bold text-slate-900">${m.estimatedCost.toLocaleString()}</span>
          <span className="text-[10px] text-[#94A3B8] block">Est. rate</span>
        </div>
      ),
    },
    {
      key: 'assignedCrew',
      header: 'Assigned Crew',
      sortable: true,
      render: m => (
        <span className="text-xs text-[#64748B] truncate max-w-[150px] block" title={m.assignedCrew}>
          {m.assignedCrew}
        </span>
      ),
    },
    {
      key: 'targetCompletionDate',
      header: 'Target Date',
      sortable: true,
      render: m => <span className="text-xs text-[#64748B]">{m.targetCompletionDate}</span>,
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: m => <PriorityBadge priority={m.priority} />,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: m => <StatusBadge status={m.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: m => (
        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
          {m.status === 'In Progress' && (
            <button
              onClick={() => {
                setActivePlanForCompletion(m);
                setCompleteActualCost(String(m.estimatedCost));
                setShowCompleteModal(true);
              }}
              className="px-2 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition"
            >
              Sign Off
            </button>
          )}
          <button
            onClick={() => setSelectedPlan(m)}
            className="p-1.5 text-[#64748B] hover:text-blue-600 rounded hover:bg-slate-100 transition"
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
        title="Maintenance Planning &amp; Works Dispatch"
        subtitle="Translate prioritized distress predictions into approved capital expenditure work orders and monitor execution progress."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#172033] border border-slate-200">
            {filteredPlans.length} projects
          </span>
        }
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Maintenance Plan</span>
          </button>
        }
      />

      {/* Budget Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              Active Committed Budget
            </span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-[#172033] mt-2">
            ${(totalCommitted / 1000).toFixed(1)}k
          </div>
          <span className="text-[11px] text-[#94A3B8] mt-1 block">Scheduled &amp; In-Progress work orders</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              Backlog Estimate
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">
            ${(totalBacklog / 1000).toFixed(1)}k
          </div>
          <span className="text-[11px] text-[#94A3B8] mt-1 block">Proposed &amp; pending municipal approval</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              Expenditure Completed
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">
            ${(totalCompletedCost / 1000).toFixed(1)}k
          </div>
          <span className="text-[11px] text-[#94A3B8] mt-1 block">Verified repaired corridors FY24</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              Active Squads
            </span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">4 Units</div>
          <span className="text-[11px] text-[#94A3B8] mt-1 block">Paving, Drainage &amp; Safety squads deployed</span>
        </div>
      </div>

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
            <option value="Proposed">Proposed</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[#64748B]">Intervention Type:</span>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="p-1.5 border border-[#E2E8F0] rounded-lg bg-slate-50 font-medium text-[#172033] focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="Pothole Patching">Pothole Patching</option>
            <option value="Resurfacing">Resurfacing</option>
            <option value="Full Reconstruction">Full Reconstruction</option>
            <option value="Drainage Rectification">Drainage Rectification</option>
            <option value="Crack Sealing">Crack Sealing</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredPlans}
        searchKey={(m: MaintenancePlan) => `${m.id} ${m.title} ${m.roadName} ${m.assignedCrew}`}
        searchPlaceholder="Search maintenance plans by ID, project title, road, crew..."
        exportFileName="roadwatch-maintenance-plans"
        onRowClick={m => setSelectedPlan(m)}
      />

      {/* Plan Detail Drawer */}
      <DetailDrawer
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        title={selectedPlan ? `${selectedPlan.id} — ${selectedPlan.title}` : ''}
        subtitle={selectedPlan?.roadName}
        footer={
          selectedPlan && (
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => navigate(`/map?select=${selectedPlan.segmentId}`)}
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" /> View on Map
              </button>

              <div className="flex items-center gap-2">
                {selectedPlan.status === 'Proposed' && (
                  <button
                    onClick={() => handleStatusChange(selectedPlan, 'Under Review')}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                  >
                    Send to Review
                  </button>
                )}
                {selectedPlan.status === 'Under Review' && (
                  <button
                    onClick={() => handleStatusChange(selectedPlan, 'Approved')}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                  >
                    Approve Budget
                  </button>
                )}
                {selectedPlan.status === 'Approved' && (
                  <button
                    onClick={() => handleStatusChange(selectedPlan, 'Scheduled')}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                  >
                    Schedule Dispatch
                  </button>
                )}
                {selectedPlan.status === 'Scheduled' && (
                  <button
                    onClick={() => handleStatusChange(selectedPlan, 'In Progress')}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                  >
                    Start Field Works
                  </button>
                )}
                {selectedPlan.status === 'In Progress' && (
                  <button
                    onClick={() => {
                      setActivePlanForCompletion(selectedPlan);
                      setCompleteActualCost(String(selectedPlan.estimatedCost));
                      setShowCompleteModal(true);
                      setSelectedPlan(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                  >
                    Sign Off Completion
                  </button>
                )}
              </div>
            </div>
          )
        }
      >
        {selectedPlan && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center justify-between">
              <PriorityBadge priority={selectedPlan.priority} />
              <StatusBadge status={selectedPlan.status} />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#64748B]">Engineering Justification</span>
              <p className="text-xs text-[#172033] leading-relaxed">{selectedPlan.justification}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-[#E2E8F0]">
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Estimated Cost</span>
                <p className="text-base font-bold text-[#172033] mt-0.5">${selectedPlan.estimatedCost.toLocaleString()}</p>
                <span className="text-[10px] text-[#94A3B8]">Approved schedule of rates</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Actual Cost</span>
                <p className="text-base font-bold text-emerald-700 mt-0.5">
                  {selectedPlan.actualCost ? `$${selectedPlan.actualCost.toLocaleString()}` : 'Pending completion'}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Assigned Maintenance Unit</span>
                <p className="font-semibold text-[#172033] mt-0.5">{selectedPlan.assignedCrew}</p>
                <p className="text-[10px] text-[#94A3B8]">Supervisor: {selectedPlan.crewLeader}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Target Timeframe</span>
                <p className="font-semibold text-[#172033] mt-0.5">
                  {selectedPlan.startDate} &rarr; {selectedPlan.targetCompletionDate}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">
                Required Heavy Equipment &amp; Materials
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-slate-700">
                {selectedPlan.requiredResources.map((res, idx) => (
                  <li key={idx}>{res}</li>
                ))}
              </ul>
            </div>

            {selectedPlan.completionNotes && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-800">Field Completion Sign-Off</span>
                <p className="text-[11px] leading-snug">{selectedPlan.completionNotes}</p>
              </div>
            )}
          </div>
        )}
      </DetailDrawer>

      {/* Create Maintenance Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E2E8F0] max-w-xl w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#172033]">Create Capital Maintenance Work Plan</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#94A3B8] hover:text-[#172033]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-[#172033] mb-1">Target Road Segment</label>
                <select
                  value={formSegmentId}
                  onChange={e => setFormSegmentId(e.target.value)}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white"
                >
                  {roads.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.id}) &bull; Risk: {r.riskScore}/100 &bull; {r.priority}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Deep Milling & Polymer Overlay Phase 2"
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Intervention Type</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as any)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white"
                  >
                    <option value="Resurfacing">Asphalt Resurfacing</option>
                    <option value="Full Reconstruction">Full Reconstruction</option>
                    <option value="Pothole Patching">Pothole Patching</option>
                    <option value="Drainage Rectification">Drainage Rectification</option>
                    <option value="Crack Sealing">Crack Sealing</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as any)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Assigned Crew</label>
                  <input
                    type="text"
                    required
                    value={formCrew}
                    onChange={e => setFormCrew(e.target.value)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Estimated Cost ($ USD)</label>
                  <input
                    type="number"
                    required
                    value={formCost}
                    onChange={e => setFormCost(e.target.value)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    required
                    value={formTargetDate}
                    onChange={e => setFormTargetDate(e.target.value)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1">Required Equipment &amp; Resources</label>
                <input
                  type="text"
                  value={formResources}
                  onChange={e => setFormResources(e.target.value)}
                  placeholder="e.g. 20T excavator, WMM aggregates, tandem roller"
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1">Engineering Justification</label>
                <textarea
                  rows={2}
                  value={formJustification}
                  onChange={e => setFormJustification(e.target.value)}
                  placeholder="Correlate with citizen distress reports or predicted structural risk..."
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 border border-[#E2E8F0] rounded-lg font-medium text-[#64748B] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Submit Proposed Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {showCompleteModal && activePlanForCompletion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E2E8F0] max-w-md w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#172033]">
                Sign Off Completed Works: {activePlanForCompletion.id}
              </h3>
              <button onClick={() => setShowCompleteModal(false)} className="text-[#94A3B8] hover:text-[#172033]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-[#172033] mb-1">Final Audited Cost ($)</label>
                <input
                  type="number"
                  required
                  value={completeActualCost}
                  onChange={e => setCompleteActualCost(e.target.value)}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1">Completion Notes &amp; Quality Check</label>
                <textarea
                  rows={3}
                  required
                  value={completeNotes}
                  onChange={e => setCompleteNotes(e.target.value)}
                  placeholder="Confirm bitumen density, surface tolerance, line striping, and drainage clearing..."
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-3.5 py-1.5 border border-[#E2E8F0] rounded-lg font-medium text-[#64748B] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Confirm Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
