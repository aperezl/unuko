import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileJson, 
  ListFilter, 
  Download, 
  LayoutGrid, 
  Network, 
  ArrowLeft
} from 'lucide-react';
import { LogItem } from '../../components/LogItem';
import { VisualFlow } from '../../components/VisualFlow';
import { SessionData } from '../../core/domain/session.types';
import { cn } from '../../lib/utils';
import { Button } from '../atoms/Button';
import { Spinner } from '../atoms/Spinner';
import { TableHeaderCell } from '../molecules/TableHeaderCell';
import { PageHeader } from '../organisms/PageHeader';
import { SearchInput } from '../molecules/SearchInput';
import { sessionRepository } from '../../infrastructure/adapters/HttpSessionRepository';
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableCell
} from "../../components/ui/table";

export const SessionMonitorPage = () => {
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
        const json = await sessionRepository.getSession(id);
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
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="w-8 h-8 text-primary" />
          <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">Synchronizing...</p>
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
    <div className="h-full flex flex-col overflow-hidden bg-transparent animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="px-6 py-3 border-b border-border flex items-center justify-between bg-card/50">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline"
            size="icon"
            onClick={() => navigate('/sessions')}
            className="w-8 h-8 rounded-sm text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-8 h-8 rounded-sm bg-primary flex items-center justify-center shadow-sm">
             <FileJson className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[14px] font-black tracking-tight text-foreground uppercase">Activation Trace</h2>
              <div className="px-1.5 py-0.5 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">
                Real-time
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
              UUID: <span className="text-muted-foreground font-mono ml-1">{data.sessionId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex items-center gap-1 p-1 bg-muted/50 border border-border rounded-sm">
            <button 
              onClick={() => setViewMode('table')}
              className={cn(
                "px-3 py-1 rounded-sm transition-colors flex items-center gap-2 cursor-pointer",
                viewMode === 'table' ? "bg-card border border-border shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="w-3 h-3" />
              <span className="text-[11px] font-bold uppercase tracking-tight">Table</span>
            </button>
            <button 
              onClick={() => setViewMode('flow')}
              className={cn(
                "px-3 py-1 rounded-sm transition-colors flex items-center gap-2 cursor-pointer",
                viewMode === 'flow' ? "bg-card border border-border shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Network className="w-3 h-3" />
              <span className="text-[11px] font-bold uppercase tracking-tight">Flow</span>
            </button>
          </div>

          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-black">Status</p>
            <div className="flex items-center gap-1.5 justify-end mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 shadow-[0_0_4px_rgba(16,185,129,0.3)]"></div>
              <span className="text-emerald-500 font-black text-[11px] uppercase tracking-widest">{data.status}</span>
            </div>
          </div>
          <div className="h-8 w-px bg-border"></div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-black">Context</p>
            <p className="text-[11px] font-bold font-mono text-primary mt-0.5">{data.context.transactionId || 'NOT_SET'}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Side (Stats) */}
        <div className="col-span-2 flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-hide">
          <div className="bg-card rounded-md p-4 border border-border flex flex-col">
            <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-4">Runtime Engine</h3>
            
            <div className="space-y-4">
               {data.context.segments && (
                <div className="p-3 rounded-sm bg-primary/5 border border-primary/10">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[9px] text-primary font-black uppercase tracking-widest">Install Progress</p>
                    <span className="text-[10px] font-mono text-primary font-bold">
                      {Math.round(((data.context.currentSegmentIndex || 0) / data.context.segments.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((data.context.currentSegmentIndex || 0) / data.context.segments.length) * 100}%` }} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2">
                <div className="p-3 rounded-sm bg-muted/30 border border-border">
                  <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Total Signals</p>
                  <p className="text-xl font-black text-foreground">{stats.total}</p>
                </div>
                <div className="p-3 rounded-sm bg-muted/30 border border-border">
                  <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Last Update</p>
                  <p className="text-[11px] font-bold text-muted-foreground">{new Date(data.updatedAt).toLocaleTimeString([], { hour12: false })}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-1">
               <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-3 px-1">Filters</h3>
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
                    "w-full flex items-center justify-between p-2 rounded-sm border transition-colors cursor-pointer",
                    filter === cat.id ? "bg-muted/80 border-border text-foreground" : "bg-transparent border-transparent hover:bg-muted/40 text-muted-foreground hover:text-foreground"
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

        {/* Right Content */}
        <div className="col-span-10 bg-card rounded-md border border-border flex flex-col overflow-hidden">
          {viewMode === 'table' ? (
            <>
              <div className="px-6 py-2.5 border-b border-border flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2">
                   <ListFilter className="w-3.5 h-3.5 text-muted-foreground" />
                   <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Activity Ledger</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative group w-48">
                    <SearchInput 
                      placeholder="Filter records..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-7 text-[11px] font-bold bg-background"
                    />
                  </div>
                  <Button variant="outline" size="icon" className="h-7 w-7 text-muted-foreground">
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <Table>
                  <TableHeader className="sticky top-0 z-10 shadow-sm bg-card">
                    <TableRow>
                      <TableHeaderCell>Time</TableHeaderCell>
                      <TableHeaderCell>Domain</TableHeaderCell>
                      <TableHeaderCell className="text-center w-16">Dir</TableHeaderCell>
                      <TableHeaderCell>Signal Description</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map(log => (
                      <LogItem 
                        key={log._id} 
                        log={log} 
                        isSelected={selectedLogId === log._id}
                        onClick={() => setSelectedLogId(selectedLogId === log._id ? null : log._id)}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <VisualFlow logs={data.logs} selectedId={selectedLogId} onSelect={setSelectedLogId} />
          )}

          <div className="h-10 border-t border-border flex items-center justify-between px-6 bg-muted/30">
             <div className="flex items-center gap-3">
               <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Telemetry Node</span>
               <div className="h-3 w-px bg-border" />
               <span className="text-[11px] font-mono text-primary font-bold uppercase tracking-tight">
                 {selectedLogId ? `BLOCK_ID: ${selectedLogId.substring(0, 12)}` : 'Awaiting signal selection...'}
               </span>
             </div>
             <div className="flex items-center gap-1.5 opacity-60">
               <div className="w-1 h-1 rounded-full bg-emerald-500" />
               <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Digital Twin Active</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
