import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.main';
import { configureMonacoYaml } from 'monaco-yaml';

window.MonacoEnvironment = {
  getWorker(_, label) {
    console.log(`[Monaco] Requesting worker for: ${label}`);
    
    if (label === 'json') {
      return new Worker(
        new URL('monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url),
        { type: 'module' }
      );
    }
    if (label === 'yaml') {
      return new Worker(
        new URL('monaco-yaml/yaml.worker.js', import.meta.url),
        { type: 'module' }
      );
    }
    return new Worker(
      new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url),
      { type: 'module' }
    );
  },
};

// Configure loader to use the full monaco instance from editor.main
loader.config({ monaco });

// Initialize monaco-yaml on the instance that already has all contributions from editor.main
try {
  configureMonacoYaml(monaco, {
    enableSchemaRequest: true,
    schemas: [],
  });
  console.log('[Monaco] monaco-yaml configured successfully');
} catch (error) {
  console.error('[Monaco] Error configuring monaco-yaml:', error);
}

export { monaco };
