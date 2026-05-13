import { WorkflowBaseContext } from '../base/types.js';

export interface ProvisioningContext extends WorkflowBaseContext {
  step: number;
  transactionId: string | null;
}

export const initialContext: ProvisioningContext = {
  step: 0,
  transactionId: null,
  error: null,
  retryCount: 0
};
