import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/common/PageHeader';
import { INITIAL_DATA_SOURCES } from '../../mock/datasources';
import { DataSource } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Server,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Database,
  CloudRain,
  Car,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Activity
} from 'lucide-react';

export const DataSourcesPage: React.FC = () => {
  const { addToast } = useApp();

  const [dataSources, setDataSources] = useState<DataSource[]>(INITIAL_DATA_SOURCES);
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleTestConnection = (id: string, name: string) => {
    setTestingId(id);
    setTimeout(() => {
      setTestingId(null);
      setDataSources(prev =>
        prev.map(ds =>
          ds.id === id
            ? { ...ds, lastCheck: 'Just now (passed handshake)', status: 'Connected' }
            : ds
        )
      );
      addToast('success', 'Handshake OK', `${name} health check returned 200 OK.`);
    }, 700);
  };

  const handleTriggerSync = (id: string, name: string) => {
    addToast('info', 'Sync Dispatched', `Ingestion job triggered for ${name}.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Sources &amp; Telemetry Integrations"
        subtitle="Manage underlying spatial databases, microservices, radar weather feeds, and traffic loop detector ingestion pipelines."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            6 Connected Endpoints
          </span>
        }
        actions={
          <button
            onClick={() => {
              addToast('info', 'All Endpoints Checked', 'All 6 telemetry pipelines responding within latency threshold.');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Test All Endpoints</span>
          </button>
        }
      />

      {/* Security Banner */}
      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex items-start gap-3 text-xs text-blue-900">
        <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold">Credential Security Standard</h4>
          <p className="mt-0.5 leading-relaxed text-blue-800">
            Authentication tokens, database connection secrets, and private SCADA keys are managed via Kubernetes secret vaults on the FastAPI backend. Sensitive parameters are never exposed or stored client-side.
          </p>
        </div>
      </div>

      {/* Data Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {dataSources.map(ds => {
          const isTesting = testingId === ds.id;

          const icon = {
            'Relational & Spatial DB': <Database className="w-5 h-5 text-blue-600" />,
            'REST Microservice': <Server className="w-5 h-5 text-indigo-600" />,
            'Weather Telemetry': <CloudRain className="w-5 h-5 text-teal-600" />,
            'Traffic & Congestion': <Car className="w-5 h-5 text-amber-600" />,
            'GIS Basemaps': <MapPin className="w-5 h-5 text-rose-600" />,
            'Sensor Network': <Activity className="w-5 h-5 text-emerald-600" />,
          }[ds.category];

          return (
            <div
              key={ds.id}
              className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      {icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#172033]">{ds.name}</h3>
                      <span className="text-[10px] font-mono text-[#64748B] block mt-0.5">{ds.category}</span>
                    </div>
                  </div>
                  <StatusBadge status={ds.status} />
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 font-mono text-[11px] text-slate-700 break-all select-all">
                  {ds.endpoint}
                </div>

                <p className="text-xs text-[#64748B] leading-relaxed">{ds.notes}</p>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-[#64748B] uppercase font-bold">Latency</span>
                    <p className="font-bold text-[#172033] mt-0.5">{ds.latencyMs} ms</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-[#64748B] uppercase font-bold">Records Synced</span>
                    <p className="font-bold text-blue-700 mt-0.5">{ds.recordsCount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 text-[11px] text-[#64748B] pt-1">
                  <div className="py-1.5 flex items-center justify-between">
                    <span>Last Check:</span>
                    <strong className="text-slate-800">{ds.lastCheck}</strong>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span>Sync Cadence:</span>
                    <span className="font-medium text-slate-700">{ds.syncFrequency}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleTriggerSync(ds.id, ds.name)}
                  className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#172033] hover:bg-slate-50 transition"
                >
                  Trigger Sync
                </button>
                <button
                  disabled={isTesting}
                  onClick={() => handleTestConnection(ds.id, ds.name)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs transition disabled:opacity-50"
                >
                  {isTesting ? 'Handshaking...' : 'Test Connection'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
