import { 
  UniversalAuditPort, 
  NotificationPort, 
  UniversalHardwarePort, 
  UniversalCryptoPort, 
  UniversalTransportPort 
} from '../ports/out';
import { z } from 'zod';
import { PromiseActorLogic } from 'xstate';

export interface TaskDefinition<I = any, O = any> {
  id: string;
  description?: string;
  input?: z.ZodType<I>;
  output?: z.ZodType<O>;
  handler: (ports: WorkflowPorts) => PromiseActorLogic<O, I, any>;
}

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
