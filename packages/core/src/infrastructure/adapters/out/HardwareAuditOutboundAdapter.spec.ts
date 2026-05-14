import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HardwareAuditOutboundAdapter } from './HardwareAuditOutboundAdapter';

describe('HardwareAuditOutboundAdapter', () => {
  let adapter: HardwareAuditOutboundAdapter;
  let mockHardware: any;
  let mockAudit: any;
  const sessionId = 'test-session';

  beforeEach(() => {
    mockHardware = { transmit: vi.fn(), reset: vi.fn() };
    mockAudit = { log: vi.fn() };
    adapter = new HardwareAuditOutboundAdapter(mockHardware, mockAudit, sessionId);
  });

  describe('transmit', () => {
    it('should log outgoing and incoming APDUs', async () => {
      const command = Buffer.from('80E2910002BF2D', 'hex');
      const response = {
        success: true,
        data: Buffer.from('BF2D00', 'hex'),
        status: { sw1: 0x90, sw2: 0x00, isSuccess: true }
      };

      mockHardware.transmit.mockResolvedValue(response);

      const result = await adapter.transmit(command);

      expect(mockHardware.transmit).toHaveBeenCalledWith(command);
      expect(result).toEqual(response);
      expect(mockAudit.log).toHaveBeenCalledTimes(2);
    });
  });
});
