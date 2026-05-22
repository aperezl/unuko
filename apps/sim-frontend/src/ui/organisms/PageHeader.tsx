import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PageHeaderProps {
  title: string;
  highlight?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  navigation?: React.ReactNode;
  backAction?: () => void;
}

export function PageHeader({ 
  title, 
  highlight, 
  subtitle, 
  actions, 
  className, 
  navigation,
  backAction 
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/10 pb-4", className)}>
      <div>
        <div className="flex items-center gap-3">
          {backAction && (
            <button
              onClick={backAction}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border/40 bg-background hover:bg-muted hover:text-foreground transition-colors cursor-pointer text-muted-foreground"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
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
        </div>
        {navigation && <div className="flex items-center gap-6 mt-4">{navigation}</div>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  );
}

