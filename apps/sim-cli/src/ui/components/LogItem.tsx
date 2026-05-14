import React from 'react';
import { format } from 'date-fns';
import { 
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Link as LinkIcon,
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

const CopyButton = ({ text, label }: { text: string; label?: string }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2 py-1 rounded-sm bg-slate-900/60 border border-slate-800/60 hover:bg-slate-800 hover:border-slate-700 transition-all group"
    >
      {copied ? (
        <Check className="w-3 h-3 text-emerald-500" />
      ) : (
        <Copy className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
      )}
      {label && <span className="text-[9px] font-black uppercase text-slate-600 group-hover:text-slate-400 tracking-widest">{label}</span>}
    </button>
  );
};

export const LogItem = ({ log, isSelected, onClick }: LogItemProps) => {
  const [activeTab, setActiveTab] = React.useState<'response' | 'request' | 'headers'>('response');
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

  // Extract structured data if available
  const requestBody = processedPayload?.body || (log.direction === 'OUT' ? processedPayload : null);
  const responseBody = processedPayload?.response || (log.direction === 'IN' ? processedPayload : null);
  const headers = processedPayload?.headers || null;
  const url = processedPayload?.url || null;

  const hexData = responseBody?.apdu || responseBody?.data || 
                 (typeof responseBody === 'string' && /^[0-9A-Fa-f]+$/.test(responseBody) ? responseBody : null);

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
              "text-[10px] font-black uppercase tracking-widest",
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
              <div className="bg-black/40 rounded-sm border border-slate-800/60 shadow-inner flex flex-col">
                
                {/* URL Bar */}
                {url && (
                  <div className="px-4 py-2 border-b border-slate-800/60 bg-slate-900/20 flex items-center justify-between">
                    <div className="flex items-center gap-3 truncate">
                      <p className="text-[7px] uppercase font-black text-slate-700 tracking-widest flex-shrink-0">Signal URI</p>
                      <code className="text-[10px] text-sky-600 bg-black/40 px-2 py-0.5 rounded-sm border border-sky-900/30 truncate font-mono">
                        {url}
                      </code>
                    </div>
                    <CopyButton text={url} label="Copy URL" />
                  </div>
                )}

                {/* Tabs Header */}
                <div className="flex items-center border-b border-slate-800/60 bg-slate-900/10 px-2">
                  {[
                    { id: 'response', label: 'Response Body' },
                    { id: 'request', label: 'Request Body' },
                    { id: 'headers', label: 'Network Headers' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={(e) => { e.stopPropagation(); setActiveTab(tab.id as any); }}
                      className={cn(
                        "px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-colors relative",
                        activeTab === tab.id ? "text-sky-500" : "text-slate-600 hover:text-slate-400"
                      )}
                    >
                      {tab.label}
                      {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />}
                    </button>
                  ))}
                  <div className="flex-1" />
                  <div className="pr-2">
                    <CopyButton 
                      text={JSON.stringify(
                        activeTab === 'response' ? responseBody : 
                        activeTab === 'request' ? requestBody : 
                        headers, 
                        null, 2
                      )} 
                    />
                  </div>
                </div>
                
                {/* Content Area */}
                <div className="p-4 bg-black/20 min-h-[100px]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[7px] uppercase font-black text-slate-700 tracking-widest">
                      {activeTab === 'response' && hexData ? 'Forensic Hex Trace' : 'Source Object'}
                    </p>
                    <span className="text-[7px] font-mono text-slate-800 uppercase">BLOCK_SEQ: {log._id}</span>
                  </div>

                  {activeTab === 'response' && hexData ? (
                    <div className="scale-[0.98] origin-top-left overflow-x-auto">
                      <HexViewer data={hexData} />
                    </div>
                  ) : (
                    <pre className="text-[10px] text-slate-500 font-mono bg-black/40 p-4 rounded-sm border border-slate-900/50 overflow-x-auto">
                      {activeTab === 'response' && responseBody ? JSON.stringify(responseBody, null, 2) : 
                       activeTab === 'request' && requestBody ? JSON.stringify(requestBody, null, 2) :
                       activeTab === 'headers' && headers ? JSON.stringify(headers, null, 2) :
                       '// NO DATA AVAILABLE FOR THIS SEGMENT'}
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
