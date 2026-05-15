import { UniversalPersistencePort, SessionFlow } from '../../domain/ports/out/persistence.port';
import { UniversalAuditReaderPort } from '../../domain/ports/out/audit.port';
import { calculateProgress } from '../../domain/logic/progress';

export class SessionInspector {
  constructor(
    private persistence: UniversalPersistencePort,
    private auditReader: UniversalAuditReaderPort
  ) {}

  async getSessionFlow(sessionId: string): Promise<SessionFlow | null> {
    const snapshot = await this.persistence.loadSession(sessionId);
    if (!snapshot) return null;

    return {
      sessionId,
      imsi: snapshot.imsi,
      displayState: snapshot.status,
      progress: calculateProgress(snapshot.status)
    };
  }

  async getFullDetails(sessionId: string): Promise<any | null> {
    const snapshot = await this.persistence.loadSession(sessionId);
    if (!snapshot) return null;

    const logs = await this.auditReader.getAuditLogs(sessionId);

    return {
      sessionId,
      status: snapshot.value,
      context: snapshot.context,
      displayState: snapshot.status,
      progress: calculateProgress(snapshot.status),
      logs: logs,
      updatedAt: new Date()
    };
  }

  async listRecentSessions(): Promise<any[]> {
    return this.persistence.listSessions();
  }
}
