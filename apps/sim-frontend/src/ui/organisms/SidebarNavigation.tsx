import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, 
  Code2, 
  Settings, 
  Network, 
  Database,
  Activity,
  Cpu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarNavigationProps {
  collapsed: boolean;
  onToggle: () => void;
}

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

export function SidebarNavigation({ collapsed, onToggle }: SidebarNavigationProps) {
  const location = useLocation();

  return (
    <aside className={cn(
      "border-r border-border flex flex-col bg-card z-20 transition-all duration-300 shrink-0 h-screen",
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
          onClick={onToggle}
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
  );
}
