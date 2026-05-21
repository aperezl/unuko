import { execSync } from 'child_process';

export interface VMInfo {
  name: string;
  status: 'Running' | 'Stopped' | 'Broken' | string;
  dir: string;
  cpus?: number;
  memory?: number;
  disk?: number;
  sshLocalPort?: number;
}

export interface ServiceStatusInfo {
  name: string;
  label: string;
  desc: string;
  status: 'active' | 'inactive' | string;
  type: 'system' | 'core';
}

export interface RichStatus {
  vm: {
    name: string;
    status: string;
    cpus?: number;
    memory?: string;
    sshLocalPort?: number;
  } | null;
  services: ServiceStatusInfo[];
}

export interface ExecuteOptions {
  stdio?: 'inherit' | 'pipe' | 'ignore';
}

export class LimaManager {
  /**
   * Checks if limactl is installed on the host.
   */
  isLimaInstalled(): boolean {
    try {
      execSync('command -v limactl', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Lists all local Lima VM instances.
   */
  listInstances(): VMInfo[] {
    try {
      const output = execSync('limactl list --format=json', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
      });
      return output
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line) as VMInfo);
    } catch (e) {
      return [];
    }
  }

  /**
   * Gets the status of a specific Lima VM.
   */
  getVMStatus(name: string): string | null {
    const instances = this.listInstances();
    const found = instances.find((inst) => inst.name === name);
    return found ? found.status : null;
  }

  /**
   * Starts a specific Lima VM.
   * If the VM doesn't exist, provisions it with the provided configPath.
   */
  startVM(name: string, configPath?: string, options: ExecuteOptions = {}): void {
    const instances = this.listInstances();
    const exists = instances.some((inst) => inst.name === name);
    const stdioOpt = options.stdio || 'inherit';

    if (!exists && configPath) {
      console.error(`[LimaManager] VM '${name}' does not exist. Provisioning from: ${configPath}`);
      execSync(`limactl start --name=${name} "${configPath}" --tty=false`, {
        stdio: stdioOpt,
      });
    } else {
      console.error(`[LimaManager] Starting existing VM '${name}'...`);
      execSync(`limactl start ${name} --tty=false`, {
        stdio: stdioOpt,
      });
    }
  }

  /**
   * Stops a specific Lima VM.
   */
  stopVM(name: string, force = false, options: ExecuteOptions = {}): void {
    console.error(`[LimaManager] Stopping VM '${name}' (force=${force})...`);
    const stdioOpt = options.stdio || 'inherit';
    const cmd = force ? `limactl stop -f ${name}` : `limactl stop ${name}`;
    execSync(cmd, { stdio: stdioOpt });
  }

  /**
   * Deletes a specific Lima VM.
   */
  deleteVM(name: string, options: ExecuteOptions = {}): void {
    console.error(`[LimaManager] Deleting VM '${name}'...`);
    const stdioOpt = options.stdio || 'inherit';
    execSync(`limactl delete ${name}`, { stdio: stdioOpt });
  }

  /**
   * Executes a command inside a specific Lima VM.
   */
  executeCommand(
    instanceName: string,
    command: string,
    sudo = false,
    options: ExecuteOptions = {}
  ): string {
    const shellCmd = sudo ? `sudo ${command}` : command;
    // Escape single quotes for bash -c
    const escapedCommand = shellCmd.replace(/'/g, "'\\''");
    const fullCmd = `limactl shell ${instanceName} bash -c '${escapedCommand}'`;
    const stdioOpt = options.stdio || 'pipe';

    const output = execSync(fullCmd, {
      encoding: 'utf8',
      stdio: [stdioOpt === 'pipe' ? 'pipe' : 'ignore', 'pipe', 'ignore'],
    });
    return output;
  }

  /**
   * Queries status of multiple systemd services in the Lima VM.
   */
  getServicesStatus(
    instanceName: string,
    serviceNames: string[]
  ): Record<string, 'active' | 'inactive' | string> {
    if (serviceNames.length === 0) return {};

    const serviceStr = serviceNames.join(' ');
    let output = '';
    try {
      output = execSync(
        `limactl shell ${instanceName} systemctl is-active ${serviceStr}`,
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
      );
    } catch (e: any) {
      if (e.stdout) {
        output = e.stdout;
      }
    }

    const statuses = output.trim().split('\n').map((s) => s.trim());
    const result: Record<string, string> = {};

    serviceNames.forEach((name, idx) => {
      result[name] = statuses[idx] || 'inactive';
    });

    return result;
  }

  /**
   * Controls (start/stop/restart) a systemd service inside the Lima VM.
   */
  toggleService(
    instanceName: string,
    serviceName: string,
    action: 'start' | 'stop' | 'restart'
  ): string {
    try {
      execSync(`limactl shell ${instanceName} sudo systemctl ${action} "${serviceName}"`, {
        stdio: ['pipe', 'pipe', 'ignore'],
      });
      const checkOutput = execSync(
        `limactl shell ${instanceName} systemctl is-active "${serviceName}"`,
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
      );
      return checkOutput.trim();
    } catch (e: any) {
      if (e.stdout) {
        return e.stdout.trim();
      }
      return action === 'start' ? 'active' : 'inactive';
    }
  }

  /**
   * Returns VM and all services status as a rich, structured object.
   */
  getRichStatus(instanceName: string): RichStatus {
    const instances = this.listInstances();
    const found = instances.find((inst) => inst.name === instanceName);

    const result: RichStatus = {
      vm: found ? {
        name: found.name,
        status: found.status,
        cpus: found.cpus,
        memory: found.memory ? `${(found.memory / (1024*1024*1024)).toFixed(0)}GiB` : undefined,
        sshLocalPort: found.sshLocalPort,
      } : null,
      services: [],
    };

    const systemServices = [
      { name: 'mongod', label: 'Database', desc: 'Open5GS subscriber database', type: 'system' as const },
      { name: 'open5gs-webui', label: 'Web UI', desc: 'Core network management portal', type: 'system' as const },
      { name: 'osmo-smdpp', label: 'SM-DP+', desc: 'Subscription Manager Data Preparation server', type: 'system' as const },
    ];

    const coreServices = [
      { name: 'open5gs-amfd', label: 'AMF', desc: 'Access and Mobility Management Function', type: 'core' as const },
      { name: 'open5gs-smfd', label: 'SMF', desc: 'Session Management Function', type: 'core' as const },
      { name: 'open5gs-upfd', label: 'UPF', desc: 'User Plane Function', type: 'core' as const },
      { name: 'open5gs-udmd', label: 'UDM', desc: 'Unified Data Management', type: 'core' as const },
      { name: 'open5gs-udrd', label: 'UDR', desc: 'Unified Data Repository', type: 'core' as const },
      { name: 'open5gs-ausfd', label: 'AUSF', desc: 'Authentication Server Function', type: 'core' as const },
      { name: 'open5gs-nrfd', label: 'NRF', desc: 'Network Repository Function', type: 'core' as const },
      { name: 'open5gs-pcfd', label: 'PCF', desc: 'Policy Control Function', type: 'core' as const },
      { name: 'open5gs-nssfd', label: 'NSSF', desc: 'Network Slice Selection Function', type: 'core' as const },
      { name: 'open5gs-bsfd', label: 'BSF', desc: 'Binding Support Function', type: 'core' as const },
    ];

    const allServices = [...systemServices, ...coreServices];

    if (found && found.status === 'Running') {
      const statusMap = this.getServicesStatus(instanceName, allServices.map(s => s.name));
      result.services = allServices.map(s => ({
        name: s.name,
        label: s.label,
        desc: s.desc,
        status: statusMap[s.name] || 'inactive',
        type: s.type
      }));
    } else {
      result.services = allServices.map(s => ({
        name: s.name,
        label: s.label,
        desc: s.desc,
        status: 'inactive',
        type: s.type
      }));
    }

    return result;
  }
}

export const limaManager = new LimaManager();
