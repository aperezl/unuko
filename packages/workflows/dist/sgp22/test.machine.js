import { createUnukoMachine } from '../base/factory.js';
import { tasks } from './tasks.js';
import { initialContext } from './types.js';
export const createTestMachine = (ports) => {
    return createUnukoMachine({
        id: 'test-all-services',
        initial: 'testing_smdp',
        context: initialContext,
        states: {
            testing_smdp: {
                entry: () => tasks.logEvent(ports, 'Step 1: Testing SM-DP+ Connection'),
                invoke: {
                    src: tasks.authenticate(ports),
                    onDone: 'testing_open5gs',
                    onError: 'testing_open5gs'
                }
            },
            testing_open5gs: {
                entry: () => tasks.logEvent(ports, 'Step 2: Testing Open5GS Registration'),
                invoke: {
                    src: tasks.registerSubscriber(ports),
                    input: { iccid: 'TEST-ICCID' },
                    onDone: 'testing_ueransim',
                    onError: 'testing_ueransim'
                }
            },
            testing_ueransim: {
                entry: () => tasks.logEvent(ports, 'Step 3: Testing UERANSIM APDU Interface'),
                invoke: {
                    src: tasks.enableConnectivity(ports),
                    onDone: 'done',
                    onError: 'done'
                }
            },
            done: {
                type: 'final',
                entry: () => tasks.logEvent(ports, 'Full Service Test Completed')
            }
        }
    }, ports);
};
