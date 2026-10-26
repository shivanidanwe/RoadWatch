import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  let style = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['Completed', 'Resolved', 'Approved', 'Passed Validated', 'Connected', 'Stable'].includes(status)) {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-600/10';
  } else if (['In Progress', 'Syncing', 'Processing'].includes(status)) {
    style = 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-600/10';
  } else if (['Scheduled', 'Verified', 'Under Review', 'Warnings Detected', 'Candidate Staged'].includes(status)) {
    style = 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-600/10';
  } else if (['Critical', 'Failed Schema Validation', 'Offline', 'Significant Drift — Retraining Recommended', 'Overdue'].includes(status)) {
    style = 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-600/10';
  } else if (['Submitted', 'Proposed'].includes(status)) {
    style = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${style} ${className}`}>
      {status}
    </span>
  );
};
