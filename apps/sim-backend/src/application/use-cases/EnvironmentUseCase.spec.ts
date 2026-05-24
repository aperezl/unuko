import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock fs to prevent write to the environment file on disk
vi.mock('fs', () => {
  let mockEnv = JSON.stringify({ environment: 'mock', activeVm: 'core5g' });
  return {
    default: {
      existsSync: vi.fn(() => true),
      readFileSync: vi.fn(() => mockEnv),
      writeFileSync: vi.fn((p, content) => {
        mockEnv = content;
      }),
      mkdirSync: vi.fn(() => {}),
    },
    existsSync: vi.fn(() => true),
    readFileSync: vi.fn(() => mockEnv),
    writeFileSync: vi.fn((p, content) => {
      mockEnv = content;
    }),
    mkdirSync: vi.fn(() => {}),
  };
});

// Mock @unuko/cli
vi.mock('@unuko/cli', () => {
  return {
    limaManager: {
      listInstances: vi.fn(() => [
        { name: 'core5g', status: 'Running', cpus: 4, memory: 4 * 1024 * 1024 * 1024, sshLocalPort: 50473 },
        { name: '5g-dev', status: 'Stopped', cpus: 4, memory: 4 * 1024 * 1024 * 1024, sshLocalPort: 65081 }
      ]),
      startVM: vi.fn(),
      stopVM: vi.fn()
    }
  };
});

import { environmentUseCase } from './EnvironmentUseCase';
import { container } from '../../infrastructure/di/DependencyContainer';

describe('EnvironmentUseCase', () => {
  beforeEach(() => {
    container.setEnvironment('mock');
    container.setActiveVm('core5g');
  });

  it('should return the current environment', () => {
    expect(environmentUseCase.getEnvironment()).toEqual({ environment: 'mock' });
  });

  it('should switch the environment and return the new environment', () => {
    const res = environmentUseCase.setEnvironment('lima');
    expect(res).toEqual({ environment: 'lima' });
    expect(environmentUseCase.getEnvironment()).toEqual({ environment: 'lima' });
    expect(container.getEnvironment()).toBe('lima');
  });

  it('should list all VMs and active VM', () => {
    const res = environmentUseCase.getVms();
    expect(res.activeVm).toBe('core5g');
    expect(res.vms.length).toBe(2);
    expect(res.vms[0]).toEqual({
      name: 'core5g',
      status: 'Running',
      cpus: 4,
      memory: '4GiB',
      sshLocalPort: 50473
    });
  });

  it('should set active VM', () => {
    const res = environmentUseCase.setActiveVm('5g-dev');
    expect(res).toEqual({ activeVm: '5g-dev' });
    expect(container.getActiveVm()).toBe('5g-dev');
  });

  it('should start VM', async () => {
    const res = await environmentUseCase.startVm('5g-dev');
    expect(res).toEqual({ status: 'starting' });
  });

  it('should stop VM', async () => {
    const res = await environmentUseCase.stopVm('core5g');
    expect(res).toEqual({ status: 'stopping' });
  });
});

