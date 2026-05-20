import { vi, describe, it, expect, beforeEach } from 'vitest';
import { HttpEnvironmentRepository } from './HttpEnvironmentRepository';

describe('HttpEnvironmentRepository', () => {
  let repository: HttpEnvironmentRepository;
  let mockFetch: any;

  beforeEach(() => {
    repository = new HttpEnvironmentRepository();
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  it('getEnvironment - success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ environment: 'lima' })
    });
    const result = await repository.getEnvironment();
    expect(result).toBe('lima');
    expect(mockFetch).toHaveBeenCalledWith('/v1/orchestrator/environment');
  });

  it('getEnvironment - error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(repository.getEnvironment()).rejects.toThrow('Failed to fetch environment');
  });

  it('setEnvironment - success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ environment: 'mock' })
    });
    const result = await repository.setEnvironment('mock');
    expect(result).toEqual({ environment: 'mock' });
    expect(mockFetch).toHaveBeenCalledWith('/v1/orchestrator/environment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ environment: 'mock' })
    });
  });

  it('setEnvironment - error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(repository.setEnvironment('lima')).rejects.toThrow('Failed to update environment');
  });
});
