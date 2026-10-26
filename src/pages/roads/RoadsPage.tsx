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
  Route,
  PlusCircle,
  MapPin,
  CalendarCheck,
  Edit,
  Eye,
  Filter,
  Car,
  CloudRain,
  History,
  AlertTriangle
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
      header: 'Segment ID',
      sortable: true,
      width: '110px',
      render: r => (
        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {r.id}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Road Name',
      sortable: true,
      render: r => (
        <div>
          <span className="font-bold text-[#172033] hover:text-blue-600 block">{r.name}</span>
          <span className="text-[11px] text-[#94A3B8]">{r.roadType} &bull; {r.surfaceType}</span>
        </div>
      ),
    },
    {
      key: 'ward',
      header: 'Area / Ward',
      sortable: true,
      render: r => <span className="text-xs text-[#64748B]">{r.ward}</span>,
    },
    {
      key: 'lengthKm',
      header: 'Length',
      sortable: true,
      align: 'right',
      render: r => <span className="font-medium text-[#172033]">{r.lengthKm} km</span>,
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
        <span className={`font-bold ${r.riskScore >= 75 ? 'text-red-600' : r.riskScore >= 50 ? 'text-orange-600' : 'text-blue-700'}`}>
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
      render: r => <span className="text-[11px] text-[#64748B]">{r.lastInspectionDate}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: r => (
        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setSelectedRoad(r)}
            className="p-1 text-[#64748B] hover:text-blue-600 rounded hover:bg-slate-100 transition"
            title="Inspect full details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => openEditModal(r)}
            className="p-1 text-[#64748B] hover:text-blue-600 rounded hover:bg-slate-100 transition"
            title="Edit road attributes"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigate(`/map?select=${r.id}`)}
            className="p-1 text-[#64748B] hover:text-blue-600 rounded hover:bg-slate-100 transition"
            title="Locate on Map"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Road Segments Inventory"
        subtitle="Searchable master catalog of municipal roadway network segments, Pavement Condition Indexes (PCI), and calculated urgency criteria."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#172033] border border-slate-200">
            {filteredData.length} corridors
          </span>
        }
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Road Segment</span>
          </button>
        }
      />

      {/* Multi-filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1 text-[#64748B] font-semibold">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>Filters:</span>
        </div>

        {/* Ward Filter */}
        <div className="flex items-center gap-1">
          <span className="text-[#64748B]">Ward:</span>
          <select
            value={wardFilter}
            onChange={e => setWardFilter(e.target.value)}
            className="p-1.5 border border-[#E2E8F0] rounded-lg bg-slate-50 font-medium text-[#172033] focus:outline-none"
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
        <div className="flex items-center gap-1">
          <span className="text-[#64748B]">Condition:</span>
          <select
            value={conditionFilter}
            onChange={e => setConditionFilter(e.target.value)}
            className="p-1.5 border border-[#E2E8F0] rounded-lg bg-slate-50 font-medium text-[#172033] focus:outline-none"
          >
            <option value="ALL">All Conditions</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1">
          <span className="text-[#64748B]">Priority:</span>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="p-1.5 border border-[#E2E8F0] rounded-lg bg-slate-50 font-medium text-[#172033] focus:outline-none"
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
            className="text-xs text-blue-600 hover:underline font-medium ml-auto"
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
        searchPlaceholder="Search by road name, segment ID, ward, or classification..."
        exportFileName="roadwatch-road-inventory"
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
              className="px-3.5 py-1.5 bg-blue-600 text-white font-semibold rounded-lg text-xs hover:bg-blue-700 shadow-xs flex items-center gap-1.5"
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
              className="px-3.5 py-1.5 bg-white border border-[#E2E8F0] text-[#172033] font-semibold rounded-lg text-xs hover:bg-slate-50"
            >
              Edit Segment
            </button>
          </>
        }
      >
        {selectedRoad && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center gap-2">
              <ConditionBadge condition={selectedRoad.currentCondition} />
              <PriorityBadge priority={selectedRoad.priority} />
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0]">
              <div>
                <span className="text-[#64748B] text-[10px] uppercase font-bold">Length</span>
                <p className="font-bold text-[#172033] text-sm">{selectedRoad.lengthKm} km</p>
              </div>
              <div>
                <span className="text-[#64748B] text-[10px] uppercase font-bold">Road Classification</span>
                <p className="font-bold text-[#172033] text-sm">{selectedRoad.roadType}</p>
              </div>
              <div>
                <span className="text-[#64748B] text-[10px] uppercase font-bold">Surface Type</span>
                <p className="font-bold text-[#172033] text-sm">{selectedRoad.surfaceType}</p>
              </div>
              <div>
                <span className="text-[#64748B] text-[10px] uppercase font-bold">Pavement Condition (PCI)</span>
                <p className="font-bold text-[#172033] text-sm">{selectedRoad.pciScore} / 100</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-blue-900">Recommended Maintenance Intervention</span>
              <p className="font-bold text-blue-950 text-xs">{selectedRoad.recommendedAction}</p>
              <p className="text-blue-800 text-[11px] leading-relaxed">{selectedRoad.recommendationReason}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-[#172033] uppercase text-[10px] tracking-wider text-[#64748B]">
                Environmental &amp; Usage Telemetry
              </h4>
              <div className="divide-y divide-slate-100 border border-[#E2E8F0] rounded-xl overflow-hidden">
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-[#64748B]">Traffic Intensity:</span>
                  <strong className="text-[#172033]">{selectedRoad.trafficIntensity}</strong>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-[#64748B]">Monsoon Runoff Exposure:</span>
                  <strong className="text-[#172033]">{selectedRoad.weatherExposure}</strong>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-[#64748B]">Last Comprehensive Inspection:</span>
                  <strong className="text-[#172033]">{selectedRoad.lastInspectionDate}</strong>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-[#64748B]">Last Full Overlay / Seal:</span>
                  <strong className="text-[#172033]">{selectedRoad.lastMaintenanceDate}</strong>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-[#64748B]">Pending Citizen Reports:</span>
                  <strong className="text-amber-700">{selectedRoad.openReportsCount} issues</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* Add / Edit Road Segment Modal */}
      {(showAddModal || editingRoad) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E2E8F0] max-w-xl w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#172033]">
                {editingRoad ? `Edit Road Segment: ${editingRoad.id}` : 'Register New Road Segment'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingRoad(null);
                }}
                className="text-[#94A3B8] hover:text-[#172033]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingRoad ? handleEditSubmit : handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-[#172033] mb-1">Road Name / Corridor Title</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Outer Ring Road Phase 2"
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Municipal Ward</label>
                  <select
                    value={formWard}
                    onChange={e => setFormWard(e.target.value)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white"
                  >
                    <option value="Ward 1 - Downtown Core">Ward 1 - Downtown Core</option>
                    <option value="Ward 3 - Central Zone">Ward 3 - Central Zone</option>
                    <option value="Ward 4 - North Zone">Ward 4 - North Zone</option>
                    <option value="Ward 7 - West Zone">Ward 7 - West Zone</option>
                    <option value="Ward 8 - East District">Ward 8 - East District</option>
                    <option value="Ward 9 - Tech Corridor">Ward 9 - Tech Corridor</option>
                    <option value="Ward 10 - South East">Ward 10 - South East</option>
                    <option value="Ward 11 - South Hub">Ward 11 - South Hub</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Length (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formLength}
                    onChange={e => setFormLength(e.target.value)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Road Type</label>
                  <select
                    value={formRoadType}
                    onChange={e => setFormRoadType(e.target.value as any)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white"
                  >
                    <option value="Arterial">Arterial Highway</option>
                    <option value="Sub-Arterial">Sub-Arterial Avenue</option>
                    <option value="Collector">Collector Road</option>
                    <option value="Local Access">Local Access Street</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Surface Type</label>
                  <select
                    value={formSurface}
                    onChange={e => setFormSurface(e.target.value as any)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white"
                  >
                    <option value="Asphalt">Asphalt Concrete</option>
                    <option value="Concrete">Rigid Concrete</option>
                    <option value="Bituminous Macadam">Bituminous Macadam</option>
                    <option value="Paver Blocks">Interlocking Pavers</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Current Condition</label>
                  <select
                    value={formCondition}
                    onChange={e => setFormCondition(e.target.value as RoadCondition)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white"
                  >
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Traffic Volume</label>
                  <select
                    value={formTraffic}
                    onChange={e => setFormTraffic(e.target.value as any)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white"
                  >
                    <option value="Very Low">Very Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Heavy">Heavy</option>
                    <option value="Extreme High-Volume">Extreme High-Volume</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Weather Exposure</label>
                  <select
                    value={formWeather}
                    onChange={e => setFormWeather(e.target.value as any)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High Monsoon Flood Zone">High Flood Zone</option>
                    <option value="High Thermal Stress">Thermal Stress</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1">Recommended Action</label>
                <input
                  type="text"
                  value={formRecommendation}
                  onChange={e => setFormRecommendation(e.target.value)}
                  placeholder="e.g. Mill and replace 40mm wearing course with PMB-40"
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingRoad(null);
                  }}
                  className="px-3.5 py-1.5 border border-[#E2E8F0] rounded-lg font-medium text-[#64748B] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {editingRoad ? 'Save Changes' : 'Register Road Segment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
