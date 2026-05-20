import React, { useMemo, useState, useEffect } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  Handle, 
  Position, 
  Node,
  Edge,
  useNodesState,
  useEdgesState
} from '@xyflow/react';
import { 
  Play, 
  CheckCircle, 
  HelpCircle, 
  AlertTriangle, 
  Terminal, 
  Info,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import yaml from 'js-yaml';
import { cn } from '../lib/utils';

// ==========================================
// 🎨 Custom Node Type Component: workflowState
// ==========================================
export const WorkflowStateNode = ({ data, selected }: any) => {
  const { id, config, isInitial, isFinal, isActive, hasOnDone, hasOnError, workflowId } = data;
  
  // Collapsible state persisted in localStorage (defaulting to collapsed/true if not set)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem(`unuko-flow-collapsed-${workflowId}-${id}`);
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const toggleCollapsed = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCollapsed(prev => {
      const newVal = !prev;
      try {
        localStorage.setItem(`unuko-flow-collapsed-${workflowId}-${id}`, String(newVal));
      } catch {}
      return newVal;
    });
  };

  // Extract details from invoke
  const invokeSrc = config?.invoke?.src;
  const invokeInput = config?.invoke?.input;
  
  return (
    <div className={cn(
      "glass-card min-w-[230px] max-w-[280px] rounded-xl border transition-all duration-300 relative text-left bg-slate-950/90",
      isCollapsed ? "p-3 pb-3" : "p-4",
      selected 
        ? "border-sky-400 ring-2 ring-sky-500/30 shadow-2xl shadow-sky-500/10" 
        : "border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/40",
      isActive 
        ? "border-sky-500/80 shadow-[0_0_20px_rgba(56,189,248,0.15)] ring-1 ring-sky-500/20" 
        : "",
      isFinal && "border-emerald-800/80 bg-emerald-950/10 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
    )}>
      {/* Target Handles (Top) - Always a single center target handle */}
      {!isInitial && (
        <Handle 
          type="target" 
          position={Position.Top} 
          id="target-input"
          className="!w-2.5 !h-2.5 !bg-sky-500/80 !border-0 !top-[-5px]" 
          title="Input Target"
        />
      )}

      {/* Source Handles (Bottom) - Always render Success & Error ports for all non-final states */}
      {!isFinal && (
        <>
          <Handle 
            type="source" 
            position={Position.Bottom} 
            id="done-source"
            style={{ left: '30%' }}
            className="!w-2 !h-2 !bg-sky-400 !border-0 !bottom-[-4px]" 
            title="Success Source"
          />
          <Handle 
            type="source" 
            position={Position.Bottom} 
            id="error-source"
            style={{ left: '70%' }}
            className="!w-2 !h-2 !bg-rose-500 !border-0 !bottom-[-4px]" 
            title="Error Source"
          />
        </>
      )}

      {/* Header */}
      <div className={cn(
        "flex items-center justify-between gap-2",
        isCollapsed ? "" : "mb-2 pb-2 border-b border-slate-900"
      )}>
        <div className="flex items-center min-w-0 flex-1">
          <h4 className="text-[11px] font-black text-slate-100 uppercase tracking-tight truncate font-mono">
            {id}
          </h4>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isInitial && (
            <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
              Initial
            </span>
          )}
          {isFinal && (
            <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              Final
            </span>
          )}
          {!isInitial && !isFinal && (
            <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-500">
              State
            </span>
          )}
          <button 
            onClick={toggleCollapsed} 
            className="w-4.5 h-4.5 rounded hover:bg-slate-900 border border-transparent hover:border-slate-800 flex items-center justify-center transition-all duration-200 text-slate-400 hover:text-slate-100 cursor-pointer nodrag"
            title={isCollapsed ? "Expand Details" : "Collapse Details"}
          >
            {isCollapsed ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Body: Task invoke information */}
      {!isCollapsed && (
        <>
          {invokeSrc ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 border border-slate-900/80">
                <div className="w-5 h-5 rounded-md bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                  <Play className="w-2.5 h-2.5 text-sky-400 fill-current" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tight leading-none">Task Source</p>
                  <p className="text-[10px] font-bold text-sky-300 font-mono truncate mt-0.5">{invokeSrc}</p>
                </div>
              </div>
              
              {/* Inputs list */}
              {invokeInput && typeof invokeInput === 'object' && Object.keys(invokeInput).length > 0 && (
                <div className="p-2 rounded-lg bg-slate-900/30 border border-slate-900/30 space-y-1">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-wider mb-1">Inputs</p>
                  {Object.entries(invokeInput).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center text-[9px] font-mono leading-tight gap-1">
                      <span className="text-slate-500 uppercase tracking-tighter truncate max-w-[80px]">{key}</span>
                      <span className="text-slate-300 font-bold truncate max-w-[120px]" title={String(val)}>{String(val)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : isFinal ? (
            <div className="flex items-center gap-2 py-1">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Workflow Terminated</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 py-1">
              <HelpCircle className="w-4 h-4 text-slate-600" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">No Operations</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ==========================================
// 🎨 Custom Edge Type Component: workflowEdge
// ==========================================
export const WorkflowEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  data,
}: any) => {
  const offset = data?.offset || 0;
  
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  
  let controlX1 = sourceX;
  let controlY1 = sourceY + dy * 0.35;
  let controlX2 = targetX;
  let controlY2 = targetY - dy * 0.35;

  if (offset !== 0) {
    // Arched curve: pull both control points in the offset direction (horizontally along X for vertical layouts)
    controlX1 = sourceX + offset;
    controlX2 = targetX + offset;
  }
  
  const path = `M ${sourceX},${sourceY} C ${controlX1},${controlY1} ${controlX2},${controlY2} ${targetX},${targetY}`;

  return (
    <path
      id={id}
      style={style}
      className="react-flow__edge-path"
      d={path}
      markerEnd={markerEnd}
    />
  );
};

// Register custom types
const nodeTypes = {
  workflowState: WorkflowStateNode,
};

const edgeTypes = {
  workflowEdge: WorkflowEdge,
};

// ==========================================
// 🌐 Main WorkflowVisualGraph Component
// ==========================================
interface WorkflowVisualGraphProps {
  yamlCode: string;
}

export const WorkflowVisualGraph = ({ yamlCode }: WorkflowVisualGraphProps) => {
  // Parse yaml and construct the nodes/edges with layouting
  const graphData = useMemo(() => {
    try {
      const parsed: any = yaml.load(yamlCode);
      if (!parsed || typeof parsed !== 'object') {
        return { error: 'Empty configuration' };
      }
      
      const states = parsed.states;
      if (!states || typeof states !== 'object') {
        return { error: 'No states declared in this workflow' };
      }
      
      const initial = parsed.initial;
      const stateIds = Object.keys(states);
      const workflowId = parsed.id || 'default';
      
      const nodes: Node[] = [];
      const edges: Edge[] = [];
      
      // Load saved node positions for this specific workflow from localStorage
      let savedPositions: Record<string, { x: number; y: number }> = {};
      try {
        const saved = localStorage.getItem(`unuko-flow-node-positions-${workflowId}`);
        if (saved) savedPositions = JSON.parse(saved);
      } catch {}

      // Sequential vertical spacing & horizontal leveling BFS
      const visited = new Set<string>();
      const levels: Record<string, number> = {};
      const queue: { id: string; level: number }[] = [];
      
      if (initial && states[initial]) {
        queue.push({ id: initial, level: 0 });
      }
      
      while (queue.length > 0) {
        const { id, level } = queue.shift()!;
        if (visited.has(id)) continue;
        visited.add(id);
        levels[id] = level;
        
        const config = states[id];
        if (config && config.invoke) {
          // Check onDone transitions
          const onDone = config.invoke.onDone;
          const onDoneTarget = typeof onDone === 'string' ? onDone : onDone?.target;
          if (onDoneTarget && states[onDoneTarget] && !visited.has(onDoneTarget)) {
            queue.push({ id: onDoneTarget, level: level + 1 });
          }
          
          // Check onError transitions
          const onError = config.invoke.onError;
          const onErrorTarget = typeof onError === 'string' ? onError : onError?.target;
          if (onErrorTarget && states[onErrorTarget] && !visited.has(onErrorTarget)) {
            queue.push({ id: onErrorTarget, level: level + 1 });
          }
        }
      }
      
      // Handle disconnected or unvisited states (like static final states)
      stateIds.forEach((id, index) => {
        if (levels[id] === undefined) {
          levels[id] = visited.size > 0 ? Math.max(...Object.values(levels)) + 1 : index;
        }
      });
      
      // Calculate level metrics to center vertically
      const levelCounts: Record<number, number> = {};
      stateIds.forEach(id => {
        const lvl = levels[id];
        levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;
      });
      
      const levelIndices: Record<number, number> = {};
      
      // Create Nodes
      stateIds.forEach(id => {
        const lvl = levels[id];
        const index = levelIndices[lvl] || 0;
        levelIndices[lvl] = index + 1;
        
        const totalInLevel = levelCounts[lvl];
        
        // Centered horizontal spacing: 320px separation (columns in same level)
        const x = 400 + (index - (totalInLevel - 1) / 2) * 320;
        // Vertical spacing: 240px per row (sequential levels)
        const y = 60 + lvl * 240;
        
        const isInitial = id === initial;
        const isFinal = states[id]?.type === 'final' || id === 'done' || id === 'failure' || id === 'error';
        
        const config = states[id];
        const onDoneTarget = config?.invoke?.onDone 
          ? (typeof config.invoke.onDone === 'string' ? config.invoke.onDone : config.invoke.onDone?.target)
          : null;
        const onErrorTarget = config?.invoke?.onError
          ? (typeof config.invoke.onError === 'string' ? config.invoke.onError : config.invoke.onError?.target)
          : null;

        const hasOnDone = !!(onDoneTarget && states[onDoneTarget]);
        const hasOnError = !!(onErrorTarget && states[onErrorTarget]);

        // Restored position if it exists, otherwise default layout
        const position = savedPositions[id] || { x, y };

        nodes.push({
          id,
          type: 'workflowState',
          position,
          draggable: true,
          data: {
            id,
            config,
            isInitial,
            isFinal,
            isActive: isInitial, // default highlighted node
            hasOnDone,
            hasOnError,
            workflowId
          }
        });
        
        // Create Edges
        if (config && config.invoke) {
          const onDone = config.invoke.onDone;
          const onDoneTarget = typeof onDone === 'string' ? onDone : onDone?.target;
          const onError = config.invoke.onError;
          const onErrorTarget = typeof onError === 'string' ? onError : onError?.target;
          
          const hasBothToSameTarget = onDoneTarget && onErrorTarget && onDoneTarget === onErrorTarget;

          // onDone Transition
          if (onDoneTarget && states[onDoneTarget]) {
            edges.push({
              id: `${id}-done-${onDoneTarget}`,
              source: id,
              sourceHandle: 'done-source',
              target: onDoneTarget,
              targetHandle: 'target-input',
              type: 'workflowEdge',
              animated: true,
              data: { offset: hasBothToSameTarget ? -20 : 0 },
              style: { stroke: '#38bdf8', strokeWidth: 2 }
            });
          }
          
          // onError Transition
          if (onErrorTarget && states[onErrorTarget]) {
            edges.push({
              id: `${id}-error-${onErrorTarget}`,
              source: id,
              sourceHandle: 'error-source',
              target: onErrorTarget,
              targetHandle: 'target-input',
              type: 'workflowEdge',
              data: { offset: hasBothToSameTarget ? 20 : 0 },
              style: { stroke: '#ef4444', strokeWidth: 1.5, strokeDasharray: '4 4' }
            });
          }
        }
      });
      
      return { id: workflowId, nodes, edges };
    } catch (err: any) {
      return { id: 'default', error: err.message || 'Invalid YAML' };
    }
  }, [yamlCode]);

  const workflowId = graphData.id || 'default';

  // React Flow local states for smooth drag interactive editing
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  // Sync parsed schema modifications with React Flow state
  useEffect(() => {
    if (graphData.nodes) {
      setNodes(graphData.nodes);
    }
    if (graphData.edges) {
      setEdges(graphData.edges);
    }
  }, [graphData.nodes, graphData.edges]);

  // Persist node dragging coordinates in localStorage
  const onNodeDragStop = (event: any, node: any) => {
    try {
      const key = `unuko-flow-node-positions-${workflowId}`;
      const saved = localStorage.getItem(key);
      const positions = saved ? JSON.parse(saved) : {};
      positions[node.id] = node.position;
      localStorage.setItem(key, JSON.stringify(positions));
    } catch (e) {
      console.error('Failed to save node position:', e);
    }
  };

  // Persist zoom / pan viewport coordinates in localStorage
  const onMoveEnd = (event: any, viewport: any) => {
    if (viewport) {
      localStorage.setItem(`unuko-flow-viewport-${workflowId}`, JSON.stringify(viewport));
    }
  };

  // Retrieve saved defaultViewport upon mount
  const defaultViewport = useMemo(() => {
    const saved = localStorage.getItem(`unuko-flow-viewport-${workflowId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return undefined;
      }
    }
    return undefined;
  }, [workflowId]);

  // Handle parsing syntax errors gracefully
  if (graphData.error) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-background/50 p-10 select-none">
        <div className="max-w-md w-full border border-slate-800 rounded-xl p-6 bg-slate-950/80 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-rose-500 animate-pulse" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-100 mb-2">
            Awaiting Valid YAML Schema
          </h3>
          <p className="text-[10px] text-slate-400 leading-relaxed font-mono max-h-36 overflow-y-auto w-full p-2 bg-slate-900/50 rounded-lg border border-slate-900 mb-4 select-text text-left">
            {graphData.error}
          </p>
          <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500">
            <Info className="w-3.5 h-3.5 text-slate-600" />
            <span>Switch back to YAML Editor to resolve diagnostic errors.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative bg-background overflow-hidden">
      {/* Dynamic Graph Telemetry Info Bar */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-slate-950/90 border border-slate-800/80 px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-md pointer-events-none select-none">
        <Terminal className="w-3.5 h-3.5 text-sky-400" />
        <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-slate-400">
          State Machine: <b className="text-slate-100 font-black">{(graphData.nodes || []).length} states</b>
        </span>
      </div>

      <ReactFlow
        key={workflowId} // Remount to apply fresh viewport and positions cleanly when switching workflows
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onMoveEnd={onMoveEnd}
        defaultViewport={defaultViewport}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView={!defaultViewport}
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background color="#334155" gap={20} size={1} />
        <Controls className="!bg-slate-900 !border-slate-800 !text-slate-400 [&_button]:!bg-slate-900 [&_button]:!border-slate-800 [&_button]:!text-slate-400 [&_button:hover]:!bg-slate-800 [&_path]:!fill-slate-400" />
        <MiniMap 
          position="bottom-left"
          nodeColor={(node) => {
            if (node.data?.isFinal) return '#10b981';
            if (node.data?.isActive) return '#0ea5e9';
            return '#475569';
          }}
          maskColor="rgba(15, 23, 42, 0.7)"
          className="!bg-slate-900 !border-slate-800 !rounded-lg"
        />
      </ReactFlow>
    </div>
  );
};
