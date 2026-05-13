export declare enum AlertSeverity {
    INFO = "info",
    WARNING = "warning",
    CRITICAL = "critical"
}
export interface AlertEvent {
    sessionId: string;
    code: string;
    message: string;
    severity: AlertSeverity;
    payload?: any;
    timestamp: Date;
}
export interface NotificationPort {
    notify(event: AlertEvent): Promise<void>;
}
//# sourceMappingURL=NotificationPort.d.ts.map