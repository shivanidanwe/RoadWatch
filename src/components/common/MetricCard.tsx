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
      className={`relative bg-[#211735] rounded-xl border p-4 shadow-sm transition-all hover:border-[#8B5CF6]/50 min-w-0 overflow-hidden flex flex-col justify-between ${
        highlightCritical ? 'border-[#FB7185]/60 bg-rose-950/20' : 'border-[#3B2D53]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] font-semibold text-[#B9AECF] uppercase tracking-wider truncate block">
              {title}
            </span>
            {tooltip && (
              <div className="group relative cursor-pointer text-[#B9AECF]/70 hover:text-[#F5F3FF] shrink-0">
                <Info className="w-3.5 h-3.5" />
                <div className="pointer-events-none absolute left-1/2 -top-8 -translate-x-1/2 hidden group-hover:block z-30 whitespace-nowrap rounded bg-[#140E22] border border-[#3B2D53] px-2 py-1 text-[11px] font-normal text-[#F5F3FF] shadow-xl">
                  {tooltip}
                </div>
              </div>
            )}
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F3FF] truncate">
            {value}
          </div>
        </div>

        <div
          className={`p-2 rounded-lg border shrink-0 ${
            highlightCritical
              ? 'bg-rose-950/40 text-[#FB7185] border-rose-800/40'
              : 'bg-[#2B2042] text-[#A78BFA] border-[#3B2D53]'
          }`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-[#3B2D53] gap-1 min-w-0">
        {trend ? (
          <div className="flex items-center gap-1 font-medium min-w-0 truncate">
            <span
              className={`inline-flex items-center text-[11px] font-semibold shrink-0 ${
                trend.isPositive ? 'text-[#34D399]' : 'text-[#FB7185]'
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-0.5" />
              )}
              {trend.value}
            </span>
            <span className="text-[11px] text-[#B9AECF] truncate">{trend.label}</span>
          </div>
        ) : (
          <span className="text-[11px] text-[#B9AECF]/70 truncate">Database sync</span>
        )}

        {isDemo && (
          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-[#8B5CF6]/15 text-[#A78BFA] rounded border border-[#8B5CF6]/30 shrink-0">
            Live
          </span>
        )}
      </div>
    </div>
  );
};
