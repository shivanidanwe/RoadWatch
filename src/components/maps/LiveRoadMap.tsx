import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { RoadSegment, IssueReport, Inspection, PriorityLevel, RoadCondition } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';
import { ConditionBadge } from '../common/ConditionBadge';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Navigation,
  Eye,
  EyeOff,
  AlertTriangle,
  Route,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Car,
  CloudRain,
  History,
  X
} from 'lucide-react';

interface LiveRoadMapProps {
  roads: RoadSegment[];
  reports: IssueReport[];
  inspections: Inspection[];
  selectedRoad: RoadSegment | null;
  onSelectRoad: (road: RoadSegment | null) => void;
  onScheduleInspection?: (road: RoadSegment) => void;
  onReportIssue?: (road: RoadSegment) => void;
}

const BASEMAP_STYLES = {
  standard: 'https://demotiles.maplibre.org/style.json',
  positron: {
    version: 8,
    sources: {
      'osm-tiles': {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors'
      }
    },
    layers: [
      {
        id: 'osm-tiles-layer',
        type: 'raster',
        source: 'osm-tiles',
        minzoom: 0,
        maxzoom: 19
      }
    ]
  }
};

export const LiveRoadMap: React.FC<LiveRoadMapProps> = ({
  roads,
  reports,
  inspections,
  selectedRoad,
  onSelectRoad,
  onScheduleInspection,
  onReportIssue,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLayersDropdown, setShowLayersDropdown] = useState(false);
  const [basemap, setBasemap] = useState<'standard' | 'osm'>('osm');

  // Layer toggles
  const [layers, setLayers] = useState({
    roads: true,
    reports: true,
    inspections: true,
  });

  // Filters
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterCondition, setFilterCondition] = useState<string>('ALL');

  // Filtered lists
  const filteredRoads = roads.filter(r => {
    if (filterPriority !== 'ALL' && r.priority !== filterPriority) return false;
    if (filterCondition !== 'ALL' && r.currentCondition !== filterCondition) return false;
    return true;
  });

  const filteredReports = reports.filter(r => layers.reports);
  const filteredInspections = inspections.filter(i => layers.inspections);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: BASEMAP_STYLES.positron as any,
        center: [77.6000, 12.9600], // Bangalore metropolitan default
        zoom: 12.2,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
      mapRef.current = map;

      return () => {
        map.remove();
        mapRef.current = null;
      };
    } catch (err) {
      console.warn('MapLibre GL failed to initialize in environment:', err);
    }
  }, []);

  // Update Markers & Layers when data or layer toggles change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add road centroid markers with condition coloring
    if (layers.roads) {
      filteredRoads.forEach(road => {
        const el = document.createElement('div');
        const isSelected = selectedRoad?.id === road.id;
        const color = {
          Critical: '#DC2626',
          Poor: '#EA580C',
          Fair: '#2563EB',
          Good: '#15803D',
        }[road.currentCondition];

        el.className = 'cursor-pointer transition-transform duration-150 hover:scale-125';
        el.innerHTML = `
          <div style="
            background-color: ${color};
            width: ${isSelected ? '22px' : '16px'};
            height: ${isSelected ? '22px' : '16px'};
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 5px; height: 5px; border-radius: 50%; background: white;"></div>
          </div>
        `;

        el.addEventListener('click', () => {
          onSelectRoad(road);
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([road.coordinates[1], road.coordinates[0]])
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // Add Report markers
    if (layers.reports) {
      filteredReports.forEach(rep => {
        const el = document.createElement('div');
        el.className = 'cursor-pointer hover:scale-125 transition-transform';
        el.innerHTML = `
          <div style="
            background: #B91C1C;
            color: white;
            padding: 3px 5px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 700;
            border: 1px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 2px;
          ">
            <span>⚠️</span>
          </div>
        `;
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([rep.coordinates[1], rep.coordinates[0]])
          .setPopup(
            new maplibregl.Popup({ offset: 10 }).setHTML(`
              <div style="padding: 6px; font-family: sans-serif; font-size: 12px;">
                <strong style="color: #172033;">${rep.category}</strong>
                <div style="color: #64748B; font-size: 11px;">${rep.roadName}</div>
                <div style="margin-top: 4px; font-size: 11px;">Status: <strong>${rep.status}</strong></div>
              </div>
            `)
          )
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // Add Inspection markers
    if (layers.inspections) {
      filteredInspections.forEach(insp => {
        const road = roads.find(r => r.id === insp.segmentId);
        if (!road) return;
        const el = document.createElement('div');
        el.className = 'cursor-pointer hover:scale-125 transition-transform';
        el.innerHTML = `
          <div style="
            background: #2563EB;
            color: white;
            padding: 2px 4px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: bold;
            border: 1px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          ">
            🔍 ${insp.id.replace('INSP-2024-', '#')}
          </div>
        `;
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([road.coordinates[1] + 0.002, road.coordinates[0] - 0.002])
          .setPopup(
            new maplibregl.Popup({ offset: 10 }).setHTML(`
              <div style="padding: 6px; font-family: sans-serif; font-size: 12px;">
                <strong style="color: #172033;">${insp.type}</strong>
                <div style="color: #64748B; font-size: 11px;">${insp.roadName}</div>
                <div style="margin-top: 4px; font-size: 11px;">Inspector: ${insp.assignedInspector}</div>
              </div>
            `)
          )
          .addTo(map);

        markersRef.current.push(marker);
      });
    }
  }, [filteredRoads, filteredReports, filteredInspections, layers, selectedRoad]);

  // Center on selected road
  useEffect(() => {
    if (!selectedRoad || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [selectedRoad.coordinates[1], selectedRoad.coordinates[0]],
      zoom: 14.5,
      essential: true,
      duration: 1200,
    });
  }, [selectedRoad]);

  const fitToDataExtent = () => {
    if (!mapRef.current || roads.length === 0) return;
    const bounds = new maplibregl.LngLatBounds();
    roads.forEach(r => bounds.extend([r.coordinates[1], r.coordinates[0]]));
    mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 14 });
  };

  return (
    <div
      className={`relative bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[680px]'
      }`}
    >
      {/* Map Section (65 - 75% width) */}
      <div className="relative flex-1 h-full min-h-[350px]">
        {/* Top Control Overlay */}
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Quick Filters */}
          <div className="flex items-center gap-1.5 pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#E2E8F0] shadow-sm text-xs">
            <span className="font-semibold text-[#172033] hidden sm:inline">Priority:</span>
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="bg-transparent font-medium text-[#172033] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <span className="text-slate-300">|</span>

            <span className="font-semibold text-[#172033] hidden sm:inline">Condition:</span>
            <select
              value={filterCondition}
              onChange={e => setFilterCondition(e.target.value)}
              className="bg-transparent font-medium text-[#172033] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Conditions</option>
              <option value="Critical">Critical</option>
              <option value="Poor">Poor</option>
              <option value="Fair">Fair</option>
              <option value="Good">Good</option>
            </select>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Layer visibility toggle */}
            <div className="relative">
              <button
                onClick={() => setShowLayersDropdown(!showLayersDropdown)}
                className="p-2 bg-white/95 backdrop-blur-md rounded-lg border border-[#E2E8F0] text-[#172033] hover:bg-slate-50 shadow-sm transition"
                title="Toggle Layers"
              >
                <Layers className="w-4 h-4" />
              </button>

              {showLayersDropdown && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-xl p-3 space-y-2 text-xs z-20">
                  <span className="font-bold text-[#172033] block mb-1">Layer Visibility</span>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span>Road Segments</span>
                    <input
                      type="checkbox"
                      checked={layers.roads}
                      onChange={e => setLayers({ ...layers, roads: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span>Issue Reports</span>
                    <input
                      type="checkbox"
                      checked={layers.reports}
                      onChange={e => setLayers({ ...layers, reports: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span>Field Inspections</span>
                    <input
                      type="checkbox"
                      checked={layers.inspections}
                      onChange={e => setLayers({ ...layers, inspections: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Fit extent */}
            <button
              onClick={fitToDataExtent}
              className="p-2 bg-white/95 backdrop-blur-md rounded-lg border border-[#E2E8F0] text-[#172033] hover:bg-slate-50 shadow-sm transition"
              title="Fit to network extent"
            >
              <Navigation className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-white/95 backdrop-blur-md rounded-lg border border-[#E2E8F0] text-[#172033] hover:bg-slate-50 shadow-sm transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* The MapLibre Canvas Container */}
        <div ref={mapContainerRef} className="w-full h-full bg-[#E5E9F0]" />

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg border border-[#E2E8F0] shadow-sm text-[11px] space-y-1">
          <div className="font-bold text-[#172033] mb-1">Road Condition Legend</div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 ring-1 ring-red-400" />
            <span>Critical (PCI &lt; 40)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>Poor (PCI 40–54)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Fair (PCI 55–69)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Good (PCI 70–100)</span>
          </div>
          <div className="pt-1 border-t border-slate-100 flex items-center gap-2 text-[#64748B]">
            <span>⚠️ Issue Report</span>
            <span>🔍 Inspection</span>
          </div>
        </div>
      </div>

      {/* Selected Road Detail Panel (25 - 35% width) */}
      <div className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-[#E2E8F0] bg-white flex flex-col h-full overflow-y-auto">
        {selectedRoad ? (
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                      {selectedRoad.id}
                    </span>
                    <span className="text-xs text-[#64748B]">{selectedRoad.roadType}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#172033] mt-1 leading-snug">
                    {selectedRoad.name}
                  </h3>
                  <p className="text-xs text-[#64748B]">{selectedRoad.ward}</p>
                </div>
                <button
                  onClick={() => onSelectRoad(null)}
                  className="p-1 text-[#94A3B8] hover:text-[#172033] rounded hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <ConditionBadge condition={selectedRoad.currentCondition} />
                <PriorityBadge priority={selectedRoad.priority} />
              </div>

              {/* Scores Grid */}
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#64748B]">PCI Score</span>
                  <div className="text-base font-bold text-[#172033]">{selectedRoad.pciScore} / 100</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#64748B]">Predicted Risk</span>
                  <div className={`text-base font-bold ${selectedRoad.riskScore >= 75 ? 'text-red-600' : 'text-blue-700'}`}>
                    {selectedRoad.riskScore} / 100
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#64748B]">Length</span>
                  <div className="text-xs font-semibold text-[#172033]">{selectedRoad.lengthKm} km</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#64748B]">Surface Type</span>
                  <div className="text-xs font-semibold text-[#172033]">{selectedRoad.surfaceType}</div>
                </div>
              </div>

              {/* Stress Factors */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#64748B]">
                  <span className="flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5" /> Traffic Intensity:
                  </span>
                  <strong className="text-[#172033]">{selectedRoad.trafficIntensity}</strong>
                </div>
                <div className="flex items-center justify-between text-[#64748B]">
                  <span className="flex items-center gap-1.5">
                    <CloudRain className="w-3.5 h-3.5" /> Weather Exposure:
                  </span>
                  <strong className="text-[#172033]">{selectedRoad.weatherExposure}</strong>
                </div>
                <div className="flex items-center justify-between text-[#64748B]">
                  <span className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" /> Last Inspection:
                  </span>
                  <strong className="text-[#172033]">{selectedRoad.lastInspectionDate}</strong>
                </div>
                <div className="flex items-center justify-between text-[#64748B]">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Open Reports:
                  </span>
                  <strong className="text-amber-700 font-semibold">{selectedRoad.openReportsCount} issues</strong>
                </div>
              </div>

              {/* Recommendation Box */}
              <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200/60 text-xs space-y-1">
                <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                  Recommended Action
                </span>
                <p className="font-semibold text-blue-950">{selectedRoad.recommendedAction}</p>
                <p className="text-[11px] text-blue-800 leading-snug">{selectedRoad.recommendationReason}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
              <button
                onClick={() => onScheduleInspection?.(selectedRoad)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Schedule Inspection</span>
              </button>
              <button
                onClick={() => onReportIssue?.(selectedRoad)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-white border border-[#E2E8F0] text-[#172033] hover:bg-slate-50 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Report Road Issue</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-[#64748B] flex-1 flex flex-col items-center justify-center">
            <Route className="w-8 h-8 text-slate-300 mb-2" />
            <h4 className="font-semibold text-[#172033]">No Road Segment Selected</h4>
            <p className="text-[#94A3B8] mt-1 max-w-[200px]">
              Click any road centroid marker on the map to inspect engineering parameters, predicted risks, and action items.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
