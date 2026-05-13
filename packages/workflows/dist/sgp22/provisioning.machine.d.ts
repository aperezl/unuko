import type { UniversalHardwarePort, UniversalCryptoPort, UniversalTransportPort } from '@unuko/core';
export declare const createSGP22Machine: (ports: {
    hardware: UniversalHardwarePort;
    crypto: UniversalCryptoPort;
    transport: UniversalTransportPort;
}) => import("xstate").StateMachine<{
    step: number;
    error: string | null;
}, {
    type: "COMPLETE";
} | {
    type: "SUCCESS";
} | {
    type: "RETRY";
}, Record<string, import("xstate").AnyActorRef>, import("xstate").ProvidedActor, import("xstate").ParameterizedObject, import("xstate").ParameterizedObject, string, import("xstate").StateValue, string, unknown, import("xstate").NonReducibleUnknown, import("xstate").EventObject, import("xstate").MetaObject, any>;
