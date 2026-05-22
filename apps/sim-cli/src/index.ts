#!/usr/bin/env node
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import fs from 'fs';
import net from 'net';
import os from 'os';
import { limaManager } from '@unuko/cli';
import { UeransimNetworkAdapter } from '@unuko/adapter-ueransim';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IS_DEV = process.env.UNUKO_ENV === 'development';

const PROJECT_ROOT = IS_DEV
  ? path.resolve(__dirname, '../../../')
  : path.resolve(__dirname, '..');

const LIMA_YAML_PATH = IS_DEV
  ? path.join(PROJECT_ROOT, 'lima.yaml')
  : path.join(PROJECT_ROOT, 'lima.yaml');

const SCRATCH_DIR = IS_DEV
  ? path.join(PROJECT_ROOT, 'scratch')
  : path.join(os.homedir(), '.unuko');

// Ensure scratch/data directory exists
if (!fs.existsSync(SCRATCH_DIR)) {
  fs.mkdirSync(SCRATCH_DIR, { recursive: true });
}

const DASHBOARD_PID_FILE = path.join(SCRATCH_DIR, 'dashboard-state.json');

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
  console.log('         ' + chalk.green('unuko dashboard start|stop'));
  console.log('         ' + chalk.green('unuko list [options]\n'));
  console.log('  Parameters:');
  console.log(`    ${chalk.bold('<network>')}        Name of the Lima VM network instance (e.g., core5g)`);
  console.log('\n  Commands:');
  console.log(`    ${chalk.bold('list')}              List all available networks (Lima VM instances)`);
  console.log(`    ${chalk.bold('create')}            Create and provision a new Lima VM instance`);
  console.log(`    ${chalk.bold('destroy')}           Stop and delete a Lima VM instance`);
  console.log(`    ${chalk.bold('start')}             Boot the Lima VM & start services`);
  console.log(`    ${chalk.bold('stop')}              Shut down the Lima VM`);
  console.log(`    ${chalk.bold('status')}            Display environment status dashboard`);
  console.log(`    ${chalk.bold('restart')}           Restart all systemd core network services`);
  console.log(`    ${chalk.bold('devices')}           List active UERANSIM simulated GNB and UE devices`);
  console.log(`    ${chalk.bold('logs <device-id>')}  View and follow logs for a simulated device`);
  console.log(`    ${chalk.bold('dashboard start')}   Start dashboard services (backend, mock SM-DP+, frontend)`);
  console.log(`    ${chalk.bold('dashboard stop')}    Stop all running dashboard services`);
  console.log(`    ${chalk.bold('help')}              Show this help menu\n`);
  console.log('  Options:');
  console.log(`    ${chalk.bold('--format=json')}    Output result in JSON format (supported for list, status, devices, start, stop, restart, create, destroy)\n`);
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

  if (firstArg === 'dashboard') {
    const subCommand = cleanArgs[1];
    if (!subCommand || (subCommand !== 'start' && subCommand !== 'stop')) {
      if (isJson) {
        console.log(JSON.stringify({ status: 'error', message: 'Usage: unuko dashboard start|stop' }));
      } else {
        console.error(chalk.bold.red('\n  Error: Invalid dashboard command.'));
        console.error(chalk.red('  Usage: unuko dashboard start|stop\n'));
      }
      process.exit(1);
    }

    if (subCommand === 'start') {
      await handleDashboardStart(isJson);
    } else {
      await handleDashboardStop(isJson);
    }
    process.exit(0);
  }

  const KNOWN_COMMANDS = ['start', 'stop', 'status', 'restart', 'devices', 'logs', 'create', 'destroy'];

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

    case 'create':
      if (!isJson) {
        console.log(chalk.blue(`\n🏗 Creating and provisioning Lima VM (${network})...`));
      }
      try {
        const status = limaManager.getVMStatus(network);
        if (status) {
          if (isJson) {
            console.log(JSON.stringify({ status: 'error', message: `VM '${network}' already exists.` }));
          } else {
            console.error(chalk.bold.red(`\n✖ Error: Lima VM (${network}) already exists.`));
            console.error(chalk.red(`  To start it, run: unuko ${network} start`));
            console.error(chalk.red(`  To delete/destroy it first, run: unuko ${network} destroy\n`));
          }
          process.exit(1);
        }

        limaManager.startVM(network, LIMA_YAML_PATH, { stdio: isJson ? 'ignore' : 'inherit' });
        if (isJson) {
          console.log(JSON.stringify({ status: 'success', message: `Lima VM (${network}) created and provisioned successfully.` }));
        } else {
          console.log(chalk.bold.green(`\n✔ Lima VM (${network}) created and provisioned successfully.`));
        }
      } catch (err: any) {
        if (isJson) {
          console.log(JSON.stringify({ status: 'error', message: `Failed to create Lima VM: ${err.message}` }));
        } else {
          console.error(chalk.bold.red(`\n✖ Failed to create Lima VM: ${err.message}`));
        }
        process.exit(1);
      }
      break;

    case 'destroy':
      if (!isJson) {
        console.log(chalk.blue(`\n💥 Destroying Lima VM (${network})...`));
      }
      try {
        const status = limaManager.getVMStatus(network);
        if (!status) {
          if (isJson) {
            console.log(JSON.stringify({ status: 'error', message: `VM '${network}' does not exist.` }));
          } else {
            console.log(chalk.yellow(`⚠ VM '${network}' does not exist.`));
          }
          process.exit(0);
        }

        if (status === 'Running') {
          if (!isJson) {
            console.log(chalk.gray('  Stopping VM first...'));
          }
          limaManager.stopVM(network, true, { stdio: isJson ? 'ignore' : 'inherit' });
        }

        if (!isJson) {
          console.log(chalk.gray('  Deleting VM instances and disk images...'));
        }
        limaManager.deleteVM(network, { stdio: isJson ? 'ignore' : 'inherit' });

        if (isJson) {
          console.log(JSON.stringify({ status: 'success', message: `Lima VM (${network}) destroyed successfully.` }));
        } else {
          console.log(chalk.bold.green(`\n✔ Lima VM (${network}) destroyed successfully.`));
        }
      } catch (err: any) {
        if (isJson) {
          console.log(JSON.stringify({ status: 'error', message: `Failed to destroy VM: ${err.message}` }));
        } else {
          console.error(chalk.bold.red(`\n✖ Failed to destroy VM: ${err.message}`));
        }
        process.exit(1);
      }
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

function checkPort(port: number, host = 'localhost', timeout = 1000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const onError = () => {
      socket.destroy();
      resolve(false);
    };
    socket.setTimeout(timeout);
    socket.once('error', onError);
    socket.once('timeout', onError);
    socket.connect(port, host, () => {
      socket.end();
      resolve(true);
    });
  });
}

async function waitForPort(port: number, timeoutMs = 15000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await checkPort(port)) {
      return true;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

function killProcessGroup(pid: number) {
  try {
    process.kill(-pid, 'SIGTERM');
  } catch (err: any) {
    try {
      process.kill(-pid, 'SIGKILL');
    } catch (e) {
      // Ignore
    }
  }
}

async function handleDashboardStart(isJson: boolean) {
  // Check PID file
  if (fs.existsSync(DASHBOARD_PID_FILE)) {
    try {
      const state = JSON.parse(fs.readFileSync(DASHBOARD_PID_FILE, 'utf8'));
      let anyRunning = false;
      const pids = [state.backendPid, state.smdpMockPid, state.frontendPid].filter(Boolean);
      for (const pid of pids) {
        try {
          process.kill(pid, 0);
          anyRunning = true;
        } catch {
          // ignore
        }
      }
      if (anyRunning) {
        if (isJson) {
          console.log(JSON.stringify({ status: 'error', message: 'Dashboard is already running.' }));
        } else {
          console.log(chalk.yellow(`\n⚠ Dashboard is already running (PIDs: ${pids.join(', ')}).`));
          console.log(chalk.gray("  Use 'unuko dashboard stop' to stop it first.\n"));
        }
        process.exit(0);
      }
    } catch {
      // ignore parsing error, proceed
    }
  }

  // Check if ports are already busy
  const busyPorts = [];
  if (await checkPort(3000)) busyPorts.push(3000);
  if (await checkPort(8080)) busyPorts.push(8080);
  if (IS_DEV && await checkPort(5173)) busyPorts.push(5173);

  if (busyPorts.length > 0) {
    if (isJson) {
      console.log(JSON.stringify({ 
        status: 'error', 
        message: `Ports already in use: ${busyPorts.join(', ')}. Please stop them or run 'unuko dashboard stop' first.` 
      }));
    } else {
      console.error(chalk.bold.red(`\n✖ Error: Ports already in use: ${busyPorts.join(', ')}`));
      console.error(chalk.red("  Please check if another service is running or run: unuko dashboard stop\n"));
    }
    process.exit(1);
  }

  if (!fs.existsSync(SCRATCH_DIR)) {
    fs.mkdirSync(SCRATCH_DIR, { recursive: true });
  }

  if (!isJson) {
    console.log(chalk.blue('\n🚀 Starting UNUKO Simulation Dashboard...'));
    console.log(chalk.gray(`  Logs will be written to ${IS_DEV ? 'scratch/' : '~/.unuko/'} folder.`));
  }

  const backendLog = fs.openSync(path.join(SCRATCH_DIR, 'sim-backend.log'), 'a');
  const smdpMockLog = fs.openSync(path.join(SCRATCH_DIR, 'smdp-mock.log'), 'a');
  const frontendLog = fs.openSync(path.join(SCRATCH_DIR, 'sim-frontend.log'), 'a');

  let smdpProcess;
  let backendProcess;
  let frontendProcess;

  if (IS_DEV) {
    // 1. Start SM-DP+ mock
    if (!isJson) console.log(chalk.gray('  Starting Mock SM-DP+ server...'));
    smdpProcess = spawn('pnpm', ['--filter', '@unuko/smdp-mockv2', 'dev'], {
      detached: true,
      stdio: ['ignore', smdpMockLog, smdpMockLog],
      cwd: PROJECT_ROOT,
      env: {
        ...process.env,
        UNUKO_ENV: 'development',
      },
    });
    smdpProcess.unref();

    // 2. Start Backend
    if (!isJson) console.log(chalk.gray('  Starting simulation backend...'));
    backendProcess = spawn('pnpm', ['--filter', 'sim-backend', 'dev'], {
      detached: true,
      stdio: ['ignore', backendLog, backendLog],
      cwd: PROJECT_ROOT,
      env: {
        ...process.env,
        UNUKO_ENV: 'development',
      },
    });
    backendProcess.unref();
  } else {
    // Production Mode: spawn using node directly
    const backendPath = path.join(PROJECT_ROOT, 'assets/sim-backend/dist/index.js');
    const smdpPath = path.join(PROJECT_ROOT, 'assets/smdp-mockv2/dist/index.js');

    // 1. Start SM-DP+ mock
    if (!isJson) console.log(chalk.gray('  Starting Mock SM-DP+ server (Production)...'));
    smdpProcess = spawn('node', [smdpPath], {
      detached: true,
      stdio: ['ignore', smdpMockLog, smdpMockLog],
      cwd: PROJECT_ROOT,
      env: {
        ...process.env,
        UNUKO_ENV: 'production',
      },
    });
    smdpProcess.unref();

    // 2. Start Backend
    if (!isJson) console.log(chalk.gray('  Starting simulation backend (Production)...'));
    backendProcess = spawn('node', [backendPath], {
      detached: true,
      stdio: ['ignore', backendLog, backendLog],
      cwd: PROJECT_ROOT,
      env: {
        ...process.env,
        UNUKO_ENV: 'production',
      },
    });
    backendProcess.unref();
  }

  // 3. Wait for Backend and SM-DP+ Mock to bind ports
  if (!isJson) console.log(chalk.gray('  Waiting for backend and mock SM-DP+ to be online...'));
  const backendReady = await waitForPort(3000, 20000);
  const smdpReady = await waitForPort(8080, 20000);

  if (!backendReady || !smdpReady) {
    if (isJson) {
      console.log(JSON.stringify({ 
        status: 'error', 
        message: `Services failed to start. Backend ready: ${backendReady}, SM-DP+ ready: ${smdpReady}` 
      }));
    } else {
      console.error(chalk.bold.red('\n✖ Error: Services failed to start within timeout.'));
      console.error(chalk.red(`  Backend online: ${backendReady ? 'Yes' : 'No'}`));
      console.error(chalk.red(`  SM-DP+ Mock online: ${smdpReady ? 'Yes' : 'No'}`));
      console.error(chalk.red(`  Please check logs in ${IS_DEV ? 'scratch/' : '~/.unuko/'} folder.`));
    }
    
    if (smdpProcess.pid) killProcessGroup(smdpProcess.pid);
    if (backendProcess.pid) killProcessGroup(backendProcess.pid);
    process.exit(1);
  }

  if (IS_DEV) {
    // 4. Start Frontend
    if (!isJson) console.log(chalk.gray('  Starting frontend dashboard...'));
    frontendProcess = spawn('pnpm', ['--filter', 'sim-frontend', 'dev'], {
      detached: true,
      stdio: ['ignore', frontendLog, frontendLog],
      cwd: PROJECT_ROOT,
    });
    frontendProcess.unref();

    // Wait for Frontend
    if (!isJson) console.log(chalk.gray('  Waiting for frontend dashboard to be online...'));
    const frontendReady = await waitForPort(5173, 20000);

    if (!frontendReady) {
      if (isJson) {
        console.log(JSON.stringify({ 
          status: 'error', 
          message: 'Frontend failed to start.' 
        }));
      } else {
        console.error(chalk.bold.red('\n✖ Error: Frontend dashboard failed to start.'));
        console.error(chalk.red('  Please check logs in scratch/ folder.'));
      }
      
      if (smdpProcess.pid) killProcessGroup(smdpProcess.pid);
      if (backendProcess.pid) killProcessGroup(backendProcess.pid);
      if (frontendProcess.pid) killProcessGroup(frontendProcess.pid);
      process.exit(1);
    }
  }

  // 5. Save state
  const state = {
    backendPid: backendProcess.pid,
    smdpMockPid: smdpProcess.pid,
    frontendPid: IS_DEV ? (frontendProcess?.pid) : undefined,
    status: 'running',
    timestamp: new Date().toISOString()
  };
  fs.writeFileSync(DASHBOARD_PID_FILE, JSON.stringify(state, null, 2), 'utf8');

  if (isJson) {
    console.log(JSON.stringify({ 
      status: 'success', 
      message: 'Dashboard services started successfully.',
      pids: {
        backend: backendProcess.pid,
        smdpMock: smdpProcess.pid,
        frontend: state.frontendPid
      }
    }));
  } else {
    console.log(chalk.bold.green('\n✔ Dashboard services started successfully!'));
    if (IS_DEV) {
      console.log(`  ${chalk.bold('Frontend')}:    ${chalk.cyan('http://localhost:5173')}`);
      console.log(`  ${chalk.bold('Backend API')}: ${chalk.cyan('http://localhost:3000')}`);
    } else {
      console.log(`  ${chalk.bold('Dashboard')}:   ${chalk.cyan('http://localhost:3000')}`);
    }
    console.log(`  ${chalk.bold('SM-DP+ Mock')}: ${chalk.cyan('http://localhost:8080')}`);
    console.log(`  ${chalk.bold('Logs')}:        ${chalk.gray(`Logs are in ${IS_DEV ? 'scratch/' : '~/.unuko/'}`)}`);
    console.log();
  }
}

async function handleDashboardStop(isJson: boolean) {
  if (!fs.existsSync(DASHBOARD_PID_FILE)) {
    if (isJson) {
      console.log(JSON.stringify({ status: 'error', message: 'No running dashboard found.' }));
    } else {
      console.log(chalk.yellow('\n⚠ No dashboard state found. It might not be running.'));
    }
    return;
  }

  if (!isJson) {
    console.log(chalk.blue('\n🛑 Stopping UNUKO Simulation Dashboard...'));
  }

  try {
    const state = JSON.parse(fs.readFileSync(DASHBOARD_PID_FILE, 'utf8'));
    
    if (state.frontendPid) {
      if (!isJson) console.log(chalk.gray(`  Stopping frontend (PID: ${state.frontendPid})...`));
      killProcessGroup(state.frontendPid);
    }
    if (state.backendPid) {
      if (!isJson) console.log(chalk.gray(`  Stopping backend (PID: ${state.backendPid})...`));
      killProcessGroup(state.backendPid);
    }
    if (state.smdpMockPid) {
      if (!isJson) console.log(chalk.gray(`  Stopping SM-DP+ mock (PID: ${state.smdpMockPid})...`));
      killProcessGroup(state.smdpMockPid);
    }

    // Clean up file
    fs.unlinkSync(DASHBOARD_PID_FILE);

    if (isJson) {
      console.log(JSON.stringify({ status: 'success', message: 'Dashboard stopped successfully.' }));
    } else {
      console.log(chalk.bold.green('\n✔ All dashboard services stopped and ports freed.\n'));
    }
  } catch (err: any) {
    if (isJson) {
      console.log(JSON.stringify({ status: 'error', message: `Failed to stop dashboard: ${err.message}` }));
    } else {
      console.error(chalk.bold.red(`\n✖ Failed to stop dashboard: ${err.message}\n`));
    }
    process.exit(1);
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
