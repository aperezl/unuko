import { fromPromise } from 'xstate';
export const tasks = {
    initialize: (ports) => fromPromise(async () => {
        await ports.crypto.initialize();
        await ports.hardware.reset();
    }),
    authenticate: (ports) => fromPromise(async () => {
        await ports.crypto.getDeviceCertificate();
        return await ports.transport.post({
            url: 'http://localhost:8080/gsma/rsp2/es9plus/initiateAuthentication',
            body: {
                euiccChallenge: Buffer.from('unuko-challenge').toString('base64'),
                smdpAddress: 'localhost'
            }
        });
    }),
    downloadProfile: (ports, transactionId) => fromPromise(async () => {
        await ports.transport.post({
            url: 'http://localhost:8080/gsma/rsp2/es9plus/getBoundProfilePackage',
            body: { transactionId }
        });
    }),
    installProfile: (ports) => fromPromise(async () => {
        // Critical point: READER_ERROR usually happens here
        await ports.hardware.transmit(Buffer.from('80E2910006BF3E035F2D01', 'hex'));
    }),
    // Helper for audit logging within tasks
    logEvent: async (ports, description, payload = {}) => {
        await ports.audit.log({
            sessionId: ports.sessionId,
            category: 'WORKFLOW',
            direction: 'INTERNAL',
            payload,
            description
        });
    }
};
