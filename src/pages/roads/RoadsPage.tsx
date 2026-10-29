import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { ConditionBadge } from '../../components/common/ConditionBadge';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { RoadSegment, RoadCondition, PriorityLevel } from '../../types';
import {
  PlusCircle,
  MapPin,
  Edit,
  Eye,
  Filter,
  Zap
} from 'lucide-react';

export const RoadsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { roads, createRoad, updateRoad, addToast } = useApp();

  // Drawer / Modal states
  const [selectedRoad, setSelectedRoad] = useState<RoadSegment | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoad, setEditingRoad] = useState<RoadSegment | null>(null);

  // Filters
  const [wardFilter, setWardFilter] = useState('ALL');
  const [conditionFilter, setConditionFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Form states for Add / Edit
  const [formName, setFormName] = useState('');
  const [formWard, setFormWard] = useState('Ward 4 - North Zone');
  const [formLength, setFormLength] = useState('3.5');
  const [formRoadType, setFormRoadType] = useState<'Arterial' | 'Sub-Arterial' | 'Collector' | 'Local Access'>('Arterial');
  const [formSurface, setFormSurface] = useState<'Asphalt' | 'Concrete' | 'Bituminous Macadam' | 'Paver Blocks'>('Asphalt');
  const [formCondition, setFormCondition] = useState<RoadCondition>('Fair');
  const [formTraffic, setFormTraffic] = useState<'Very Low' | 'Moderate' | 'Heavy' | 'Extreme High-Volume'>('Heavy');
  const [formWeather, setFormWeather] = useState<'Low' | 'Moderate' | 'High Monsoon Flood Zone' | 'High Thermal Stress'>('Moderate');
  const [formRecommendation, setFormRecommendation] = useState('');

  // Auto-select road if ?search=RD-101 in query string
  React.useEffect(() => {
    const q = searchParams.get('search');
    if (q) {
      const match = roads.find(r => r.id === q || r.name.toLowerCase().includes(q.toLowerCase()));
      if (match) setSelectedRoad(match);
    }
  }, [searchParams, roads]);

  // Unique wards
  const wards = useMemo(() => {
    return Array.from(new Set(roads.map(r => r.ward)));
  }, [roads]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return roads.filter(r => {
      if (wardFilter !== 'ALL' && r.ward !== wardFilter) return false;
      if (conditionFilter !== 'ALL' && r.currentCondition !== conditionFilter) return false;
      if (priorityFilter !== 'ALL' && r.priority !== priorityFilter) return false;
      return true;
    });
  }, [roads, wardFilter, conditionFilter, priorityFilter]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      addToast('warning', 'Validation Error', 'Road segment name is required.');
      return;
    }

    const pci = formCondition === 'Good' ? 85 : formCondition === 'Fair' ? 62 : formCondition === 'Poor' ? 45 : 30;
    const risk = formCondition === 'Critical' ? 88 : formCondition === 'Poor' ? 74 : formCondition === 'Fair' ? 48 : 22;
    const priority: PriorityLevel = risk >= 75 ? 'Critical' : risk >= 50 ? 'High' : risk >= 25 ? 'Medium' : 'Low';

    await createRoad({
      name: formName,
      ward: formWard,
      lengthKm: parseFloat(formLength) || 2.0,
      roadType: formRoadType,
      surfaceType: formSurface,
      currentCondition: formCondition,
      pciScore: pci,
      riskScore: risk,
      priority: priority,
      trafficIntensity: formTraffic,
      weatherExposure: formWeather,
      lastInspectionDate: new Date().toISOString().substring(0, 10),
      nextInspectionDate: new Date(Date.now() + 90 * 86400000).toISOString().substring(0, 10),
      lastMaintenanceDate: '2023-06-01',
      openReportsCount: 0,
      coordinates: [12.9716, 77.5946],
      recommendedAction: formRecommendation || 'Routine visual survey and surface crack monitoring',
      recommendationReason: 'Newly registered inventory corridor scheduled for baseline survey.',
    });

    setShowAddModal(false);
    setFormName('');
    setFormRecommendation('');
    addToast('success', 'Road Registered', 'New corridor added to inventory.');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoad) return;

    await updateRoad(editingRoad.id, {
      name: formName,
      ward: formWard,
      lengthKm: parseFloat(formLength) || editingRoad.lengthKm,
      roadType: formRoadType,
      surfaceType: formSurface,
      currentCondition: formCondition,
      trafficIntensity: formTraffic,
      weatherExposure: formWeather,
      recommendedAction: formRecommendation,
    });

    setEditingRoad(null);
    addToast('success', 'Segment Updated', `Modifications saved for ${editingRoad.id}.`);
  };

  const openEditModal = (road: RoadSegment) => {
    setEditingRoad(road);
    setFormName(road.name);
    setFormWard(road.ward);
    setFormLength(String(road.lengthKm));
    setFormRoadType(road.roadType);
    setFormSurface(road.surfaceType);
    setFormCondition(road.currentCondition);
    setFormTraffic(road.trafficIntensity);
    setFormWeather(road.weatherExposure);
    setFormRecommendation(road.recommendedAction);
  };

  const columns: Column<RoadSegment>[] = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      width: '100px',
      render: r => (
        <span className="font-mono text-xs font-bold text-[#C4B5FD] bg-[#8B5CF6]/20 px-2 py-0.5 rounded border border-[#8B5CF6]/30">
          {r.id}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Road Corridor',
      sortable: true,
      render: r => (
        <div>
          <span className="font-semibold text-[#F5F3FF] block">{r.name}</span>
          <span className="text-[11px] text-[#B9AECF]">{r.roadType} &bull; {r.surfaceType}</span>
        </div>
      ),
    },
    {
      key: 'ward',
      header: 'Ward',
      sortable: true,
      render: r => <span className="text-xs text-[#B9AECF]">{r.ward}</span>,
    },
    {
      key: 'lengthKm',
      header: 'Length',
      sortable: true,
      align: 'right',
      render: r => <span className="font-medium text-[#F5F3FF]">{r.lengthKm} km</span>,
    },
    {
      key: 'currentCondition',
      header: 'Condition',
      sortable: true,
      render: r => <ConditionBadge condition={r.currentCondition} />,
    },
    {
      key: 'riskScore',
      header: 'Risk Score',
      sortable: true,
      align: 'center',
      render: r => (
        <span className={`font-bold flex items-center justify-center gap-1 ${r.riskScore >= 75 ? 'text-[#FB7185]' : r.riskScore >= 50 ? 'text-[#FBBF24]' : 'text-[#A78BFA]'}`}>
          <Zap className="w-3 h-3" />
          {r.riskScore}
        </span>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: r => <PriorityBadge priority={r.priority} />,
    },
    {
      key: 'lastInspectionDate',
      header: 'Last Audit',
      sortable: true,
      render: r => <span className="text-[11px] text-[#B9AECF]">{r.lastInspectionDate}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: r => (
        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setSelectedRoad(r)}
            className="p-1 text-[#B9AECF] hover:text-[#A78BFA] rounded hover:bg-[#2B2042] transition"
            title="Inspect full details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => openEditModal(r)}
            className="p-1 text-[#B9AECF] hover:text-[#A78BFA] rounded hover:bg-[#2B2042] transition"
            title="Edit road attributes"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigate(`/map?select=${r.id}`)}
            className="p-1 text-[#B9AECF] hover:text-[#A78BFA] rounded hover:bg-[#2B2042] transition"
            title="Locate on Map"
          >
            <MapPin className="w-3.5 h-3.5 text-[#A78BFA]" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 min-w-0">
      <PageHeader
        title="Road Segments Inventory"
        subtitle="Master catalog of municipal roadway network segments, Pavement Condition Indexes (PCI), and urgency ratings."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30">
            {filteredData.length} Corridors
          </span>
        }
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-lg shadow-xs transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Road Segment</span>
          </button>
        }
      />

      {/* Multi-filter Bar */}
      <div className="bg-[#211735] p-3.5 rounded-xl border border-[#3B2D53] shadow-xs flex flex-wrap items-center gap-3 text-xs min-w-0 text-[#F5F3FF]">
        <div className="flex items-center gap-1 text-[#B9AECF] font-semibold">
          <Filter className="w-3.5 h-3.5 text-[#A78BFA]" />
          <span>Filters:</span>
        </div>

        {/* Ward Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#B9AECF]">Ward:</span>
          <select
            value={wardFilter}
            onChange={e => setWardFilter(e.target.value)}
            className="p-1.5 border border-[#3B2D53] rounded-lg bg-[#140E22] font-medium text-[#F5F3FF] focus:outline-none"
          >
            <option value="ALL">All Wards ({wards.length})</option>
            {wards.map(w => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>

        {/* Condition Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#B9AECF]">Condition:</span>
          <select
            value={conditionFilter}
            onChange={e => setConditionFilter(e.target.value)}
            className="p-1.5 border border-[#3B2D53] rounded-lg bg-[#140E22] font-medium text-[#F5F3FF] focus:outline-none"
          >
            <option value="ALL">All Conditions</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {/* Priority Filter */}
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

        {(wardFilter !== 'ALL' || conditionFilter !== 'ALL' || priorityFilter !== 'ALL') && (
          <button
            onClick={() => {
              setWardFilter('ALL');
              setConditionFilter('ALL');
              setPriorityFilter('ALL');
            }}
            className="text-xs text-[#A78BFA] hover:underline font-semibold ml-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={filteredData}
        searchKey={(r: RoadSegment) => `${r.name} ${r.id} ${r.ward} ${r.roadType}`}
        searchPlaceholder="Search road by name, ID, ward, or classification..."
        exportFileName="roadwatch-inventory"
        selectable={true}
        onRowClick={r => setSelectedRoad(r)}
      />

      {/* Road Detail Drawer */}
      <DetailDrawer
        isOpen={!!selectedRoad}
        onClose={() => setSelectedRoad(null)}
        title={selectedRoad ? `${selectedRoad.name} (${selectedRoad.id})` : ''}
        subtitle={selectedRoad?.ward}
        footer={
          <>
            <button
              onClick={() => {
                if (selectedRoad) {
                  navigate(`/map?select=${selectedRoad.id}`);
                }
              }}
              className="px-3.5 py-1.5 bg-[#8B5CF6] text-white font-semibold rounded-lg text-xs hover:bg-[#7C3AED] shadow-xs flex items-center gap-1.5 transition"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Locate on Map</span>
            </button>
            <button
              onClick={() => {
                if (selectedRoad) {
                  openEditModal(selectedRoad);
                  setSelectedRoad(null);
                }
              }}
              className="px-3.5 py-1.5 bg-[#2B2042] border border-[#3B2D53] text-[#F5F3FF] font-semibold rounded-lg text-xs hover:bg-[#3B2D53] transition"
            >
              Edit Segment
            </button>
          </>
        }
      >
        {selectedRoad && (
          <div className="space-y-4 text-xs text-[#F5F3FF]">
            <div className="flex items-center gap-2">
              <ConditionBadge condition={selectedRoad.currentCondition} />
              <PriorityBadge priority={selectedRoad.priority} />
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#140E22] border border-[#3B2D53]">
              <div>
                <span className="text-[#B9AECF] text-[10px] uppercase font-bold">Length</span>
                <p className="font-bold text-[#F5F3FF] text-sm">{selectedRoad.lengthKm} km</p>
              </div>
              <div>
                <span className="text-[#B9AECF] text-[10px] uppercase font-bold">Classification</span>
                <p className="font-bold text-[#F5F3FF] text-sm">{selectedRoad.roadType}</p>
              </div>
              <div>
                <span className="text-[#B9AECF] text-[10px] uppercase font-bold">Surface Type</span>
                <p className="font-bold text-[#F5F3FF] text-sm">{selectedRoad.surfaceType}</p>
              </div>
              <div>
                <span className="text-[#B9AECF] text-[10px] uppercase font-bold">Condition (PCI)</span>
                <p className="font-bold text-[#F5F3FF] text-sm">{selectedRoad.pciScore} / 100</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#140E22] border border-[#8B5CF6]/30 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#A78BFA]">Recommended Maintenance</span>
              <p className="font-bold text-[#F5F3FF] text-xs">{selectedRoad.recommendedAction}</p>
              <p className="text-[#B9AECF] text-[11px] leading-relaxed">{selectedRoad.recommendationReason}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold uppercase text-[10px] tracking-wider text-[#B9AECF]">
                Telemetry &amp; Usage
              </h4>
              <div className="divide-y divide-[#3B2D53] border border-[#3B2D53] rounded-xl overflow-hidden bg-[#140E22]">
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-[#B9AECF]">Traffic Load:</span>
                  <strong className="text-[#F5F3FF]">{selectedRoad.trafficIntensity}</strong>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-[#B9AECF]">Weather Exposure:</span>
                  <strong className="text-[#F5F3FF]">{selectedRoad.weatherExposure}</strong>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-[#B9AECF]">Last Inspection:</span>
                  <strong className="text-[#F5F3FF]">{selectedRoad.lastInspectionDate}</strong>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-[#B9AECF]">Last Overlay / Seal:</span>
                  <strong className="text-[#F5F3FF]">{selectedRoad.lastMaintenanceDate}</strong>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-[#B9AECF]">Open Reports:</span>
                  <strong className="text-[#FBBF24] font-semibold">{selectedRoad.openReportsCount} issues</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* Add / Edit Road Segment Modal */}
      {(showAddModal || editingRoad) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#211735] rounded-xl shadow-2xl border border-[#3B2D53] max-w-xl w-full p-6 text-xs space-y-4 text-[#F5F3FF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#3B2D53]">
              <h3 className="text-sm font-bold text-[#F5F3FF]">
                {editingRoad ? `Edit Road: ${editingRoad.id}` : 'Register New Road Segment'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingRoad(null);
                }}
                className="text-[#B9AECF] hover:text-[#F5F3FF]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingRoad ? handleEditSubmit : handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-[#F5F3FF] mb-1">Road Corridor Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Outer Ring Road Phase 2"
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] placeholder-[#B9AECF]/50 focus:border-[#A78BFA] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Municipal Ward</label>
                  <select
                    value={formWard}
                    onChange={e => setFormWard(e.target.value)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  >
                    <option value="Ward 1 - Downtown Core">Ward 1 - Downtown Core</option>
                    <option value="Ward 2 - Uptown">Ward 2 - Uptown</option>
                    <option value="Ward 3 - Central Zone">Ward 3 - Central Zone</option>
                    <option value="Ward 4 - North Zone">Ward 4 - North Zone</option>
                    <option value="Ward 6 - Silicon Corridor">Ward 6 - Silicon Corridor</option>
                    <option value="Ward 8 - East District">Ward 8 - East District</option>
                    <option value="Ward 11 - South Hub">Ward 11 - South Hub</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Length (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formLength}
                    onChange={e => setFormLength(e.target.value)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Road Type</label>
                  <select
                    value={formRoadType}
                    onChange={e => setFormRoadType(e.target.value as any)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  >
                    <option value="Arterial">Arterial Highway</option>
                    <option value="Sub-Arterial">Sub-Arterial Avenue</option>
                    <option value="Collector">Collector Road</option>
                    <option value="Local Access">Local Access Street</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Surface Type</label>
                  <select
                    value={formSurface}
                    onChange={e => setFormSurface(e.target.value as any)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  >
                    <option value="Asphalt">Asphalt Concrete</option>
                    <option value="Concrete">Rigid Concrete</option>
                    <option value="Bituminous Macadam">Bituminous Macadam</option>
                    <option value="Paver Blocks">Paver Blocks</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Condition</label>
                  <select
                    value={formCondition}
                    onChange={e => setFormCondition(e.target.value as RoadCondition)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  >
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Traffic Volume</label>
                  <select
                    value={formTraffic}
                    onChange={e => setFormTraffic(e.target.value as any)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  >
                    <option value="Very Low">Very Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Heavy">Heavy</option>
                    <option value="Extreme High-Volume">Extreme High-Volume</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Weather Risk</label>
                  <select
                    value={formWeather}
                    onChange={e => setFormWeather(e.target.value as any)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High Monsoon Flood Zone">High Flood Zone</option>
                    <option value="High Thermal Stress">Thermal Stress</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#F5F3FF] mb-1">Recommended Action</label>
                <input
                  type="text"
                  value={formRecommendation}
                  onChange={e => setFormRecommendation(e.target.value)}
                  placeholder="e.g. Surface overlay and ditch maintenance"
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] placeholder-[#B9AECF]/50 focus:border-[#A78BFA] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#3B2D53]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingRoad(null);
                  }}
                  className="px-3.5 py-1.5 border border-[#3B2D53] rounded-lg font-medium text-[#B9AECF] hover:bg-[#2B2042] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-lg shadow-xs transition"
                >
                  {editingRoad ? 'Save Changes' : 'Register Road'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
