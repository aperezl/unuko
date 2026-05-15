import { describe, it, expect, vi } from 'vitest';
import { SessionInspector } from './SessionInspector';
import { UniversalPersistencePort } from '../../domain/ports/out/persistence.port';
import { UniversalAuditReaderPort } from '../../domain/ports/out/audit.port';

describe('SessionInspector', () => {
  const mockPersistence: UniversalPersistencePort = {
    saveSession: vi.fn(),
    loadSession: vi.fn(),
    listSessions: vi.fn(),
    deleteSession: vi.fn()
  };

  const mockAuditReader: UniversalAuditReaderPort = {
    getAuditLogs: vi.fn(),
    deleteAuditLogs: vi.fn()
  };

  const inspector = new SessionInspector(mockPersistence, mockAuditReader);

  it('should return session flow with calculated progress', async () => {
    vi.mocked(mockPersistence.loadSession).mockResolvedValueOnce({
      value: 'SUCCESS',
      context: { imsi: '21407001' },
      status: 'SUCCESS'
    });

    const flow = await inspector.getSessionFlow('sess-1');

    expect(flow).not.toBeNull();
    expect(flow?.progress).toBe(100);
    expect(flow?.displayState).toBe('SUCCESS');
  });

  it('should return null if session not found', async () => {
    vi.mocked(mockPersistence.loadSession).mockResolvedValueOnce(null);
    const flow = await inspector.getSessionFlow('unknown');
    expect(flow).toBeNull();
  });

  it('should return full details including logs', async () => {
    const sessionId = 'sess-full';
    vi.mocked(mockPersistence.loadSession).mockResolvedValueOnce({
      value: { provisioning: 'downloading' },
      context: { imsi: '21407001' },
      status: 'downloading'
    });

    const mockLogs = [
      { _id: '1', sessionId, timestamp: new Date(), category: 'WORKFLOW' as const, level: 'INFO' as const, direction: 'INTERNAL' as const, payload: {}, description: 'Log 1' }
    ];
    vi.mocked(mockAuditReader.getAuditLogs).mockResolvedValueOnce(mockLogs);

    const details = await inspector.getFullDetails(sessionId);

    expect(details).not.toBeNull();
    expect(details.logs).toHaveLength(1);
    expect(details.status).toEqual({ provisioning: 'downloading' });
    expect(details.progress).toBeGreaterThan(0);
  });
});
