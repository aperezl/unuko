import React from 'react';
import { TableHead } from '../../components/ui/table';
import { cn } from '../../lib/utils';

interface TableHeaderCellProps extends React.ComponentPropsWithoutRef<typeof TableHead> {
  children: React.ReactNode;
  className?: string;
}

export function TableHeaderCell({ children, className, ...props }: TableHeaderCellProps) {
  return (
    <TableHead className={cn("text-[10px] font-black uppercase tracking-wider text-muted-foreground py-3", className)} {...props}>
      {children}
    </TableHead>
  );
}
