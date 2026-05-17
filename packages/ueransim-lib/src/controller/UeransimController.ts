import { UeransimTransport } from '../transport/index.js';
import { UeransimConfigBuilder, UEConfig, GNBConfig } from '../config/UeransimConfigBuilder.js';
import { UeransimCliClient } from './UeransimCliClient.js';
import yaml from 'js-yaml';

export interface UeransimDevice {
  id: string;
  type: 'UE' | 'GNB';
  status: 'RUNNING' | 'STOPPED' | 'ERROR';
  config: any;
  ip?: string;
}

export class UeransimController {
  private cliClient: UeransimCliClient;
  private activeDevices: Map<string, UeransimDevice> = new Map();

  constructor(
    private transport: UeransimTransport,
    private workDir: string = '/home/aperezl.guest/UERANSIM',
    private configDir: string = '/home/aperezl.guest/UERANSIM/generated_configs'
  ) {
    this.cliClient = new UeransimCliClient(transport, `${workDir}/build/nr-cli`);
  }

  async init(): Promise<void> {
    await this.transport.execute(`mkdir -p ${this.configDir}`);
    await this.sync();
  }

  async sync(): Promise<void> {
    const result = await this.transport.execute(`ls ${this.configDir}/*.yaml`);
    if (result.exitCode !== 0) {
      this.activeDevices.clear();
      return;
    }

    const files = result.stdout.trim().split('\n');
    const newMap = new Map<string, UeransimDevice>();

    for (const file of files) {
      if (!file) continue;
      try {
        const id = file.split('/').pop()?.replace('.yaml', '') || 'unknown';
        const content = await this.transport.execute(`cat ${file}`);
        const config = yaml.load(content.stdout) as any;
        
        const type = config.supi ? 'UE' : 'GNB';
        
        // More robust process check
        const psResult = await this.transport.execute(`pgrep -f "${id}.yaml"`);
        const status = psResult.exitCode === 0 ? 'RUNNING' : 'STOPPED';

        let ip = undefined;
        let connected = false;
        if (type === 'UE' && status === 'RUNNING') {
          try {
            const infoStr = await this.cliClient.getUEStatus(id);
            connected = infoStr.includes('NORMAL-SERVICE') || infoStr.includes('CM-CONNECTED');
            
            const psStr = await (this.cliClient as any).getUEPSList(id);
            const ipMatch = psStr.match(/address:\s*([\d.]+)/);
            if (ipMatch) ip = ipMatch[1];
          } catch (e) {}
        }

        newMap.set(id, { 
          id, 
          type, 
          status, 
          config, 
          ip, 
          connected,
          mcc: config.mcc,
          mnc: config.mnc
        } as any);
      } catch (err) {
        console.error(`Failed to sync config for ${file}:`, err);
      }
    }

    this.activeDevices = newMap;
  }

  async startUE(config: UEConfig): Promise<UeransimDevice> {
    // Ensure it's stopped first
    await this.stopDevice(config.supi);
    
    // Query MongoDB inside the VM to enrich config with the absolute latest subscriber keys and slices
    try {
      const supiVal = config.supi;
      const imsi = supiVal.replace('imsi-', '');
      const wrappedEval = `JSON.stringify(db.subscribers.findOne({imsi: "${imsi}"}))`;
      const fullCommand = `sudo mongosh open5gs --quiet --eval '${wrappedEval}'`;
      const result = await this.transport.execute(fullCommand);
      const output = result.stdout;
      if (output && output.trim() !== '') {
        const jsonStart = output.indexOf('{');
        if (jsonStart !== -1) {
          const cleanJson = output.substring(jsonStart).trim();
          const end = cleanJson.lastIndexOf('}') + 1;
          const sub = JSON.parse(cleanJson.substring(0, end));
          if (sub && sub.security) {
            if (sub.security.k) config.key = sub.security.k.replace(/\s+/g, '');
            if (sub.security.opc) {
              config.op = sub.security.opc.replace(/\s+/g, '');
              config.opType = 'OPC';
            } else if (sub.security.op) {
              config.op = sub.security.op.replace(/\s+/g, '');
              config.opType = 'OP';
            }
            if (sub.slice && sub.slice.length > 0) {
              config.sessions = sub.slice.map((sl: any) => ({
                type: 'IPv4',
                apn: 'internet',
                slice: { sst: Number(sl.sst), sd: sl.sd ? sl.sd.replace(/\s+/g, '') : undefined }
              }));
              config.configuredNssai = sub.slice.map((sl: any) => ({
                sst: Number(sl.sst),
                sd: sl.sd ? sl.sd.replace(/\s+/g, '') : undefined
              }));
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to dynamically enrich UE config from MongoDB:', e);
    }
    
    const yamlStr = UeransimConfigBuilder.buildUE(config);
    const id = config.supi;
    const configPath = `${this.configDir}/${id}.yaml`;
    const logPath = `${this.configDir}/${id}.log`;

    await this.transport.writeFile(configPath, yamlStr);

    // Use a clearer command structure with sudo for TUN interface
    const command = `nohup sudo ${this.workDir}/build/nr-ue -c ${configPath} > ${logPath} 2>&1 &`;
    await this.transport.execute(command);
    
    // Wait a bit for the process to appear
    await new Promise(resolve => setTimeout(resolve, 500));
    await this.sync();
    return this.activeDevices.get(id)!;
  }

  async startGNB(config: GNBConfig): Promise<UeransimDevice> {
    const id = `gnb-${config.nci}`;
    await this.stopDevice(id);
    
    const yamlStr = UeransimConfigBuilder.buildGNB(config);
    const configPath = `${this.configDir}/${id}.yaml`;
    const logPath = `${this.configDir}/${id}.log`;

    await this.transport.writeFile(configPath, yamlStr);

    const command = `nohup ${this.workDir}/build/nr-gnb -c ${configPath} > ${logPath} 2>&1 &`;
    await this.transport.execute(command);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    await this.sync();
    return this.activeDevices.get(id)!;
  }

  async stopDevice(deviceId: string): Promise<void> {
    // Use -9 to be sure and -f with full path matching
    await this.transport.execute(`sudo pkill -9 -f "${deviceId}.yaml"`);
    await this.sync();
  }

  async removeDevice(deviceId: string): Promise<void> {
    await this.stopDevice(deviceId);
    await this.transport.execute(`sudo rm -f ${this.configDir}/${deviceId}.yaml ${this.configDir}/${deviceId}.log`);
    await this.sync();
  }

  async stopAll(): Promise<void> {
    await this.transport.execute(`sudo pkill -9 nr-ue; sudo pkill -9 nr-gnb`);
    await this.sync();
  }

  async updateUE(imsi: string, config: UEConfig): Promise<UeransimDevice> {
    return this.startUE(config);
  }

  async updateGNB(nci: string, config: GNBConfig): Promise<UeransimDevice> {
    return this.startGNB(config);
  }

  // Refined helper to ensure we always have a valid config
  async getDevices(): Promise<UeransimDevice[]> {
    await this.sync();
    return Array.from(this.activeDevices.values());
  }

  async getUEStatus(imsi: string): Promise<string> {
    return this.cliClient.getUEStatus(imsi);
  }

  async getLogs(id: string, lines: number = 100): Promise<string> {
    const logPath = `${this.configDir}/${id}.log`;
    const result = await this.transport.execute(`tail -n ${lines} ${logPath}`);
    return result.stdout;
  }

  async getDeviceYaml(id: string): Promise<string> {
    const configPath = `${this.configDir}/${id}.yaml`;
    const result = await this.transport.execute(`cat ${configPath}`);
    return result.stdout;
  }

  async saveDeviceYaml(id: string, yamlStr: string): Promise<void> {
    const configPath = `${this.configDir}/${id}.yaml`;
    await this.transport.writeFile(configPath, yamlStr);
  }
}
