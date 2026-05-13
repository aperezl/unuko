export type AuditDirection = 'IN' | 'OUT' | 'INTERNAL';
export type AuditCategory = 'HARDWARE' | 'TRANSPORT' | 'WORKFLOW' | 'CRYPTO';
export interface AuditEntry {
    sessionId: string;
    timestamp: Date;
    category: AuditCategory;
    direction: AuditDirection;
    payload: any;
    description?: string;
    metadata?: Record<string, any>;
}
export interface UniversalAuditPort {
    log(entry: Omit<AuditEntry, 'timestamp'>): Promise<void>;
}
//# sourceMappingURL=audit.port.d.ts.map