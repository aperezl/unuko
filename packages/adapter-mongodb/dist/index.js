import { MongoClient } from 'mongodb';
import { calculateProgress } from '@unuko/core';
export class MongoPersistenceAdapter {
    uri;
    dbName;
    client;
    db;
    sessions;
    constructor(uri, dbName) {
        this.uri = uri;
        this.dbName = dbName;
        this.client = new MongoClient(uri);
    }
    async connect() {
        await this.client.connect();
        this.db = this.client.db(this.dbName);
        this.sessions = this.db.collection('sessions');
        // Índice para búsquedas rápidas por IMSI o SessionId
        await this.sessions.createIndex({ sessionId: 1 }, { unique: true });
    }
    async saveSession(sessionId, snapshot) {
        return this.sessions?.updateOne({ sessionId }, {
            $set: {
                snapshot,
                updatedAt: new Date(),
                status: snapshot.value // El estado actual de XState (ej: 'authenticating')
            }
        }, { upsert: true });
    }
    async loadSession(sessionId) {
        const data = await this.sessions?.findOne({ sessionId });
        return data ? data.snapshot : null;
    }
    async listSessions() {
        return this.sessions?.find({})
            .sort({ updatedAt: -1 })
            .toArray();
    }
    async deleteSession(sessionId) {
        if (!this.db)
            return;
        await this.sessions?.deleteOne({ sessionId });
        await this.db.collection('audit_logs').deleteMany({ sessionId });
    }
    async log(entry) {
        if (!this.db)
            return;
        await this.db.collection('audit_logs').insertOne({
            ...entry,
            timestamp: new Date()
        });
    }
    async getAuditLogs(sessionId) {
        if (!this.db)
            return [];
        return this.db.collection('audit_logs')
            .find({ sessionId })
            .sort({ timestamp: 1 }) // Orden cronológico ascendente para el feed
            .toArray();
    }
    async getSessionFlow(sessionId) {
        const session = await this.sessions?.findOne({ sessionId });
        if (!session)
            return null;
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
    async logTransaction(sessionId, entry) {
        await this.log({
            sessionId,
            category: 'HARDWARE',
            ...entry,
            payload: { apdu: entry.apdu }
        });
    }
}
