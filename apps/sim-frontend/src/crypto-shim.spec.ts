import { describe, it, expect } from 'vitest';
import cryptoShim, { randomUUID } from './crypto-shim';

describe('crypto-shim', () => {
  it('should generate a valid uuid using crypto or fallback', () => {
    const uuid1 = randomUUID();
    const uuid2 = cryptoShim.randomUUID();

    expect(uuid1).toBeDefined();
    expect(uuid1.length).toBe(36);
    expect(uuid2).toBeDefined();
    expect(uuid2.length).toBe(36);
  });
});
