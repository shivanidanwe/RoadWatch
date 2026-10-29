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
  PlusCircle,
  Eye,
  Filter,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
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
  const [formSegmentId, setFormSegmentId] = useState(roads[0]?.id || 'RD-DEMO-01');
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<MaintenanceType>('Resurfacing');
  const [formPriority, setFormPriority] = useState<PriorityLevel>('Critical');
  const [formCrew, setFormCrew] = useState('Rapid Asphalt Squadron A');
  const [formLeader, setFormLeader] = useState('Eng. Ramesh Nair');
  const [formCost, setFormCost] = useState('65000');
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
    addToast('success', 'Plan Created', 'Maintenance work order submitted for review.');
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlanForCompletion) return;

    await updateMaintenance(activePlanForCompletion.id, {
      status: 'Completed',
      actualCost: parseInt(completeActualCost) || activePlanForCompletion.estimatedCost,
      actualCompletionDate: new Date().toISOString().substring(0, 10),
      completionNotes: completeNotes || 'Work completed to municipal highway specifications.',
    });

    setShowCompleteModal(false);
    setActivePlanForCompletion(null);
    setCompleteNotes('');
    addToast('success', 'Works Signed Off', 'Maintenance order marked Completed.');
  };

  const handleStatusChange = async (plan: MaintenancePlan, nextStatus: MaintenanceStatus) => {
    await updateMaintenance(plan.id, { status: nextStatus });
    setSelectedPlan(prev => (prev ? { ...prev, status: nextStatus } : null));
    addToast('success', 'Status Updated', `Work order moved to ${nextStatus}.`);
  };

  const columns: Column<MaintenancePlan>[] = [
    {
      key: 'id',
      header: 'Order ID',
      sortable: true,
      width: '110px',
      render: m => (
        <span className="font-mono text-xs font-bold text-[#C4B5FD] bg-[#8B5CF6]/20 px-2 py-0.5 rounded border border-[#8B5CF6]/30">
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
          <span className="font-semibold text-[#F5F3FF] block">{m.title}</span>
          <span className="text-[11px] text-[#B9AECF]">{m.roadName} &bull; {m.ward}</span>
        </div>
      ),
    },
    {
      key: 'maintenanceType',
      header: 'Intervention',
      sortable: true,
      render: m => <span className="font-medium text-xs text-[#F5F3FF]">{m.maintenanceType}</span>,
    },
    {
      key: 'estimatedCost',
      header: 'Cost',
      sortable: true,
      align: 'right',
      render: m => (
        <div className="text-right">
          <span className="font-bold text-[#F5F3FF]">${m.estimatedCost.toLocaleString()}</span>
          <span className="text-[10px] text-[#B9AECF] block">Estimate</span>
        </div>
      ),
    },
    {
      key: 'assignedCrew',
      header: 'Assigned Crew',
      sortable: true,
      render: m => (
        <span className="text-xs text-[#B9AECF] truncate max-w-[150px] block" title={m.assignedCrew}>
          {m.assignedCrew}
        </span>
      ),
    },
    {
      key: 'targetCompletionDate',
      header: 'Target Date',
      sortable: true,
      render: m => <span className="text-xs text-[#B9AECF]">{m.targetCompletionDate}</span>,
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
              className="px-2 py-1 text-[11px] font-semibold text-white bg-[#34D399] hover:bg-emerald-600 rounded transition"
            >
              Sign Off
            </button>
          )}
          <button
            onClick={() => setSelectedPlan(m)}
            className="p-1.5 text-[#B9AECF] hover:text-[#A78BFA] rounded hover:bg-[#2B2042] transition"
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
        title="Maintenance Planning &amp; Works Dispatch"
        subtitle="Translate prioritized distress predictions into capital work orders and monitor execution progress."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30">
            {filteredPlans.length} Work Orders
          </span>
        }
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-lg shadow-xs transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Work Order</span>
          </button>
        }
      />

      {/* Budget Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        <div className="bg-[#211735] p-4 rounded-xl border border-[#3B2D53] shadow-xs min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#B9AECF] uppercase tracking-wider">
              Committed Budget
            </span>
            <DollarSign className="w-4 h-4 text-[#A78BFA]" />
          </div>
          <div className="text-2xl font-bold text-[#F5F3FF] mt-2">
            ${(totalCommitted / 1000).toFixed(0)}k
          </div>
          <span className="text-[11px] text-[#B9AECF] mt-1 block">Scheduled &amp; In-Progress</span>
        </div>

        <div className="bg-[#211735] p-4 rounded-xl border border-[#3B2D53] shadow-xs min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#FBBF24] uppercase tracking-wider">
              Backlog Pending
            </span>
            <Clock className="w-4 h-4 text-[#FBBF24]" />
          </div>
          <div className="text-2xl font-bold text-[#FBBF24] mt-2">
            ${(totalBacklog / 1000).toFixed(0)}k
          </div>
          <span className="text-[11px] text-[#B9AECF] mt-1 block">Proposed &amp; pending review</span>
        </div>

        <div className="bg-[#211735] p-4 rounded-xl border border-[#3B2D53] shadow-xs min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#34D399] uppercase tracking-wider">
              Completed Repairs
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
          </div>
          <div className="text-2xl font-bold text-[#34D399] mt-2">
            ${(totalCompletedCost / 1000).toFixed(0)}k
          </div>
          <span className="text-[11px] text-[#B9AECF] mt-1 block">Audited work orders</span>
        </div>

        <div className="bg-[#211735] p-4 rounded-xl border border-[#3B2D53] shadow-xs min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-wider">
              Active Squads
            </span>
            <Users className="w-4 h-4 text-[#A78BFA]" />
          </div>
          <div className="text-2xl font-bold text-[#A78BFA] mt-2">3 Units</div>
          <span className="text-[11px] text-[#B9AECF] mt-1 block">Paving &amp; Drainage units</span>
        </div>
      </div>

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
            <option value="Proposed">Proposed</option>
            <option value="Under Review">Under Review</option>
            <option value="Scheduled">Scheduled</option>
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
            <option value="Resurfacing">Resurfacing</option>
            <option value="Drainage Rectification">Drainage Rectification</option>
            <option value="Overlay">Overlay</option>
            <option value="Patching">Patching</option>
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
                className="text-xs text-[#A78BFA] font-semibold hover:underline flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" /> View on Map
              </button>

              <div className="flex items-center gap-2">
                {selectedPlan.status === 'Proposed' && (
                  <button
                    onClick={() => handleStatusChange(selectedPlan, 'Under Review')}
                    className="px-3 py-1.5 rounded-lg bg-[#8B5CF6] text-white text-xs font-semibold hover:bg-[#7C3AED] transition"
                  >
                    Send to Review
                  </button>
                )}
                {selectedPlan.status === 'Under Review' && (
                  <button
                    onClick={() => handleStatusChange(selectedPlan, 'Scheduled')}
                    className="px-3 py-1.5 rounded-lg bg-[#8B5CF6] text-white text-xs font-semibold hover:bg-[#7C3AED] transition"
                  >
                    Schedule Works
                  </button>
                )}
              </div>
            </div>
          )
        }
      >
        {selectedPlan && (
          <div className="space-y-4 text-xs text-[#F5F3FF]">
            <div className="flex items-center justify-between">
              <PriorityBadge priority={selectedPlan.priority} />
              <StatusBadge status={selectedPlan.status} />
            </div>

            <div className="p-3.5 rounded-xl bg-[#140E22] border border-[#8B5CF6]/30 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#A78BFA]">Engineering Justification</span>
              <p className="text-xs text-[#F5F3FF] leading-relaxed">{selectedPlan.justification}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-[#3B2D53] bg-[#140E22]">
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Estimated Cost</span>
                <p className="text-base font-bold text-[#F5F3FF] mt-0.5">${selectedPlan.estimatedCost.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Actual Cost</span>
                <p className="text-base font-bold text-[#34D399] mt-0.5">
                  {selectedPlan.actualCost ? `$${selectedPlan.actualCost.toLocaleString()}` : 'Pending completion'}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Assigned Unit</span>
                <p className="font-semibold text-[#F5F3FF] mt-0.5">{selectedPlan.assignedCrew}</p>
                <p className="text-[10px] text-[#B9AECF]">Supervisor: {selectedPlan.crewLeader}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Timeframe</span>
                <p className="font-semibold text-[#F5F3FF] mt-0.5">
                  {selectedPlan.startDate} &rarr; {selectedPlan.targetCompletionDate}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] uppercase font-bold text-[#B9AECF] tracking-wider">
                Required Equipment &amp; Materials
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-[#B9AECF]">
                {selectedPlan.requiredResources.map((res, idx) => (
                  <li key={idx}>{res}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* Create Maintenance Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#211735] rounded-xl shadow-2xl border border-[#3B2D53] max-w-xl w-full p-6 text-xs space-y-4 text-[#F5F3FF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#3B2D53]">
              <h3 className="text-sm font-bold text-[#F5F3FF]">Create Maintenance Plan</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#B9AECF] hover:text-[#F5F3FF]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-[#F5F3FF] mb-1">Target Road Segment</label>
                <select
                  value={formSegmentId}
                  onChange={e => setFormSegmentId(e.target.value)}
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                >
                  {roads.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.id}) &bull; Risk: {r.riskScore}/100
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#F5F3FF] mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Deep Milling & Polymer Overlay"
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] placeholder-[#B9AECF]/50 focus:border-[#A78BFA] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Intervention Type</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as any)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  >
                    <option value="Resurfacing">Resurfacing</option>
                    <option value="Drainage Rectification">Drainage Rectification</option>
                    <option value="Overlay">Overlay</option>
                    <option value="Patching">Patching</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as any)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
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
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Assigned Crew</label>
                  <input
                    type="text"
                    required
                    value={formCrew}
                    onChange={e => setFormCrew(e.target.value)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Estimated Cost ($ USD)</label>
                  <input
                    type="number"
                    required
                    value={formCost}
                    onChange={e => setFormCost(e.target.value)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#3B2D53]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 border border-[#3B2D53] rounded-lg font-medium text-[#B9AECF] hover:bg-[#2B2042] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-lg shadow-xs transition"
                >
                  Create Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
