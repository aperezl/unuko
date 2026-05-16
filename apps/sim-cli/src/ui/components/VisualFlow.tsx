import React from 'react';
import { LogEntry } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { 
  Globe, 
  Cpu, 
  ArrowRight, 
  ArrowLeft, 
  Smartphone,
  Zap,
  Network
} from 'lucide-react';

interface VisualFlowProps {
  logs: LogEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const VisualFlow = ({ logs, selectedId, onSelect }: VisualFlowProps) => {
  // Sort logs by time ascending for the sequence
  const sortedLogs = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div className="p-6 h-full overflow-y-auto scrollbar-hide bg-background">
      <div className="max-w-3xl mx-auto relative">
        {/* Central timeline spine */}
        <div className="absolute left-1/2 top-4 bottom-4 w-px bg-border -translate-x-1/2 z-0 hidden md:block" />

        {/* Actors header */}
        <div className="flex justify-between items-center mb-10 relative z-10 hidden md:flex px-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-md bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <Network className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">SM-DP+ Server</span>
          </div>

          <div className="flex flex-col items-center gap-2">
             <div className="w-10 h-10 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">eUICC Terminal</span>
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          {sortedLogs.map((log, index) => {
            const isTransport = log.category === 'TRANSPORT';
            const isOut = log.direction === 'OUT';
            const isError = log.payload?.error || log.payload?.success === false;

            return (
              <div
                key={log._id}
                onClick={() => onSelect(log._id)}
                className={cn(
                  "relative flex items-center gap-4 cursor-pointer group",
                  isTransport ? "md:flex-row" : "md:flex-row-reverse"
                )}
              >
                {/* Visual Connector / Bubble */}
                <div className={cn(
                  "flex-1 flex flex-col",
                  isTransport ? "md:items-end md:text-right" : "md:items-start md:text-left"
                )}>
                  <div className={cn(
                    "bg-muted/40 p-2.5 rounded-md border transition-colors duration-150",
                    selectedId === log._id ? "border-primary/50 bg-muted/80" : "border-border",
                    isError && "border-destructive/50 bg-destructive/10"
                  )}>
                    <div className="flex items-center gap-2 mb-1 justify-inherit">
                      {isError && <Zap className="w-2.5 h-2.5 text-destructive" />}
                      <span className={cn(
                        "text-[9px] font-mono font-bold",
                        isTransport ? "text-indigo-500" : "text-amber-500"
                      )}>
                        {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className={cn(
                      "text-[10px] font-bold leading-tight",
                      selectedId === log._id ? "text-foreground" : "text-muted-foreground",
                      isError && "text-destructive"
                    )}>
                      {log.description}
                    </p>
                    
                    {/* Directional Indicator */}
                    <div className={cn(
                      "mt-1.5 flex items-center gap-1.5",
                      isTransport ? "md:justify-end" : "md:justify-start"
                    )}>
                      {isOut ? (
                        <>
                          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter">REQ</span>
                          <ArrowRight className="w-2 h-2 text-muted-foreground" />
                        </>
                      ) : (
                        <>
                          <ArrowLeft className="w-2 h-2 text-muted-foreground" />
                          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter">RES</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Center Node */}
                <div className="relative flex-shrink-0 flex items-center justify-center w-6">
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-none border z-20 transition-all",
                    isTransport ? "bg-indigo-900 border-indigo-500" : "bg-amber-900 border-amber-500",
                    isError && "!bg-destructive !border-destructive",
                    selectedId === log._id && "scale-125 ring-2 ring-primary/20"
                  )} />
                  
                  {/* Step number */}
                  <div className="absolute top-1/2 left-full ml-3 hidden md:block whitespace-nowrap">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter">Step {index + 1}</span>
                  </div>
                </div>

                <div className="flex-1 hidden md:block" />
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-12 flex justify-center gap-6 py-4 border-t border-border opacity-40">
          {[
            { label: 'Relational Sync', color: 'bg-indigo-500' },
            { label: 'Hardware Auth', color: 'bg-amber-500' },
            { label: 'Exceptions', color: 'bg-destructive' }
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={cn("w-1.5 h-1.5 rounded-none", item.color)} />
              <span className="text-[8px] uppercase tracking-widest font-black text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
