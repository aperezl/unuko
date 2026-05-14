import { setup, assign } from 'xstate';
import { tasks as sgp22Tasks } from '../sgp22/tasks';
/**
 * Simple expression resolver for ${context.path} or ${event.path}
 */
const resolveValue = (str, context, event) => {
    if (typeof str !== 'string' || !str.includes('${'))
        return str;
    return str.replace(/\${([^}]+)}/g, (_, path) => {
        const parts = path.split('.');
        let current = parts[0] === 'context' ? context : (parts[0] === 'event' ? event : {});
        for (let i = 1; i < parts.length; i++) {
            if (current === undefined || current === null)
                return undefined;
            current = current[parts[i]];
        }
        return current;
    });
};
/**
 * Deep resolver for objects
 */
const resolveInputs = (inputs, context, event) => {
    if (!inputs)
        return {};
    if (typeof inputs !== 'object')
        return resolveValue(inputs, context, event);
    const resolved = Array.isArray(inputs) ? [] : {};
    for (const [key, value] of Object.entries(inputs)) {
        resolved[key] = typeof value === 'object'
            ? resolveInputs(value, context, event)
            : resolveValue(value, context, event);
    }
    return resolved;
};
export class WorkflowEngine {
    registry = {};
    constructor() {
        // Pre-populate with built-in tasks
        this.registerSGP22Tasks();
    }
    register(id, task) {
        this.registry[id] = task;
    }
    registerSGP22Tasks() {
        Object.entries(sgp22Tasks).forEach(([name, task]) => {
            this.register(`sgp22/${name}`, task);
        });
    }
    createMachine(yamlConfig, ports) {
        const { id, initial, states: yamlStates } = yamlConfig;
        const states = {};
        Object.entries(yamlStates).forEach(([stateId, stateConfig]) => {
            states[stateId] = {
                ...stateConfig,
                invoke: stateConfig.invoke ? {
                    src: stateConfig.invoke.src,
                    input: ({ context, event }) => {
                        const inputs = stateConfig.invoke.input || {};
                        return resolveInputs(inputs, context, event);
                    },
                    onDone: this.mapTransition(stateConfig.invoke.onDone),
                    onError: this.mapTransition(stateConfig.invoke.onError)
                } : undefined
            };
        });
        // We wrap tasks to inject 'ports' automatically
        const actors = {};
        Object.entries(this.registry).forEach(([name, taskFn]) => {
            actors[name] = taskFn(ports);
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
            },
            states: {
                ...states,
                done: { type: 'final' },
                failure: { type: 'final' }
            }
        });
    }
    mapTransition(transition) {
        if (!transition)
            return undefined;
        if (typeof transition === 'string')
            return transition;
        const result = { target: transition.target };
        if (transition.assign) {
            result.actions = assign(({ context, event }) => {
                const assignments = {};
                Object.entries(transition.assign).forEach(([key, value]) => {
                    assignments[key] = resolveValue(value, context, event);
                });
                return assignments;
            });
        }
        return result;
    }
}
export const unukoEngine = new WorkflowEngine();
