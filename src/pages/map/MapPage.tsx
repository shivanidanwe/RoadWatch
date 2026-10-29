import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/common/PageHeader';
import { LiveRoadMap } from '../../components/maps/LiveRoadMap';
import { RoadSegment, InspectionType, IssueCategory, ReportSeverity } from '../../types';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { ConditionBadge } from '../../components/common/ConditionBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import {
  CalendarCheck,
  FileText,
  MapPin,
  Sparkles
} from 'lucide-react';

export const MapPage: React.FC = () => {
  const [searchParams] = useSearchParams();
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
    addToast('success', 'Inspection Scheduled', `Field team dispatched for ${selectedRoad.name}.`);
  };

  const handleReportIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoad) return;

    await createReport({
      roadName: selectedRoad.name,
      coordinates: selectedRoad.coordinates,
      category: repCategory,
      severity: repSeverity,
      description: repDescription || `${repCategory} observed on ${selectedRoad.name}`,
      source: 'Patrol Inspection',
      segmentId: selectedRoad.id,
    });

    setShowReportModal(false);
    setRepDescription('');
    addToast('success', 'Issue Logged', `Report logged for ${selectedRoad.name}.`);
  };

  return (
    <div className="space-y-5 min-w-0">
      <PageHeader
        title="Live Geospatial Road Map"
        subtitle="Interactive spatial workspace tracking road condition grades, distress tickets, and inspection deployments."
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
            {roads.length} Corridors Active
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#F5F3FF] bg-[#2B2042] border border-[#3B2D53] rounded-lg hover:bg-[#3B2D53] transition shadow-xs disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Segment Details</span>
            </button>
            <button
              onClick={() => {
                if (selectedRoad) setShowInspectionModal(true);
                else addToast('info', 'Select Road', 'Select a road on the map first.');
              }}
              disabled={!selectedRoad}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-lg transition shadow-xs disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#211735] rounded-xl shadow-2xl border border-[#3B2D53] max-w-lg w-full p-6 text-xs space-y-4 text-[#F5F3FF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#3B2D53]">
              <div>
                <h3 className="text-sm font-bold text-[#F5F3FF]">Dispatch Field Inspection</h3>
                <p className="text-[11px] text-[#B9AECF]">
                  Assign engineer to verify condition of <strong>{selectedRoad.name} ({selectedRoad.id})</strong>
                </p>
              </div>
              <button onClick={() => setShowInspectionModal(false)} className="text-[#B9AECF] hover:text-[#F5F3FF]">
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleInspectionSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-[#F5F3FF] mb-1">Inspection Type</label>
                <select
                  value={inspType}
                  onChange={e => setInspType(e.target.value as InspectionType)}
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                >
                  <option value="Citizen Report Verification">Citizen Report Verification</option>
                  <option value="Routine">Routine Visual Inspection</option>
                  <option value="Post-Severe-Weather">Post-Severe-Weather Survey</option>
                  <option value="Structural Assessment">Structural Core Assessment</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Assigned Inspector</label>
                  <select
                    value={inspInspector}
                    onChange={e => setInspInspector(e.target.value)}
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
                    value={inspDate}
                    onChange={e => setInspDate(e.target.value)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#F5F3FF] mb-1">Instructions &amp; Brief</label>
                <textarea
                  rows={3}
                  value={inspNotes}
                  onChange={e => setInspNotes(e.target.value)}
                  placeholder="Detail inspection focus (e.g. check sub-base saturation, verify pothole dimensions)..."
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] placeholder-[#B9AECF]/50 focus:border-[#A78BFA] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#3B2D53]">
                <button
                  type="button"
                  onClick={() => setShowInspectionModal(false)}
                  className="px-3.5 py-1.5 border border-[#3B2D53] rounded-lg font-medium text-[#B9AECF] hover:bg-[#2B2042] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-lg shadow-xs transition"
                >
                  Confirm &amp; Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {showReportModal && selectedRoad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#211735] rounded-xl shadow-2xl border border-[#3B2D53] max-w-lg w-full p-6 text-xs space-y-4 text-[#F5F3FF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#3B2D53]">
              <div>
                <h3 className="text-sm font-bold text-[#F5F3FF]">Log Road Issue</h3>
                <p className="text-[11px] text-[#B9AECF]">
                  Register field observation for <strong>{selectedRoad.name} ({selectedRoad.id})</strong>
                </p>
              </div>
              <button onClick={() => setShowReportModal(false)} className="text-[#B9AECF] hover:text-[#F5F3FF]">
                ✕
              </button>
            </div>

            <form onSubmit={handleReportIssueSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Category</label>
                  <select
                    value={repCategory}
                    onChange={e => setRepCategory(e.target.value as IssueCategory)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  >
                    <option value="Pothole">Pothole</option>
                    <option value="Road crack">Road crack</option>
                    <option value="Surface damage">Surface damage</option>
                    <option value="Waterlogging">Waterlogging</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Severity</label>
                  <select
                    value={repSeverity}
                    onChange={e => setRepSeverity(e.target.value as ReportSeverity)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:border-[#A78BFA] focus:outline-none"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#F5F3FF] mb-1">Distress Description</label>
                <textarea
                  rows={3}
                  required
                  value={repDescription}
                  onChange={e => setRepDescription(e.target.value)}
                  placeholder="Detail distress location and traffic impact..."
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] placeholder-[#B9AECF]/50 focus:border-[#A78BFA] focus:outline-none resize-none"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#140E22] border border-[#3B2D53] text-[#B9AECF] flex items-center justify-between text-[11px]">
                <span>GPS Centroid Tag:</span>
                <span className="font-mono font-semibold text-[#A78BFA]">
                  {selectedRoad.coordinates[0].toFixed(4)}, {selectedRoad.coordinates[1].toFixed(4)}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#3B2D53]">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-3.5 py-1.5 border border-[#3B2D53] rounded-lg font-medium text-[#B9AECF] hover:bg-[#2B2042] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-lg shadow-xs transition"
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
              className="px-3.5 py-1.5 bg-[#8B5CF6] text-white font-semibold rounded-lg text-xs hover:bg-[#7C3AED] transition"
            >
              Schedule Inspection
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
                <span className="text-[#B9AECF] text-[10px] uppercase font-bold">Surface Type</span>
                <p className="font-bold text-[#F5F3FF] text-sm">{selectedRoad.surfaceType}</p>
              </div>
              <div>
                <span className="text-[#B9AECF] text-[10px] uppercase font-bold">Pavement Condition (PCI)</span>
                <p className="font-bold text-[#F5F3FF] text-sm">{selectedRoad.pciScore} / 100</p>
              </div>
              <div>
                <span className="text-[#B9AECF] text-[10px] uppercase font-bold">Predicted Deterioration Risk</span>
                <p className={`font-bold text-sm ${selectedRoad.riskScore >= 75 ? 'text-[#FB7185]' : 'text-[#A78BFA]'}`}>
                  {selectedRoad.riskScore} / 100
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#140E22] border border-[#8B5CF6]/30 space-y-1">
              <span className="text-[10px] text-[#A78BFA] font-bold uppercase tracking-wider block">
                Prescriptive Maintenance Recommendation
              </span>
              <p className="font-bold text-[#F5F3FF]">{selectedRoad.recommendedAction}</p>
              <p className="text-[11px] text-[#B9AECF] leading-relaxed">{selectedRoad.recommendationReason}</p>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};
