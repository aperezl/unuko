import { createMachine, assign, fromPromise } from 'xstate';
import { AlertSeverity } from '@unuko/core';
export const createSGP22Machine = (ports) => {
    return createMachine({
        id: 'sgp22-provisioning',
        initial: 'initializing',
        types: {},
        context: {
            step: 0,
            error: null,
            transactionId: null,
            retryCount: 0,
        },
        states: {
            initializing: {
                entry: async ({ context }) => {
                    await ports.audit.log({
                        sessionId: ports.sessionId,
                        category: 'WORKFLOW',
                        direction: 'INTERNAL',
                        payload: { state: 'initializing', context },
                        description: 'Workflow Started/Restarted'
                    });
                },
                invoke: {
                    src: fromPromise(async () => {
                        await ports.crypto.initialize();
                        await ports.hardware.reset();
                    }),
                    onDone: 'authenticating',
                    onError: {
                        target: 'evaluating_error',
                        actions: assign({
                            error: ({ event }) => event.error instanceof Error ? event.error.message : 'Init failed'
                        })
                    }
                }
            },
            authenticating: {
                invoke: {
                    src: fromPromise(async () => {
                        await ports.crypto.getDeviceCertificate();
                        return await ports.transport.post({
                            url: 'http://localhost:8080/gsma/rsp2/es9plus/initiateAuthentication',
                            body: {
                                euiccChallenge: Buffer.from('unuko-challenge').toString('base64'),
                                smdpAddress: 'localhost'
                            }
                        });
                    }),
                    onDone: {
                        target: 'downloading',
                        actions: assign({
                            transactionId: ({ event }) => event.output.transactionId,
                            retryCount: 0 // Reset de reintentos si avanzamos con éxito
                        })
                    },
                    onError: {
                        target: 'evaluating_error',
                        actions: assign({
                            error: ({ event }) => event.error instanceof Error ? event.error.message : 'Auth failed'
                        })
                    }
                }
            },
            downloading: {
                invoke: {
                    src: fromPromise(async ({ input }) => {
                        const { transactionId } = input;
                        await ports.transport.post({
                            url: 'http://localhost:8080/gsma/rsp2/es9plus/getBoundProfilePackage',
                            body: { transactionId }
                        });
                    }),
                    input: ({ context }) => ({ transactionId: context.transactionId }),
                    onDone: 'installing',
                    onError: {
                        target: 'evaluating_error',
                        actions: assign({ error: () => 'Download failed' })
                    }
                }
            },
            installing: {
                invoke: {
                    src: fromPromise(async () => {
                        // Este es el punto crítico donde solemos ver el READER_ERROR
                        await ports.hardware.transmit(Buffer.from('80E2910006BF3E035F2D01', 'hex'));
                    }),
                    onDone: 'done',
                    onError: {
                        target: 'evaluating_error',
                        actions: assign({ error: () => 'Installation failed' })
                    }
                }
            },
            // --- Lógica de Resiliencia: Evaluación de Errores y Reintentos ---
            evaluating_error: {
                always: [
                    {
                        // Si no hemos superado los 3 reintentos, lo intentamos de nuevo tras un breve delay
                        guard: ({ context }) => context.retryCount < 3,
                        target: 'initializing',
                        actions: [
                            assign({ retryCount: ({ context }) => context.retryCount + 1 }),
                            async ({ context }) => {
                                await ports.notification.notify({
                                    sessionId: ports.sessionId,
                                    code: 'RETRYING',
                                    message: `Reintento automático ${context.retryCount + 1}/3 debido a: ${context.error}`,
                                    severity: AlertSeverity.WARNING,
                                    timestamp: new Date()
                                });
                            }
                        ]
                    },
                    {
                        // Si agotamos reintentos, vamos a fallo definitivo y alertamos fuerte
                        target: 'failure'
                    }
                ]
            },
            done: {
                type: 'final',
                entry: async () => {
                    await ports.audit.log({
                        sessionId: ports.sessionId,
                        category: 'WORKFLOW',
                        direction: 'INTERNAL',
                        payload: { status: 'SUCCESS' },
                        description: 'Provisioning Successfully Completed'
                    });
                    await ports.notification.notify({
                        sessionId: ports.sessionId,
                        code: 'SUCCESS',
                        message: 'Provisión completada con éxito',
                        severity: AlertSeverity.INFO,
                        timestamp: new Date()
                    });
                }
            },
            failure: {
                entry: async ({ context }) => {
                    await ports.audit.log({
                        sessionId: ports.sessionId,
                        category: 'WORKFLOW',
                        direction: 'INTERNAL',
                        payload: { status: 'FAILURE', error: context.error },
                        description: `Provisioning Failed: ${context.error}`
                    });
                    await ports.notification.notify({
                        sessionId: ports.sessionId,
                        code: 'PROVISIONING_FAILED',
                        message: `Fallo crítico tras reintentos: ${context.error}`,
                        severity: AlertSeverity.CRITICAL,
                        payload: { context },
                        timestamp: new Date()
                    });
                },
                on: {
                    RETRY: {
                        target: 'initializing',
                        actions: assign({ retryCount: 0, error: null })
                    }
                }
            }
        }
    });
};
