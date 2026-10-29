import React from 'react';
import { PriorityLevel } from '../../types';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const styles = {
    Critical: 'bg-[#FB7185]/15 text-[#FB7185] border-[#FB7185]/40',
    High: 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/40',
    Medium: 'bg-[#60A5FA]/15 text-[#60A5FA] border-[#60A5FA]/40',
    Low: 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/40',
  }[priority] || 'bg-[#2B2042] text-[#B9AECF] border-[#3B2D53]';

  const dotColors = {
    Critical: 'bg-[#FB7185]',
    High: 'bg-[#FBBF24]',
    Medium: 'bg-[#60A5FA]',
    Low: 'bg-[#34D399]',
  }[priority] || 'bg-[#B9AECF]';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors}`} aria-hidden="true" />
      {priority}
    </span>
  );
};
