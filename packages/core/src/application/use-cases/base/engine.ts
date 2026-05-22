import { setup, assign } from 'xstate';
import { z } from 'zod';
import { WorkflowPorts, WorkflowBaseContext, TaskDefinition } from '../../../domain/models/workflow.types';
import { tasks as sgp22Tasks } from '../sgp22/tasks';
import { generateWorkflowSchema } from './schema';

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

import { IWorkflowEngine } from '../../../domain/ports/in/workflow.port';

export class WorkflowEngine implements IWorkflowEngine {
  private registry: Record<string, TaskDefinition> = {};

  constructor() {
    // Pre-populate with built-in tasks
    this.registerSGP22Tasks();
  }

  register(task: TaskDefinition) {
    this.registry[task.id] = task;
  }

  getTaskDefinitions(): TaskDefinition[] {
    return Object.values(this.registry);
  }

  getSchema() {
    return generateWorkflowSchema(this.getTaskDefinitions());
  }

  private registerSGP22Tasks() {
    Object.values(sgp22Tasks).forEach((task) => {
      this.register(task);
    });
  }

  /**
   * Validates the workflow configuration using Zod
   */
  validate(config: any) {
    const stateNames = Object.keys(config.states || {});
    const validStates = [...stateNames, 'done', 'failure'];

    const transitionValidator = z.any().superRefine((val, ctx) => {
      if (val === undefined || val === null) return;
      const target = typeof val === 'string' ? val : val.target;
      if (target && !validStates.includes(target)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Target state "${target}" does not exist in states list.`
        });
      }
    });
    
    const workflowSchema = z.object({
      id: z.string(),
      initial: z.string().refine((val: string) => validStates.includes(val), {
        message: `Initial state "${config.initial}" does not exist in states list.`
      }),
      states: z.record(z.string(), z.object({
        type: z.enum(['final', 'parallel', 'compound', 'atomic']).optional(),
        invoke: z.object({
          src: z.string().refine((val: string) => !!this.registry[val], {
            message: "Task is not registered."
          }),
          input: z.any().optional(),
          onDone: transitionValidator.optional(),
          onError: transitionValidator.optional()
        }).optional().superRefine((invoke, ctx) => {
          if (!invoke) return;
          const task = this.registry[invoke.src];
          if (task && task.input) {
            const result = task.input.safeParse(invoke.input || {});
            if (!result.success) {
              result.error.issues.forEach(issue => {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  path: ['input', ...issue.path],
                  message: `Task "${invoke.src}" input error: ${issue.message}`
                });
              });
            }
          }
        }),
        on: z.record(z.string(), transitionValidator).optional()
      }))
    });

    return workflowSchema.parse(config);
  }

  createMachine(yamlConfig: any, ports: WorkflowPorts) {
    // Optional: Validate config at runtime
    // this.validate(yamlConfig);

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
    Object.entries(this.registry).forEach(([id, taskDef]) => {
      actors[id] = taskDef.handler(ports);
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
