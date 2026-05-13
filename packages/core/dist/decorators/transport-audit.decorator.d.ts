import { UniversalTransportPort, TransportRequest } from '../ports/transport.port.js';
import { UniversalAuditPort } from '../ports/audit.port.js';
export declare class TransportAuditDecorator implements UniversalTransportPort {
    private decorated;
    private audit;
    private sessionId;
    constructor(decorated: UniversalTransportPort, audit: UniversalAuditPort, sessionId: string);
    post<T>(request: TransportRequest): Promise<T>;
}
//# sourceMappingURL=transport-audit.decorator.d.ts.map