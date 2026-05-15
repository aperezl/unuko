import { UniversalHardwarePort, APDU, ChipStatus, TransportError } from '../../../domain/ports/out/hardware.port';
import { UniversalAuditPort } from '../../../domain/ports/out/audit.port';

export class HardwareAuditOutboundAdapter implements UniversalHardwarePort {
  constructor(
    private decorated: UniversalHardwarePort,
    private audit: UniversalAuditPort,
    private sessionId: string
  ) {}

  async transmit(command: APDU): Promise<{
    success: boolean;
    data?: Buffer;
    status?: ChipStatus;
    error?: TransportError;
  }> {
    const commandHex = command.toString('hex').toUpperCase();
    await this.audit.log({
      sessionId: this.sessionId,
      category: 'HARDWARE',
      level: 'AUDIT',
      direction: 'OUT',
      payload: { apdu: commandHex },
      description: 'APDU Command'
    });

    try {
      const response = await this.decorated.transmit(command);
      
      const respHex = response.data ? response.data.toString('hex').toUpperCase() : '';
      const swHex = response.status 
        ? `${response.status.sw1.toString(16).padStart(2, '0')}${response.status.sw2.toString(16).padStart(2, '0')}`.toUpperCase()
        : '';

      await this.audit.log({
        sessionId: this.sessionId,
        category: 'HARDWARE',
        level: 'AUDIT',
        direction: 'IN',
        payload: { 
          data: respHex, 
          sw: swHex, 
          success: response.success,
          error: response.error 
        },
        description: 'APDU Response'
      });

      return response;
    } catch (error) {
      await this.audit.log({
        sessionId: this.sessionId,
        category: 'HARDWARE',
        level: 'ERROR',
        direction: 'IN',
        payload: { error: error instanceof Error ? error.message : String(error) },
        description: 'APDU Transmission Failure'
      });
      throw error;
    }
  }

  async reset(): Promise<boolean> {
    await this.audit.log({
      sessionId: this.sessionId,
      category: 'HARDWARE',
      level: 'INFO',
      direction: 'OUT',
      payload: {},
      description: 'Hardware Reset Request'
    });
    return this.decorated.reset();
  }
}
