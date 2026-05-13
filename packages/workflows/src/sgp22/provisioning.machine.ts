import { createMachine, assign, fromPromise } from 'xstate';
import type { UniversalHardwarePort, UniversalCryptoPort } from '@unuko/core';

export const createSGP22Machine = (ports: {
  hardware: UniversalHardwarePort,
  crypto: UniversalCryptoPort
}) => {
  return createMachine({
    id: 'sgp22-provisioning',
    types: {} as {
      context: { step: number; error: string | null };
      events: { type: 'COMPLETE' } | { type: 'SUCCESS' } | { type: 'RETRY' };
    },
    context: {
      step: 0,
      error: null,
    },
    states: {
      initializing: {
        invoke: {
          src: fromPromise(async () => {
            await ports.crypto.initialize();
            await ports.hardware.reset();
          }),
          onDone: 'authenticating',
          onError: {
            target: 'failure',
            actions: assign({
              // NO tipamos el evento en los argumentos, lo validamos dentro
              error: ({ event }) => {
                const error = event.error;
                return error instanceof Error ? error.message : 'Unknown initialization error';
              }
            })
          }
        }
      },
      authenticating: {
        invoke: {
          src: fromPromise(async () => {
            const cert = await ports.crypto.getDeviceCertificate();
            return { success: true, cert };
          }),
          onDone: 'downloading',
          onError: {
            target: 'failure',
            actions: assign({
              error: ({ event }) => {
                const error = event.error;
                return error instanceof Error ? error.message : 'Authentication failed';
              }
            })
          }
        }
      },
      downloading: {
        on: { COMPLETE: 'installing' }
      },
      installing: {
        on: { SUCCESS: 'done' }
      },
      done: { type: 'final' },
      failure: {
        on: { RETRY: 'initializing' }
      }
    }
  });
};