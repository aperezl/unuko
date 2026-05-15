import { UniversalAuditPort, AuditEntry } from '../../../domain/ports/out/audit.port';

export class ConsoleAuditAdapter implements UniversalAuditPort {
  async log(entry: Omit<AuditEntry, 'timestamp'>): Promise<void> {
    const timestamp = new Date().toISOString();
    console.log(`[AUDIT] [${timestamp}] [${entry.category}] [${entry.direction}] - ${entry.sessionId}`);
    if (entry.description) {
      console.log(`  Description: ${entry.description}`);
    }
    if (entry.payload) {
      const payloadStr = typeof entry.payload === 'object' ? JSON.stringify(entry.payload, null, 2) : entry.payload;
      console.log(`  Payload: ${payloadStr}`);
    }
  }
}
