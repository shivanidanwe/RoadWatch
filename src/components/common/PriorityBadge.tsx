import React from 'react';
import { PriorityLevel } from '../../types';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const styles = {
    Critical: 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-600/10',
    High: 'bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-600/10',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-600/10',
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-600/10',
  }[priority] || 'bg-slate-50 text-slate-700 border-slate-200';

  const dotColors = {
    Critical: 'bg-red-600',
    High: 'bg-orange-500',
    Medium: 'bg-amber-500',
    Low: 'bg-emerald-500',
  }[priority] || 'bg-slate-400';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors}`} aria-hidden="true" />
      {priority} Priority
    </span>
  );
};
