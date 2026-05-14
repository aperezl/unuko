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
  Zap,
  CheckCircle,
  AlertCircle
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
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-sky-500/20"></div>
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">Syncing Digital Twin...</p>
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
      {/* Page Header */}
      <div className="px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/sessions')}
            className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 transition-all group"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center shadow-2xl shadow-sky-500/20 ring-4 ring-sky-500/10">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
              <FileJson className="w-7 h-7 text-white" />
            </motion.div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black tracking-tight text-white uppercase italic">eSIM Activation Monitor</h2>
              <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">
                Live Feed
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em] mt-1">
              SESSION ID: <span className="text-sky-400 font-mono ml-2">{data.sessionId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="flex items-center gap-1 bg-slate-900/50 border border-slate-800 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('table')}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all flex items-center gap-2",
                viewMode === 'table' ? "bg-slate-700 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-tight">Table</span>
            </button>
            <button 
              onClick={() => setViewMode('flow')}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all flex items-center gap-2",
                viewMode === 'flow' ? "bg-slate-700 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <Network className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-tight">Flow</span>
            </button>
          </div>

          <div className="text-right">
            <p className="text-[9px] uppercase tracking-[0.2em] text-slate-600 font-black">Status</p>
            <div className="flex items-center gap-2 justify-end mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <span className="text-emerald-400 font-black text-xs uppercase tracking-widest">{data.status}</span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-800"></div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-[0.2em] text-slate-600 font-black">Transaction</p>
            <p className="text-xs font-bold font-mono text-sky-400 mt-1">{data.context.transactionId || 'PENDING'}</p>
          </div>
        </div>
      </div>

      {/* Monitor Layout */}
      <div className="flex-1 grid grid-cols-12 gap-6 p-8 pt-2 overflow-hidden">
        {/* Left Stats & Categories */}
        <div className="col-span-3 flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide">
          <div className="bg-slate-950/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/50 shadow-2xl">
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-6">Workflow Intelligence</h3>
            <div className="space-y-4">
               {/* Progress Widget */}
               {data.context.segments && (
                <div className="p-4 rounded-2xl bg-sky-500/5 border border-sky-500/10">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[9px] text-sky-400 font-black uppercase tracking-widest">Installation</p>
                    <span className="text-[10px] font-mono text-sky-300 font-bold">
                      {Math.round(((data.context.currentSegmentIndex || 0) / data.context.segments.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-sky-500" animate={{ width: `${((data.context.currentSegmentIndex || 0) / data.context.segments.length) * 100}%` }} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800/50">
                  <p className="text-[8px] font-black uppercase text-slate-600 mb-1">Total Events</p>
                  <p className="text-xl font-black text-white">{stats.total}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800/50">
                  <p className="text-[8px] font-black uppercase text-slate-600 mb-1">Updated</p>
                  <p className="text-xs font-bold text-slate-400">{new Date(data.updatedAt).toLocaleTimeString([], { hour12: false })}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-2">
               <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4 px-2">Log Filtering</h3>
               {[
                 { id: 'all', label: 'All Events', count: stats.total, color: 'bg-slate-500' },
                 { id: 'WORKFLOW', label: 'Workflow', count: stats.workflow, color: 'bg-fuchsia-500' },
                 { id: 'TRANSPORT', label: 'Transport', count: stats.transport, color: 'bg-indigo-500' },
                 { id: 'HARDWARE', label: 'Hardware', count: stats.hardware, color: 'bg-amber-500' },
                 { id: 'NOTIFICATION', label: 'Notification', count: stats.notification, color: 'bg-sky-500' }
               ].map(cat => (
                 <button 
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300",
                    filter === cat.id ? "bg-slate-800 border-slate-600 shadow-lg shadow-black/40" : "bg-transparent border-transparent hover:bg-slate-900/40 text-slate-500 hover:text-slate-300"
                  )}
                 >
                   <div className="flex items-center gap-3">
                     <div className={cn("w-2 h-2 rounded-full", cat.color, filter === cat.id && "shadow-[0_0_8px] shadow-current")} />
                     <span className="text-[10px] font-black uppercase tracking-tight">{cat.label}</span>
                   </div>
                   <span className="text-[10px] font-mono opacity-50">{cat.count}</span>
                 </button>
               ))}
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="col-span-9 bg-slate-950/40 backdrop-blur-xl rounded-3xl border border-slate-800/50 flex flex-col overflow-hidden shadow-2xl">
          {viewMode === 'table' ? (
            <>
              <div className="px-8 py-5 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/20">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                    <ListFilter className="w-4 h-4" />
                   </div>
                   <h3 className="text-[11px] font-black uppercase tracking-[0.1em] text-white">Traceability Log Feed</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 group-focus-within:text-sky-400 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Filter traces..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-[10px] font-bold focus:outline-none focus:border-sky-500/50 w-64 transition-all"
                    />
                  </div>
                  <button className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-slate-500 transition-all">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10 bg-[#0f172a] shadow-xl">
                    <tr className="text-[9px] font-black uppercase text-slate-600 tracking-widest text-left">
                      <th className="px-8 py-4">Timestamp</th>
                      <th className="px-8 py-4">Category</th>
                      <th className="px-8 py-4 text-center">Dir</th>
                      <th className="px-8 py-4">Event Description</th>
                      <th className="px-8 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-[11px] font-mono divide-y divide-slate-800/30">
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

          <div className="h-14 border-t border-slate-800/50 flex items-center justify-between px-8 bg-slate-900/40">
             <div className="flex items-center gap-4">
               <span className="text-[9px] font-black uppercase text-slate-600 tracking-[0.2em]">Payload Inspector</span>
               <div className="h-4 w-px bg-slate-800" />
               <span className="text-[10px] font-mono text-sky-400/80">
                 {selectedLogId ? `EVENT_HASH: ${selectedLogId.substring(0, 16)}` : 'Select an entry to inspect raw telemetry'}
               </span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest italic">Digital Twin Connected</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
