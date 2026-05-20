import React from 'react';
import { Outlet } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import { SidebarNavigation } from '../organisms/SidebarNavigation';
import { SearchInput } from '../molecules/SearchInput';
import { Button } from '../atoms/Button';
import { environmentRepository } from '../../infrastructure/adapters/HttpEnvironmentRepository';
import { cn } from '../../lib/utils';

export function DashboardLayout() {
  const [collapsed, setCollapsed] = React.useState(() => {
    return localStorage.getItem('unuko-sidebar-collapsed') === 'true';
  });
  const [environment, setEnvironment] = React.useState<'mock' | 'lima'>('mock');

  React.useEffect(() => {
    environmentRepository.getEnvironment()
      .then(setEnvironment)
      .catch(err => console.error('Failed to fetch environment:', err));
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

        <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-background min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
