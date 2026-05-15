import { WorkflowPorts } from '../../../domain/models/workflow.types';
import { ConsoleAuditAdapter } from './ConsoleAuditAdapter';
import { ConsoleNotificationAdapter } from './ConsoleNotificationAdapter';
import { MockHardwareAdapter } from './MockHardwareAdapter';
import { MockCryptoAdapter } from './MockCryptoAdapter';
import { FetchTransportAdapter } from './FetchTransportAdapter';
import { MockNetworkAdapter } from './MockNetworkAdapter';
import { JsonPersistenceAdapter } from './JsonPersistenceAdapter';

export * from './ConsoleAuditAdapter';
export * from './ConsoleNotificationAdapter';
export * from './MockHardwareAdapter';
export * from './MockCryptoAdapter';
export * from './FetchTransportAdapter';
export * from './MockNetworkAdapter';
export * from './JsonPersistenceAdapter';

/**
 * Crea un conjunto de puertos con implementaciones por defecto (consola y mocks).
 * Útil para pruebas rápidas o desarrollo local.
 */
export function createDefaultPorts(sessionId: string): WorkflowPorts {
  return {
    sessionId,
    audit: new ConsoleAuditAdapter(),
    notification: new ConsoleNotificationAdapter(),
    hardware: new MockHardwareAdapter({ delayMs: 50 }),
    crypto: new MockCryptoAdapter(),
    transport: new FetchTransportAdapter(),
    network: new MockNetworkAdapter({ delayMs: 1000 })
  };
}
