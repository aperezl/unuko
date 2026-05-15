export type AuditDirection = 'IN' | 'OUT' | 'INTERNAL';
export type AuditCategory = 'HARDWARE' | 'TRANSPORT' | 'WORKFLOW' | 'CRYPTO';
export type AuditLevel = 'DEBUG' | 'INFO' | 'AUDIT' | 'WARN' | 'ERROR';

export interface AuditEntry {
  _id: string;
  sessionId: string;
  timestamp: Date;
  category: AuditCategory;
  level: AuditLevel;
  direction: AuditDirection;
  payload: any;
  description?: string;
  metadata?: Record<string, any>;
}

export interface UniversalAuditPort {
  log(entry: Omit<AuditEntry, 'timestamp' | '_id'>): Promise<void>;
}

export interface UniversalAuditReaderPort {
  getAuditLogs(sessionId: string): Promise<AuditEntry[]>;
  deleteAuditLogs(sessionId: string): Promise<void>;
}
