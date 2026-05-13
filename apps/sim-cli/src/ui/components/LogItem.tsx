import React from 'react';
import { format } from 'date-fns';
import { 
  ChevronDown,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LogEntry } from '../types.js';
import { cn } from '../lib/utils.js';
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
          isSelected && "bg-sky-500/10"
        )}
      >
        <td className="px-6 py-3 text-slate-400 whitespace-nowrap">
          {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
        </td>
        <td className="px-6 py-3">
          <span className={cn(
            "px-2 py-0.5 rounded text-[10px] border uppercase font-bold tracking-tight",
            {
              'bg-indigo-500/10 text-indigo-400 border-indigo-500/20': log.category === 'TRANSPORT',
              'bg-amber-500/10 text-amber-400 border-amber-500/20': log.category === 'HARDWARE',
              'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20': log.category === 'WORKFLOW',
              'bg-sky-500/10 text-sky-400 border-sky-500/20': log.category === 'NOTIFICATION',
              'bg-slate-500/10 text-slate-400 border-slate-500/20': !['TRANSPORT', 'HARDWARE', 'WORKFLOW', 'NOTIFICATION'].includes(log.category)
            }
          )}>
            {log.category}
          </span>
        </td>
        <td className={cn(
          "px-6 py-3 text-center font-bold",
          log.direction === 'IN' ? "text-rose-400" : "text-sky-400"
        )}>
          {log.direction !== 'NONE' ? log.direction : '-'}
        </td>
        <td className="px-6 py-3 text-slate-200">
          <div className="flex items-center gap-2">
            <span className="truncate max-w-[300px]">{log.description}</span>
            <ChevronDown className={cn(
              "w-3 h-3 text-slate-600 transition-transform",
              isSelected && "rotate-180"
            )} />
          </div>
        </td>
        <td className="px-6 py-3">
          <div className="flex items-center gap-2">
            {isError ? (
              <AlertCircle className="w-3 h-3 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-3 h-3 text-emerald-500 opacity-60" />
            )}
            <span className={cn(
              "text-[10px] font-bold uppercase",
              isError ? "text-rose-500" : "text-emerald-500"
            )}>
              {statusText}
            </span>
          </div>
        </td>
      </tr>
      
      {/* Expanded Row for Payload */}
      {isSelected && (
        <tr>
          <td colSpan={5} className="px-6 py-0 border-none">
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pb-6 pt-2">
                <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 shadow-2xl">
                  {log.payload.url && (
                    <div className="mb-3">
                      <p className="text-[9px] uppercase font-bold text-slate-500 mb-1 tracking-widest">Target Endpoint</p>
                      <code className="text-[11px] text-sky-400 bg-sky-400/5 px-2 py-1 rounded border border-sky-400/10 block break-all">
                        {log.payload.url}
                      </code>
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">
                        {hexData ? 'Hexadecimal Trace' : 'Raw Payload Data'}
                      </p>
                      <span className="text-[9px] font-mono text-slate-600">ID: {log._id}</span>
                    </div>
                    {hexData ? (
                      <HexViewer data={hexData} />
                    ) : (
                      <pre className="text-[11px] text-slate-400 font-mono bg-[#05070a] p-4 rounded-lg border border-slate-800/50 overflow-x-auto">
                        {JSON.stringify(processedPayload, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </td>
        </tr>
      )}
    </>
  );
};
