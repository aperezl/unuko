import { Open5gsSdmAdapter } from './packages/adapter-open5gs-sdm/src/index.js';

const adapter = new Open5gsSdmAdapter('core5g');
adapter.findById('999700000000003').then(s => console.log('Found:', JSON.stringify(s, null, 2))).catch(console.error);
