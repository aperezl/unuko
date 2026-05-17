import {
  createSGP22Machine,
  createInventoryMachine,
  createProfileMgmtMachine,
  createNotificationMachine,
  createTestMachine,
  unukoEngine
} from '@unuko/core';
import { UeransimAdapter, UeransimNetworkAdapter } from '@unuko/adapter-ueransim';
import { Open5gsSdmAdapter } from '@unuko/adapter-open5gs-sdm';
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
  const ueransimNetwork = new UeransimNetworkAdapter('core5g');
  const sdmAdapter = new Open5gsSdmAdapter('core5g');
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

  // --- 8. INFRASTRUCTURE MANAGEMENT ---

  // List all UEs (using sessions as proxy for now or querying the adapter)
  server.get('/v1/inventory/subscribers', async () => {
    return await sdmAdapter.findAll();
  });

  server.get('/v1/inventory/subscribers/:imsi', async (request, reply) => {
    const { imsi } = request.params as { imsi: string };
    const sub = await sdmAdapter.findById(imsi);
    if (!sub) return reply.status(404).send({ error: 'Subscriber not found' });
    return sub;
  });

  server.post('/v1/inventory/subscribers', async (request) => {
    const subscriber = request.body as any;
    await sdmAdapter.upsert(subscriber);
    return { status: 'ok' };
  });

  server.delete('/v1/inventory/subscribers/:imsi', async (request) => {
    const { imsi } = request.params as { imsi: string };
    await sdmAdapter.delete(imsi);
    return { status: 'ok' };
  });

  server.get('/v1/infrastructure/devices', async () => {
    const controller = (ueransimNetwork as any).controller;
    return await controller.getDevices();
  });

  server.delete('/v1/infrastructure/devices', async () => {
    const controller = (ueransimNetwork as any).controller;
    await controller.stopAll();
    return { status: 'all_stopped' };
  });

  server.post('/v1/infrastructure/ue', async (request, reply) => {
    const { imsi, gnbAddress } = (request.body as any) || {};
    if (!imsi) return reply.status(400).send({ error: 'IMSI is required' });

    try {
      const session = await ueransimNetwork.attachUE(imsi, { gnbAddress });
      return { status: 'created', session };
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  server.put('/v1/infrastructure/ue/:imsi', async (request, reply) => {
    const { imsi } = request.params as { imsi: string };
    const config = request.body as any;
    
    try {
      const controller = (ueransimNetwork as any).controller;
      // Complete UE config with defaults
      const fullConfig = {
        supi: imsi,
        mcc: config.mcc || '999',
        mnc: config.mnc || '70',
        key: '465B5CE8B199B49FAA5F0A2EE238A6BC',
        opType: 'OPC',
        opc: 'E8ED289DEBA952E4283B54E88E6183CA',
        amf: '8000',
        imei: '356938035643803',
        imeiSv: '4370816125816151',
        gnbSearchList: [config.gnbAddress || '127.0.0.1'],
        sessions: [{ type: 'IPv4', apn: 'internet', slice: { sst: 1 } }],
        configuredNssai: [{ sst: 1 }],
        defaultNssai: [{ sst: 1 }]
      };
      await controller.updateUE(imsi, fullConfig);
      return { status: 'updated', id: imsi };
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  server.post('/v1/infrastructure/gnb', async (request, reply) => {
    const config = request.body as any;
    
    try {
      const controller = (ueransimNetwork as any).controller;
      const fullConfig = {
        mcc: config.mcc || '999',
        mnc: config.mnc || '70',
        nci: config.nci || '0x000000010',
        idLength: 32,
        tac: Number(config.tac || 1),
        linkIp: '127.0.0.1',
        ngapIp: '127.0.0.1',
        gtpIp: '127.0.0.1',
        amfConfigs: [{ address: config.amfAddress || '127.0.0.5', port: 38412 }],
        slices: [{ sst: 1 }],
        amfSelection: [{ sst: 1 }]
      };
      const device = await controller.startGNB(fullConfig);
      return { status: 'created', device };
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  server.put('/v1/infrastructure/gnb/:nci', async (request, reply) => {
    const { nci } = request.params as { nci: string };
    const config = request.body as any;
    
    try {
      const controller = (ueransimNetwork as any).controller;
      const fullConfig = {
        mcc: config.mcc || '999',
        mnc: config.mnc || '70',
        nci: nci,
        idLength: 32,
        tac: Number(config.tac || 1),
        linkIp: '127.0.0.1',
        ngapIp: '127.0.0.1',
        gtpIp: '127.0.0.1',
        amfConfigs: [{ address: config.amfAddress || '127.0.0.5', port: 38412 }],
        slices: [{ sst: 1 }],
        amfSelection: [{ sst: 1 }]
      };
      await controller.updateGNB(nci, fullConfig);
      return { status: 'updated', id: nci };
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  server.post('/v1/infrastructure/device/:id/stop', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const controller = (ueransimNetwork as any).controller;
      await controller.stopDevice(id);
      return { status: 'stopped', id };
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  server.delete('/v1/infrastructure/device/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const controller = (ueransimNetwork as any).controller;
      await controller.removeDevice(id);
      return { status: 'deleted', id };
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  server.post('/v1/infrastructure/device/:id/start', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    try {
      const controller = (ueransimNetwork as any).controller;
      const devices = await controller.getDevices();
      const device = devices.find((d: any) => d.id === id);
      
      if (!device) return reply.status(404).send({ error: 'Device config not found' });
      
      if (device.type === 'UE') {
        await controller.startUE(device.config);
      } else {
        await controller.startGNB(device.config);
      }
      
      return { status: 'started', id };
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  server.get('/v1/infrastructure/device/:id/logs', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const controller = (ueransimNetwork as any).controller;
      const logs = await controller.getLogs(id);
      return { logs };
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  server.get('/v1/infrastructure/device/:id/config', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const controller = (ueransimNetwork as any).controller;
      const config = await controller.getDeviceYaml(id);
      return { yaml: config };
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  server.put('/v1/infrastructure/device/:id/config', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { yaml } = request.body as { yaml: string };
    try {
      const controller = (ueransimNetwork as any).controller;
      await controller.saveDeviceYaml(id, yaml);
      return { status: 'saved' };
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
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