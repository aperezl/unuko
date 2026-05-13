import { WorkflowBaseContext } from '../base/types.js';
export interface ProvisioningContext extends WorkflowBaseContext {
    step: number;
    transactionId: string | null;
}
export declare const initialContext: ProvisioningContext;
