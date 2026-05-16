import React from 'react';
import { Subscriber } from '@unuko/core';
import { useNavigate } from 'react-router-dom';
import { FiDatabase, FiPlus, FiTrash2, FiRefreshCw, FiInfo, FiTag, FiKey, FiCpu, FiEdit3 } from 'react-icons/fi';

export const InventoryManager: React.FC = () => {
  const navigate = useNavigate();
  const [subscribers, setSubscribers] = React.useState<Subscriber[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/v1/inventory/subscribers');
      const data = await response.json();
      setSubscribers(data);
    } catch (err) {
      console.error('Failed to fetch subscribers:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (imsi: string) => {
    if (!confirm(`Are you sure you want to delete subscriber ${imsi}?`)) return;
    try {
      await fetch(`/v1/inventory/subscribers/${imsi}`, { method: 'DELETE' });
      fetchSubscribers();
    } catch (err) {
      console.error('Failed to delete subscriber:', err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <FiDatabase className="w-8 h-8" />
            </div>
            5G SUBSCRIBER INVENTORY
          </h1>
          <p className="text-slate-400 mt-2 flex items-center gap-2">
            <FiInfo className="w-4 h-4" />
            Synchronized with Open5GS SDM (Subscriber Data Management)
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchSubscribers}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700"
            title="Refresh"
          >
            <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => navigate('/inventory/new')}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <FiPlus className="w-5 h-5" />
            PROVISION NEW IMSI
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && subscribers.length === 0 ? (
          <div className="col-span-full h-64 flex items-center justify-center text-slate-500 bg-slate-900/20 rounded-2xl border border-slate-800 border-dashed">
            <div className="text-center">
              <FiRefreshCw className="w-10 h-10 animate-spin mx-auto mb-4 text-slate-700" />
              <p>Synchronizing with 5G Core...</p>
            </div>
          </div>
        ) : (
          subscribers.map(sub => (
            <div 
              key={sub.imsi}
              className="group relative bg-slate-900/40 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 hover:bg-slate-900/60 transition-all duration-300 backdrop-blur-sm shadow-xl"
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all flex gap-2">
                <button 
                  onClick={() => navigate(`/inventory/edit/${sub.imsi}`)}
                  className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-all"
                  title="Edit Subscriber"
                >
                  <FiEdit3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(sub.imsi)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all"
                  title="Delete from Core"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <FiDatabase className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Subscriber</div>
                  <div className="text-lg font-mono text-white font-bold">{sub.imsi}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 group-hover:border-slate-700 transition-all">
                  <div className="text-[10px] font-bold text-slate-600 uppercase mb-2">Network Credentials</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Auth Key (K)</span>
                    <span className="text-blue-300 font-mono">••••••••••••••••</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className="text-slate-400">Operator ({sub.opType})</span>
                    <span className="text-blue-300 font-mono">••••••••••••••••</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {sub.slices.map((slice, i) => (
                    <div key={i} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-tighter">
                      SST:{slice.sst} {slice.sd ? `SD:${slice.sd}` : ''} {slice.isDefault ? '• Default' : ''}
                    </div>
                  ))}
                  {sub.slices.length === 0 && (
                    <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-tighter">
                      No Slices Provisioned
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && subscribers.length === 0 && (
        <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-slate-800 border-dashed">
          <FiDatabase className="w-16 h-16 mx-auto mb-6 text-slate-800" />
          <h3 className="text-xl font-bold text-slate-300 mb-2">Empty Core Database</h3>
          <p className="text-slate-500">No subscribers found in the Open5GS SDM. Provision your first IMSI to get started.</p>
        </div>
      )}
    </div>
  );
};
