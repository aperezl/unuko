import { fromPromise } from 'xstate';
import { parseBERTLV } from './utils.js';
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
        const response = await ports.transport.post({
            url: 'http://localhost:8080/gsma/rsp2/es9plus/getBoundProfilePackage',
            body: { transactionId }
        });
        return Buffer.from(response.boundProfilePackage, 'base64');
    }),
    installSegment: (ports, apdu) => fromPromise(async () => {
        await ports.hardware.transmit(Buffer.from(apdu, 'hex'));
    }),
    getProfilesInfo: (ports) => fromPromise(async () => {
        // Comando SGP.22: GetProfilesInfo (Tag BF2D)
        const response = await ports.hardware.transmit(Buffer.from('80E2910002BF2D', 'hex'));
        return response; // Devolver el Buffer con la lista ASN.1
    }),
    manageProfile: (ports, iccid, action) => fromPromise(async () => {
        const tags = { enable: 'BF31', disable: 'BF32', delete: 'BF33' };
        const tag = tags[action];
        // Construir TLV: [Tag] [Len] [5A] [Len] [ICCID]
        const iccidBuffer = Buffer.from(iccid, 'hex');
        const iccidTlv = Buffer.concat([
            Buffer.from('5A', 'hex'),
            Buffer.from([iccidBuffer.length]),
            iccidBuffer
        ]);
        const payload = Buffer.concat([
            Buffer.from(tag, 'hex'),
            Buffer.from([iccidTlv.length]),
            iccidTlv
        ]);
        const lc = payload.length.toString(16).padStart(2, '0');
        const apdu = `80E29100${lc}${payload.toString('hex').toUpperCase()}`;
        await ports.hardware.transmit(Buffer.from(apdu, 'hex'));
    }),
    listNotifications: (ports) => fromPromise(async () => {
        // Comando SGP.22: ListNotifications (Tag BF28)
        const response = await ports.hardware.transmit(Buffer.from('80E2910002BF28', 'hex'));
        return response;
    }),
    handleNotification: (ports, seqNumber) => fromPromise(async () => {
        await ports.transport.post({
            url: 'http://localhost:8080/gsma/rsp2/es9plus/handleNotification',
            body: {
                pendingNotification: {
                    seqNumber,
                    notificationAddress: 'localhost'
                }
            }
        });
    }),
    parseNotificationsInfo: (buffer) => {
        const root = parseBERTLV(buffer);
        const response = root.find(t => t.tag === 'BF28');
        if (!response || !response.children)
            return [];
        // Cada hijo es un PendingNotification (ej: Tag BF2E o similar)
        return response.children.map(notifTLV => {
            const children = notifTLV.children || [];
            const seqNumber = children.find(c => c.tag === '80')?.value.toString('hex');
            const event = children.find(c => c.tag === '81')?.value[0]; // Bitmask de eventos
            return {
                seqNumber,
                event: event === 1 ? 'install' : (event === 2 ? 'delete' : 'other'),
            };
        });
    },
    parseProfilesInfo: (buffer) => {
        const root = parseBERTLV(buffer);
        const response = root.find(t => t.tag === 'BF2D');
        if (!response || !response.children)
            return [];
        return response.children
            .filter(t => t.tag === 'E3')
            .map(profileTLV => {
            const children = profileTLV.children || [];
            const iccid = children.find(c => c.tag === '5A')?.value.toString('hex').toUpperCase();
            const stateRaw = children.find(c => c.tag === '9F70')?.value[0];
            const name = children.find(c => c.tag === '92')?.value.toString('utf-8');
            return {
                iccid,
                name: name || 'Unnamed Profile',
                status: stateRaw === 1 ? 'enabled' : 'disabled'
            };
        });
    },
    segmentBPP: (bpp) => {
        // Lógica simplificada de segmentación TLV para SGP.22
        // En una implementación completa, aquí buscaríamos el tag BF37
        const segments = [];
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
