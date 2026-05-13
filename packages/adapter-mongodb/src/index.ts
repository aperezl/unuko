import { MongoClient, Db, Collection } from 'mongodb';
import { UniversalAuditPort, AuditEntry, calculateProgress } from '@unuko/core';

export class MongoPersistenceAdapter implements UniversalAuditPort {
  private client: MongoClient;
  private db?: Db;
  private sessions?: Collection;

  constructor(private uri: string, private dbName: string) {
    this.client = new MongoClient(uri);
  }

  async connect() {
    await this.client.connect();
    this.db = this.client.db(this.dbName);
    this.sessions = this.db.collection('sessions');
    // Índice para búsquedas rápidas por IMSI o SessionId
    await this.sessions.createIndex({ sessionId: 1 }, { unique: true });
  }

  async saveSession(sessionId: string, snapshot: any) {
    return this.sessions?.updateOne(
      { sessionId },
      {
        $set: {
          snapshot,
          updatedAt: new Date(),
          status: snapshot.value // El estado actual de XState (ej: 'authenticating')
        }
      },
      { upsert: true }
    );
  }

  async loadSession(sessionId: string) {
    const data = await this.sessions?.findOne({ sessionId });
    return data ? data.snapshot : null;
  }

  async log(entry: Omit<AuditEntry, 'timestamp'>) {
    if (!this.db) return;
    await this.db.collection('audit_logs').insertOne({
      ...entry,
      timestamp: new Date()
    });
  }

  async getAuditLogs(sessionId: string, limit: number = 10) {
    if (!this.db) return [];
    return this.db.collection('audit_logs')
      .find({ sessionId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  async getSessionFlow(sessionId: string) {
    const session = await this.sessions?.findOne({ sessionId });
    if (!session) return null;

    return {
      sessionId: session.sessionId,
      imsi: session.imsi,
      displayState: session.status, // El estado amigable
      progress: calculateProgress(session.status),
      logs: await this.db?.collection('audit_logs')
        .find({ sessionId })
        .sort({ timestamp: -1 })
        .limit(5)
        .toArray()
    };
  }

  // Deprecated: Use log() instead. Kept for temporary compatibility if needed.
  async logTransaction(sessionId: string, entry: { direction: 'IN' | 'OUT', apdu: string, description?: string }) {
    await this.log({
      sessionId,
      category: 'HARDWARE',
      ...entry,
      payload: { apdu: entry.apdu }
    });
  }
}