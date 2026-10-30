import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { RoadSegment, IssueReport, Inspection, PriorityLevel, RoadCondition } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';
import { ConditionBadge } from '../common/ConditionBadge';
import {
  Layers,
  Maximize2,
  Minimize2,
  Navigation,
  AlertTriangle,
  Route,
  CalendarCheck,
  Car,
  CloudRain,
  History,
  X,
  Zap
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

const OSM_STYLE: any = {
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

  // Layer toggles
  const [layers, setLayers] = useState({
    roads: true,
    reports: true,
    inspections: true,
  });

  // Filters
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterCondition, setFilterCondition] = useState<string>('ALL');
  const [filterReportSeverity, setFilterReportSeverity] = useState<string>('ALL');
  const [filterReportStatus, setFilterReportStatus] = useState<string>('ALL');

  // Filtered lists
  const filteredRoads = roads.filter(r => {
    if (filterPriority !== 'ALL' && r.priority !== filterPriority) return false;
    if (filterCondition !== 'ALL' && r.currentCondition !== filterCondition) return false;
    return true;
  });

  const filteredReports = reports.filter(r => {
    if (filterReportSeverity !== 'ALL' && r.severity !== filterReportSeverity) return false;
    if (filterReportStatus !== 'ALL' && r.status !== filterReportStatus) return false;
    return true;
  });

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCenter: [number, number] = selectedRoad
      ? [selectedRoad.coordinates[1], selectedRoad.coordinates[0]]
      : [77.62, 12.96];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OSM_STYLE,
      center: initialCenter,
      zoom: 12,
    });

    mapRef.current = map;

    map.on('load', () => {
      renderRoadLines(map);
      renderMarkers(map);
    });

    return () => {
      map.remove();
    };
  }, []);

  // Update center when selectedRoad changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedRoad) return;

    map.flyTo({
      center: [selectedRoad.coordinates[1], selectedRoad.coordinates[0]],
      zoom: 13.5,
      essential: true,
      speed: 1.2,
    });
  }, [selectedRoad]);

  // Update lines and markers when dependencies change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    renderRoadLines(map);
    renderMarkers(map);
  }, [filteredRoads, filteredReports, layers]);

  const renderRoadLines = (map: maplibregl.Map) => {
    if (map.getSource('roads-lines')) {
      if (map.getLayer('roads-lines-layer')) {
        map.removeLayer('roads-lines-layer');
      }
      map.removeSource('roads-lines');
    }

    if (!layers.roads || filteredRoads.length === 0) return;

    const features = filteredRoads.map(road => {
      const path = (road.pathCoordinates && road.pathCoordinates.length > 0)
        ? road.pathCoordinates
        : [road.coordinates, [road.coordinates[0] + 0.005, road.coordinates[1] + 0.005]];
      const coords = path.map(c => [c[1], c[0]]);
      const conditionColor =
        road.currentCondition === 'Critical'
          ? '#FB7185'
          : road.currentCondition === 'Poor'
          ? '#FBBF24'
          : road.currentCondition === 'Fair'
          ? '#60A5FA'
          : '#34D399';

      return {
        type: 'Feature' as const,
        properties: {
          id: road.id,
          name: road.name,
          condition: road.currentCondition,
          color: conditionColor,
        },
        geometry: {
          type: 'LineString' as const,
          coordinates: coords,
        },
      };
    });

    map.addSource('roads-lines', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features,
      },
    });

    map.addLayer({
      id: 'roads-lines-layer',
      type: 'line',
      source: 'roads-lines',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 5,
        'line-opacity': 0.95,
      },
    });

    map.on('click', 'roads-lines-layer', (e: any) => {
      if (!e.features || e.features.length === 0) return;
      const clickedId = e.features[0].properties.id;
      const match = roads.find(r => r.id === clickedId);
      if (match) onSelectRoad(match);
    });

    map.on('mouseenter', 'roads-lines-layer', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'roads-lines-layer', () => {
      map.getCanvas().style.cursor = '';
    });
  };

  const renderMarkers = (map: maplibregl.Map) => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Road Centroid Markers
    if (layers.roads) {
      filteredRoads.forEach(road => {
        const el = document.createElement('div');
        const conditionColor =
          road.currentCondition === 'Critical'
            ? '#FB7185'
            : road.currentCondition === 'Poor'
            ? '#FBBF24'
            : road.currentCondition === 'Fair'
            ? '#60A5FA'
            : '#34D399';

        el.className = 'road-marker cursor-pointer transition-transform hover:scale-125';
        el.innerHTML = `
          <div style="
            background-color: ${conditionColor};
            width: 24px;
            height: 24px;
            border-radius: 9999px;
            border: 2px solid #140E22;
            box-shadow: 0 4px 10px rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #100B1D;
            font-size: 11px;
            font-weight: 800;
          ">
            !
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectRoad(road);
        });

        const popup = new maplibregl.Popup({ offset: 15, closeButton: false }).setHTML(`
          <div style="font-family: inherit; font-size: 12px; color: #F5F3FF; background-color: #211735; padding: 8px; border-radius: 8px; border: 1px solid #3B2D53;">
            <div style="font-weight: 700; color: #A78BFA;">${road.name}</div>
            <div style="color: #B9AECF; font-size: 11px;">${road.ward} | ${road.id}</div>
            <div style="margin-top: 4px; display: flex; gap: 8px;">
              <span>Condition: <b>${road.currentCondition}</b></span>
              <span>Risk: <b>${road.riskScore}/100</b></span>
            </div>
          </div>
        `);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([road.coordinates[1], road.coordinates[0]])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // Citizen & Municipal Road Damage Report Markers (Section 5.C)
    // Marker Colors: Red (Critical), Orange (High), Yellow (Medium), Green (Low)
    if (layers.reports) {
      filteredReports.forEach(rep => {
        const severityColors: Record<string, string> = {
          Critical: '#EF4444', // Red: Critical
          High: '#F97316',     // Orange: High
          Medium: '#FBBF24',   // Yellow: Medium
          Low: '#10B981',      // Green: Low
        };
        const markerColor = severityColors[rep.severity] || '#F97316';

        const el = document.createElement('div');
        el.className = 'report-marker cursor-pointer transition-transform hover:scale-125';
        el.innerHTML = `
          <div style="
            background-color: ${markerColor};
            color: #FFFFFF;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid #FFFFFF;
            box-shadow: 0 4px 10px rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: bold;
          ">
            !
          </div>
        `;

        const complaintCode = rep.reportCode || rep.id;
        const repArea = rep.area || (rep as any).ward || 'Municipal Ward';

        // When clicking a marker: display Road name, Area, Damage type, Severity, Complaint ID, Report date, Current status
        const popup = new maplibregl.Popup({ offset: 15, closeButton: true }).setHTML(`
          <div style="font-family: inherit; font-size: 12px; color: #F5F3FF; background-color: #211735; padding: 10px; border-radius: 10px; border: 1px solid #3B2D53; min-width: 210px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; border-bottom: 1px solid #3B2D53; padding-bottom: 4px;">
              <span style="font-family: monospace; font-size: 11px; font-weight: 700; color: #A78BFA;">${complaintCode}</span>
              <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background-color: ${markerColor}25; color: ${markerColor}; border: 1px solid ${markerColor}50;">
                ${rep.severity}
              </span>
            </div>
            <div style="font-weight: 700; font-size: 13px; color: #FFFFFF; margin-bottom: 2px;">${rep.roadName}</div>
            <div style="color: #B9AECF; font-size: 11px; margin-bottom: 6px;">Area: <b style="color: #F5F3FF;">${repArea}</b></div>
            <div style="border-top: 1px solid #3B2D53; padding-top: 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px;">
              <div>Damage: <b style="color: #F5F3FF;">${rep.category}</b></div>
              <div>Status: <b style="color: #A78BFA;">${rep.status}</b></div>
              <div style="grid-column: span 2; color: #9CA3AF; font-size: 10px; margin-top: 2px;">Reported: ${rep.reportDate}</div>
            </div>
          </div>
        `);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([rep.coordinates[1], rep.coordinates[0]])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }
  };

  const fitToDataExtent = () => {
    const map = mapRef.current;
    if (!map || roads.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    roads.forEach(r => {
      bounds.extend([r.coordinates[1], r.coordinates[0]]);
      if (r.pathCoordinates) {
        r.pathCoordinates.forEach(c => bounds.extend([c[1], c[0]]));
      }
    });
    map.fitBounds(bounds, { padding: 40, maxZoom: 14 });
  };

  return (
    <div
      className={`relative bg-[#211735] border border-[#3B2D53] rounded-xl overflow-hidden shadow-xs flex flex-col md:flex-row min-w-0 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[640px]'
      }`}
    >
      {/* Map Interactive Area */}
      <div className="relative flex-1 h-full min-w-0 overflow-hidden">
        {/* Top Floating Controls Bar */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none gap-2">
          {/* Left Quick Filters */}
          <div className="flex items-center gap-2 bg-[#211735]/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#3B2D53] shadow-xs text-xs pointer-events-auto text-[#F5F3FF]">
            <span className="font-semibold text-[#B9AECF] hidden sm:inline">Priority:</span>
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="bg-[#140E22] border border-[#3B2D53] rounded px-1.5 py-0.5 font-medium text-[#F5F3FF] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <span className="text-[#3B2D53]">|</span>

            <span className="font-semibold text-[#B9AECF] hidden sm:inline">Report Severity:</span>
            <select
              value={filterReportSeverity}
              onChange={e => setFilterReportSeverity(e.target.value)}
              className="bg-[#140E22] border border-[#3B2D53] rounded px-1.5 py-0.5 font-medium text-[#F5F3FF] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical (Red)</option>
              <option value="High">High (Orange)</option>
              <option value="Medium">Medium (Yellow)</option>
              <option value="Low">Low (Green)</option>
            </select>

            <span className="text-[#3B2D53]">|</span>

            <span className="font-semibold text-[#B9AECF] hidden sm:inline">Report Status:</span>
            <select
              value={filterReportStatus}
              onChange={e => setFilterReportStatus(e.target.value)}
              className="bg-[#140E22] border border-[#3B2D53] rounded px-1.5 py-0.5 font-medium text-[#F5F3FF] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="New">New</option>
              <option value="Reported">Reported</option>
              <option value="Under Review">Under Review</option>
              <option value="Verified">Verified</option>
              <option value="Inspection Scheduled">Inspection Scheduled</option>
              <option value="Maintenance Planned">Maintenance Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Layer visibility toggle */}
            <div className="relative">
              <button
                onClick={() => setShowLayersDropdown(!showLayersDropdown)}
                className="p-2 bg-[#211735]/95 backdrop-blur-md rounded-lg border border-[#3B2D53] text-[#F5F3FF] hover:bg-[#2B2042] shadow-xs transition"
                title="Toggle Layers"
              >
                <Layers className="w-4 h-4 text-[#A78BFA]" />
              </button>

              {showLayersDropdown && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#211735] border border-[#3B2D53] rounded-xl shadow-xl p-3 space-y-2 text-xs z-20 text-[#F5F3FF]">
                  <span className="font-bold text-[#F5F3FF] block mb-1">Layers</span>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-[#B9AECF]">Roads</span>
                    <input
                      type="checkbox"
                      checked={layers.roads}
                      onChange={e => setLayers({ ...layers, roads: e.target.checked })}
                      className="rounded text-[#8B5CF6] focus:ring-0"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-[#B9AECF]">Reports</span>
                    <input
                      type="checkbox"
                      checked={layers.reports}
                      onChange={e => setLayers({ ...layers, reports: e.target.checked })}
                      className="rounded text-[#8B5CF6] focus:ring-0"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Fit extent */}
            <button
              onClick={fitToDataExtent}
              className="p-2 bg-[#211735]/95 backdrop-blur-md rounded-lg border border-[#3B2D53] text-[#F5F3FF] hover:bg-[#2B2042] shadow-xs transition"
              title="Fit to network extent"
            >
              <Navigation className="w-4 h-4 text-[#A78BFA]" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-[#211735]/95 backdrop-blur-md rounded-lg border border-[#3B2D53] text-[#F5F3FF] hover:bg-[#2B2042] shadow-xs transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-[#A78BFA]" /> : <Maximize2 className="w-4 h-4 text-[#A78BFA]" />}
            </button>
          </div>
        </div>

        {/* Map Canvas */}
        <div ref={mapContainerRef} className="w-full h-full bg-[#100B1D]" />

        {/* Map Legend Overlay (Section 5.C) */}
        <div className="absolute bottom-3 left-3 pointer-events-auto bg-[#211735]/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-[#3B2D53] shadow-xl text-[11px] space-y-1.5 text-[#F5F3FF]">
          <div className="font-bold text-[#F5F3FF] border-b border-[#3B2D53] pb-1">Report Severity Markers</div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
            <span className="text-[#B9AECF]">Red: Critical Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
            <span className="text-[#B9AECF]">Orange: High Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
            <span className="text-[#B9AECF]">Yellow: Medium Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span className="text-[#B9AECF]">Green: Low Severity</span>
          </div>
        </div>
      </div>

      {/* Selected Road Detail Panel (Right Side) */}
      <div className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-[#3B2D53] bg-[#211735] flex flex-col h-full overflow-y-auto min-w-0 text-[#F5F3FF]">
        {selectedRoad ? (
          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-4 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#8B5CF6]/20 text-[#C4B5FD] font-bold border border-[#8B5CF6]/30">
                      {selectedRoad.id}
                    </span>
                    <span className="text-xs text-[#B9AECF]">{selectedRoad.roadType}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#F5F3FF] mt-1 leading-snug truncate">
                    {selectedRoad.name}
                  </h3>
                  <p className="text-xs text-[#B9AECF]">{selectedRoad.ward}</p>
                </div>
                <button
                  onClick={() => onSelectRoad(null)}
                  className="p-1 text-[#B9AECF] hover:text-[#F5F3FF] rounded hover:bg-[#2B2042]"
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
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#140E22] border border-[#3B2D53] text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#B9AECF]">PCI Score</span>
                  <div className="text-base font-bold text-[#F5F3FF]">{selectedRoad.pciScore} / 100</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#B9AECF]">Predicted Risk</span>
                  <div className={`text-base font-bold flex items-center gap-1 ${selectedRoad.riskScore >= 75 ? 'text-[#FB7185]' : 'text-[#A78BFA]'}`}>
                    <Zap className="w-3.5 h-3.5" />
                    {selectedRoad.riskScore} / 100
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#B9AECF]">Length</span>
                  <div className="text-xs font-semibold text-[#F5F3FF]">{selectedRoad.lengthKm} km</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#B9AECF]">Surface</span>
                  <div className="text-xs font-semibold text-[#F5F3FF]">{selectedRoad.surfaceType}</div>
                </div>
              </div>

              {/* Stress Factors */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[#B9AECF]">
                  <span className="flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-[#A78BFA]" /> Traffic Load:
                  </span>
                  <strong className="text-[#F5F3FF]">{selectedRoad.trafficIntensity}</strong>
                </div>
                <div className="flex items-center justify-between text-[#B9AECF]">
                  <span className="flex items-center gap-1.5">
                    <CloudRain className="w-3.5 h-3.5 text-[#60A5FA]" /> Weather Zone:
                  </span>
                  <strong className="text-[#F5F3FF]">{selectedRoad.weatherExposure}</strong>
                </div>
                <div className="flex items-center justify-between text-[#B9AECF]">
                  <span className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-[#B9AECF]" /> Last Inspection:
                  </span>
                  <strong className="text-[#F5F3FF]">{selectedRoad.lastInspectionDate}</strong>
                </div>
                <div className="flex items-center justify-between text-[#B9AECF]">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#FBBF24]" /> Open Reports:
                  </span>
                  <strong className="text-[#FBBF24] font-semibold">{selectedRoad.openReportsCount} issues</strong>
                </div>
              </div>

              {/* Recommendation Box */}
              <div className="p-3 rounded-lg bg-[#140E22] border border-[#8B5CF6]/30 text-xs space-y-1">
                <span className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-wider block">
                  Recommended Action
                </span>
                <p className="font-semibold text-[#F5F3FF]">{selectedRoad.recommendedAction}</p>
                <p className="text-[11px] text-[#B9AECF] leading-snug">{selectedRoad.recommendationReason}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-[#3B2D53] space-y-2">
              <button
                onClick={() => onScheduleInspection?.(selectedRoad)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-xs transition"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Schedule Inspection</span>
              </button>
              <button
                onClick={() => onReportIssue?.(selectedRoad)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-[#2B2042] border border-[#3B2D53] text-[#F5F3FF] hover:bg-[#3B2D53] transition shadow-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-[#FBBF24]" />
                <span>Report Road Issue</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-[#B9AECF] flex-1 flex flex-col items-center justify-center">
            <Route className="w-8 h-8 text-[#3B2D53] mb-2" />
            <h4 className="font-semibold text-[#F5F3FF]">No Road Selected</h4>
            <p className="text-[#B9AECF] mt-1 max-w-[200px]">
              Click any road corridor on the map to inspect condition and predicted risk details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
