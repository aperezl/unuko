import { describe, it, expect } from 'vitest';
import fs, { promises, existsSync, readFileSync, writeFileSync, dirname } from './fs-shim';

describe('fs-shim', () => {
  it('should export dummy functions that behave predictably', async () => {
    expect(existsSync()).toBe(false);
    expect(readFileSync()).toBe("");
    expect(writeFileSync()).toBeUndefined();
    expect(dirname()).toBe("");

    expect(await promises.mkdir()).toBeUndefined();
    expect(await promises.appendFile()).toBeUndefined();
    expect(await promises.readFile()).toBe("");
    expect(await promises.unlink()).toBeUndefined();
  });

  it('should export a default object with matching exports', async () => {
    expect(fs.existsSync()).toBe(false);
    expect(fs.readFileSync()).toBe("");
    expect(fs.writeFileSync()).toBeUndefined();
    expect(fs.dirname()).toBe("");
  });
});
