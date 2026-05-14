import { assign } from 'xstate';
import { WorkflowPorts } from '../base/types';
import { createUnukoMachine } from '../base/factory';
import { tasks, utils } from './tasks';
import { ProfileMgmtContext, initialProfileMgmtContext } from './types';

export const createProfileMgmtMachine = (ports: WorkflowPorts) => {
  return createUnukoMachine<ProfileMgmtContext>({
    id: 'sgp22-profile-mgmt',
    initial: 'executing_action',
    context: initialProfileMgmtContext,
    states: {
      executing_action: {
        entry: ({ context }: { context: ProfileMgmtContext }) => utils.logEvent(ports, `Iniciando acción: ${context.action}`, { iccid: context.iccid }),
        invoke: {
          src: tasks.manageProfile.handler(ports),
          input: ({ context }: { context: ProfileMgmtContext }) => ({ iccid: context.iccid, action: context.action }),
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
          src: tasks.logEventInvoke.handler(ports),
          input: { description: 'Simulando Profile Refresh (REUICC)' },
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
