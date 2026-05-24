import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { orchestratorController } from '../controllers/OrchestratorController.js';
import {
  switchEnvironmentSchema,
  createSessionSchema,
  sendSessionEventSchema,
  sessionIdParamSchema,
  switchActiveVmSchema,
  vmNameParamSchema
} from '../../../domain/schemas/orchestrator.schema.js';
import {
  serviceNameParamSchema,
  serviceStateActionSchema
} from '../../../domain/schemas/service.schema.js';

export async function orchestratorRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // Silent alert listener
  server.all('/v1/orchestrator/alerts/null', {
    schema: {
      hide: true,
      response: {
        200: z.object({ status: z.string() }),
      },
    },
  }, async () => ({ status: 'ignored' }));

  // Environment routes
  server.get('/v1/orchestrator/environment', {
    schema: {
      description: 'Get current active orchestration environment (LIMA vs MOCK)',
      tags: ['Orchestrator'],
      response: {
        200: z.object({ environment: z.enum(['mock', 'lima']) }),
      },
    },
  }, orchestratorController.getEnvironment);

  server.post('/v1/orchestrator/environment', {
    schema: {
      description: 'Switch active orchestration environment',
      tags: ['Orchestrator'],
      body: switchEnvironmentSchema,
      response: {
        200: z.object({ environment: z.enum(['mock', 'lima']) }),
      },
    },
  }, orchestratorController.setEnvironment);

  // Session routes
  server.get('/v1/orchestrator/sessions', {
    schema: {
      description: 'List all saved/active orchestration sessions',
      tags: ['Orchestrator'],
      response: {
        200: z.array(z.object({
          sessionId: z.string(),
          status: z.string(),
          updatedAt: z.string().optional()
        })),
      },
    },
  }, orchestratorController.getSessions);

  server.post('/v1/orchestrator/session', {
    schema: {
      description: 'Create and start a new orchestration session',
      tags: ['Orchestrator'],
      body: createSessionSchema,
      response: {
        200: z.object({
          status: z.string(),
          sessionId: z.string(),
          workflow: z.string(),
          url: z.string()
        }),
      },
    },
  }, orchestratorController.createSession);

  server.delete('/v1/orchestrator/session/:id', {
    schema: {
      description: 'Delete and stop a session',
      tags: ['Orchestrator'],
      params: sessionIdParamSchema,
      response: {
        200: z.object({
          status: z.string(),
          sessionId: z.string()
        }),
      },
    },
  }, orchestratorController.deleteSession);

  server.get('/v1/orchestrator/session/:id', {
    schema: {
      description: 'Get details and full logs of a session',
      tags: ['Orchestrator'],
      params: sessionIdParamSchema,
      response: {
        200: z.object({
          sessionId: z.string(),
          status: z.any(),
          displayState: z.string().optional(),
          progress: z.number().optional(),
          logs: z.array(z.any()),
          context: z.any().optional(),
          updatedAt: z.any().optional()
        }),
      },
    },
  }, orchestratorController.getSessionDetails);

  server.post('/v1/orchestrator/session/:id/event', {
    schema: {
      description: 'Send a trigger event to the session state machine',
      tags: ['Orchestrator'],
      params: sessionIdParamSchema,
      body: sendSessionEventSchema,
      response: {
        200: z.object({
          status: z.string(),
          event: z.string()
        }),
      },
    },
  }, orchestratorController.sendSessionEvent);

  // 5G Core Service health routes
  server.get('/v1/orchestrator/services/status', {
    schema: {
      description: 'Query availability and port health of all 5G network components',
      tags: ['5G Network Health'],
      response: {
        200: z.array(z.object({
          name: z.string(),
          serviceName: z.string().optional(),
          type: z.string(),
          port: z.number().nullable(),
          host: z.string(),
          forwardedPort: z.number().optional(),
          status: z.string(),
          description: z.string()
        })),
      },
    },
  }, orchestratorController.getServicesStatus);

  server.post('/v1/orchestrator/services/:name/state', {
    schema: {
      description: 'Control state (start/stop) of Open5GS systemd services inside Lima VM',
      tags: ['5G Network Health'],
      params: serviceNameParamSchema,
      body: serviceStateActionSchema,
      response: {
        200: z.object({
          status: z.string()
        }),
      },
    },
  }, orchestratorController.toggleServiceState);

  // VM Management routes
  server.get('/v1/orchestrator/vms', {
    schema: {
      description: 'Get list of all Lima VMs and their statuses',
      tags: ['Orchestrator'],
      response: {
        200: z.object({
          activeVm: z.string(),
          vms: z.array(z.object({
            name: z.string(),
            status: z.string(),
            cpus: z.number().optional(),
            memory: z.string().optional(),
            sshLocalPort: z.number().optional(),
          }))
        }),
      },
    },
  }, orchestratorController.getVms);

  server.post('/v1/orchestrator/vms/active', {
    schema: {
      description: 'Set active Lima VM',
      tags: ['Orchestrator'],
      body: switchActiveVmSchema,
      response: {
        200: z.object({
          activeVm: z.string()
        }),
      },
    },
  }, orchestratorController.setActiveVm);

  server.post('/v1/orchestrator/vms/:name/start', {
    schema: {
      description: 'Start a Lima VM',
      tags: ['Orchestrator'],
      params: vmNameParamSchema,
      response: {
        200: z.object({
          status: z.string()
        }),
      },
    },
  }, orchestratorController.startVm);

  server.post('/v1/orchestrator/vms/:name/stop', {
    schema: {
      description: 'Stop a Lima VM',
      tags: ['Orchestrator'],
      params: vmNameParamSchema,
      response: {
        200: z.object({
          status: z.string()
        }),
      },
    },
  }, orchestratorController.stopVm);
}
