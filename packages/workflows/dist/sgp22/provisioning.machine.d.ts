import type { UniversalHardwarePort, UniversalCryptoPort, UniversalTransportPort, UniversalAuditPort, NotificationPort } from '@unuko/core';
export declare const createSGP22Machine: (ports: {
    hardware: UniversalHardwarePort;
    crypto: UniversalCryptoPort;
    transport: UniversalTransportPort;
    audit: UniversalAuditPort;
    notification: NotificationPort;
    sessionId: string;
}) => import("xstate").StateMachine<{
    step: number;
    error: string | null;
    transactionId: string | null;
    retryCount: number;
}, {
    type: "COMPLETE";
} | {
    type: "SUCCESS";
} | {
    type: "RETRY";
} | {
    type: "RESUME_WORKFLOW";
}, Record<string, import("xstate").AnyActorRef>, import("xstate").ProvidedActor, import("xstate").ParameterizedObject, import("xstate").ParameterizedObject, string, import("xstate").StateValue, string, unknown, import("xstate").NonReducibleUnknown, import("xstate").EventObject, import("xstate").MetaObject, any>;
