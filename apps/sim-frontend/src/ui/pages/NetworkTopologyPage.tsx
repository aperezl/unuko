import React, { useState, useCallback } from 'react';
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  MarkerType,
  Edge,
  Node
} from '@xyflow/react';
import { 
  NetworkNode, 
  HardwareNode, 
  TopologyNodeData 
} from '../../components/topology/CustomNodes';
import { 
  Network, 
  Radio, 
  RefreshCcw, 
  Activity, 
  Terminal,
  Play
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../atoms/Button';

// Node types registration for React Flow
const nodeTypes = {
  network: NetworkNode,
  hardware: HardwareNode,
};

// Initial nodes layout matching Lima (Open5GS + UERANSIM + Unuko RSP / SM-DP+)
const initialNodes: Node<TopologyNodeData>[] = [
  {
    id: 'smdp',
    type: 'network',
    position: { x: 50, y: 50 },
    data: {
      label: 'SM-DP+ Server',
      subLabel: 'Unuko RSP Engine (osmo-smdpp)',
      icon: 'server',
      status: 'working',
      category: 'NETWORK',
      details: {
        'Address': 'smdp.unuko.local',
        'TLS Version': 'TLSv1.3',
        'State': 'PROVISIONING',
        'Active Sessions': '1',
      }
    }
  },
  {
    id: 'ue',
    type: 'hardware',
    position: { x: 50, y: 250 },
    data: {
      label: 'eUICC / Terminal',
      subLabel: 'UERANSIM 5G UE',
      icon: 'smartphone',
      status: 'operational',
      category: 'HARDWARE',
      details: {
        'IMSI': '901700000000001',
        'MSISDN': '+51900000001',
        'EID': '89049032000008888888888888888888',
        'IP Address': '10.45.0.2',
        'Status': 'CONNECTED',
      }
    }
  },
  {
    id: 'gnb',
    type: 'hardware',
    position: { x: 350, y: 250 },
    data: {
      label: 'gNodeB (gNB)',
      subLabel: 'UERANSIM 5G RAN',
      icon: 'radio',
      status: 'operational',
      category: 'HARDWARE',
      details: {
        'PLMN': '901/70',
        'SCTP IP': '192.168.56.10',
        'SCTP Port': '38412',
        'Connected UEs': '1',
        'Radio Band': 'n78 (3.5GHz)',
      }
    }
  },
  {
    id: 'amf',
    type: 'network',
    position: { x: 650, y: 150 },
    data: {
      label: 'Open5GS AMF',
      subLabel: 'Access & Mobility Mgr',
      icon: 'network',
      status: 'operational',
      category: 'NETWORK',
      details: {
        'IP': '127.0.0.5',
        'SCTP Port': '38412',
        'PLMN': '901/70',
        'Connected gNBs': '1',
        'Protocol': 'NGAP / NAS',
      }
    }
  },
  {
    id: 'smf',
    type: 'network',
    position: { x: 650, y: 350 },
    data: {
      label: 'Open5GS SMF',
      subLabel: 'Session Manager',
      icon: 'network',
      status: 'operational',
      category: 'NETWORK',
      details: {
        'IP': '127.0.0.4',
        'PFCP Port': '8805',
        'PFCP State': 'ASSOCIATED',
        'PDU Sessions': '1',
      }
    }
  },
  {
    id: 'udm_udr',
    type: 'network',
    position: { x: 950, y: 150 },
    data: {
      label: 'Open5GS UDM / UDR',
      subLabel: 'Unified Data & Subscriber Repo',
      icon: 'database',
      status: 'operational',
      category: 'NETWORK',
      details: {
        'Database': 'MongoDB',
        'IP Address': '127.0.0.1',
        'Subscriber DB': 'open5gs',
        'Provisioned Profiles': '12',
      }
    }
  },
  {
    id: 'upf',
    type: 'network',
    position: { x: 950, y: 350 },
    data: {
      label: 'Open5GS UPF',
      subLabel: 'User Plane Function',
      icon: 'globe',
      status: 'operational',
      category: 'NETWORK',
      details: {
        'IP Address': '127.0.0.7',
        'Tunnel Dev': 'ogstun',
        'Subnet IPv4': '10.45.0.1/16',
        'Throughput': '1.2 Mbps',
      }
    }
  }
];

// Initial edges matching logical network connectivity in Lima
const initialEdges: Edge[] = [
  {
    id: 'e-ue-smdp',
    source: 'ue',
    target: 'smdp',
    animated: true,
    label: 'ES9+ (RSP Download)',
    style: { stroke: '#a855f7', strokeWidth: 2, strokeDasharray: '5,5' },
    labelStyle: { fill: '#c084fc', fontSize: 8, fontFamily: 'JetBrains Mono', fontWeight: 'bold' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' }
  },
  {
    id: 'e-ue-gnb',
    source: 'ue',
    target: 'gnb',
    animated: true,
    label: '5G Radio Uu',
    style: { stroke: '#f59e0b', strokeWidth: 3 },
    labelStyle: { fill: '#fbbf24', fontSize: 8, fontFamily: 'JetBrains Mono', fontWeight: 'bold' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' }
  },
  {
    id: 'e-gnb-amf',
    source: 'gnb',
    target: 'amf',
    animated: true,
    label: 'N2 (NGAP)',
    style: { stroke: '#6366f1', strokeWidth: 2 },
    labelStyle: { fill: '#818cf8', fontSize: 8, fontFamily: 'JetBrains Mono', fontWeight: 'bold' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
  },
  {
    id: 'e-gnb-upf',
    source: 'gnb',
    target: 'upf',
    animated: true,
    label: 'N3 (GTP-U)',
    style: { stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '4,4' },
    labelStyle: { fill: '#818cf8', fontSize: 8, fontFamily: 'JetBrains Mono', fontWeight: 'bold' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
  },
  {
    id: 'e-amf-smf',
    source: 'amf',
    target: 'smf',
    label: 'N11',
    style: { stroke: '#475569', strokeWidth: 1.5 },
    labelStyle: { fill: '#94a3b8', fontSize: 8, fontFamily: 'JetBrains Mono' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' }
  },
  {
    id: 'e-amf-udm',
    source: 'amf',
    target: 'udm_udr',
    animated: false,
    label: 'N8 / SBI',
    style: { stroke: '#475569', strokeWidth: 1.5 },
    labelStyle: { fill: '#94a3b8', fontSize: 8, fontFamily: 'JetBrains Mono' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' }
  },
  {
    id: 'e-smf-upf',
    source: 'smf',
    target: 'upf',
    animated: true,
    label: 'N4 (PFCP)',
    style: { stroke: '#6366f1', strokeWidth: 2 },
    labelStyle: { fill: '#818cf8', fontSize: 8, fontFamily: 'JetBrains Mono', fontWeight: 'bold' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
  },
  {
    id: 'e-smf-udm',
    source: 'smf',
    target: 'udm_udr',
    label: 'N10',
    style: { stroke: '#475569', strokeWidth: 1.5 },
    labelStyle: { fill: '#94a3b8', fontSize: 8, fontFamily: 'JetBrains Mono' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' }
  }
];

export const NetworkTopologyPage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node<TopologyNodeData> | null>(null);

  // Handle node click to display details
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node as Node<TopologyNodeData>);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Trigger temporary fast packet simulation along edges
  const triggerSimulation = () => {
    setEdges((prev) => 
      prev.map((edge) => ({
        ...edge,
        animated: true,
        style: { ...edge.style, strokeWidth: (edge.style?.strokeWidth as number || 2) + 1 }
      }))
    );
    setTimeout(() => {
      setEdges((prev) => 
        prev.map((edge) => ({
          ...edge,
          animated: edge.id !== 'e-amf-udm' && edge.id !== 'e-amf-smf' && edge.id !== 'e-smf-udm', // restore default animations
          style: { ...edge.style, strokeWidth: edge.id === 'e-ue-gnb' ? 3 : 2 }
        }))
      );
    }, 3000);
  };

  return (
    <div className="h-[calc(100vh-3rem)] w-full flex bg-background text-foreground overflow-hidden">
      {/* Topology Canvas Area */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Top Control and Status Banner */}
        <header className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto bg-slate-900/90 border border-border/80 px-4 py-2 rounded-xl shadow-xl backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-[12px] font-black uppercase tracking-wider text-slate-100">Lima Environment Topology</h2>
              <p className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 uppercase tracking-widest font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                Live Telemetry Connected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 border border-border/80 p-1.5 rounded-xl shadow-xl backdrop-blur-md">
            <Button 
              onClick={triggerSimulation} 
              variant="ghost" 
              size="sm" 
              className="h-8 text-[10px] font-bold uppercase tracking-wider gap-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
            >
              <Play className="w-3.5 h-3.5" />
              Pulse Data Flow
            </Button>
            <div className="w-px h-5 bg-border" />
            <Button 
              onClick={() => {
                setNodes(initialNodes);
                setEdges(initialEdges);
              }} 
              variant="ghost" 
              size="sm" 
              className="h-8 text-[10px] font-bold uppercase tracking-wider gap-1.5 text-slate-400 hover:text-slate-200"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Reset Nodes
            </Button>
          </div>
        </header>

        {/* React Flow Viewport */}
        <div className="flex-1 w-full h-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            fitView
            minZoom={0.5}
            maxZoom={1.5}
            defaultMarkerColor="#6366f1"
          >
            <Background color="#334155" gap={24} size={1} />
            <Controls className="!bg-slate-900 !border-slate-800 !text-slate-400 [&_button]:!bg-slate-900 [&_button]:!border-slate-800 [&_button]:!text-slate-400 [&_button:hover]:!bg-slate-800 [&_path]:!fill-slate-400" />
            <MiniMap 
              position="bottom-left"
              nodeColor={(node) => {
                if (node.data?.status === 'failed') return '#f43f5e';
                return node.data?.category === 'HARDWARE' ? '#d97706' : '#4f46e5';
              }}
              maskColor="rgba(15, 23, 42, 0.6)"
              className="!bg-slate-900 !border-slate-800 !rounded-xl"
            />
          </ReactFlow>
        </div>

        {/* Dashboard Status Footer bar */}
        <footer className="h-10 border-t border-border bg-card flex items-center justify-between px-6 z-10 text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Network Core: <b className="text-slate-300">5 nodes</b>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Radio & Terminal: <b className="text-slate-300">2 nodes</b>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>PLMN: <b className="text-slate-300">901-70 (Test)</b></span>
            <span>Slice SST/SD: <b className="text-slate-300">1 / 000001</b></span>
          </div>
        </footer>
      </div>

      {/* Right high-density inspector sidebar */}
      <aside className={cn(
        "w-80 border-l border-border bg-card flex flex-col z-20 transition-all duration-300 overflow-hidden",
        selectedNode ? "mr-0" : "w-0 border-l-0"
      )}>
        {selectedNode && (
          <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                {selectedNode.data?.category === 'HARDWARE' ? (
                  <Radio className="w-4 h-4 text-amber-400" />
                ) : (
                  <Network className="w-4 h-4 text-indigo-400" />
                )}
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-200">Component Inspector</span>
              </div>
              <Button 
                onClick={() => setSelectedNode(null)} 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 text-[10px] font-bold"
              >
                ✕
              </Button>
            </div>

            {/* General Info Card */}
            <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
              <div className="p-4 bg-muted/40 border border-border rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                    {selectedNode.data?.category} COMPONENT
                  </span>
                  <span className={cn(
                    "text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase",
                    selectedNode.data?.status === 'operational' && "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                    selectedNode.data?.status === 'working' && "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 animate-pulse",
                    selectedNode.data?.status === 'failed' && "bg-rose-500/10 border-rose-500/30 text-rose-400"
                  )}>
                    {selectedNode.data?.status}
                  </span>
                </div>
                <h2 className="text-[15px] font-bold text-slate-100 mb-0.5">
                  {selectedNode.data?.label}
                </h2>
                <p className="text-[10px] text-slate-400 font-mono leading-tight">
                  {selectedNode.data?.subLabel}
                </p>
              </div>

              {/* Node Specifications / Telemetry */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                  Specifications & Config
                </h3>
                <div className="border border-border rounded-xl overflow-hidden bg-card/50">
                  {selectedNode.data?.details && Object.entries(selectedNode.data.details).map(([key, val], index) => (
                    <div 
                      key={key} 
                      className={cn(
                        "flex items-center justify-between p-3 text-[10px] font-mono",
                        index !== 0 && "border-t border-border"
                      )}
                    >
                      <span className="text-slate-500 uppercase tracking-tight">{key}</span>
                      <span className="text-slate-200 font-medium text-right truncate max-w-[150px]">{val as string}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Log inside Inspector */}
              <div className="flex-1 flex flex-col min-h-[150px]">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1 flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-indigo-400" />
                  Recent Actions & Log
                </h3>
                <div className="flex-1 bg-slate-950/80 border border-slate-900 p-3 rounded-xl font-mono text-[9px] text-slate-400 space-y-2 overflow-y-auto">
                  <div className="border-l border-emerald-500 pl-2">
                    <span className="text-slate-600 block">[21:03:05]</span>
                    <span className="text-emerald-400">Initialized connection inside Lima VM</span>
                  </div>
                  <div className="border-l border-slate-800 pl-2">
                    <span className="text-slate-600 block">[21:04:12]</span>
                    <span>Synchronized state with RSP Orchestrator</span>
                  </div>
                  {selectedNode.id === 'smdp' && (
                    <div className="border-l border-indigo-500 pl-2">
                      <span className="text-indigo-400 block">[21:06:44]</span>
                      <span>SM-DP+ serving binding request from IMSI 901700000000001</span>
                    </div>
                  )}
                  {selectedNode.id === 'ue' && (
                    <div className="border-l border-amber-500 pl-2">
                      <span className="text-amber-400 block">[21:07:01]</span>
                      <span>eUICC loaded profile 'Unuko Test v1'</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};
