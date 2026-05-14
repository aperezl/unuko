/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SessionData, SessionSummary } from './types';
import { LogItem } from './components/LogItem';
import { motion } from 'motion/react';
import { FileJson, ListFilter, Search, Download, LayoutGrid, Network, ArrowLeft } from 'lucide-react';
import { cn } from './lib/utils';
import { VisualFlow } from './components/VisualFlow';
import { SessionList } from './components/SessionList';

export default function App() {
  const [sessions, setSessions] = React.useState<SessionSummary[]>([]);
  const [selectedSessionId, setSelectedSessionId] = React.useState<string | null>(null);
  const [data, setData] = React.useState<SessionData | null>(null);
  const [filter, setFilter] = React.useState<string>('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedLogId, setSelectedLogId] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'table' | 'flow'>('table');

  // Fetch session list
  React.useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('/v1/orchestrator/sessions');
        const json = await response.json();
        setSessions(json);
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
      }
    };

    if (!selectedSessionId) {
      fetchSessions();
      const interval = setInterval(fetchSessions, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedSessionId]);

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/v1/orchestrator/session/${sessionId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        // Actualizar lista local inmediatamente
        setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const handleCreateSession = async (workflow: string = 'provisioning') => {
    try {
      const response = await fetch('/v1/orchestrator/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow })
      });
      const json = await response.json();
      if (json.sessionId) {
        setSelectedSessionId(json.sessionId);
      }
    } catch (err) {
      console.error('Failed to create new session:', err);
    }
  };

  // Fetch selected session data
  React.useEffect(() => {
    if (!selectedSessionId) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`/v1/orchestrator/session/${selectedSessionId}`);
        if (!response.ok) {
          throw new Error(`Session data not found: ${response.status}`);
        }
        const json = await response.json();
        if (json && json.logs) {
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch session data:', err);
        // Do not reset data here, keep showing old data if available or loading screen if never fetched
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [selectedSessionId]);

  if (!selectedSessionId) {
    return <SessionList 
      sessions={sessions} 
      onSelect={setSelectedSessionId} 
      onCreate={handleCreateSession} 
      onDelete={handleDeleteSession}
    />;
  }

  if (!data || !data.logs) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0f172a] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Initializing Digital Twin...</p>
          <button 
            onClick={() => setSelectedSessionId(null)}
            className="mt-4 text-[10px] text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest border border-slate-800 px-4 py-2 rounded-full"
          >
            Cancel and Return
          </button>
        </div>
      </div>
    );
  }

  const filteredLogs = (data.logs || [])
    .filter(log => filter === 'all' || log.category === filter)
    .filter(log => 
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.payload && JSON.stringify(log.payload).toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Auto-scroll removed temporarily

  const stats = {
    hardware: (data.logs || []).filter(l => l.category === 'HARDWARE').length,
    transport: (data.logs || []).filter(l => l.category === 'TRANSPORT').length,
    workflow: (data.logs || []).filter(l => l.category === 'WORKFLOW').length,
    notification: (data.logs || []).filter(l => l.category === 'NOTIFICATION').length,
    total: (data.logs || []).length,
    executionTime: "4.18", // Mocked as per design
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[#0f172a] text-slate-200">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 glass-card border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedSessionId(null)}
            className="w-10 h-10 rounded-xl border border-slate-700 flex items-center justify-center hover:bg-slate-800 transition-all group"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <FileJson className="w-6 h-6 text-white" />
            </motion.div>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">eSIM Activation Monitor</h1>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tight">SESSION: {data.sessionId}</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 mr-4 bg-slate-900 border border-slate-700 rounded-lg p-0.5">
            <button 
              onClick={() => setViewMode('table')}
              className={cn(
                "p-1.5 rounded-md transition-all flex items-center gap-2",
                viewMode === 'table' ? "bg-slate-700 text-white shadow-lg" : "text-slate-500 hover:text-slate-400"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-tight pr-1">Table</span>
            </button>
            <button 
              onClick={() => setViewMode('flow')}
              className={cn(
                "p-1.5 rounded-md transition-all flex items-center gap-2",
                viewMode === 'flow' ? "bg-slate-700 text-white shadow-lg" : "text-slate-500 hover:text-slate-400"
              )}
            >
              <Network className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-tight pr-1">Flow</span>
            </button>
          </div>

          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Status</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-400 font-bold text-sm uppercase">{data.status}</span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-slate-700"></div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Transaction ID</p>
            <p className="text-sm font-medium font-mono text-sky-400">{data.context.transactionId || 'NOT_ASSIGNED'}</p>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Sidebar */}
        <aside className="md:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
          <div className="glass-card rounded-2xl p-4 flex flex-col gap-3">
            <h2 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Workflow Status</h2>
            <div className="space-y-3">
              {/* Segmented Progress Widget */}
              {data.context.segments && data.context.segments.length > 0 && (
                <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] text-sky-300 font-bold uppercase">Installation Progress</p>
                    <span className="text-[10px] font-mono text-sky-400">
                      {Math.round(((data.context.currentSegmentIndex || 0) / data.context.segments.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-sky-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${((data.context.currentSegmentIndex || 0) / data.context.segments.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-slate-500 mt-2 font-mono">
                    Segment {data.context.currentSegmentIndex} of {data.context.segments.length}
                  </p>
                </div>
              )}

              {/* Profile Inventory Widget */}
              {data.context.profiles && data.context.profiles.length > 0 && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <p className="text-[10px] text-indigo-300 font-bold uppercase mb-3">Detected Profiles</p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-hide">
                    {data.context.profiles.map((p, i) => (
                      <div key={i} className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-white truncate max-w-[100px]">{p.name}</span>
                          <span className="text-[8px] font-mono text-slate-500">{p.iccid.substring(0, 10)}...</span>
                        </div>
                        <span className={cn(
                          "text-[8px] px-1.5 py-0.5 rounded uppercase font-bold",
                          p.status === 'enabled' ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-400"
                        )}>
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/50 transition-all hover:bg-slate-800/50">
                <p className="text-xs text-slate-400 mb-1">Total Events</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <span className="text-xs font-normal text-slate-500 lowercase">Steps</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/50 transition-all hover:bg-slate-800/50">
                <p className="text-xs text-slate-400 mb-1">Last Update</p>
                <p className="text-sm font-mono text-slate-300">{new Date(data.updatedAt).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex-1 overflow-hidden flex flex-col">
            <h2 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-4">Categories</h2>
            <div className="space-y-2">
              <button 
                onClick={() => setFilter('all')}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-left",
                  filter === 'all' ? "bg-slate-700 border-slate-500 text-white" : "bg-slate-800/30 border-transparent hover:bg-slate-800/60"
                )}
              >
                <span className="text-xs font-medium">All Events</span>
                <span className="text-[10px] font-mono">{stats.total}</span>
              </button>
              
              <button 
                onClick={() => setFilter('WORKFLOW')}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-lg border transition-all",
                  filter === 'WORKFLOW' ? "bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-100" : "bg-fuchsia-500/5 border-transparent hover:bg-fuchsia-500/10 text-fuchsia-300"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.5)]"></div>
                  <span className="text-xs font-medium">WORKFLOW</span>
                </div>
                <span className="text-[10px] font-mono">{stats.workflow}</span>
              </button>

              <button 
                onClick={() => setFilter('TRANSPORT')}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-lg border transition-all",
                  filter === 'TRANSPORT' ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-100" : "bg-indigo-500/5 border-transparent hover:bg-indigo-500/10 text-indigo-300"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                  <span className="text-xs font-medium">TRANSPORT</span>
                </div>
                <span className="text-[10px] font-mono">{stats.transport}</span>
              </button>
              
              <button 
                onClick={() => setFilter('HARDWARE')}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-lg border transition-all",
                  filter === 'HARDWARE' ? "bg-amber-500/20 border-amber-500/40 text-amber-100" : "bg-amber-500/5 border-transparent hover:bg-amber-500/10 text-amber-300"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                  <span className="text-xs font-medium">HARDWARE</span>
                </div>
                <span className="text-[10px] font-mono">{stats.hardware}</span>
              </button>

              <button 
                onClick={() => setFilter('NOTIFICATION')}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-lg border transition-all",
                  filter === 'NOTIFICATION' ? "bg-sky-500/20 border-sky-500/40 text-sky-100" : "bg-sky-500/5 border-transparent hover:bg-sky-500/10 text-sky-300"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]"></div>
                  <span className="text-xs font-medium">NOTIFICATION</span>
                </div>
                <span className="text-[10px] font-mono">{stats.notification}</span>
              </button>            </div>
          </div>
        </aside>

        {/* Content Area */}
        <section className="md:col-span-9 glass-card rounded-2xl flex flex-col overflow-hidden">
          {viewMode === 'table' ? (
            <>
              <div className="px-6 py-4 border-b border-slate-700/50 flex flex-wrap justify-between items-center gap-4 bg-slate-900/40">
                <h2 className="text-sm font-bold flex items-center gap-2 text-white">
                  <ListFilter className="w-4 h-4 text-sky-400" />
                  Traceability Log Feed
                </h2>
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Filter events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-[10px] focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all w-full md:w-[180px]"
                    />
                  </div>
                  <button className="p-2 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors text-slate-400">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto relative scrollbar-hide">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-[#1e293b] border-b border-slate-700/50">
                    <tr className="text-[10px] uppercase text-slate-500 tracking-wider">
                      <th className="px-6 py-3 font-bold">Timestamp</th>
                      <th className="px-6 py-3 font-bold">Category</th>
                      <th className="px-6 py-3 font-bold text-center">DIR</th>
                      <th className="px-6 py-3 font-bold">Description</th>
                      <th className="px-6 py-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-[12px] font-mono divide-y divide-slate-800/50">
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((log) => (
                        <LogItem 
                          key={log._id} 
                          log={log} 
                          isSelected={selectedLogId === log._id}
                          onClick={() => setSelectedLogId(selectedLogId === log._id ? null : log._id)}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-20 text-center text-slate-500">
                          No events found matching your criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <VisualFlow 
              logs={data.logs.filter(log => filter === 'all' || log.category === filter)} 
              selectedId={selectedLogId}
              onSelect={setSelectedLogId}
            />
          )}

          {/* Footer Info / Payload Inspector */}
          <div className="px-6 py-3 glass-card border-t border-slate-700/50 flex items-center justify-between bg-slate-900/60">
            <div className="flex gap-4 items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payload Inspector</span>
              <div className="h-4 w-[1px] bg-slate-700"></div>
              <span className="text-[10px] font-mono text-sky-400 truncate max-w-[200px]">
                {selectedLogId ? `ID: ${selectedLogId}` : 'Select a row to inspect'}
              </span>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">System Online</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}


