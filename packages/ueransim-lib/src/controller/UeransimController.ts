import { UeransimTransport } from '../transport/index.js';
import { UeransimConfigBuilder, UEConfig, GNBConfig } from '../config/UeransimConfigBuilder.js';
import { UeransimCliClient } from './UeransimCliClient.js';

export interface UeransimDevice {
  id: string;
  type: 'UE' | 'GNB';
  status: 'RUNNING' | 'STOPPED' | 'ERROR';
}

export class UeransimController {
  private cliClient: UeransimCliClient;

  constructor(
    private transport: UeransimTransport,
    private workDir: string = '/home/aperezl.guest/UERANSIM',
    private configDir: string = '/home/aperezl.guest/UERANSIM/generated_configs'
  ) {
    this.cliClient = new UeransimCliClient(transport, `${workDir}/build/nr-cli`);
  }

  async init(): Promise<void> {
    await this.transport.execute(`mkdir -p ${this.configDir}`);
  }

  async startUE(config: UEConfig): Promise<UeransimDevice> {
    const yaml = UeransimConfigBuilder.buildUE(config);
    const configPath = `${this.configDir}/${config.supi}.yaml`;
    const logPath = `${this.configDir}/${config.supi}.log`;

    await this.transport.writeFile(configPath, yaml);

    // Start in background
    const command = `nohup ${this.workDir}/build/nr-ue -c ${configPath} > ${logPath} 2>&1 & echo $!`;
    const result = await this.transport.execute(command);
    
    if (result.exitCode !== 0) {
      throw new Error(`Failed to start UE: ${result.stderr}`);
    }

    return {
      id: config.supi,
      type: 'UE',
      status: 'RUNNING'
    };
  }

  async stopDevice(deviceId: string): Promise<void> {
    // This is a bit naive, ideally we'd track PIDs
    // But we can use pkill or find the process by config file
    await this.transport.execute(`pkill -f "${deviceId}.yaml"`);
  }

  async getUEStatus(imsi: string): Promise<string> {
    return this.cliClient.getUEStatus(imsi);
  }
}
