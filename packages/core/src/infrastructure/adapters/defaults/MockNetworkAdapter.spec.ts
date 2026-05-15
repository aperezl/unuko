import { describe, it, expect, beforeEach } from 'vitest';
import { MockNetworkAdapter } from './MockNetworkAdapter';
import { Subscriber } from '../../../domain/models/network.types';

describe('MockNetworkAdapter', () => {
  let adapter: MockNetworkAdapter;

  const mockSubscriber: Subscriber = {
    imsi: '999700000000001',
    k: '465B5CE8B199B49FAA5F0A2EE238A6BC',
    opc: 'E8ED289DEBA952E4283B54E88E6183CA',
    slices: [{ sst: 1, isDefault: true }]
  };

  beforeEach(() => {
    adapter = new MockNetworkAdapter();
  });

  it('should provision a new subscriber', async () => {
    await adapter.provision(mockSubscriber);
    // Internamente se guarda, lo verificamos intentando un attach
    const session = await adapter.attachUE(mockSubscriber.imsi);
    expect(session.imsi).toBe(mockSubscriber.imsi);
    expect(session.status).toBe('CONNECTED');
  });

  it('should throw error if attaching a non-provisioned subscriber', async () => {
    await expect(adapter.attachUE('12345')).rejects.toThrow('Subscriber 12345 not found');
  });

  it('should create a valid session with IP and interface', async () => {
    await adapter.provision(mockSubscriber);
    const session = await adapter.attachUE(mockSubscriber.imsi);
    
    expect(session.ipAddress).toMatch(/^10\.45\.0\.\d+$/);
    expect(session.interfaceName).toBe('uesimtun0');
    expect(session.sessionId).toBeDefined();
  });

  it('should remove session on detach', async () => {
    await adapter.provision(mockSubscriber);
    await adapter.attachUE(mockSubscriber.imsi);
    
    let sessions = await adapter.getSessions();
    expect(sessions.length).toBe(1);

    await adapter.detachUE(mockSubscriber.imsi);
    sessions = await adapter.getSessions();
    expect(sessions.length).toBe(0);
  });

  it('should return network metrics', async () => {
    await adapter.provision(mockSubscriber);
    await adapter.attachUE(mockSubscriber.imsi);
    
    const metrics = await adapter.getMetrics(mockSubscriber.imsi);
    expect(metrics.uplinkBytes).toBeGreaterThanOrEqual(0);
    expect(metrics.latencyMs).toBeGreaterThan(0);
  });
});
