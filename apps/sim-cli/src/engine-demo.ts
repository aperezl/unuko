import fs from 'fs';
import yaml from 'js-yaml';
import { createActor } from 'xstate';
import { unukoEngine, createDefaultPorts } from '@unuko/core';

async function runDemo() {
  try {
    console.log('--- Unuko Dynamic Engine Demo ---');

    // 1. Load the YAML definition
    const yamlPath = '../../config/workflow-iot.yaml';
    const fileContents = fs.readFileSync(yamlPath, 'utf8');
    const workflowDef = yaml.load(fileContents);

    console.log('Workflow loaded from YAML:', (workflowDef as any).id);

    // 2. Setup ports with library defaults
    const ports = createDefaultPorts('demo-session');

    // Customize transport for demo logic without a real server
    ports.transport = {
      post: async (req: any) => {
        console.log(`[MOCK HTTP] POST ${req.url}`);
        if (req.url.includes('initiateAuthentication')) {
          return { transactionId: 'TX-DYNAMIC-123' };
        }
        return { boundProfilePackage: Buffer.from('mock-bpp').toString('base64') };
      }
    };

    // 3. Create and start the machine
    const machine = unukoEngine.createMachine(workflowDef, ports);
    const actor = createActor(machine).start();

    // 4. Subscribe to state changes for observation
    actor.subscribe((state) => {
      console.log(`[STATE]: ${String(state.value)}`);
      if (state.context.error) {
        console.error(`[ERROR]: ${state.context.error}`);
      }
    });

    // Handle completion
    await new Promise((resolve) => {
      actor.subscribe({
        complete: () => {
          console.log('--- Demo Workflow Completed ---');
          resolve(true);
        }
      });
    });

  } catch (error) {
    console.error('Demo failed:', error);
  }
}

runDemo();
