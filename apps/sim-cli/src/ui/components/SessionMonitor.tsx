import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  FileJson, 
  ListFilter, 
  Search, 
  Download, 
  LayoutGrid, 
  Network, 
  ArrowLeft,
  Activity
} from 'lucide-react';
import { LogItem } from './LogItem';
import { VisualFlow } from './VisualFlow';
import { SessionData } from '../types';
import { cn } from '../lib/utils';

export const SessionMonitor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = React.useState<SessionData | null>(null);
  const [filter, setFilter] = React.useState<string>('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedLogId, setSelectedLogId] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'table' | 'flow'>('table');

  React.useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const response = await fetch(`/v1/orchestrator/session/${id}`);
        if (!response.ok) throw new Error('Session not found');
        const json = await response.json();
        if (json && json.logs) setData(json);
      } catch (err) {
        console.error('Failed to fetch session data:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [id]);

  if (!data) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-bold text-[10px] uppercase tracking-widest">Synchronizing...</p>
        </div>
      </div>
    );
  }

  const filteredLogs = (data.logs || [])
    .filter(log => filter === 'all' || log.category === filter)
    .filter(log => {
      const desc = log.description || '';
      const payloadStr = log.payload ? JSON.stringify(log.payload) : '';
      const search = searchTerm.toLowerCase();
      return desc.toLowerCase().includes(search) || payloadStr.toLowerCase().includes(search);
    })
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const stats = {
    hardware: (data.logs || []).filter(l => l.category === 'HARDWARE').length,
    transport: (data.logs || []).filter(l => l.category === 'TRANSPORT').length,
    workflow: (data.logs || []).filter(l => l.category === 'WORKFLOW').length,
    notification: (data.logs || []).filter(l => l.category === 'NOTIFICATION').length,
    total: (data.logs || []).length,
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-transparent">
      {/* Page Header - Compact */}
      <div className="px-6 py-3 border-b border-slate-800/60 flex items-center justify-between bg-slate-950/20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/sessions')}
            className="p-1.5 rounded-sm border border-slate-800/60 hover:bg-slate-900 transition-colors text-slate-500 hover:text-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-sm bg-sky-600 flex items-center justify-center shadow-sm">
             <FileJson className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[14px] font-black tracking-tight text-white uppercase">Activation Trace</h2>
              <div className="px-1.5 py-0.5 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                Real-time
              </div>
            </div>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">
              UUID: <span className="text-slate-400 font-mono ml-1">{data.sessionId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex items-center gap-1 p-1 bg-slate-900/40 border border-slate-800/60 rounded-sm">
            <button 
              onClick={() => setViewMode('table')}
              className={cn(
                "px-3 py-1 rounded-sm transition-colors flex items-center gap-2",
                viewMode === 'table' ? "bg-slate-800 text-white shadow-sm" : "text-slate-600 hover:text-slate-300"
              )}
            >
              <LayoutGrid className="w-3 h-3" />
              <span className="text-[11px] font-bold uppercase tracking-tight">Table</span>
            </button>
            <button 
              onClick={() => setViewMode('flow')}
              className={cn(
                "px-3 py-1 rounded-sm transition-colors flex items-center gap-2",
                viewMode === 'flow' ? "bg-slate-800 text-white shadow-sm" : "text-slate-600 hover:text-slate-300"
              )}
            >
              <Network className="w-3 h-3" />
              <span className="text-[11px] font-bold uppercase tracking-tight">Flow</span>
            </button>
          </div>

          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest text-slate-700 font-black">Status</p>
            <div className="flex items-center gap-1.5 justify-end mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 shadow-[0_0_4px_rgba(16,185,129,0.3)]"></div>
              <span className="text-emerald-500 font-black text-[11px] uppercase tracking-widest">{data.status}</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800/60"></div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest text-slate-700 font-black">Context</p>
            <p className="text-[11px] font-bold font-mono text-sky-500 mt-0.5">{data.context.transactionId || 'NOT_SET'}</p>
          </div>
        </div>
      </div>

      {/* Monitor Layout - Reduced paddings and sharper panels */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Side (Stats) - More compact */}
        <div className="col-span-2 flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-hide">
          <div className="bg-slate-950/40 rounded-sm p-4 border border-slate-800/60 flex flex-col">
            <h3 className="text-[10px] font-black uppercase text-slate-700 tracking-widest mb-4">Runtime Engine</h3>
            
            <div className="space-y-4">
               {data.context.segments && (
                <div className="p-3 rounded-sm bg-sky-500/5 border border-sky-500/10">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[9px] text-sky-500 font-black uppercase tracking-widest">Install Progress</p>
                    <span className="text-[10px] font-mono text-sky-400 font-bold">
                      {Math.round(((data.context.currentSegmentIndex || 0) / data.context.segments.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-600 transition-all duration-300" style={{ width: `${((data.context.currentSegmentIndex || 0) / data.context.segments.length) * 100}%` }} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2">
                <div className="p-3 rounded-sm bg-slate-900/40 border border-slate-800/60">
                  <p className="text-[9px] font-black uppercase text-slate-700 mb-1">Total Signals</p>
                  <p className="text-xl font-black text-slate-300">{stats.total}</p>
                </div>
                <div className="p-3 rounded-sm bg-slate-900/40 border border-slate-800/60">
                  <p className="text-[9px] font-black uppercase text-slate-700 mb-1">Last Update</p>
                  <p className="text-[11px] font-bold text-slate-500">{new Date(data.updatedAt).toLocaleTimeString([], { hour12: false })}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-1">
               <h3 className="text-[10px] font-black uppercase text-slate-700 tracking-widest mb-3 px-1">Filters</h3>
               {[
                 { id: 'all', label: 'All Telemetry', count: stats.total, color: 'bg-slate-600' },
                 { id: 'WORKFLOW', label: 'Orchestrator', count: stats.workflow, color: 'bg-fuchsia-600' },
                 { id: 'TRANSPORT', label: 'Network ES9+', count: stats.transport, color: 'bg-indigo-600' },
                 { id: 'HARDWARE', label: 'UICC Traffic', count: stats.hardware, color: 'bg-amber-600' },
                 { id: 'NOTIFICATION', label: 'Async Events', count: stats.notification, color: 'bg-sky-600' }
               ].map(cat => (
                 <button 
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-2 rounded-sm border transition-colors",
                    filter === cat.id ? "bg-slate-900/80 border-slate-700 text-slate-200" : "bg-transparent border-transparent hover:bg-slate-900/40 text-slate-600 hover:text-slate-400"
                  )}
                 >
                   <div className="flex items-center gap-2">
                     <div className={cn("w-1.5 h-1.5 rounded-full", cat.color)} />
                     <span className="text-[10px] font-black uppercase tracking-tight">{cat.label}</span>
                   </div>
                   <span className="text-[10px] font-mono opacity-40">{cat.count}</span>
                 </button>
               ))}
            </div>
          </div>
        </div>

        {/* Right Content (Main View) - High Density Table */}
        <div className="col-span-10 bg-slate-950/40 rounded-sm border border-slate-800/60 flex flex-col overflow-hidden">
          {viewMode === 'table' ? (
            <>
              <div className="px-6 py-2.5 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/20">
                <div className="flex items-center gap-2">
                   <ListFilter className="w-3.5 h-3.5 text-slate-700" />
                   <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Activity Ledger</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-700" />
                    <input 
                      type="text" 
                      placeholder="Filter records..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-slate-950/60 border border-slate-800/80 rounded-sm pl-8 pr-3 py-1 text-[11px] font-bold focus:outline-none focus:border-sky-500/30 w-48 transition-colors"
                    />
                  </div>
                  <button className="p-1 bg-slate-900 hover:bg-slate-800 rounded-sm border border-slate-800/60 text-slate-600 transition-colors">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10 bg-slate-900/95 border-b border-slate-800/60">
                    <tr className="text-[10px] font-black uppercase text-slate-600 tracking-widest text-left">
                      <th className="px-6 py-2.5">Time</th>
                      <th className="px-6 py-2.5">Domain</th>
                      <th className="px-6 py-2.5 text-center w-16">Dir</th>
                      <th className="px-6 py-2.5">Signal Description</th>
                      <th className="px-6 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-[11px] font-mono divide-y divide-slate-800/20">
                    {filteredLogs.map(log => (
                      <LogItem 
                        key={log._id} 
                        log={log} 
                        isSelected={selectedLogId === log._id}
                        onClick={() => setSelectedLogId(selectedLogId === log._id ? null : log._id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <VisualFlow logs={data.logs} selectedId={selectedLogId} onSelect={setSelectedLogId} />
          )}

          <div className="h-10 border-t border-slate-800/60 flex items-center justify-between px-6 bg-slate-900/60">
             <div className="flex items-center gap-3">
               <span className="text-[10px] font-black uppercase text-slate-700 tracking-widest">Telemetry Node</span>
               <div className="h-3 w-px bg-slate-800" />
               <span className="text-[11px] font-mono text-sky-600 font-bold uppercase tracking-tight">
                 {selectedLogId ? `BLOCK_ID: ${selectedLogId.substring(0, 12)}` : 'Awaiting signal selection...'}
               </span>
             </div>
             <div className="flex items-center gap-1.5 opacity-60">
               <div className="w-1 h-1 rounded-full bg-emerald-500" />
               <span className="text-[10px] font-black uppercase text-slate-700 tracking-widest">Digital Twin Active</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
