import { createMachine, assign, fromPromise } from 'xstate';
export const createSGP22Machine = (ports) => {
    return createMachine({
        id: 'sgp22-provisioning',
        initial: 'initializing',
        types: {},
        context: {
            step: 0,
            error: null,
        },
        states: {
            initializing: {
                invoke: {
                    src: fromPromise(async () => {
                        await ports.crypto.initialize();
                        await ports.hardware.reset();
                    }),
                    onDone: 'authenticating',
                    onError: {
                        target: 'failure',
                        actions: assign({
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
                    src: fromPromise(async () => {
                        // 1. Obtenemos el certificado del dispositivo
                        await ports.crypto.getDeviceCertificate();
                        // 2. Ejecutamos la petición ES9+ (initiateAuthentication)
                        // En una implementación real, aquí pasaríamos el euiccChallenge obtenido vía ports.hardware
                        const response = await ports.transport.post({
                            url: 'http://localhost:8080/gsma/rsp2/es9plus/initiateAuthentication',
                            body: {
                                euiccChallenge: Buffer.from('unuko-challenge').toString('base64'),
                                smdpAddress: 'localhost'
                            }
                        });
                        return response;
                    }),
                    onDone: 'downloading',
                    onError: {
                        target: 'failure',
                        actions: assign({
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
