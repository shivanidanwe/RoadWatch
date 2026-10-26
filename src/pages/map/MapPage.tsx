import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/common/PageHeader';
import { LiveRoadMap } from '../../components/maps/LiveRoadMap';
import { RoadSegment, InspectionType, IssueCategory, ReportSeverity } from '../../types';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { ConditionBadge } from '../../components/common/ConditionBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import {
  CalendarCheck,
  AlertTriangle,
  FileText,
  Route,
  Layers,
  MapPin,
  Car,
  CloudRain,
  History,
  Shield,
  Download
} from 'lucide-react';

export const MapPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { roads, reports, inspections, createInspection, createReport, addToast } = useApp();

  const [selectedRoad, setSelectedRoad] = useState<RoadSegment | null>(null);

  // Modal states
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);

  // Inspection form
  const [inspType, setInspType] = useState<InspectionType>('Citizen Report Verification');
  const [inspInspector, setInspInspector] = useState('Er. Rajesh Verma');
  const [inspDate, setInspDate] = useState('2024-11-02');
  const [inspNotes, setInspNotes] = useState('');

  // Report form
  const [repCategory, setRepCategory] = useState<IssueCategory>('Pothole');
  const [repSeverity, setRepSeverity] = useState<ReportSeverity>('High');
  const [repDescription, setRepDescription] = useState('');

  // Check query parameter ?select=RD-101
  useEffect(() => {
    const selectId = searchParams.get('select');
    if (selectId && roads.length > 0) {
      const match = roads.find(r => r.id === selectId);
      if (match) setSelectedRoad(match);
    } else if (roads.length > 0 && !selectedRoad) {
      // default to first critical road
      setSelectedRoad(roads.find(r => r.priority === 'Critical') || roads[0]);
    }
  }, [searchParams, roads]);

  const handleScheduleInspectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoad) return;

    await createInspection({
      segmentId: selectedRoad.id,
      roadName: selectedRoad.name,
      ward: selectedRoad.ward,
      assignedInspector: inspInspector,
      inspectorRole: 'Field Inspection Engineer',
      scheduledDate: inspDate,
      type: inspType,
      priority: selectedRoad.priority,
      status: 'Scheduled',
      notes: inspNotes || `Inspection scheduled for ${selectedRoad.name} (${selectedRoad.id})`,
    });

    setShowInspectionModal(false);
    setInspNotes('');
  };

  const handleReportIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoad) return;

    await createReport({
      segmentId: selectedRoad.id,
      roadName: selectedRoad.name,
      category: repCategory,
      severity: repSeverity,
      source: 'Field Officer',
      reportDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Submitted',
      description: repDescription || `${repCategory} distress observed during field inspection on ${selectedRoad.name}`,
      coordinates: selectedRoad.coordinates,
    });

    setShowReportModal(false);
    setRepDescription('');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Live Geospatial Road Map"
        subtitle="Interactive spatial intelligence workspace tracking road condition grades, distress reports, and inspection deployments."
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            12 Segments Centered
          </span>
        }
        actions={
          <>
            <button
              onClick={() => {
                if (selectedRoad) setShowDetailDrawer(true);
                else addToast('info', 'Select Road', 'Click any road marker on the map to inspect full record.');
              }}
              disabled={!selectedRoad}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#172033] bg-white border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Full Segment Details</span>
            </button>
            <button
              onClick={() => {
                if (selectedRoad) setShowInspectionModal(true);
                else addToast('info', 'Select Road', 'Select a road on the map first.');
              }}
              disabled={!selectedRoad}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs disabled:opacity-50"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Schedule Inspection</span>
            </button>
          </>
        }
      />

      {/* Main Map Component */}
      <LiveRoadMap
        roads={roads}
        reports={reports}
        inspections={inspections}
        selectedRoad={selectedRoad}
        onSelectRoad={r => setSelectedRoad(r)}
        onScheduleInspection={r => {
          setSelectedRoad(r);
          setShowInspectionModal(true);
        }}
        onReportIssue={r => {
          setSelectedRoad(r);
          setShowReportModal(true);
        }}
      />

      {/* Schedule Inspection Modal */}
      {showInspectionModal && selectedRoad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E2E8F0] max-w-lg w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <h3 className="text-sm font-bold text-[#172033]">Dispatch Field Inspection</h3>
                <p className="text-[11px] text-[#64748B]">
                  Assign engineer to verify condition of <strong>{selectedRoad.name} ({selectedRoad.id})</strong>
                </p>
              </div>
              <button onClick={() => setShowInspectionModal(false)} className="text-[#94A3B8] hover:text-[#172033]">
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleInspectionSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-[#172033] mb-1">Inspection Type</label>
                <select
                  value={inspType}
                  onChange={e => setInspType(e.target.value as InspectionType)}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white"
                >
                  <option value="Citizen Report Verification">Citizen Report Verification</option>
                  <option value="Routine">Routine Visual Inspection</option>
                  <option value="Post-Severe-Weather">Post-Severe-Weather Survey</option>
                  <option value="Structural Assessment">Structural Core Assessment</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Assigned Inspector</label>
                  <select
                    value={inspInspector}
                    onChange={e => setInspInspector(e.target.value)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white"
                  >
                    <option value="Er. Rajesh Verma">Er. Rajesh Verma (Senior Pavement)</option>
                    <option value="Er. Meena Nair">Er. Meena Nair (Hydrology)</option>
                    <option value="Er. David Wilson">Er. David Wilson (Highways &amp; Safety)</option>
                    <option value="Er. Sunita Patel">Er. Sunita Patel (Surveyor)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Target Date</label>
                  <input
                    type="date"
                    required
                    value={inspDate}
                    onChange={e => setInspDate(e.target.value)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1">Inspection Instructions &amp; Brief</label>
                <textarea
                  rows={3}
                  value={inspNotes}
                  onChange={e => setInspNotes(e.target.value)}
                  placeholder="Specify focus areas e.g. Measure rut depths near intersection 4B, inspect culvert silt accumulation..."
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowInspectionModal(false)}
                  className="px-3.5 py-1.5 border border-[#E2E8F0] rounded-lg font-medium text-[#64748B] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Confirm &amp; Dispatch Inspection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {showReportModal && selectedRoad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E2E8F0] max-w-lg w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <h3 className="text-sm font-bold text-[#172033]">Log Distress Issue</h3>
                <p className="text-[11px] text-[#64748B]">
                  Register field observation for <strong>{selectedRoad.name} ({selectedRoad.id})</strong>
                </p>
              </div>
              <button onClick={() => setShowReportModal(false)} className="text-[#94A3B8] hover:text-[#172033]">
                ✕
              </button>
            </div>

            <form onSubmit={handleReportIssueSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Category</label>
                  <select
                    value={repCategory}
                    onChange={e => setRepCategory(e.target.value as IssueCategory)}
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
                  <label className="block font-semibold text-[#172033] mb-1">Severity</label>
                  <select
                    value={repSeverity}
                    onChange={e => setRepSeverity(e.target.value as ReportSeverity)}
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
                <label className="block font-semibold text-[#172033] mb-1">Distress Description &amp; Dimensions</label>
                <textarea
                  rows={3}
                  required
                  value={repDescription}
                  onChange={e => setRepDescription(e.target.value)}
                  placeholder="Detail distress location, dimensions (e.g. depth 10cm, width 1m), and traffic impact..."
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[#64748B] flex items-center justify-between text-[11px]">
                <span>GPS Centroid Tag:</span>
                <span className="font-mono text-[#172033]">
                  {selectedRoad.coordinates[0].toFixed(4)}, {selectedRoad.coordinates[1].toFixed(4)}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-3.5 py-1.5 border border-[#E2E8F0] rounded-lg font-medium text-[#64748B] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Submit Issue Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Detail Drawer */}
      <DetailDrawer
        isOpen={showDetailDrawer}
        onClose={() => setShowDetailDrawer(false)}
        title={selectedRoad ? `${selectedRoad.name} (${selectedRoad.id})` : 'Segment Details'}
        subtitle={selectedRoad?.ward}
        footer={
          <>
            <button
              onClick={() => {
                setShowDetailDrawer(false);
                setShowInspectionModal(true);
              }}
              className="px-3.5 py-1.5 bg-blue-600 text-white font-semibold rounded-lg text-xs hover:bg-blue-700"
            >
              Schedule Inspection
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
              </div>
            </div>

            {selectedRoad.notes && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                <span className="font-bold block text-[10px] uppercase">Engineering Field Notes:</span>
                <p className="mt-0.5 text-[11px]">{selectedRoad.notes}</p>
              </div>
            )}
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};
