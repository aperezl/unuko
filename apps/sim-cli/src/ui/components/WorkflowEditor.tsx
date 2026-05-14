import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import yaml from 'js-yaml';
import { Save, Play, Trash2, FileCode, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface WorkflowEditorProps {
  onExecute: (definition: any) => void;
}

const DEFAULT_WORKFLOW = `id: custom-workflow
initial: init
states:
  init:
    invoke:
      src: sgp22/initialize
      onDone: done
  done:
    type: final
`;

export const WorkflowEditor = ({ onExecute }: WorkflowEditorProps) => {
  const [code, setCode] = useState(DEFAULT_WORKFLOW);
  const [fileName, setFileName] = useState('new-workflow.yaml');
  const [library, setLibrary] = useState<{ name: string; content: string }[]>([]);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

  useEffect(() => {
    const saved = localStorage.getItem('unuko-workflows');
    if (saved) {
      setLibrary(JSON.parse(saved));
    }
  }, []);

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

  const handleExecute = () => {
    try {
      const definition = yaml.load(code);
      onExecute(definition);
      setStatus({ type: 'success', message: 'Executing dynamic workflow...' });
      setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
    } catch (e: any) {
      setStatus({ type: 'error', message: `Execution failed: ${e.message}` });
    }
  };

  return (
    <div className="flex h-full bg-slate-950 text-slate-200 overflow-hidden">
      {/* Sidebar - Library */}
      <div className="w-64 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Library</h3>
          <button 
            onClick={() => { setFileName('new-workflow.yaml'); setCode(DEFAULT_WORKFLOW); }}
            className="p-1 hover:bg-slate-800 rounded transition-colors"
          >
            <FileCode className="w-4 h-4 text-sky-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {library.map((f) => (
            <div 
              key={f.name}
              className={cn(
                "group flex items-center justify-between p-2 rounded text-xs cursor-pointer transition-colors",
                fileName === f.name ? "bg-sky-500/10 text-sky-400" : "hover:bg-slate-900 text-slate-400"
              )}
              onClick={() => { setFileName(f.name); setCode(f.content); }}
            >
              <span className="truncate">{f.name}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(f.name); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-12 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900/50">
          <div className="flex items-center gap-4">
            <input 
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-mono text-sky-400 w-48"
            />
            {status.message && (
              <div className={cn(
                "flex items-center gap-2 text-[10px] font-medium px-2 py-1 rounded",
                status.type === 'success' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
              )}>
                {status.type === 'success' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {status.message}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold transition-all border border-slate-700"
            >
              <Save className="w-3.5 h-3.5" />
              Save
            </button>
            <button 
              onClick={handleExecute}
              className="flex items-center gap-2 px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold shadow-lg shadow-sky-900/20 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Execute
            </button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1">
          <Editor
            height="100%"
            defaultLanguage="yaml"
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'Fira Code', 'Cascadia Code', monospace",
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              padding: { top: 20 }
            }}
          />
        </div>
      </div>
    </div>
  );
};
