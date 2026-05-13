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
                        // 1. Obtenemos el certificado del dispositivo
                        await ports.crypto.getDeviceCertificate();
                        // 2. Ejecutamos la petición ES9+ (initiateAuthentication)
                        // En una implementación real, aquí pasaríamos el euiccChallenge obtenido vía ports.hardware
                        const response = await ports.transport.post({
                            url: 'https://smdp.unuko.com/gsma/rsp2/es9plus/initiateAuthentication',
                            body: {
                                euiccChallenge: Buffer.from('unuko-challenge').toString('base64'),
                                smdpAddress: 'smdp.unuko.com'
                            }
                        });
                        return response;
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
