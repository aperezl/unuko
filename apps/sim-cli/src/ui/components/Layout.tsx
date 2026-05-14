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
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const NavItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link 
    to={to}
    className={cn(
      "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
      active 
        ? "bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20" 
        : "text-slate-500 hover:text-slate-200 hover:bg-slate-900/50"
    )}
  >
    {active && (
      <motion.div 
        layoutId="active-nav"
        className="absolute left-0 w-1 h-6 bg-sky-500 rounded-r-full"
      />
    )}
    <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", active && "text-sky-400")} />
    <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
    {active && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
  </Link>
);

export const Layout = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = React.useState('');

  return (
    <div className="h-screen w-full flex bg-[#020617] text-slate-200 overflow-hidden font-sans">
      {/* Persistent Sidebar */}
      <aside className="w-64 border-r border-slate-800/50 flex flex-col bg-slate-950/50 backdrop-blur-2xl z-20">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-1 ring-white/20">
            <Network className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tighter text-white uppercase leading-none">Unuko</h1>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mt-1">Orchestrator</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <div className="px-4 mb-4">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Main Engine</span>
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
          
          <div className="px-4 mt-10 mb-4">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Digital Twin</span>
          </div>
          <NavItem 
            to="/inventory" 
            icon={Database} 
            label="Inventory" 
            active={location.pathname.startsWith('/inventory')} 
          />
          <NavItem 
            to="/analytics" 
            icon={Activity} 
            label="Analytics" 
            active={location.pathname.startsWith('/analytics')} 
          />
        </nav>

        <div className="p-6 border-t border-slate-800/50">
          <NavItem 
            to="/settings" 
            icon={Settings} 
            label="Settings" 
            active={location.pathname.startsWith('/settings')} 
          />
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-black border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">System Status</span>
            </div>
            <p className="text-[10px] font-bold text-emerald-400/80">All services operational</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Persistent TopBar */}
        <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-8 bg-slate-950/20 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search sessions, traces or assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800/50 rounded-2xl pl-12 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all placeholder-slate-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 transition-all relative">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-sky-500 rounded-full border-2 border-slate-900" />
            </button>
            <div className="h-8 w-px bg-slate-800 mx-2" />
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-white">Admin Operator</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Level 4 Access</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-sky-500/10">
                <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center overflow-hidden">
                  <User className="w-6 h-6 text-sky-400" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(56,189,248,0.08),transparent)] pointer-events-none" />
          <Outlet />
        </main>
      </div>
    </div>
  );
};
