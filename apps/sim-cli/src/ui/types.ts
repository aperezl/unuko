/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Category = 'HARDWARE' | 'TRANSPORT' | 'SYSTEM' | 'ERROR' | 'WORKFLOW' | 'NOTIFICATION';
export type Direction = 'IN' | 'OUT' | 'NONE';

export interface LogPayload {
  apdu?: string;
  data?: any;
  sw?: string;
  success?: boolean;
  error?: string;
  url?: string;
  headers?: Record<string, string> | null;
  body?: any;
  transactionId?: string;
  boundProfilePackage?: string;
  serverSignedData?: {
    transactionId: string;
    smdpAddress: string;
    euiccChallenge: string;
  };
  serverSignature1?: string;
  euiccCertificate?: string;
  [key: string]: any;
}

export interface LogEntry {
  _id: string;
  sessionId: string;
  category: Category;
  direction: Direction;
  payload: LogPayload;
  description: string;
  timestamp: string;
}

export interface SessionContext {
  step: number;
  error: string | null;
  transactionId: string;
  // Provisioning
  segments?: string[];
  currentSegmentIndex?: number;
  // Inventory
  profiles?: any[];
  // Notifications
  notifications?: any[];
  currentNotificationIndex?: number;
  // Common
  iccid?: string;
  action?: string;
}

export interface SessionSummary {
  sessionId: string;
  status: string;
  workflow?: string;
  updatedAt: string;
}

export interface SessionData {
  sessionId: string;
  status: string;
  context: SessionContext;
  logs: LogEntry[];
  updatedAt: string;
}
