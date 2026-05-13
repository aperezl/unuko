import { assign } from 'xstate';
import { WorkflowPorts } from '../base/types.js';
import { createUnukoMachine } from '../base/factory.js';
import { tasks } from './tasks.js';
import { ProfileMgmtContext, initialProfileMgmtContext } from './types.js';

export const createProfileMgmtMachine = (ports: WorkflowPorts) => {
  return createUnukoMachine<ProfileMgmtContext>({
    id: 'sgp22-profile-mgmt',
    initial: 'executing_action',
    context: initialProfileMgmtContext,
    states: {
      executing_action: {
        entry: ({ context }: { context: ProfileMgmtContext }) => tasks.logEvent(ports, `Iniciando acción: ${context.action}`, { iccid: context.iccid }),
        invoke: {
          src: ({ context }: { context: ProfileMgmtContext }) =>
            tasks.manageProfile(ports, context.iccid, context.action),
          onDone: {
            target: 'evaluating_refresh'
          },
          onError: {
            target: 'error',
            actions: assign({
              error: ({ event }: { event: any }) => event.error instanceof Error ? event.error.message : 'Action failed'
            })
          }
        }
      },

      evaluating_refresh: {
        always: [
          {
            target: 'refreshing',
            guard: ({ context }: { context: ProfileMgmtContext }) => context.action === 'enable' || context.action === 'disable'
          },
          {
            target: 'done'
          }
        ]
      },

      refreshing: {
        invoke: {
          src: () => tasks.logEvent(ports, 'Simulando Profile Refresh (REUICC)'),
          onDone: 'done'
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
