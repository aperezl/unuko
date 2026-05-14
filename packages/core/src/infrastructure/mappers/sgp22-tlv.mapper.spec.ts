import { describe, it, expect } from 'vitest';
import { parseBERTLV } from './sgp22-tlv.mapper';

describe('parseBERTLV', () => {
  it('should parse simple tag', () => {
    const buffer = Buffer.from('8001AA', 'hex');
    const result = parseBERTLV(buffer);
    expect(result[0].tag).toBe('80');
    expect(result[0].value.toString('hex')).toBe('aa');
  });

  it('should parse multi-byte length', () => {
    const buffer = Buffer.concat([
      Buffer.from('8181', 'hex'),
      Buffer.from([129]),
      Buffer.alloc(129, 0xBB)
    ]);
    const result = parseBERTLV(buffer);
    expect(result[0].tag).toBe('81');
    expect(result[0].value.length).toBe(129);
  });
});
