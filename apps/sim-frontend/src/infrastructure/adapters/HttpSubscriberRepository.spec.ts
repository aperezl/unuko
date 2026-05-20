import { vi, describe, it, expect, beforeEach } from 'vitest';
import { HttpSubscriberRepository } from './HttpSubscriberRepository';

describe('HttpSubscriberRepository', () => {
  let repository: HttpSubscriberRepository;
  let mockFetch: any;

  beforeEach(() => {
    repository = new HttpSubscriberRepository();
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  it('getSubscribers - success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ imsi: '123' }]
    });
    const result = await repository.getSubscribers();
    expect(result).toEqual([{ imsi: '123' }]);
    expect(mockFetch).toHaveBeenCalledWith('/v1/inventory/subscribers');
  });

  it('getSubscribers - error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(repository.getSubscribers()).rejects.toThrow('Failed to fetch subscribers');
  });

  it('getSubscriber - success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ imsi: '123' })
    });
    const result = await repository.getSubscriber('123');
    expect(result).toEqual({ imsi: '123' });
    expect(mockFetch).toHaveBeenCalledWith('/v1/inventory/subscribers/123');
  });

  it('getSubscriber - error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(repository.getSubscriber('123')).rejects.toThrow('Failed to fetch subscriber 123');
  });

  it('saveSubscriber - success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'success' })
    });
    const result = await repository.saveSubscriber({ imsi: '123', k: 'key', opc: 'opc', slices: [] });
    expect(result).toEqual({ status: 'success' });
    expect(mockFetch).toHaveBeenCalledWith('/v1/inventory/subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imsi: '123', k: 'key', opc: 'opc', slices: [] })
    });
  });

  it('saveSubscriber - error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(repository.saveSubscriber({ imsi: '123', k: 'key', opc: 'opc', slices: [] })).rejects.toThrow('Failed to save subscriber');
  });

  it('deleteSubscriber - success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'deleted' })
    });
    const result = await repository.deleteSubscriber('123');
    expect(result).toEqual({ status: 'deleted' });
    expect(mockFetch).toHaveBeenCalledWith('/v1/inventory/subscribers/123', { method: 'DELETE' });
  });

  it('deleteSubscriber - error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(repository.deleteSubscriber('123')).rejects.toThrow('Failed to delete subscriber 123');
  });
});
