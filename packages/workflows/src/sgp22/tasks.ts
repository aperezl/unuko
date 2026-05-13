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
    const response = await ports.transport.post<{ boundProfilePackage: string }>({
      url: 'http://localhost:8080/gsma/rsp2/es9plus/getBoundProfilePackage',
      body: { transactionId }
    });
    return Buffer.from(response.boundProfilePackage, 'base64');
  }),

  installSegment: (ports: WorkflowPorts, apdu: string) => fromPromise(async () => {
    await ports.hardware.transmit(Buffer.from(apdu, 'hex'));
  }),

  getProfilesInfo: (ports: WorkflowPorts) => fromPromise(async () => {
    // Comando SGP.22: GetProfilesInfo (Tag BF2D)
    const response = await ports.hardware.transmit(Buffer.from('80E2910002BF2D', 'hex'));
    return response; // Devolver el Buffer con la lista ASN.1
  }),

  segmentBPP: (bpp: Buffer): string[] => {
    // Lógica simplificada de segmentación TLV para SGP.22
    // En una implementación completa, aquí buscaríamos el tag BF37
    const segments: string[] = [];
    const maxChunk = 240;
    let offset = 0;

    while (offset < bpp.length) {
      const isLast = offset + maxChunk >= bpp.length;
      const chunk = bpp.subarray(offset, offset + maxChunk);
      const p1 = isLast ? '80' : '00';
      const p2 = Math.floor(offset / maxChunk).toString(16).padStart(2, '0');
      const lc = chunk.length.toString(16).padStart(2, '0');
      
      segments.push(`80E2${p1}${p2}${lc}${chunk.toString('hex').toUpperCase()}`);
      offset += maxChunk;
    }
    return segments;
  },

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
