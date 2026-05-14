import { setup, assign } from 'xstate';
import { WorkflowPorts, WorkflowBaseContext } from './types';
import { tasks as sgp22Tasks } from '../sgp22/tasks';

/**
 * Simple expression resolver for ${context.path} or ${event.path}
 */
const resolveValue = (str: string, context: any, event: any): any => {
  if (typeof str !== 'string' || !str.includes('${')) return str;
  
  return str.replace(/\${([^}]+)}/g, (_, path) => {
    const parts = path.split('.');
    let current = parts[0] === 'context' ? context : (parts[0] === 'event' ? event : {});
    
    for (let i = 1; i < parts.length; i++) {
      if (current === undefined || current === null) return undefined;
      current = current[parts[i]];
    }
    return current;
  });
};

/**
 * Deep resolver for objects
 */
const resolveInputs = (inputs: any, context: any, event: any): any => {
  if (!inputs) return {};
  if (typeof inputs !== 'object') return resolveValue(inputs, context, event);
  
  const resolved: any = Array.isArray(inputs) ? [] : {};
  for (const [key, value] of Object.entries(inputs)) {
    resolved[key] = typeof value === 'object' 
      ? resolveInputs(value, context, event) 
      : resolveValue(value as string, context, event);
  }
  return resolved;
};

export class WorkflowEngine {
  private registry: Record<string, any> = {};

  constructor() {
    // Pre-populate with built-in tasks
    this.registerSGP22Tasks();
  }

  register(id: string, task: any) {
    this.registry[id] = task;
  }

  private registerSGP22Tasks() {
    Object.entries(sgp22Tasks).forEach(([name, task]) => {
      this.register(`sgp22/${name}`, task);
    });
  }

  createMachine(yamlConfig: any, ports: WorkflowPorts) {
    const { id, initial, states: yamlStates } = yamlConfig;
    
    const states: any = {};
    
    Object.entries(yamlStates).forEach(([stateId, stateConfig]: [string, any]) => {
      states[stateId] = {
        ...stateConfig,
        invoke: stateConfig.invoke ? {
          src: stateConfig.invoke.src,
          input: ({ context, event }: any) => {
            const inputs = stateConfig.invoke.input || {};
            return resolveInputs(inputs, context, event);
          },
          onDone: this.mapTransition(stateConfig.invoke.onDone),
          onError: this.mapTransition(stateConfig.invoke.onError)
        } : undefined
      };
    });

    // We wrap tasks to inject 'ports' automatically
    const actors: any = {};
    Object.entries(this.registry).forEach(([name, taskFn]) => {
      actors[name] = (taskFn as any)(ports);
    });

    return setup({
      actors
    }).createMachine({
      id: id || 'dynamic-workflow',
      initial: initial,
      context: {
        error: null,
        retryCount: 0,
        ...yamlConfig.context
      } as WorkflowBaseContext,
      states: {
        ...states,
        done: { type: 'final' },
        failure: { type: 'final' }
      }
    });
  }

  private mapTransition(transition: any) {
    if (!transition) return undefined;
    if (typeof transition === 'string') return transition;
    
    const result: any = { target: transition.target };
    
    if (transition.assign) {
      result.actions = assign(({ context, event }: any) => {
        const assignments: any = {};
        Object.entries(transition.assign).forEach(([key, value]) => {
          assignments[key] = resolveValue(value as string, context, event);
        });
        return assignments;
      });
    }
    
    return result;
  }
}

export const unukoEngine = new WorkflowEngine();
