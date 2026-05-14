import React, { useState, useEffect, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import yaml from 'js-yaml';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  Play, 
  Trash2, 
  FileCode, 
  CheckCircle, 
  AlertCircle, 
  Terminal, 
  Settings, 
  BookOpen, 
  ChevronRight,
  ShieldAlert,
  Zap,
  Code2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface WorkflowEditorProps {
  onExecute: (definition: any) => Promise<string | void>;
}

const DEFAULT_WORKFLOW = `id: custom-workflow
initial: init
states:
  init:
    invoke:
      src: sgp22/initialize
      onDone: download
  download:
    invoke:
      src: sgp22/authenticate
      onDone:
        target: done
        assign:
          transactionId: "\${event.data.transactionId}"
  done:
    type: final
`;

const AVAILABLE_TASKS = [
  { id: 'sgp22/initialize', desc: 'Initialize crypto and hardware' },
  { id: 'sgp22/authenticate', desc: 'ES9+ Initiate Authentication' },
  { id: 'sgp22/downloadProfile', desc: 'ES9+ Get Bound Profile Package' },
  { id: 'sgp22/installSegment', desc: 'Transmit APDU segment to eUICC' },
  { id: 'sgp22/getProfilesInfo', desc: 'Query eUICC for profile list' },
  { id: 'sgp22/manageProfile', desc: 'Enable/Disable/Delete profile' },
  { id: 'sgp22/listNotifications', desc: 'List pending notifications' },
  { id: 'sgp22/handleNotification', desc: 'Handle ES9+ notification' },
  { id: 'sgp22/registerSubscriber', desc: 'Register in 5G Core (Open5GS)' },
  { id: 'sgp22/enableConnectivity', desc: 'Trigger UERANSIM attach' },
];

export const WorkflowEditor = ({ onExecute }: WorkflowEditorProps) => {
  const navigate = useNavigate();
  const [code, setCode] = useState(DEFAULT_WORKFLOW);
  const [fileName, setFileName] = useState('new-workflow.yaml');
  const [library, setLibrary] = useState<{ name: string; content: string }[]>([]);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [markers, setMarkers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'errors' | 'tasks'>('errors');
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('unuko-workflows');
    if (saved) {
      setLibrary(JSON.parse(saved));
    }
  }, []);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Listen for validation markers (errors, warnings)
    monaco.editor.onDidChangeMarkers(() => {
      const model = editor.getModel();
      if (model) {
        const currentMarkers = monaco.editor.getModelMarkers({ resource: model.uri });
        setMarkers(currentMarkers);
      }
    });
  };

  const handleSave = () => {
    try {
      yaml.load(code); // Validate YAML
      const newLibrary = [...library.filter(f => f.name !== fileName), { name: fileName, content: code }];
      setLibrary(newLibrary);
      localStorage.setItem('unuko-workflows', JSON.stringify(newLibrary));
      setStatus({ type: 'success', message: 'Workflow saved successfully' });
      setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
    } catch (e: any) {
      setStatus({ type: 'error', message: `Invalid YAML: ${e.message}` });
    }
  };

  const handleDelete = (name: string) => {
    const newLibrary = library.filter(f => f.name !== name);
    setLibrary(newLibrary);
    localStorage.setItem('unuko-workflows', JSON.stringify(newLibrary));
  };

  const handleExecute = async () => {
    if (markers.some(m => m.severity === 8)) { // 8 is Error in Monaco
      setStatus({ type: 'error', message: 'Cannot execute workflow with syntax errors' });
      return;
    }
    try {
      const definition = yaml.load(code);
      const sessionId = await onExecute(definition);
      if (sessionId) {
        navigate(`/session/${sessionId}`);
      }
    } catch (e: any) {
      setStatus({ type: 'error', message: `Execution failed: ${e.message}` });
    }
  };

  return (
    <div className="flex h-full bg-[#020617] text-slate-200 overflow-hidden font-sans">
      {/* Left Sidebar - Library */}
      <div className="w-64 border-r border-slate-800/50 flex flex-col bg-slate-950/50 backdrop-blur-xl">
        <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Workflow Library</h3>
          <button 
            onClick={() => { setFileName('new-workflow.yaml'); setCode(DEFAULT_WORKFLOW); }}
            className="p-1.5 hover:bg-sky-500/10 rounded-lg transition-all group"
            title="New Workflow"
          >
            <FileCode className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
          {library.map((f) => (
            <div 
              key={f.name}
              className={cn(
                "group flex items-center justify-between p-3 rounded-xl text-xs cursor-pointer transition-all duration-300",
                fileName === f.name 
                  ? "bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/30 shadow-lg shadow-sky-500/5" 
                  : "hover:bg-slate-900/80 text-slate-400 hover:text-slate-200"
              )}
              onClick={() => { setFileName(f.name); setCode(f.content); }}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  fileName === f.name ? "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]" : "bg-slate-700"
                )} />
                <span className="truncate font-medium">{f.name}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(f.name); }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-rose-400 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {library.length === 0 && (
            <div className="py-10 text-center space-y-3 px-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto border border-slate-800">
                <Code2 className="w-5 h-5 text-slate-700" />
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed uppercase tracking-tight">No saved workflows found. Create your first one above.</p>
            </div>
          )}
        </div>
      </div>

      {/* Center - Monaco Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#020617]">
        {/* Toolbar */}
        <div className="h-14 border-b border-slate-800/50 flex items-center justify-between px-6 bg-slate-950/20 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-500" />
              <input 
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm font-bold font-mono text-white w-48 placeholder-slate-600"
              />
            </div>
            <AnimatePresence mode="wait">
              {status.message && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className={cn(
                    "flex items-center gap-2 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border shadow-sm",
                    status.type === 'success' 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5" 
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/5"
                  )}
                >
                  {status.type === 'success' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {status.message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-800 shadow-xl"
            >
              <Save className="w-3.5 h-3.5 text-slate-400" />
              Save
            </button>
            <button 
              onClick={handleExecute}
              className="flex items-center gap-2 px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-sky-600/20 transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Run Workflow
            </button>
          </div>
        </div>

        {/* Monaco Editor Container */}
        <div className="flex-1 relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
          <Editor
            height="100%"
            path={fileName}
            defaultLanguage="yaml"
            theme="unuko-dark"
            value={code}
            onMount={handleEditorMount}
            onChange={(val) => setCode(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              lineNumbers: 'on',
              roundedSelection: true,
              scrollBeyondLastLine: false,
              readOnly: false,
              padding: { top: 24, bottom: 24 },
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              contextmenu: true,
              renderLineHighlight: 'all',
              fontLigatures: true,
            }}
          />
        </div>
      </div>

      {/* Right Sidebar - Debug & Info */}
      <div className="w-80 border-l border-slate-800/50 flex flex-col bg-slate-950/80 backdrop-blur-2xl">
        <div className="flex border-b border-slate-800/50">
          <button 
            onClick={() => setActiveTab('errors')}
            className={cn(
              "flex-1 py-4 text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2",
              activeTab === 'errors' ? "text-sky-400 border-b-2 border-sky-400" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Diagnostics
            {markers.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] flex items-center justify-center animate-pulse">
                {markers.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={cn(
              "flex-1 py-4 text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2",
              activeTab === 'tasks' ? "text-sky-400 border-b-2 border-sky-400" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <BookOpen className="w-3.5 h-3.5" />
            API Specs
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          {activeTab === 'errors' ? (
            <div className="space-y-4">
              {markers.length > 0 ? (
                markers.map((m, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i}
                    className={cn(
                      "p-4 rounded-2xl border transition-all cursor-pointer hover:bg-slate-900/50",
                      m.severity === 8 
                        ? "bg-rose-500/5 border-rose-500/20 text-rose-300" 
                        : "bg-amber-500/5 border-amber-500/20 text-amber-300"
                    )}
                    onClick={() => {
                      if (editorRef.current) {
                        editorRef.current.revealLineInCenter(m.startLineNumber);
                        editorRef.current.setPosition({ lineNumber: m.startLineNumber, column: m.startColumn });
                        editorRef.current.focus();
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0",
                        m.severity === 8 ? "bg-rose-500/20" : "bg-amber-500/20"
                      )}>
                        <AlertCircle className="w-2.5 h-2.5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] leading-relaxed font-medium">
                          {m.message}
                        </p>
                        <p className="text-[9px] font-mono opacity-50 uppercase">
                          Line {m.startLineNumber}, Col {m.startColumn}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">No Issues Detected</h4>
                    <p className="text-[10px] text-slate-500 mt-1 px-6">YAML schema validation is active and healthy.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Core SGP.22 Tasks</h4>
              {AVAILABLE_TASKS.map((t) => (
                <div 
                  key={t.id} 
                  className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-sky-500/30 transition-all group cursor-pointer"
                  onClick={() => {
                    // Could implement auto-insert here
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-sky-400 font-mono tracking-tight">{t.id}</span>
                    <Zap className="w-3 h-3 text-slate-600 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">{t.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Debug Info */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-900/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Environment</span>
            <span className="text-[9px] font-mono text-emerald-500 uppercase">Production-Ready</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-slate-800">
             <Settings className="w-3 h-3 text-slate-600 animate-spin-slow" />
             <span className="text-[9px] font-mono text-slate-500">unuko-orchestrator-v1.0.4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
