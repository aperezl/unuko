import { promises as fs } from 'fs';
import path from 'path';
import { 
  UniversalPersistencePort, 
  SessionSnapshot
} from '../../../domain/ports/out/persistence.port';

export class JsonPersistenceAdapter implements UniversalPersistencePort {
  private sessionsDir: string;

  constructor(basePath: string = './data') {
    this.sessionsDir = path.resolve(basePath, 'sessions');
  }

  private async ensureDirs() {
    await fs.mkdir(this.sessionsDir, { recursive: true });
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
  }
}
