import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  let style = 'bg-[#2B2042] text-[#B9AECF] border-[#3B2D53]';

  if (['Completed', 'Resolved', 'Approved', 'Passed Validated', 'Connected', 'Stable'].includes(status)) {
    style = 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/40';
  } else if (['In Progress', 'Syncing', 'Processing'].includes(status)) {
    style = 'bg-[#60A5FA]/15 text-[#60A5FA] border-[#60A5FA]/40';
  } else if (['Scheduled', 'Verified', 'Under Review', 'Warnings Detected', 'Candidate Staged'].includes(status)) {
    style = 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/40';
  } else if (['Critical', 'Failed Schema Validation', 'Offline', 'Significant Drift — Retraining Recommended', 'Overdue'].includes(status)) {
    style = 'bg-[#FB7185]/15 text-[#FB7185] border-[#FB7185]/40';
  } else if (['Submitted', 'Proposed'].includes(status)) {
    style = 'bg-[#8B5CF6]/15 text-[#C4B5FD] border-[#8B5CF6]/40';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${style} ${className}`}>
      {status}
    </span>
  );
};
