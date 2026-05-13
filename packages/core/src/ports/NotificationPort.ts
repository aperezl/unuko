export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical'
}

export interface AlertEvent {
  sessionId: string;
  code: string;       // Ej: 'E-READER-001'
  message: string;
  severity: AlertSeverity;
  payload?: any;      // Contexto extra (el APDU fallido, etc.)
  timestamp: Date;
}

export interface NotificationPort {
  notify(event: AlertEvent): Promise<void>;
}