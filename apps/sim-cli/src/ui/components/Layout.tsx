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
  Cpu
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Input } from './ui/input';
import { Button } from './ui/button';

const NavItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link 
    to={to}
    className={cn(
      "group flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-150 relative",
      active 
        ? "bg-primary/10 text-primary" 
        : "text-muted-foreground hover:text-foreground hover:bg-accent"
    )}
  >
    <Icon className={cn("w-4 h-4 transition-colors", active && "text-primary")} />
    <span className="text-[12px] font-bold uppercase tracking-wider">{label}</span>
  </Link>
);

export const Layout = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = React.useState('');

  return (
    <div className="h-screen w-full flex bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar - More compact and sharp */}
      <aside className="w-52 border-r border-border flex flex-col bg-card z-20">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shadow-sm">
            <Network className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-[13px] font-black tracking-tight uppercase leading-none">Unuko</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">RSP Engine</p>
          </div>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-1">
          <div className="px-3 mb-2 mt-2">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Orchestration</span>
          </div>
          <NavItem 
            to="/sessions" 
            icon={LayoutGrid} 
            label="Sessions" 
            active={location.pathname.startsWith('/sessions') || location.pathname === '/'} 
          />
          <NavItem 
            to="/designer" 
            icon={Code2} 
            label="Designer" 
            active={location.pathname.startsWith('/designer')} 
          />
          
          <div className="px-3 mt-6 mb-2">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Platform</span>
          </div>
          <NavItem 
            to="/inventory" 
            icon={Database} 
            label="Inventory" 
            active={location.pathname.startsWith('/inventory')} 
          />
          <NavItem 
            to="/network" 
            icon={Network} 
            label="Network" 
            active={location.pathname.startsWith('/network')} 
          />
          <NavItem 
            to="/devices" 
            icon={Cpu} 
            label="Devices" 
            active={location.pathname.startsWith('/devices')} 
          />
          <NavItem 
            to="/analytics" 
            icon={Activity} 
            label="Analytics" 
            active={location.pathname.startsWith('/analytics')} 
          />
        </nav>

        <div className="p-3 border-t border-border bg-muted/20">
          <NavItem 
            to="/settings" 
            icon={Settings} 
            label="Settings" 
            active={location.pathname.startsWith('/settings')} 
          />
          <div className="mt-4 p-2 rounded-md border border-border bg-card">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">System</span>
            </div>
            <p className="text-[10px] font-medium text-emerald-500/80 uppercase">Operational</p>
          </div>
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
