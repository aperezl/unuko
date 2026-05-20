import { describe, it, expect } from 'vitest';
import {
  serviceNameParamSchema,
  serviceStateActionSchema
} from './service.schema';

describe('service schemas', () => {
  describe('serviceNameParamSchema', () => {
    it('should validate allowed systemd service name', () => {
      expect(serviceNameParamSchema.safeParse({ name: 'open5gs-amfd' }).success).toBe(true);
      expect(serviceNameParamSchema.safeParse({ name: 'open5gs-smfd' }).success).toBe(true);
      expect(serviceNameParamSchema.safeParse({ name: 'nginx' }).success).toBe(false);
    });
  });

  describe('serviceStateActionSchema', () => {
    it('should validate allowed actions', () => {
      expect(serviceStateActionSchema.safeParse({ action: 'start' }).success).toBe(true);
      expect(serviceStateActionSchema.safeParse({ action: 'stop' }).success).toBe(true);
      expect(serviceStateActionSchema.safeParse({ action: 'restart' }).success).toBe(false);
    });
  });
});
