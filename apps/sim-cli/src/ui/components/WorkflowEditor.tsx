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
  { id: 'sgp22/initialize', desc: 'Init hardware' },
  { id: 'sgp22/authenticate', desc: 'ES9+ Auth' },
  { id: 'sgp22/downloadProfile', desc: 'ES9+ Get BPP' },
  { id: 'sgp22/installSegment', desc: 'APDU Segment' },
  { id: 'sgp22/getProfilesInfo', desc: 'List Profiles' },
  { id: 'sgp22/manageProfile', desc: 'Enable/Disable' },
  { id: 'sgp22/listNotifications', desc: 'List Notifs' },
  { id: 'sgp22/handleNotification', desc: 'Handle ES9+' },
  { id: 'sgp22/registerSubscriber', desc: '5G Core Reg' },
  { id: 'sgp22/enableConnectivity', desc: 'UE Attach' },
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
      yaml.load(code);
      const newLibrary = [...library.filter(f => f.name !== fileName), { name: fileName, content: code }];
      setLibrary(newLibrary);
      localStorage.setItem('unuko-workflows', JSON.stringify(newLibrary));
      setStatus({ type: 'success', message: 'Saved' });
      setTimeout(() => setStatus({ type: 'idle', message: '' }), 2000);
    } catch (e: any) {
      setStatus({ type: 'error', message: `YAML Error` });
    }
  };

  const handleDelete = (name: string) => {
    const newLibrary = library.filter(f => f.name !== name);
    setLibrary(newLibrary);
    localStorage.setItem('unuko-workflows', JSON.stringify(newLibrary));
  };

  const handleExecute = async () => {
    if (markers.some(m => m.severity === 8)) {
      setStatus({ type: 'error', message: 'Syntax Errors' });
      return;
    }
    try {
      const definition = yaml.load(code);
      const sessionId = await onExecute(definition);
      if (sessionId) {
        navigate(`/session/${sessionId}`);
      }
    } catch (e: any) {
      setStatus({ type: 'error', message: `Execution failed` });
    }
  };

  return (
    <div className="flex h-full bg-[#020617] text-slate-200 overflow-hidden font-sans">
      {/* Sidebar - Compact */}
      <div className="w-48 border-r border-slate-800/60 flex flex-col bg-slate-950/40">
        <div className="p-3 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/10">
          <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-600">Library</h3>
          <button 
            onClick={() => { setFileName('new-workflow.yaml'); setCode(DEFAULT_WORKFLOW); }}
            className="p-1 hover:bg-sky-500/10 rounded-sm transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-sky-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
          {library.map((f) => (
            <div 
              key={f.name}
              className={cn(
                "group flex items-center justify-between p-2 rounded-sm text-[11px] cursor-pointer transition-colors",
                fileName === f.name 
                  ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" 
                  : "hover:bg-slate-900/60 text-slate-500 hover:text-slate-300"
              )}
              onClick={() => { setFileName(f.name); setCode(f.content); }}
            >
              <div className="flex items-center gap-2 truncate">
                <div className={cn(
                  "w-1 h-1 rounded-full",
                  fileName === f.name ? "bg-sky-400" : "bg-slate-800"
                )} />
                <span className="truncate font-bold tracking-tight">{f.name}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(f.name); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          {library.length === 0 && (
            <p className="text-[9px] text-slate-700 uppercase tracking-tight text-center py-10 px-4">No local workflows</p>
          )}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#020617]">
        <div className="h-10 border-b border-slate-800/60 flex items-center justify-between px-4 bg-slate-950/20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-slate-700" />
              <input 
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-[11px] font-bold font-mono text-slate-300 w-40 placeholder-slate-800"
              />
            </div>
            {status.message && (
              <div className={cn(
                "px-2 py-0.5 rounded-sm border text-[9px] font-black uppercase tracking-widest",
                status.type === 'success' ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" : "bg-rose-500/5 text-rose-500 border-rose-500/20"
              )}>
                {status.message}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-sm text-[10px] font-black uppercase tracking-widest border border-slate-800 transition-colors"
            >
              <Save className="w-3 h-3 text-slate-500" />
              Save
            </button>
            <button 
              onClick={handleExecute}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-sky-700 hover:bg-sky-600 text-white rounded-sm text-[10px] font-black uppercase tracking-widest transition-colors active:scale-95 shadow-lg shadow-sky-900/20"
            >
              <Play className="w-3 h-3 fill-current" />
              Execute
            </button>
          </div>
        </div>

        <div className="flex-1 relative">
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
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              padding: { top: 12, bottom: 12 },
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              renderLineHighlight: 'all',
              fontLigatures: true,
            }}
          />
        </div>
      </div>

      {/* Right Sidebar - Diagnostics */}
      <div className="w-64 border-l border-slate-800/60 flex flex-col bg-slate-950/40">
        <div className="flex border-b border-slate-800/60 bg-slate-900/10">
          <button 
            onClick={() => setActiveTab('errors')}
            className={cn(
              "flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2",
              activeTab === 'errors' ? "text-sky-500 border-b border-sky-500" : "text-slate-600 hover:text-slate-400"
            )}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Issues {markers.length > 0 && `(${markers.length})`}
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={cn(
              "flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2",
              activeTab === 'tasks' ? "text-sky-500 border-b border-sky-500" : "text-slate-600 hover:text-slate-400"
            )}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Registry
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 scrollbar-hide">
          {activeTab === 'errors' ? (
            <div className="space-y-2">
              {markers.length > 0 ? (
                markers.map((m, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "p-3 rounded-sm border transition-colors cursor-pointer",
                      m.severity === 8 
                        ? "bg-rose-500/5 border-rose-500/10 text-rose-500" 
                        : "bg-amber-500/5 border-amber-500/10 text-amber-500"
                    )}
                    onClick={() => {
                      if (editorRef.current) {
                        editorRef.current.revealLineInCenter(m.startLineNumber);
                        editorRef.current.setPosition({ lineNumber: m.startLineNumber, column: m.startColumn });
                        editorRef.current.focus();
                      }
                    }}
                  >
                    <p className="text-[10px] leading-tight font-bold mb-1">{m.message}</p>
                    <p className="text-[8px] font-mono opacity-50 uppercase tracking-tighter">Line {m.startLineNumber}</p>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center flex flex-col items-center gap-2 opacity-30">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                  <p className="text-[9px] font-black uppercase tracking-widest">No issues</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <h4 className="text-[9px] font-black uppercase text-slate-700 tracking-widest mb-3 px-1">SGP.22 Services</h4>
              {AVAILABLE_TASKS.map((t) => (
                <div 
                  key={t.id} 
                  className="p-2 rounded-sm bg-slate-900/40 border border-slate-800/40 hover:border-sky-500/20 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold text-sky-600 font-mono tracking-tighter group-hover:text-sky-500">{t.id}</span>
                  </div>
                  <p className="text-[9px] text-slate-600 font-medium uppercase tracking-tighter leading-none">{t.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-slate-800/60 bg-slate-900/20">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-black uppercase text-slate-700 tracking-widest">Build</span>
            <span className="text-[9px] font-mono text-emerald-800 uppercase font-black">v1.0.4-REL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
