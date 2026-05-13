import { assign } from 'xstate';
import { createUnukoMachine } from '../base/factory.js';
import { tasks } from './tasks.js';
import { initialContext } from './types.js';
export const createSGP22Machine = (ports) => {
    return createUnukoMachine({
        id: 'sgp22-provisioning',
        initial: 'initializing',
        context: initialContext,
        states: {
            initializing: {
                entry: () => tasks.logEvent(ports, 'Workflow Started/Restarted', { state: 'initializing' }),
                invoke: {
                    src: tasks.initialize(ports),
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
                    src: tasks.authenticate(ports),
                    onDone: {
                        target: 'downloading',
                        actions: assign({
                            transactionId: ({ event }) => event.output.transactionId
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
                    src: ({ context }) => tasks.downloadProfile(ports, context.transactionId),
                    onDone: {
                        target: 'preparing_package',
                        actions: assign({
                            boundProfilePackage: ({ event }) => event.output
                        })
                    },
                    onError: {
                        target: 'evaluating_error',
                        actions: assign({ error: () => 'Download failed' })
                    }
                }
            },
            preparing_package: {
                entry: assign({
                    segments: ({ context }) => tasks.segmentBPP(context.boundProfilePackage),
                    currentSegmentIndex: 0
                }),
                always: 'installing'
            },
            installing: {
                invoke: {
                    src: ({ context }) => tasks.installSegment(ports, context.segments[context.currentSegmentIndex]),
                    onDone: [
                        {
                            target: 'installing',
                            guard: ({ context }) => context.currentSegmentIndex < context.segments.length - 1,
                            actions: assign({
                                currentSegmentIndex: ({ context }) => context.currentSegmentIndex + 1
                            })
                        },
                        {
                            target: 'done'
                        }
                    ],
                    onError: {
                        target: 'evaluating_error',
                        actions: assign({ error: () => 'Installation failed' })
                    }
                }
            }
        }
    }, ports);
};
