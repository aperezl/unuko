import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Subscriber, Slice } from '@unuko/core';
import { 
  FiArrowLeft, FiSave, FiCpu, FiShield, FiGlobe, 
  FiActivity, FiPlus, FiTrash2, FiServer, FiLock 
} from 'react-icons/fi';

export const ProvisioningForm: React.FC = () => {
  const navigate = useNavigate();
  const { imsi } = useParams();
  const isEdit = !!imsi;

  const [loading, setLoading] = React.useState(isEdit);
  const [formData, setFormData] = React.useState<Partial<Subscriber>>({
    imsi: '',
    k: '465B5CE8B199B49FAA5F0A2EE238A6BC',
    opc: 'E8ED289DEBA952E4283B54E88E6183CA',
    opType: 'OPC',
    amf: '8000',
    slices: [{ sst: 1, sd: '010203', isDefault: true }]
  });

  // Mock de valores extendidos de Open5GS (AMBR, QoS)
  const [extendedData, setExtendedData] = React.useState({
    ambr: { uplink: 1, downlink: 1, unit: 3 }, // Gbps
    accessRestriction: 32, // NR
    tauTimer: 12
  });

  React.useEffect(() => {
    if (isEdit) {
      fetch(`/v1/inventory/subscribers/${imsi}`)
        .then(res => res.json())
        .then(data => {
          setFormData(data);
          setLoading(false);
        });
    }
  }, [imsi, isEdit]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/v1/inventory/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, ...extendedData })
      });
      navigate('/inventory');
    } catch (err) {
      console.error('Failed to save subscriber:', err);
    }
  };

  if (loading) return <div className="p-20 text-center font-mono text-slate-500 animate-pulse">Loading subscriber data...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/inventory')}
          className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight">
            {isEdit ? `Edit Subscriber: ${imsi}` : 'Provision New 5G Subscriber'}
          </h1>
          <p className="text-slate-500 text-sm font-mono mt-1">
            Core: Open5GS • SDM Protocol: MongoDB Direct
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION: IDENTITY & SECURITY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <FiShield /> Identity & Security
            </h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">IMSI (Subscription Identifier)</label>
                <input 
                  disabled={isEdit}
                  value={formData.imsi}
                  onChange={e => setFormData({...formData, imsi: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-all font-mono"
                  placeholder="999700000000001"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Authentication Key (K)</label>
                  <input 
                    value={formData.k}
                    onChange={e => setFormData({...formData, k: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-blue-300 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Operator Key ({formData.opType})</label>
                  <input 
                    value={formData.opc}
                    onChange={e => setFormData({...formData, opc: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-blue-300 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">AMF (Authentication Mgmt)</label>
                  <input 
                    value={formData.amf}
                    onChange={e => setFormData({...formData, amf: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-all font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Operator Type</label>
                  <select 
                    value={formData.opType}
                    onChange={e => setFormData({...formData, opType: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="OPC">OPC</option>
                    <option value="OP">OP</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <FiActivity /> Network AMBR (Total Aggregate)
            </h2>
            <div className="space-y-6">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-slate-400">Maximum Uplink Rate</span>
                  <span className="text-emerald-400 font-bold font-mono">1 Gbps</span>
                </div>
                <input type="range" className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
              </div>
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-slate-400">Maximum Downlink Rate</span>
                  <span className="text-emerald-400 font-bold font-mono">1 Gbps</span>
                </div>
                <input type="range" className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
              </div>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3 text-slate-400 text-xs">
                  <FiGlobe className="text-blue-400" />
                  Access Restriction: <span className="text-white font-mono">NR (5G) Allowed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: SLICES & SESSION MANAGEMENT */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <FiServer /> Network Slices & Session Management
            </h2>
            <button 
              type="button"
              onClick={() => setFormData({
                ...formData,
                slices: [...(formData.slices || []), { sst: 1, sd: '', isDefault: false }]
              })}
              className="px-4 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-bold rounded-lg border border-amber-500/20 transition-all flex items-center gap-2"
            >
              <FiPlus /> ADD SLICE
            </button>
          </div>

          <div className="space-y-4">
            {formData.slices?.map((slice, idx) => (
              <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Slice Service Type (SST)</label>
                    <input 
                      type="number"
                      value={slice.sst || ''}
                      onChange={e => {
                        const newSlices = [...(formData.slices || [])];
                        newSlices[idx].sst = parseInt(e.target.value) || 1;
                        setFormData({ ...formData, slices: newSlices });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-amber-500 transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Slice Differentiator (SD)</label>
                    <input 
                      value={slice.sd || ''}
                      onChange={e => {
                        const newSlices = [...(formData.slices || [])];
                        newSlices[idx].sd = e.target.value;
                        setFormData({ ...formData, slices: newSlices });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-amber-500 transition-all font-mono"
                      placeholder="010203"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">APN / Data Network</label>
                    <input 
                      value="internet"
                      readOnly
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-amber-500 transition-all font-mono opacity-50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">QoS Index (5QI)</label>
                    <select className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-amber-500 transition-all opacity-50" disabled>
                      <option value="9">9 (Default Video/TCP)</option>
                      <option value="5">5 (IMS Signaling)</option>
                      <option value="1">1 (Conversational Voice)</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-center">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={slice.isDefault} 
                        onChange={e => {
                          const newSlices = [...(formData.slices || [])];
                          newSlices[idx].isDefault = e.target.checked;
                          setFormData({ ...formData, slices: newSlices });
                        }}
                        className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0" 
                      />
                      <span className="text-xs text-slate-400 group-hover:text-white transition-all">Default Slice</span>
                    </label>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                      const newSlices = [...(formData.slices || [])];
                      newSlices.splice(idx, 1);
                      setFormData({ ...formData, slices: newSlices });
                    }}
                    className="text-slate-600 hover:text-red-400 transition-all p-1"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button 
            type="button"
            onClick={() => navigate('/inventory')}
            className="px-8 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-all"
          >
            CANCEL
          </button>
          <button 
            type="submit"
            className="px-12 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <FiSave /> {isEdit ? 'UPDATE SUBSCRIBER' : 'PROVISION IMSI'}
          </button>
        </div>
      </form>
    </div>
  );
};
