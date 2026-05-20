import { describe, it, expect } from 'vitest';
import { CONFIG } from './config';

describe('config', () => {
  it('should export CONFIG object with SERVER, PATHS, HARDWARE, CRYPTO, WEBHOOK, and SERVICES properties', () => {
    expect(CONFIG).toBeDefined();
    expect(CONFIG.SERVER).toBeDefined();
    expect(CONFIG.PATHS).toBeDefined();
    expect(CONFIG.HARDWARE).toBeDefined();
    expect(CONFIG.CRYPTO).toBeDefined();
    expect(CONFIG.WEBHOOK).toBeDefined();
    expect(CONFIG.SERVICES).toBeDefined();
  });

  it('should have standard systemd services allowed', () => {
    expect(CONFIG.SERVICES.ALLOWED_SYSTEMD).toContain('open5gs-amfd');
    expect(CONFIG.SERVICES.ALLOWED_SYSTEMD).toContain('open5gs-smfd');
  });

  it('should list correct core topology config', () => {
    const amf = CONFIG.SERVICES.CORE_TOPOLOGY.find(t => t.name === 'open5gs-amfd');
    expect(amf).toBeDefined();
    expect(amf?.ip).toBe('127.0.0.5');
    expect(amf?.port).toBe(38412);
  });
});
