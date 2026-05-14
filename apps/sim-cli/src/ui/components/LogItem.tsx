import React from 'react';
import { format } from 'date-fns';
import { 
  ChevronDown,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LogEntry } from '../types';
import { cn } from '../lib/utils';
import { HexViewer } from './HexViewer';

interface LogItemProps {
  log: LogEntry;
  isSelected: boolean;
  onClick: () => void;
}

export const LogItem = ({ log, isSelected, onClick }: LogItemProps) => {
  const isError = log.payload?.error || log.payload?.success === false;

  const statusText = isError 
    ? (log.payload.error || 'ERROR') 
    : (log.direction === 'OUT' ? 'SENT' : '200 OK');

  // Detección y parseo robusto
  let processedPayload = log.payload;
  if (typeof log.payload === 'string' && (log.payload as any).trim().startsWith('{')) {
    try {
      processedPayload = JSON.parse(log.payload);
    } catch (e) {
      // Not JSON
    }
  }

  const hexData = processedPayload?.apdu || processedPayload?.data || 
                 (typeof processedPayload === 'string' && /^[0-9A-Fa-f]+$/.test(processedPayload) ? processedPayload : null);
  
  const isHardware = log.category === 'HARDWARE';

  return (
    <>
      <tr 
        onClick={onClick}
        className={cn(
          "hover:bg-white/5 cursor-pointer transition-colors group",
          isSelected && "bg-sky-500/5"
        )}
      >
        <td className="px-4 py-1.5 text-slate-500 whitespace-nowrap text-[11px]">
          {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
        </td>
        <td className="px-4 py-1.5">
          <span className={cn(
            "px-1.5 py-0.5 rounded-sm text-[10px] border uppercase font-black tracking-widest",
            {
              'bg-indigo-500/5 text-indigo-500 border-indigo-500/20': log.category === 'TRANSPORT',
              'bg-amber-500/5 text-amber-500 border-amber-500/20': log.category === 'HARDWARE',
              'bg-fuchsia-500/5 text-fuchsia-400 border-fuchsia-500/20': log.category === 'WORKFLOW',
              'bg-sky-500/5 text-sky-400 border-sky-500/20': log.category === 'NOTIFICATION',
              'bg-slate-500/5 text-slate-500 border-slate-500/20': !['TRANSPORT', 'HARDWARE', 'WORKFLOW', 'NOTIFICATION'].includes(log.category)
            }
          )}>
            {log.category}
          </span>
        </td>
        <td className={cn(
          "px-4 py-1.5 text-center font-bold text-[11px]",
          log.direction === 'IN' ? "text-rose-500/80" : "text-sky-500/80"
        )}>
          {log.direction !== 'NONE' ? log.direction : '-'}
        </td>
        <td className="px-4 py-1.5 text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <span className="truncate max-w-[500px] text-[12px] font-bold tracking-tight">{log.description}</span>
            <ChevronDown className={cn(
              "w-3 h-3 text-slate-700 transition-transform duration-150",
              isSelected && "rotate-180"
            )} />
          </div>
        </td>
        <td className="px-4 py-1.5">
          <div className="flex items-center gap-1.5">
            {isError ? (
              <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 opacity-40" />
            )}
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest",
              isError ? "text-rose-600" : "text-emerald-700"
            )}>
              {statusText}
            </span>
          </div>
        </td>
      </tr>
      
      {/* Expanded Row for Payload - Sharp and dark */}
      {isSelected && (
        <tr>
          <td colSpan={5} className="px-4 py-0 border-none">
            <div className="overflow-hidden pb-4 pt-1">
              <div className="bg-black/40 rounded-sm border border-slate-800/60 p-3 shadow-inner">
                {log.payload.url && (
                  <div className="mb-2">
                    <p className="text-[7px] uppercase font-black text-slate-700 mb-0.5 tracking-widest">Signal URI</p>
                    <code className="text-[9px] text-sky-600 bg-black/40 px-1.5 py-0.5 rounded-sm border border-sky-900/30 block break-all font-mono">
                      {log.payload.url}
                    </code>
                  </div>
                )}
                
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[7px] uppercase font-black text-slate-700 tracking-widest">
                      {hexData ? 'Forensic Hex Trace' : 'Data Buffer'}
                    </p>
                    <span className="text-[7px] font-mono text-slate-800">SEQUENCE_ID: {log._id}</span>
                  </div>
                  {hexData ? (
                    <div className="scale-[0.95] origin-top-left">
                      <HexViewer data={hexData} />
                    </div>
                  ) : (
                    <pre className="text-[10px] text-slate-500 font-mono bg-black/60 p-3 rounded-sm border border-slate-900 overflow-x-auto scrollbar-hide">
                      {JSON.stringify(processedPayload, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};
