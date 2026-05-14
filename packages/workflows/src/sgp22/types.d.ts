import { WorkflowBaseContext } from '../base/types';
export interface ProvisioningContext extends WorkflowBaseContext {
    step: number;
    transactionId: string | null;
    iccid?: string;
    boundProfilePackage?: Buffer;
    segments: string[];
    currentSegmentIndex: number;
}
export declare const initialContext: ProvisioningContext;
export interface InventoryContext extends WorkflowBaseContext {
    profiles: any[];
}
export declare const initialInventoryContext: InventoryContext;
export interface ProfileMgmtContext extends WorkflowBaseContext {
    iccid: string;
    action: 'enable' | 'disable' | 'delete';
    refreshRequired: boolean;
}
export declare const initialProfileMgmtContext: ProfileMgmtContext;
export interface NotificationContext extends WorkflowBaseContext {
    notifications: any[];
    currentNotificationIndex: number;
}
export declare const initialNotificationContext: NotificationContext;
