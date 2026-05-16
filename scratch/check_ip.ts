import { UeransimController } from '../packages/ueransim-lib/src/controller/UeransimController';
import { LimaTransport } from '../packages/ueransim-lib/src/transport/LimaTransport';

async function test() {
  const transport = new LimaTransport('core5g');
  const controller = new UeransimController(transport, '/home/aperezl.guest/UERANSIM/generated_configs', '/home/aperezl.guest/UERANSIM');
  
  await controller.sync();
  const devices = await controller.getDevices();
  console.log('Devices:', JSON.stringify(devices, null, 2));
}

test();
