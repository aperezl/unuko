import { vi, describe, it, expect, beforeEach } from 'vitest';

let mockPortOnline = true;
vi.mock('net', () => {
  class MockSocket {
    private handlers: Record<string, Function> = {};
    setTimeout() {}
    on(event: string, cb: Function) {
      this.handlers[event] = cb;
      return this;
    }
    connect(port: number, host: string) {
      if (mockPortOnline) {
        if (this.handlers['connect']) {
          setTimeout(() => {
            this.handlers['connect']();
            if (this.handlers['close']) this.handlers['close']();
          }, 1);
        }
      } else {
        if (this.handlers['error']) {
          setTimeout(() => {
            this.handlers['error'](new Error('Refused'));
            if (this.handlers['close']) this.handlers['close']();
          }, 1);
        }
      }
    }
    destroy() {}
  }
  return {
    default: { Socket: MockSocket },
    Socket: MockSocket
  };
});

let mockExecSyncOutput = 'active';
let mockExecSyncShouldThrow = false;
vi.mock('child_process', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    execSync: vi.fn((cmd) => {
      if (mockExecSyncShouldThrow) {
        const err = new Error('cmd failed') as any;
        err.stdout = 'inactive\n';
        throw err;
      }
      return mockExecSyncOutput;
    })
  };
});

// Mock fs to simulate database writable check
vi.mock('fs', () => {
  let mockPersistenceDirExists = true;
  const mockFs = {
    existsSync: vi.fn(() => mockPersistenceDirExists),
    mkdirSync: vi.fn(),
    readFileSync: vi.fn(() => JSON.stringify({ environment: 'mock' })),
    writeFileSync: vi.fn(),
    _setPersistenceDirExists: (val: boolean) => {
      mockPersistenceDirExists = val;
    }
  };
  return {
    default: mockFs,
    ...mockFs
  };
});

import { serviceUseCase } from './ServiceUseCase';
import { container } from '../../infrastructure/di/DependencyContainer';
import { execSync } from 'child_process';
import fs from 'fs';

describe('ServiceUseCase', () => {
  beforeEach(() => {
    mockPortOnline = true;
    mockExecSyncOutput = 'active';
    mockExecSyncShouldThrow = false;
    (fs as any)._setPersistenceDirExists(true);
    container.setEnvironment('mock');
  });

  describe('getServicesStatus', () => {
    it('should return mock service list when in mock environment', async () => {
      container.setEnvironment('mock');
      const status = await serviceUseCase.getServicesStatus();
      expect(status.length).toBeGreaterThan(0);
      expect(status[0].name).toBe('Mock SM-DP+ Server');
      expect(status[0].status).toBe('online');
    });

    it('should show offline database when flat-file json dir does not exist', async () => {
      container.setEnvironment('mock');
      (fs as any)._setPersistenceDirExists(false);
      const status = await serviceUseCase.getServicesStatus();
      const db = status.find(s => s.name === 'Mock Database (JSON)');
      expect(db?.status).toBe('offline');
    });

    it('should return lima services when environment is lima', async () => {
      container.setEnvironment('lima');
      mockExecSyncOutput = 'active\nactive\nactive\nactive\nactive\nactive\nactive\nactive\nactive\nactive';
      const status = await serviceUseCase.getServicesStatus();
      
      const mongo = status.find(s => s.name === 'MongoDB');
      expect(mongo?.status).toBe('online');

      const amf = status.find(s => s.name === 'AMF');
      expect(amf?.status).toBe('online');
    });

    it('should fallback to offline when execSync throws in lima environment', async () => {
      container.setEnvironment('lima');
      mockExecSyncShouldThrow = true;
      const status = await serviceUseCase.getServicesStatus();
      const amf = status.find(s => s.name === 'AMF');
      expect(amf?.status).toBe('offline');
    });
  });

  describe('toggleServiceState', () => {
    it('should immediately return state in mock environment', async () => {
      container.setEnvironment('mock');
      const res = await serviceUseCase.toggleServiceState('any-service', 'start');
      expect(res).toEqual({ status: 'active' });
    });

    it('should call systemctl and return active in lima environment', async () => {
      container.setEnvironment('lima');
      mockExecSyncOutput = 'active';
      const res = await serviceUseCase.toggleServiceState('open5gs-amfd', 'start');
      expect(res).toEqual({ status: 'active' });
      expect(execSync).toHaveBeenCalled();
    });

    it('should return inactive/error status if child_process fails and no stdout', async () => {
      container.setEnvironment('lima');
      mockExecSyncShouldThrow = true;
      // Overwrite execSync mock behavior to fail completely without stdout
      vi.mocked(execSync).mockImplementationOnce(() => {
        throw new Error('Total failure');
      });
      const res = await serviceUseCase.toggleServiceState('open5gs-amfd', 'stop');
      expect(res).toEqual({ status: 'inactive' });
    });
  });
});
