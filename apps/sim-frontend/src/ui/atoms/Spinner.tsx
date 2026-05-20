import React from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SpinnerProps extends React.ComponentPropsWithoutRef<typeof RefreshCw> {
  className?: string;
  size?: number;
}

export function Spinner({ className, size = 16, ...props }: SpinnerProps) {
  return (
    <RefreshCw
      style={{ width: size, height: size }}
      className={cn("animate-spin text-current", className)}
      {...props}
    />
  );
}
