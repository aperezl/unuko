import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.main';
import { configureMonacoYaml } from 'monaco-yaml';

window.MonacoEnvironment = {
  getWorker(_, label) {
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

loader.config({ monaco });

const WORKFLOW_SCHEMA = {
  uri: 'https://unuko.com/schemas/workflow.json',
  fileMatch: ['*.yaml', '*.yml'],
  schema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Unique identifier for the workflow' },
      initial: { type: 'string', description: 'The initial state of the workflow' },
      context: { type: 'object', description: 'Initial context data' },
      states: {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: {
            type: { enum: ['final', 'parallel', 'compound', 'atomic'] },
            invoke: {
              type: 'object',
              properties: {
                src: { 
                  enum: [
                    'sgp22/initialize',
                    'sgp22/authenticate',
                    'sgp22/downloadProfile',
                    'sgp22/installSegment',
                    'sgp22/getProfilesInfo',
                    'sgp22/manageProfile',
                    'sgp22/listNotifications',
                    'sgp22/handleNotification',
                    'sgp22/logEventInvoke',
                    'sgp22/registerSubscriber',
                    'sgp22/enableConnectivity'
                  ],
                  description: 'The registered task to invoke'
                },
                input: { type: 'object', description: 'Input data for the task, supports ${context.path} expressions' },
                onDone: { 
                  oneOf: [
                    { type: 'string' },
                    { 
                      type: 'object',
                      properties: {
                        target: { type: 'string' },
                        assign: { type: 'object' }
                      },
                      required: ['target']
                    }
                  ] 
                },
                onError: { 
                  oneOf: [
                    { type: 'string' },
                    { 
                      type: 'object',
                      properties: {
                        target: { type: 'string' },
                        assign: { type: 'object' }
                      },
                      required: ['target']
                    }
                  ] 
                }
              },
              required: ['src']
            },
            on: {
              type: 'object',
              additionalProperties: {
                oneOf: [
                  { type: 'string' },
                  { 
                    type: 'object',
                    properties: {
                      target: { type: 'string' },
                      assign: { type: 'object' }
                    },
                    required: ['target']
                  }
                ]
              }
            }
          }
        }
      }
    },
    required: ['id', 'initial', 'states']
  }
};

configureMonacoYaml(monaco, {
  enableSchemaRequest: true,
  schemas: [WORKFLOW_SCHEMA],
});

export { monaco };
