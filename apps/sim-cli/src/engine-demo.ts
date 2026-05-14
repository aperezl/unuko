import fs from 'fs';
import yaml from 'js-yaml';
import { createActor } from 'xstate';
import { unukoEngine } from '@unuko/core';
import { WorkflowPorts } from '@unuko/core';

// Mock ports for the demo
const mockPorts: WorkflowPorts = {
  sessionId: 'demo-session',
  audit: { log: async (entry: any) => console.log(`[AUDIT] ${entry.description}`, entry.payload) } as any,
  notification: { notify: async (msg: any) => console.log(`[NOTIF] ${msg.code}: ${msg.message}`) } as any,
  hardware: { 
    reset: async () => console.log('[HW] Resetting...'),
    transmit: async (apdu: Buffer) => {
      console.log(`[HW] Transmitting: ${apdu.toString('hex')}`);
      return Buffer.from('9000', 'hex');
    }
  } as any,
  crypto: { 
    initialize: async () => console.log('[CRYPTO] Initialized'),
    getDeviceCertificate: async () => console.log('[CRYPTO] Getting certificate...')
  } as any,
  transport: { 
    post: async (req: any) => {
      console.log(`[HTTP] POST ${req.url}`);
      if (req.url.includes('initiateAuthentication')) {
        return { transactionId: 'TX-DYNAMIC-123' };
      }
      return { boundProfilePackage: Buffer.from('mock-bpp').toString('base64') };
    }
  } as any
};

async function runDemo() {
  try {
    console.log('--- Unuko Dynamic Engine Demo ---');
    
    // 1. Load the YAML definition
    const yamlPath = '../../config/workflow-iot.yaml';
    const fileContents = fs.readFileSync(yamlPath, 'utf8');
    const workflowDef = yaml.load(fileContents);
    
    console.log('Workflow loaded from YAML:', (workflowDef as any).id);

    // 2. Create the machine using the Engine
    const machine = unukoEngine.createMachine(workflowDef, mockPorts);

    // 3. Start the actor
    const actor = createActor(machine);
    
    actor.subscribe((state) => {
      console.log(`\n>> State: ${state.value}`);
      if (state.context.error) console.error(`!! Error: ${state.context.error}`);
      if (Object.keys(state.context).length > 2) {
        console.log('Context:', JSON.stringify(state.context, null, 2));
      }
    });

    console.log('Starting workflow...');
    actor.start();

    // The workflow runs asynchronously. We wait for it to reach a final state.
    // In a real app, you'd use actor.on('done', ...) or similar.
    
  } catch (e) {
    console.error('Demo failed:', e);
  }
}

runDemo();
