import { createSGP22Machine } from '@unuko/workflows';
import { UeransimAdapter } from '@unuko/adapter-ueransim';
import { PKCS11Adapter } from '@unuko/adapter-pkcs11';
import { HttpmTLSAdapter } from '@unuko/adapter-http';
import { createActor } from 'xstate';

async function bootstrap() {
  console.log('🚀 UNUKO Orchestrator - Starting SGP.22 PoC');

  // 1. Inicializar Adaptadores (Ports)
  const hardware = new UeransimAdapter('127.0.0.1', 37412);
  const crypto = new PKCS11Adapter(
    '/opt/homebrew/lib/softhsm/libsofthsm2.so',
    '1234',
    43394378
  );

  // El adaptador HTTP inyecta el crypto para firmar el mTLS
  const transport = new HttpmTLSAdapter(crypto);

  // 2. Inyectar dependencias en la Máquina
  const machine = createSGP22Machine({
    hardware,
    crypto,
    transport
  });

  const actor = createActor(machine);

  // 3. Suscribirse a cambios de estado
  actor.subscribe((state) => {
    console.log(`[STATE CHANGE]: ${String(state.value)}`);
    if (state.context.error) {
      console.error(`[CRITICAL ERROR]: ${state.context.error}`);
    }
  });

  // 4. Arrancar
  actor.start();
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});