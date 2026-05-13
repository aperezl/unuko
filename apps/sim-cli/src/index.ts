import { createSGP22Machine } from '@unuko/workflows';
import { UeransimAdapter } from '@unuko/adapter-ueransim';
import { PKCS11Adapter } from '@unuko/adapter-pkcs11';
import { HttpmTLSAdapter, WebhookNotificationAdapter } from '@unuko/adapter-http';
import { MongoPersistenceAdapter } from '@unuko/adapter-mongodb';
import { createActor } from 'xstate';
import fastify from 'fastify'; // Necesitas instalarlo: pnpm add fastify --filter sim-cli
import {
  HardwareAuditDecorator,
  TransportAuditDecorator
} from '@unuko/core';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function bootstrap() {
  console.log('🚀 UNUKO Orchestrator - Starting Resilient Product API');

  // 1. Inicializar Persistencia e Infraestructura API
  const server = fastify();
  const persistence = new MongoPersistenceAdapter('mongodb://localhost:27017', 'unuko_db');
  await persistence.connect();

  const sessionId = "session_demo_gd1";

  // 2. Inicializar Adaptadores y Decoradores de Auditoría
  const rawHardware = new UeransimAdapter('127.0.0.1', 37412);
  const hardware = new HardwareAuditDecorator(rawHardware, persistence, sessionId);

  const crypto = new PKCS11Adapter(
    '/opt/homebrew/lib/softhsm/libsofthsm2.so',
    '1234',
    0 // Tu Slot ID activo
  );

  const rawTransport = new HttpmTLSAdapter(crypto);
  const transport = new TransportAuditDecorator(rawTransport, persistence, sessionId);

  const notification = new WebhookNotificationAdapter('http://localhost:8081/alerts'); // Endpoint de Hummingbird o Slack

  // 3. Recuperar estado previo
  const savedSnapshot = await persistence.loadSession(sessionId);

  // 4. Inyectar dependencias en la Máquina
  const machine = createSGP22Machine({
    hardware,
    crypto,
    transport,
    audit: persistence,
    notification,
    sessionId
  });

  const actor = createActor(machine, {
    snapshot: savedSnapshot || undefined
  });

  // 5. Suscribirse y Persistir
  actor.subscribe(async (state) => {
    const currentState = typeof state.value === 'string' ? state.value : JSON.stringify(state.value);
    console.log(`[STATE CHANGE]: ${currentState}`);

    await persistence.saveSession(sessionId, actor.getPersistedSnapshot());

    if (state.context.error) {
      console.error(`[CRITICAL ERROR]: ${state.context.error}`);
    }

    if (state.value === 'SUCCESS') {
      console.log('✅ Provisioning complete. Mission accomplished.');
    }
  });

  // --- 6. CAPA DE PRODUCTO: Endpoints para Hummingbird / Visualización ---
  
  // Listar todas las sesiones
  server.get('/v1/orchestrator/sessions', async () => {
    const sessions = await persistence.listSessions();
    return sessions?.map(s => ({
      sessionId: s.sessionId,
      status: s.status,
      updatedAt: s.updatedAt
    })) || [];
  });

  // Consultar el estado vivo de la sesión (Digital Twin)
  server.get('/v1/orchestrator/session/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const snapshot = await persistence.loadSession(id);
    const logs = await persistence.getAuditLogs(id);

    if (!snapshot) return reply.status(404).send({ error: 'Session not found' });

    return {
      sessionId: id,
      status: snapshot.value,
      context: snapshot.context,
      logs: logs.slice(-10), // Últimos 10 eventos de auditoría
      updatedAt: new Date()
    };
  });

  // Controlar la máquina remotamente (Pausar, Reintentar, Abortar)
  server.post('/v1/orchestrator/session/:id/event', async (request, reply) => {
    const { event } = request.body as { event: string };
    actor.send({ type: event as any }); // Cast a any para permitir eventos dinámicos via API
    return { status: 'event_processed', event };
  });

  // --- 7. SERVIR FRONTEND ---
  const uiPath = path.join(__dirname, '../dist/ui');
  server.register(fastifyStatic, {
    root: uiPath,
    prefix: '/',
  });

  // Fallback para SPA (si el archivo no existe en static, sirve index.html)
  server.setNotFoundHandler((request, reply) => {
    if (request.raw.url?.startsWith('/v1')) {
      return reply.status(404).send({ error: 'API route not found' });
    }
    return reply.sendFile('index.html');
  });

  // 8. Lanzamiento de servicios
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🌐 Visual API: http://localhost:3000/v1/orchestrator/session/session_demo_gd1');
  } catch (err) {
    console.error('Error starting Fastify:', err);
  }

  actor.start();

  if (savedSnapshot) {
    console.log('➔ Resuming session from MongoDB...');
    actor.send({ type: 'RESUME_WORKFLOW' });
  }
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});