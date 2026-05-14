import { assign } from 'xstate';
import { WorkflowPorts } from '../base/types';
import { createUnukoMachine } from '../base/factory';
import { tasks } from './tasks';
import { NotificationContext, initialNotificationContext } from './types';

export const createNotificationMachine = (ports: WorkflowPorts) => {
  return createUnukoMachine<NotificationContext>({
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
              error: ({ event }: { event: any }) => event.error instanceof Error ? event.error.message : 'Fetch failed' 
            })
          }
        }
      },

      parsing_notifications: {
        entry: assign({
          notifications: ({ event }: { event: any }) => tasks.parseNotificationsInfo(event.output),
          currentNotificationIndex: 0
        }),
        always: [
          {
            target: 'processing',
            guard: ({ context }: { context: NotificationContext }) => context.notifications.length > 0
          },
          {
            target: 'done'
          }
        ]
      },

      processing: {
        invoke: {
          src: tasks.handleNotification(ports),
          input: ({ context }: { context: NotificationContext }) => ({
            seqNumber: context.notifications[context.currentNotificationIndex].seqNumber
          }),
          onDone: [
            {
              target: 'processing',
              guard: ({ context }: { context: NotificationContext }) => context.currentNotificationIndex < context.notifications.length - 1,
              actions: assign({
                currentNotificationIndex: ({ context }: { context: NotificationContext }) => context.currentNotificationIndex + 1
              })
            },
            {
              target: 'done'
            }
          ],
          onError: {
            target: 'error',
            actions: assign({ 
              error: ({ event }: { event: any }) => event.error instanceof Error ? event.error.message : 'Notification handle failed' 
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
