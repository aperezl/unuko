import { WorkflowPorts } from '../base/types.js';
export declare const tasks: {
    initialize: (ports: WorkflowPorts) => import("xstate").PromiseActorLogic<void, import("xstate").NonReducibleUnknown, import("xstate").EventObject>;
    authenticate: (ports: WorkflowPorts) => import("xstate").PromiseActorLogic<{
        transactionId: string;
    }, import("xstate").NonReducibleUnknown, import("xstate").EventObject>;
    downloadProfile: (ports: WorkflowPorts, transactionId: string) => import("xstate").PromiseActorLogic<Buffer<ArrayBuffer>, import("xstate").NonReducibleUnknown, import("xstate").EventObject>;
    installSegment: (ports: WorkflowPorts, apdu: string) => import("xstate").PromiseActorLogic<void, import("xstate").NonReducibleUnknown, import("xstate").EventObject>;
    getProfilesInfo: (ports: WorkflowPorts) => import("xstate").PromiseActorLogic<{
        success: boolean;
        data?: import("@unuko/core").RAPDU;
        status?: import("@unuko/core").ChipStatus;
        error?: import("@unuko/core").TransportError;
    }, import("xstate").NonReducibleUnknown, import("xstate").EventObject>;
    manageProfile: (ports: WorkflowPorts, iccid: string, action: "enable" | "disable" | "delete") => import("xstate").PromiseActorLogic<void, import("xstate").NonReducibleUnknown, import("xstate").EventObject>;
    listNotifications: (ports: WorkflowPorts) => import("xstate").PromiseActorLogic<{
        success: boolean;
        data?: import("@unuko/core").RAPDU;
        status?: import("@unuko/core").ChipStatus;
        error?: import("@unuko/core").TransportError;
    }, import("xstate").NonReducibleUnknown, import("xstate").EventObject>;
    handleNotification: (ports: WorkflowPorts, seqNumber: string) => import("xstate").PromiseActorLogic<void, import("xstate").NonReducibleUnknown, import("xstate").EventObject>;
    parseNotificationsInfo: (buffer: Buffer) => {
        seqNumber: string | undefined;
        event: string;
    }[];
    parseProfilesInfo: (buffer: Buffer) => {
        iccid: string | undefined;
        name: string;
        status: string;
    }[];
    segmentBPP: (bpp: Buffer) => string[];
    logEvent: (ports: WorkflowPorts, description: string, payload?: any) => Promise<void>;
};
