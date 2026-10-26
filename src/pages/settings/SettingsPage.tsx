import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/common/PageHeader';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { SystemSettings } from '../../types';
import {
  Sliders,
  Save,
  RotateCcw,
  Shield,
  Bell,
  Map,
  Moon,
  Sun,
  User,
  AlertTriangle,
  Scale
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetAllData, currentUser, addToast } = useApp();

  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const [showResetModal, setShowResetModal] = useState(false);

  // Calculate sum of weights
  const totalWeight =
    Number(formData.factorWeights.damageSeverity) +
    Number(formData.factorWeights.trafficIntensity) +
    Number(formData.factorWeights.weatherExposure) +
    Number(formData.factorWeights.repairHistory);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalWeight !== 100) {
      addToast(
        'warning',
        'Weight Normalization Required',
        `Factor weights must sum to exactly 100% (currently ${totalWeight}%).`
      );
      return;
    }
    updateSettings(formData);
  };

  const handleResetConfirm = () => {
    resetAllData();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform &amp; Scoring Configuration"
        subtitle="Calibrate risk threshold bands, feature importance scoring weights, notification dispatch rules, and municipal preferences."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#172033] border border-slate-200">
            System Administration
          </span>
        }
        actions={
          <>
            <button
              onClick={() => setShowResetModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Configuration</span>
            </button>
          </>
        }
      />

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Risk Thresholds Band Configuration */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div>
              <h3 className="font-bold text-sm text-[#172033] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                Urgency Priority Threshold Bands (0–100 Scale)
              </h3>
              <p className="text-[#64748B] text-[11px] mt-0.5">
                Defines the numerical boundaries that classify calculated road risks into Low, Medium, High, or Critical.
              </p>
            </div>
            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Configurable Engine
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
              <span className="font-bold text-emerald-800 uppercase text-[10px]">Low Priority Max</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={formData.riskThresholds.lowMax}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      riskThresholds: { ...formData.riskThresholds, lowMax: Number(e.target.value) },
                    })
                  }
                  className="w-20 p-1.5 border border-emerald-300 rounded bg-white font-bold text-xs"
                />
                <span className="text-emerald-700 font-mono text-[11px]">Score 0 &ndash; {formData.riskThresholds.lowMax}</span>
              </div>
              <p className="text-[10px] text-emerald-900 leading-snug">Routine scheduled maintenance cycles</p>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
              <span className="font-bold text-amber-800 uppercase text-[10px]">Medium Priority Max</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="25"
                  max="60"
                  value={formData.riskThresholds.mediumMax}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      riskThresholds: { ...formData.riskThresholds, mediumMax: Number(e.target.value) },
                    })
                  }
                  className="w-20 p-1.5 border border-amber-300 rounded bg-white font-bold text-xs"
                />
                <span className="text-amber-700 font-mono text-[11px]">Score {formData.riskThresholds.lowMax + 1} &ndash; {formData.riskThresholds.mediumMax}</span>
              </div>
              <p className="text-[10px] text-amber-900 leading-snug">Slurry seals and preventive surface crack fills</p>
            </div>

            <div className="p-3.5 rounded-xl border border-orange-200 bg-orange-50/40 space-y-2">
              <span className="font-bold text-orange-800 uppercase text-[10px]">High Priority Max</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="50"
                  max="80"
                  value={formData.riskThresholds.highMax}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      riskThresholds: { ...formData.riskThresholds, highMax: Number(e.target.value) },
                    })
                  }
                  className="w-20 p-1.5 border border-orange-300 rounded bg-white font-bold text-xs"
                />
                <span className="text-orange-700 font-mono text-[11px]">Score {formData.riskThresholds.mediumMax + 1} &ndash; {formData.riskThresholds.highMax}</span>
              </div>
              <p className="text-[10px] text-orange-900 leading-snug">Structural overlay planning within 90 days</p>
            </div>

            <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/40 space-y-2">
              <span className="font-bold text-red-800 uppercase text-[10px]">Critical Priority Min</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="70"
                  max="95"
                  value={formData.riskThresholds.criticalMin}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      riskThresholds: { ...formData.riskThresholds, criticalMin: Number(e.target.value) },
                    })
                  }
                  className="w-20 p-1.5 border border-red-300 rounded bg-white font-bold text-xs"
                />
                <span className="text-red-700 font-mono text-[11px]">Score {formData.riskThresholds.criticalMin} &ndash; 100</span>
              </div>
              <p className="text-[10px] text-red-900 leading-snug">Immediate emergency engineering intervention</p>
            </div>
          </div>
        </div>

        {/* Priority Calculation Weights */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div>
              <h3 className="font-bold text-sm text-[#172033] flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-600" />
                Feature Importance Scoring Weights (% of Composite Risk)
              </h3>
              <p className="text-[#64748B] text-[11px] mt-0.5">
                Relative weighting factors contributing to the final predictive vulnerability index. Must sum to 100%.
              </p>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                totalWeight === 100
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              Sum: {totalWeight}% {totalWeight === 100 ? '✓ Balanced' : '⚠️ Must equal 100%'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold text-[#172033] mb-1">Damage Severity &amp; Cracks</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.factorWeights.damageSeverity}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      factorWeights: { ...formData.factorWeights, damageSeverity: Number(e.target.value) },
                    })
                  }
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                />
                <span className="font-bold text-[#64748B]">%</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#172033] mb-1">Traffic Volume &amp; Axle Load</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.factorWeights.trafficIntensity}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      factorWeights: { ...formData.factorWeights, trafficIntensity: Number(e.target.value) },
                    })
                  }
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                />
                <span className="font-bold text-[#64748B]">%</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#172033] mb-1">Weather &amp; Monsoon Exposure</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.factorWeights.weatherExposure}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      factorWeights: { ...formData.factorWeights, weatherExposure: Number(e.target.value) },
                    })
                  }
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                />
                <span className="font-bold text-[#64748B]">%</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#172033] mb-1">Repair Age &amp; History Gap</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.factorWeights.repairHistory}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      factorWeights: { ...formData.factorWeights, repairHistory: Number(e.target.value) },
                    })
                  }
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                />
                <span className="font-bold text-[#64748B]">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* General Preferences & Map Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General & Environment */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-sm text-[#172033] pb-2 border-b border-[#E2E8F0]">
              Operational Preferences
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#172033] block">Telemetry Auto-Refresh Cadence</span>
                  <span className="text-[11px] text-[#64748B]">Background poll interval for loop sensors &amp; reports</span>
                </div>
                <select
                  value={formData.refreshIntervalSeconds}
                  onChange={e => setFormData({ ...formData, refreshIntervalSeconds: Number(e.target.value) })}
                  className="p-1.5 border border-[#E2E8F0] rounded-lg bg-white"
                >
                  <option value={15}>15 Seconds</option>
                  <option value={30}>30 Seconds</option>
                  <option value={60}>1 Minute</option>
                  <option value={300}>5 Minutes</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <span className="font-semibold text-[#172033] block">Default Geospatial Basemap</span>
                  <span className="text-[11px] text-[#64748B]">Layer presentation for Live Road Map workspace</span>
                </div>
                <select
                  value={formData.mapDefaultStyle}
                  onChange={e => setFormData({ ...formData, mapDefaultStyle: e.target.value as any })}
                  className="p-1.5 border border-[#E2E8F0] rounded-lg bg-white"
                >
                  <option value="standard">Standard Carto Vector</option>
                  <option value="satellite">Satellite Imagery</option>
                  <option value="dark">High-Contrast Dark</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <span className="font-semibold text-[#172033] block">Demo Mode Simulation</span>
                  <span className="text-[11px] text-[#64748B]">Operates safely with localized offline telemetry</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  Active (Safe)
                </span>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-sm text-[#172033] pb-2 border-b border-[#E2E8F0]">
              Automated Alert Dispatch
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-[#172033] block">Critical Distress Dispatch</span>
                  <span className="text-[11px] text-[#64748B]">Instant alerts for potholes &ge; 10cm or flood inundation</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications.criticalAlertsEmail}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      notifications: { ...formData.notifications, criticalAlertsEmail: e.target.checked },
                    })
                  }
                  className="rounded text-blue-600 focus:ring-0 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-100">
                <div>
                  <span className="font-semibold text-[#172033] block">Weekly Executive Digest</span>
                  <span className="text-[11px] text-[#64748B]">Consolidated PCI degradation briefing for leadership</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications.weeklyDigest}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      notifications: { ...formData.notifications, weeklyDigest: e.target.checked },
                    })
                  }
                  className="rounded text-blue-600 focus:ring-0 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-100">
                <div>
                  <span className="font-semibold text-[#172033] block">Model Drift Notifications</span>
                  <span className="text-[11px] text-[#64748B]">Alert data team when feature divergence exceeds 5%</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications.modelDriftAlerts}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      notifications: { ...formData.notifications, modelDriftAlerts: e.target.checked },
                    })
                  }
                  className="rounded text-blue-600 focus:ring-0 w-4 h-4"
                />
              </label>
            </div>
          </div>
        </div>
      </form>

      {/* Confirmation Modal for Resetting All Demo Data */}
      <ConfirmationDialog
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetConfirm}
        title="Reset All Demo Data?"
        message="This will clear your local changes (added reports, updated inspections, created road segments) and restore the initial municipal baseline dataset."
        confirmLabel="Reset Everything"
        cancelLabel="Keep Changes"
        isDestructive={true}
      />
    </div>
  );
};
