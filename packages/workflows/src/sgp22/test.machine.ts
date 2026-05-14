import { WorkflowPorts } from '../base/types';
import { createUnukoMachine } from '../base/factory';
import { tasks, utils } from './tasks';
import { ProvisioningContext, initialContext } from './types';

export const createTestMachine = (ports: WorkflowPorts) => {
  return createUnukoMachine<ProvisioningContext>({
    id: 'test-all-services',
    initial: 'testing_smdp',
    context: initialContext,
    states: {
      testing_smdp: {
        entry: () => utils.logEvent(ports, 'Step 1: Testing SM-DP+ Connection'),
        invoke: {
          src: tasks.authenticate.handler(ports),
          onDone: 'testing_open5gs',
          onError: 'testing_open5gs'
        }
      },

      testing_open5gs: {
        entry: () => utils.logEvent(ports, 'Step 2: Testing Open5GS Registration'),
        invoke: {
          src: tasks.registerSubscriber.handler(ports),
          input: { iccid: 'TEST-ICCID' },
          onDone: 'testing_ueransim',
          onError: 'testing_ueransim'
        }
      },

      testing_ueransim: {
        entry: () => utils.logEvent(ports, 'Step 3: Testing UERANSIM APDU Interface'),
        invoke: {
          src: tasks.enableConnectivity.handler(ports),
          onDone: 'done',
          onError: 'done'
        }
      },

      done: {
        type: 'final',
        entry: () => utils.logEvent(ports, 'Full Service Test Completed')
      }
    }
  }, ports);
};
