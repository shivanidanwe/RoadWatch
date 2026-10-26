import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/common/PageHeader';
import { INITIAL_DATASETS, DatasetMeta } from '../../mock/datasets';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Database,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  RefreshCw,
  Table,
  Code2,
  FileCheck,
  X
} from 'lucide-react';

export const DataExplorerPage: React.FC = () => {
  const { addToast } = useApp();

  const [datasets] = useState<DatasetMeta[]>(INITIAL_DATASETS);
  const [selectedDataset, setSelectedDataset] = useState<DatasetMeta>(INITIAL_DATASETS[0]);
  const [activeTab, setActiveTab] = useState<'preview' | 'schema'>('preview');

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDownloadSample = (ds: DatasetMeta) => {
    const headers = ds.schema.map(s => s.name).join(',');
    const sampleRows = ds.sampleRecords.map(r => Object.values(r).join(',')).join('\n');
    const content = 'data:text/csv;charset=utf-8,' + headers + '\n' + sampleRows;
    const encoded = encodeURI(content);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `${ds.id.toLowerCase()}-template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('info', 'Template Downloaded', `Sample CSV template for ${ds.name} ready.`);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setShowUploadModal(false);
          addToast('success', 'Upload Staged', 'Dataset validated against PostGIS schema (Demo Simulation).');
          return 100;
        }
        return p + 25;
      });
    }, 400);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Science Dataset Explorer"
        subtitle="Inspect, validate, and preview spatial telemetry tables feeding the machine learning pavement degradation pipeline."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#172033] border border-slate-200">
            {datasets.length} Master Ingestion Tables
          </span>
        }
        actions={
          <>
            <button
              onClick={() => handleDownloadSample(selectedDataset)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#172033] bg-white border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Sample CSV</span>
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Dataset CSV</span>
            </button>
          </>
        }
      />

      {/* Dataset Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {datasets.map(ds => {
          const isSelected = selectedDataset.id === ds.id;

          return (
            <div
              key={ds.id}
              onClick={() => setSelectedDataset(ds)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/20 shadow-md ring-2 ring-blue-600/10'
                  : 'border-[#E2E8F0] bg-white hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  {ds.id}
                </span>
                <StatusBadge status={ds.validationStatus} />
              </div>
              <h4 className="font-bold text-xs text-[#172033] mt-2 line-clamp-1">{ds.name}</h4>
              <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1">{ds.source}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#64748B]">
                <span>{ds.recordCount.toLocaleString()} rows</span>
                <span className="font-semibold text-slate-700">{ds.freshness}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Dataset Detail & Inspector */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        {/* Table Header Details */}
        <div className="p-5 border-b border-[#E2E8F0] bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-700">{selectedDataset.id}</span>
              <StatusBadge status={selectedDataset.validationStatus} />
            </div>
            <h3 className="text-base font-bold text-[#172033] mt-1">{selectedDataset.name}</h3>
            <p className="text-xs text-[#64748B] mt-0.5">{selectedDataset.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowValidateModal(true)}
              className="px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#172033] hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
            >
              <FileCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Validate Schema</span>
            </button>
            <div className="flex rounded-lg border border-[#E2E8F0] p-0.5 bg-slate-100 text-xs">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  activeTab === 'preview' ? 'bg-white text-[#172033] shadow-xs' : 'text-[#64748B]'
                }`}
              >
                Data Preview
              </button>
              <button
                onClick={() => setActiveTab('schema')}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  activeTab === 'schema' ? 'bg-white text-[#172033] shadow-xs' : 'text-[#64748B]'
                }`}
              >
                Schema Specification
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Preview Records */}
        {activeTab === 'preview' ? (
          <div className="overflow-x-auto min-h-[280px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-[#E2E8F0] text-[#64748B] font-semibold uppercase text-[10px]">
                  {selectedDataset.schema.map(col => (
                    <th key={col.name} className="py-2.5 px-4">
                      {col.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {selectedDataset.sampleRecords.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    {selectedDataset.schema.map(col => (
                      <td key={col.name} className="py-3 px-4 text-[#172033] font-mono text-[11px]">
                        {row[col.name] !== undefined ? String(row[col.name]) : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Tab 2: Schema Inspector */
          <div className="p-5 space-y-4">
            <h4 className="font-bold text-xs text-[#172033] uppercase tracking-wider">
              PostgreSQL / PostGIS Relational Schema
            </h4>
            <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[#64748B] font-semibold uppercase text-[10px] border-b border-[#E2E8F0]">
                    <th className="py-2.5 px-4">Column Name</th>
                    <th className="py-2.5 px-4">SQL Data Type</th>
                    <th className="py-2.5 px-4">Nullable</th>
                    <th className="py-2.5 px-4">Domain Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {selectedDataset.schema.map(field => (
                    <tr key={field.name} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-mono font-bold text-blue-700">{field.name}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-700">{field.type}</td>
                      <td className="py-2.5 px-4 text-[#64748B]">{field.nullable ? 'YES' : 'NO (NOT NULL)'}</td>
                      <td className="py-2.5 px-4 text-[#64748B]">{field.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quality Metrics Footer */}
        <div className="p-4 border-t border-[#E2E8F0] bg-slate-50/50 flex flex-wrap items-center justify-between text-xs text-[#64748B] gap-4">
          <div className="flex items-center gap-4">
            <span>
              Missing Null Values: <strong>{selectedDataset.missingValuesPct}%</strong>
            </span>
            <span>&bull;</span>
            <span>
              Validation Pipeline: <strong>Passed Constraints</strong>
            </span>
            <span>&bull;</span>
            <span>
              Last Ingested: <strong>{selectedDataset.lastUpdated}</strong>
            </span>
          </div>
          <span className="text-[10px] text-[#94A3B8]">
            Storage: PostgreSQL PostGIS Spatial Engine
          </span>
        </div>
      </div>

      {/* Upload CSV Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E2E8F0] max-w-md w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#172033]">Upload Road Data CSV</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-[#94A3B8] hover:text-[#172033]">
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-[#172033] mb-1">Target Table Layer</label>
                <select className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white">
                  {datasets.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1">Select File (.csv or .geojson)</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 cursor-pointer transition">
                  <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold text-[#172033]">Click to choose CSV file or drag and drop</p>
                  <p className="text-[11px] text-[#94A3B8] mt-1">UTF-8 encoded, comma-delimited up to 50MB</p>
                </div>
              </div>

              {isUploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span>Validating schema records...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-2 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3.5 py-1.5 border border-[#E2E8F0] rounded-lg font-medium text-[#64748B] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {isUploading ? 'Uploading...' : 'Validate & Ingest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Validate Modal */}
      {showValidateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E2E8F0] max-w-lg w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#172033]">Data Integrity &amp; Validation Report</h3>
              <button onClick={() => setShowValidateModal(false)} className="text-[#94A3B8] hover:text-[#172033]">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs">Schema Verification Passed</h4>
                  <p className="text-[11px] mt-0.5">
                    All {selectedDataset.recordCount} rows comply with strict PostgreSQL column constraints and non-null rules.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 border border-[#E2E8F0] rounded-xl overflow-hidden text-xs">
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-[#64748B]">Primary Key Uniqueness:</span>
                  <strong className="text-emerald-700 font-semibold">100% Unique</strong>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-[#64748B]">WGS84 Coordinate Extents:</span>
                  <strong className="text-emerald-700 font-semibold">Valid (EPSG:4326)</strong>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-[#64748B]">Missing Value Rate:</span>
                  <strong className="text-slate-800">{selectedDataset.missingValuesPct}% (Within allowable limit)</strong>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E2E8F0]">
              <button
                onClick={() => setShowValidateModal(false)}
                className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-lg text-xs"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
