import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';

// Mock fs module
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
    },
    _setFile: (p: string, content: string) => {
      mockFiles[p] = content;
    }
  };
  return {
    default: mockFs,
    ...mockFs
  };
});

import { MockSdmAdapter, MockUeransimController, MockUeransimNetworkAdapter } from './MockInfrastructureAdapter';

describe('MockInfrastructureAdapter', () => {
  const fsMock = fs as any;

  beforeEach(() => {
    fsMock._clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('MockSdmAdapter', () => {
    it('should find all subscribers (empty by default)', async () => {
      const adapter = new MockSdmAdapter();
      const all = await adapter.findAll();
      expect(all).toEqual([]);
    });

    it('should upsert and find subscriber by IMSI', async () => {
      const adapter = new MockSdmAdapter();
      const sub = { imsi: '123456789012345', k: 'A B C', opc: 'D E F', slices: [] };
      await adapter.upsert(sub);
      
      const found = await adapter.findById('123456789012345');
      expect(found).toBeDefined();
      expect(found?.imsi).toBe('123456789012345');
      expect(found?.k).toBe('ABC'); // Spaces removed
      expect(found?.opc).toBe('DEF'); // Spaces removed

      const all = await adapter.findAll();
      expect(all.length).toBe(1);
    });

    it('should delete subscriber and clear all', async () => {
      const adapter = new MockSdmAdapter();
      const sub1 = { imsi: '111111111111111', k: 'key1', opc: 'opc1', slices: [] };
      const sub2 = { imsi: '222222222222222', k: 'key2', opc: 'opc2', slices: [] };
      await adapter.upsert(sub1);
      await adapter.upsert(sub2);

      await adapter.delete('111111111111111');
      const all = await adapter.findAll();
      expect(all.length).toBe(1);
      expect(all[0].imsi).toBe('222222222222222');

      await adapter.clearAll();
      expect(await adapter.findAll()).toEqual([]);
    });

    it('should handle fs errors gracefully', async () => {
      const adapter = new MockSdmAdapter();
      fsMock._setFile('./data/mock-subscribers.json', '[]');
      vi.spyOn(fs, 'readFileSync').mockImplementationOnce(() => {
        throw new Error('Read error');
      });
      expect(await adapter.findAll()).toEqual([]);
    });
  });

  describe('MockUeransimController', () => {
    it('should list devices (empty initially)', async () => {
      const ctrl = new MockUeransimController();
      expect(await ctrl.getDevices()).toEqual([]);
    });

    it('should start and update GNB', async () => {
      const ctrl = new MockUeransimController();
      await ctrl.init();
      const gnbConfig = { nci: '123', mcc: '999', mnc: '70' };
      const dev = await ctrl.startGNB(gnbConfig, true);
      expect(dev.id).toBe('gnb-123');
      expect(dev.status).toBe('RUNNING');
      expect(dev.connected).toBe(true);

      const list = await ctrl.getDevices();
      expect(list.length).toBe(1);

      await ctrl.updateGNB('123', gnbConfig);
      const listAfterUpdate = await ctrl.getDevices();
      expect(listAfterUpdate[0].status).toBe('STOPPED');
    });

    it('should start and update UE', async () => {
      const ctrl = new MockUeransimController();
      const ueConfig = { supi: 'imsi-123' };
      const dev = await ctrl.startUE(ueConfig, true);
      expect(dev.id).toBe('imsi-123');
      expect(dev.status).toBe('RUNNING');
      expect(dev.ip).toBeDefined();

      await ctrl.updateUE('imsi-123', ueConfig);
      const list = await ctrl.getDevices();
      expect(list[0].status).toBe('STOPPED');
    });

    it('should stop, remove and clear devices', async () => {
      const ctrl = new MockUeransimController();
      await ctrl.startUE({ supi: 'imsi-1' }, true);
      await ctrl.startUE({ supi: 'imsi-2' }, true);

      await ctrl.stopDevice('imsi-1');
      const list = await ctrl.getDevices();
      expect(list.find(d => d.id === 'imsi-1')?.status).toBe('STOPPED');

      await ctrl.stopAll();
      const listStopped = await ctrl.getDevices();
      expect(listStopped.every(d => d.status === 'STOPPED')).toBe(true);

      await ctrl.removeDevice('imsi-1');
      expect((await ctrl.getDevices()).length).toBe(1);

      await ctrl.removeAllDevices();
      expect(await ctrl.getDevices()).toEqual([]);
    });

    it('should return mock logs', async () => {
      const ctrl = new MockUeransimController();
      const gnbLogs = await ctrl.getLogs('gnb-123');
      expect(gnbLogs).toContain('UERANSIM gNodeB started');

      const ueLogs = await ctrl.getLogs('imsi-123');
      expect(ueLogs).toContain('UERANSIM User Equipment started');
    });

    it('should get and save device yaml configuration', async () => {
      const ctrl = new MockUeransimController();
      await ctrl.startUE({ supi: 'imsi-1', customField: 'test' }, false);
      const yamlStr = await ctrl.getDeviceYaml('imsi-1');
      expect(yamlStr).toContain('customField: test');

      const newYaml = 'supi: imsi-1\ncustomField: updated';
      await ctrl.saveDeviceYaml('imsi-1', newYaml);
      const updatedYaml = await ctrl.getDeviceYaml('imsi-1');
      expect(updatedYaml).toContain('customField: updated');

      await expect(ctrl.getDeviceYaml('non-existent')).rejects.toThrow();
      await expect(ctrl.saveDeviceYaml('non-existent', '')).rejects.toThrow();
    });
  });

  describe('MockUeransimNetworkAdapter', () => {
    it('should support provision and deprovision', async () => {
      const adapter = new MockUeransimNetworkAdapter();
      await expect(adapter.provision({ imsi: '123', k: 'key', opc: 'opc', slices: [] })).resolves.not.toThrow();
      await expect(adapter.deprovision('123')).resolves.not.toThrow();
    });

    it('should attach and detach UE', async () => {
      const adapter = new MockUeransimNetworkAdapter();
      const session = await adapter.attachUE('123', { gnbAddress: '127.0.0.1', apn: 'internet' });
      expect(session.sessionId).toBe('session-123');
      expect(session.status).toBe('CONNECTED');

      await adapter.detachUE('123');
      const devices = await adapter.controller.getDevices();
      expect(devices[0].status).toBe('STOPPED');
    });

    it('should get metrics and sessions', async () => {
      const adapter = new MockUeransimNetworkAdapter();
      const metrics = await adapter.getMetrics('123');
      expect(metrics.sessionId).toBe('session-123');
      expect(metrics.rrcState).toBe('CONNECTED');

      await adapter.attachUE('123');
      const sessions = await adapter.getSessions();
      expect(sessions.length).toBe(1);
      expect(sessions[0].imsi).toBe('123');
    });
  });
});
