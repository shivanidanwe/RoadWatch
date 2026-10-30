import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  MapPin,
  Camera,
  Calendar,
  AlertCircle,
  FileCheck,
  PauseCircle
} from 'lucide-react';

export const MaintenancePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { maintenancePlans, reports, roads, createMaintenance, updateMaintenance, addToast } = useApp();

  const [selectedPlan, setSelectedPlan] = useState<MaintenancePlan | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [activePlanForCompletion, setActivePlanForCompletion] = useState<MaintenancePlan | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Create Plan Form
  const [formSource, setFormSource] = useState<'report' | 'segment'>('report');
  const [formReportId, setFormReportId] = useState('');
  const [formSegmentId, setFormSegmentId] = useState(roads[0]?.id || 'RD-DEMO-01');
  const [formRoadName, setFormRoadName] = useState('');
  const [formWard, setFormWard] = useState('Central Ward');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<MaintenanceType>('Pothole Patching' as any);
  const [formPriority, setFormPriority] = useState<PriorityLevel>('High');
  const [formCrew, setFormCrew] = useState('Municipal Rapid Repair Squad A');
  const [formLeader, setFormLeader] = useState('Eng. Ramesh Nair');
  const [formCost, setFormCost] = useState('45000');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [formTargetDate, setFormTargetDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10)
  );
  const [formBeforePhoto, setFormBeforePhoto] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Complete Plan Form
  const [completeActualCost, setCompleteActualCost] = useState('');
  const [completeActualDate, setCompleteActualDate] = useState(new Date().toISOString().substring(0, 10));
  const [completeAfterPhoto, setCompleteAfterPhoto] = useState('');
  const [completeNotes, setCompleteNotes] = useState('');

  // Check if directed from ReportsPage with ?reportId=...
  useEffect(() => {
    const qReportId = searchParams.get('reportId');
    if (qReportId) {
      const rep = reports.find(r => r.id === qReportId || r.reportCode === qReportId);
      if (rep) {
        setFormSource('report');
        setFormReportId(rep.id);
        setFormRoadName(rep.roadName);
        setFormWard(rep.area || 'Municipal Ward');
        setFormTitle(`${rep.category} Remediation on ${rep.roadName}`);
        setFormDescription(rep.description);
        setFormPriority((rep.priorityLevel || rep.severity) as PriorityLevel);
        if (rep.imageUrl) setFormBeforePhoto(rep.imageUrl);
        setShowCreateModal(true);
      }
    }
  }, [searchParams, reports]);

  const handleReportChange = (repId: string) => {
    setFormReportId(repId);
    const rep = reports.find(r => r.id === repId);
    if (rep) {
      setFormRoadName(rep.roadName);
      setFormWard(rep.area || 'Municipal Ward');
      setFormTitle(`${rep.category} Repair on ${rep.roadName}`);
      setFormDescription(rep.description);
      setFormPriority((rep.priorityLevel || rep.severity) as PriorityLevel);
      if (rep.imageUrl) setFormBeforePhoto(rep.imageUrl);
    }
  };

  const handleSegmentChange = (segId: string) => {
    setFormSegmentId(segId);
    const road = roads.find(r => r.id === segId);
    if (road) {
      setFormRoadName(road.name);
      setFormWard(road.ward);
      setFormTitle(`Maintenance Works on ${road.name}`);
      setFormPriority(road.priority as PriorityLevel);
    }
  };

  // Financial calculations
  const totalCommitted = maintenancePlans
    .filter(m => ['Approved', 'Scheduled', 'In Progress'].includes(m.status))
    .reduce((acc, m) => acc + (m.estimatedCost || 0), 0);

  const totalCompletedCost = maintenancePlans
    .filter(m => m.status === 'Completed')
    .reduce((acc, m) => acc + (m.actualCost || m.estimatedCost || 0), 0);

  const totalPending = maintenancePlans.filter(m => m.status === 'Pending').length;
  const inProgressCount = maintenancePlans.filter(m => m.status === 'In Progress').length;
  const completedCount = maintenancePlans.filter(m => m.status === 'Completed').length;

  const filteredPlans = useMemo(() => {
    return maintenancePlans.filter(m => {
      if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
      if (priorityFilter !== 'ALL' && m.priority !== priorityFilter) return false;
      return true;
    });
  }, [maintenancePlans, statusFilter, priorityFilter]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalRoad = formRoadName.trim() || 'Municipal Road';
    const finalWard = formWard.trim() || 'Municipal Ward';

    const beforePhotos = formBeforePhoto.trim() ? [formBeforePhoto.trim()] : [];

    await createMaintenance({
      segmentId: formSource === 'segment' ? formSegmentId : 'RD-AUTO',
      roadName: finalRoad,
      ward: finalWard,
      title: formTitle.trim() || `Pavement Maintenance on ${finalRoad}`,
      maintenanceType: formType,
      priority: formPriority,
      status: 'Pending',
      assignedCrew: formCrew,
      crewLeader: formLeader,
      estimatedCost: parseFloat(formCost) || 35000,
      startDate: formStartDate,
      targetCompletionDate: formTargetDate,
      requiredResources: ['Bituminous asphalt mix', 'Tamping compactor', 'Safety signage'],
      justification: formDescription || formNotes || `Municipal maintenance intervention.`,
      budgetStatus: 'Within Allocation',
      reportId: formSource === 'report' ? formReportId : undefined,
      description: formDescription,
      beforePhotos: beforePhotos,
    } as any);

    setShowCreateModal(false);
    setFormTitle('');
    setFormDescription('');
    setFormBeforePhoto('');
    addToast('success', 'Maintenance Created', `Work order logged for ${finalRoad}.`);
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlanForCompletion) return;

    const afterPhotos = completeAfterPhoto.trim() ? [completeAfterPhoto.trim()] : [];

    await updateMaintenance(activePlanForCompletion.id, {
      status: 'Completed',
      actualCost: parseFloat(completeActualCost) || activePlanForCompletion.estimatedCost,
      actualCompletionDate: completeActualDate,
      notes: completeNotes || 'Repairs completed to municipal highway standards.',
      afterPhotos: afterPhotos,
    } as any);

    setShowCompleteModal(false);
    setActivePlanForCompletion(null);
    setCompleteNotes('');
    setCompleteAfterPhoto('');
    addToast('success', 'Repairs Signed Off', `Maintenance order ${activePlanForCompletion.id} marked Completed.`);
  };

  const handleStatusChange = async (plan: MaintenancePlan, nextStatus: MaintenanceStatus) => {
    if (nextStatus === 'Completed') {
      setActivePlanForCompletion(plan);
      setCompleteActualCost(String(plan.estimatedCost));
      setShowCompleteModal(true);
      return;
    }

    await updateMaintenance(plan.id, { status: nextStatus });
    setSelectedPlan(prev => (prev ? { ...prev, status: nextStatus } : null));
    addToast('success', 'Status Updated', `Work order moved to ${nextStatus}.`);
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
      header: 'Work Order & Location',
      sortable: true,
      render: m => (
        <div>
          <span className="font-semibold text-[#F5F3FF] block">{m.title}</span>
          <span className="text-[11px] text-[#B9AECF]">
            {m.roadName} • {m.ward} {m.reportId ? `• Complaint: ${m.reportId}` : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'maintenanceType',
      header: 'Intervention',
      sortable: true,
      render: m => <span className="text-xs text-[#B9AECF] font-medium">{m.maintenanceType}</span>,
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: m => <PriorityBadge priority={m.priority} />,
    },
    {
      key: 'estimatedCost',
      header: 'Estimated Cost',
      sortable: true,
      render: m => (
        <div>
          <span className="font-semibold text-[#F5F3FF] text-xs">
            ${m.estimatedCost.toLocaleString()}
          </span>
          {m.actualCost !== undefined && m.actualCost !== null && (
            <span className="text-[10px] text-[#34D399] block font-mono">
              Act: ${m.actualCost.toLocaleString()}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'targetCompletionDate',
      header: 'Target Date',
      sortable: true,
      render: m => <span className="text-xs text-[#B9AECF]">{m.targetCompletionDate}</span>,
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
          {m.status !== 'Completed' && (
            <button
              onClick={() => {
                setActivePlanForCompletion(m);
                setCompleteActualCost(String(m.estimatedCost));
                setShowCompleteModal(true);
              }}
              className="px-2 py-1 text-[11px] font-semibold text-white bg-[#10B981] hover:bg-emerald-600 rounded transition shadow-xs"
              title="Mark repair as completed"
            >
              Sign Off
            </button>
          )}
          <button
            onClick={() => setSelectedPlan(m)}
            className="p-1.5 text-[#B9AECF] hover:text-[#A78BFA] rounded hover:bg-[#2B2042] transition"
            title="Inspect work order"
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
        title="Maintenance Management"
        subtitle="Manage road repair work orders, track planned vs actual expenditure, sign off completed works, and document before/after photos."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30">
            {filteredPlans.length} Work Orders
          </span>
        }
        actions={
          <button
            onClick={() => {
              setFormSource('report');
              if (reports.length > 0) handleReportChange(reports[0].id);
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-lg shadow-xs transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Work Order</span>
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        <div className="bg-[#211735] p-4 rounded-xl border border-[#3B2D53] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#B9AECF] uppercase tracking-wider">Pending Orders</span>
            <Clock className="w-4 h-4 text-[#FBBF24]" />
          </div>
          <div className="text-2xl font-bold text-[#F5F3FF] mt-2">{totalPending}</div>
          <span className="text-[11px] text-[#B9AECF] mt-1 block">Awaiting authority dispatch</span>
        </div>

        <div className="bg-[#211735] p-4 rounded-xl border border-[#3B2D53] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#B9AECF] uppercase tracking-wider">Repairs in Progress</span>
            <Users className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="text-2xl font-bold text-[#A78BFA] mt-2">{inProgressCount}</div>
          <span className="text-[11px] text-[#B9AECF] mt-1 block">Crews actively on site</span>
        </div>

        <div className="bg-[#211735] p-4 rounded-xl border border-[#3B2D53] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#B9AECF] uppercase tracking-wider">Completed Repairs</span>
            <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
          </div>
          <div className="text-2xl font-bold text-[#34D399] mt-2">{completedCount}</div>
          <span className="text-[11px] text-[#B9AECF] mt-1 block">Successfully resolved</span>
        </div>

        <div className="bg-[#211735] p-4 rounded-xl border border-[#3B2D53] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#B9AECF] uppercase tracking-wider">Total Expenditure</span>
            <DollarSign className="w-4 h-4 text-[#34D399]" />
          </div>
          <div className="text-2xl font-bold text-[#F5F3FF] mt-2">${totalCompletedCost.toLocaleString()}</div>
          <span className="text-[11px] text-[#B9AECF] mt-1 block">Committed: ${totalCommitted.toLocaleString()}</span>
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
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[#B9AECF]">Priority:</span>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="p-1.5 border border-[#3B2D53] rounded-lg bg-[#140E22] font-medium text-[#F5F3FF] focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {(statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
          <button
            onClick={() => {
              setStatusFilter('ALL');
              setPriorityFilter('ALL');
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
        data={filteredPlans}
        searchKey={(m: MaintenancePlan) => `${m.id} ${m.title} ${m.roadName} ${m.ward}`}
        searchPlaceholder="Search work orders by ID, project title, or corridor..."
        exportFileName="roadwatch-maintenance-plans"
        onRowClick={m => setSelectedPlan(m)}
      />

      {/* Maintenance Detail Drawer */}
      <DetailDrawer
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        title={selectedPlan ? `${selectedPlan.id} — ${selectedPlan.maintenanceType}` : ''}
        subtitle={selectedPlan ? `${selectedPlan.title} (${selectedPlan.roadName})` : ''}
        footer={
          selectedPlan && (
            <div className="flex items-center justify-between w-full flex-wrap gap-2">
              <button
                onClick={() => navigate(`/map?select=${selectedPlan.segmentId}`)}
                className="px-3 py-1.5 text-xs text-[#A78BFA] font-semibold hover:underline flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" /> View on Map
              </button>

              <div className="flex items-center gap-2">
                {selectedPlan.status !== 'Completed' && (
                  <button
                    onClick={() => {
                      setActivePlanForCompletion(selectedPlan);
                      setCompleteActualCost(String(selectedPlan.estimatedCost));
                      setShowCompleteModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete &amp; Sign Off</span>
                  </button>
                )}
              </div>
            </div>
          )
        }
      >
        {selectedPlan && (
          <div className="space-y-4 text-xs text-[#F5F3FF]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#8B5CF6]/20 font-bold text-[#C4B5FD] border border-[#8B5CF6]/30">
                {selectedPlan.id}
              </span>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={selectedPlan.priority} />
                <StatusBadge status={selectedPlan.status} />
              </div>
            </div>

            {/* Direct Status Selector */}
            <div className="p-3.5 rounded-xl bg-[#140E22] border border-[#3B2D53] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold tracking-wider block">
                  Repair Status
                </span>
                <span className="text-[11px] text-[#B9AECF]">
                  Municipal tracking workflow
                </span>
              </div>
              <select
                value={selectedPlan.status}
                onChange={e => handleStatusChange(selectedPlan, e.target.value as MaintenanceStatus)}
                className="p-1.5 border border-[#8B5CF6]/40 rounded-lg bg-[#211735] text-xs font-semibold text-[#F5F3FF] focus:outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl border border-[#3B2D53] bg-[#140E22]">
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Road Corridor</span>
                <p className="font-bold text-[#F5F3FF]">{selectedPlan.roadName}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Ward / Zone</span>
                <p className="font-bold text-[#F5F3FF]">{selectedPlan.ward}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Assigned Crew</span>
                <p className="font-bold text-[#F5F3FF]">{selectedPlan.assignedCrew}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Crew Leader</span>
                <p className="font-bold text-[#F5F3FF]">{selectedPlan.crewLeader}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Planned Start</span>
                <p className="font-bold text-[#F5F3FF]">{selectedPlan.startDate}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Expected Completion</span>
                <p className="font-bold text-[#F5F3FF]">{selectedPlan.targetCompletionDate}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Estimated Cost</span>
                <p className="font-bold text-[#F5F3FF]">${selectedPlan.estimatedCost.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Actual Cost</span>
                <p className="font-bold text-[#34D399]">
                  {selectedPlan.actualCost !== undefined && selectedPlan.actualCost !== null
                    ? `$${selectedPlan.actualCost.toLocaleString()}`
                    : 'Pending completion'}
                </p>
              </div>
              {selectedPlan.actualCompletionDate && (
                <div className="col-span-2">
                  <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Actual Completion Date</span>
                  <p className="font-bold text-[#34D399]">{selectedPlan.actualCompletionDate}</p>
                </div>
              )}
              {selectedPlan.reportId && (
                <div className="col-span-2">
                  <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Linked Complaint Reference</span>
                  <p className="font-mono text-xs font-bold text-[#A78BFA]">{selectedPlan.reportId}</p>
                </div>
              )}
            </div>

            {/* Scope description */}
            <div className="p-3.5 rounded-xl bg-[#140E22] border border-[#3B2D53] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#B9AECF]">Repair Description &amp; Scope</span>
              <p className="text-xs text-[#F5F3FF] leading-relaxed">
                {(selectedPlan as any).description || selectedPlan.justification || 'Standard municipal pavement repair.'}
              </p>
            </div>

            {/* Notes if completed */}
            {selectedPlan.completionNotes && (
              <div className="p-3.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#34D399] flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5" /> Sign-Off Notes
                </span>
                <p className="text-xs text-[#F5F3FF] leading-relaxed">{selectedPlan.completionNotes}</p>
              </div>
            )}

            {/* Before and After Photographs */}
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase font-bold text-[#B9AECF] tracking-wider">
                Before &amp; After Photographs
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl bg-[#140E22] border border-[#3B2D53] space-y-1.5">
                  <span className="text-[10px] font-bold text-[#FB7185] uppercase flex items-center gap-1">
                    <Camera className="w-3 h-3" /> Pre-Repair Distress
                  </span>
                  {(selectedPlan as any).beforePhotos && (selectedPlan as any).beforePhotos.length > 0 ? (
                    <div className="rounded-lg overflow-hidden border border-[#3B2D53] bg-black/40 max-h-36">
                      <img
                        src={getFullImageUrl((selectedPlan as any).beforePhotos[0])}
                        alt="Pre-repair distress"
                        className="w-full h-full object-cover max-h-36"
                      />
                    </div>
                  ) : (
                    <div className="h-24 rounded-lg border border-dashed border-[#3B2D53] flex items-center justify-center text-[#B9AECF] text-[11px]">
                      No pre-repair photo
                    </div>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-[#140E22] border border-[#3B2D53] space-y-1.5">
                  <span className="text-[10px] font-bold text-[#34D399] uppercase flex items-center gap-1">
                    <Camera className="w-3 h-3" /> Post-Repair Completion
                  </span>
                  {(selectedPlan as any).afterPhotos && (selectedPlan as any).afterPhotos.length > 0 ? (
                    <div className="rounded-lg overflow-hidden border border-[#3B2D53] bg-black/40 max-h-36">
                      <img
                        src={getFullImageUrl((selectedPlan as any).afterPhotos[0])}
                        alt="Post-repair completion"
                        className="w-full h-full object-cover max-h-36"
                      />
                    </div>
                  ) : (
                    <div className="h-24 rounded-lg border border-dashed border-[#3B2D53] flex items-center justify-center text-[#B9AECF] text-[11px]">
                      Pending repair completion
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* Create Work Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#211735] rounded-xl shadow-2xl border border-[#3B2D53] max-w-lg w-full p-6 text-xs space-y-4 text-[#F5F3FF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#3B2D53]">
              <h3 className="text-sm font-bold text-[#F5F3FF]">Create Maintenance Work Order</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#B9AECF] hover:text-[#F5F3FF]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              {/* Select Target */}
              <div className="space-y-1">
                <label className="block font-semibold text-[#F5F3FF]">Select Maintenance Target</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormSource('report');
                      if (reports.length > 0) handleReportChange(reports[0].id);
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold transition ${
                      formSource === 'report'
                        ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                        : 'bg-[#140E22] text-[#B9AECF] border-[#3B2D53]'
                    }`}
                  >
                    Verified Citizen Report
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormSource('segment');
                      if (roads.length > 0) handleSegmentChange(roads[0].id);
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
                    Select Report <span className="text-[#FB7185]">*</span>
                  </label>
                  <select
                    value={formReportId}
                    onChange={e => handleReportChange(e.target.value)}
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
                    onChange={e => handleSegmentChange(e.target.value)}
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

              <div>
                <label className="block font-semibold text-[#F5F3FF] mb-1">
                  Work Order Title <span className="text-[#FB7185]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Rapid Pothole Patching & Resurfacing"
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Maintenance Type</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as any)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  >
                    <option value="Pothole Patching">Pothole Patching</option>
                    <option value="Crack Sealing">Crack Sealing</option>
                    <option value="Resurfacing">Resurfacing</option>
                    <option value="Drainage Maintenance">Drainage Maintenance</option>
                    <option value="Reconstruction">Full Reconstruction</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as PriorityLevel)}
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
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Estimated Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formCost}
                    onChange={e => setFormCost(e.target.value)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Assigned Repair Crew</label>
                  <input
                    type="text"
                    value={formCrew}
                    onChange={e => setFormCrew(e.target.value)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Planned Start Date</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Expected Completion Date</label>
                  <input
                    type="date"
                    required
                    value={formTargetDate}
                    onChange={e => setFormTargetDate(e.target.value)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#F5F3FF] mb-1">Before Photograph URL (Optional)</label>
                <input
                  type="url"
                  value={formBeforePhoto}
                  onChange={e => setFormBeforePhoto(e.target.value)}
                  placeholder="https://... or /uploads/damage.jpg"
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] placeholder-[#B9AECF]/50 focus:border-[#A78BFA] focus:outline-none text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#F5F3FF] mb-1">Repair Description &amp; Scope</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Scope of works, material specifications, and traffic detour plan..."
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] placeholder-[#B9AECF]/50 focus:border-[#A78BFA] focus:outline-none resize-none"
                />
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

      {/* Complete & Sign Off Modal */}
      {showCompleteModal && activePlanForCompletion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#211735] rounded-xl shadow-2xl border border-[#3B2D53] max-w-lg w-full p-6 text-xs space-y-4 text-[#F5F3FF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#3B2D53]">
              <div>
                <h3 className="text-sm font-bold text-[#F5F3FF]">Sign Off Completed Maintenance</h3>
                <p className="text-[11px] text-[#B9AECF]">
                  Order: <strong>{activePlanForCompletion.id} — {activePlanForCompletion.title}</strong>
                </p>
              </div>
              <button onClick={() => setShowCompleteModal(false)} className="text-[#B9AECF] hover:text-[#F5F3FF]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">
                    Actual Repair Cost ($) <span className="text-[#FB7185]">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={completeActualCost}
                    onChange={e => setCompleteActualCost(e.target.value)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none font-mono font-bold"
                  />
                  <span className="text-[10px] text-[#B9AECF] mt-0.5 block">
                    Estimated: ${activePlanForCompletion.estimatedCost.toLocaleString()}
                  </span>
                </div>
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">
                    Actual Completion Date <span className="text-[#FB7185]">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={completeActualDate}
                    onChange={e => setCompleteActualDate(e.target.value)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#F5F3FF] mb-1">Post-Repair Photograph URL</label>
                <input
                  type="url"
                  value={completeAfterPhoto}
                  onChange={e => setCompleteAfterPhoto(e.target.value)}
                  placeholder="https://... or /uploads/completed-road.jpg"
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] placeholder-[#B9AECF]/50 focus:border-[#A78BFA] focus:outline-none text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#F5F3FF] mb-1">
                  Completion &amp; Sign-Off Notes <span className="text-[#FB7185]">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={completeNotes}
                  onChange={e => setCompleteNotes(e.target.value)}
                  placeholder="Describe final compaction tests, bituminous quality, and clearance for traffic opening..."
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] placeholder-[#B9AECF]/50 focus:border-[#A78BFA] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#3B2D53]">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-3.5 py-1.5 border border-[#3B2D53] rounded-lg font-medium text-[#B9AECF] hover:bg-[#2B2042] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-xs transition"
                >
                  Confirm Completion &amp; Sign Off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
