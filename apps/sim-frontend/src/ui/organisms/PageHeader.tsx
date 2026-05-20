import React from 'react';
import { cn } from '../../lib/utils';

interface PageHeaderProps {
  title: string;
  highlight?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  navigation?: React.ReactNode;
}

export function PageHeader({ title, highlight, subtitle, actions, className, navigation }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/10 pb-4", className)}>
      <div>
        <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase flex items-center gap-3">
          {title} {highlight && <span className="text-primary">{highlight}</span>}
          {subtitle && (
            <>
              <div className="h-4 w-px bg-border mx-2 hidden md:block" />
              <span className="text-xs font-mono text-muted-foreground mt-1 hidden md:block">
                {subtitle}
              </span>
            </>
          )}
        </h2>
        {navigation && <div className="flex items-center gap-6 mt-4">{navigation}</div>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  );
}
