import { 
  UniversalAuditPort, 
  NotificationPort, 
  UniversalHardwarePort, 
  UniversalCryptoPort, 
  UniversalTransportPort 
} from '@unuko/core';

export interface WorkflowBaseContext {
  error: string | null;
  retryCount: number;
  [key: string]: any;
}

export interface WorkflowPorts {
  audit: UniversalAuditPort;
  notification: NotificationPort;
  hardware: UniversalHardwarePort;
  crypto: UniversalCryptoPort;
  transport: UniversalTransportPort;
  sessionId: string;
}

export type StandardWorkflowEvent =
  | { type: 'RETRY' }
  | { type: 'CANCEL' }
  | { type: 'RESUME_WORKFLOW' };
