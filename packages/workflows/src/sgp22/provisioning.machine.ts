import { assign } from 'xstate';
import { WorkflowPorts } from '../base/types.js';
import { createUnukoMachine } from '../base/factory.js';
import { tasks } from './tasks.js';
import { ProvisioningContext, initialContext } from './types.js';

export const createSGP22Machine = (ports: WorkflowPorts) => {
  return createUnukoMachine<ProvisioningContext>({
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
              transactionId: ({ event }) => (event.output as any).transactionId
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
          src: ({ context }: { context: ProvisioningContext }) => tasks.downloadProfile(ports, context.transactionId!),
          onDone: 'installing',
          onError: {
            target: 'evaluating_error',
            actions: assign({ error: () => 'Download failed' })
          }
        }
      },

      installing: {
        invoke: {
          src: tasks.installProfile(ports),
          onDone: 'done',
          onError: {
            target: 'evaluating_error',
            actions: assign({ error: () => 'Installation failed' })
          }
        }
      }
    }
  }, ports);
};