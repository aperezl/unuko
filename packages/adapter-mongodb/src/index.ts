import { MongoClient, Db, Collection } from 'mongodb';
import { randomUUID } from 'crypto';
import { 
  UniversalAuditPort, 
  UniversalAuditReaderPort, 
  AuditEntry, 
  UniversalPersistencePort, 
  SessionSnapshot 
} from '@unuko/core';

export class MongoPersistenceAdapter implements UniversalPersistencePort {
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
          status: snapshot.value
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
  }
}

export class MongoAuditAdapter implements UniversalAuditPort, UniversalAuditReaderPort {
  private client: MongoClient;
  private db?: Db;

  constructor(private uri: string, private dbName: string) {
    this.client = new MongoClient(uri);
  }

  async connect() {
    await this.client.connect();
    this.db = this.client.db(this.dbName);
  }

  async log(entry: Omit<AuditEntry, 'timestamp' | '_id'>): Promise<void> {
    if (!this.db) return;
    await this.db.collection('audit_logs').insertOne({
      ...entry,
      _id: randomUUID() as any,
      timestamp: new Date()
    });
  }

  async getAuditLogs(sessionId: string): Promise<AuditEntry[]> {
    if (!this.db) return [];
    return this.db.collection('audit_logs')
      .find({ sessionId })
      .sort({ timestamp: 1 })
      .toArray() as unknown as Promise<AuditEntry[]>;
  }

  async deleteAuditLogs(sessionId: string): Promise<void> {
    if (!this.db) return;
    await this.db.collection('audit_logs').deleteMany({ sessionId });
  }
}