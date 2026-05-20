import { describe, it, expect } from 'vitest';
import {
  upsertSubscriberSchema,
  imsiParamSchema
} from './subscriber.schema';

describe('subscriber schemas', () => {
  describe('upsertSubscriberSchema', () => {
    it('should validate 15 digit imsi', () => {
      expect(upsertSubscriberSchema.safeParse({ imsi: '123456789012345' }).success).toBe(true);
      expect(upsertSubscriberSchema.safeParse({ imsi: '12345' }).success).toBe(false);
      expect(upsertSubscriberSchema.safeParse({ imsi: '1234567890123456' }).success).toBe(false);
      expect(upsertSubscriberSchema.safeParse({ imsi: '1234567890abcde' }).success).toBe(false);
    });

    it('should pass through extra fields', () => {
      const res = upsertSubscriberSchema.safeParse({ imsi: '123456789012345', extra: 'test' });
      expect(res.success).toBe(true);
      if (res.success) {
        expect((res.data as any).extra).toBe('test');
      }
    });
  });

  describe('imsiParamSchema', () => {
    it('should validate imsi presence', () => {
      expect(imsiParamSchema.safeParse({ imsi: 'any-string' }).success).toBe(true);
      expect(imsiParamSchema.safeParse({}).success).toBe(false);
    });
  });
});
