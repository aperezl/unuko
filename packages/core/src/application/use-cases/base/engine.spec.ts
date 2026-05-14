import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkflowEngine } from './engine';
import { z } from 'zod';
import { fromPromise } from 'xstate';

describe('WorkflowEngine', () => {
  let engine: WorkflowEngine;

  beforeEach(() => {
    engine = new WorkflowEngine();
  });

  it('should register tasks', () => {
    const task = {
      id: 'test-task',
      input: z.object({ name: z.string() }),
      handler: (ports: any) => fromPromise(async ({ input }: any) => ({ hello: input.name }))
    };

    engine.register(task as any);
    const definitions = engine.getTaskDefinitions();
    expect(definitions.find(d => d.id === 'test-task')).toBeDefined();
  });

  describe('validate', () => {
    it('should validate a correct workflow config', () => {
      const config = {
        id: 'test-flow',
        initial: 'step1',
        states: {
          step1: {
            invoke: {
              src: 'sgp22/initialize',
              onDone: 'done'
            }
          }
        }
      };

      expect(() => engine.validate(config)).not.toThrow();
    });

    it('should throw error if initial state is missing', () => {
      const config = {
        id: 'test-flow',
        initial: 'missing',
        states: {
          step1: {}
        }
      };

      expect(() => engine.validate(config)).toThrow(/Initial state .* does not exist/);
    });
  });

  describe('createMachine', () => {
    it('should create an XState machine from config', async () => {
      // Register a simple test task
      const task = {
        id: 'test-task',
        handler: () => fromPromise(async () => ({ success: true }))
      };
      engine.register(task as any);

      const config = {
        id: 'test-flow',
        initial: 'step1',
        states: {
          step1: {
            invoke: {
              src: 'test-task',
              onDone: 'done'
            }
          }
        }
      };

      const ports = {
        hardware: { transmit: vi.fn(), reset: vi.fn() },
        crypto: { initialize: vi.fn(), getDeviceCertificate: vi.fn() },
        transport: { post: vi.fn() },
        audit: { log: vi.fn() },
        notification: { notify: vi.fn() },
        sessionId: 'test'
      } as any;

      const machine = engine.createMachine(config, ports);

      expect(machine.id).toBe('test-flow');
      
      const { createActor } = await import('xstate');
      const actor = createActor(machine).start();
      expect(actor.getSnapshot().value).toBe('step1');
    });
  });
});
