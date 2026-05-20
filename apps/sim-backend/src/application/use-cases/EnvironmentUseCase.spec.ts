import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock fs to prevent write to the environment file on disk
vi.mock('fs', () => {
  let mockEnv = JSON.stringify({ environment: 'mock' });
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

import { environmentUseCase } from './EnvironmentUseCase';
import { container } from '../../infrastructure/di/DependencyContainer';

describe('EnvironmentUseCase', () => {
  beforeEach(() => {
    container.setEnvironment('mock');
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
});
