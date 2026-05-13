import { assign } from 'xstate';
import { createUnukoMachine } from '../base/factory.js';
import { tasks } from './tasks.js';
import { initialProfileMgmtContext } from './types.js';
export const createProfileMgmtMachine = (ports) => {
    return createUnukoMachine({
        id: 'sgp22-profile-mgmt',
        initial: 'executing_action',
        context: initialProfileMgmtContext,
        states: {
            executing_action: {
                entry: ({ context }) => tasks.logEvent(ports, `Iniciando acción: ${context.action}`, { iccid: context.iccid }),
                invoke: {
                    src: ({ context }) => tasks.manageProfile(ports, context.iccid, context.action),
                    onDone: {
                        target: 'evaluating_refresh'
                    },
                    onError: {
                        target: 'error',
                        actions: assign({
                            error: ({ event }) => event.error instanceof Error ? event.error.message : 'Action failed'
                        })
                    }
                }
            },
            evaluating_refresh: {
                always: [
                    {
                        target: 'refreshing',
                        guard: ({ context }) => context.action === 'enable' || context.action === 'disable'
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
