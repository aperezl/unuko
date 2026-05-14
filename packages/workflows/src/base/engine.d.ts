import { WorkflowPorts } from './types';
export declare class WorkflowEngine {
    private registry;
    constructor();
    register(id: string, task: any): void;
    private registerSGP22Tasks;
    createMachine(yamlConfig: any, ports: WorkflowPorts): import("xstate").StateMachine<import("xstate").MachineContext, import("xstate").AnyEventObject | {
        type: "xstate.route";
        to: unknown;
    }, {}, never, never, never, never, {
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
        id: any;
        states: {
            [x: string]: {
                states: any;
                id: any;
            };
        };
    }>;
    private mapTransition;
}
export declare const unukoEngine: WorkflowEngine;
