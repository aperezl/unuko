import React from 'react';
import { SessionSummary } from '../types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  ChevronRight,
  Activity,
  Clock,
  Database,
  Plus,
  Trash2,
  AlertTriangle,
  X,
  Download,
  Search,
  Filter
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SessionListProps {
  sessions: SessionSummary[];
  onCreate: (workflow: string) => void;
  onDelete: (id: string) => Promise<void>;
}

export const SessionList = ({ sessions, onCreate, onDelete }: SessionListProps) => {
  const navigate = useNavigate();
  const [sessionToDelete, setSessionToDelete] = React.useState<string | null>(null);
  const [showWorkflowSelector, setShowWorkflowSelector] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  const confirmDelete = async () => {
    if (!sessionToDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(sessionToDelete);
      setSessionToDelete(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredSessions = sessions.filter(s => 
    s.sessionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-8 bg-transparent relative overflow-hidden">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-10">
        {/* Header Section */}
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                <History className="w-5 h-5 text-sky-400" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight uppercase italic">Traceability Engine</h1>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.15em]">Persistence Layer & Session Audit</p>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-sky-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all w-64"
              />
            </div>
            <button
              onClick={() => setShowWorkflowSelector(true)}
              className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-sky-600/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              New Simulation
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/50 flex items-center gap-6 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-lg shadow-indigo-500/5">
              <Database className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-slate-600 tracking-widest mb-1">Stored Traces</p>
              <p className="text-2xl font-black text-white">{sessions.length}</p>
            </div>
          </div>
          <div className="bg-slate-950/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/50 flex items-center gap-6 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/5">
              <Activity className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-slate-600 tracking-widest mb-1">Active Node</p>
              <p className="text-2xl font-black text-white">sim-cli-01</p>
            </div>
          </div>
          <div className="bg-slate-950/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/50 flex items-center gap-6 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-lg shadow-amber-500/5">
              <Clock className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-slate-600 tracking-widest mb-1">Last Sync</p>
              <p className="text-2xl font-black text-white italic">
                {sessions.length > 0 ? format(new Date(sessions[0].updatedAt), 'HH:mm') : '--:--'}
              </p>
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="bg-slate-950/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-slate-800/50 shadow-2xl flex flex-col flex-1 min-h-[400px]">
          <div className="px-8 py-5 border-b border-slate-800/50 bg-slate-900/20 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-slate-600" />
              <h2 className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">Live Persistence Feed</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Storage: MongoDB</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
          </div>

          <div className="divide-y divide-slate-800/30 overflow-y-auto scrollbar-hide">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session, index) => (
                <motion.div
                  key={session.sessionId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="w-full px-8 py-6 flex items-center justify-between hover:bg-slate-900/40 transition-all group relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-center gap-6 flex-1 cursor-pointer" onClick={() => navigate(`/session/${session.sessionId}`)}>
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black border transition-all duration-500 group-hover:scale-110",
                      session.status === 'done' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5" : "bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-sky-500/5"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white group-hover:text-sky-400 transition-colors tracking-tight">{session.sessionId}</h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                           <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight">Status</span>
                           <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest",
                            session.status === 'done' ? "text-emerald-500" : "text-sky-500"
                          )}>{session.status}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-700">|</span>
                        <div className="flex items-center gap-1.5">
                           <Clock className="w-3 h-3 text-slate-600" />
                           <span className="text-[10px] font-bold text-slate-500">{format(new Date(session.updatedAt), 'HH:mm:ss')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right hidden sm:block">
                      <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest mb-1">Trace Date</p>
                      <p className="text-xs font-bold font-mono text-slate-400">{format(new Date(session.updatedAt), 'yyyy-MM-dd')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSessionToDelete(session.sessionId);
                        }}
                        className="w-10 h-10 rounded-xl border border-slate-800 flex items-center justify-center hover:bg-rose-500/10 hover:border-rose-500/50 hover:text-rose-400 text-slate-600 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/session/${session.sessionId}`)}
                        className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-sky-500/10 hover:border-sky-500/50 hover:text-sky-400 text-slate-500 transition-all shadow-xl"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-24 text-center flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center opacity-50">
                  <History className="w-8 h-8 text-slate-700" />
                </div>
                <div>
                  <p className="text-slate-400 font-black text-sm uppercase tracking-widest">No Telemetry Found</p>
                  <p className="text-[10px] text-slate-600 font-bold mt-1 uppercase tracking-tight">System is waiting for a new simulation cycle</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {sessionToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setSessionToDelete(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#020617] rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl p-8"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-lg shadow-rose-500/5">
                  <AlertTriangle className="w-7 h-7 text-rose-500" />
                </div>
                <button onClick={() => setSessionToDelete(null)} disabled={isDeleting} className="p-2 text-slate-500 hover:text-white transition-colors bg-slate-900 rounded-xl border border-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-2xl font-black text-white mb-3 uppercase italic tracking-tight">Purge Session Data?</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-10 font-bold">
                You are about to permanently delete session <span className="text-white font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{sessionToDelete}</span>. This will destroy all forensic telemetry and audit logs.
              </p>

              <div className="flex gap-4">
                <button
                  disabled={isDeleting}
                  onClick={() => setSessionToDelete(null)}
                  className="flex-1 py-4 rounded-2xl border border-slate-800 font-black text-xs text-slate-500 uppercase tracking-widest hover:bg-slate-900 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="flex-1 py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 font-black text-xs text-white uppercase tracking-widest transition-all shadow-xl shadow-rose-600/20 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isDeleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Purge'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Workflow Selector Modal */}
      <AnimatePresence>
        {showWorkflowSelector && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWorkflowSelector(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-3xl bg-[#020617] rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl p-10"
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Initiate Simulation</h3>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Select GSMA SGP.22 Protocol Orchestrator</p>
                </div>
                <button onClick={() => setShowWorkflowSelector(false)} className="p-3 text-slate-500 hover:text-white transition-colors bg-slate-900 rounded-2xl border border-slate-800">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { id: 'provisioning', title: 'Full Provisioning', desc: 'BPP Download & Segmented Install', icon: Download, color: 'sky' },
                  { id: 'inventory', title: 'eUICC Inventory', desc: 'Retrieve Installed Profiles', icon: Database, color: 'indigo' },
                  { id: 'profile-mgmt', title: 'Profile Control', desc: 'Enable / Disable / Delete Profile', icon: Activity, color: 'emerald' },
                  { id: 'notification', title: 'Event Notifier', desc: 'Process Pending ES9+ Events', icon: AlertTriangle, color: 'amber' },
                ].map((wf) => (
                  <button
                    key={wf.id}
                    onClick={() => {
                      onCreate(wf.id);
                      setShowWorkflowSelector(false);
                    }}
                    className="group flex items-center gap-5 p-6 rounded-[2rem] border border-slate-800 bg-slate-950/50 hover:bg-slate-900 hover:border-sky-500/40 transition-all text-left shadow-lg hover:shadow-sky-500/5"
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-[360deg]",
                      wf.color === 'sky' ? "bg-sky-500/10 text-sky-400 group-hover:bg-sky-500 group-hover:text-white" :
                        wf.color === 'indigo' ? "bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white" :
                          wf.color === 'emerald' ? "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white" :
                            "bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-white"
                    )}>
                      <wf.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-white group-hover:text-sky-400 transition-colors uppercase tracking-tight italic">{wf.title}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 tracking-tight">{wf.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
