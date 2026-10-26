import React, { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label: string;
  };
  tooltip?: string;
  isDemo?: boolean;
  highlightCritical?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  tooltip,
  isDemo = true,
  highlightCritical = false,
}) => {
  return (
    <div
      className={`relative bg-white rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${
        highlightCritical ? 'border-red-200 bg-red-50/20' : 'border-[#E2E8F0]'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-[#64748B] uppercase tracking-wider">{title}</span>
            {tooltip && (
              <div className="group relative cursor-pointer text-[#94A3B8] hover:text-[#64748B]">
                <Info className="w-3.5 h-3.5" />
                <div className="pointer-events-none absolute left-1/2 -top-8 -translate-x-1/2 hidden group-hover:block z-20 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[11px] font-normal text-white shadow-lg">
                  {tooltip}
                </div>
              </div>
            )}
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#172033]">{value}</div>
        </div>
        <div
          className={`p-2.5 rounded-lg border ${
            highlightCritical
              ? 'bg-red-50 text-red-600 border-red-100'
              : 'bg-slate-50 text-blue-700 border-slate-200/60'
          }`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
        {trend ? (
          <div className="flex items-center gap-1 font-medium">
            <span
              className={`inline-flex items-center text-xs ${
                trend.isPositive ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {trend.value}
            </span>
            <span className="text-[#94A3B8]">{trend.label}</span>
          </div>
        ) : (
          <span className="text-[#94A3B8]">Telemetry synchronized</span>
        )}

        {isDemo && (
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200">
            Demo Data
          </span>
        )}
      </div>
    </div>
  );
};
