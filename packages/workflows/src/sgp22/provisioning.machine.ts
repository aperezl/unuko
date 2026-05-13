import { createMachine, assign, fromPromise } from 'xstate';
import type {
  UniversalHardwarePort,
  UniversalCryptoPort,
  UniversalTransportPort
} from '@unuko/core';

export const createSGP22Machine = (ports: {
  hardware: UniversalHardwarePort,
  crypto: UniversalCryptoPort,
  transport: UniversalTransportPort,
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
            // 1. Obtenemos el certificado del dispositivo
            await ports.crypto.getDeviceCertificate();

            // 2. Ejecutamos la petición ES9+ (initiateAuthentication)
            // En una implementación real, aquí pasaríamos el euiccChallenge obtenido vía ports.hardware
            const response = await ports.transport.post<{ transactionId: string; serverSignedData: any }>({
              url: 'https://smdp.unuko.com/gsma/rsp2/es9plus/initiateAuthentication',
              body: {
                euiccChallenge: Buffer.from('unuko-challenge').toString('base64'),
                smdpAddress: 'smdp.unuko.com'
              }
            });

            return response;
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