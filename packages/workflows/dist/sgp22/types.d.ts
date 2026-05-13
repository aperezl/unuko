import { WorkflowBaseContext } from '../base/types.js';
export interface ProvisioningContext extends WorkflowBaseContext {
    step: number;
    transactionId: string | null;
    boundProfilePackage?: Buffer;
    segments: string[];
    currentSegmentIndex: number;
}
export declare const initialContext: ProvisioningContext;
export interface InventoryContext extends WorkflowBaseContext {
    profiles: any[];
}
export declare const initialInventoryContext: InventoryContext;
