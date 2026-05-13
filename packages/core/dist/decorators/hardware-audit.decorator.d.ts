import { UniversalHardwarePort, APDU, ChipStatus, TransportError } from '../ports/hardware.port.js';
import { UniversalAuditPort } from '../ports/audit.port.js';
export declare class HardwareAuditDecorator implements UniversalHardwarePort {
    private decorated;
    private audit;
    private sessionId;
    constructor(decorated: UniversalHardwarePort, audit: UniversalAuditPort, sessionId: string);
    transmit(command: APDU): Promise<{
        success: boolean;
        data?: Buffer;
        status?: ChipStatus;
        error?: TransportError;
    }>;
    reset(): Promise<boolean>;
}
//# sourceMappingURL=hardware-audit.decorator.d.ts.map