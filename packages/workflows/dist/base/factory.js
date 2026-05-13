import { setup, assign } from 'xstate';
import { AlertSeverity } from '@unuko/core';
export const createUnukoMachine = (config, ports) => {
    return setup({
        types: {
            context: {},
            events: {}
        },
        actions: {
            logSuccess: async () => {
                await ports.audit.log({
                    sessionId: ports.sessionId,
                    category: 'WORKFLOW',
                    direction: 'INTERNAL',
                    payload: { status: 'SUCCESS' },
                    description: `Workflow ${config.id} Completed Successfully`
                });
            },
            logFailure: async ({ context }) => {
                await ports.audit.log({
                    sessionId: ports.sessionId,
                    category: 'WORKFLOW',
                    direction: 'INTERNAL',
                    payload: { status: 'FAILURE', error: context.error },
                    description: `Workflow ${config.id} Failed: ${context.error}`
                });
            },
            notifyRetry: async ({ context }) => {
                // En XState v5, las acciones ven el contexto ANTES del assign de la misma transición.
                // Por eso sumamos 1 manualmente para el mensaje o simplemente confiamos en que el siguiente estado lo verá.
                const nextRetry = (context.retryCount || 0);
                await ports.notification.notify({
                    sessionId: ports.sessionId,
                    code: 'RETRYING',
                    message: `Automatic retry ${nextRetry}/3 due to: ${context.error}`,
                    severity: AlertSeverity.WARNING,
                    timestamp: new Date()
                });
            },
            notifySuccess: async () => {
                await ports.notification.notify({
                    sessionId: ports.sessionId,
                    code: 'SUCCESS',
                    message: 'Process completed successfully',
                    severity: AlertSeverity.INFO,
                    timestamp: new Date()
                });
            },
            notifyFailure: async ({ context }) => {
                await ports.notification.notify({
                    sessionId: ports.sessionId,
                    code: 'FAILED',
                    message: `Critical Failure: ${context.error}`,
                    severity: AlertSeverity.CRITICAL,
                    payload: { context },
                    timestamp: new Date()
                });
            }
        }
    }).createMachine({
        id: config.id,
        initial: config.initial,
        context: {
            ...config.context,
            retryCount: config.context.retryCount || 0,
            error: config.context.error || null,
        },
        states: {
            ...config.states,
            evaluating_error: {
                always: [
                    {
                        guard: ({ context }) => {
                            const count = context.retryCount || 0;
                            return count < 3;
                        },
                        target: config.initial,
                        actions: [
                            // El assign en XState v5 se procesa después de las guardas
                            assign(({ context }) => ({
                                retryCount: (context.retryCount || 0) + 1
                            })),
                            'notifyRetry'
                        ]
                    },
                    { target: 'failure' }
                ]
            },
            done: {
                type: 'final',
                entry: ['logSuccess', 'notifySuccess']
            },
            failure: {
                entry: ['logFailure', 'notifyFailure'],
                on: {
                    RETRY: {
                        target: config.initial,
                        actions: assign({ retryCount: 0, error: null })
                    }
                }
            }
        }
    });
};
