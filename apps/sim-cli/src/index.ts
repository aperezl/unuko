#!/usr/bin/env node
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { limaManager } from '@unuko/cli';
import { UeransimNetworkAdapter } from '@unuko/adapter-ueransim';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LIMA_YAML_PATH = path.resolve(__dirname, '../../../lima.yaml');

const CORE_SERVICES = [
  { name: 'open5gs-amfd', label: 'AMF', desc: 'Access and Mobility Management Function' },
  { name: 'open5gs-smfd', label: 'SMF', desc: 'Session Management Function' },
  { name: 'open5gs-upfd', label: 'UPF', desc: 'User Plane Function' },
  { name: 'open5gs-udmd', label: 'UDM', desc: 'Unified Data Management' },
  { name: 'open5gs-udrd', label: 'UDR', desc: 'Unified Data Repository' },
  { name: 'open5gs-ausfd', label: 'AUSF', desc: 'Authentication Server Function' },
  { name: 'open5gs-nrfd', label: 'NRF', desc: 'Network Repository Function' },
  { name: 'open5gs-pcfd', label: 'PCF', desc: 'Policy Control Function' },
  { name: 'open5gs-nssfd', label: 'NSSF', desc: 'Network Slice Selection Function' },
  { name: 'open5gs-bsfd', label: 'BSF', desc: 'Binding Support Function' },
];

const SYSTEM_SERVICES = [
  { name: 'mongod', label: 'Database', desc: 'Open5GS subscriber database' },
  { name: 'open5gs-webui', label: 'Web UI', desc: 'Core network management portal' },
  { name: 'osmo-smdpp', label: 'SM-DP+', desc: 'Subscription Manager Data Preparation server' },
];

function printHelp() {
  console.log(chalk.bold.cyan('\n  Unuko 5G Core & RSP Simulation CLI'));
  console.log(chalk.gray('  ==================================\n'));
  console.log('  Usage: ' + chalk.green('unuko <network> <command> [options]'));
  console.log('         ' + chalk.green('unuko list [options]\n'));
  console.log('  Parameters:');
  console.log(`    ${chalk.bold('<network>')}        Name of the Lima VM network instance (e.g., core5g)`);
  console.log('\n  Commands:');
  console.log(`    ${chalk.bold('list')}              List all available networks (Lima VM instances)`);
  console.log(`    ${chalk.bold('start')}             Boot the Lima VM & start services`);
  console.log(`    ${chalk.bold('stop')}              Shut down the Lima VM`);
  console.log(`    ${chalk.bold('status')}            Display environment status dashboard`);
  console.log(`    ${chalk.bold('restart')}           Restart all systemd core network services`);
  console.log(`    ${chalk.bold('devices')}           List active UERANSIM simulated GNB and UE devices`);
  console.log(`    ${chalk.bold('logs <device-id>')}  View and follow logs for a simulated device`);
  console.log(`    ${chalk.bold('help')}              Show this help menu\n`);
  console.log('  Options:');
  console.log(`    ${chalk.bold('--format=json')}    Output result in JSON format (supported for list, status, devices, start, stop, restart)\n`);
}

async function main() {
  const args = process.argv.slice(2);
  const isJson = args.includes('--format=json');
  const cleanArgs = args.filter(a => a !== '--format=json');

  if (cleanArgs.length === 0) {
    printHelp();
    process.exit(0);
  }

  const firstArg = cleanArgs[0];

  if (firstArg === 'help' || firstArg === '--help' || firstArg === '-h') {
    printHelp();
    process.exit(0);
  }

  if (firstArg === 'list') {
    await showNetworks(isJson);
    process.exit(0);
  }

  const KNOWN_COMMANDS = ['start', 'stop', 'status', 'restart', 'devices', 'logs'];

  if (KNOWN_COMMANDS.includes(firstArg)) {
    if (isJson) {
      console.log(JSON.stringify({ status: 'error', message: 'Missing network parameter. Usage: unuko <network> <command>' }));
    } else {
      console.error(chalk.bold.red(`\n  Error: Missing network parameter.`));
      console.error(chalk.red(`  Usage: unuko <network> <command> [options]`));
      console.error(chalk.red(`  Example: unuko core5g ${firstArg}\n`));
    }
    process.exit(1);
  }

  const network = firstArg;
  const command = cleanArgs[1];

  if (!command) {
    if (isJson) {
      console.log(JSON.stringify({ status: 'error', message: 'Missing command parameter. Usage: unuko <network> <command>' }));
    } else {
      console.error(chalk.bold.red(`\n  Error: Missing command parameter.`));
      console.error(chalk.red(`  Usage: unuko <network> <command> [options]`));
      console.error(chalk.red(`  Example: unuko ${network} status\n`));
    }
    process.exit(1);
  }

  if (!KNOWN_COMMANDS.includes(command) && command !== 'help') {
    if (isJson) {
      console.log(JSON.stringify({ status: 'error', message: `Unknown command: "${command}"` }));
    } else {
      console.error(chalk.bold.red(`\n  Unknown command: "${command}"`));
      printHelp();
    }
    process.exit(1);
  }

  if (command === 'help') {
    printHelp();
    process.exit(0);
  }

  if (!limaManager.isLimaInstalled()) {
    if (isJson) {
      console.log(JSON.stringify({ status: 'error', message: 'limactl is not installed on this host.' }));
    } else {
      console.error(chalk.bold.red('\n  Error: limactl is not installed on this host.'));
      console.error(chalk.red('  Please install Lima using: brew install lima\n'));
    }
    process.exit(1);
  }

  switch (command) {
    case 'start':
      if (!isJson) {
        console.log(chalk.blue(`\n🚀 Starting Lima VM (${network})...`));
      }
      try {
        limaManager.startVM(network, LIMA_YAML_PATH, { stdio: isJson ? 'ignore' : 'inherit' });
        if (isJson) {
          console.log(JSON.stringify({ status: 'success', message: `Lima VM (${network}) started successfully.` }));
        } else {
          console.log(chalk.bold.green(`\n✔ Lima VM (${network}) started successfully.`));
        }
      } catch (err: any) {
        if (isJson) {
          console.log(JSON.stringify({ status: 'error', message: `Failed to start Lima VM: ${err.message}` }));
        } else {
          console.error(chalk.bold.red(`\n✖ Failed to start Lima VM: ${err.message}`));
        }
        process.exit(1);
      }
      break;

    case 'stop':
      if (!isJson) {
        console.log(chalk.blue(`\n🔌 Shutting down Lima VM (${network})...`));
      }
      try {
        limaManager.stopVM(network, false, { stdio: isJson ? 'ignore' : 'inherit' });
        if (isJson) {
          console.log(JSON.stringify({ status: 'success', message: `Lima VM (${network}) stopped.` }));
        } else {
          console.log(chalk.bold.green(`\n✔ Lima VM (${network}) stopped and resources released.`));
        }
      } catch (err: any) {
        if (isJson) {
          console.log(JSON.stringify({ status: 'error', message: `Failed to stop Lima VM: ${err.message}` }));
        } else {
          console.error(chalk.bold.red(`\n✖ Failed to stop Lima VM: ${err.message}`));
        }
        process.exit(1);
      }
      break;

    case 'restart':
      if (!isJson) {
        console.log(chalk.blue(`\n🔄 Restarting all Open5GS services in VM (${network})...`));
      }
      try {
        if (!isJson) {
          console.log(chalk.gray('  Executing systemctl restart...'));
        }
        limaManager.executeCommand(network, 'sudo systemctl restart "open5gs-*"', true);
        limaManager.executeCommand(network, 'sudo systemctl restart osmo-smdpp', true);
        if (isJson) {
          console.log(JSON.stringify({ status: 'success', message: 'Core network services restarted successfully.' }));
        } else {
          console.log(chalk.bold.green(`\n✔ Core network services restarted successfully.`));
        }
      } catch (err: any) {
        if (isJson) {
          console.log(JSON.stringify({ status: 'error', message: `Failed to restart services: ${err.message}` }));
        } else {
          console.error(chalk.bold.red(`\n✖ Failed to restart services: ${err.message}`));
        }
        process.exit(1);
      }
      break;

    case 'status':
      await showStatus(network, isJson);
      break;

    case 'devices':
      await showDevices(network, isJson);
      break;

    case 'logs':
      const deviceId = cleanArgs[2];
      if (!deviceId) {
        if (isJson) {
          console.log(JSON.stringify({ status: 'error', message: 'Please specify a device ID.' }));
        } else {
          console.error(chalk.bold.red('\n  Error: Please specify a device ID (e.g. gnb-0x000000010 or imsi-999700000000001).'));
        }
        process.exit(1);
      }
      await showLogs(network, deviceId);
      break;
  }
}

async function showStatus(network: string, isJson: boolean) {
  if (isJson) {
    try {
      const richStatus = limaManager.getRichStatus(network);
      console.log(JSON.stringify(richStatus, null, 2));
    } catch (err: any) {
      console.log(JSON.stringify({ status: 'error', message: err.message }));
    }
    return;
  }

  console.log(chalk.bold.cyan('\n  Unuko 5G Core & RSP Simulation Dashboard'));
  console.log(chalk.gray('  ========================================'));

  const status = limaManager.getVMStatus(network);
  if (!status) {
    console.log(`  Lima VM (${network}): ` + chalk.bold.red('Not Found / Unprovisioned'));
    console.log(chalk.gray(`  Run 'unuko ${network} start' to provision and start the VM.\n`));
    return;
  }

  if (status !== 'Running') {
    console.log(`  Lima VM (${network}): ` + chalk.bold.red(status));
    console.log(chalk.gray(`  Run 'unuko ${network} start' to boot the VM.\n`));
    return;
  }

  const instances = limaManager.listInstances();
  const info = instances.find(inst => inst.name === network);
  const memoryStr = info?.memory ? `${(info.memory / (1024*1024*1024)).toFixed(0)}GiB` : 'unknown';
  const cpusStr = info?.cpus ? `${info.cpus}` : 'unknown';
  const portStr = info?.sshLocalPort ? `${info.sshLocalPort}` : 'unknown';

  console.log(`  Lima VM (${network}): ` + chalk.bold.green('🟢 Running'));
  console.log(chalk.gray(`  [Specs: CPUs: ${cpusStr} | RAM: ${memoryStr} | SSH Port: ${portStr}]`));
  console.log(chalk.gray('  ----------------------------------------'));

  const systemNames = SYSTEM_SERVICES.map(s => s.name);
  const coreNames = CORE_SERVICES.map(s => s.name);

  const statuses = limaManager.getServicesStatus(network, [...systemNames, ...coreNames]);

  console.log(chalk.bold.yellow('  System Services:'));
  for (const svc of SYSTEM_SERVICES) {
    const isOnline = statuses[svc.name] === 'active';
    const indicator = isOnline ? chalk.green('🟢 online ') : chalk.red('🔴 offline');
    console.log(`    ${indicator} ${chalk.bold(svc.label.padEnd(12))} ${chalk.gray(`(${svc.name})`)} - ${svc.desc}`);
  }

  console.log(chalk.bold.yellow('\n  5G Core Services (Open5GS):'));
  for (const svc of CORE_SERVICES) {
    const isOnline = statuses[svc.name] === 'active';
    const indicator = isOnline ? chalk.green('🟢 online ') : chalk.red('🔴 offline');
    console.log(`    ${indicator} ${chalk.bold(svc.label.padEnd(12))} ${chalk.gray(`(${svc.name})`)} - ${svc.desc}`);
  }
  console.log();
}

async function showDevices(network: string, isJson: boolean) {
  const status = limaManager.getVMStatus(network);
  if (status !== 'Running') {
    if (isJson) {
      console.log(JSON.stringify({ status: 'error', message: `Lima VM (${network}) is not running.` }));
    } else {
      console.error(chalk.red(`\n  Error: Lima VM (${network}) is not running.`));
      console.error(chalk.red(`  Please start the VM using: unuko ${network} start\n`));
    }
    process.exit(1);
  }

  if (!isJson) {
    console.log(chalk.bold.cyan('\n  Ueransim Simulated 5G Devices'));
    console.log(chalk.gray('  ============================='));
    console.log(chalk.gray('  Connecting to UERANSIM simulation controller...'));
  }

  try {
    const adapter = new UeransimNetworkAdapter(network);
    await adapter.controller.init();
    const devices = await adapter.controller.getDevices();

    if (isJson) {
      console.log(JSON.stringify(devices, null, 2));
      return;
    }

    if (devices.length === 0) {
      console.log(chalk.yellow('\n  No simulated devices found.'));
      console.log(chalk.gray('  Devices are provisioned by apps/sim-backend or seed files.\n'));
      return;
    }

    console.log('\n  ' + chalk.bold(
      'ID'.padEnd(25) + 
      'TYPE'.padEnd(10) + 
      'STATUS'.padEnd(12) + 
      'IP ADDRESS'.padEnd(16) + 
      'CONNECTION'
    ));
    console.log(chalk.gray('  ' + '-'.repeat(75)));

    for (const d of devices) {
      const typeStr = d.type;
      const statusColor = d.status === 'RUNNING' ? chalk.green : chalk.red;
      const statusStr = statusColor(d.status.padEnd(12));
      const ipStr = d.ip || 'N/A';
      const connStr = (d as any).connected ? chalk.green('🟢 Connected') : chalk.red('🔴 Disconnected');

      console.log('  ' + 
        d.id.padEnd(25) + 
        typeStr.padEnd(10) + 
        statusStr + 
        ipStr.padEnd(16) + 
        connStr
      );
    }
    console.log();
  } catch (err: any) {
    if (isJson) {
      console.log(JSON.stringify({ status: 'error', message: `Failed to fetch devices: ${err.message}` }));
    } else {
      console.error(chalk.bold.red(`\n  Error: Failed to fetch devices: ${err.message}\n`));
    }
  }
}

async function showLogs(network: string, deviceId: string) {
  const status = limaManager.getVMStatus(network);
  if (status !== 'Running') {
    console.error(chalk.red(`\n  Error: Lima VM (${network}) is not running.`));
    process.exit(1);
  }

  const logFile = `/opt/ueransim/generated_configs/${deviceId}.log`;
  console.log(chalk.blue(`\n📋 Following logs for device "${deviceId}" (Ctrl+C to exit)...`));
  console.log(chalk.gray(`  Log location in VM: ${logFile}\n`));

  const tail = spawn('limactl', ['shell', network, 'tail', '-n', '50', '-f', logFile], {
    stdio: 'inherit'
  });

  tail.on('error', (err) => {
    console.error(chalk.red(`  Failed to watch logs: ${err.message}`));
  });
}

async function showNetworks(isJson: boolean) {
  try {
    const instances = limaManager.listInstances();

    if (isJson) {
      console.log(JSON.stringify(instances, null, 2));
      return;
    }

    console.log(chalk.bold.cyan('\n  Available 5G Networks (Lima VM Instances)'));
    console.log(chalk.gray('  ========================================='));

    if (instances.length === 0) {
      console.log(chalk.yellow('  No networks found.'));
      console.log(chalk.gray("  Run 'unuko <network> start' to provision and start a new network VM.\n"));
      return;
    }

    console.log('\n  ' + chalk.bold(
      'NETWORK'.padEnd(15) + 
      'STATUS'.padEnd(14) + 
      'SSH PORT'.padEnd(12) + 
      'CPUS'.padEnd(8) + 
      'MEMORY'
    ));
    console.log(chalk.gray('  ' + '-'.repeat(60)));

    for (const inst of instances) {
      const statusText = inst.status === 'Running' ? 'Running' : inst.status;
      const statusIndicator = inst.status === 'Running' ? '🟢 ' : '🔴 ';
      const statusColor = inst.status === 'Running' ? chalk.green : chalk.red;
      const statusStr = statusIndicator + statusColor(statusText.padEnd(10));
      const portStr = inst.sshLocalPort ? `${inst.sshLocalPort}` : 'N/A';
      const cpusStr = inst.cpus ? `${inst.cpus}` : 'N/A';
      const memoryStr = inst.memory ? `${(inst.memory / (1024*1024*1024)).toFixed(0)}GiB` : 'N/A';

      console.log('  ' + 
        inst.name.padEnd(15) + 
        statusStr.padEnd(14) + 
        portStr.padEnd(12) + 
        cpusStr.padEnd(8) + 
        memoryStr
      );
    }
    console.log();
  } catch (err: any) {
    if (isJson) {
      console.log(JSON.stringify({ status: 'error', message: `Failed to list networks: ${err.message}` }));
    } else {
      console.error(chalk.bold.red(`\n  Error: Failed to list networks: ${err.message}\n`));
    }
  }
}

main();
