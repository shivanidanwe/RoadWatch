import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/common/PageHeader';
import { INITIAL_DATASETS, DatasetMeta } from '../../mock/datasets';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Upload,
  Download,
  Table,
  Code2
} from 'lucide-react';

export const DataExplorerPage: React.FC = () => {
  const { addToast } = useApp();

  const [datasets] = useState<DatasetMeta[]>(INITIAL_DATASETS);
  const [selectedDataset, setSelectedDataset] = useState<DatasetMeta>(INITIAL_DATASETS[0]);
  const [activeTab, setActiveTab] = useState<'preview' | 'schema'>('preview');

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
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
          addToast('success', 'Upload Validated', 'Dataset validated against schema.');
          return 100;
        }
        return p + 25;
      });
    }, 400);
  };

  return (
    <div className="space-y-6 min-w-0">
      <PageHeader
        title="Dataset Explorer"
        subtitle="Inspect, validate, and preview spatial telemetry tables feeding the machine learning pipeline."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30">
            {datasets.length} Ingestion Tables
          </span>
        }
        actions={
          <>
            <button
              onClick={() => handleDownloadSample(selectedDataset)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#F5F3FF] bg-[#2B2042] border border-[#3B2D53] rounded-lg hover:bg-[#3B2D53] transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Sample CSV</span>
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-lg shadow-xs transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload CSV</span>
            </button>
          </>
        }
      />

      {/* Dataset Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 min-w-0">
        {datasets.map(ds => {
          const isSelected = selectedDataset.id === ds.id;

          return (
            <div
              key={ds.id}
              onClick={() => setSelectedDataset(ds)}
              className={`rounded-xl border p-4 shadow-xs cursor-pointer transition-all min-w-0 text-[#F5F3FF] ${
                isSelected
                  ? 'bg-[#2B2042] border-[#8B5CF6] ring-2 ring-[#8B5CF6]/30 shadow-sm'
                  : 'bg-[#211735] border-[#3B2D53] hover:border-[#8B5CF6]/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs font-bold text-[#A78BFA]">{ds.id}</span>
                <StatusBadge status={ds.validationStatus} />
              </div>
              <h4 className="font-bold text-xs text-[#F5F3FF] mt-2 truncate">{ds.name}</h4>
              <p className="text-[11px] text-[#B9AECF] mt-1 leading-snug line-clamp-2">{ds.description}</p>
              <div className="mt-3 pt-2.5 border-t border-[#3B2D53] flex items-center justify-between text-[11px] text-[#B9AECF]">
                <span>{ds.recordCount} rows</span>
                <span>{ds.freshness}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dataset Details & Preview */}
      <div className="bg-[#211735] rounded-xl border border-[#3B2D53] shadow-xs overflow-hidden min-w-0 text-[#F5F3FF]">
        <div className="p-4 sm:p-5 border-b border-[#3B2D53] bg-[#140E22] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-[#F5F3FF]">{selectedDataset.name}</h3>
            <p className="text-xs text-[#B9AECF]">Source: {selectedDataset.source}</p>
          </div>

          <div className="flex rounded-lg border border-[#3B2D53] p-0.5 bg-[#140E22] text-xs">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
                activeTab === 'preview' ? 'bg-[#8B5CF6] text-white shadow-xs' : 'text-[#B9AECF]'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Data Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
                activeTab === 'schema' ? 'bg-[#8B5CF6] text-white shadow-xs' : 'text-[#B9AECF]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Schema Definition</span>
            </button>
          </div>
        </div>

        {activeTab === 'preview' ? (
          <div className="overflow-x-auto min-w-0">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#140E22] border-b border-[#3B2D53] text-[#A78BFA] font-bold uppercase text-[11px]">
                  {Object.keys(selectedDataset.sampleRecords[0] || {}).map(col => (
                    <th key={col} className="py-2.5 px-4 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3B2D53]/50 text-[#F5F3FF]">
                {selectedDataset.sampleRecords.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#2B2042]/50 transition">
                    {Object.values(row).map((val: any, cidx) => (
                      <td key={cidx} className="py-2.5 px-4 whitespace-nowrap">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto min-w-0">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#140E22] border-b border-[#3B2D53] text-[#A78BFA] font-bold uppercase text-[11px]">
                  <th className="py-2.5 px-4">Column Name</th>
                  <th className="py-2.5 px-4">Data Type</th>
                  <th className="py-2.5 px-4">Nullable</th>
                  <th className="py-2.5 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3B2D53]/50 text-[#F5F3FF]">
                {selectedDataset.schema.map((field, idx) => (
                  <tr key={idx} className="hover:bg-[#2B2042]/50 transition">
                    <td className="py-2.5 px-4 font-mono font-semibold text-[#A78BFA]">{field.name}</td>
                    <td className="py-2.5 px-4 text-[#B9AECF] font-mono text-[11px]">{field.type}</td>
                    <td className="py-2.5 px-4">{field.nullable ? 'Yes' : 'No'}</td>
                    <td className="py-2.5 px-4 text-[#B9AECF]">{field.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#211735] rounded-xl shadow-2xl border border-[#3B2D53] max-w-md w-full p-6 text-xs space-y-4 text-[#F5F3FF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#3B2D53]">
              <h3 className="text-sm font-bold text-[#F5F3FF]">Upload Dataset CSV</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-[#B9AECF] hover:text-[#F5F3FF]">
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5">
              <div className="border-2 border-dashed border-[#3B2D53] rounded-xl p-6 text-center space-y-2 hover:border-[#8B5CF6]/50 transition bg-[#140E22]">
                <Upload className="w-8 h-8 text-[#A78BFA] mx-auto" />
                <div className="text-xs font-semibold text-[#F5F3FF]">
                  Drag and drop your dataset CSV here
                </div>
                <p className="text-[11px] text-[#B9AECF]">
                  Validates column types, coordinates, and missing values
                </p>
              </div>

              {isUploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[#B9AECF]">
                    <span>Validating schema...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-[#140E22] rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#8B5CF6] h-1.5 rounded-full" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#3B2D53]">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3.5 py-1.5 border border-[#3B2D53] rounded-lg font-medium text-[#B9AECF] hover:bg-[#2B2042] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-lg shadow-xs transition disabled:opacity-50"
                >
                  {isUploading ? 'Validating...' : 'Validate & Ingest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
