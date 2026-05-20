import React from 'react';
import { 
  Settings, 
  Play, 
  RotateCcw, 
  Database, 
  Cpu, 
  Radio, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  Activity,
  RefreshCw,
  ExternalLink,
  Server
} from 'lucide-react';
import { Button } from '../components/ui/button';

export const SettingsPage = () => {
  const [loading, setLoading] = React.useState(false);
  const [cleaning, setCleaning] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  
  // Progress & Terminal console states
  const [progress, setProgress] = React.useState(0);
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [logs, setLogs] = React.useState<string[]>([]);
  
  // Services status states
  const [activeTab, setActiveTab] = React.useState<'provisioning' | 'status'>(() => {
    const saved = localStorage.getItem('unuko-settings-active-tab');
    return (saved === 'provisioning' || saved === 'status') ? saved : 'provisioning';
  });
  const [services, setServices] = React.useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = React.useState(false);
  const [togglingServices, setTogglingServices] = React.useState<Record<string, boolean>>({});

  const toggleService = async (serviceName: string, currentStatus: string) => {
    if (!serviceName) return;
    const action = currentStatus === 'online' ? 'stop' : 'start';
    
    setTogglingServices(prev => ({ ...prev, [serviceName]: true }));
    try {
      const response = await fetch(`/v1/orchestrator/services/${serviceName}/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (response.ok) {
        const data = await response.json();
        setServices(prev => prev.map(s => {
          if (s.serviceName === serviceName) {
            return { ...s, status: data.status === 'active' ? 'online' : 'offline' };
          }
          return s;
        }));
      }
    } catch (e) {
      console.error(`Failed to toggle service ${serviceName}:`, e);
    } finally {
      setTogglingServices(prev => ({ ...prev, [serviceName]: false }));
    }
  };

  const fetchServicesStatus = async () => {
    setServicesLoading(true);
    try {
      const response = await fetch('/v1/orchestrator/services/status');
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (e) {
      console.error('Failed to fetch services status:', e);
    } finally {
      setServicesLoading(false);
    }
  };

  React.useEffect(() => {
    localStorage.setItem('unuko-settings-active-tab', activeTab);
    if (activeTab === 'status') {
      fetchServicesStatus();
    }
  }, [activeTab]);

  // Ref to handle auto-scrolling
  const consoleRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom effect whenever logs update
  React.useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const steps = [
    { label: 'Purging State' },
    { label: 'Seeding DB' },
    { label: 'gNB Configs' },
    { label: 'UE Mobiles' }
  ];

  const handleProvision = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setProgress(0);
    setCurrentStepIndex(0);
    
    const newLogs: string[] = [];
    const addLog = (msg: string) => {
      newLogs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
      setLogs([...newLogs]);
    };

    addLog('SYSTEM: Initiating dynamic 5G seed provisioning...');
    addLog('SIMULATOR: Stopping any active gNodeB or UE processes...');
    addLog('DATABASE: Initiating full database state cleanup...');

    let currentProgress = 0;
    let completed = false;

    const interval = setInterval(() => {
      if (completed) return;
      
      if (currentProgress < 90) {
        const increment = Math.floor(Math.random() * 5) + 3;
        currentProgress = Math.min(90, currentProgress + increment);
        setProgress(currentProgress);
        
        if (currentProgress >= 25 && currentProgress < 50 && currentStepIndex < 1) {
          setCurrentStepIndex(1);
          addLog('DATABASE: Purged old subscriber records successfully.');
          addLog('DATABASE: Injecting 10 SIM subscriber cards (IMSI 999700000000001 to 999700000000010)...');
          addLog('DATABASE: Registered subscribers successfully inside Open5GS MongoDB.');
        } else if (currentProgress >= 50 && currentProgress < 75 && currentStepIndex < 2) {
          setCurrentStepIndex(2);
          addLog('SIMULATOR: Generating 4 slice-aware gNodeB configurations...');
          addLog('SIMULATOR: Zone A (TAC: 1) -> 2 antennas (nci 0x10, 0x11) created.');
          addLog('SIMULATOR: Zone B (TAC: 2) -> 2 antennas (nci 0x20, 0x21) created.');
        } else if (currentProgress >= 75 && currentStepIndex < 3) {
          setCurrentStepIndex(3);
          addLog('SIMULATOR: Simulated antennas written successfully.');
          addLog('SIMULATOR: Generating 10 UE mobile profiles (IMSI 001 to 010)...');
          addLog('SIMULATOR: UEs 1 to 5 (Zone A) configured to scan Zone A cells.');
          addLog('SIMULATOR: UEs 6 to 10 (Zone B) configured to scan Zone B cells.');
          addLog('SYSTEM: Triggering hardware inventory and sync registry...');
        }
      }
    }, 120);

    try {
      const response = await fetch('/v1/infrastructure/provision-all', {
        method: 'POST'
      });
      const data = await response.json();
      
      completed = true;
      clearInterval(interval);

      if (response.ok) {
        setProgress(100);
        setCurrentStepIndex(4);
        addLog('SYSTEM: Hardware inventory and database sync completed successfully.');
        addLog('SYSTEM: All elements successfully provisioned and ready in STOPPED state.');
        setResult(data);
      } else {
        throw new Error(data.error || 'Failed to complete provisioning.');
      }
    } catch (err: any) {
      completed = true;
      clearInterval(interval);
      addLog(`FATAL ERROR: ${err.message}`);
      setError(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setCleaning(true);
    setError(null);
    setResult(null);
    setProgress(0);
    setCurrentStepIndex(0);
    
    const newLogs: string[] = [];
    const addLog = (msg: string) => {
      newLogs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
      setLogs([...newLogs]);
    };

    addLog('SYSTEM: Initiating total platform teardown...');
    addLog('SIMULATOR: Terminating all active nr-ue and nr-gnb binary processes...');

    let currentProgress = 0;
    let completed = false;

    const interval = setInterval(() => {
      if (completed) return;
      
      if (currentProgress < 90) {
        const increment = Math.floor(Math.random() * 8) + 8;
        currentProgress = Math.min(90, currentProgress + increment);
        setProgress(currentProgress);
        
        if (currentProgress >= 45 && currentStepIndex < 1) {
          setCurrentStepIndex(1);
          addLog('SIMULATOR: Halted all UERANSIM cores.');
          addLog('DATABASE: Requesting full collection purge on Open5GS MongoDB...');
        }
      }
    }, 100);

    try {
      const response = await fetch('/v1/infrastructure/devices', {
        method: 'DELETE'
      });
      completed = true;
      clearInterval(interval);

      if (response.ok) {
        setProgress(100);
        setCurrentStepIndex(2);
        addLog('DATABASE: Cleared all subscriber records from MongoDB.');
        addLog('SIMULATOR: Purged generated config and log files from VM.');
        addLog('SYSTEM: Platform is in clean, pristine state.');
        setResult({
          message: 'All simulated 5G Core processes terminated and cleaned up successfully.',
          details: { subscribersSeeded: 0, gnbsStarted: 0, uesStarted: 0 },
          isTeardown: true
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to clean up devices.');
      }
    } catch (err: any) {
      completed = true;
      clearInterval(interval);
      addLog(`FATAL ERROR: ${err.message}`);
      setError(err.message || 'Network error.');
    } finally {
      setCleaning(false);
    }
  };

  const isTeardown = cleaning || !!result?.isTeardown;

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <div className="p-1.5 rounded bg-primary/10 border border-primary/20">
          <Settings className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="text-md font-black uppercase tracking-tight leading-none">System Settings</h2>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">Platform management and dynamic twin orchestration</p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center border-b border-border px-1 gap-2 mb-2">
        <button
          onClick={() => setActiveTab('provisioning')}
          className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors relative cursor-pointer ${
            activeTab === 'provisioning' ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Provisioning
          {activeTab === 'provisioning' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
        <button
          onClick={() => setActiveTab('status')}
          className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors relative cursor-pointer ${
            activeTab === 'status' ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Status
          {activeTab === 'status' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
      </div>

      {activeTab === 'provisioning' && (
        <div className="space-y-4">
          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Automatic Provisioning Card */}
            <div className="border border-border bg-card rounded-md p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-primary uppercase tracking-widest bg-primary/15 px-1.5 py-0.5 rounded">Fast Bootstrap</span>
                  <Play className="w-3.5 h-3.5 text-primary opacity-45 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wide">Automatic 5G Provisioning</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Seeds subscribers in MongoDB and registers slice-aware gNodeBs and UEs in a stopped state inside the VM.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50 flex gap-2">
                <Button 
                  onClick={handleProvision} 
                  disabled={loading || cleaning}
                  className="flex-1 font-bold text-xs uppercase h-8 cursor-pointer gap-1.5"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Provisioning...
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      Run Automatic Provisioning
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Teardown & Reset Card */}
            <div className="border border-border bg-card rounded-md p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-1.5 py-0.5 rounded">Teardown</span>
                  <RotateCcw className="w-3.5 h-3.5 text-rose-500 opacity-45 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wide">Clean Up Devices</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Stops all simulated processes, purges subscriber collections, and deletes generated configuration files.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50">
                <Button 
                  variant="outline" 
                  onClick={handleClear} 
                  disabled={loading || cleaning}
                  className="w-full font-bold text-xs uppercase h-8 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer gap-1.5 text-rose-400"
                >
                  {cleaning ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Cleaning...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3 h-3" />
                      Stop & Clean Environment
                    </>
                  )}
                </Button>
              </div>
            </div>

          </div>

          {/* Dynamic Progress Panel (Console Style) */}
          {(loading || cleaning || logs.length > 0) && (
            <div className="border border-border bg-card rounded-md p-4 space-y-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      error 
                        ? 'bg-rose-500' 
                        : progress === 100 
                          ? (isTeardown ? 'bg-rose-500' : 'bg-emerald-500') 
                          : (cleaning ? 'bg-rose-400' : 'bg-primary')
                    }`}></span>
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                      error 
                        ? 'bg-rose-500' 
                        : progress === 100 
                          ? (isTeardown ? 'bg-rose-500' : 'bg-emerald-500') 
                          : (cleaning ? 'bg-rose-400' : 'bg-primary')
                    }`}></span>
                  </span>
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${isTeardown ? 'text-rose-400' : 'text-muted-foreground'}`}>
                    {cleaning ? 'Teardown Pipeline' : 'Provisioning Pipeline'}
                  </h4>
                </div>
                <span className={`text-xs font-mono font-bold ${isTeardown ? 'text-rose-400' : 'text-primary'}`}>{progress}%</span>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden relative border border-border/40">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ease-out ${
                    error 
                      ? 'bg-rose-500' 
                      : progress === 100 
                        ? (isTeardown ? 'bg-gradient-to-r from-rose-500 to-red-400' : 'bg-gradient-to-r from-emerald-500 to-teal-400') 
                        : (isTeardown ? 'bg-gradient-to-r from-rose-500/60 to-red-400/60' : 'bg-gradient-to-r from-primary to-cyan-400')
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Step Milestones */}
              {!cleaning && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 py-0.5">
                  {steps.map((step, idx) => {
                    const isCompleted = progress === 100 || currentStepIndex > idx;
                    const isActive = currentStepIndex === idx && !error && progress < 100;
                    return (
                      <div 
                        key={idx} 
                        className={`p-2 rounded border text-left transition-all duration-200 flex items-center gap-2 ${
                          isCompleted 
                            ? 'border-emerald-500/20 bg-emerald-500/5' 
                            : isActive 
                              ? 'border-primary/30 bg-primary/5 shadow-sm' 
                              : 'border-border/40 bg-muted/20 opacity-50'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isCompleted 
                            ? 'bg-emerald-500 text-black' 
                            : isActive 
                              ? 'bg-primary text-black animate-pulse' 
                              : 'bg-muted-foreground/20 text-muted-foreground'
                        }`}>
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider">{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Console Log Terminal */}
              <div 
                ref={consoleRef}
                className="bg-black/45 border border-border/60 rounded p-2.5 font-mono text-[11px] text-muted-foreground h-28 overflow-y-auto space-y-1 scrollbar-thin select-none"
              >
                {logs.map((log, idx) => {
                  const isError = log.includes('FATAL ERROR') || log.includes('ERROR');
                  const isSuccess = log.includes('success') || log.includes('ready') || log.includes('pristine');
                  return (
                    <div 
                      key={idx} 
                      className={`leading-normal ${
                        isError 
                          ? 'text-rose-400 font-bold' 
                          : isSuccess 
                            ? (isTeardown ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold') 
                            : 'text-zinc-400'
                      }`}
                    >
                      {log}
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* Results and Alerts */}
          {error && (
            <div className="border border-rose-500/30 bg-rose-500/5 rounded-md p-3 flex gap-2 items-start animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider">Provisioning Failure</h4>
                <p className="text-xs text-rose-400/90 leading-normal font-mono bg-black/20 p-2 rounded border border-rose-500/10 mt-1.5">{error}</p>
              </div>
            </div>
          )}

          {result && !loading && !cleaning && (
            <div className={`border rounded-md p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 ${
              isTeardown ? 'border-rose-500/30 bg-rose-500/5' : 'border-emerald-500/30 bg-emerald-500/5'
            }`}>
              <div className={`flex gap-2 items-center ${isTeardown ? 'text-rose-500' : 'text-emerald-500'}`}>
                {isTeardown ? (
                  <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                )}
                <h4 className="text-xs font-black uppercase tracking-widest">{result.message}</h4>
              </div>
              
              {result.details && (
                <div className={`grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 border-t ${
                  isTeardown ? 'border-rose-500/20' : 'border-emerald-500/20'
                }`}>
                  
                  <div className={`border rounded-md p-2 flex items-center justify-between px-3 ${
                    isTeardown ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Database className={`w-3.5 h-3.5 ${isTeardown ? 'text-rose-400' : 'text-emerald-400'}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        isTeardown ? 'text-rose-400/80' : 'text-emerald-400/80'
                      }`}>Subscribers</span>
                    </div>
                    <span className={`text-sm font-black ${isTeardown ? 'text-rose-300' : 'text-emerald-300'}`}>
                      {result.details.subscribersSeeded}
                    </span>
                  </div>

                  <div className={`border rounded-md p-2 flex items-center justify-between px-3 ${
                    isTeardown ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Radio className={`w-3.5 h-3.5 ${isTeardown ? 'text-rose-400' : 'text-emerald-400'}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        isTeardown ? 'text-rose-400/80' : 'text-emerald-400/80'
                      }`}>gNB (Stopped)</span>
                    </div>
                    <span className={`text-sm font-black ${isTeardown ? 'text-rose-300' : 'text-emerald-300'}`}>
                      {result.details.gnbsStarted}
                    </span>
                  </div>

                  <div className={`border rounded-md p-2 flex items-center justify-between px-3 ${
                    isTeardown ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Cpu className={`w-3.5 h-3.5 ${isTeardown ? 'text-rose-400' : 'text-emerald-400'}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        isTeardown ? 'text-rose-400/80' : 'text-emerald-400/80'
                      }`}>UEs (Stopped)</span>
                    </div>
                    <span className={`text-sm font-black ${isTeardown ? 'text-rose-300' : 'text-emerald-300'}`}>
                      {result.details.uesStarted}
                    </span>
                  </div>

                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'status' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Actions Bar */}
          <div className="flex items-center justify-between bg-muted/20 border border-border p-3 rounded-md">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">Infrastructure Services</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">Real-time status of backend service daemons and container integrations</p>
            </div>
            <Button
              onClick={fetchServicesStatus}
              disabled={servicesLoading}
              variant="outline"
              className="font-bold text-xs uppercase h-8 cursor-pointer gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${servicesLoading ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
          </div>

          {/* Services Grid */}
          {servicesLoading && services.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border border-border bg-card rounded-md space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Probing services...</p>
            </div>
          ) : (
            (() => {
              const infraServices = services.filter(s => s.type !== '5G Core Service');
              const coreServices = services.filter(s => s.type === '5G Core Service');
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {infraServices.map((svc, idx) => {
                      const isOnline = svc.status === 'online';
                      return (
                        <div key={idx} className="border border-border bg-card rounded-md p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                          <div className="space-y-3">
                            {/* Badge / Indicator */}
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded-sm">
                                {svc.type}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="relative flex h-1.5 w-1.5">
                                  {isOnline && (
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                  )}
                                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                </span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isOnline ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {svc.status}
                                </span>
                              </div>
                            </div>

                            {/* Info */}
                            <div>
                              <h3 className="text-sm font-bold uppercase tracking-wide flex items-center gap-1.5">
                                <Server className="w-3.5 h-3.5 text-muted-foreground" />
                                {svc.name}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {svc.description}
                              </p>
                            </div>

                            {/* Connection Details */}
                            <div className="bg-black/20 border border-border/40 p-2.5 rounded font-mono text-[10px] space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Host:</span>
                                <span className="font-bold text-foreground">{svc.host}</span>
                              </div>
                              {svc.port !== null && (
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Internal Port:</span>
                                  <span className="font-bold text-foreground">{svc.port}</span>
                                </div>
                              )}
                              {svc.forwardedPort && (
                                <div className="flex items-center justify-between border-t border-border/20 pt-1.5 mt-1.5">
                                  <span className="text-muted-foreground">Forwarded (Host):</span>
                                  <span className="font-bold text-primary">{svc.forwardedPort}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Web Link if applicable */}
                          {isOnline && svc.type === 'Web Portal' && (
                            <div className="mt-4 pt-3 border-t border-border/50">
                              <a 
                                href={`http://localhost:${svc.forwardedPort || svc.port}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1.5 w-full font-bold text-xs uppercase h-8 rounded bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary transition-colors cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Open Web Portal
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {coreServices.length > 0 && (
                    <div className="border-t border-border/60 pt-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">5G Core Network Functions</h4>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {coreServices.map((svc, idx) => {
                          const isOnline = svc.status === 'online';
                          const isToggling = togglingServices[svc.serviceName];
                          return (
                            <div key={idx} className="border border-border bg-card/65 rounded p-3 flex flex-col justify-between shadow-xs relative overflow-hidden group">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black text-foreground uppercase tracking-wide">
                                    {svc.name}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    {/* Action Toggle Switch */}
                                    <button
                                      disabled={isToggling}
                                      onClick={() => toggleService(svc.serviceName, svc.status)}
                                      className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden disabled:opacity-50 ${isOnline ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-muted border-border'}`}
                                      title={isOnline ? "Turn off service" : "Turn on service"}
                                    >
                                      {isToggling ? (
                                        <span className="absolute inset-0 flex items-center justify-center">
                                          <Loader2 className="w-2.5 h-2.5 animate-spin text-muted-foreground" />
                                        </span>
                                      ) : (
                                        <span
                                          className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-foreground shadow-xs ring-0 transition duration-200 ease-in-out ${isOnline ? 'translate-x-3 bg-emerald-500' : 'translate-x-0 bg-muted-foreground'}`}
                                        />
                                      )}
                                    </button>
                                    
                                    {/* Status dot indicator */}
                                    {!isToggling && (
                                      <span className={`relative flex h-1.5 w-1.5`}>
                                        {isOnline && (
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                        )}
                                        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p className="text-[10px] text-muted-foreground leading-normal line-clamp-2 min-h-[30px]" title={svc.description}>
                                  {svc.description}
                                </p>
                                <div className="bg-black/15 p-1.5 rounded font-mono text-[9px] text-muted-foreground space-y-1">
                                  <div className="flex justify-between">
                                    <span>IP:</span>
                                    <span className="text-foreground">{svc.host}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Port:</span>
                                    <span className="text-foreground">{svc.port || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      )}
    </div>
  );
};
