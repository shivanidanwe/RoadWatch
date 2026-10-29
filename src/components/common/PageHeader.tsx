import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  badge?: ReactNode;
  actions?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, badge, actions }) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#3B2D53] pb-4 min-w-0">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-[#F5F3FF] sm:text-2xl truncate">{title}</h1>
          {badge}
        </div>
        <p className="mt-1 text-xs sm:text-sm text-[#B9AECF] max-w-3xl leading-relaxed">{subtitle}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
};
