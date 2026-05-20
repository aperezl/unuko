import React from 'react';
import { Search } from 'lucide-react';
import { Input, InputProps } from '../atoms/Input';
import { cn } from '../../lib/utils';

export function SearchInput({ className, ...props }: InputProps) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
      <Input className={cn("pl-9", className)} {...props} />
    </div>
  );
}
