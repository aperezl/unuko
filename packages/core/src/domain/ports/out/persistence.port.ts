import { AuditEntry } from './audit.port';

export interface SessionSnapshot {
  value: any;
  context: any;
  status: any;
  imsi?: string;
}

export interface SessionFlow {
  sessionId: string;
  imsi?: string;
  displayState: string;
  progress: number;
  logs?: AuditEntry[];
}

export interface UniversalPersistencePort {
  saveSession(sessionId: string, snapshot: SessionSnapshot): Promise<void>;
  loadSession(sessionId: string): Promise<SessionSnapshot | null>;
  listSessions(): Promise<any[]>;
  deleteSession(sessionId: string): Promise<void>;
  getSessionFlow(sessionId: string): Promise<SessionFlow | null>;
}
