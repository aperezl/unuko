import { MongoClient, Db, Collection } from 'mongodb';
import { randomUUID } from 'crypto';
import { UniversalAuditPort, AuditEntry, calculateProgress, UniversalPersistencePort, SessionSnapshot } from '@unuko/core';

export class MongoPersistenceAdapter implements UniversalAuditPort, UniversalPersistencePort {
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

  async saveSession(sessionId: string, snapshot: SessionSnapshot): Promise<void> {
    if (!this.sessions) return;
    await this.sessions.updateOne(
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

  async loadSession(sessionId: string): Promise<SessionSnapshot | null> {
    const data = await this.sessions?.findOne({ sessionId });
    return data ? data.snapshot : null;
  }

  async listSessions(): Promise<any[]> {
    if (!this.sessions) return [];
    return this.sessions.find({})
      .sort({ updatedAt: -1 })
      .toArray();
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!this.db) return;
    await this.sessions?.deleteOne({ sessionId });
    await this.db.collection('audit_logs').deleteMany({ sessionId });
  }

  async log(entry: Omit<AuditEntry, 'timestamp' | '_id'>): Promise<void> {
    if (!this.db) return;
    await this.db.collection('audit_logs').insertOne({
      ...entry,
      _id: randomUUID() as any,
      timestamp: new Date()
    });
  }

  async getAuditLogs(sessionId: string) {
    if (!this.db) return [];
    return this.db.collection('audit_logs')
      .find({ sessionId })
      .sort({ timestamp: 1 }) // Orden cronológico ascendente para el feed
      .toArray();
  }

  async getSessionFlow(sessionId: string): Promise<any> {
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