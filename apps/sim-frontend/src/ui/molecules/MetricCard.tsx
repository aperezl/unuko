import React from 'react';
import { Card } from '../../components/ui/card';
import { cn } from '../../lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ title, value, description, icon, className }: MetricCardProps) {
  return (
    <Card className={cn("bg-card border border-border shadow-md p-4 relative overflow-hidden", className)}>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{title}</span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-black tracking-tight text-foreground">{value}</span>
      </div>
      {description && <p className="text-[10px] text-muted-foreground mt-1">{description}</p>}
    </Card>
  );
}
