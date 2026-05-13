import { createMachine, assign, fromPromise } from 'xstate';
import type {
  UniversalHardwarePort,
  UniversalCryptoPort,
  UniversalTransportPort,
  UniversalAuditPort
} from '@unuko/core';

export const createSGP22Machine = (ports: {
  hardware: UniversalHardwarePort,
  crypto: UniversalCryptoPort,
  transport: UniversalTransportPort,
  audit: UniversalAuditPort,
}) => {
  return createMachine({
    id: 'sgp22-provisioning',
    initial: 'initializing',
    types: {} as {
      context: { step: number; error: string | null; transactionId: string | null };
      events: 
        | { type: 'COMPLETE' } 
        | { type: 'SUCCESS' } 
        | { type: 'RETRY' }
        | { type: 'RESUME_WORKFLOW' };
    },

    context: {
      step: 0,
      error: null,
      transactionId: null,
    },
    entry: async ({ context }) => {
      await ports.audit.log({
        sessionId: 'unknown', // Session ID should ideally be in context
        category: 'WORKFLOW',
        direction: 'INTERNAL',
        payload: { state: 'initializing', context },
        description: 'Workflow Started'
      });
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
            const response = await ports.transport.post<{ transactionId: string; serverSignedData: any }>({
              url: 'http://localhost:8080/gsma/rsp2/es9plus/initiateAuthentication',
              body: {
                euiccChallenge: Buffer.from('unuko-challenge').toString('base64'),
                smdpAddress: 'localhost'
              }
            });

            return response;
          }),
          onDone: {
            target: 'downloading',
            actions: assign({
              transactionId: ({ event }) => (event.output as any).transactionId
            })
          },
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
        invoke: {
          src: fromPromise(async ({ input }) => {
            const { transactionId } = input as { transactionId: string };
            console.log(`[WORKFLOW] Requesting Profile Package for ${transactionId}...`);
            await ports.transport.post({
              url: 'http://localhost:8080/gsma/rsp2/es9plus/getBoundProfilePackage',
              body: {
                transactionId: transactionId
              }
            });
          }),
          input: ({ context }) => ({
            transactionId: context.transactionId
          }),
          onDone: 'installing',
          onError: {
            target: 'failure',
            actions: assign({
              error: ({ event }) => 'Download failed'
            })
          }
        }
      },
      installing: {
        invoke: {
          src: fromPromise(async () => {
            console.log(`[WORKFLOW] Installing Profile on eUICC...`);
            // Simulación de instalación enviando APDUs (Load / Install)
            await ports.hardware.transmit(Buffer.from('80E2910006BF3E035F2D01', 'hex'));
          }),
          onDone: 'done',
          onError: 'failure'
        }
      },
      done: { 
        type: 'final',
        entry: async () => {
          await ports.audit.log({
            sessionId: 'unknown',
            category: 'WORKFLOW',
            direction: 'INTERNAL',
            payload: { status: 'SUCCESS' },
            description: 'Provisioning Successfully Completed'
          });
        }
      },
      failure: {
        on: { RETRY: 'initializing' }
      }
    }
  });
};