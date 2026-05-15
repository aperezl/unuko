import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';
import path from 'path';
import { UniversalAuditPort, UniversalAuditReaderPort, AuditEntry } from '../../../domain/ports/out/audit.port';

export class FileAuditAdapter implements UniversalAuditPort, UniversalAuditReaderPort {
  private logsDir: string;

  constructor(basePath: string = './data') {
    this.logsDir = path.resolve(basePath, 'logs');
  }

  private async ensureDir() {
    await fs.mkdir(this.logsDir, { recursive: true });
  }

  async log(entry: Omit<AuditEntry, 'timestamp' | '_id'>): Promise<void> {
    await this.ensureDir();
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

  async deleteAuditLogs(sessionId: string): Promise<void> {
    try {
      await fs.unlink(path.join(this.logsDir, `${sessionId}.log`));
    } catch (error) {}
  }
}
