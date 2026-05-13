export interface UnukoSession {
    _id: string;
    imsi: string;
    status: 'IDLE' | 'PROVISIONING' | 'SUCCESS' | 'FAILURE' | 'PAUSED';
    snapshot: any;
    auditLog: AuditEntry[];
    updatedAt: Date;
}
interface AuditEntry {
    timestamp: Date;
    direction: 'IN' | 'OUT';
    payload: string;
    description?: string;
}
export {};
