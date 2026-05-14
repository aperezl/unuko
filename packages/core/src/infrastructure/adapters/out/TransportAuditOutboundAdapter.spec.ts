import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TransportAuditOutboundAdapter } from './TransportAuditOutboundAdapter';

describe('TransportAuditOutboundAdapter', () => {
  let adapter: TransportAuditOutboundAdapter;
  let mockTransport: any;
  let mockAudit: any;
  const sessionId = 'test-session';

  beforeEach(() => {
    mockTransport = { post: vi.fn(), get: vi.fn() };
    mockAudit = { log: vi.fn() };
    adapter = new TransportAuditOutboundAdapter(mockTransport, mockAudit, sessionId);
  });

  describe('post', () => {
    it('should log outgoing and incoming transport requests', async () => {
      const request = { url: 'http://test.com', body: { data: 'test' } };
      const response = { status: 200, data: { result: 'ok' } };

      mockTransport.post.mockResolvedValue(response);

      const result = await adapter.post(request);

      expect(mockTransport.post).toHaveBeenCalledWith(request);
      expect(result).toEqual(response);
      expect(mockAudit.log).toHaveBeenCalledTimes(2);
    });
  });
});
