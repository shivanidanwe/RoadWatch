import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/common/PageHeader';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { SystemSettings } from '../../types';
import { apiService } from '../../services/api';
import {
  Sliders,
  Save,
  RotateCcw,
  Scale
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetToEmpty, seedDemoData, currentUser, addToast } = useApp();

  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const [showResetModal, setShowResetModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Fetch backend scoring config
    const loadBackendConfig = async () => {
      try {
        const config = await apiService.getScoringConfig();
        if (config && config.weights) {
          setFormData(prev => ({
            ...prev,
            factorWeights: {
              damageSeverity: Math.round((config.weights.damage_severity ?? 0.3) * 100),
              trafficIntensity: Math.round((config.weights.traffic_intensity ?? 0.15) * 100),
              weatherExposure: Math.round((config.weights.weather_exposure ?? 0.15) * 100),
              repairHistory: Math.round(((config.weights.time_since_last_repair ?? 0.1) + (config.weights.historical_deterioration ?? 0.1) + (config.weights.recent_report_frequency ?? 0.2)) * 100),
            }
          }));
        }
      } catch (e) {
        // use default settings
      }
    };
    loadBackendConfig();
  }, []);

  // Calculate sum of weights
  const totalWeight =
    Number(formData.factorWeights.damageSeverity) +
    Number(formData.factorWeights.trafficIntensity) +
    Number(formData.factorWeights.weatherExposure) +
    Number(formData.factorWeights.repairHistory);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalWeight !== 100) {
      addToast(
        'warning',
        'Weight Normalization Required',
        `Factor weights must sum to exactly 100% (currently ${totalWeight}%).`
      );
      return;
    }
    setIsSaving(true);
    try {
      await apiService.updateScoringConfig({
        weights: {
          damage_severity: formData.factorWeights.damageSeverity / 100,
          traffic_intensity: formData.factorWeights.trafficIntensity / 100,
          weather_exposure: formData.factorWeights.weatherExposure / 100,
          time_since_last_repair: (formData.factorWeights.repairHistory / 100) * 0.4,
          historical_deterioration: (formData.factorWeights.repairHistory / 100) * 0.3,
          recent_report_frequency: (formData.factorWeights.repairHistory / 100) * 0.3,
        },
        changed_by: currentUser?.name || 'Administrator',
        reason: 'Updated through Municipal Scoring Configuration UI'
      });
    } catch (e) {
      console.warn('Backend scoring config sync notice:', e);
    }
    updateSettings(formData);
    setIsSaving(false);
    addToast('success', 'Configuration Saved', 'Scoring weights and threshold parameters updated.');
  };

  const handleResetConfirm = async () => {
    await resetToEmpty();
    addToast('info', 'Database Reset', 'Cleared all demonstration and active records.');
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      <PageHeader
        title="Platform &amp; Scoring Configuration"
        subtitle="Calibrate risk threshold bands, feature importance scoring weights, notification dispatch rules, and municipal preferences."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30">
            System Administration
          </span>
        }
        actions={
          <>
            <button
              onClick={() => setShowResetModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#FB7185] bg-[#FB7185]/15 border border-[#FB7185]/40 rounded-lg hover:bg-[#FB7185]/25 transition shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear / Reset Data</span>
            </button>
            <button
              onClick={seedDemoData}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#F5F3FF] bg-[#2B2042] border border-[#3B2D53] rounded-lg hover:bg-[#3B2D53] transition shadow-xs"
            >
              <span>Seed 3 Demo Roads</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-lg shadow-xs transition disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </>
        }
      />

      <form onSubmit={handleSave} className="space-y-6 text-xs w-full min-w-0 text-[#F5F3FF]">
        {/* Risk Thresholds Band Configuration */}
        <div className="bg-[#211735] rounded-xl border border-[#3B2D53] shadow-xs p-5 sm:p-6 space-y-4 min-w-0 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#3B2D53] gap-2">
            <div>
              <h3 className="font-bold text-sm text-[#F5F3FF] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#A78BFA]" />
                Urgency Priority Threshold Bands (0–100 Scale)
              </h3>
              <p className="text-[#B9AECF] text-xs mt-0.5">
                Defines the numerical boundaries that classify calculated road risks into Low, Medium, High, or Critical.
              </p>
            </div>
            <span className="text-[10px] text-[#A78BFA] font-bold bg-[#8B5CF6]/15 px-2.5 py-1 rounded-md border border-[#8B5CF6]/30 self-start sm:self-auto">
              Configurable Engine
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
            <div className="p-4 rounded-xl border border-[#34D399]/40 bg-[#34D399]/10 space-y-2 min-w-0">
              <span className="font-bold text-[#34D399] uppercase text-[10px] tracking-wide">Low Priority Max</span>
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
                  className="w-20 p-1.5 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] font-bold text-xs focus:ring-1 focus:ring-[#8B5CF6] focus:border-[#A78BFA]"
                />
                <span className="text-[#34D399] font-mono text-xs">Score 0 &ndash; {formData.riskThresholds.lowMax}</span>
              </div>
              <p className="text-[11px] text-[#B9AECF] leading-snug">Routine scheduled maintenance cycles</p>
            </div>

            <div className="p-4 rounded-xl border border-[#60A5FA]/40 bg-[#60A5FA]/10 space-y-2 min-w-0">
              <span className="font-bold text-[#60A5FA] uppercase text-[10px] tracking-wide">Medium Priority Max</span>
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
                  className="w-20 p-1.5 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] font-bold text-xs focus:ring-1 focus:ring-[#8B5CF6] focus:border-[#A78BFA]"
                />
                <span className="text-[#60A5FA] font-mono text-xs">Score {formData.riskThresholds.lowMax + 1} &ndash; {formData.riskThresholds.mediumMax}</span>
              </div>
              <p className="text-[11px] text-[#B9AECF] leading-snug">Slurry seals and preventive surface crack fills</p>
            </div>

            <div className="p-4 rounded-xl border border-[#FBBF24]/40 bg-[#FBBF24]/10 space-y-2 min-w-0">
              <span className="font-bold text-[#FBBF24] uppercase text-[10px] tracking-wide">High Priority Max</span>
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
                  className="w-20 p-1.5 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] font-bold text-xs focus:ring-1 focus:ring-[#8B5CF6] focus:border-[#A78BFA]"
                />
                <span className="text-[#FBBF24] font-mono text-xs">Score {formData.riskThresholds.mediumMax + 1} &ndash; {formData.riskThresholds.highMax}</span>
              </div>
              <p className="text-[11px] text-[#B9AECF] leading-snug">Structural overlay planning within 90 days</p>
            </div>

            <div className="p-4 rounded-xl border border-[#FB7185]/40 bg-[#FB7185]/10 space-y-2 min-w-0">
              <span className="font-bold text-[#FB7185] uppercase text-[10px] tracking-wide">Critical Priority Min</span>
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
                  className="w-20 p-1.5 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] font-bold text-xs focus:ring-1 focus:ring-[#8B5CF6] focus:border-[#A78BFA]"
                />
                <span className="text-[#FB7185] font-mono text-xs">Score {formData.riskThresholds.criticalMin} &ndash; 100</span>
              </div>
              <p className="text-[11px] text-[#B9AECF] leading-snug">Immediate emergency engineering intervention</p>
            </div>
          </div>
        </div>

        {/* Priority Calculation Weights */}
        <div className="bg-[#211735] rounded-xl border border-[#3B2D53] shadow-xs p-5 sm:p-6 space-y-4 min-w-0 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#3B2D53] gap-2">
            <div>
              <h3 className="font-bold text-sm text-[#F5F3FF] flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#A78BFA]" />
                Feature Importance Scoring Weights (% of Composite Risk)
              </h3>
              <p className="text-[#B9AECF] text-xs mt-0.5">
                Relative weighting factors contributing to the final predictive vulnerability index. Must sum to 100%.
              </p>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full self-start sm:self-auto ${
                totalWeight === 100
                  ? 'bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30'
                  : 'bg-[#FB7185]/15 text-[#FB7185] border border-[#FB7185]/30'
              }`}
            >
              Sum: {totalWeight}% {totalWeight === 100 ? '✓ Balanced' : '⚠️ Must equal 100%'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
            <div className="min-w-0">
              <label className="block font-semibold text-[#B9AECF] mb-1 truncate">Damage Severity &amp; Cracks</label>
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
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] font-semibold focus:ring-1 focus:ring-[#8B5CF6] focus:border-[#A78BFA]"
                />
                <span className="font-bold text-[#B9AECF]">%</span>
              </div>
            </div>

            <div className="min-w-0">
              <label className="block font-semibold text-[#B9AECF] mb-1 truncate">Traffic Volume &amp; Axle Load</label>
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
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] font-semibold focus:ring-1 focus:ring-[#8B5CF6] focus:border-[#A78BFA]"
                />
                <span className="font-bold text-[#B9AECF]">%</span>
              </div>
            </div>

            <div className="min-w-0">
              <label className="block font-semibold text-[#B9AECF] mb-1 truncate">Weather &amp; Monsoon Exposure</label>
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
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] font-semibold focus:ring-1 focus:ring-[#8B5CF6] focus:border-[#A78BFA]"
                />
                <span className="font-bold text-[#B9AECF]">%</span>
              </div>
            </div>

            <div className="min-w-0">
              <label className="block font-semibold text-[#B9AECF] mb-1 truncate">Repair Age &amp; History Gap</label>
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
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] font-semibold focus:ring-1 focus:ring-[#8B5CF6] focus:border-[#A78BFA]"
                />
                <span className="font-bold text-[#B9AECF]">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* General Preferences & Map Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
          {/* General & Environment */}
          <div className="bg-[#211735] rounded-xl border border-[#3B2D53] shadow-xs p-5 space-y-4 min-w-0 overflow-hidden">
            <h3 className="font-bold text-sm text-[#F5F3FF] pb-2 border-b border-[#3B2D53]">
              Operational Preferences
            </h3>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-semibold text-[#F5F3FF] block truncate">Telemetry Auto-Refresh</span>
                  <span className="text-xs text-[#B9AECF]">Background poll interval for sensors &amp; reports</span>
                </div>
                <select
                  value={formData.refreshIntervalSeconds}
                  onChange={e => setFormData({ ...formData, refreshIntervalSeconds: Number(e.target.value) })}
                  className="p-1.5 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] text-xs focus:ring-1 focus:ring-[#8B5CF6] focus:border-[#A78BFA] shrink-0"
                >
                  <option value={15}>15 Seconds</option>
                  <option value={30}>30 Seconds</option>
                  <option value={60}>1 Minute</option>
                  <option value={300}>5 Minutes</option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#3B2D53]">
                <div className="min-w-0">
                  <span className="font-semibold text-[#F5F3FF] block truncate">Default Basemap</span>
                  <span className="text-xs text-[#B9AECF]">MapLibre layer styling</span>
                </div>
                <select
                  value={formData.mapDefaultStyle}
                  onChange={e => setFormData({ ...formData, mapDefaultStyle: e.target.value as any })}
                  className="p-1.5 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] text-xs focus:ring-1 focus:ring-[#8B5CF6] focus:border-[#A78BFA] shrink-0"
                >
                  <option value="standard">Standard Carto Vector</option>
                  <option value="satellite">Satellite Imagery</option>
                  <option value="dark">High-Contrast Dark</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-[#211735] rounded-xl border border-[#3B2D53] shadow-xs p-5 space-y-4 min-w-0 overflow-hidden">
            <h3 className="font-bold text-sm text-[#F5F3FF] pb-2 border-b border-[#3B2D53]">
              Automated Alert Dispatch
            </h3>

            <div className="space-y-3.5">
              <label className="flex items-center justify-between cursor-pointer gap-3">
                <div className="min-w-0">
                  <span className="font-semibold text-[#F5F3FF] block truncate">Critical Distress Dispatch</span>
                  <span className="text-xs text-[#B9AECF]">Instant alerts for severe potholes or washouts</span>
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
                  className="rounded text-[#8B5CF6] focus:ring-[#8B5CF6] w-4 h-4 border-[#3B2D53] bg-[#140E22] shrink-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer gap-3 pt-3 border-t border-[#3B2D53]">
                <div className="min-w-0">
                  <span className="font-semibold text-[#F5F3FF] block truncate">Weekly Executive Digest</span>
                  <span className="text-xs text-[#B9AECF]">Consolidated condition briefing for leadership</span>
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
                  className="rounded text-[#8B5CF6] focus:ring-[#8B5CF6] w-4 h-4 border-[#3B2D53] bg-[#140E22] shrink-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer gap-3 pt-3 border-t border-[#3B2D53]">
                <div className="min-w-0">
                  <span className="font-semibold text-[#F5F3FF] block truncate">Model Drift Notifications</span>
                  <span className="text-xs text-[#B9AECF]">Alert data team when feature divergence exceeds 5%</span>
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
                  className="rounded text-[#8B5CF6] focus:ring-[#8B5CF6] w-4 h-4 border-[#3B2D53] bg-[#140E22] shrink-0"
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
        title="Reset All Database Records?"
        message="This will clear all registered roads, reports, inspections, and work orders in the database, resetting the system to an empty state."
        confirmLabel="Reset Everything"
        cancelLabel="Cancel"
        isDestructive={true}
      />
    </div>
  );
};
