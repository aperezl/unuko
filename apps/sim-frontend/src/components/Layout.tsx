import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutGrid, 
  Code2, 
  Settings, 
  Network, 
  Bell, 
  Search, 
  User,
  Database,
  Activity,
  Cpu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Input } from './ui/input';
import { Button } from './ui/button';

const NavItem = ({ to, icon: Icon, label, active, collapsed }: { to: string, icon: any, label: string, active: boolean, collapsed?: boolean }) => (
  <Link 
    to={to}
    className={cn(
      "group flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-150 relative border border-transparent",
      active 
        ? "bg-primary/10 text-primary border-primary/20" 
        : "text-muted-foreground hover:text-foreground hover:bg-accent",
      collapsed && "justify-center px-1"
    )}
    title={collapsed ? label : undefined}
  >
    <Icon className={cn("w-4 h-4 transition-colors shrink-0", active && "text-primary")} />
    {!collapsed && <span className="text-[12px] font-bold uppercase tracking-wider">{label}</span>}
  </Link>
);

export const Layout = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [collapsed, setCollapsed] = React.useState(() => {
    return localStorage.getItem('unuko-sidebar-collapsed') === 'true';
  });
  const [environment, setEnvironment] = React.useState<'mock' | 'lima'>('mock');

  React.useEffect(() => {
    fetch('/v1/orchestrator/environment')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data && data.environment) setEnvironment(data.environment);
      })
      .catch(err => console.error('Failed to fetch environment:', err));
  }, []);

  const toggleEnvironment = async () => {
    const nextEnv = environment === 'mock' ? 'lima' : 'mock';
    try {
      const response = await fetch('/v1/orchestrator/environment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ environment: nextEnv })
      });
      const data = await response.json();
      if (data.environment) {
        setEnvironment(data.environment);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSidebar = () => {
    const nextValue = !collapsed;
    setCollapsed(nextValue);
    localStorage.setItem('unuko-sidebar-collapsed', String(nextValue));
  };

  return (
    <div className="h-screen w-full flex bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar - Collapsible & Premium transition */}
      <aside className={cn(
        "border-r border-border flex flex-col bg-card z-20 transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-52"
      )}>
        <div className={cn(
          "p-4 border-b border-border flex items-center justify-between overflow-hidden",
          collapsed && "flex-col justify-center gap-2 p-3"
        )}>
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shadow-sm shrink-0">
              <Network className="w-4 h-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <h1 className="text-[13px] font-black tracking-tight uppercase leading-none">Unuko</h1>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">RSP Engine</p>
              </div>
            )}
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-slate-800 text-muted-foreground hover:text-foreground transition-all shrink-0 cursor-pointer"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto scrollbar-hide">
          {!collapsed && (
            <div className="px-3 mb-2 mt-2">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Orchestration</span>
            </div>
          )}
          <NavItem 
            to="/sessions" 
            icon={LayoutGrid} 
            label="Sessions" 
            active={location.pathname.startsWith('/sessions') || location.pathname === '/'} 
            collapsed={collapsed}
          />
          <NavItem 
            to="/designer" 
            icon={Code2} 
            label="Designer" 
            active={location.pathname.startsWith('/designer')} 
            collapsed={collapsed}
          />
          
          {!collapsed && (
            <div className="px-3 mt-6 mb-2">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Platform</span>
            </div>
          )}
          <NavItem 
            to="/inventory" 
            icon={Database} 
            label="Inventory" 
            active={location.pathname.startsWith('/inventory')} 
            collapsed={collapsed}
          />
          <NavItem 
            to="/devices" 
            icon={Cpu} 
            label="Devices" 
            active={location.pathname.startsWith('/devices')} 
            collapsed={collapsed}
          />
          <NavItem 
            to="/network" 
            icon={Network} 
            label="Network" 
            active={location.pathname.startsWith('/network')} 
            collapsed={collapsed}
          />
          <NavItem 
            to="/analytics" 
            icon={Activity} 
            label="Analytics" 
            active={location.pathname.startsWith('/analytics')} 
            collapsed={collapsed}
          />
        </nav>

        <div className="p-3 border-t border-border bg-muted/20">
          <NavItem 
            to="/settings" 
            icon={Settings} 
            label="Settings" 
            active={location.pathname.startsWith('/settings')} 
            collapsed={collapsed}
          />
          
          {collapsed ? (
            <div className="flex justify-center mt-3" title="System Operational">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
          ) : (
            <div className="mt-4 p-2 rounded-md border border-border bg-card">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">System</span>
              </div>
              <p className="text-[10px] font-medium text-emerald-500/80 uppercase">Operational</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Area - Reduced TopBar and sharper elements */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-12 border-b border-border flex items-center justify-between px-6 bg-card z-10">
          <div className="flex items-center gap-4 flex-1 max-w-lg">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
              <Input 
                type="text" 
                placeholder="Global search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-8 bg-background border-border text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-muted/60 border border-border p-0.5 rounded-lg mr-2">
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
              <Button 
                variant={environment === 'lima' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={environment === 'lima' ? undefined : toggleEnvironment}
                className={cn(
                  "h-7 text-[10px] font-black uppercase tracking-wider px-2.5 rounded-md transition-all duration-200",
                  environment === 'lima' 
                    ? "bg-sky-500 hover:bg-sky-600 text-white shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                )}
              >
                LIMA (5G)
              </Button>
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

        <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
