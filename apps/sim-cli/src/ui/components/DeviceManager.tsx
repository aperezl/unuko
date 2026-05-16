import React from 'react';
import { 
  Plus, 
  Trash2, 
  Cpu, 
  Activity, 
  Wifi, 
  Globe, 
  ShieldCheck,
  RefreshCw,
  Signal,
  TowerControl
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Link, useLocation, Outlet } from 'react-router-dom';

interface Device {
  id: string;
  type: 'UE' | 'GNB';
  status: 'RUNNING' | 'STOPPED' | 'ERROR';
  ip?: string;
  mcc?: string;
  mnc?: string;
}

export const DeviceManager = () => {
  const location = useLocation();
  const currentTab = location.pathname.endsWith('/gnb') ? 'gnb' : 'ue';
  
  const [devices, setDevices] = React.useState<Device[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreating, setIsCreating] = React.useState(false);
  
  const [newUE, setNewUE] = React.useState({ imsi: '999700000000001', gnbAddress: '127.0.0.1' });
  const [newGNB, setNewGNB] = React.useState({ mcc: '999', mnc: '70', nci: '00000001', tac: '1', amfAddress: '127.0.0.1' });

  const fetchDevices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/v1/infrastructure/devices');
      const json = await response.json();
      setDevices(json);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDevices();
  }, []);

  const handleCreateUE = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const response = await fetch('/v1/infrastructure/ue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUE)
      });
      if (response.ok) fetchDevices();
    } catch (err) {
      console.error('Failed to create UE:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateGNB = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const response = await fetch('/v1/infrastructure/gnb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGNB)
      });
      if (response.ok) fetchDevices();
    } catch (err) {
      console.error('Failed to create GNB:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteDevice = async (id: string) => {
    try {
      const response = await fetch(`/v1/infrastructure/device/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setDevices(prev => prev.filter(d => d.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete device:', err);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-[#020617] text-slate-200">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">Infrastructure <span className="text-sky-500">Orchestrator</span></h2>
            <div className="flex items-center gap-4 mt-2">
              <Link 
                to="/devices/ue"
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] pb-1 border-b-2 transition-all",
                  currentTab === 'ue' ? "text-sky-500 border-sky-500" : "text-slate-600 border-transparent hover:text-slate-400"
                )}
              >
                User Equipments
              </Link>
              <Link 
                to="/devices/gnb"
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] pb-1 border-b-2 transition-all",
                  currentTab === 'gnb' ? "text-sky-500 border-sky-500" : "text-slate-600 border-transparent hover:text-slate-400"
                )}
              >
                gNodeB Antennas
              </Link>
            </div>
          </div>
          <button 
            onClick={fetchDevices}
            className="p-2 rounded-sm border border-slate-800 hover:bg-slate-900 transition-all text-slate-400 hover:text-white"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Panel */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {currentTab === 'ue' ? (
                <motion.section 
                  key="ue-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-slate-950/40 border border-slate-800/60 p-6 rounded-sm shadow-xl backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Wifi className="w-4 h-4 text-sky-500" />
                    <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-300">Deploy New UE</h3>
                  </div>

                  <form onSubmit={handleCreateUE} className="space-y-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1.5">Subscriber IMSI</label>
                      <input 
                        type="text" 
                        value={newUE.imsi}
                        onChange={e => setNewUE(prev => ({ ...prev, imsi: e.target.value }))}
                        className="w-full bg-black/40 border border-slate-800 rounded-sm px-3 py-2 text-[12px] font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1.5">gNodeB Target (IP)</label>
                      <input 
                        type="text" 
                        value={newUE.gnbAddress}
                        onChange={e => setNewUE(prev => ({ ...prev, gnbAddress: e.target.value }))}
                        className="w-full bg-black/40 border border-slate-800 rounded-sm px-3 py-2 text-[12px] font-mono"
                      />
                    </div>
                    <button 
                      disabled={isCreating}
                      className="w-full mt-4 bg-sky-600 hover:bg-sky-500 text-white py-2.5 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all"
                    >
                      {isCreating ? 'Provisioning...' : 'Start UE Simulation'}
                    </button>
                  </form>
                </motion.section>
              ) : (
                <motion.section 
                  key="gnb-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-slate-950/40 border border-slate-800/60 p-6 rounded-sm shadow-xl backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <TowerControl className="w-4 h-4 text-sky-500" />
                    <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-300">Deploy New gNodeB</h3>
                  </div>

                  <form onSubmit={handleCreateGNB} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1.5">MCC</label>
                        <input 
                          type="text" 
                          value={newGNB.mcc}
                          onChange={e => setNewGNB(prev => ({ ...prev, mcc: e.target.value }))}
                          className="w-full bg-black/40 border border-slate-800 rounded-sm px-3 py-2 text-[12px] font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1.5">MNC</label>
                        <input 
                          type="text" 
                          value={newGNB.mnc}
                          onChange={e => setNewGNB(prev => ({ ...prev, mnc: e.target.value }))}
                          className="w-full bg-black/40 border border-slate-800 rounded-sm px-3 py-2 text-[12px] font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1.5">NCI (ID)</label>
                      <input 
                        type="text" 
                        value={newGNB.nci}
                        onChange={e => setNewGNB(prev => ({ ...prev, nci: e.target.value }))}
                        className="w-full bg-black/40 border border-slate-800 rounded-sm px-3 py-2 text-[12px] font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1.5">AMF Endpoint</label>
                      <input 
                        type="text" 
                        value={newGNB.amfAddress}
                        onChange={e => setNewGNB(prev => ({ ...prev, amfAddress: e.target.value }))}
                        className="w-full bg-black/40 border border-slate-800 rounded-sm px-3 py-2 text-[12px] font-mono"
                      />
                    </div>
                    <button 
                      disabled={isCreating}
                      className="w-full mt-4 bg-sky-600 hover:bg-sky-500 text-white py-2.5 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all"
                    >
                      {isCreating ? 'Provisioning...' : 'Start gNB Simulation'}
                    </button>
                  </form>
                </motion.section>
              )}
            </AnimatePresence>
          </div>

          {/* List Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <Signal className="w-4 h-4 text-slate-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {currentTab === 'ue' ? 'Active User Equipments' : 'Active gNodeB Stations'}
                </span>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {devices.filter(d => d.type === (currentTab === 'ue' ? 'UE' : 'GNB')).length === 0 ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-sm bg-slate-950/20"
                >
                  <Globe className="w-8 h-8 text-slate-800 mb-3" />
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest text-center px-10">
                    No active {currentTab === 'ue' ? 'UE' : 'gNB'} instances found in the current pool
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {devices
                    .filter(d => d.type === (currentTab === 'ue' ? 'UE' : 'GNB'))
                    .map((device, idx) => (
                      <motion.div
                        key={device.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group bg-slate-900/40 border border-slate-800/60 p-4 rounded-sm hover:border-slate-700 transition-all flex items-center gap-6"
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-sm flex items-center justify-center shadow-inner",
                          device.type === 'UE' ? "bg-sky-500/10 text-sky-400" : "bg-purple-500/10 text-purple-400"
                        )}>
                          {device.type === 'UE' ? <Wifi className="w-5 h-5" /> : <TowerControl className="w-5 h-5" />}
                        </div>

                        <div className="flex-1 grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Identity</p>
                            <p className="text-[12px] font-mono font-bold text-slate-200">{device.id}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">{device.type === 'UE' ? 'Assigned IP' : 'Cell Info'}</p>
                            <p className="text-[12px] font-mono font-bold text-sky-500/80">
                              {device.type === 'UE' ? (device.ip || 'Pending...') : `${device.mcc}/${device.mnc}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Status</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="text-[10px] font-black uppercase text-emerald-500/80 tracking-widest">{device.status}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleDeleteDevice(device.id)}
                            className="p-2 rounded-sm bg-slate-950 text-slate-500 hover:text-red-400 border border-slate-800 hover:border-red-900/50 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
