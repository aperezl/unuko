import { UniversalAuditPort, AuditEntry } from '@unuko/core';
export declare class MongoPersistenceAdapter implements UniversalAuditPort {
    private uri;
    private dbName;
    private client;
    private db?;
    private sessions?;
    constructor(uri: string, dbName: string);
    connect(): Promise<void>;
    saveSession(sessionId: string, snapshot: any): Promise<import("mongodb").UpdateResult<import("mongodb").Document> | undefined>;
    loadSession(sessionId: string): Promise<any>;
    listSessions(): Promise<import("mongodb").WithId<import("mongodb").Document>[] | undefined>;
    deleteSession(sessionId: string): Promise<void>;
    log(entry: Omit<AuditEntry, 'timestamp'>): Promise<void>;
    getAuditLogs(sessionId: string, limit?: number): Promise<import("mongodb").WithId<import("mongodb").Document>[]>;
    getSessionFlow(sessionId: string): Promise<{
        sessionId: any;
        imsi: any;
        displayState: any;
        progress: number;
        logs: import("mongodb").WithId<import("mongodb").Document>[] | undefined;
    } | null>;
    logTransaction(sessionId: string, entry: {
        direction: 'IN' | 'OUT';
        apdu: string;
        description?: string;
    }): Promise<void>;
}
