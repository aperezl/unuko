import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.main';
import { configureMonacoYaml } from 'monaco-yaml';
import { unukoEngine } from '@unuko/core';

import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JSONWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import YAMLWorker from 'monaco-yaml/yaml.worker?worker';

window.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new JSONWorker();
    }
    if (label === 'yaml') {
      return new YAMLWorker();
    }
    return new EditorWorker();
  },
};

// Define custom premium theme matching the Unuko dashboard
monaco.editor.defineTheme('unuko-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'type', foreground: '38bdf8' },
    { token: 'string', foreground: '34d399' },
    { token: 'keyword', foreground: '818cf8' },
    { token: 'number', foreground: 'fbbf24' },
    { token: 'comment', foreground: '475569', fontStyle: 'italic' },
    { token: 'key', foreground: '38bdf8' },
    { token: 'string.yaml', foreground: 'e2e8f0' },
  ],
  colors: {
    'editor.background': '#020617', // Match the slate-950/app background
    'editor.foreground': '#e2e8f0',
    'editor.lineHighlightBackground': '#0f172a',
    'editorLineNumber.foreground': '#334155',
    'editorLineNumber.activeForeground': '#38bdf8',
    'editorIndentGuide.background': '#1e293b',
    'editorIndentGuide.activeBackground': '#334155',
    'editor.selectionBackground': '#1e293b80',
    'editorCursor.foreground': '#38bdf8',
    'editorWhitespace.foreground': '#1e293b',
    'editorWidget.background': '#0f172a',
    'editorWidget.border': '#1e293b',
  },
});

loader.config({ monaco });

// Generate schema dynamically from the engine's registered tasks
const workflowSchema = unukoEngine.getSchema();

configureMonacoYaml(monaco, {
  enableSchemaRequest: true,
  schemas: [workflowSchema],
});

export { monaco };
