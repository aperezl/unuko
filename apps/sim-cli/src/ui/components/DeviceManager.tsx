import React from 'react';
import { 
  Plus, 
  Trash2, 
  Wifi, 
  RefreshCw,
  TowerControl,
  Edit2,
  X,
  PowerOff,
  Play,
  Square,
  Search,
  Filter,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { DeviceForm } from './DeviceForms';

interface Device {
  id: string;
  type: 'UE' | 'GNB';
  status: 'RUNNING' | 'STOPPED' | 'ERROR';
  ip?: string;
  connected?: boolean;
  mcc?: string;
  mnc?: string;
  config?: any;
}

const LogLine = ({ line }: { line: string }) => {
  // Regex para capturar: [timestamp] [component] [level] message
  const match = line.match(/^(\[[^\]]+\])\s+(\[[^\]]+\])\s+(\[[^\]]+\])(.*)$/);
  
  if (match) {
    const [_, timestamp, component, level, message] = match;
    
    const getLevelColor = (lvl: string) => {
      const l = lvl.toLowerCase();
      if (l.includes('error')) return 'text-red-400 font-bold';
      if (l.includes('warn')) return 'text-amber-400 font-bold';
      if (l.includes('info')) return 'text-emerald-400 font-bold';
      if (l.includes('debug')) return 'text-sky-400';
      return 'text-slate-400';
    };

    return (
      <div className="flex gap-2 py-0.5 border-b border-slate-800/30 last:border-0 font-mono text-[10px]">
        <span className="text-slate-500 shrink-0">{timestamp}</span>
        <span className="text-purple-400 font-black uppercase tracking-tighter shrink-0">{component}</span>
        <span className={cn(getLevelColor(level), "uppercase tracking-tighter shrink-0")}>{level}</span>
        <span className="text-slate-300 break-all">{message}</span>
      </div>
    );
  }

  // Fallback para líneas que no siguen el formato estándar
  return (
    <div className="py-0.5 text-slate-500 opacity-60 font-mono text-[10px] italic">
      {line}
    </div>
  );
};

export const DeviceManager = () => {
  const location = useLocation();
  const currentTab = location.pathname.endsWith('/gnb') ? 'gnb' : 'ue';
  
  const [devices, setDevices] = React.useState<Device[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [transitioningIds, setTransitioningIds] = React.useState<Set<string>>(new Set());
  const [showForm, setShowForm] = React.useState(false);
  const [editingDevice, setEditingDevice] = React.useState<Device | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const [viewingLogId, setViewingLogId] = React.useState<string | null>(null);
  const [logs, setLogs] = React.useState<string>('');
  const [isLogsLoading, setIsLogsLoading] = React.useState(false);

  const fetchDevices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/v1/infrastructure/devices');
      const data = await response.json();
      setDevices(data);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async (id: string) => {
    setIsLogsLoading(true);
    try {
      const response = await fetch(`/v1/infrastructure/device/${id}/logs`);
      const data = await response.json();
      setLogs(data.logs || '');
    } catch (err) {
      setLogs('Failed to retrieve logs from VM.');
    } finally {
      setIsLogsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    let logInterval: any;
    if (viewingLogId) {
      fetchLogs(viewingLogId);
      logInterval = setInterval(() => fetchLogs(viewingLogId), 3000);
    } else {
      setLogs('');
    }
    return () => clearInterval(logInterval);
  }, [viewingLogId]);

  const handleFormSubmit = async (formData: any) => {
    setIsProcessing(true);
    try {
      const isUpdate = !!editingDevice;
      const id = isUpdate ? editingDevice.id : (currentTab === 'ue' ? formData.imsi : formData.nci);
      const cleanId = id.replace('imsi-', '').replace('gnb-', '');
      
      const url = isUpdate 
        ? `/v1/infrastructure/${currentTab}/${cleanId}` 
        : `/v1/infrastructure/${currentTab}`;
      const method = isUpdate ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        fetchDevices();
        setShowForm(false);
        setEditingDevice(null);
      }
    } catch (err) {
      console.error('Failed to save device:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteDevice = async (id: string) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY remove this configuration from the VM?')) return;
    try {
      const response = await fetch(`/v1/infrastructure/device/${id}`, { method: 'DELETE' });
      if (response.ok) fetchDevices();
    } catch (err) {
      console.error('Failed to delete device:', err);
    }
  };

  const handleStopAll = async () => {
    if (!window.confirm('Are you sure you want to stop ALL active simulations?')) return;
    setIsProcessing(true);
    try {
      const response = await fetch('/v1/infrastructure/devices', { method: 'DELETE' });
      if (response.ok) fetchDevices();
    } catch (err) {
      console.error('Failed to stop all devices:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartDevice = async (id: string) => {
    setTransitioningIds(prev => new Set(prev).add(id));
    try {
      const response = await fetch(`/v1/infrastructure/device/${id}/start`, { method: 'POST' });
      if (response.ok) fetchDevices();
    } catch (err) {
      console.error('Failed to start device:', err);
    } finally {
      setTimeout(() => {
        setTransitioningIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 1000);
    }
  };

  const handleStopDevice = async (id: string) => {
    setTransitioningIds(prev => new Set(prev).add(id));
    try {
      const response = await fetch(`/v1/infrastructure/device/${id}/stop`, { method: 'POST' });
      if (response.ok) fetchDevices();
    } catch (err) {
      console.error('Failed to stop device:', err);
    } finally {
      setTimeout(() => {
        setTransitioningIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 1000);
    }
  };

  const filteredDevices = devices.filter(d => 
    d.type.toLowerCase() === currentTab &&
    (d.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
     (d.ip && d.ip.includes(searchQuery)))
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className={cn(
        "space-y-8 max-w-6xl mx-auto transition-all duration-500 px-6 pt-10",
        viewingLogId ? "pr-[480px]" : ""
      )}>
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
              Infrastructure <span className="text-sky-500">Orchestrator</span>
              <div className="h-4 w-px bg-slate-800 mx-2 hidden md:block" />
              <span className="text-xs font-mono text-slate-500 mt-1 hidden md:block">
                UERANSIM v3.2.6 @ Lima-Core5G
              </span>
            </h2>
            <div className="flex items-center gap-6 mt-4">
              <Link to="/devices/ue" className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] pb-2 transition-all relative",
                currentTab === 'ue' ? "text-sky-500" : "text-slate-500 hover:text-slate-300"
              )}>
                User Equipments
                {currentTab === 'ue' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />}
              </Link>
              <Link to="/devices/gnb" className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] pb-2 transition-all relative",
                currentTab === 'gnb' ? "text-purple-500" : "text-slate-500 hover:text-slate-300"
              )}>
                gNodeB Antennas
                {currentTab === 'gnb' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleStopAll}
              className="px-4 py-2 rounded-sm border border-red-900/30 bg-red-500/5 hover:bg-red-500/10 transition-all text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
            >
              <PowerOff className="w-3.5 h-3.5" />
              Stop All
            </button>
            <button 
              onClick={fetchDevices}
              className="p-2 rounded-sm border border-slate-800 hover:bg-slate-900 transition-all text-slate-400 hover:text-white"
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </button>
            <button 
              onClick={() => {
                setEditingDevice(null);
                setShowForm(true);
              }}
              className="px-5 py-2 rounded-sm bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-sky-400 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <Plus className="w-4 h-4" />
              Deploy {currentTab === 'ue' ? 'UE' : 'Tower'}
            </button>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-400">
                <div className="p-1.5 bg-slate-900/50 border border-slate-800 rounded-sm">
                  {currentTab === 'ue' ? <Wifi className="w-4 h-4" /> : <TowerControl className="w-4 h-4" />}
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">
                  Active {currentTab === 'ue' ? 'User Equipments' : 'gNodeB Instances'}
                  <span className="ml-2 text-slate-600 font-mono">({filteredDevices.length})</span>
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input 
                    type="text"
                    placeholder="Search identity or IP..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-sm pl-9 pr-4 py-1.5 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-slate-700 w-48 transition-all focus:w-64"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence mode="popLayout">
                {filteredDevices.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border border-dashed border-slate-800 rounded-sm p-12 text-center"
                  >
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      No {currentTab} simulations found in this cluster
                    </p>
                  </motion.div>
                ) : (
                  filteredDevices.map(device => (
                    <motion.div
                      key={device.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={cn(
                        "group border p-4 rounded-sm transition-all flex items-center gap-6",
                        viewingLogId === device.id 
                          ? "bg-sky-500/5 border-sky-500/40 shadow-[0_0_15px_rgba(2,132,199,0.1)]" 
                          : "bg-slate-900/40 border-slate-800/60 hover:border-slate-700"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-sm flex items-center justify-center shadow-inner",
                        device.type === 'UE' ? "bg-sky-500/10 text-sky-400" : "bg-purple-500/10 text-purple-400"
                      )}>
                        {device.type === 'UE' ? <Wifi className="w-5 h-5" /> : <TowerControl className="w-5 h-5" />}
                      </div>

                      <div className="flex-1 grid grid-cols-3 gap-8">
                        <div className="min-w-[140px]">
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Identity</p>
                          <p className="text-[12px] font-mono font-bold text-slate-200 truncate">{device.id}</p>
                        </div>
                        <div className="min-w-[100px]">
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">
                            {device.type === 'UE' ? 'Assigned IP' : 'Cell Info'}
                          </p>
                          <p className={cn(
                            "text-[12px] font-mono font-bold transition-all",
                            device.ip ? "text-sky-500/80" : (device.connected ? "text-slate-400" : "text-slate-500")
                          )}>
                            {device.type === 'UE' ? (
                              device.ip || (device.status === 'RUNNING' && !device.connected ? 'Searching...' : 'Pending...')
                            ) : `${device.mcc}/${device.mnc}`}
                          </p>
                          {device.status === 'RUNNING' && device.type === 'UE' && !device.connected && (
                            <motion.p 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-[8px] text-amber-500/80 font-black uppercase tracking-tighter mt-1"
                            >
                              No gNodeB detected
                            </motion.p>
                          )}
                        </div>
                        <div className="min-w-[80px]">
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Status</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {transitioningIds.has(device.id) ? (
                              <>
                                <RefreshCw className="w-2 h-2 text-sky-400 animate-spin" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-sky-400/80 animate-pulse">
                                  UPDATING
                                </span>
                              </>
                            ) : (
                              <>
                                <div className={cn(
                                  "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]",
                                  device.status === 'RUNNING' 
                                    ? (device.connected ? "bg-emerald-500 shadow-emerald-500/20" : "bg-amber-500 shadow-amber-500/20") 
                                    : "bg-red-500 shadow-red-500/20"
                                )} />
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-widest",
                                  device.status === 'RUNNING' 
                                    ? (device.connected ? "text-emerald-500/80" : "text-amber-500/80") 
                                    : "text-red-500/80"
                                )}>
                                  {device.status === 'RUNNING' && device.type === 'UE' && !device.connected ? 'SEARCHING' : device.status}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setViewingLogId(device.id)}
                          className={cn(
                            "p-2 rounded-sm bg-slate-950 border transition-all",
                            viewingLogId === device.id ? "text-sky-400 border-sky-900/50" : "text-slate-500 hover:text-sky-400 border-slate-800 hover:border-sky-900/50"
                          )}
                          title="View Logs"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                        </button>
                        {device.status === 'STOPPED' ? (
                          <button 
                            onClick={() => handleStartDevice(device.id)}
                            className="p-2 rounded-sm bg-slate-950 text-slate-500 hover:text-emerald-400 border border-slate-800 hover:border-emerald-900/50 transition-all"
                            title="Start Simulation"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleStopDevice(device.id)}
                            className="p-2 rounded-sm bg-slate-950 text-slate-500 hover:text-red-400 border border-slate-800 hover:border-red-900/50 transition-all"
                            title="Stop Simulation"
                          >
                            <Square className="w-3.5 h-3.5 fill-current" />
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setEditingDevice(device);
                            setShowForm(true);
                          }}
                          className="p-2 rounded-sm bg-slate-950 text-slate-500 hover:text-amber-400 border border-slate-800 hover:border-amber-900/50 transition-all"
                          title="Edit Configuration"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteDevice(device.id)}
                          className="p-2 rounded-sm bg-slate-950 text-slate-500 hover:text-red-500 border border-slate-800 hover:border-red-900/50 transition-all"
                          title="Delete Device"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Log Viewer Sidebar */}
      <AnimatePresence>
        {viewingLogId && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-[480px] bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 z-40 shadow-[-30px_0_60px_rgba(0,0,0,0.7)] flex flex-col"
          >
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-500/10 text-sky-400 rounded-sm">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">Device Engine Logs</h3>
                  <p className="text-[10px] font-mono text-slate-500">{viewingLogId}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingLogId(null)}
                className="p-2 hover:bg-slate-800 rounded-sm text-slate-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 scrollbar-thin scrollbar-thumb-slate-800">
              {isLogsLoading && !logs ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-600">
                  <RefreshCw className="w-6 h-6 animate-spin opacity-20" />
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black">Syncing with Lima VM...</span>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {logs.split('\n').filter(l => l.trim()).map((line, idx) => (
                    <LogLine key={`${viewingLogId}-${idx}`} line={line} />
                  ))}
                  {logs === '' && (
                    <div className="text-center py-10">
                      <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">No log data available</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-900/40 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Live Stream Active</span>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => fetchLogs(viewingLogId!)}
                  className="text-[8px] font-black text-sky-500 uppercase tracking-widest hover:text-sky-400 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={cn("w-3 h-3", isLogsLoading && "animate-spin")} />
                  Force Refresh
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowForm(false);
                setEditingDevice(null);
              }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-sm p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <DeviceForm 
                type={editingDevice ? editingDevice.type : (currentTab === 'ue' ? 'UE' : 'GNB')}
                initialData={editingDevice ? (
                  editingDevice.type === 'UE' 
                    ? { imsi: editingDevice.id.replace('imsi-', ''), gnbAddress: editingDevice.config?.gnbSearchList?.[0] || '127.0.0.1' }
                    : { 
                        mcc: editingDevice.config?.mcc, 
                        mnc: editingDevice.config?.mnc, 
                        nci: editingDevice.id.replace('gnb-', ''), 
                        tac: editingDevice.config?.tac, 
                        amfAddress: editingDevice.config?.amfConfigs?.[0]?.address || '127.0.0.5' 
                      }
                ) : null}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingDevice(null);
                }}
                isProcessing={isProcessing}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
