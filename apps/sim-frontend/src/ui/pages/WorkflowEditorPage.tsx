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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { WorkflowVisualGraph } from '../../components/WorkflowVisualGraph';
import { sessionRepository } from '../../infrastructure/adapters/HttpSessionRepository';

const SGP22_PROVISIONING_TEMPLATE = `id: sgp22-provisioning
initial: initializing
context:
  smdpAddress: localhost
  iccid: 89049032000001000001
states:
  initializing:
    invoke:
      src: sgp22/initialize
      onDone: authenticating
      onError: failure
  authenticating:
    invoke:
      src: sgp22/authenticate
      input:
        smdpAddress: "\${context.smdpAddress}"
      onDone:
        target: downloading
        assign:
          transactionId: "\${event.data.transactionId}"
      onError: failure
  downloading:
    invoke:
      src: sgp22/downloadProfile
      input:
        transactionId: "\${context.transactionId}"
        smdpAddress: "\${context.smdpAddress}"
      onDone:
        target: registering_in_core
        assign:
          boundProfilePackage: "\${event.data}"
      onError: failure
  registering_in_core:
    invoke:
      src: sgp22/registerSubscriber
      input:
        iccid: "\${context.iccid}"
      onDone: activating_connectivity
      onError: activating_connectivity
  activating_connectivity:
    invoke:
      src: sgp22/enableConnectivity
      onDone: done
      onError: done
  done:
    type: final
`;

const SGP22_INVENTORY_TEMPLATE = `id: sgp22-inventory
initial: fetching_profiles
states:
  fetching_profiles:
    invoke:
      src: sgp22/getProfilesInfo
      onDone: logging_result
      onError: failure
  logging_result:
    invoke:
      src: sgp22/logEventInvoke
      input:
        description: "Profiles listed successfully from eUICC"
        payload: "\${event.data}"
      onDone: done
      onError: failure
  done:
    type: final
`;

const SGP22_PROFILE_CONTROL_TEMPLATE = `id: sgp22-profile-control
initial: executing_action
context:
  iccid: 89049032000001000001
  action: enable
states:
  executing_action:
    invoke:
      src: sgp22/manageProfile
      input:
        iccid: "\${context.iccid}"
        action: "\${context.action}"
      onDone: logging_refresh
      onError: failure
  logging_refresh:
    invoke:
      src: sgp22/logEventInvoke
      input:
        description: "Simulating Profile Refresh (REUICC) after action"
      onDone: done
      onError: failure
  done:
    type: final
`;

const SGP22_EVENT_PROCESSOR_TEMPLATE = `id: sgp22-event-processor
initial: fetching_notifications
states:
  fetching_notifications:
    invoke:
      src: sgp22/listNotifications
      onDone: logging_result
      onError: failure
  logging_result:
    invoke:
      src: sgp22/logEventInvoke
      input:
        description: "Pending notifications retrieved successfully"
        payload: "\${event.data}"
      onDone: done
      onError: failure
  done:
    type: final
`;

const BUILTIN_TEMPLATES = [
  { name: 'sgp22-provisioning.yaml', content: SGP22_PROVISIONING_TEMPLATE },
  { name: 'sgp22-inventory.yaml', content: SGP22_INVENTORY_TEMPLATE },
  { name: 'sgp22-profile-control.yaml', content: SGP22_PROFILE_CONTROL_TEMPLATE },
  { name: 'sgp22-event-processor.yaml', content: SGP22_EVENT_PROCESSOR_TEMPLATE },
];

const DEFAULT_WORKFLOW = SGP22_PROVISIONING_TEMPLATE;

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

export const WorkflowEditorPage = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(DEFAULT_WORKFLOW);
  const [fileName, setFileName] = useState('new-workflow.yaml');
  const [library, setLibrary] = useState<{ name: string; content: string }[]>([]);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [markers, setMarkers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'errors' | 'tasks'>('errors');
  const [editorTab, setEditorTab] = useState<'yaml' | 'visual'>('yaml');

  const [libraryCollapsed, setLibraryCollapsed] = useState(() => {
    return localStorage.getItem('unuko-library-collapsed') === 'true';
  });
  const [diagnosticsCollapsed, setDiagnosticsCollapsed] = useState(() => {
    return localStorage.getItem('unuko-diagnostics-collapsed') === 'true';
  });

  const toggleLibrary = () => {
    const nextValue = !libraryCollapsed;
    setLibraryCollapsed(nextValue);
    localStorage.setItem('unuko-library-collapsed', String(nextValue));
  };

  const toggleDiagnostics = () => {
    const nextValue = !diagnosticsCollapsed;
    setDiagnosticsCollapsed(nextValue);
    localStorage.setItem('unuko-diagnostics-collapsed', String(nextValue));
  };
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('unuko-workflows');
    let loaded = [];
    if (saved) {
      try {
        loaded = JSON.parse(saved);
      } catch (e) {
        loaded = [];
      }
    }
    if (!loaded || loaded.length === 0) {
      setLibrary(BUILTIN_TEMPLATES);
      localStorage.setItem('unuko-workflows', JSON.stringify(BUILTIN_TEMPLATES));
    } else {
      setLibrary(loaded);
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
      const sessionId = await sessionRepository.createSession('dynamic', definition);
      if (sessionId) {
        navigate(`/session/${sessionId}`);
      }
    } catch (e: any) {
      setStatus({ type: 'error', message: `Execution failed` });
    }
  };

  return (
    <div className="flex h-full bg-background text-foreground overflow-hidden font-sans animate-in fade-in duration-500">
      {/* Sidebar - Compact */}
      <div className={cn(
        "border-r border-border flex flex-col bg-muted/20 shrink-0 transition-all duration-300",
        libraryCollapsed ? "w-12" : "w-48"
      )}>
        <div className={cn(
          "h-10 border-b border-border flex items-center bg-muted/25 px-1.5 shrink-0",
          libraryCollapsed ? "justify-center flex-col py-1 gap-1" : "justify-between px-3"
        )}>
          {!libraryCollapsed && <h3 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Library</h3>}
          <div className={cn("flex items-center gap-1", libraryCollapsed && "flex-col")}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setFileName('new-workflow.yaml'); setCode(DEFAULT_WORKFLOW); }}
              className="h-6 w-6 rounded-sm transition-colors text-primary"
              title="Create New Workflow"
            >
              <FileCode className="w-3.5 h-3.5" />
            </Button>
            <button 
              onClick={toggleLibrary}
              className="p-1 rounded hover:bg-slate-800 text-muted-foreground hover:text-foreground transition-all shrink-0 cursor-pointer"
              title={libraryCollapsed ? "Expand Library" : "Collapse Library"}
            >
              {libraryCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5 scrollbar-hide">
          {library.map((f) => (
            <div
              key={f.name}
              className={cn(
                "group flex items-center rounded-md text-[11px] cursor-pointer transition-all relative border border-transparent",
                libraryCollapsed ? "justify-center p-1.5" : "justify-between p-2",
                fileName === f.name
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
              onClick={() => { setFileName(f.name); setCode(f.content); }}
              title={libraryCollapsed ? f.name : undefined}
            >
              {libraryCollapsed ? (
                <FileCode className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
              ) : (
                <>
                  <div className="flex items-center gap-2 truncate">
                    <div className={cn(
                      "w-1 h-1 rounded-full",
                      fileName === f.name ? "bg-primary" : "bg-muted-foreground"
                    )} />
                    <span className="truncate font-bold tracking-tight">{f.name}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(f.name); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-colors shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          ))}
          {library.length === 0 && (
            <p className={cn(
              "text-[9px] text-muted-foreground uppercase tracking-tight text-center py-10",
              libraryCollapsed ? "px-1" : "px-4"
            )}>
              {libraryCollapsed ? "Empty" : "No local workflows"}
            </p>
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

            {/* Tab Selector */}
            <div className="flex items-center gap-0.5 bg-slate-950 border border-slate-800 p-0.5 rounded-lg ml-2 shadow-inner">
              <button
                onClick={() => setEditorTab('yaml')}
                className={cn(
                  "px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md transition-all duration-150 cursor-pointer",
                  editorTab === 'yaml'
                    ? "bg-slate-900 text-sky-400 border border-slate-800 shadow"
                    : "text-slate-500 hover:text-slate-300 border border-transparent"
                )}
              >
                YAML Code
              </button>
              <button
                onClick={() => setEditorTab('visual')}
                className={cn(
                  "px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md transition-all duration-150 cursor-pointer",
                  editorTab === 'visual'
                    ? "bg-slate-900 text-sky-400 border border-slate-800 shadow"
                    : "text-slate-500 hover:text-slate-300 border border-transparent"
                )}
              >
                Visual Graph
              </button>
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
          {editorTab === 'yaml' ? (
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
          ) : (
            <WorkflowVisualGraph yamlCode={code} />
          )}
        </div>
      </div>

      {/* Right Sidebar - Diagnostics */}
      <div className={cn(
        "border-l border-border flex flex-col bg-muted/20 shrink-0 transition-all duration-300",
        diagnosticsCollapsed ? "w-12" : "w-64"
      )}>
        {diagnosticsCollapsed ? (
          <>
            <button 
              onClick={toggleDiagnostics}
              className="p-3 text-muted-foreground hover:text-foreground flex items-center justify-center border-b border-border transition-colors h-10 w-full hover:bg-slate-800/50 cursor-pointer"
              title="Expand Diagnostics"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex flex-col items-center gap-2 py-3">
              <button
                onClick={() => { setActiveTab('errors'); setDiagnosticsCollapsed(false); }}
                className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center transition-all relative border border-transparent cursor-pointer",
                  activeTab === 'errors' ? "bg-primary/10 text-primary border-primary/20 shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-slate-800/30"
                )}
                title={`Issues ${markers.length > 0 ? `(${markers.length})` : ''}`}
              >
                <ShieldAlert className="w-4 h-4" />
                {markers.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
              <button
                onClick={() => { setActiveTab('tasks'); setDiagnosticsCollapsed(false); }}
                className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center transition-all border border-transparent cursor-pointer",
                  activeTab === 'tasks' ? "bg-primary/10 text-primary border-primary/20 shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-slate-800/30"
                )}
                title="Registry"
              >
                <BookOpen className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex border-b border-border bg-muted/40 items-center justify-between shrink-0">
              <div className="flex flex-1 items-center">
                <button
                  onClick={() => setActiveTab('errors')}
                  className={cn(
                    "flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 border-b border-transparent cursor-pointer",
                    activeTab === 'errors' ? "text-primary border-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Issues {markers.length > 0 && `(${markers.length})`}
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={cn(
                    "flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 border-b border-transparent cursor-pointer",
                    activeTab === 'tasks' ? "text-primary border-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Registry
                </button>
              </div>
              <button 
                onClick={toggleDiagnostics}
                className="p-3 text-muted-foreground hover:text-foreground border-b border-transparent hover:bg-slate-800/50 transition-colors cursor-pointer"
                title="Collapse Diagnostics"
              >
                <ChevronRight className="w-3.5 h-3.5" />
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
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground font-mono">No issues</p>
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

            <div className="p-3 border-t border-border bg-card shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Build</span>
                <span className="text-[9px] font-mono text-emerald-500 uppercase font-black">v1.0.4-REL</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
