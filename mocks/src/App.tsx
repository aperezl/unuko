/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SessionData } from './types';
import { LogItem } from './components/LogItem';
import { motion } from 'motion/react';
import { FileJson, ListFilter, Search, Download, LayoutGrid, Network } from 'lucide-react';
import { cn } from './lib/utils';
import { VisualFlow } from './components/VisualFlow';

const INITIAL_DATA: SessionData = {
  "sessionId": "session_demo_gd1",
  "status": "done",
  "context": {
    "step": 0,
    "error": null,
    "transactionId": "abc-123-transaction-id"
  },
  "logs": [
    {
      "_id": "6a0458240d5b4bae02952d44",
      "sessionId": "session_demo_gd1",
      "category": "HARDWARE",
      "direction": "IN",
      "payload": {
        "data": "",
        "sw": "",
        "success": false,
        "error": "READER_ERROR"
      },
      "description": "APDU Response",
      "timestamp": "2026-05-13T10:53:24.149Z"
    },
    {
      "_id": "6a0458240d5b4bae02952d43",
      "sessionId": "session_demo_gd1",
      "category": "HARDWARE",
      "direction": "OUT",
      "payload": {
        "apdu": "80E2910006BF3E035F2D01"
      },
      "description": "APDU Command",
      "timestamp": "2026-05-13T10:53:24.148Z"
    },
    {
      "_id": "6a0458240d5b4bae02952d42",
      "sessionId": "session_demo_gd1",
      "category": "TRANSPORT",
      "direction": "IN",
      "payload": {
        "transactionId": "abc-123-transaction-id",
        "boundProfilePackage": "MOCK_BOUND_PROFILE_PACKAGE_DATA"
      },
      "description": "HTTP Response from /gsma/rsp2/es9plus/getBoundProfilePackage",
      "timestamp": "2026-05-13T10:53:24.146Z"
    },
    {
      "_id": "6a0458240d5b4bae02952d41",
      "sessionId": "session_demo_gd1",
      "category": "TRANSPORT",
      "direction": "OUT",
      "payload": {
        "url": "http://localhost:8080/gsma/rsp2/es9plus/getBoundProfilePackage",
        "headers": null,
        "body": {
          "transactionId": "abc-123-transaction-id"
        }
      },
      "description": "HTTP POST Request to /gsma/rsp2/es9plus/getBoundProfilePackage",
      "timestamp": "2026-05-13T10:53:24.143Z"
    },
    {
      "_id": "6a0458240d5b4bae02952d40",
      "sessionId": "session_demo_gd1",
      "category": "TRANSPORT",
      "direction": "IN",
      "payload": {
        "transactionId": "abc-123-transaction-id",
        "serverSignedData": {
          "transactionId": "abc-123-transaction-id",
          "smdpAddress": "localhost",
          "euiccChallenge": "dW51a28tY2hhbGxlbmdl"
        },
        "serverSignature1": "MOCK_SIGNATURE_DATA",
        "euiccCertificate": "MOCK_EUICC_CERT"
      },
      "description": "HTTP Response from /gsma/rsp2/es9plus/initiateAuthentication",
      "timestamp": "2026-05-13T10:53:24.141Z"
    },
    {
      "_id": "6a0458240d5b4bae02952d3f",
      "sessionId": "session_demo_gd1",
      "category": "TRANSPORT",
      "direction": "OUT",
      "payload": {
        "url": "http://localhost:8080/gsma/rsp2/es9plus/initiateAuthentication",
        "headers": null,
        "body": {
          "euiccChallenge": "dW51a28tY2hhbGxlbmdl",
          "smdpAddress": "localhost"
        }
      },
      "description": "HTTP POST Request to /gsma/rsp2/es9plus/initiateAuthentication",
      "timestamp": "2026-05-13T10:53:24.114Z"
    },
    {
      "_id": "6a0458240d5b4bae02952d3e",
      "sessionId": "session_demo_gd1",
      "category": "HARDWARE",
      "direction": "OUT",
      "payload": {

      },
      "description": "Hardware Reset Request",
      "timestamp": "2026-05-13T10:53:24.109Z"
    }
  ],
  "updatedAt": "2026-05-13T10:53:28.331Z"
};

export default function App() {
  const [data] = React.useState<SessionData>(INITIAL_DATA);
  const [filter, setFilter] = React.useState<string>('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedLogId, setSelectedLogId] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'table' | 'flow'>('table');

  const filteredLogs = data.logs
    .filter(log => filter === 'all' || log.category === filter)
    .filter(log => 
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.payload).toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const stats = {
    hardware: data.logs.filter(l => l.category === 'HARDWARE').length,
    transport: data.logs.filter(l => l.category === 'TRANSPORT').length,
    total: data.logs.length,
    executionTime: "4.18", // Mocked as per design
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[#0f172a] text-slate-200">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 glass-card border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-center gap-4">
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
            <p className="text-sm font-medium font-mono text-sky-400">{data.context.transactionId}</p>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Sidebar */}
        <aside className="md:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
          <div className="glass-card rounded-2xl p-4 flex flex-col gap-3">
            <h2 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Overview</h2>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/50 transition-all hover:bg-slate-800/50">
                <p className="text-xs text-slate-400 mb-1">Total Events</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <span className="text-xs font-normal text-slate-500 lowercase">Steps</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/50 transition-all hover:bg-slate-800/50">
                <p className="text-xs text-slate-400 mb-1">Execution Time</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{stats.executionTime}</p>
                  <span className="text-xs font-normal text-slate-500 lowercase">Seconds</span>
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
            </div>
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


