import { vi, describe, it, expect, beforeEach } from 'vitest';
import { HttpServiceRepository } from './HttpServiceRepository';

describe('HttpServiceRepository', () => {
  let repository: HttpServiceRepository;
  let mockFetch: any;

  beforeEach(() => {
    repository = new HttpServiceRepository();
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  it('getServicesStatus - success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ name: 'AMF', status: 'online' }]
    });
    const result = await repository.getServicesStatus();
    expect(result).toEqual([{ name: 'AMF', status: 'online' }]);
    expect(mockFetch).toHaveBeenCalledWith('/v1/orchestrator/services/status');
  });

  it('getServicesStatus - error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(repository.getServicesStatus()).rejects.toThrow('Failed to fetch services status');
  });

  it('toggleServiceState - success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'active' })
    });
    const result = await repository.toggleServiceState('amf', 'start');
    expect(result).toEqual({ status: 'active' });
    expect(mockFetch).toHaveBeenCalledWith('/v1/orchestrator/services/amf/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start' })
    });
  });

  it('toggleServiceState - error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(repository.toggleServiceState('amf', 'start')).rejects.toThrow('Failed to change state of service amf');
  });
});
