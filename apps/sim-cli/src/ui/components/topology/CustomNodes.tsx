import React from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { cn } from '../../lib/utils';
import { 
  Network, 
  Smartphone, 
  Globe, 
  Cpu, 
  Zap, 
  Server, 
  Radio, 
  ShieldAlert,
  Database,
  ArrowRightLeft
} from 'lucide-react';

// Map icon names to components for ease of use in node data
const iconMap: Record<string, React.ComponentType<any>> = {
  network: Network,
  smartphone: Smartphone,
  globe: Globe,
  cpu: Cpu,
  zap: Zap,
  server: Server,
  radio: Radio,
  database: Database,
  arrow: ArrowRightLeft
};

export type NodeStatus = 'operational' | 'working' | 'failed' | 'pending';

export interface TopologyNodeData extends Record<string, unknown> {
  label: string;
  subLabel?: string;
  icon?: string;
  status?: NodeStatus;
  details?: Record<string, string>;
  category?: 'NETWORK' | 'HARDWARE' | 'SYSTEM';
}

export type CustomNodeProps = NodeProps<Node<TopologyNodeData>>;

const StatusBadge = ({ status }: { status: NodeStatus }) => {
  const statusStyles = {
    operational: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    working: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.15)]',
    failed: 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-bounce shadow-[0_0_15px_rgba(244,63,94,0.3)]',
    pending: 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
  };

  return (
    <span className={cn(
      "text-[8px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border",
      statusStyles[status] || statusStyles.pending
    )}>
      {status}
    </span>
  );
};

export const NetworkNode = ({ data, selected }: CustomNodeProps) => {
  const IconComponent = iconMap[data.icon || 'network'] || Network;
  const status = data.status || 'operational';
  const isFailed = status === 'failed';

  return (
    <div className={cn(
      "glass-card min-w-[220px] p-4 rounded-xl border transition-all duration-300 relative group text-left",
      selected 
        ? "ring-2 ring-indigo-500/50 bg-slate-800/80 shadow-2xl shadow-indigo-500/10 border-indigo-400" 
        : "border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-800/30",
      isFailed && "ring-1 ring-rose-500/50 border-rose-500 bg-rose-950/10 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
    )}>
      {/* Handles */}
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-indigo-500/80 !border-0" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-indigo-500/80 !border-0" />

      {/* Connection point visual indicators */}
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300",
          isFailed 
            ? "bg-rose-500/15 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]" 
            : "bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)] group-hover:scale-105"
        )}>
          {isFailed ? (
            <ShieldAlert className="w-5 h-5 text-rose-500" />
          ) : (
            <IconComponent className="w-5 h-5 text-indigo-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <h3 className={cn(
              "text-[12px] font-bold tracking-wide truncate",
              isFailed ? "text-rose-400" : "text-slate-200"
            )}>
              {data.label}
            </h3>
            <StatusBadge status={status} />
          </div>
          {data.subLabel && (
            <p className="text-[10px] text-slate-400 font-mono tracking-tight truncate">
              {data.subLabel}
            </p>
          )}
        </div>
      </div>

      {/* Node Details expandable/viewable */}
      {data.details && Object.keys(data.details).length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1">
          {Object.entries(data.details).map(([key, val]) => (
            <div key={key} className="flex justify-between items-center text-[9px] font-mono">
              <span className="text-slate-500 uppercase tracking-tighter">{key}</span>
              <span className="text-slate-300 font-medium truncate max-w-[140px]" title={val}>{val}</span>
            </div>
          ))}
        </div>
      )}

      {/* Small glow pulse effect on error */}
      {isFailed && (
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
      )}
    </div>
  );
};

export const HardwareNode = ({ data, selected }: CustomNodeProps) => {
  const IconComponent = iconMap[data.icon || 'smartphone'] || Smartphone;
  const status = data.status || 'operational';
  const isFailed = status === 'failed';

  return (
    <div className={cn(
      "glass-card min-w-[220px] p-4 rounded-xl border transition-all duration-300 relative group text-left",
      selected 
        ? "ring-2 ring-amber-500/50 bg-slate-800/80 shadow-2xl shadow-amber-500/10 border-amber-400" 
        : "border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-800/30",
      isFailed && "ring-1 ring-rose-500/50 border-rose-500 bg-rose-950/10 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
    )}>
      {/* Handles */}
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-amber-500/80 !border-0" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-amber-500/80 !border-0" />

      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300",
          isFailed 
            ? "bg-rose-500/15 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]" 
            : "bg-amber-500/10 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)] group-hover:scale-105"
        )}>
          {isFailed ? (
            <ShieldAlert className="w-5 h-5 text-rose-500" />
          ) : (
            <IconComponent className="w-5 h-5 text-amber-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <h3 className={cn(
              "text-[12px] font-bold tracking-wide truncate",
              isFailed ? "text-rose-400" : "text-slate-200"
            )}>
              {data.label}
            </h3>
            <StatusBadge status={status} />
          </div>
          {data.subLabel && (
            <p className="text-[10px] text-slate-400 font-mono tracking-tight truncate">
              {data.subLabel}
            </p>
          )}
        </div>
      </div>

      {data.details && Object.keys(data.details).length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1">
          {Object.entries(data.details).map(([key, val]) => (
            <div key={key} className="flex justify-between items-center text-[9px] font-mono">
              <span className="text-slate-500 uppercase tracking-tighter">{key}</span>
              <span className="text-slate-300 font-medium truncate max-w-[140px]" title={val}>{val}</span>
            </div>
          ))}
        </div>
      )}

      {isFailed && (
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
      )}
    </div>
  );
};
