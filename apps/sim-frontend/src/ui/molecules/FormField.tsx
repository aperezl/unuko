import React from 'react';
import { Label } from '../../components/ui/label';
import { cn } from '../../lib/utils';

interface FormFieldProps {
  label: string;
  error?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, error, description, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5 w-full", className)}>
      <Label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">{label}</Label>
      {description && <p className="text-[10px] text-muted-foreground leading-normal">{description}</p>}
      <div className="relative">{children}</div>
      {error && <p className="text-[10px] font-medium text-destructive">{error}</p>}
    </div>
  );
}
