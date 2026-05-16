import { Open5gsSdmAdapter } from './packages/adapter-open5gs-sdm/src/index.js';

const adapter = new Open5gsSdmAdapter('core5g');
adapter.upsert({
  imsi: '999700000000003',
  k: '',
  opc: '',
  opType: 'OPC',
  amf: '8000',
  slices: [{ sst: 1, sd: '010203', isDefault: true }]
}).then(() => console.log('Done')).catch(console.error);
