import { WorkflowPorts } from '../../../domain/models/workflow.types';
import { ConsoleAuditAdapter } from './ConsoleAuditAdapter';
import { ConsoleNotificationAdapter } from './ConsoleNotificationAdapter';
import { MockHardwareAdapter } from './MockHardwareAdapter';
import { MockCryptoAdapter } from './MockCryptoAdapter';
import { FetchTransportAdapter } from './FetchTransportAdapter';

/**
 * Crea un conjunto de puertos con implementaciones por defecto (consola y mocks).
 * Útil para pruebas rápidas o desarrollo local.
 */
export function createDefaultPorts(sessionId: string): WorkflowPorts {
  return {
    sessionId,
    audit: new ConsoleAuditAdapter(),
    notification: new ConsoleNotificationAdapter(),
    hardware: new MockHardwareAdapter(),
    crypto: new MockCryptoAdapter(),
    transport: new FetchTransportAdapter()
  };
}
