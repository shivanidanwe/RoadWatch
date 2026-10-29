import React from 'react';
import { RoadCondition } from '../../types';

interface ConditionBadgeProps {
  condition: RoadCondition;
  className?: string;
  showDot?: boolean;
}

export const ConditionBadge: React.FC<ConditionBadgeProps> = ({ condition, className = '', showDot = true }) => {
  const styles = {
    Good: 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/40',
    Fair: 'bg-[#60A5FA]/15 text-[#60A5FA] border-[#60A5FA]/40',
    Poor: 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/40',
    Critical: 'bg-[#FB7185]/15 text-[#FB7185] border-[#FB7185]/40',
  }[condition] || 'bg-[#2B2042] text-[#B9AECF] border-[#3B2D53]';

  const dot = {
    Good: 'bg-[#34D399]',
    Fair: 'bg-[#60A5FA]',
    Poor: 'bg-[#FBBF24]',
    Critical: 'bg-[#FB7185]',
  }[condition] || 'bg-[#B9AECF]';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${styles} ${className}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
      {condition}
    </span>
  );
};
