import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock fs to isolate subscriber database
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

import { subscriberUseCase } from './SubscriberUseCase';
import { container } from '../../infrastructure/di/DependencyContainer';
import fs from 'fs';

describe('SubscriberUseCase', () => {
  beforeEach(() => {
    (fs as any)._clear();
    container.setEnvironment('mock');
  });

  it('should list empty subscribers initially', async () => {
    const list = await subscriberUseCase.listSubscribers();
    expect(list).toEqual([]);
  });

  it('should upsert and get subscriber by IMSI', async () => {
    const sub = { imsi: '123456789012345', k: '123' };
    await subscriberUseCase.upsertSubscriber(sub);

    const found = await subscriberUseCase.getSubscriber('123456789012345');
    expect(found).toBeDefined();
    expect(found.imsi).toBe('123456789012345');

    const list = await subscriberUseCase.listSubscribers();
    expect(list.length).toBe(1);
  });

  it('should throw error when subscriber not found', async () => {
    await expect(subscriberUseCase.getSubscriber('non-existent')).rejects.toThrow('Subscriber not found');
  });

  it('should delete subscriber', async () => {
    const sub = { imsi: '123456789012345' };
    await subscriberUseCase.upsertSubscriber(sub);
    
    await subscriberUseCase.deleteSubscriber('123456789012345');
    const list = await subscriberUseCase.listSubscribers();
    expect(list.length).toBe(0);
  });
});
