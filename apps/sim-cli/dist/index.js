import { createSGP22Machine, createInventoryMachine, createProfileMgmtMachine, createNotificationMachine, createTestMachine } from '@unuko/workflows';
import { UeransimAdapter } from '@unuko/adapter-ueransim';
import { PKCS11Adapter } from '@unuko/adapter-pkcs11';
import { HttpmTLSAdapter, WebhookNotificationAdapter } from '@unuko/adapter-http';
import { MongoPersistenceAdapter } from '@unuko/adapter-mongodb';
import { createActor } from 'xstate';
import fastify from 'fastify';
import { HardwareAuditDecorator, TransportAuditDecorator } from '@unuko/core';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function bootstrap() {
    console.log('🚀 UNUKO Orchestrator - Starting Resilient Product API');
    const server = fastify();
    const persistence = new MongoPersistenceAdapter('mongodb://localhost:27017', 'unuko_db');
    await persistence.connect();
    // Registro de actores activos en memoria
    const activeActors = new Map();
    // Compartir adaptadores base (Hardware y Crypto)
    const rawHardware = new UeransimAdapter('127.0.0.1', 37412);
    const crypto = new PKCS11Adapter('/opt/homebrew/lib/softhsm/libsofthsm2.so', '1234', 0);
    const rawTransport = new HttpmTLSAdapter(crypto);
    const notification = new WebhookNotificationAdapter('http://localhost:3000/v1/orchestrator/alerts/null'); // Silent local loop
    // Función para inicializar y arrancar una sesión
    const startSession = async (sessionId, workflow = 'provisioning', snapshot) => {
        console.log(`[SYSTEM]: Starting ${workflow} session ${sessionId}...`);
        const hardware = new HardwareAuditDecorator(rawHardware, persistence, sessionId);
        const transport = new TransportAuditDecorator(rawTransport, persistence, sessionId);
        const machineMap = {
            provisioning: createSGP22Machine,
            inventory: createInventoryMachine,
            'profile-mgmt': createProfileMgmtMachine,
            notification: createNotificationMachine,
            'test-services': createTestMachine
        };
        const factory = machineMap[workflow] || createSGP22Machine;
        const machine = factory({
            hardware,
            crypto,
            transport,
            audit: persistence,
            notification,
            sessionId
        });
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
        const { workflow } = request.body || { workflow: 'provisioning' };
        const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        const sessionId = `SESSION-${randomSuffix}`;
        await startSession(sessionId, workflow);
        return {
            status: 'created',
            sessionId,
            workflow,
            url: `/v1/orchestrator/session/${sessionId}`
        };
    });
    // Eliminar una sesión
    server.delete('/v1/orchestrator/session/:id', async (request, reply) => {
        const { id } = request.params;
        // Detener actor si está activo
        const actor = activeActors.get(id);
        if (actor) {
            actor.stop();
            activeActors.delete(id);
        }
        await persistence.deleteSession(id);
        return { status: 'deleted', sessionId: id };
    });
    // Consultar el estado vivo de la sesión
    server.get('/v1/orchestrator/session/:id', async (request, reply) => {
        const { id } = request.params;
        const snapshot = await persistence.loadSession(id);
        const logs = await persistence.getAuditLogs(id);
        if (!snapshot)
            return reply.status(404).send({ error: 'Session not found' });
        return {
            sessionId: id,
            status: snapshot.value,
            context: snapshot.context,
            logs: logs,
            updatedAt: new Date()
        };
    });
    // Controlar la máquina remotamente
    server.post('/v1/orchestrator/session/:id/event', async (request, reply) => {
        const { id } = request.params;
        const { event } = request.body;
        const actor = activeActors.get(id);
        if (!actor)
            return reply.status(404).send({ error: 'Active actor not found for this session' });
        actor.send({ type: event });
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
        console.log('🌐 UNUKO Digital Twin - Dashboard ready at http://localhost:3000');
    }
    catch (err) {
        console.error('Error starting Fastify:', err);
    }
}
bootstrap().catch((err) => {
    console.error('Fatal bootstrap error:', err);
    process.exit(1);
});
