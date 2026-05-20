import { describe, it, expect } from 'vitest';
import {
  attachUeSchema,
  startGnbSchema,
  updateUeSchema,
  deviceIdParamSchema,
  nciParamSchema,
  saveDeviceYamlSchema
} from './device.schema';

describe('device schemas', () => {
  describe('attachUeSchema', () => {
    it('should validate valid body', () => {
      const res = attachUeSchema.safeParse({ imsi: '123456789012345', gnbAddress: '127.0.0.1' });
      expect(res.success).toBe(true);
    });

    it('should fail if imsi is missing', () => {
      const res = attachUeSchema.safeParse({ gnbAddress: '127.0.0.1' });
      expect(res.success).toBe(false);
    });
  });

  describe('startGnbSchema', () => {
    it('should fall back to defaults when empty', () => {
      const res = startGnbSchema.safeParse({});
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.mcc).toBe('999');
        expect(res.data.mnc).toBe('70');
        expect(res.data.nci).toBe('0x000000010');
      }
    });
  });

  describe('updateUeSchema', () => {
    it('should fall back to defaults when empty', () => {
      const res = updateUeSchema.safeParse({});
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.mcc).toBe('999');
        expect(res.data.mnc).toBe('70');
        expect(res.data.gnbAddress).toBe('127.0.0.1');
      }
    });
  });

  describe('deviceIdParamSchema', () => {
    it('should validate ID presence', () => {
      expect(deviceIdParamSchema.safeParse({ id: '123' }).success).toBe(true);
      expect(deviceIdParamSchema.safeParse({}).success).toBe(false);
    });
  });

  describe('nciParamSchema', () => {
    it('should validate NCI presence', () => {
      expect(nciParamSchema.safeParse({ nci: '0x10' }).success).toBe(true);
      expect(nciParamSchema.safeParse({}).success).toBe(false);
    });
  });

  describe('saveDeviceYamlSchema', () => {
    it('should validate yaml presence', () => {
      expect(saveDeviceYamlSchema.safeParse({ yaml: 'mcc: 999' }).success).toBe(true);
      expect(saveDeviceYamlSchema.safeParse({}).success).toBe(false);
    });
  });
});
