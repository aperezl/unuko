import { vi, describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';

// Mock fs module
vi.mock('fs', () => {
  let mockEnv = JSON.stringify({ environment: 'mock' });
  const mockFs = {
    existsSync: vi.fn(() => true),
    readFileSync: vi.fn(() => mockEnv),
    writeFileSync: vi.fn((p, content) => {
      mockEnv = content;
    }),
    mkdirSync: vi.fn(() => {}),
  };
  return {
    default: mockFs,
    ...mockFs
  };
});

import { DependencyContainer } from './DependencyContainer';

describe('DependencyContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with mock environment', () => {
    const container = new DependencyContainer();
    expect(container.getEnvironment()).toBe('mock');
    expect(container.getActiveSdm()).toBeDefined();
    expect(container.getActiveUeransim()).toBeDefined();
    expect(container.getActivePersistence()).toBeDefined();
    expect(container.getActiveInspector()).toBeDefined();
    expect(container.getActiveFileAudit()).toBeDefined();
    expect(container.getActiveAudit()).toBeDefined();
    expect(container.getActiveNetwork()).toBeDefined();
    expect(container.getRawHardware()).toBeDefined();
    expect(container.getRawTransport()).toBeDefined();
    expect(container.getCrypto()).toBeDefined();
    expect(container.getNotification()).toBeDefined();
  });

  it('should switch environment to lima and back', () => {
    const container = new DependencyContainer();
    container.setEnvironment('lima');
    expect(container.getEnvironment()).toBe('lima');

    container.setEnvironment('mock');
    expect(container.getEnvironment()).toBe('mock');
  });

  it('should handle missing environment file by falling back to mock', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValueOnce(false);
    const container = new DependencyContainer();
    expect(container.getEnvironment()).toBe('mock');
  });
});
