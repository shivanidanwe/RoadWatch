import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/common/PageHeader';
import { INITIAL_DATA_SOURCES } from '../../mock/datasources';
import { DataSource } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Server,
  RefreshCw,
  Database,
  CloudRain,
  Car,
  MapPin,
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
    <div className="space-y-6 w-full min-w-0">
      <PageHeader
        title="Data Sources &amp; Telemetry Integrations"
        subtitle="Manage underlying spatial databases, microservices, weather feeds, and traffic loop detector ingestion pipelines."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30">
            {dataSources.length} Connected Endpoints
          </span>
        }
        actions={
          <button
            onClick={() => {
              addToast('info', 'All Endpoints Checked', `All ${dataSources.length} telemetry pipelines responding normally.`);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-lg shadow-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Test All Endpoints</span>
          </button>
        }
      />

      {/* Security Banner */}
      <div className="p-4 rounded-xl bg-[#211735] border border-[#3B2D53] flex items-start gap-3 text-xs text-[#B9AECF]">
        <ShieldCheck className="w-5 h-5 text-[#34D399] shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-[#F5F3FF]">Dual-Mode Database Architecture (SQLite &amp; PostgreSQL/PostGIS)</h4>
          <p className="mt-0.5 leading-relaxed text-[#B9AECF]">
            RoadWatch operates with zero-configuration embedded SQLite persistence by default and seamlessly connects to production PostgreSQL / PostGIS whenever <code>DATABASE_URL</code> is defined. Database credentials and secrets are managed strictly server-side.
          </p>
        </div>
      </div>

      {/* Data Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 min-w-0">
        {dataSources.map(ds => {
          const isTesting = testingId === ds.id;

          const iconMap: Record<string, React.ReactNode> = {
            'Relational & Spatial DB': <Database className="w-5 h-5 text-[#A78BFA]" />,
            'Spatial DB': <Database className="w-5 h-5 text-[#A78BFA]" />,
            'REST Microservice': <Server className="w-5 h-5 text-[#A78BFA]" />,
            'Weather Telemetry': <CloudRain className="w-5 h-5 text-[#60A5FA]" />,
            'Weather Service': <CloudRain className="w-5 h-5 text-[#60A5FA]" />,
            'Traffic & Congestion': <Car className="w-5 h-5 text-[#FBBF24]" />,
            'Traffic Sensors': <Car className="w-5 h-5 text-[#FBBF24]" />,
            'GIS Basemaps': <MapPin className="w-5 h-5 text-[#FB7185]" />,
            'Sensor Network': <Activity className="w-5 h-5 text-[#34D399]" />,
          };
          const icon = iconMap[ds.category] || <Server className="w-5 h-5 text-[#A78BFA]" />;

          return (
            <div
              key={ds.id}
              className="bg-[#211735] rounded-xl border border-[#3B2D53] p-5 shadow-xs space-y-4 flex flex-col justify-between min-w-0 overflow-hidden text-[#F5F3FF]"
            >
              <div className="space-y-3 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-lg bg-[#140E22] border border-[#3B2D53] shrink-0">
                      {icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-[#F5F3FF] truncate">{ds.name}</h3>
                      <span className="text-[10px] font-mono text-[#B9AECF] block mt-0.5 truncate">{ds.category}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={ds.status} />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#140E22] border border-[#3B2D53] font-mono text-[11px] text-[#A78BFA] break-all select-all">
                  {ds.endpoint}
                </div>

                <p className="text-xs text-[#B9AECF] leading-relaxed">{ds.notes}</p>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded-lg bg-[#140E22] border border-[#3B2D53]">
                    <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Latency</span>
                    <p className="font-bold text-[#F5F3FF] mt-0.5">{ds.latencyMs} ms</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#140E22] border border-[#3B2D53]">
                    <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Records Synced</span>
                    <p className="font-bold text-[#A78BFA] mt-0.5">{ds.recordsCount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="divide-y divide-[#3B2D53] text-[11px] text-[#B9AECF] pt-1">
                  <div className="py-1.5 flex items-center justify-between">
                    <span>Last Check:</span>
                    <strong className="text-[#F5F3FF]">{ds.lastCheck}</strong>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span>Sync Cadence:</span>
                    <span className="font-medium text-[#B9AECF]">{ds.syncFrequency}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#3B2D53] flex items-center justify-end gap-2">
                <button
                  onClick={() => handleTriggerSync(ds.id, ds.name)}
                  className="px-3 py-1.5 rounded-lg border border-[#3B2D53] text-xs font-semibold text-[#B9AECF] hover:bg-[#2B2042] transition"
                >
                  Trigger Sync
                </button>
                <button
                  disabled={isTesting}
                  onClick={() => handleTestConnection(ds.id, ds.name)}
                  className="px-3 py-1.5 rounded-lg bg-[#8B5CF6] text-white text-xs font-semibold hover:bg-[#7C3AED] shadow-xs transition disabled:opacity-50"
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
