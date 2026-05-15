import {
  createSGP22Machine,
  createInventoryMachine,
  createProfileMgmtMachine,
  createNotificationMachine,
  createTestMachine,
  unukoEngine
} from '@unuko/core';
import { UeransimAdapter } from '@unuko/adapter-ueransim';
import { PKCS11Adapter } from '@unuko/adapter-pkcs11';
import { HttpmTLSAdapter, WebhookNotificationAdapter } from '@unuko/adapter-http';
import { createActor, AnyActor } from 'xstate';
import fastify from 'fastify';
import {
  HardwareAuditOutboundAdapter,
  TransportAuditOutboundAdapter,
  UniversalPersistencePort,
  JsonPersistenceAdapter,
  FileAuditAdapter,
  CompositeAuditAdapter,
  ConsoleAuditAdapter,
  MockNetworkAdapter,
  SessionInspector
} from '@unuko/core';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function bootstrap() {
  console.log('🚀 UNUKO Orchestrator - Starting Resilient Product API');

  const server = fastify();

  // Capa de persistencia segregada
  const persistence = new JsonPersistenceAdapter('./data');
  const fileAudit = new FileAuditAdapter('./data');
  const consoleAudit = new ConsoleAuditAdapter();
  
  // Auditoría compuesta (Archivo + Consola)
  const audit = new CompositeAuditAdapter([fileAudit, consoleAudit]);

  // Inspector de sesiones para la UI
  const inspector = new SessionInspector(persistence, fileAudit);

  // Registro de actores activos en memoria
  const activeActors = new Map<string, AnyActor>();

  // Compartir adaptadores base (Hardware y Crypto)
  const rawHardware = new UeransimAdapter('127.0.0.1', 37412);
  const crypto = new PKCS11Adapter(
    '/opt/homebrew/lib/softhsm/libsofthsm2.so',
    '1234',
    0
  );
  const rawTransport = new HttpmTLSAdapter(crypto);
  const notification = new WebhookNotificationAdapter('http://localhost:3000/v1/orchestrator/alerts/null'); // Silent local loop
  const network = new MockNetworkAdapter({ delayMs: 1000 });

  // Función para inicializar y arrancar una sesión
  const startSession = async (sessionId: string, workflow: string = 'provisioning', snapshot?: any, workflowDefinition?: any) => {
    console.log(`[SYSTEM]: Starting ${workflowDefinition ? 'dynamic' : workflow} session ${sessionId}...`);

    const hardware = new HardwareAuditOutboundAdapter(rawHardware, audit, sessionId);
    const transport = new TransportAuditOutboundAdapter(rawTransport, audit, sessionId);

    let machine;
    if (workflowDefinition) {
      machine = unukoEngine.createMachine(workflowDefinition, {
        hardware,
        crypto,
        transport,
        audit,
        notification,
        network,
        sessionId
      });
    } else {
      const machineMap: Record<string, any> = {
        provisioning: createSGP22Machine,
        inventory: createInventoryMachine,
        'profile-mgmt': createProfileMgmtMachine,
        notification: createNotificationMachine,
        'test-services': createTestMachine
      };
      const factory = machineMap[workflow] || createSGP22Machine;
      machine = factory({
        hardware,
        crypto,
        transport,
        audit,
        notification,
        network,
        sessionId
      });
    }

    const actor = createActor(machine, {
      snapshot: snapshot || undefined
    });

    actor.subscribe(async (state) => {
      const currentState = typeof state.value === 'string' ? state.value : JSON.stringify(state.value);
      console.log(`[${sessionId}]: ${currentState}`);

      const snapshot = actor.getSnapshot();
      await persistence.saveSession(sessionId, {
        value: snapshot.value,
        context: snapshot.context,
        status: snapshot.status
      });

      if (state.matches('done') || state.matches('failure')) {
        activeActors.delete(sessionId);
      }
    });

    activeActors.set(sessionId, actor);
    actor.start();

    // Pequeño delay para asegurar que el primer guardado se procese antes de que el frontend consulte
    await new Promise(resolve => setTimeout(resolve, 100));

    if (snapshot) {
      actor.send({ type: 'RESUME_WORKFLOW' });
    }

    return actor;
  };

  // --- 6. CAPA DE PRODUCTO: Endpoints ---

  // Endpoint mudo para alertas (evita ruidos de fetch failed)
  server.all('/v1/orchestrator/alerts/null', async () => ({ status: 'ignored' }));

  // Listar todas las sesiones
  server.get('/v1/orchestrator/sessions', async () => {
    const sessions = await persistence.listSessions();
    return sessions?.map(s => ({
      sessionId: s.sessionId,
      status: s.status,
      updatedAt: s.updatedAt
    })) || [];
  });

  // Crear una nueva sesión
  server.post('/v1/orchestrator/session', async (request, reply) => {
    const { workflow, workflowDefinition } = (request.body as any) || { workflow: 'provisioning' };
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const sessionId = `SESSION-${randomSuffix}`;

    await startSession(sessionId, workflow, undefined, workflowDefinition);

    return {
      status: 'created',
      sessionId,
      workflow: workflowDefinition ? 'dynamic' : workflow,
      url: `/v1/orchestrator/session/${sessionId}`
    };
  });

  // Eliminar una sesión
  server.delete('/v1/orchestrator/session/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    // Detener actor si está activo
    const actor = activeActors.get(id);
    if (actor) {
      actor.stop();
      activeActors.delete(id);
    }

    await persistence.deleteSession(id);
    await fileAudit.deleteAuditLogs(id);
    return { status: 'deleted', sessionId: id };
  });

  // Consultar el estado vivo de la sesión
  server.get('/v1/orchestrator/session/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const details = await inspector.getFullDetails(id);

    if (!details) return reply.status(404).send({ error: 'Session not found' });

    return details;
  });

  // Controlar la máquina remotamente
  server.post('/v1/orchestrator/session/:id/event', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { event } = request.body as { event: string };

    const actor = activeActors.get(id);
    if (!actor) return reply.status(404).send({ error: 'Active actor not found for this session' });

    actor.send({ type: event as any });
    return { status: 'event_processed', event };
  });

  // --- 7. SERVIR FRONTEND ---
  const uiPath = path.join(__dirname, '../dist/ui');
  server.register(fastifyStatic, {
    root: uiPath,
    prefix: '/',
  });

  server.setNotFoundHandler((request, reply) => {
    if (request.raw.url?.startsWith('/v1')) {
      return reply.status(404).send({ error: 'API route not found' });
    }
    return reply.sendFile('index.html');
  });

  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('\n---');
    console.log('🌐 UNUKO Digital Twin - Backend ready at http://localhost:3000');
    console.log('✨ For Live Reload (HMR), use: http://localhost:5173');
    console.log('---\n');
  } catch (err) {
    console.error('Error starting Fastify:', err);
  }
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});