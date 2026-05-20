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
import fs from 'fs';
import { MockSdmAdapter, MockUeransimNetworkAdapter } from './adapters/MockInfrastructureAdapter';
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

  const consoleAudit = new ConsoleAuditAdapter();

  // Capa de persistencia segregada por entorno
  const mockPersistence = new JsonPersistenceAdapter('./data/mock');
  const mockFileAudit = new FileAuditAdapter('./data/mock');
  const mockAudit = new CompositeAuditAdapter([mockFileAudit, consoleAudit]);
  const mockInspector = new SessionInspector(mockPersistence, mockFileAudit);

  const limaPersistence = new JsonPersistenceAdapter('./data/lima');
  const limaFileAudit = new FileAuditAdapter('./data/lima');
  const limaAudit = new CompositeAuditAdapter([limaFileAudit, consoleAudit]);
  const limaInspector = new SessionInspector(limaPersistence, limaFileAudit);

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
  const mockUeransimNetwork = new MockUeransimNetworkAdapter();
  const mockSdmAdapter = new MockSdmAdapter();
  const mockNetwork = new MockNetworkAdapter({ delayMs: 1000 });

  // Load environment configuration
  let currentEnvironment: 'mock' | 'lima' = 'mock';
  try {
    if (!fs.existsSync('./data')) {
      fs.mkdirSync('./data', { recursive: true });
    }
    if (fs.existsSync('./data/environment.json')) {
      const envData = fs.readFileSync('./data/environment.json', 'utf-8');
      currentEnvironment = JSON.parse(envData).environment;
    }
  } catch (e) {
    console.error('Failed to load environment configuration:', e);
  }

  const getActiveSdm = () => currentEnvironment === 'lima' ? sdmAdapter : mockSdmAdapter;
  const getActiveUeransim = () => currentEnvironment === 'lima' ? ueransimNetwork : mockUeransimNetwork;
  const getActivePersistence = () => currentEnvironment === 'lima' ? limaPersistence : mockPersistence;
  const getActiveFileAudit = () => currentEnvironment === 'lima' ? limaFileAudit : mockFileAudit;
  const getActiveAudit = () => currentEnvironment === 'lima' ? limaAudit : mockAudit;
  const getActiveInspector = () => currentEnvironment === 'lima' ? limaInspector : mockInspector;

  // Función para inicializar y arrancar una sesión
  const startSession = async (sessionId: string, workflow: string = 'provisioning', snapshot?: any, workflowDefinition?: any) => {
    console.log(`[SYSTEM]: Starting ${workflowDefinition ? 'dynamic' : workflow} session ${sessionId}...`);

    const activeAudit = getActiveAudit();
    const activePersistence = getActivePersistence();

    const hardware = new HardwareAuditOutboundAdapter(rawHardware, activeAudit, sessionId);
    const transport = new TransportAuditOutboundAdapter(rawTransport, activeAudit, sessionId);
    const network = currentEnvironment === 'lima' ? ueransimNetwork : mockNetwork;

    let machine;
    if (workflowDefinition) {
      machine = unukoEngine.createMachine(workflowDefinition, {
        hardware,
        crypto,
        transport,
        audit: activeAudit,
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
        audit: activeAudit,
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
      await activePersistence.saveSession(sessionId, {
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
    const sessions = await getActivePersistence().listSessions();
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

    await getActivePersistence().deleteSession(id);
    await getActiveFileAudit().deleteAuditLogs(id);
    return { status: 'deleted', sessionId: id };
  });

  // Consultar el estado vivo de la sesión
  server.get('/v1/orchestrator/session/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const details = await getActiveInspector().getFullDetails(id);

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
    return await getActiveSdm().findAll();
  });

  server.get('/v1/inventory/subscribers/:imsi', async (request, reply) => {
    const { imsi } = request.params as { imsi: string };
    const sub = await getActiveSdm().findById(imsi);
    if (!sub) return reply.status(404).send({ error: 'Subscriber not found' });
    return sub;
  });

  server.post('/v1/inventory/subscribers', async (request) => {
    const subscriber = request.body as any;
    await getActiveSdm().upsert(subscriber);
    return { status: 'ok' };
  });

  server.delete('/v1/inventory/subscribers/:imsi', async (request) => {
    const { imsi } = request.params as { imsi: string };
    await getActiveSdm().delete(imsi);
    return { status: 'ok' };
  });

  server.get('/v1/infrastructure/devices', async () => {
    const controller = getActiveUeransim().controller;
    return await controller.getDevices();
  });

  server.delete('/v1/infrastructure/devices', async () => {
    // 1. Wipe subscriber DB
    await getActiveSdm().clearAll();

    // 2. Kill simulated processes and delete config/log files
    const controller = getActiveUeransim().controller;
    await controller.removeAllDevices();

    return { status: 'all_cleared' };
  });

  server.post('/v1/infrastructure/provision-all', async (request, reply) => {
    try {
      const fsPromises = await import('fs/promises');
      const path = await import('path');
      
      console.log('=== Starting Resilient Automatic Seed Provisioning ===');

      const sdm = getActiveSdm();
      const ueransim = getActiveUeransim();

      // 1. Wipe Slate Clean: Delete all existing subscribers and simulated devices
      console.log('[SEED]: Clearing existing subscriber database...');
      await sdm.clearAll();

      console.log('[SEED]: Stopping and removing all simulated 5G devices...');
      await ueransim.controller.removeAllDevices();
      
      // Ensure the config directory exists
      await ueransim.controller.init();

      // 2. Seed subscribers in Open5GS MongoDB
      let subscribersCount = 0;
      const subsPath = path.resolve(__dirname, '../../../config/seeds/subscribers.json');
      const subsData = await fsPromises.readFile(subsPath, 'utf-8');
      const subscribers = JSON.parse(subsData);
      for (const sub of subscribers) {
        await sdm.upsert(sub);
        subscribersCount++;
      }
      console.log(`[SEED]: Registered ${subscribersCount} fresh subscribers`);

      // 3. Seed gNB configurations and start them
      let gnbsCount = 0;
      const gnbsPath = path.resolve(__dirname, '../../../config/seeds/gnbs.json');
      const gnbsData = await fsPromises.readFile(gnbsPath, 'utf-8');
      const gnbs = JSON.parse(gnbsData);
      for (const gnb of gnbs) {
        await ueransim.controller.startGNB(gnb, false);
        gnbsCount++;
      }
      console.log(`[SEED]: Inventoried ${gnbsCount} slice-aware gNB simulated antennas`);

      // 4. Seed UE configurations and start them
      let uesCount = 0;
      const uesPath = path.resolve(__dirname, '../../../config/seeds/ues.json');
      const uesData = await fsPromises.readFile(uesPath, 'utf-8');
      const ues = JSON.parse(uesData);
      for (const ue of ues) {
        await ueransim.controller.startUE(ue, false);
        uesCount++;
      }
      console.log(`[SEED]: Inventoried ${uesCount} slice-aware UE simulated devices`);

      return {
        status: 'success',
        message: 'Automatic provisioning completed successfully.',
        details: {
          subscribersSeeded: subscribersCount,
          gnbsStarted: gnbsCount,
          uesStarted: uesCount
        }
      };
    } catch (err: any) {
      console.error('Fatal Seeding Error:', err.message);
      return reply.status(500).send({ error: err.message });
    }
  });

  server.post('/v1/infrastructure/ue', async (request, reply) => {
    const { imsi, gnbAddress } = (request.body as any) || {};
    if (!imsi) return reply.status(400).send({ error: 'IMSI is required' });

    try {
      const session = await getActiveUeransim().attachUE(imsi, { gnbAddress });
      return { status: 'created', session };
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  server.put('/v1/infrastructure/ue/:imsi', async (request, reply) => {
    const { imsi } = request.params as { imsi: string };
    const config = request.body as any;
    
    try {
      const controller = getActiveUeransim().controller;
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
      const controller = getActiveUeransim().controller;
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
      const controller = getActiveUeransim().controller;
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
      const controller = getActiveUeransim().controller;
      await controller.stopDevice(id);
      return { status: 'stopped', id };
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  server.delete('/v1/infrastructure/device/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const controller = getActiveUeransim().controller;
      await controller.removeDevice(id);
      return { status: 'deleted', id };
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  server.post('/v1/infrastructure/device/:id/start', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    try {
      const controller = getActiveUeransim().controller;
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
      const controller = getActiveUeransim().controller;
      const logs = await controller.getLogs(id);
      return { logs };
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  server.get('/v1/infrastructure/device/:id/config', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const controller = getActiveUeransim().controller;
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
      const controller = getActiveUeransim().controller;
      await controller.saveDeviceYaml(id, yaml);
      return { status: 'saved' };
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  // --- 9. MULTI-ENVIRONMENT ENDPOINTS ---
  server.get('/v1/orchestrator/environment', async () => {
    return { environment: currentEnvironment };
  });

  server.post('/v1/orchestrator/environment', async (request, reply) => {
    const { environment } = request.body as { environment: 'mock' | 'lima' };
    if (environment !== 'mock' && environment !== 'lima') {
      return reply.status(400).send({ error: 'Invalid environment. Must be "mock" or "lima"' });
    }
    currentEnvironment = environment;
    try {
      fs.writeFileSync('./data/environment.json', JSON.stringify({ environment }, null, 2));
    } catch (e) {
      console.error('Failed to save environment configuration:', e);
    }
    console.log(`[SYSTEM]: Switched active environment to: ${currentEnvironment}`);
    return { environment: currentEnvironment };
  });

  // Check the status of all available services
  type ServiceEntry = {
    name: string;
    serviceName?: string;
    type: string;
    port: number | null;
    host: string;
    forwardedPort?: number;
    status: string;
    description: string;
  };

  server.get('/v1/orchestrator/services/status', async () => {
    const net = await import('net');
    const checkPort = (port: number, host: string = '127.0.0.1'): Promise<boolean> => {
      return new Promise((resolve) => {
        const socket = new net.Socket();
        let status = false;
        socket.setTimeout(800);
        socket.on('connect', () => { status = true; socket.destroy(); });
        socket.on('timeout', () => socket.destroy());
        socket.on('error', () => socket.destroy());
        socket.on('close', () => resolve(status));
        socket.connect(port, host);
      });
    };

    const coreServices = [
      { name: 'open5gs-amfd', label: 'AMF', desc: 'Access and Mobility Management Function', ip: '127.0.0.5', port: 38412 },
      { name: 'open5gs-smfd', label: 'SMF', desc: 'Session Management Function', ip: '127.0.0.4', port: 80 },
      { name: 'open5gs-upfd', label: 'UPF', desc: 'User Plane Function', ip: '127.0.0.7', port: 2152 },
      { name: 'open5gs-udmd', label: 'UDM', desc: 'Unified Data Management', ip: '127.0.0.12', port: 80 },
      { name: 'open5gs-udrd', label: 'UDR', desc: 'Unified Data Repository', ip: '127.0.0.20', port: 80 },
      { name: 'open5gs-ausfd', label: 'AUSF', desc: 'Authentication Server Function', ip: '127.0.0.11', port: 80 },
      { name: 'open5gs-nrfd', label: 'NRF', desc: 'Network Repository Function', ip: '127.0.0.10', port: 80 },
      { name: 'open5gs-pcfd', label: 'PCF', desc: 'Policy Control Function', ip: '127.0.0.13', port: 80 },
      { name: 'open5gs-nssfd', label: 'NSSF', desc: 'Network Slice Selection Function', ip: '127.0.0.14', port: 80 },
      { name: 'open5gs-bsfd', label: 'BSF', desc: 'Binding Support Function', ip: '127.0.0.15', port: 80 }
    ];

    if (currentEnvironment === 'lima') {
      const mongoOnline = await checkPort(27017);
      const webUiOnline = await checkPort(9999);
      const smdpOnline = await checkPort(8081);

      let systemctlStatuses: string[] = [];
      try {
        const { execSync } = await import('child_process');
        const serviceNames = coreServices.map(s => s.name).join(' ');
        const output = execSync(`limactl shell core5g systemctl is-active ${serviceNames}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
        systemctlStatuses = output.trim().split('\n').map(s => s.trim());
      } catch (e: any) {
        if (e.stdout) {
          systemctlStatuses = e.stdout.trim().split('\n').map((s: string) => s.trim());
        }
      }

      const servicesList: ServiceEntry[] = [
        {
          name: 'MongoDB',
          type: 'Database',
          port: 27017,
          host: '127.0.0.1',
          status: mongoOnline ? 'online' : 'offline',
          description: 'Open5GS subscriber database'
        },
        {
          name: 'Open5GS WebUI',
          type: 'Web Portal',
          port: 3000,
          forwardedPort: 9999,
          host: '127.0.0.1',
          status: webUiOnline ? 'online' : 'offline',
          description: 'Core network management portal'
        },
        {
          name: 'Osmocom SM-DP+',
          type: 'RSP Server',
          port: 8080,
          forwardedPort: 8081,
          host: '127.0.0.1',
          status: smdpOnline ? 'online' : 'offline',
          description: 'Subscription Manager Data Preparation server'
        }
      ];

      coreServices.forEach((svc, idx) => {
        const isOnline = systemctlStatuses[idx] === 'active';
        servicesList.push({
          name: svc.label,
          serviceName: svc.name,
          type: '5G Core Service',
          port: svc.port,
          host: svc.ip,
          status: isOnline ? 'online' : 'offline',
          description: svc.desc
        });
      });

      return servicesList;
    } else {
      const smdpOnline = await checkPort(8080);
      const dbWritable = fs.existsSync('./data/mock');

      const servicesList: ServiceEntry[] = [
        {
          name: 'Mock SM-DP+ Server',
          type: 'RSP Server',
          port: 8080,
          host: '127.0.0.1',
          status: smdpOnline ? 'online' : 'offline',
          description: 'Simulated SM-DP+ subscription profile server'
        },
        {
          name: 'Mock Database (JSON)',
          type: 'Database',
          port: null,
          host: 'Local',
          status: dbWritable ? 'online' : 'offline',
          description: 'Local flat-file json storage for mock subscriber profiles'
        }
      ];

      coreServices.forEach(svc => {
        servicesList.push({
          name: `Mock ${svc.label}`,
          serviceName: svc.name,
          type: '5G Core Service',
          port: svc.port,
          host: 'Local',
          status: 'online',
          description: `Simulated ${svc.desc}`
        });
      });

      return servicesList;
    }
  });

  // Control the status of a specific systemd service (start/stop)
  server.post('/v1/orchestrator/services/:name/state', async (request, reply) => {
    const { name } = request.params as { name: string };
    const { action } = request.body as { action: 'start' | 'stop' };

    const allowedServices = [
      'open5gs-amfd', 'open5gs-smfd', 'open5gs-upfd', 'open5gs-udmd', 'open5gs-udrd',
      'open5gs-ausfd', 'open5gs-nrfd', 'open5gs-pcfd', 'open5gs-nssfd', 'open5gs-bsfd'
    ];

    if (!allowedServices.includes(name)) {
      return reply.status(400).send({ error: 'Invalid service name' });
    }

    if (action !== 'start' && action !== 'stop') {
      return reply.status(400).send({ error: 'Invalid action, must be start or stop' });
    }

    if (currentEnvironment !== 'lima') {
      return { status: action === 'start' ? 'active' : 'inactive' };
    }

    try {
      const { execSync } = await import('child_process');
      execSync(`limactl shell core5g sudo systemctl ${action} ${name}`);
      const checkOutput = execSync(`limactl shell core5g systemctl is-active ${name}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      return { status: checkOutput.trim() };
    } catch (e: any) {
      if (e.stdout) {
        return { status: e.stdout.trim() };
      }
      return { status: action === 'start' ? 'active' : 'inactive' };
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