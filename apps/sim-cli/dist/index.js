import { createSGP22Machine } from '@unuko/workflows';
import { UeransimAdapter } from '@unuko/adapter-ueransim';
import { PKCS11Adapter } from '@unuko/adapter-pkcs11';
import { HttpmTLSAdapter } from '@unuko/adapter-http';
import { MongoPersistenceAdapter } from '@unuko/adapter-mongodb'; // Asumiendo este nombre
import { createActor } from 'xstate';
async function bootstrap() {
    console.log('🚀 UNUKO Orchestrator - Starting Resilient SGP.22 Session');
    // 1. Inicializar Persistencia (Sprint 5)
    // En el futuro, este ID vendrá de Hummingbird
    const persistence = new MongoPersistenceAdapter('mongodb://localhost:27017', 'unuko_db');
    await persistence.connect();
    const sessionId = "session_demo_gd";
    // 2. Inicializar Adaptadores Físicos/Simulados
    const hardware = new UeransimAdapter('127.0.0.1', 37412);
    const crypto = new PKCS11Adapter('/opt/homebrew/lib/softhsm/libsofthsm2.so', '1234', 43394378 // Usamos tu ID de slot activo de SoftHSM2
    );
    const transport = new HttpmTLSAdapter(crypto);
    // 3. Intentar recuperar estado previo de MongoDB
    const savedSnapshot = await persistence.loadSession(sessionId);
    if (savedSnapshot) {
        console.log('➔ Found existing session. Resuming from last known state...');
    }
    // 4. Inyectar dependencias y cargar snapshot si existe
    const machine = createSGP22Machine({
        hardware,
        crypto,
        transport
    });
    const actor = createActor(machine, {
        snapshot: savedSnapshot || undefined
    });
    // 5. Suscribirse a cambios y persistir automáticamente
    actor.subscribe(async (state) => {
        console.log(`[STATE CHANGE]: ${String(state.value)}`);
        // Guardamos el snapshot en cada paso para que sea "inmortal"
        await persistence.saveSession(sessionId, actor.getPersistedSnapshot());
        if (state.context.error) {
            console.error(`[CRITICAL ERROR]: ${state.context.error}`);
        }
        if (state.value === 'SUCCESS') {
            console.log('✅ Provisioning complete. Mission accomplished.');
            // Opcional: persistence.archive(sessionId);
        }
    });
    // 6. Arrancar o Reanudar
    actor.start();
    // Si hemos recuperado, enviamos un evento para re-activar la lógica
    if (savedSnapshot) {
        actor.send({ type: 'RESUME_WORKFLOW' });
    }
}
bootstrap().catch((err) => {
    console.error('Fatal bootstrap error:', err);
    process.exit(1);
});
