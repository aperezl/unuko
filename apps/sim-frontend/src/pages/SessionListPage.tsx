import React from 'react';
import { SessionSummary } from '../types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import yaml from 'js-yaml';
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
  Filter,
  FileCode,
  Terminal
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

interface SessionListProps {
  sessions: SessionSummary[];
  onCreate: (workflow: string, definition?: any) => Promise<string | void>;
  onDelete: (id: string) => Promise<void>;
}

export const SessionListPage = ({ sessions, onCreate, onDelete }: SessionListProps) => {
  const navigate = useNavigate();
  const [sessionToDelete, setSessionToDelete] = React.useState<string | null>(null);
  const [showWorkflowSelector, setShowWorkflowSelector] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [library, setLibrary] = React.useState<{ name: string; content: string }[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem('unuko-workflows');
    let loaded = [];
    if (saved) {
      try {
        loaded = JSON.parse(saved);
      } catch (e) {
        loaded = [];
      }
    }
    if (!loaded || loaded.length === 0) {
      const defaults = [
        {
          name: 'sgp22-provisioning.yaml',
          content: `id: sgp22-provisioning
initial: initializing
context:
  smdpAddress: localhost
  iccid: 89049032000001000001
states:
  initializing:
    invoke:
      src: sgp22/initialize
      onDone: authenticating
      onError: failure
  authenticating:
    invoke:
      src: sgp22/authenticate
      input:
        smdpAddress: "\${context.smdpAddress}"
      onDone:
        target: downloading
        assign:
          transactionId: "\${event.data.transactionId}"
      onError: failure
  downloading:
    invoke:
      src: sgp22/downloadProfile
      input:
        transactionId: "\${context.transactionId}"
        smdpAddress: "\${context.smdpAddress}"
      onDone:
        target: registering_in_core
        assign:
          boundProfilePackage: "\${event.data}"
      onError: failure
  registering_in_core:
    invoke:
      src: sgp22/registerSubscriber
      input:
        iccid: "\${context.iccid}"
      onDone: activating_connectivity
      onError: activating_connectivity
  activating_connectivity:
    invoke:
      src: sgp22/enableConnectivity
      onDone: done
      onError: done
  done:
    type: final`
        },
        {
          name: 'sgp22-inventory.yaml',
          content: `id: sgp22-inventory
initial: fetching_profiles
states:
  fetching_profiles:
    invoke:
      src: sgp22/getProfilesInfo
      onDone: logging_result
      onError: failure
  logging_result:
    invoke:
      src: sgp22/logEventInvoke
      input:
        description: "Profiles listed successfully from eUICC"
        payload: "\${event.data}"
      onDone: done
      onError: failure
  done:
    type: final`
        },
        {
          name: 'sgp22-profile-control.yaml',
          content: `id: sgp22-profile-control
initial: executing_action
context:
  iccid: 89049032000001000001
  action: enable
states:
  executing_action:
    invoke:
      src: sgp22/manageProfile
      input:
        iccid: "\${context.iccid}"
        action: "\${context.action}"
      onDone: logging_refresh
      onError: failure
  logging_refresh:
    invoke:
      src: sgp22/logEventInvoke
      input:
        description: "Simulating Profile Refresh (REUICC) after action"
      onDone: done
      onError: failure
  done:
    type: final`
        },
        {
          name: 'sgp22-event-processor.yaml',
          content: `id: sgp22-event-processor
initial: fetching_notifications
states:
  fetching_notifications:
    invoke:
      src: sgp22/listNotifications
      onDone: logging_result
      onError: failure
  logging_result:
    invoke:
      src: sgp22/logEventInvoke
      input:
        description: "Pending notifications retrieved successfully"
        payload: "\${event.data}"
      onDone: done
      onError: failure
  done:
    type: final`
        }
      ];
      setLibrary(defaults);
      localStorage.setItem('unuko-workflows', JSON.stringify(defaults));
    } else {
      setLibrary(loaded);
    }
  }, [showWorkflowSelector]);

  const getWorkflowMetadata = (name: string) => {
    const lowercase = name.toLowerCase();
    if (lowercase.includes('provisioning')) {
      return { title: 'Full Provisioning', icon: Download, color: 'sky', desc: 'SGP.22 Provisioning Flow' };
    }
    if (lowercase.includes('inventory')) {
      return { title: 'Inventory Retrieve', icon: Database, color: 'indigo', desc: 'SGP.22 Inventory Flow' };
    }
    if (lowercase.includes('profile')) {
      return { title: 'Profile Control', icon: Activity, color: 'emerald', desc: 'SGP.22 Lifecycle Actions' };
    }
    if (lowercase.includes('event') || lowercase.includes('notification')) {
      return { title: 'Event Processor', icon: AlertTriangle, color: 'amber', desc: 'SGP.22 Async Notifications' };
    }
    return { title: name.replace('.yaml', ''), icon: FileCode, color: 'sky', desc: 'Custom User Workflow' };
  };

  const handleLaunchWorkflow = async (content: string) => {
    try {
      const definition = yaml.load(content);
      const sessionId = await onCreate('dynamic', definition);
      if (sessionId) {
        setShowWorkflowSelector(false);
        navigate(`/session/${sessionId}`);
      }
    } catch (err) {
      console.error('Failed to parse or launch workflow:', err);
    }
  };

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
        <div className="bg-card rounded-md border border-border flex flex-col flex-1 min-h-0 overflow-hidden mb-6 shadow-xl">
          <div className="px-6 py-3 border-b border-border bg-muted/20 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <h2 className="text-[11px] uppercase font-black tracking-widest text-muted-foreground">Telemetry Feed</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">DB: MongoDB</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.4)]" />
            </div>
          </div>

          <div className="flex-1 overflow-auto scrollbar-hide">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20 text-center">ID</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.length > 0 ? (
                  filteredSessions.map((session, index) => (
                    <TableRow key={session.sessionId} className="group cursor-pointer" onClick={() => navigate(`/session/${session.sessionId}`)}>
                      <TableCell className="text-center font-mono">
                        <div className={cn(
                          "w-8 h-8 rounded-sm flex items-center justify-center text-[11px] font-black border transition-colors mx-auto",
                          session.status === 'done' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-primary/10 text-primary border-primary/20"
                        )}>
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <h3 className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors font-mono">{session.sessionId}</h3>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          session.status === 'done' ? "text-emerald-500" : "text-primary"
                        )}>
                          {session.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-bold">
                        {format(new Date(session.updatedAt), 'HH:mm:ss')}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono">
                        {format(new Date(session.updatedAt), 'yyyy-MM-dd')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSessionToDelete(session.sessionId);
                            }}
                            className="p-1.5 rounded-sm border border-border flex items-center justify-center hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive text-muted-foreground transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/session/${session.sessionId}`);
                            }}
                            className="p-1.5 rounded-sm bg-card border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 hover:text-primary text-muted-foreground transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-4 opacity-50">
                        <History className="w-8 h-8 text-muted-foreground" />
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">No Active Sessions</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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

              <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                {library.map((wf) => {
                  const meta = getWorkflowMetadata(wf.name);
                  return (
                    <button
                      key={wf.name}
                      onClick={() => handleLaunchWorkflow(wf.content)}
                      className="flex items-center gap-4 p-4 rounded-sm border border-slate-800 bg-slate-950 hover:bg-slate-900 hover:border-sky-500/30 transition-all text-left group"
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-sm flex items-center justify-center transition-colors",
                        meta.color === 'sky' ? "bg-sky-500/10 text-sky-500 group-hover:bg-sky-600 group-hover:text-white" :
                          meta.color === 'indigo' ? "bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white" :
                            meta.color === 'emerald' ? "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white" :
                              "bg-amber-500/10 text-amber-500 group-hover:bg-amber-600 group-hover:text-white"
                      )}>
                        <meta.icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[11px] font-black text-white uppercase tracking-tight group-hover:text-sky-400 transition-colors truncate">{meta.title}</h4>
                        <p className="text-[9px] font-medium text-slate-600 uppercase mt-0.5 truncate">{meta.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
