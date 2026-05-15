import { describe, it, expect } from 'vitest';
import { UeransimConfigGenerator } from './UeransimConfigGenerator';
import { Subscriber } from '../../../domain/models/network.types';
import yaml from 'js-yaml';

describe('UeransimConfigGenerator', () => {
  const mockSubscriber: Subscriber = {
    imsi: '999700000000001',
    k: '465B5CE8B199B49FAA5F0A2EE238A6BC',
    opc: 'E8ED289DEBA952E4283B54E88E6183CA',
    slices: [{ sst: 1, sd: '000001', isDefault: true }]
  };

  it('should generate a valid YAML string', () => {
    const result = UeransimConfigGenerator.generate(mockSubscriber);
    expect(typeof result).toBe('string');
    
    const parsed: any = yaml.load(result);
    expect(parsed.supi).toBe('imsi-999700000000001');
    expect(parsed.key).toBe(mockSubscriber.k);
    expect(parsed.sessions[0].slice.sst).toBe(1);
    expect(parsed.sessions[0].slice.sd).toBe('000001');
  });

  it('should handle multiple slices', () => {
    const multiSlice: Subscriber = {
      ...mockSubscriber,
      slices: [
        { sst: 1, sd: '000001' },
        { sst: 2, sd: '000002', isDefault: true }
      ]
    };
    
    const result = UeransimConfigGenerator.generate(multiSlice);
    const parsed: any = yaml.load(result);
    
    expect(parsed.configuredNssai.length).toBe(2);
    expect(parsed.defaultNssai.sst).toBe(2);
  });

  it('should override gnbAddress if provided', () => {
    const result = UeransimConfigGenerator.generate(mockSubscriber, { gnbAddress: '192.168.1.100' });
    const parsed: any = yaml.load(result);
    expect(parsed.gnbSearchList[0]).toBe('192.168.1.100');
  });
});
