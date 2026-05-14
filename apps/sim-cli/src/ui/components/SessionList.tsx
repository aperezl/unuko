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
    <div className="h-full flex flex-col p-6 bg-transparent relative overflow-hidden">
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-6 flex-1 min-h-0">
        {/* Header - Compact */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-sky-900/40 border border-sky-500/30 flex items-center justify-center">
              <History className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h1 className="text-[15px] font-black text-white tracking-tight uppercase">Session Explorer</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Telemetry Database Persistence</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
              <input 
                type="text" 
                placeholder="Find session..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900/60 border border-slate-800/60 rounded-sm pl-8 pr-3 py-1.5 text-[12px] font-medium focus:outline-none focus:border-sky-500/30 transition-colors w-52"
              />
            </div>
            <button
              onClick={() => setShowWorkflowSelector(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-sm font-bold uppercase tracking-wider text-[12px] transition-colors active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              New Simulation
            </button>
          </div>
        </header>

        {/* Stats Grid - High Density */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-950/60 p-4 rounded-sm border border-slate-800/60 flex items-center gap-4">
            <div className="w-10 h-10 rounded-sm bg-slate-900 border border-slate-800 flex items-center justify-center">
              <Database className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-slate-600 tracking-widest">Traces</p>
              <p className="text-xl font-black text-white leading-none mt-1">{sessions.length}</p>
            </div>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-sm border border-slate-800/60 flex items-center gap-4">
            <div className="w-10 h-10 rounded-sm bg-slate-900 border border-slate-800 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-slate-600 tracking-widest">Node</p>
              <p className="text-xl font-black text-white leading-none mt-1 uppercase">sim-cli-01</p>
            </div>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-sm border border-slate-800/60 flex items-center gap-4">
            <div className="w-10 h-10 rounded-sm bg-slate-900 border border-slate-800 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-slate-600 tracking-widest">Sync</p>
              <p className="text-xl font-black text-white leading-none mt-1">
                {sessions.length > 0 ? format(new Date(sessions[0].updatedAt), 'HH:mm:ss') : '--:--:--'}
              </p>
            </div>
          </div>
        </div>

        {/* List Section - Tabular and Sharper with Scroll */}
        <div className="bg-slate-950/60 rounded-sm border border-slate-800/60 flex flex-col flex-1 min-h-0 overflow-hidden mb-6">
          <div className="px-6 py-3 border-b border-slate-800/60 bg-slate-900/40 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-600" />
              <h2 className="text-[11px] uppercase font-black tracking-widest text-slate-500">Telemetry Feed</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">DB: MongoDB</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 shadow-[0_0_5px_rgba(5,150,105,0.4)]" />
            </div>
          </div>

          <div className="divide-y divide-slate-800/40 overflow-y-auto flex-1 scrollbar-hide">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session, index) => (
                <div
                  key={session.sessionId}
                  className="w-full px-6 py-3 flex items-center justify-between hover:bg-slate-900/50 transition-colors group relative"
                >
                  <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => navigate(`/session/${session.sessionId}`)}>
                    <div className={cn(
                      "w-8 h-8 rounded-sm flex items-center justify-center text-[11px] font-black border transition-colors",
                      session.status === 'done' ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" : "bg-sky-500/5 text-sky-500 border-sky-500/20"
                    )}>
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="text-[13px] font-bold text-slate-300 group-hover:text-sky-400 transition-colors font-mono">{session.sessionId}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1.5">
                           <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            session.status === 'done' ? "text-emerald-600" : "text-sky-600"
                          )}>{session.status}</span>
                        </div>
                        <span className="text-slate-800">|</span>
                        <span className="text-[11px] font-bold text-slate-600">{format(new Date(session.updatedAt), 'HH:mm:ss')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-slate-700 uppercase font-black tracking-widest">Captured</p>
                      <p className="text-[11px] font-bold font-mono text-slate-500">{format(new Date(session.updatedAt), 'yyyy-MM-dd')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSessionToDelete(session.sessionId);
                        }}
                        className="p-1.5 rounded-sm border border-slate-800/60 flex items-center justify-center hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-500 text-slate-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => navigate(`/session/${session.sessionId}`)}
                        className="p-1.5 rounded-sm bg-slate-900 border border-slate-800/60 flex items-center justify-center hover:bg-sky-500/10 hover:border-sky-500/30 hover:text-sky-400 text-slate-500 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center flex flex-col items-center gap-4 opacity-30">
                <History className="w-8 h-8 text-slate-600" />
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">No Active Sessions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simplified Modals - Sharper corners */}
      <AnimatePresence>
        {sessionToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80" onClick={() => !isDeleting && setSessionToDelete(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative w-full max-w-sm bg-[#020617] rounded-sm border border-slate-800 p-6 shadow-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-500">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[14px] font-black text-white uppercase tracking-tight">Confirm Deletion</h3>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">Session: <span className="text-slate-300 font-mono">{sessionToDelete}</span></p>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  disabled={isDeleting}
                  onClick={() => setSessionToDelete(null)}
                  className="flex-1 py-2 rounded-sm border border-slate-800 font-bold text-[10px] text-slate-500 uppercase tracking-widest hover:bg-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="flex-1 py-2 rounded-sm bg-rose-700 hover:bg-rose-600 font-bold text-[10px] text-white uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Delete Data'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWorkflowSelector && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80" onClick={() => setShowWorkflowSelector(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="relative w-full max-w-2xl bg-[#020617] rounded-sm border border-slate-800 p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[14px] font-black text-white uppercase tracking-tight">Simulation Engine</h3>
                <button onClick={() => setShowWorkflowSelector(false)} className="p-1.5 text-slate-600 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'provisioning', title: 'Full Provisioning', icon: Download, color: 'sky' },
                  { id: 'inventory', title: 'Inventory Retrieve', icon: Database, color: 'indigo' },
                  { id: 'profile-mgmt', title: 'Profile Control', icon: Activity, color: 'emerald' },
                  { id: 'notification', title: 'Event Processor', icon: AlertTriangle, color: 'amber' },
                ].map((wf) => (
                  <button
                    key={wf.id}
                    onClick={() => {
                      onCreate(wf.id);
                      setShowWorkflowSelector(false);
                    }}
                    className="flex items-center gap-4 p-4 rounded-sm border border-slate-800 bg-slate-950 hover:bg-slate-900 hover:border-sky-500/30 transition-all text-left group"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-sm flex items-center justify-center transition-colors",
                      wf.color === 'sky' ? "bg-sky-500/10 text-sky-500 group-hover:bg-sky-600 group-hover:text-white" :
                        wf.color === 'indigo' ? "bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white" :
                          wf.color === 'emerald' ? "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white" :
                            "bg-amber-500/10 text-amber-500 group-hover:bg-amber-600 group-hover:text-white"
                    )}>
                      <wf.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-white uppercase tracking-tight group-hover:text-sky-400 transition-colors">{wf.title}</h4>
                      <p className="text-[9px] font-medium text-slate-600 uppercase mt-0.5">SGP.22 Handler</p>
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
