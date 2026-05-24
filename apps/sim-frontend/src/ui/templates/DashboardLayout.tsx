import React from 'react';
import { Outlet } from 'react-router-dom';
import { Bell, User, ChevronDown, Play, Square, Loader2, Cpu } from 'lucide-react';
import { SidebarNavigation } from '../organisms/SidebarNavigation';
import { SearchInput } from '../molecules/SearchInput';
import { Button } from '../atoms/Button';
import { environmentRepository } from '../../infrastructure/adapters/HttpEnvironmentRepository';
import { VMInfo } from '../../core/ports/EnvironmentRepository';
import { cn } from '../../lib/utils';

export function DashboardLayout() {
  const [collapsed, setCollapsed] = React.useState(() => {
    return localStorage.getItem('unuko-sidebar-collapsed') === 'true';
  });
  const [environment, setEnvironment] = React.useState<'mock' | 'lima'>('mock');
  const [activeVm, setActiveVm] = React.useState<string>('core5g');
  const [vms, setVms] = React.useState<VMInfo[]>([]);
  const [vmsLoading, setVmsLoading] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const fetchVms = React.useCallback(async (showLoading = false) => {
    if (showLoading) setVmsLoading(true);
    try {
      const data = await environmentRepository.getVms();
      setVms(data.vms || []);
      setActiveVm(data.activeVm || 'core5g');
    } catch (err) {
      console.error('Failed to fetch VMs:', err);
    } finally {
      if (showLoading) setVmsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    environmentRepository.getEnvironment()
      .then(env => {
        setEnvironment(env);
        if (env === 'lima') {
          fetchVms(true);
        }
      })
      .catch(err => console.error('Failed to fetch environment:', err));
  }, [fetchVms]);

  // Poll VM status every 4 seconds in the background
  React.useEffect(() => {
    if (environment !== 'lima') return;
    const interval = setInterval(() => {
      fetchVms(false);
    }, 4000);
    return () => clearInterval(interval);
  }, [environment, fetchVms]);

  // Click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleEnvironment = async () => {
    const nextEnv = environment === 'mock' ? 'lima' : 'mock';
    try {
      const data = await environmentRepository.setEnvironment(nextEnv);
      if (data.environment) {
        setEnvironment(data.environment);
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to toggle environment:', err);
    }
  };

  const handleSelectActiveVm = async (vmName: string) => {
    if (vmName === activeVm) return;
    try {
      await environmentRepository.setActiveVm(vmName);
      setActiveVm(vmName);
      // Reload page to re-init all adapters and connections to the new VM
      window.location.reload();
    } catch (err) {
      console.error('Failed to switch VM:', err);
    }
  };

  const handleToggleVm = async (vmName: string, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting as active VM
    
    // Optimistic status update
    const nextStatus = currentStatus === 'Running' ? 'Stopping' : 'Starting';
    setVms(prev => prev.map(vm => vm.name === vmName ? { ...vm, status: nextStatus } : vm));
    
    try {
      if (currentStatus === 'Running') {
        await environmentRepository.stopVm(vmName);
      } else {
        await environmentRepository.startVm(vmName);
      }
      // Re-fetch shortly after triggering action
      setTimeout(() => fetchVms(false), 1500);
    } catch (err) {
      console.error(`Failed to toggle VM ${vmName}:`, err);
      fetchVms(false); // Reset to correct state on error
    }
  };

  const toggleSidebar = () => {
    const nextValue = !collapsed;
    setCollapsed(nextValue);
    localStorage.setItem('unuko-sidebar-collapsed', String(nextValue));
  };

  return (
    <div className="h-screen w-full flex bg-background text-foreground overflow-hidden font-sans">
      <SidebarNavigation collapsed={collapsed} onToggle={toggleSidebar} />

      <div className="flex-1 flex flex-col min-w-0 relative h-screen">
        <header className="h-12 border-b border-border flex items-center justify-between px-6 bg-card z-10 shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-lg">
            <SearchInput placeholder="Global search..." className="h-8 text-xs bg-background" />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-muted/60 border border-border p-0.5 rounded-lg mr-2 relative" ref={dropdownRef}>
              <Button 
                variant={environment === 'mock' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={environment === 'mock' ? undefined : toggleEnvironment}
                className={cn(
                  "h-7 text-[10px] font-black uppercase tracking-wider px-2.5 rounded-md transition-all duration-200",
                  environment === 'mock' 
                    ? "bg-amber-500 hover:bg-amber-600 text-black shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                )}
              >
                Mock
              </Button>
              {environment === 'lima' ? (
                <Button 
                  variant="default"
                  size="sm" 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="h-7 text-[10px] font-black uppercase tracking-wider px-2.5 rounded-md bg-sky-500 hover:bg-sky-600 text-white shadow-sm flex items-center gap-1 transition-all duration-200"
                >
                  LIMA: {activeVm}
                  <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", dropdownOpen && "rotate-180")} />
                </Button>
              ) : (
                <Button 
                  variant="ghost"
                  size="sm" 
                  onClick={toggleEnvironment}
                  className="h-7 text-[10px] font-black uppercase tracking-wider px-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-transparent transition-all duration-200"
                >
                  LIMA (5G)
                </Button>
              )}

              {/* VM Popover Dropdown */}
              {dropdownOpen && environment === 'lima' && (
                <div className="absolute right-0 top-9 w-72 backdrop-blur-md bg-card/95 border border-border shadow-xl rounded-xl p-3.5 z-50 flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between border-b border-border pb-2 shrink-0">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-sky-400" />
                      LIMA Virtual Machines
                    </span>
                    {vmsLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
                  </div>

                  <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-0.5">
                    {vms.length === 0 ? (
                      <span className="text-xs text-muted-foreground py-4 text-center">No VMs detected</span>
                    ) : (
                      vms.map((vm) => {
                        const isActive = vm.name === activeVm;
                        const isRunning = vm.status === 'Running';
                        const isTransitioning = vm.status === 'Starting' || vm.status === 'Stopping';
                        
                        return (
                          <div 
                            key={vm.name}
                            onClick={() => !isTransitioning && handleSelectActiveVm(vm.name)}
                            className={cn(
                              "group flex items-center justify-between p-2 rounded-lg border text-left cursor-pointer transition-all duration-200",
                              isActive 
                                ? "bg-sky-950/20 border-sky-500/50 shadow-[0_0_12px_rgba(14,165,233,0.05)]" 
                                : "bg-muted/40 border-transparent hover:bg-muted/80 hover:border-border"
                            )}
                          >
                            <div className="flex flex-col gap-0.5 min-w-0 flex-1 pr-2">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "w-2 h-2 rounded-full shrink-0",
                                  isRunning ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : 
                                  isTransitioning ? "bg-amber-500 animate-pulse" : "bg-rose-500"
                                )} />
                                <span className="text-xs font-bold text-foreground truncate">{vm.name}</span>
                                {isActive && (
                                  <span className="text-[8px] font-black text-sky-400 uppercase tracking-wide bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-800/40">
                                    Active
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-muted-foreground pl-4">
                                {vm.cpus ? `${vm.cpus} vCPUs` : 'N/A'} • {vm.memory || 'N/A'} {vm.sshLocalPort ? `• SSH: ${vm.sshLocalPort}` : ''}
                              </span>
                            </div>

                            <button
                              onClick={(e) => handleToggleVm(vm.name, vm.status, e)}
                              disabled={isTransitioning}
                              className={cn(
                                "flex items-center justify-center p-1.5 rounded-md border transition-all duration-150 shrink-0",
                                isRunning 
                                  ? "text-rose-400 hover:text-white bg-rose-950/25 border-rose-900/40 hover:bg-rose-500/80 hover:border-rose-400" 
                                  : isTransitioning
                                  ? "text-amber-500 bg-amber-950/10 border-transparent cursor-not-allowed"
                                  : "text-emerald-400 hover:text-white bg-emerald-950/25 border-emerald-900/40 hover:bg-emerald-500/80 hover:border-emerald-400"
                              )}
                            >
                              {isTransitioning ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : isRunning ? (
                                <Square className="w-3.5 h-3.5 fill-current" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-current" />
                              )}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" className="relative w-8 h-8 rounded-md text-muted-foreground">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
            </Button>
            <div className="h-6 w-px bg-border mx-1" />
            <div className="flex items-center gap-2 pl-1">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-bold text-foreground leading-tight">Administrator</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Root Access</p>
              </div>
              <div className="w-8 h-8 rounded-md bg-muted border border-border flex items-center justify-center overflow-hidden">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-background min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
