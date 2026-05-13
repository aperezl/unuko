import React from 'react';
import { SessionSummary } from '../types.js';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
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
  Download
} from 'lucide-react';
import { cn } from '../lib/utils.js';

interface SessionListProps {
  sessions: SessionSummary[];
  onSelect: (id: string) => void;
  onCreate: (workflow: string) => void;
  onDelete: (id: string) => Promise<void>;
}

export const SessionList = ({ sessions, onSelect, onCreate, onDelete }: SessionListProps) => {
  const [sessionToDelete, setSessionToDelete] = React.useState<string | null>(null);
  const [showWorkflowSelector, setShowWorkflowSelector] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

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

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-6 bg-[#0f172a] relative">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
        {/* Header Section */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <History className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Active Sessions</h1>
              <p className="text-sm text-slate-400 font-mono">Traceability Engine Persistence</p>
            </div>
          </div>

          <button
            onClick={() => setShowWorkflowSelector(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-sky-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Simulation
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Stored Traces</p>
              <p className="text-xl font-bold text-white">{sessions.length}</p>
            </div>
          </div>
          <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Active Node</p>
              <p className="text-xl font-bold text-white">sim-cli-01</p>
            </div>
          </div>
          <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Last Update</p>
              <p className="text-xl font-bold text-white">
                {sessions.length > 0 ? format(new Date(sessions[0].updatedAt), 'HH:mm') : '--:--'}
              </p>
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-800/50 shadow-2xl">
          <div className="px-6 py-4 border-b border-slate-800/50 bg-slate-900/40 flex justify-between items-center">
            <h2 className="text-xs uppercase font-bold tracking-widest text-slate-500">Persistence Feed</h2>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-slate-400 uppercase">MongoDB Connected</span>
            </div>
          </div>

          <div className="divide-y divide-slate-800/50">
            {sessions.length > 0 ? (
              sessions.map((session, index) => (
                <motion.div
                  key={session.sessionId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-800/30 transition-all group text-left"
                >
                  <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => onSelect(session.sessionId)}>
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border",
                      session.status === 'done' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">{session.sessionId}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">Status:</span>
                        <span className={cn(
                          "text-[10px] font-bold uppercase",
                          session.status === 'done' ? "text-emerald-500" : "text-sky-500"
                        )}>{session.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Last Activity</p>
                      <p className="text-xs font-mono text-slate-300">{format(new Date(session.updatedAt), 'yyyy-MM-dd HH:mm:ss')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSessionToDelete(session.sessionId);
                        }}
                        className="w-9 h-9 rounded-lg border border-slate-700 flex items-center justify-center hover:bg-rose-500/10 hover:border-rose-500/50 hover:text-rose-400 text-slate-500 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onSelect(session.sessionId)}
                        className="w-9 h-9 rounded-lg border border-slate-700 flex items-center justify-center hover:bg-sky-500/10 hover:border-sky-500/50 hover:text-sky-400 text-slate-500 transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-20 text-center flex flex-col items-center gap-4">
                <History className="w-12 h-12 text-slate-700" />
                <p className="text-slate-500 font-mono text-sm">No sessions found in database</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {sessionToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setSessionToDelete(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md glass-card rounded-3xl border border-slate-700 overflow-hidden shadow-2xl"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-rose-500" />
                  </div>
                  <button
                    onClick={() => setSessionToDelete(null)}
                    disabled={isDeleting}
                    className="p-1 text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">Delete Session?</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  This will permanently remove <span className="text-white font-mono">{sessionToDelete}</span> and all its associated audit logs. This action cannot be undone.
                </p>

                <div className="flex gap-3">
                  <button
                    disabled={isDeleting}
                    onClick={() => setSessionToDelete(null)}
                    className="flex-1 py-3 rounded-xl border border-slate-700 font-bold text-sm text-slate-300 hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isDeleting}
                    onClick={confirmDelete}
                    className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 font-bold text-sm text-white transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Delete Forever'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Workflow Selector Modal */}
      <AnimatePresence>
        {showWorkflowSelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWorkflowSelector(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl glass-card rounded-3xl border border-slate-700 overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Select Protocol Flow</h3>
                    <p className="text-slate-400 text-sm">GSMA SGP.22 Consumer RSP State Machines</p>
                  </div>
                  <button
                    onClick={() => setShowWorkflowSelector(false)}
                    className="p-2 text-slate-500 hover:text-white transition-colors bg-slate-800 rounded-xl"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'provisioning', title: 'Full Provisioning', desc: 'Complete BPP download and segmented installation.', icon: Download, color: 'sky' },
                    { id: 'inventory', title: 'eUICC Inventory', desc: 'Retrieve and parse installed profiles from the card.', icon: Database, color: 'indigo' },
                    { id: 'profile-mgmt', title: 'Profile Management', desc: 'Enable, Disable or Delete existing profiles.', icon: Activity, color: 'emerald' },
                    { id: 'notification', title: 'Notification Handle', desc: 'Process pending events and notify SM-DP+.', icon: AlertTriangle, color: 'amber' },
                    { id: 'test-services', title: 'Test Connectivity', desc: 'Verify connection to SM-DP+, Open5GS and UERANSIM.', icon: Activity, color: 'rose' },
                  ].map((wf) => (
                    <button
                      key={wf.id}
                      onClick={() => {
                        onCreate(wf.id);
                        setShowWorkflowSelector(false);
                      }}
                      className="group flex flex-col gap-3 p-5 rounded-2xl border border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:border-sky-500/50 transition-all text-left"
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                        wf.color === 'sky' ? "bg-sky-500/10 text-sky-400 group-hover:bg-sky-500 group-hover:text-white" :
                          wf.color === 'indigo' ? "bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white" :
                            wf.color === 'emerald' ? "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white" :
                              "bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-white"
                      )}>
                        <wf.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white group-hover:text-sky-400 transition-colors">{wf.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed mt-1">{wf.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
