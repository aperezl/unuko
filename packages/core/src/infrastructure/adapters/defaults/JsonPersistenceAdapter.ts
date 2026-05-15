import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';
import path from 'path';
import { 
  UniversalPersistencePort, 
  SessionSnapshot, 
  SessionFlow 
} from '../../../domain/ports/out/persistence.port';
import { UniversalAuditPort, AuditEntry } from '../../../domain/ports/out/audit.port';
import { calculateProgress } from '../../../domain/logic/progress';

export class JsonPersistenceAdapter implements UniversalPersistencePort, UniversalAuditPort {
  private baseDir: string;
  private sessionsDir: string;
  private logsDir: string;

  constructor(basePath: string = './data') {
    this.baseDir = path.resolve(basePath);
    this.sessionsDir = path.join(this.baseDir, 'sessions');
    this.logsDir = path.join(this.baseDir, 'logs');
  }

  private async ensureDirs() {
    await fs.mkdir(this.sessionsDir, { recursive: true });
    await fs.mkdir(this.logsDir, { recursive: true });
  }

  async saveSession(sessionId: string, snapshot: SessionSnapshot): Promise<void> {
    await this.ensureDirs();
    const filePath = path.join(this.sessionsDir, `${sessionId}.json`);
    await fs.writeFile(filePath, JSON.stringify({
      sessionId,
      snapshot,
      updatedAt: new Date().toISOString(),
      status: snapshot.value
    }, null, 2));
  }

  async loadSession(sessionId: string): Promise<SessionSnapshot | null> {
    try {
      const filePath = path.join(this.sessionsDir, `${sessionId}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      return data.snapshot;
    } catch (error) {
      return null;
    }
  }

  async listSessions(): Promise<any[]> {
    try {
      await this.ensureDirs();
      const files = await fs.readdir(this.sessionsDir);
      const sessions = await Promise.all(
        files
          .filter(f => f.endsWith('.json'))
          .map(async f => {
            const content = await fs.readFile(path.join(this.sessionsDir, f), 'utf-8');
            return JSON.parse(content);
          })
      );
      return sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (error) {
      return [];
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await fs.unlink(path.join(this.sessionsDir, `${sessionId}.json`));
    } catch (error) {}
    try {
      await fs.unlink(path.join(this.logsDir, `${sessionId}.log`));
    } catch (error) {}
  }

  async log(entry: Omit<AuditEntry, 'timestamp' | '_id'>): Promise<void> {
    await this.ensureDirs();
    const filePath = path.join(this.logsDir, `${entry.sessionId}.log`);
    
    const logLine = JSON.stringify({
      ...entry,
      _id: randomUUID(),
      timestamp: new Date()
    }) + '\n';

    await fs.appendFile(filePath, logLine);
  }

  async getAuditLogs(sessionId: string): Promise<AuditEntry[]> {
    try {
      const filePath = path.join(this.logsDir, `${sessionId}.log`);
      const content = await fs.readFile(filePath, 'utf-8');
      return content
        .trim()
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => JSON.parse(line));
    } catch (error) {
      return [];
    }
  }

  async getSessionFlow(sessionId: string): Promise<SessionFlow | null> {
    const session = await this.loadSessionRaw(sessionId);
    if (!session) return null;

    const logs = await this.getAuditLogs(sessionId);

    return {
      sessionId: session.sessionId,
      displayState: session.status,
      progress: calculateProgress(session.status),
      logs: logs.slice(-5).reverse() // Últimos 5 logs
    };
  }

  private async loadSessionRaw(sessionId: string): Promise<any | null> {
    try {
      const filePath = path.join(this.sessionsDir, `${sessionId}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }
}
