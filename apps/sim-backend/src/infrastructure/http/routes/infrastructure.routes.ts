import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { infrastructureController } from '../controllers/InfrastructureController.js';
import {
  attachUeSchema,
  startGnbSchema,
  updateUeSchema,
  deviceIdParamSchema,
  nciParamSchema,
  saveDeviceYamlSchema
} from '../../../domain/schemas/device.schema.js';
import { imsiParamSchema } from '../../../domain/schemas/subscriber.schema.js';

export async function infrastructureRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // Devices listing
  server.get('/v1/infrastructure/devices', {
    schema: {
      description: 'Get all currently configured simulation devices status',
      tags: ['Infrastructure Management'],
      response: {
        200: z.array(z.any()),
      },
    },
  }, infrastructureController.getDevices);

  server.delete('/v1/infrastructure/devices', {
    schema: {
      description: 'Wipe all subscribers and simulated devices to start fresh',
      tags: ['Infrastructure Management'],
      response: {
        200: z.object({ status: z.string() }),
      },
    },
  }, infrastructureController.clearAllDevices);

  // Seed provisioning
  server.post('/v1/infrastructure/provision-all', {
    schema: {
      description: 'Run automatic database and UERANSIM provisioning seeds',
      tags: ['Infrastructure Management'],
      response: {
        200: z.object({
          status: z.string(),
          message: z.string(),
          details: z.object({
            subscribersSeeded: z.number(),
            gnbsStarted: z.number(),
            uesStarted: z.number()
          })
        }),
      },
    },
  }, infrastructureController.provisionAll);

  // UE attach/update
  server.post('/v1/infrastructure/ue', {
    schema: {
      description: 'Attach a simulated UE to a gNB',
      tags: ['Infrastructure Management'],
      body: attachUeSchema,
      response: {
        200: z.object({
          status: z.string(),
          session: z.any()
        }),
      },
    },
  }, infrastructureController.attachUE);

  server.put('/v1/infrastructure/ue/:imsi', {
    schema: {
      description: 'Configure and register a simulated UE',
      tags: ['Infrastructure Management'],
      params: imsiParamSchema,
      body: updateUeSchema,
      response: {
        200: z.object({
          status: z.string(),
          id: z.string()
        }),
      },
    },
  }, infrastructureController.updateUE);

  // gNB start/update
  server.post('/v1/infrastructure/gnb', {
    schema: {
      description: 'Start and register a simulated gNB antenna',
      tags: ['Infrastructure Management'],
      body: startGnbSchema,
      response: {
        200: z.object({
          status: z.string(),
          device: z.any()
        }),
      },
    },
  }, infrastructureController.startGNB);

  server.put('/v1/infrastructure/gnb/:nci', {
    schema: {
      description: 'Configure and update a simulated gNB antenna',
      tags: ['Infrastructure Management'],
      params: nciParamSchema,
      body: startGnbSchema,
      response: {
        200: z.object({
          status: z.string(),
          id: z.string()
        }),
      },
    },
  }, infrastructureController.updateGNB);

  // Device control: start, stop, delete, logs, yaml config
  server.post('/v1/infrastructure/device/:id/stop', {
    schema: {
      description: 'Stop simulated process for a device',
      tags: ['Infrastructure Management'],
      params: deviceIdParamSchema,
      response: {
        200: z.object({
          status: z.string(),
          id: z.string()
        }),
      },
    },
  }, infrastructureController.stopDevice);

  server.delete('/v1/infrastructure/device/:id', {
    schema: {
      description: 'Remove device configurations and simulated processes completely',
      tags: ['Infrastructure Management'],
      params: deviceIdParamSchema,
      response: {
        200: z.object({
          status: z.string(),
          id: z.string()
        }),
      },
    },
  }, infrastructureController.removeDevice);

  server.post('/v1/infrastructure/device/:id/start', {
    schema: {
      description: 'Start simulated process for a configured device',
      tags: ['Infrastructure Management'],
      params: deviceIdParamSchema,
      response: {
        200: z.object({
          status: z.string(),
          id: z.string()
        }),
      },
    },
  }, infrastructureController.startDevice);

  server.get('/v1/infrastructure/device/:id/logs', {
    schema: {
      description: 'Get execution output logs for a device',
      tags: ['Infrastructure Management'],
      params: deviceIdParamSchema,
      response: {
        200: z.object({
          logs: z.array(z.string())
        }),
      },
    },
  }, infrastructureController.getDeviceLogs);

  server.get('/v1/infrastructure/device/:id/config', {
    schema: {
      description: 'Get YAML configuration details of a simulated device',
      tags: ['Infrastructure Management'],
      params: deviceIdParamSchema,
      response: {
        200: z.object({
          yaml: z.string()
        }),
      },
    },
  }, infrastructureController.getDeviceYaml);

  server.put('/v1/infrastructure/device/:id/config', {
    schema: {
      description: 'Save edited YAML configuration for a simulated device',
      tags: ['Infrastructure Management'],
      params: deviceIdParamSchema,
      body: saveDeviceYamlSchema,
      response: {
        200: z.object({
          status: z.string()
        }),
      },
    },
  }, infrastructureController.saveDeviceYaml);
}
