import { UeransimNetworkAdapter } from './index.js';

async function testAttach() {
  console.log('--- Testing UERANSIM Attach ---');
  const adapter = new UeransimNetworkAdapter('core5g');
  
  const imsi = '999700000000001';
  console.log(`Step 1: Attaching UE with IMSI ${imsi}...`);
  
  try {
    const session = await adapter.attachUE(imsi, {
      gnbAddress: '192.168.5.15', // IP of the VM
      apn: 'internet'
    });
    
    console.log('✅ Session created:', session);
    
    console.log('Step 2: Fetching metrics...');
    // Give it more time to start and register in nr-cli
    await new Promise(resolve => setTimeout(resolve, 5000));
    const metrics = await adapter.getMetrics(imsi);
    console.log('📊 Metrics:', metrics);
    
    console.log('Step 3: Waiting 5 seconds before detach...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log(`Step 4: Detaching UE ${imsi}...`);
    await adapter.detachUE(imsi);
    console.log('✅ UE detached.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAttach();
