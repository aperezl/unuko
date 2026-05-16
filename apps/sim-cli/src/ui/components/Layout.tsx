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
  ChevronRight,
  Database,
  Activity,
  Cpu
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const NavItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link 
    to={to}
    className={cn(
      "group flex items-center gap-2 px-3 py-2 rounded-sm transition-colors duration-150 relative",
      active 
        ? "bg-sky-500/10 text-sky-400 border-l-2 border-sky-500" 
        : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/40"
    )}
  >
    <Icon className={cn("w-4 h-4 transition-colors", active && "text-sky-400")} />
    <span className="text-[12px] font-bold uppercase tracking-wider">{label}</span>
  </Link>
);

export const Layout = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = React.useState('');

  return (
    <div className="h-screen w-full flex bg-[#020617] text-slate-200 overflow-hidden font-sans">
      {/* Sidebar - More compact and sharp */}
      <aside className="w-52 border-r border-slate-800/60 flex flex-col bg-slate-950/80 z-20">
        <div className="p-4 border-b border-slate-800/60 flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-sky-600 flex items-center justify-center shadow-sm ring-1 ring-white/10">
            <Network className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[13px] font-black tracking-tight text-white uppercase leading-none">Unuko</h1>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">RSP Engine</p>
          </div>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-1">
          <div className="px-3 mb-2 mt-2">
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Orchestration</span>
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
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Platform</span>
          </div>
          <NavItem 
            to="/inventory" 
            icon={Database} 
            label="Inventory" 
            active={location.pathname.startsWith('/inventory')} 
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

        <div className="p-3 border-t border-slate-800/60 bg-black/20">
          <NavItem 
            to="/settings" 
            icon={Settings} 
            label="Settings" 
            active={location.pathname.startsWith('/settings')} 
          />
          <div className="mt-4 p-2 rounded-sm border border-slate-800/50 bg-slate-900/20">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
              <span className="text-[9px] font-bold uppercase text-slate-600 tracking-widest">System</span>
            </div>
            <p className="text-[10px] font-medium text-emerald-500/60 uppercase">Operational</p>
          </div>
        </div>
      </aside>

      {/* Main Area - Reduced TopBar and sharper elements */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-12 border-b border-slate-800/60 flex items-center justify-between px-6 bg-slate-950/40 z-10">
          <div className="flex items-center gap-4 flex-1 max-w-lg">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
              <input 
                type="text" 
                placeholder="Global search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/40 border border-slate-800/60 rounded-sm pl-10 pr-3 py-1.5 text-[12px] font-medium focus:outline-none focus:border-sky-500/40 transition-colors placeholder-slate-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-sm border border-slate-800/60 flex items-center justify-center hover:bg-slate-900 transition-colors relative text-slate-500 hover:text-slate-300">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-sky-500 rounded-full" />
            </button>
            <div className="h-6 w-px bg-slate-800 mx-1" />
            <div className="flex items-center gap-2 pl-1">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-bold text-slate-300 leading-tight">Administrator</p>
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Root Access</p>
              </div>
              <div className="w-8 h-8 rounded-sm bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                <User className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
