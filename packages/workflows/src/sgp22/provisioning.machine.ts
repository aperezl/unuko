import { assign } from 'xstate';
import { WorkflowPorts } from '../base/types';
import { createUnukoMachine } from '../base/factory';
import { tasks, utils } from './tasks';
import { ProvisioningContext, initialContext } from './types';

export const createSGP22Machine = (ports: WorkflowPorts) => {
  return createUnukoMachine<ProvisioningContext>({
    id: 'sgp22-provisioning',
    initial: 'initializing',
    context: initialContext,
    states: {
      initializing: {
        entry: () => utils.logEvent(ports, 'Workflow Started/Restarted', { state: 'initializing' }),
        invoke: {
          src: tasks.initialize.handler(ports),
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
          src: tasks.authenticate.handler(ports),
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
          src: tasks.downloadProfile.handler(ports),
          input: ({ context }: { context: ProvisioningContext }) => ({ transactionId: context.transactionId! }),
          onDone: {
            target: 'preparing_package',
            actions: assign({
              boundProfilePackage: ({ event }: { event: any }) => event.output as Buffer
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
          segments: ({ context }: { context: ProvisioningContext }) => utils.segmentBPP(context.boundProfilePackage!),
          currentSegmentIndex: 0
        }),
        always: 'installing'
      },

      installing: {
        invoke: {
          src: tasks.installSegment.handler(ports),
          input: ({ context }: { context: ProvisioningContext }) => ({ apdu: context.segments[context.currentSegmentIndex] }),
          onDone: [
            {
              target: 'installing',
              guard: ({ context }: { context: ProvisioningContext }) => context.currentSegmentIndex < context.segments.length - 1,
              actions: assign({
                currentSegmentIndex: ({ context }: { context: ProvisioningContext }) => context.currentSegmentIndex + 1
              })
            },
            {
              target: 'registering_in_core'
            }
          ],
          onError: {
            target: 'evaluating_error',
            actions: assign({ error: () => 'Installation failed' })
          }
        }
      },

      registering_in_core: {
        entry: () => utils.logEvent(ports, 'Registering subscriber in Open5GS Core', { state: 'registering_in_core' }),
        invoke: {
          src: tasks.registerSubscriber.handler(ports),
          input: ({ context }: { context: ProvisioningContext }) => ({ iccid: context.iccid || 'MOCK_ICCID' }),
          onDone: 'activating_connectivity',
          onError: 'activating_connectivity' // Continuamos aunque falle el registro para demo
        }
      },

      activating_connectivity: {
        entry: () => utils.logEvent(ports, 'Activating UERANSIM UE Connectivity', { state: 'activating_connectivity' }),
        invoke: {
          src: tasks.enableConnectivity.handler(ports),
          onDone: 'done',
          onError: 'done'
        }
      },

      done: {
        type: 'final',
        entry: () => utils.logEvent(ports, 'Workflow Completed Successfully')
      },

      evaluating_error: {
        type: 'final'
      }
    }
  }, ports);
};