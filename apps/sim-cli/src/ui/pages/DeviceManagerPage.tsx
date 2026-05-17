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
  Terminal,
  ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { DeviceForm } from '../components/DeviceForms';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

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
  const match = line.match(/^(\[[^\]]+\])\s+(\[[^\]]+\])\s+(\[[^\]]+\])(.*)$/);
  
  if (match) {
    const [_, timestamp, component, level, message] = match;
    
    const getLevelColor = (lvl: string) => {
      const l = lvl.toLowerCase();
      if (l.includes('error')) return 'text-destructive font-bold';
      if (l.includes('warn')) return 'text-amber-500 font-bold';
      if (l.includes('info')) return 'text-emerald-500 font-bold';
      if (l.includes('debug')) return 'text-primary';
      return 'text-muted-foreground';
    };

    return (
      <div className="flex gap-2 py-0.5 border-b border-border/30 last:border-0 font-mono text-[10px]">
        <span className="text-muted-foreground shrink-0">{timestamp}</span>
        <span className="text-purple-400 font-black uppercase tracking-tighter shrink-0">{component}</span>
        <span className={cn(getLevelColor(level), "uppercase tracking-tighter shrink-0")}>{level}</span>
        <span className="text-foreground break-all">{message}</span>
      </div>
    );
  }

  return (
    <div className="py-0.5 text-muted-foreground opacity-60 font-mono text-[10px] italic">
      {line}
    </div>
  );
};

export const DeviceManagerPage = () => {
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

  const logsContainerRef = React.useRef<HTMLDivElement>(null);
  const [isScrolledUp, setIsScrolledUp] = React.useState(false);

  const handleLogsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
    setIsScrolledUp(!isAtBottom);
  };

  React.useEffect(() => {
    if (!isScrolledUp && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  React.useEffect(() => {
    if (viewingLogId && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
      setIsScrolledUp(false);
    }
  }, [viewingLogId]);

  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const [sidebarWidth, setSidebarWidth] = React.useState(() => {
    const saved = localStorage.getItem('unuko_log_sidebar_width');
    return saved ? parseInt(saved, 10) : 800; // Much larger default
  });
  const latestWidthRef = React.useRef(sidebarWidth);
  const isDragging = React.useRef(false);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newWidth = window.innerWidth - e.clientX;
      const maxWidth = window.innerWidth - 32; // Allow almost full screen
      if (newWidth > 300 && newWidth < maxWidth) {
        setSidebarWidth(newWidth);
        latestWidthRef.current = newWidth;
      }
    };
    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
        localStorage.setItem('unuko_log_sidebar_width', latestWidthRef.current.toString());
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (viewingLogId && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        if (!(e.target as Element).closest('.prevent-sidebar-close')) {
          setViewingLogId(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [viewingLogId]);

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
        "space-y-8 max-w-6xl mx-auto transition-all duration-500 px-6 pt-10"
      )}>
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase flex items-center gap-3">
              Infrastructure <span className="text-primary">Orchestrator</span>
              <div className="h-4 w-px bg-border mx-2 hidden md:block" />
              <span className="text-xs font-mono text-muted-foreground mt-1 hidden md:block">
                UERANSIM v3.2.6 @ Lima-Core5G
              </span>
            </h2>
            <div className="flex items-center gap-6 mt-4">
              <Link to="/devices/ue" className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] pb-2 transition-all relative",
                currentTab === 'ue' ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}>
                User Equipments
                {currentTab === 'ue' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </Link>
              <Link to="/devices/gnb" className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] pb-2 transition-all relative",
                currentTab === 'gnb' ? "text-purple-500" : "text-muted-foreground hover:text-foreground"
              )}>
                gNodeB Antennas
                {currentTab === 'gnb' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="destructive"
              size="sm"
              onClick={handleStopAll}
              className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
            >
              <PowerOff className="w-3.5 h-3.5" />
              Stop All
            </Button>
            <Button 
              variant="outline"
              size="icon"
              onClick={fetchDevices}
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
            <Button 
              onClick={() => {
                setEditingDevice(null);
                setShowForm(true);
              }}
              className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Deploy {currentTab === 'ue' ? 'UE' : 'Tower'}
            </Button>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="p-1.5 bg-muted/50 border border-border rounded-md">
                  {currentTab === 'ue' ? <Wifi className="w-4 h-4" /> : <TowerControl className="w-4 h-4" />}
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">
                  Active {currentTab === 'ue' ? 'User Equipments' : 'gNodeB Instances'}
                  <span className="ml-2 text-muted-foreground font-mono">({filteredDevices.length})</span>
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input 
                    type="text"
                    placeholder="Search identity or IP..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 h-8 w-48 focus:w-64 transition-all text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-md border border-border flex flex-col overflow-hidden shadow-xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">Type</TableHead>
                    <TableHead>Identity</TableHead>
                    <TableHead>{currentTab === 'ue' ? 'Assigned IP' : 'Cell Info'}</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredDevices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-48 text-center">
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center gap-4 opacity-50"
                          >
                            <div className="p-3 bg-muted rounded-full">
                              {currentTab === 'ue' ? <Wifi className="w-6 h-6" /> : <TowerControl className="w-6 h-6" />}
                            </div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                              No {currentTab} simulations found
                            </p>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDevices.map(device => (
                        <TableRow
                          key={device.id}
                          className={cn(
                            "group transition-all",
                            viewingLogId === device.id && "bg-primary/5 hover:bg-primary/5"
                          )}
                        >
                          <TableCell className="text-center">
                            <div className={cn(
                              "w-8 h-8 rounded-sm flex items-center justify-center shadow-inner mx-auto",
                              device.type === 'UE' ? "bg-primary/10 text-primary" : "bg-purple-500/10 text-purple-500"
                            )}>
                              {device.type === 'UE' ? <Wifi className="w-4 h-4" /> : <TowerControl className="w-4 h-4" />}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <p className="text-[12px] font-mono font-bold text-foreground truncate max-w-[200px]">{device.id}</p>
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <p className={cn(
                                "text-[12px] font-mono font-bold transition-all",
                                device.ip ? "text-primary/80" : (device.connected ? "text-muted-foreground" : "text-muted-foreground/50")
                              )}>
                                {device.type === 'UE' ? (
                                  device.ip || (device.status === 'RUNNING' && !device.connected ? 'Searching...' : 'Pending...')
                                ) : `${device.mcc}/${device.mnc}`}
                              </p>
                              {device.status === 'RUNNING' && device.type === 'UE' && !device.connected && (
                                <span className="text-[8px] text-amber-500/80 font-black uppercase tracking-tighter">
                                  No gNodeB detected
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {transitioningIds.has(device.id) ? (
                                <>
                                  <RefreshCw className="w-2 h-2 text-primary animate-spin" />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/80 animate-pulse">
                                    UPDATING
                                  </span>
                                </>
                              ) : (
                                <>
                                  <div className={cn(
                                    "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]",
                                    device.status === 'RUNNING' 
                                      ? (device.connected ? "bg-emerald-500 shadow-emerald-500/20" : "bg-amber-500 shadow-amber-500/20") 
                                      : "bg-destructive shadow-destructive/20"
                                  )} />
                                  <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest",
                                    device.status === 'RUNNING' 
                                      ? (device.connected ? "text-emerald-500/80" : "text-amber-500/80") 
                                      : "text-destructive"
                                  )}>
                                    {device.status === 'RUNNING' && device.type === 'UE' && !device.connected ? 'SEARCHING' : device.status}
                                  </span>
                                </>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                variant="outline"
                                size="icon"
                                onClick={() => setViewingLogId(device.id)}
                                className={cn(
                                  "h-8 w-8 transition-all prevent-sidebar-close",
                                  viewingLogId === device.id && "text-primary border-primary/50"
                                )}
                                title="View Logs"
                              >
                                <Terminal className="w-3.5 h-3.5" />
                              </Button>
                              {device.status === 'STOPPED' ? (
                                <Button 
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleStartDevice(device.id)}
                                  className="h-8 w-8 hover:text-emerald-500 hover:border-emerald-500/50"
                                  title="Start Simulation"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleStopDevice(device.id)}
                                  className="h-8 w-8 hover:text-destructive hover:border-destructive/50"
                                  title="Stop Simulation"
                                >
                                  <Square className="w-3.5 h-3.5 fill-current" />
                                </Button>
                              )}
                              <Button 
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setEditingDevice(device);
                                  setShowForm(true);
                                }}
                                className="h-8 w-8 hover:text-amber-500 hover:border-amber-500/50"
                                title="Edit Configuration"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button 
                                variant="outline"
                                size="icon"
                                onClick={() => handleDeleteDevice(device.id)}
                                className="h-8 w-8 hover:text-destructive hover:border-destructive/50"
                                title="Delete Device"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Log Viewer Sidebar */}
      <AnimatePresence>
        {viewingLogId && (
          <motion.div 
            ref={sidebarRef as any}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{ width: sidebarWidth }}
            className="fixed top-0 right-0 bottom-0 bg-background/95 backdrop-blur-xl border-l border-border z-40 shadow-[-30px_0_60px_rgba(0,0,0,0.7)] flex flex-col"
          >
            {/* Drag Handle */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary/20 transition-colors z-50 prevent-sidebar-close"
              onMouseDown={(e) => {
                e.preventDefault();
                isDragging.current = true;
                document.body.style.cursor = 'col-resize';
                document.body.style.userSelect = 'none';
              }}
            />
            <div className="p-6 border-b border-border flex items-center justify-between bg-card/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-md">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Device Engine Logs</h3>
                  <p className="text-[10px] font-mono text-muted-foreground">{viewingLogId}</p>
                </div>
              </div>
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => setViewingLogId(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div 
              ref={logsContainerRef}
              onScroll={handleLogsScroll}
              className="flex-1 overflow-auto p-4 scrollbar-thin scrollbar-thumb-muted"
            >
              {isLogsLoading && !logs ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
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
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No log data available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {isScrolledUp && logs.length > 0 && (
              <Button 
                size="icon" 
                className="absolute bottom-20 right-6 rounded-full shadow-[0_0_20px_rgba(var(--color-primary),0.3)] bg-primary/10 text-primary hover:bg-primary/30 backdrop-blur-md z-50 border border-primary/20"
                onClick={() => {
                  if (logsContainerRef.current) {
                    logsContainerRef.current.scrollTo({ top: logsContainerRef.current.scrollHeight, behavior: 'smooth' });
                    setIsScrolledUp(false);
                  }
                }}
                title="Scroll to bottom"
              >
                <ArrowDown className="w-5 h-5" />
              </Button>
            )}

            <div className="p-4 bg-card border-t border-border flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Live Stream Active</span>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => fetchLogs(viewingLogId!)}
                  className="text-[8px] font-black text-primary uppercase tracking-widest hover:text-primary/80 flex items-center gap-1.5 transition-colors"
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
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md"
            >
              <Card className="shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="p-6">
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
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
