import { createSGP22Machine } from '@unuko/workflows';
import { UeransimAdapter } from '@unuko/adapter-ueransim';
import { PKCS11Adapter } from '@unuko/adapter-pkcs11';
import { createActor } from 'xstate';

async function bootstrap() {
  console.log('🚀 Iniciando Orquestador Unuko...');

  // 1. Instanciar Adaptadores (Puertos)
  const hardware = new UeransimAdapter('127.0.0.1', 37412);
  const crypto = new PKCS11Adapter(
    '/opt/homebrew/lib/softhsm/libsofthsm2.so',
    '1234',
    0
  );

  // 2. Crear Máquina de Estados con Puertos Inyectados
  const machine = createSGP22Machine({ hardware, crypto });

  const actor = createActor(machine);

  actor.subscribe((state) => {
    console.log(`[STATE]: ${state.value}`);
    if (state.context.error) {
      console.error(`[ERROR]: ${state.context.error}`);
    }
  });

  // 3. Ejecutar Workflow
  actor.start();
}

bootstrap().catch(console.error);