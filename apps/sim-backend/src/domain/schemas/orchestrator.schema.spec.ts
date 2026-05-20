import { describe, it, expect } from 'vitest';
import {
  switchEnvironmentSchema,
  createSessionSchema,
  sendSessionEventSchema,
  sessionIdParamSchema
} from './orchestrator.schema';

describe('orchestrator schemas', () => {
  describe('switchEnvironmentSchema', () => {
    it('should validate valid environment options', () => {
      expect(switchEnvironmentSchema.safeParse({ environment: 'mock' }).success).toBe(true);
      expect(switchEnvironmentSchema.safeParse({ environment: 'lima' }).success).toBe(true);
      expect(switchEnvironmentSchema.safeParse({ environment: 'invalid' }).success).toBe(false);
    });
  });

  describe('createSessionSchema', () => {
    it('should fall back to defaults when empty', () => {
      const res = createSessionSchema.safeParse({});
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.workflow).toBe('provisioning');
      }
    });

    it('should accept workflowDefinition', () => {
      const res = createSessionSchema.safeParse({ workflow: 'custom', workflowDefinition: { id: 'test' } });
      expect(res.success).toBe(true);
    });
  });

  describe('sendSessionEventSchema', () => {
    it('should validate event name', () => {
      expect(sendSessionEventSchema.safeParse({ event: 'START' }).success).toBe(true);
      expect(sendSessionEventSchema.safeParse({}).success).toBe(false);
    });
  });

  describe('sessionIdParamSchema', () => {
    it('should validate id presence', () => {
      expect(sessionIdParamSchema.safeParse({ id: 'SESSION-123' }).success).toBe(true);
      expect(sessionIdParamSchema.safeParse({}).success).toBe(false);
    });
  });
});
