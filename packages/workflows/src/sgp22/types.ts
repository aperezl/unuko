import { WorkflowBaseContext } from '../base/types.js';

export interface ProvisioningContext extends WorkflowBaseContext {
  step: number;
  transactionId: string | null;
  iccid?: string;
  boundProfilePackage?: Buffer;
  segments: string[];
  currentSegmentIndex: number;
}

export const initialContext: ProvisioningContext = {
  step: 0,
  transactionId: null,
  segments: [],
  currentSegmentIndex: 0,
  error: null,
  retryCount: 0
};

export interface InventoryContext extends WorkflowBaseContext {
  profiles: any[];
}

export const initialInventoryContext: InventoryContext = {
  profiles: [],
  error: null,
  retryCount: 0
};

export interface ProfileMgmtContext extends WorkflowBaseContext {
  iccid: string;
  action: 'enable' | 'disable' | 'delete';
  refreshRequired: boolean;
}

export const initialProfileMgmtContext: ProfileMgmtContext = {
  iccid: '',
  action: 'enable',
  refreshRequired: false,
  error: null,
  retryCount: 0
};

export interface NotificationContext extends WorkflowBaseContext {
  notifications: any[];
  currentNotificationIndex: number;
}

export const initialNotificationContext: NotificationContext = {
  notifications: [],
  currentNotificationIndex: 0,
  error: null,
  retryCount: 0
};
