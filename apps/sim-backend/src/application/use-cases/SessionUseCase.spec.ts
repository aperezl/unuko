import { vi, describe, it, expect, beforeEach } from 'vitest';
import { setup } from 'xstate';

// Mock xstate machines from @unuko/core
vi.mock('@unuko/core', async (importOriginal) => {
  const actual = await importOriginal() as any;
  const dummyMachine = setup({}).createMachine({
    id: 'dummy',
    initial: 'idle',
    states: {
      idle: {
        on: {
          NEXT: 'done',
          FAIL: 'failure'
        }
      },
      done: {},
      failure: {}
    }
  });

  return {
    ...actual,
    createSGP22Machine: vi.fn(() => dummyMachine),
    createInventoryMachine: vi.fn(() => dummyMachine),
    createProfileMgmtMachine: vi.fn(() => dummyMachine),
    createNotificationMachine: vi.fn(() => dummyMachine),
    createTestMachine: vi.fn(() => dummyMachine),
    unukoEngine: {
      createMachine: vi.fn(() => dummyMachine)
    }
  };
});

import { sessionUseCase } from './SessionUseCase';
import { container } from '../../infrastructure/di/DependencyContainer';

describe('SessionUseCase', () => {
  const mockPersistence = {
    listSessions: vi.fn(),
    saveSession: vi.fn(),
    deleteSession: vi.fn(),
  };

  const mockInspector = {
    getFullDetails: vi.fn(),
  };

  const mockFileAudit = {
    deleteAuditLogs: vi.fn(),
  };

  const mockAudit = {
    log: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(container, 'getActivePersistence').mockReturnValue(mockPersistence as any);
    vi.spyOn(container, 'getActiveInspector').mockReturnValue(mockInspector as any);
    vi.spyOn(container, 'getActiveFileAudit').mockReturnValue(mockFileAudit as any);
    vi.spyOn(container, 'getActiveAudit').mockReturnValue(mockAudit as any);
  });

  it('should list sessions from persistence', async () => {
    mockPersistence.listSessions.mockResolvedValue([
      { sessionId: 'S1', status: 'active', updatedAt: 'now' }
    ]);

    const list = await sessionUseCase.listSessions();
    expect(list).toEqual([
      { sessionId: 'S1', status: 'active', updatedAt: 'now' }
    ]);
  });

  it('should return session details from inspector', async () => {
    mockInspector.getFullDetails.mockResolvedValue({ id: 'S1', logs: [] });
    const details = await sessionUseCase.getSessionDetails('S1');
    expect(details).toEqual({ id: 'S1', logs: [] });
  });

  it('should start session and save state transitions', async () => {
    const actor = await sessionUseCase.startSession('S1', 'provisioning');
    expect(actor).toBeDefined();

    // Check if initial save was called
    expect(mockPersistence.saveSession).toHaveBeenCalled();
  });

  it('should process events sent to session', async () => {
    await sessionUseCase.startSession('S1', 'provisioning');
    
    const res = await sessionUseCase.sendSessionEvent('S1', 'NEXT');
    expect(res).toEqual({ status: 'event_processed', event: 'NEXT' });
  });

  it('should throw error when sending event to non-existent session', async () => {
    await expect(sessionUseCase.sendSessionEvent('non-existent', 'NEXT')).rejects.toThrow(
      'Active actor not found for this session'
    );
  });

  it('should delete session and stop actor if active', async () => {
    await sessionUseCase.startSession('S1', 'provisioning');
    
    const res = await sessionUseCase.deleteSession('S1');
    expect(res).toEqual({ status: 'deleted', sessionId: 'S1' });
    expect(mockPersistence.deleteSession).toHaveBeenCalledWith('S1');
    expect(mockFileAudit.deleteAuditLogs).toHaveBeenCalledWith('S1');

    // Trying to send event should fail now
    await expect(sessionUseCase.sendSessionEvent('S1', 'NEXT')).rejects.toThrow();
  });

  it('should start session with custom workflowDefinition', async () => {
    const workflowDef = { id: 'custom-wf' };
    const actor = await sessionUseCase.startSession('S2', 'custom', undefined, workflowDef);
    expect(actor).toBeDefined();
  });
});
