import { describe, it, expect, vi } from 'vitest';
import { CompositeAuditAdapter } from './CompositeAuditAdapter';
import { UniversalAuditPort } from '../../../domain/ports/out/audit.port';

describe('CompositeAuditAdapter', () => {
  it('should forward logs to all sub-adapters', async () => {
    const mockAdapter1: UniversalAuditPort = { log: vi.fn().mockResolvedValue(undefined) };
    const mockAdapter2: UniversalAuditPort = { log: vi.fn().mockResolvedValue(undefined) };
    
    const composite = new CompositeAuditAdapter([mockAdapter1, mockAdapter2]);
    const entry = {
      sessionId: 'sess-123',
      category: 'WORKFLOW' as const,
      level: 'INFO' as const,
      direction: 'INTERNAL' as const,
      payload: {},
      description: 'Test composite'
    };

    await composite.log(entry);

    expect(mockAdapter1.log).toHaveBeenCalledWith(entry);
    expect(mockAdapter2.log).toHaveBeenCalledWith(entry);
  });

  it('should not fail if one sub-adapter fails', async () => {
    const mockAdapter1: UniversalAuditPort = { log: vi.fn().mockRejectedValue(new Error('Fail')) };
    const mockAdapter2: UniversalAuditPort = { log: vi.fn().mockResolvedValue(undefined) };
    
    const composite = new CompositeAuditAdapter([mockAdapter1, mockAdapter2]);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await composite.log({
      sessionId: 'sess-fail',
      category: 'WORKFLOW' as const,
      level: 'INFO' as const,
      direction: 'INTERNAL' as const,
      payload: {},
      description: 'Test failure isolation'
    });

    expect(mockAdapter2.log).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});
