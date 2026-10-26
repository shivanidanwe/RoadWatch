import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  badge?: ReactNode;
  actions?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, badge, actions }) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E2E8F0] pb-5">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-[#172033] sm:text-2xl">{title}</h1>
          {badge}
        </div>
        <p className="mt-1 text-sm text-[#64748B] max-w-3xl leading-relaxed">{subtitle}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
};
