import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import {
  AlertTriangle,
  MapPin,
  Camera,
  CheckCircle2,
  Send,
  Search,
  ArrowRight,
  Shield,
  Copy,
  Clock,
  Info,
  Navigation,
  FileText,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  UploadCloud
} from 'lucide-react';
import { apiService, PublicTrackResponse } from '../../services/api';

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

export const PublicReportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'report' | 'track'>('report');

  // Form State
  const [roadName, setRoadName] = useState('');
  const [area, setArea] = useState('');
  const [latitude, setLatitude] = useState<number>(12.9716);
  const [longitude, setLongitude] = useState<number>(77.5946);
  const [category, setCategory] = useState<string>('Pothole');
  const [severity, setSeverity] = useState<string>('High');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');

  // Photograph upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedData, setSubmittedData] = useState<{
    complaintId: string;
    roadName: string;
    area: string;
    category: string;
    severity: string;
    status: string;
    submissionTime: string;
    urgencyScore: number;
    recommendedAction: string;
    coordinates: [number, number];
  } | null>(null);

  // Tracking State
  const [searchComplaintId, setSearchComplaintId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [trackResult, setTrackResult] = useState<PublicTrackResponse | null>(null);
  const [trackError, setTrackError] = useState('');
  const [copied, setCopied] = useState(false);

  // Map state
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  // Initialize Map for location selection
  useEffect(() => {
    if (activeTab !== 'report' || submittedData) return;
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: OSM_STYLE,
        center: [longitude, latitude],
        zoom: 13,
      });

      const markerEl = document.createElement('div');
      markerEl.className = 'w-7 h-7 bg-[#EF4444] rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white cursor-grab';
      markerEl.innerHTML = `
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      `;

      const marker = new maplibregl.Marker({ element: markerEl, draggable: true })
        .setLngLat([longitude, latitude])
        .addTo(map);

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        setLatitude(Number(lngLat.lat.toFixed(5)));
        setLongitude(Number(lngLat.lng.toFixed(5)));
      });

      map.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        marker.setLngLat([lng, lat]);
        setLatitude(Number(lat.toFixed(5)));
        setLongitude(Number(lng.toFixed(5)));
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeTab, submittedData]);

  // Handle Geolocation API
  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(5));
          const lng = Number(pos.coords.longitude.toFixed(5));
          setLatitude(lat);
          setLongitude(lng);
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.flyTo({ center: [lng, lat], zoom: 15 });
            markerRef.current.setLngLat([lng, lat]);
          }
        },
        (err) => {
          setErrorMessage('Unable to retrieve current GPS location. Please select on the map.');
        }
      );
    } else {
      setErrorMessage('Geolocation is not supported by your browser.');
    }
  };

  // Handle Photograph Selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadedImageUrl('');
    }
  };

  // Handle Form Submission
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (!roadName.trim()) {
        throw new Error('Please enter the road name or identifier.');
      }
      if (!area.trim()) {
        throw new Error('Please enter the area, locality, or ward.');
      }
      if (description.trim().length < 5) {
        throw new Error('Please provide at least 5 characters describing the road distress.');
      }

      let imageUrlToSave = uploadedImageUrl;

      // Upload file to backend if selected
      if (selectedFile && !imageUrlToSave) {
        setIsUploadingPhoto(true);
        try {
          const uploadRes = await apiService.uploadPhoto(selectedFile);
          imageUrlToSave = uploadRes.file_url;
          setUploadedImageUrl(imageUrlToSave);
        } catch (uploadErr: any) {
          console.warn('Photo upload error:', uploadErr);
          // If server fails upload, continue with report submission
        } finally {
          setIsUploadingPhoto(false);
        }
      }

      const res = await apiService.submitPublicReport({
        roadName: roadName.trim(),
        area: area.trim(),
        coordinates: [latitude, longitude],
        category,
        severity,
        description: description.trim(),
        imageUrl: imageUrlToSave,
        reporterName: reporterName.trim() || 'Anonymous Citizen',
        reporterContact: reporterContact.trim(),
      });

      setSubmittedData({
        complaintId: res.complaintId,
        roadName: res.roadName,
        area: res.area,
        category: res.category,
        severity: res.severity,
        status: res.status,
        submissionTime: res.submissionTime,
        urgencyScore: res.urgencyScore,
        recommendedAction: res.recommendedAction,
        coordinates: res.coordinates,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit report. Please check input fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Complaint Tracking
  const handleTrackComplaint = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchComplaintId.trim()) return;

    setIsSearching(true);
    setTrackError('');
    setTrackResult(null);

    try {
      const res = await apiService.trackPublicReport(searchComplaintId.trim());
      setTrackResult(res);
    } catch (err: any) {
      setTrackError(err.message || 'Complaint not found. Please verify your reference number.');
    } finally {
      setIsSearching(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#100B1D] text-[#F5F3FF] flex flex-col justify-between">
      {/* Civic Public Header */}
      <header className="bg-[#140E22] border-b border-[#3B2D53] py-4 px-4 sm:px-8 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6] flex items-center justify-center text-white shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-[#F5F3FF]">RoadWatch</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30">
                  Citizen Public Portal
                </span>
              </div>
              <p className="text-xs text-[#B9AECF]">Municipal Pavement Distress Reporting &amp; Transparency</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg text-[#B9AECF] hover:text-[#F5F3FF] hover:bg-[#211735] border border-[#3B2D53] transition"
            >
              <Shield className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Municipal Admin Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-8 flex-1">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#3B2D53] mb-8 gap-4">
          <button
            onClick={() => { setActiveTab('report'); setSubmittedData(null); }}
            className={`flex items-center gap-2 pb-3 px-2 text-sm font-semibold transition border-b-2 ${
              activeTab === 'report'
                ? 'border-[#8B5CF6] text-[#F5F3FF]'
                : 'border-transparent text-[#B9AECF] hover:text-[#F5F3FF]'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-[#FBBF24]" />
            <span>Report Road Damage</span>
          </button>

          <button
            onClick={() => setActiveTab('track')}
            className={`flex items-center gap-2 pb-3 px-2 text-sm font-semibold transition border-b-2 ${
              activeTab === 'track'
                ? 'border-[#8B5CF6] text-[#F5F3FF]'
                : 'border-transparent text-[#B9AECF] hover:text-[#F5F3FF]'
            }`}
          >
            <Search className="w-4 h-4 text-[#60A5FA]" />
            <span>Track Complaint Status</span>
          </button>
        </div>

        {/* TAB 1: REPORT DAMAGE */}
        {activeTab === 'report' && (
          <div>
            {submittedData ? (
              /* Submission Success View */
              <div className="bg-[#211735] border border-[#3B2D53] rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xl space-y-6">
                <div className="w-16 h-16 bg-[#34D399]/20 border border-[#34D399]/40 rounded-full flex items-center justify-center mx-auto text-[#34D399]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-[#F5F3FF]">Complaint Registered Successfully</h2>
                  <p className="text-xs text-[#B9AECF] mt-1">
                    Your report has been securely saved to the municipal database and is now live in the Municipal Admin Dashboard queue.
                  </p>
                </div>

                {/* Complaint Reference Card */}
                <div className="p-4 rounded-xl bg-[#140E22] border border-[#3B2D53] text-left space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#3B2D53]">
                    <span className="text-xs text-[#B9AECF]">Complaint Reference ID</span>
                    <button
                      onClick={() => copyToClipboard(submittedData.complaintId)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#2B2042] text-[#A78BFA] hover:text-[#F5F3FF] text-xs font-semibold transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? 'Copied!' : 'Copy ID'}</span>
                    </button>
                  </div>
                  <div className="text-xl font-mono font-bold text-[#8B5CF6]">
                    {submittedData.complaintId}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                    <div>
                      <span className="text-[#B9AECF] block text-[11px]">Road Name</span>
                      <strong className="text-[#F5F3FF]">{submittedData.roadName}</strong>
                    </div>
                    <div>
                      <span className="text-[#B9AECF] block text-[11px]">Area / Locality</span>
                      <strong className="text-[#F5F3FF]">{submittedData.area}</strong>
                    </div>
                    <div>
                      <span className="text-[#B9AECF] block text-[11px]">Damage Type &amp; Severity</span>
                      <strong className="text-[#F5F3FF]">{submittedData.category} ({submittedData.severity})</strong>
                    </div>
                    <div>
                      <span className="text-[#B9AECF] block text-[11px]">Current Status</span>
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30">
                        {submittedData.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 pt-4">
                  <button
                    onClick={() => {
                      setSearchComplaintId(submittedData.complaintId);
                      setActiveTab('track');
                      handleTrackComplaint();
                    }}
                    className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white transition flex items-center gap-2"
                  >
                    <span>Track Status Live</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setSubmittedData(null);
                      setRoadName('');
                      setDescription('');
                      setSelectedFile(null);
                      setPreviewUrl('');
                    }}
                    className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-[#140E22] hover:bg-[#2B2042] border border-[#3B2D53] text-[#F5F3FF] transition"
                  >
                    Submit Another Report
                  </button>
                </div>
              </div>
            ) : (
              /* Public Form */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Form Column */}
                <div className="lg:col-span-7 bg-[#211735] border border-[#3B2D53] rounded-2xl p-6 sm:p-8 shadow-xl">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-[#F5F3FF]">Citizen Road Damage Complaint</h2>
                    <p className="text-xs text-[#B9AECF] mt-1">
                      No account or registration required. Help municipal engineers detect distress, potholes, and hazardous surface collapse before accidents occur.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="mb-5 p-3 rounded-xl bg-[#FB7185]/15 border border-[#FB7185]/40 text-[#FB7185] text-xs">
                      {errorMessage}
                    </div>
                  )}

                  <form onSubmit={handleSubmitReport} className="space-y-4">
                    {/* Road Name & Locality */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#B9AECF] mb-1">
                          Road Name <span className="text-[#FB7185]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={roadName}
                          onChange={(e) => setRoadName(e.target.value)}
                          placeholder="e.g. MG Road, Old Airport Road"
                          className="w-full px-3 py-2 text-xs border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:outline-none focus:border-[#8B5CF6] transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#B9AECF] mb-1">
                          Area / Ward / Locality <span className="text-[#FB7185]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          placeholder="e.g. Ward 4 - North Zone, Indiranagar"
                          className="w-full px-3 py-2 text-xs border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:outline-none focus:border-[#8B5CF6] transition"
                        />
                      </div>
                    </div>

                    {/* Damage Type & Severity */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#B9AECF] mb-1">
                          Distress / Damage Type <span className="text-[#FB7185]">*</span>
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:outline-none focus:border-[#8B5CF6] transition"
                        >
                          <option value="Pothole">Pothole (Crater in pavement)</option>
                          <option value="Road cracks">Road Cracks (Alligator / Fatigue cracks)</option>
                          <option value="Surface damage">Surface Damage (Raveling / Loose bitumen)</option>
                          <option value="Waterlogging">Waterlogging (Sub-base water saturation)</option>
                          <option value="Broken road">Broken Road (Structural pavement failure)</option>
                          <option value="Other">Other Distress</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#B9AECF] mb-1">
                          Observed Severity <span className="text-[#FB7185]">*</span>
                        </label>
                        <select
                          value={severity}
                          onChange={(e) => setSeverity(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:outline-none focus:border-[#8B5CF6] transition"
                        >
                          <option value="Low">Low — Minor roughness or hairline cracks</option>
                          <option value="Medium">Medium — Noticeable pothole, moderate bump</option>
                          <option value="High">High — Deep pothole or loose debris, transit hazard</option>
                          <option value="Critical">Critical — Severe crater, cave-in or traffic disruption</option>
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-semibold text-[#B9AECF] mb-1">
                        Detailed Description <span className="text-[#FB7185]">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe exact location markers (e.g. opposite bus stop, lane 2), approximate dimensions or depth, and immediate danger."
                        className="w-full px-3 py-2 text-xs border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:outline-none focus:border-[#8B5CF6] transition resize-none"
                      />
                    </div>

                    {/* Coordinates Picker Row */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-[#B9AECF]">
                          Geographical Location (Coordinates) <span className="text-[#FB7185]">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleGetCurrentLocation}
                          className="flex items-center gap-1 text-[11px] text-[#A78BFA] hover:underline font-semibold"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Use My GPS Location</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] text-[#B9AECF]">Latitude</span>
                          <input
                            type="number"
                            step="any"
                            required
                            value={latitude}
                            onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 text-xs border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:outline-none focus:border-[#8B5CF6]"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-[#B9AECF]">Longitude</span>
                          <input
                            type="number"
                            step="any"
                            required
                            value={longitude}
                            onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 text-xs border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:outline-none focus:border-[#8B5CF6]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Photograph Upload */}
                    <div>
                      <label className="block text-xs font-semibold text-[#B9AECF] mb-1">
                        Upload Road Damage Photograph (Optional)
                      </label>
                      <div className="border-2 border-dashed border-[#3B2D53] rounded-xl p-4 text-center hover:border-[#8B5CF6]/60 transition bg-[#140E22]">
                        {previewUrl ? (
                          <div className="relative inline-block">
                            <img
                              src={previewUrl}
                              alt="Damage preview"
                              className="h-32 object-cover rounded-lg border border-[#3B2D53]"
                            />
                            <button
                              type="button"
                              onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}
                              className="absolute -top-2 -right-2 bg-[#FB7185] text-white rounded-full p-1 text-xs hover:bg-rose-700 shadow-md"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center gap-1.5 py-2">
                            <UploadCloud className="w-6 h-6 text-[#A78BFA]" />
                            <span className="text-xs text-[#F5F3FF] font-semibold">Click to select photo or take camera snap</span>
                            <span className="text-[10px] text-[#B9AECF]">JPG, PNG, WebP up to 10 MB</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoSelect}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Optional Citizen Reporter Details */}
                    <div className="pt-2 border-t border-[#3B2D53]">
                      <span className="text-[11px] font-bold text-[#A78BFA] uppercase tracking-wider block mb-2">
                        Citizen Contact (Optional for Status Updates)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <input
                            type="text"
                            value={reporterName}
                            onChange={(e) => setReporterName(e.target.value)}
                            placeholder="Your Name (Optional)"
                            className="w-full px-3 py-2 text-xs border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:outline-none focus:border-[#8B5CF6]"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={reporterContact}
                            onChange={(e) => setReporterContact(e.target.value)}
                            placeholder="Phone or Email (Optional)"
                            className="w-full px-3 py-2 text-xs border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:outline-none focus:border-[#8B5CF6]"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || isUploadingPhoto}
                      className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Submitting Complaint to Municipal Queue...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Road Damage Report</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Right Map & Instructions Column */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Interactive Map */}
                  <div className="bg-[#211735] border border-[#3B2D53] rounded-2xl p-4 shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#FB7185]" />
                        <span className="text-xs font-bold text-[#F5F3FF]">Interactive Pin Placement</span>
                      </div>
                      <span className="text-[10px] text-[#B9AECF]">Click map or drag pin</span>
                    </div>

                    <div
                      ref={mapContainerRef}
                      className="w-full h-72 rounded-xl overflow-hidden border border-[#3B2D53] bg-[#140E22]"
                    />

                    <div className="text-[11px] text-[#B9AECF] bg-[#140E22] p-2.5 rounded-lg flex items-center justify-between border border-[#3B2D53]">
                      <span>Pin Coordinates:</span>
                      <strong className="font-mono text-[#F5F3FF]">{latitude.toFixed(4)}, {longitude.toFixed(4)}</strong>
                    </div>
                  </div>

                  {/* Public Information Card */}
                  <div className="bg-[#211735] border border-[#3B2D53] rounded-2xl p-5 space-y-3 shadow-xl text-xs">
                    <div className="flex items-center gap-2 font-bold text-[#A78BFA]">
                      <Info className="w-4 h-4" />
                      <span>How Public Reports Are Handled</span>
                    </div>
                    <p className="text-[#B9AECF] leading-relaxed">
                      Every citizen report is assigned a permanent reference number and scored automatically by our transparent municipal recommendation engine.
                    </p>
                    <div className="space-y-2 pt-1 text-[11px] text-[#B9AECF]">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#34D399] mt-1.5 shrink-0" />
                        <span>Instant visibility on the Municipal Authority Admin Dashboard.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#34D399] mt-1.5 shrink-0" />
                        <span>Dispatch for on-site physical engineering verification.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#34D399] mt-1.5 shrink-0" />
                        <span>Work order generation with before-and-after photographic records.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TRACK STATUS */}
        {activeTab === 'track' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-[#211735] border border-[#3B2D53] rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
              <div>
                <h2 className="text-xl font-bold text-[#F5F3FF]">Track Road Damage Complaint</h2>
                <p className="text-xs text-[#B9AECF] mt-1">
                  Enter your unique Complaint Reference Number (e.g. RW-2026-1042) to inspect real-time progress.
                </p>
              </div>

              <form onSubmit={handleTrackComplaint} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={searchComplaintId}
                  onChange={(e) => setSearchComplaintId(e.target.value)}
                  placeholder="Enter Complaint ID (e.g. RW-2026-XXXX)"
                  className="flex-1 px-4 py-2.5 text-xs border border-[#3B2D53] rounded-xl bg-[#140E22] text-[#F5F3FF] focus:outline-none focus:border-[#8B5CF6] transition font-mono uppercase"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-5 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center gap-2 shrink-0 disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                  <span>{isSearching ? 'Searching...' : 'Search'}</span>
                </button>
              </form>

              {trackError && (
                <div className="p-3 rounded-xl bg-[#FB7185]/15 border border-[#FB7185]/40 text-[#FB7185] text-xs">
                  {trackError}
                </div>
              )}
            </div>

            {/* Tracking Result Card */}
            {trackResult && (
              <div className="bg-[#211735] border border-[#3B2D53] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#3B2D53]">
                  <div>
                    <span className="text-[11px] text-[#B9AECF]">Complaint Reference Number</span>
                    <h3 className="text-xl font-mono font-bold text-[#8B5CF6]">{trackResult.complaintId}</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/40">
                    Status: {trackResult.status}
                  </span>
                </div>

                {/* Status Message Highlight */}
                <div className="p-4 rounded-xl bg-[#140E22] border border-[#3B2D53] flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#A78BFA] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-[#F5F3FF]">Current Processing State</div>
                    <div className="text-xs text-[#B9AECF] mt-0.5">{trackResult.statusMessage}</div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[#B9AECF] block text-[11px]">Road Name</span>
                    <strong className="text-[#F5F3FF]">{trackResult.roadName}</strong>
                  </div>
                  <div>
                    <span className="text-[#B9AECF] block text-[11px]">Locality / Area</span>
                    <strong className="text-[#F5F3FF]">{trackResult.area}</strong>
                  </div>
                  <div>
                    <span className="text-[#B9AECF] block text-[11px]">Damage Category</span>
                    <strong className="text-[#F5F3FF]">{trackResult.category}</strong>
                  </div>
                  <div>
                    <span className="text-[#B9AECF] block text-[11px]">Report Severity</span>
                    <strong className="text-[#F5F3FF]">{trackResult.severity}</strong>
                  </div>
                  <div>
                    <span className="text-[#B9AECF] block text-[11px]">Verification</span>
                    <strong className={trackResult.verificationStatus === 'Verified' ? 'text-[#34D399]' : 'text-[#FBBF24]'}>
                      {trackResult.verificationStatus}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#B9AECF] block text-[11px]">Filed On</span>
                    <strong className="text-[#F5F3FF]">{trackResult.reportDate}</strong>
                  </div>
                </div>

                {/* Description */}
                {trackResult.description && (
                  <div className="p-3 bg-[#140E22] rounded-xl border border-[#3B2D53] text-xs">
                    <span className="text-[#B9AECF] block text-[11px] mb-1">Citizen Reported Description</span>
                    <p className="text-[#F5F3FF]">{trackResult.description}</p>
                  </div>
                )}

                {/* Photo Preview if attached */}
                {trackResult.imageUrl && (
                  <div>
                    <span className="text-[#B9AECF] block text-xs mb-2">Attached Photograph</span>
                    <img
                      src={trackResult.imageUrl}
                      alt="Complaint attachment"
                      className="max-h-56 rounded-xl border border-[#3B2D53] object-cover"
                    />
                  </div>
                )}

                {/* Status Timeline */}
                <div>
                  <h4 className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider mb-3">
                    Municipal Activity Timeline
                  </h4>
                  <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-[#3B2D53]">
                    {trackResult.timeline.map((item, idx) => (
                      <div key={idx} className="relative flex items-start gap-4 text-xs pl-1">
                        <div className="w-5 h-5 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-[10px] font-bold z-10 shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 bg-[#140E22] p-3 rounded-xl border border-[#3B2D53]">
                          <div className="flex items-center justify-between">
                            <strong className="text-[#F5F3FF]">{item.status}</strong>
                            <span className="text-[10px] text-[#B9AECF]">{item.timestamp}</span>
                          </div>
                          {item.notes && (
                            <p className="text-[11px] text-[#B9AECF] mt-1">{item.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#140E22] border-t border-[#3B2D53] py-4 px-4 text-center text-xs text-[#B9AECF]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>RoadWatch Municipal Authority &bull; Predictive Infrastructure Operations</span>
          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/login" className="hover:text-[#F5F3FF] transition">Admin Sign In</Link>
            <span className="text-[#3B2D53]">&bull;</span>
            <span className="text-[#A78BFA]">Direct Citizen Dispatch v3.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
