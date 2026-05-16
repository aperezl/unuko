import React from 'react';
import { Save, X, Wifi, TowerControl, RefreshCw } from 'lucide-react';

interface UEFormData {
  imsi: string;
  gnbAddress: string;
}

interface GNBFormData {
  mcc: string;
  mnc: string;
  nci: string;
  tac: string;
  amfAddress: string;
}

interface DeviceFormProps {
  type: 'UE' | 'GNB';
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export const DeviceForm: React.FC<DeviceFormProps> = ({ 
  type, 
  initialData, 
  onSubmit, 
  onCancel, 
  isProcessing 
}) => {
  const [formData, setFormData] = React.useState(initialData || (
    type === 'UE' 
      ? { imsi: '999700000000001', gnbAddress: '127.0.0.1' }
      : { 
          mcc: '999', 
          mnc: '70', 
          nci: '0x000000010', 
          tac: '1', 
          amfAddress: '127.0.0.5' 
        }
  ));

  const isEdit = !!initialData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <div className={`p-2 rounded-sm ${type === 'UE' ? 'bg-sky-500/10 text-sky-400' : 'bg-purple-500/10 text-purple-400'}`}>
          {type === 'UE' ? <Wifi className="w-5 h-5" /> : <TowerControl className="w-5 h-5" />}
        </div>
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest">
            {isEdit ? 'Edit' : 'Deploy New'} {type === 'UE' ? 'User Equipment' : 'gNodeB'}
          </h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
            Configure network parameters for the virtualized node
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {type === 'UE' ? (
          <>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Subscriber IMSI</label>
              <input 
                type="text"
                disabled={isEdit}
                placeholder="99970XXXXXXXXXX"
                value={(formData as UEFormData).imsi}
                onChange={e => setFormData({ ...formData, imsi: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-500/50 transition-colors disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">gNodeB Target (IP)</label>
              <input 
                type="text"
                value={(formData as UEFormData).gnbAddress}
                onChange={e => setFormData({ ...formData, gnbAddress: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-500/50 transition-colors"
              />
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">MCC</label>
                <input 
                  type="text"
                  value={(formData as GNBFormData).mcc}
                  onChange={e => setFormData({ ...formData, mcc: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">MNC</label>
                <input 
                  type="text"
                  value={(formData as GNBFormData).mnc}
                  onChange={e => setFormData({ ...formData, mnc: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Cell Identity (NCI)</label>
              <input 
                type="text"
                disabled={isEdit}
                value={(formData as GNBFormData).nci}
                onChange={e => setFormData({ ...formData, nci: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500/50 transition-colors disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">AMF Endpoint (IP)</label>
              <input 
                type="text"
                value={(formData as GNBFormData).amfAddress}
                onChange={e => setFormData({ ...formData, amfAddress: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-3 pt-6 border-t border-slate-800">
        <button 
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-sm border border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </button>
        <button 
          type="submit"
          disabled={isProcessing}
          className={`flex-[2] px-4 py-2.5 rounded-sm ${type === 'UE' ? 'bg-sky-600 hover:bg-sky-500' : 'bg-purple-600 hover:bg-purple-500'} text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(2,132,199,0.2)] disabled:opacity-50`}
        >
          {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {isEdit ? 'Update Node' : 'Initialize Node'}
        </button>
      </div>
    </form>
  );
};
