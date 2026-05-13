import { assign } from 'xstate';
import { WorkflowPorts } from '../base/types.js';
import { createUnukoMachine } from '../base/factory.js';
import { tasks } from './tasks.js';
import { InventoryContext, initialInventoryContext } from './types.js';

export const createInventoryMachine = (ports: WorkflowPorts) => {
  return createUnukoMachine<InventoryContext>({
    id: 'sgp22-inventory',
    initial: 'fetching_profiles',
    context: initialInventoryContext,
    states: {
      fetching_profiles: {
        invoke: {
          src: tasks.getProfilesInfo(ports),
          onDone: {
            target: 'parsing_profiles',
            actions: assign({
              // Guardamos el buffer para parsearlo en el siguiente estado
              error: null
            })
          },
          onError: {
            target: 'error',
            actions: assign({ 
              error: ({ event }: { event: any }) => event.error instanceof Error ? event.error.message : 'Fetch failed' 
            })
          }
        }
      },

      parsing_profiles: {
        entry: assign({
          profiles: ({ event }: { event: any }) => {
            console.log('Parseando perfiles del buffer...');
            return tasks.parseProfilesInfo(event.output);
          }
        }),
        always: 'done'
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
