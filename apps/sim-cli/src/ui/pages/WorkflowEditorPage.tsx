import React, { useState, useEffect, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import yaml from 'js-yaml';
import { useNavigate } from 'react-router-dom';
import { unukoEngine } from '@unuko/core';
import {
  Save,
  Play,
  Trash2,
  FileCode,
  CheckCircle,
  Terminal,
  BookOpen,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

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

export const WorkflowEditorPage = ({ onExecute }: WorkflowEditorProps) => {
  const navigate = useNavigate();
  const [code, setCode] = useState(DEFAULT_WORKFLOW);
  const [fileName, setFileName] = useState('new-workflow.yaml');
  const [library, setLibrary] = useState<{ name: string; content: string }[]>([]);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [markers, setMarkers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'errors' | 'tasks'>('errors');
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('unuko-workflows');
    if (saved) {
      setLibrary(JSON.parse(saved));
    }
  }, []);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    monaco.editor.onDidChangeMarkers(() => {
      const model = editor.getModel();
      if (model) {
        const currentMarkers = monaco.editor.getModelMarkers({ resource: model.uri });
        setMarkers(currentMarkers);
      }
    });
    // Run initial validation
    validateBusinessRules(code);
  };

  const validateBusinessRules = (currentCode: string) => {
    if (!editorRef.current || !monacoRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    try {
      const parsed = yaml.load(currentCode);
      if (!parsed || typeof parsed !== 'object') {
        monacoRef.current.editor.setModelMarkers(model, 'unuko', []);
        return;
      }

      try {
        unukoEngine.validate(parsed);
        monacoRef.current.editor.setModelMarkers(model, 'unuko', []);
      } catch (zodError: any) {
        if (zodError.issues) {
          const customMarkers = zodError.issues.map((issue: any) => {
            let lineNumber = 1;
            let column = 1;
            let endColumn = 100;

            if (issue.path && issue.path.length > 0) {
              const lines = currentCode.split('\n');
              let currentLineIdx = 0;

              for (const pathSegment of issue.path) {
                const key = String(pathSegment);
                // Search for the key starting from the current line index
                const nextIdx = lines.findIndex((l, i) => i >= currentLineIdx && l.match(new RegExp(`^\\s*${key}:`)));
                if (nextIdx !== -1) {
                  currentLineIdx = nextIdx;
                  lineNumber = currentLineIdx + 1;
                  column = lines[currentLineIdx].indexOf(key) + 1;
                  endColumn = lines[currentLineIdx].length + 1;
                }
              }
            }

            return {
              severity: monacoRef.current.MarkerSeverity.Error,
              message: issue.message,
              startLineNumber: lineNumber,
              startColumn: column,
              endLineNumber: lineNumber,
              endColumn: endColumn,
              source: 'unuko-engine'
            };
          });
          monacoRef.current.editor.setModelMarkers(model, 'unuko', customMarkers);
        }
      }
    } catch (e) {
      // YAML parse errors are handled by monaco-yaml natively
      monacoRef.current.editor.setModelMarkers(model, 'unuko', []);
    }
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
    <div className="flex h-full bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar - Compact */}
      <div className="w-48 border-r border-border flex flex-col bg-muted/20">
        <div className="p-3 border-b border-border flex items-center justify-between bg-muted/40">
          <h3 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Library</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setFileName('new-workflow.yaml'); setCode(DEFAULT_WORKFLOW); }}
            className="h-6 w-6 rounded-sm transition-colors text-primary"
          >
            <FileCode className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
          {library.map((f) => (
            <div
              key={f.name}
              className={cn(
                "group flex items-center justify-between p-2 rounded-md text-[11px] cursor-pointer transition-colors",
                fileName === f.name
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
              onClick={() => { setFileName(f.name); setCode(f.content); }}
            >
              <div className="flex items-center gap-2 truncate">
                <div className={cn(
                  "w-1 h-1 rounded-full",
                  fileName === f.name ? "bg-primary" : "bg-muted-foreground"
                )} />
                <span className="truncate font-bold tracking-tight">{f.name}</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(f.name); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          {library.length === 0 && (
            <p className="text-[9px] text-muted-foreground uppercase tracking-tight text-center py-10 px-4">No local workflows</p>
          )}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <div className="h-10 border-b border-border flex items-center justify-between px-4 bg-muted/20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-[11px] font-bold font-mono text-foreground w-40 placeholder:text-muted-foreground shadow-none h-6 px-1"
              />
            </div>
            {status.message && (
              <div className={cn(
                "px-2 py-0.5 rounded-sm border text-[9px] font-black uppercase tracking-widest",
                status.type === 'success' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"
              )}>
                {status.message}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              className="h-7 text-[10px] font-black uppercase tracking-widest gap-1.5"
            >
              <Save className="w-3 h-3" />
              Save
            </Button>
            <Button
              size="sm"
              onClick={handleExecute}
              className="h-7 text-[10px] font-black uppercase tracking-widest gap-1.5 shadow-lg shadow-primary/20"
            >
              <Play className="w-3 h-3 fill-current" />
              Execute
            </Button>
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
            onChange={(val) => {
              setCode(val || '');
              validateBusinessRules(val || '');
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              padding: { top: 12, bottom: 12 },
              cursorSmoothCaretAnimation: 'off',
              smoothScrolling: false,
              renderLineHighlight: 'all',
              fontLigatures: true,
            }}
          />
        </div>
      </div>

      {/* Right Sidebar - Diagnostics */}
      <div className="w-64 border-l border-border flex flex-col bg-muted/20">
        <div className="flex border-b border-border bg-muted/40">
          <button
            onClick={() => setActiveTab('errors')}
            className={cn(
              "flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2",
              activeTab === 'errors' ? "text-primary border-b border-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Issues {markers.length > 0 && `(${markers.length})`}
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={cn(
              "flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2",
              activeTab === 'tasks' ? "text-primary border-b border-primary" : "text-muted-foreground hover:text-foreground"
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
                      "p-3 rounded-md border transition-colors cursor-pointer",
                      m.severity === 8
                        ? "bg-destructive/10 border-destructive/20 text-destructive"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-500"
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
                <div className="py-20 text-center flex flex-col items-center gap-2 opacity-50">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">No issues</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <h4 className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-3 px-1">SGP.22 Services</h4>
              {AVAILABLE_TASKS.map((t) => (
                <div
                  key={t.id}
                  className="p-2 rounded-md bg-card border border-border hover:border-primary/50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold text-primary font-mono tracking-tighter group-hover:text-primary/80">{t.id}</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter leading-none">{t.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-border bg-card">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Build</span>
            <span className="text-[9px] font-mono text-emerald-500 uppercase font-black">v1.0.4-REL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
