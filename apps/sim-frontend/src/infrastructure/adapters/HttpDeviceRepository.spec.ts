import { vi, describe, it, expect, beforeEach } from 'vitest';
import { HttpDeviceRepository } from './HttpDeviceRepository';

describe('HttpDeviceRepository', () => {
  let repository: HttpDeviceRepository;
  let mockFetch: any;

  beforeEach(() => {
    repository = new HttpDeviceRepository();
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  it('getDevices - success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'device-1' }]
    });
    const result = await repository.getDevices();
    expect(result).toEqual([{ id: 'device-1' }]);
    expect(mockFetch).toHaveBeenCalledWith('/v1/infrastructure/devices');
  });

  it('getDevices - error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(repository.getDevices()).rejects.toThrow('Failed to fetch devices');
  });

  it('clearAllDevices - success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'cleared' })
    });
    const result = await repository.clearAllDevices();
    expect(result).toEqual({ status: 'cleared' });
    expect(mockFetch).toHaveBeenCalledWith('/v1/infrastructure/devices', { method: 'DELETE' });
  });

  it('clearAllDevices - error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(repository.clearAllDevices()).rejects.toThrow('Failed to clear devices');
  });

  it('provisionAll - success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'success' })
    });
    const result = await repository.provisionAll();
    expect(result).toEqual({ status: 'success' });
    expect(mockFetch).toHaveBeenCalledWith('/v1/infrastructure/provision-all', { method: 'POST' });
  });

  it('provisionAll - error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(repository.provisionAll()).rejects.toThrow('Failed to provision devices');
  });

  it('attachUE - success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'attached' })
    });
    const result = await repository.attachUE('12345', '127.0.0.1');
    expect(result).toEqual({ status: 'attached' });
    expect(mockFetch).toHaveBeenCalledWith('/v1/infrastructure/ue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imsi: '12345', gnbAddress: '127.0.0.1' })
    });
  });

  it('attachUE - error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(repository.attachUE('12345')).rejects.toThrow('Failed to attach UE');
  });

  it('updateUE - success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'updated' })
    });
    const result = await repository.updateUE('12345', { mcc: '999' });
    expect(result).toEqual({ status: 'updated' });
    expect(mockFetch).toHaveBeenCalledWith('/v1/infrastructure/ue/12345', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mcc: '999' })
    });
  });

  it('updateUE - error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(repository.updateUE('12345', {})).rejects.toThrow('Failed to update UE');
  });

  it('startGNB - success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'started' })
    });
    const result = await repository.startGNB({ nci: '10' });
    expect(result).toEqual({ status: 'started' });
    expect(mockFetch).toHaveBeenCalledWith('/v1/infrastructure/gnb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nci: '10' })
    });
  });

  it('startGNB - error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(repository.startGNB({})).rejects.toThrow('Failed to start gNodeB');
  });

  it('updateGNB - success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'updated' })
    });
    const result = await repository.updateGNB('10', { mcc: '999' });
    expect(result).toEqual({ status: 'updated' });
    expect(mockFetch).toHaveBeenCalledWith('/v1/infrastructure/gnb/10', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mcc: '999' })
    });
  });

  it('updateGNB - error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(repository.updateGNB('10', {})).rejects.toThrow('Failed to update gNodeB');
  });

  it('stopDevice - success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'stopped' })
    });
    const result = await repository.stopDevice('dev-1');
    expect(result).toEqual({ status: 'stopped' });
    expect(mockFetch).toHaveBeenCalledWith('/v1/infrastructure/device/dev-1/stop', { method: 'POST' });
  });

  it('stopDevice - error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(repository.stopDevice('dev-1')).rejects.toThrow('Failed to stop device');
  });

  it('removeDevice - success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'removed' })
    });
    const result = await repository.removeDevice('dev-1');
    expect(result).toEqual({ status: 'removed' });
    expect(mockFetch).toHaveBeenCalledWith('/v1/infrastructure/device/dev-1', { method: 'DELETE' });
  });

  it('removeDevice - error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(repository.removeDevice('dev-1')).rejects.toThrow('Failed to remove device');
  });

  it('startDevice - success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'started' })
    });
    const result = await repository.startDevice('dev-1');
    expect(result).toEqual({ status: 'started' });
    expect(mockFetch).toHaveBeenCalledWith('/v1/infrastructure/device/dev-1/start', { method: 'POST' });
  });

  it('startDevice - error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(repository.startDevice('dev-1')).rejects.toThrow('Failed to start device');
  });

  it('getDeviceLogs - success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ logs: ['line1', 'line2'] })
    });
    const logs = await repository.getDeviceLogs('dev-1');
    expect(logs).toBe('line1\nline2');
    expect(mockFetch).toHaveBeenCalledWith('/v1/infrastructure/device/dev-1/logs');
  });

  it('getDeviceLogs - fallback to string or empty', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ logs: 'some raw logs' })
    });
    const logs = await repository.getDeviceLogs('dev-1');
    expect(logs).toBe('some raw logs');
  });

  it('getDeviceLogs - error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(repository.getDeviceLogs('dev-1')).rejects.toThrow('Failed to retrieve logs');
  });

  it('getDeviceYaml - success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ yaml: 'config: true' })
    });
    const yaml = await repository.getDeviceYaml('dev-1');
    expect(yaml).toBe('config: true');
    expect(mockFetch).toHaveBeenCalledWith('/v1/infrastructure/device/dev-1/config');
  });

  it('getDeviceYaml - error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(repository.getDeviceYaml('dev-1')).rejects.toThrow('Failed to retrieve config');
  });

  it('saveDeviceYaml - success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'saved' })
    });
    const result = await repository.saveDeviceYaml('dev-1', 'yaml: content');
    expect(result).toEqual({ status: 'saved' });
    expect(mockFetch).toHaveBeenCalledWith('/v1/infrastructure/device/dev-1/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ yaml: 'yaml: content' })
    });
  });

  it('saveDeviceYaml - error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(repository.saveDeviceYaml('dev-1', '')).rejects.toThrow('Failed to save config');
  });
});
