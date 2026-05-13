import { WorkflowPorts } from '../base/types.js';
export declare const createSGP22Machine: (ports: WorkflowPorts) => import("xstate").StateMachine<any, {
    type: "RETRY";
} | {
    type: "CANCEL";
} | {
    type: "RESUME_WORKFLOW";
} | {
    [key: string]: any;
    type: string;
} | {
    type: "xstate.route";
    to: unknown;
}, {}, never, {
    type: "logSuccess";
    params: unknown;
} | {
    type: "logFailure";
    params: unknown;
} | {
    type: "notifyRetry";
    params: unknown;
} | {
    type: "notifySuccess";
    params: unknown;
} | {
    type: "notifyFailure";
    params: unknown;
}, never, never, {
    [x: string]: {} | {
        [x: string]: {} | /*elided*/ any | {
            [x: string]: {} | /*elided*/ any | /*elided*/ any;
        };
    } | {
        [x: string]: {} | {
            [x: string]: {} | /*elided*/ any | /*elided*/ any;
        } | /*elided*/ any;
    };
}, string, import("xstate").NonReducibleUnknown, import("xstate").NonReducibleUnknown, import("xstate").EventObject, import("xstate").MetaObject, {
    id: string;
    states: {
        [x: string]: {
            states: any;
            id: any;
        };
    };
}>;
