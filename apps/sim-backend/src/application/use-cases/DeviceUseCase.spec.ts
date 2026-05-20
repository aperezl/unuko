import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';

// Mock fs module for the underlying mock adapters
vi.mock('fs', () => {
  let mockFiles: Record<string, string> = {};
  const mockFs = {
    existsSync: vi.fn((p: string) => mockFiles[p] !== undefined),
    readFileSync: vi.fn((p: string) => {
      if (mockFiles[p] === undefined) throw new Error('ENOENT');
      return mockFiles[p];
    }),
    writeFileSync: vi.fn((p: string, content: string) => {
      mockFiles[p] = content;
    }),
    mkdirSync: vi.fn(() => {}),
    _clear: () => {
      mockFiles = {};
    }
  };
  return {
    default: mockFs,
    ...mockFs
  };
});

// Mock fs/promises for seed configuration files
vi.mock('fs/promises', () => {
  return {
    default: {
      readFile: vi.fn((p: string) => {
        if (p.includes('subscribers.json')) {
          return Promise.resolve(JSON.stringify([{ imsi: '123456789012345', k: 'key', opc: 'opc' }]));
        }
        if (p.includes('gnbs.json')) {
          return Promise.resolve(JSON.stringify([{ nci: '0x000000010', mcc: '999', mnc: '70' }]));
        }
        if (p.includes('ues.json')) {
          return Promise.resolve(JSON.stringify([{ supi: 'imsi-123456789012345' }]));
        }
        return Promise.resolve('[]');
      })
    }
  };
});

import { deviceUseCase } from './DeviceUseCase';
import { container } from '../../infrastructure/di/DependencyContainer';

describe('DeviceUseCase', () => {
  beforeEach(() => {
    (fs as any)._clear();
    container.setEnvironment('mock');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return empty devices initially', async () => {
    const list = await deviceUseCase.getDevices();
    expect(list).toEqual([]);
  });

  it('should provision all seeds successfully', async () => {
    const res = await deviceUseCase.provisionAll();
    expect(res.status).toBe('success');
    expect(res.details.subscribersSeeded).toBe(1);
    expect(res.details.gnbsStarted).toBe(1);
    expect(res.details.uesStarted).toBe(1);

    const devices = await deviceUseCase.getDevices();
    expect(devices.length).toBe(2); // 1 GNB + 1 UE
  });

  it('should clear all devices', async () => {
    await deviceUseCase.provisionAll();
    const beforeClear = await deviceUseCase.getDevices();
    expect(beforeClear.length).toBe(2);

    await deviceUseCase.clearAllDevices();
    const afterClear = await deviceUseCase.getDevices();
    expect(afterClear.length).toBe(0);
  });

  it('should attach UE and stop it', async () => {
    const res = await deviceUseCase.attachUE('123456789012345', '127.0.0.1');
    expect(res.status).toBe('created');
    expect(res.session.imsi).toBe('123456789012345');

    const stopped = await deviceUseCase.stopDevice('imsi-123456789012345');
    expect(stopped).toEqual({ status: 'stopped', id: 'imsi-123456789012345' });

    const devices = await deviceUseCase.getDevices();
    expect(devices[0].status).toBe('STOPPED');
  });

  it('should update UE', async () => {
    await deviceUseCase.updateUE('imsi-123456789012345', { mcc: '999', mnc: '70' });
    const devices = await deviceUseCase.getDevices();
    expect(devices[0].id).toBe('imsi-123456789012345');
  });

  it('should start GNB and update it', async () => {
    const res = await deviceUseCase.startGNB({ nci: '0x10', tac: '5' });
    expect(res.status).toBe('created');

    await deviceUseCase.updateGNB('0x10', { tac: '6' });
    const devices = await deviceUseCase.getDevices();
    expect(devices[0].id).toBe('gnb-0x10');
  });

  it('should remove device', async () => {
    await deviceUseCase.startGNB({ nci: '0x10' });
    const before = await deviceUseCase.getDevices();
    expect(before.length).toBe(1);

    await deviceUseCase.removeDevice('gnb-0x10');
    const after = await deviceUseCase.getDevices();
    expect(after.length).toBe(0);
  });

  it('should start existing UE and GNB devices', async () => {
    await deviceUseCase.provisionAll();
    // Stop them first
    await container.getActiveUeransim().controller.stopAll();

    const resUE = await deviceUseCase.startDevice('imsi-123456789012345');
    expect(resUE.status).toBe('started');

    const resGNB = await deviceUseCase.startDevice('gnb-0x000000010');
    expect(resGNB.status).toBe('started');

    await expect(deviceUseCase.startDevice('non-existent')).rejects.toThrow('Device config not found');
  });

  it('should return device logs and config', async () => {
    await deviceUseCase.provisionAll();
    const logsRes = await deviceUseCase.getDeviceLogs('imsi-123456789012345');
    expect(logsRes.logs.length).toBeGreaterThan(0);

    const configRes = await deviceUseCase.getDeviceYaml('imsi-123456789012345');
    expect(configRes.yaml).toBeDefined();

    const newYaml = 'supi: imsi-123456789012345\nmcc: "888"';
    await deviceUseCase.saveDeviceYaml('imsi-123456789012345', newYaml);
    const updated = await deviceUseCase.getDeviceYaml('imsi-123456789012345');
    expect(updated.yaml).toContain('mcc: \'888\'');
  });
});
