import React from 'react';
import { RoadCondition } from '../../types';

interface ConditionBadgeProps {
  condition: RoadCondition;
  className?: string;
  showDot?: boolean;
}

export const ConditionBadge: React.FC<ConditionBadgeProps> = ({ condition, className = '', showDot = true }) => {
  const styles = {
    Good: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Fair: 'bg-blue-50 text-blue-800 border-blue-200',
    Poor: 'bg-amber-50 text-amber-800 border-amber-200',
    Critical: 'bg-rose-50 text-rose-800 border-rose-300',
  }[condition] || 'bg-slate-50 text-slate-700 border-slate-200';

  const dot = {
    Good: 'bg-emerald-500',
    Fair: 'bg-blue-500',
    Poor: 'bg-amber-500',
    Critical: 'bg-rose-600',
  }[condition] || 'bg-slate-400';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${styles} ${className}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
      {condition}
    </span>
  );
};
