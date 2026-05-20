import { fromPromise } from 'xstate';
import { z } from 'zod';
import { WorkflowPorts, TaskDefinition } from '../../../domain/models/workflow.types';
import { parseBERTLV } from '../../../infrastructure/mappers/sgp22-tlv.mapper';
import fs from 'fs';
import path from 'path';

const getSmdpUrl = (smdpAddress: string | undefined, pathStr: string): string => {
  let address = smdpAddress || 'localhost';
  if (!address.includes(':')) {
    let currentEnvironment = 'mock';
    try {
      const envPath = path.resolve(process.cwd(), './data/environment.json');
      if (fs.existsSync(envPath)) {
        const envData = fs.readFileSync(envPath, 'utf-8');
        currentEnvironment = JSON.parse(envData).environment;
      }
    } catch (e) {
      // ignore
    }
    const port = currentEnvironment === 'lima' ? '8081' : '8080';
    address = `${address}:${port}`;
  }
  return `http://${address}${pathStr}`;
};

export const tasks: Record<string, TaskDefinition> = {
  initialize: {
    id: 'sgp22/initialize',
    description: 'Initializes crypto and hardware ports',
    handler: (ports: WorkflowPorts) => fromPromise(async () => {
      await ports.crypto.initialize();
      await ports.hardware.reset();
    })
  },

  authenticate: {
    id: 'sgp22/authenticate',
    description: 'Initiates SGP.22 authentication with SM-DP+',
    input: z.object({
      smdpAddress: z.string().default('localhost').describe('The SM-DP+ server address'),
      euiccChallenge: z.string().optional().describe('Optional challenge from eUICC')
    }),
    handler: (ports: WorkflowPorts) => fromPromise(async ({ input }: any) => {
      await ports.crypto.getDeviceCertificate();
      
      let bodySmdpAddress = input?.smdpAddress || 'localhost';
      try {
        const envPath = path.resolve(process.cwd(), './data/environment.json');
        if (fs.existsSync(envPath)) {
          const envData = fs.readFileSync(envPath, 'utf-8');
          const currentEnvironment = JSON.parse(envData).environment;
          if (currentEnvironment === 'lima' && (bodySmdpAddress === 'localhost' || bodySmdpAddress.startsWith('localhost:'))) {
            bodySmdpAddress = 'testsmdpplus1.example.com';
          }
        }
      } catch (e) {
        // ignore
      }

      let challengeBase64 = input?.euiccChallenge;
      if (!challengeBase64) {
        challengeBase64 = Buffer.from('unuko-challenge1').toString('base64');
      } else {
        try {
          const buf = Buffer.from(challengeBase64, 'base64');
          if (buf.length !== 16) {
            challengeBase64 = Buffer.from('unuko-challenge1').toString('base64');
          }
        } catch (e) {
          challengeBase64 = Buffer.from('unuko-challenge1').toString('base64');
        }
      }

      const euiccInfo1Base64 = Buffer.from(
        'BF20358203020200A9160414F54172BDF98A95D65CBEB88A38A1C11D800A85C3AA160414F54172BDF98A95D65CBEB88A38A1C11D800A85C3',
        'hex'
      ).toString('base64');

      return await ports.transport.post<{ transactionId: string }>({
        url: getSmdpUrl(input?.smdpAddress, '/gsma/rsp2/es9plus/initiateAuthentication'),
        body: {
          euiccChallenge: challengeBase64,
          smdpAddress: bodySmdpAddress,
          euiccInfo1: euiccInfo1Base64
        }
      });
    })
  },

  downloadProfile: {
    id: 'sgp22/downloadProfile',
    description: 'Downloads a Bound Profile Package (BPP) from SM-DP+',
    input: z.object({
      transactionId: z.string().describe('The transaction ID from authenticate task'),
      smdpAddress: z.string().default('localhost').describe('The SM-DP+ server address')
    }),
    handler: (ports: WorkflowPorts) => fromPromise(async ({ input }: any) => {
      const response = await ports.transport.post<{ boundProfilePackage: string }>({
        url: getSmdpUrl(input?.smdpAddress, '/gsma/rsp2/es9plus/getBoundProfilePackage'),
        body: { transactionId: input.transactionId }
      });
      return Buffer.from(response.boundProfilePackage, 'base64');
    })
  },

  installSegment: {
    id: 'sgp22/installSegment',
    description: 'Transmits a BPP segment to the eUICC',
    input: z.object({
      apdu: z.string().describe('Hexadecimal APDU string to transmit')
    }),
    handler: (ports: WorkflowPorts) => fromPromise(async ({ input }: any) => {
      await ports.hardware.transmit(Buffer.from(input.apdu, 'hex'));
    })
  },

  getProfilesInfo: {
    id: 'sgp22/getProfilesInfo',
    description: 'Lists installed profiles on the eUICC',
    handler: (ports: WorkflowPorts) => fromPromise(async () => {
      const response = await ports.hardware.transmit(Buffer.from('80E2910002BF2D', 'hex'));
      return response;
    })
  },

  manageProfile: {
    id: 'sgp22/manageProfile',
    description: 'Enables, disables, or deletes a profile',
    input: z.object({
      iccid: z.string().describe('Hexadecimal ICCID of the profile'),
      action: z.enum(['enable', 'disable', 'delete']).describe('Action to perform')
    }),
    handler: (ports: WorkflowPorts) => fromPromise(async ({ input }: any) => {
      const tags = { enable: 'BF31', disable: 'BF32', delete: 'BF33' } as const;
      const tag = tags[input.action as keyof typeof tags];
      const iccidBuffer = Buffer.from(input.iccid, 'hex');
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
    })
  },

  listNotifications: {
    id: 'sgp22/listNotifications',
    description: 'Lists pending notifications on the eUICC',
    handler: (ports: WorkflowPorts) => fromPromise(async () => {
      const response = await ports.hardware.transmit(Buffer.from('80E2910002BF28', 'hex'));
      return response;
    })
  },

  handleNotification: {
    id: 'sgp22/handleNotification',
    description: 'Processes a pending notification with the SM-DP+',
    input: z.object({
      seqNumber: z.string().describe('Sequence number of the notification'),
      smdpAddress: z.string().default('localhost').describe('The SM-DP+ server address')
    }),
    handler: (ports: WorkflowPorts) => fromPromise(async ({ input }: any) => {
      await ports.transport.post({
        url: getSmdpUrl(input?.smdpAddress, '/gsma/rsp2/es9plus/handleNotification'),
        body: {
          pendingNotification: {
            seqNumber: input.seqNumber,
            notificationAddress: input?.smdpAddress || 'localhost'
          }
        }
      });
    })
  },

  logEventInvoke: {
    id: 'sgp22/logEventInvoke',
    description: 'Logs an event to the audit port',
    input: z.object({
      description: z.string().describe('Human readable description of the event'),
      payload: z.any().optional().describe('Optional data payload to log')
    }),
    handler: (ports: WorkflowPorts) => fromPromise(async ({ input }: any) => {
      await ports.audit.log({
        sessionId: ports.sessionId,
        category: 'WORKFLOW',
        level: 'INFO',
        direction: 'INTERNAL',
        payload: input.payload || {},
        description: input.description
      });
    })
  },

  registerSubscriber: {
    id: 'sgp22/registerSubscriber',
    description: 'Registers a subscriber in the 5G Core (Open5GS)',
    input: z.object({
      iccid: z.string().describe('ICCID of the subscriber to register'),
      coreUrl: z.string().default('http://localhost:9999').describe('URL of the 5G Core API')
    }),
    handler: (ports: WorkflowPorts) => fromPromise(async ({ input }: any) => {
      return await ports.transport.post({
        url: `${input.coreUrl}/nsmf-pdusess/v1/subscribers`,
        body: {
          iccid: input.iccid,
          imsi: `21407${input.iccid.substring(0, 10)}`,
          status: 'ACTIVE'
        }
      });
    })
  },

  enableConnectivity: {
    id: 'sgp22/enableConnectivity',
    description: 'Triggers UE Attach via UERANSIM',
    handler: (ports: WorkflowPorts) => fromPromise(async () => {
      await ports.hardware.transmit(Buffer.from('FFFFFFFF00', 'hex'));
    })
  }
};

// Pure utility functions (not tasks)
export const utils = {
  logEvent: async (ports: WorkflowPorts, description: string, payload: any = {}) => {
    await ports.audit.log({
      sessionId: ports.sessionId,
      category: 'WORKFLOW',
      level: 'INFO',
      direction: 'INTERNAL',
      payload,
      description
    });
  },
  parseNotificationsInfo: (buffer: Buffer) => {
    const root = parseBERTLV(buffer);
    const response = root.find(t => t.tag === 'BF28');
    if (!response || !response.children) return [];

    return response.children.map(notifTLV => {
      const children = notifTLV.children || [];
      const seqNumber = children.find(c => c.tag === '80')?.value.toString('hex');
      const event = children.find(c => c.tag === '81')?.value[0];
      
      return {
        seqNumber,
        event: event === 1 ? 'install' : (event === 2 ? 'delete' : 'other'),
      };
    });
  },

  parseProfilesInfo: (buffer: Buffer) => {
    const root = parseBERTLV(buffer);
    const response = root.find(t => t.tag === 'BF2D');
    if (!response || !response.children) return [];

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

  segmentBPP: (bpp: Buffer): string[] => {
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
  }
};
