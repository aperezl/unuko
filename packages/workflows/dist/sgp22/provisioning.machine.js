"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSGP22Machine = void 0;
const xstate_1 = require("xstate");
const createSGP22Machine = (ports) => {
    return (0, xstate_1.createMachine)({
        id: 'sgp22-provisioning',
        types: {},
        context: {
            step: 0,
            error: null,
        },
        states: {
            initializing: {
                invoke: {
                    src: (0, xstate_1.fromPromise)(async () => {
                        await ports.crypto.initialize();
                        await ports.hardware.reset();
                    }),
                    onDone: 'authenticating',
                    onError: {
                        target: 'failure',
                        actions: (0, xstate_1.assign)({
                            // NO tipamos el evento en los argumentos, lo validamos dentro
                            error: ({ event }) => {
                                const error = event.error;
                                return error instanceof Error ? error.message : 'Unknown initialization error';
                            }
                        })
                    }
                }
            },
            authenticating: {
                invoke: {
                    src: (0, xstate_1.fromPromise)(async () => {
                        const cert = await ports.crypto.getDeviceCertificate();
                        return { success: true, cert };
                    }),
                    onDone: 'downloading',
                    onError: {
                        target: 'failure',
                        actions: (0, xstate_1.assign)({
                            error: ({ event }) => {
                                const error = event.error;
                                return error instanceof Error ? error.message : 'Authentication failed';
                            }
                        })
                    }
                }
            },
            downloading: {
                on: { COMPLETE: 'installing' }
            },
            installing: {
                on: { SUCCESS: 'done' }
            },
            done: { type: 'final' },
            failure: {
                on: { RETRY: 'initializing' }
            }
        }
    });
};
exports.createSGP22Machine = createSGP22Machine;
