import React from 'react';
import { SessionSummary } from '../types.js';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { History, ChevronRight, Activity, Clock, Database } from 'lucide-react';
import { cn } from '../lib/utils.js';

interface SessionListProps {
  sessions: SessionSummary[];
  onSelect: (id: string) => void;
}

export const SessionList = ({ sessions, onSelect }: SessionListProps) => {
  return (
    <div className="flex-1 overflow-hidden flex flex-col p-6 bg-[#0f172a]">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
        {/* Header Section */}
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <History className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Active Sessions</h1>
              <p className="text-sm text-slate-400 font-mono">Traceability Engine Persistence</p>
            </div>
          </div>
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
                <motion.button
                  key={session.sessionId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelect(session.sessionId)}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-800/30 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
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
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-sky-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.button>
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
    </div>
  );
};
