import { fromPromise } from 'xstate';
import { WorkflowPorts } from '../base/types.js';

export const tasks = {
  initialize: (ports: WorkflowPorts) => fromPromise(async () => {
    await ports.crypto.initialize();
    await ports.hardware.reset();
  }),

  authenticate: (ports: WorkflowPorts) => fromPromise(async () => {
    await ports.crypto.getDeviceCertificate();
    return await ports.transport.post<{ transactionId: string }>({
      url: 'http://localhost:8080/gsma/rsp2/es9plus/initiateAuthentication',
      body: {
        euiccChallenge: Buffer.from('unuko-challenge').toString('base64'),
        smdpAddress: 'localhost'
      }
    });
  }),

  downloadProfile: (ports: WorkflowPorts, transactionId: string) => fromPromise(async () => {
    await ports.transport.post({
      url: 'http://localhost:8080/gsma/rsp2/es9plus/getBoundProfilePackage',
      body: { transactionId }
    });
  }),

  installProfile: (ports: WorkflowPorts) => fromPromise(async () => {
    // Critical point: READER_ERROR usually happens here
    await ports.hardware.transmit(Buffer.from('80E2910006BF3E035F2D01', 'hex'));
  }),

  // Helper for audit logging within tasks
  logEvent: async (ports: WorkflowPorts, description: string, payload: any = {}) => {
    await ports.audit.log({
      sessionId: ports.sessionId,
      category: 'WORKFLOW',
      direction: 'INTERNAL',
      payload,
      description
    });
  }
};
