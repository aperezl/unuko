import { vi, describe, it, expect, beforeEach } from 'vitest';
import { HttpSessionRepository } from './HttpSessionRepository';

describe('HttpSessionRepository', () => {
  let repository: HttpSessionRepository;
  let mockFetch: any;

  beforeEach(() => {
    repository = new HttpSessionRepository();
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  it('getSessions - success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ sessionId: 'S1', status: 'idle' }]
    });
    const result = await repository.getSessions();
    expect(result).toEqual([{ sessionId: 'S1', status: 'idle' }]);
    expect(mockFetch).toHaveBeenCalledWith('/v1/orchestrator/sessions');
  });

  it('getSessions - return empty array if response is not array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ error: 'bad' })
    });
    const result = await repository.getSessions();
    expect(result).toEqual([]);
  });

  it('getSessions - error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(repository.getSessions()).rejects.toThrow('Failed to fetch sessions');
  });

  it('getSession - success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sessionId: 'S1', status: 'idle' })
    });
    const result = await repository.getSession('S1');
    expect(result).toEqual({ sessionId: 'S1', status: 'idle' });
    expect(mockFetch).toHaveBeenCalledWith('/v1/orchestrator/session/S1');
  });

  it('getSession - error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(repository.getSession('S1')).rejects.toThrow('Failed to fetch session S1');
  });

  it('createSession - success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sessionId: 'S-NEW' })
    });
    const result = await repository.createSession('provisioning');
    expect(result).toBe('S-NEW');
    expect(mockFetch).toHaveBeenCalledWith('/v1/orchestrator/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflow: 'provisioning', workflowDefinition: undefined })
    });
  });

  it('createSession - invalid response format', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'created' }) // missing sessionId
    });
    await expect(repository.createSession('provisioning')).rejects.toThrow('Response did not contain sessionId');
  });

  it('createSession - error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(repository.createSession('provisioning')).rejects.toThrow('Failed to create session');
  });

  it('deleteSession - success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'deleted' })
    });
    const result = await repository.deleteSession('S1');
    expect(result).toEqual({ status: 'deleted' });
    expect(mockFetch).toHaveBeenCalledWith('/v1/orchestrator/session/S1', { method: 'DELETE' });
  });

  it('deleteSession - error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(repository.deleteSession('S1')).rejects.toThrow('Failed to delete session S1');
  });
});
