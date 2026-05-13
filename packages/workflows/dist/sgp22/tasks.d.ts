import { WorkflowPorts } from '../base/types.js';
export declare const tasks: {
    initialize: (ports: WorkflowPorts) => import("xstate").PromiseActorLogic<void, import("xstate").NonReducibleUnknown, import("xstate").EventObject>;
    authenticate: (ports: WorkflowPorts) => import("xstate").PromiseActorLogic<{
        transactionId: string;
    }, import("xstate").NonReducibleUnknown, import("xstate").EventObject>;
    downloadProfile: (ports: WorkflowPorts, transactionId: string) => import("xstate").PromiseActorLogic<void, import("xstate").NonReducibleUnknown, import("xstate").EventObject>;
    installProfile: (ports: WorkflowPorts) => import("xstate").PromiseActorLogic<void, import("xstate").NonReducibleUnknown, import("xstate").EventObject>;
    logEvent: (ports: WorkflowPorts, description: string, payload?: any) => Promise<void>;
};
