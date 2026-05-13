/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LogEntry } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { 
  Globe, 
  Cpu, 
  ArrowRight, 
  ArrowLeft, 
  Wifi, 
  Smartphone,
  ChevronRight,
  ShieldCheck,
  Zap,
  RefreshCcw,
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
    <div className="p-8 h-full overflow-y-auto scrollbar-hide">
      <div className="max-w-2xl mx-auto relative">
        {/* Central timeline spine */}
        <div className="absolute left-1/2 top-4 bottom-4 w-px bg-slate-800 -translate-x-1/2 z-0 hidden md:block" />

        {/* Actors header */}
        <div className="flex justify-between items-center mb-16 relative z-10 hidden md:flex">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.1)]">
              <Network className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">SM-DP+ Server</span>
          </div>

          <div className="flex flex-col items-center gap-3">
             <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              <Smartphone className="w-6 h-6 text-amber-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">eUICC / Terminal</span>
          </div>
        </div>

        {/* Mobile Header (Simplified) */}
        <div className="md:hidden flex items-center justify-center gap-4 mb-8">
           <div className="flex items-center gap-2">
            <Globe className="w-3 h-3 text-indigo-400" />
            <span className="text-[8px] font-bold uppercase tracking-tighter text-slate-500">Transport</span>
          </div>
          <div className="w-8 h-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <Cpu className="w-3 h-3 text-amber-400" />
            <span className="text-[8px] font-bold uppercase tracking-tighter text-slate-500">Hardware</span>
          </div>
        </div>

        <div className="space-y-6 relative z-10">
          {sortedLogs.map((log, index) => {
            const isTransport = log.category === 'TRANSPORT';
            const isOut = log.direction === 'OUT';
            const isError = log.payload?.error || log.payload?.success === false;

            return (
              <motion.div
                key={log._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
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
                    "glass-card p-3 rounded-xl transition-all duration-300 group-hover:scale-[1.02] group-hover:bg-slate-800/40",
                    selectedId === log._id ? "ring-2 ring-sky-500/50 bg-slate-800/60 shadow-xl shadow-sky-500/10" : "border-slate-800/50",
                    isError && "ring-1 ring-rose-500/50 bg-rose-500/5"
                  )}>
                    <div className="flex items-center gap-2 mb-1 justify-inherit">
                      {isError && <Zap className="w-3 h-3 text-rose-500 animate-pulse" />}
                      <span className={cn(
                        "text-[9px] font-mono",
                        isTransport ? "text-indigo-400" : "text-amber-400"
                      )}>
                        {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                      </span>
                    </div>
                    <p className={cn(
                      "text-[11px] font-medium transition-colors",
                      selectedId === log._id ? "text-white" : "text-slate-300",
                      isError && "text-rose-400"
                    )}>
                      {log.description}
                    </p>
                    
                    {/* Directional Indicator */}
                    <div className={cn(
                      "mt-2 flex items-center gap-2",
                      isTransport ? "md:justify-end" : "md:justify-start"
                    )}>
                      {isOut ? (
                        <>
                          <span className="text-[8px] font-mono text-slate-500 uppercase">Request</span>
                          <ArrowRight className="w-2.5 h-2.5 text-slate-600" />
                        </>
                      ) : (
                        <>
                          <ArrowLeft className="w-2.5 h-2.5 text-slate-600" />
                          <span className="text-[8px] font-mono text-slate-500 uppercase">Response</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Center Node */}
                <div className="relative flex-shrink-0 flex items-center justify-center w-8">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 z-20 transition-all duration-300",
                    isTransport ? "bg-indigo-950 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]" : "bg-amber-950 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]",
                    isError && "!bg-rose-950 !border-rose-500 !shadow-[0_0_15px_rgba(244,63,94,0.5)]",
                    selectedId === log._id && "scale-125 ring-4 ring-white/10"
                  )}>
                    {isError ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[6px] font-bold text-white">!</span>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                         {isTransport ? <Globe className="w-1.5 h-1.5 text-indigo-200" /> : <Cpu className="w-1.5 h-1.5 text-amber-200" />}
                      </div>
                    )}
                  </div>
                  
                  {/* Step number on mobile / side indicator */}
                  <div className="absolute top-1/2 left-full ml-4 hidden md:block whitespace-nowrap">
                    <span className="text-[8px] font-mono text-slate-600 bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-800">STEP {index + 1}</span>
                  </div>
                </div>

                {/* Spacer for vertical center alignment */}
                <div className="flex-1 hidden md:block" />
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-16 flex justify-center gap-8 py-6 border-t border-slate-800/50 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span className="text-[9px] uppercase tracking-widest font-bold">Relational Sync</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-[9px] uppercase tracking-widest font-bold">Hardware Auth</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="text-[9px] uppercase tracking-widest font-bold">Exception Block</span>
          </div>
        </div>
      </div>
    </div>
  );
};
