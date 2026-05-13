import { assign } from 'xstate';
import { createUnukoMachine } from '../base/factory.js';
import { tasks } from './tasks.js';
import { initialNotificationContext } from './types.js';
export const createNotificationMachine = (ports) => {
    return createUnukoMachine({
        id: 'sgp22-notifications',
        initial: 'fetching_notifications',
        context: initialNotificationContext,
        states: {
            fetching_notifications: {
                invoke: {
                    src: tasks.listNotifications(ports),
                    onDone: {
                        target: 'parsing_notifications'
                    },
                    onError: {
                        target: 'error',
                        actions: assign({
                            error: ({ event }) => event.error instanceof Error ? event.error.message : 'Fetch failed'
                        })
                    }
                }
            },
            parsing_notifications: {
                entry: assign({
                    notifications: ({ event }) => tasks.parseNotificationsInfo(event.output),
                    currentNotificationIndex: 0
                }),
                always: [
                    {
                        target: 'processing',
                        guard: ({ context }) => context.notifications.length > 0
                    },
                    {
                        target: 'done'
                    }
                ]
            },
            processing: {
                invoke: {
                    src: tasks.handleNotification(ports),
                    input: ({ context }) => ({
                        seqNumber: context.notifications[context.currentNotificationIndex].seqNumber
                    }),
                    onDone: [
                        {
                            target: 'processing',
                            guard: ({ context }) => context.currentNotificationIndex < context.notifications.length - 1,
                            actions: assign({
                                currentNotificationIndex: ({ context }) => context.currentNotificationIndex + 1
                            })
                        },
                        {
                            target: 'done'
                        }
                    ],
                    onError: {
                        target: 'error',
                        actions: assign({
                            error: ({ event }) => event.error instanceof Error ? event.error.message : 'Notification handle failed'
                        })
                    }
                }
            },
            done: {
                type: 'final'
            },
            error: {
                type: 'final'
            }
        }
    }, ports);
};
