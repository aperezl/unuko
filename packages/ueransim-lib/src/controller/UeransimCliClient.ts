import { UeransimTransport } from '../transport/index.js';

export class UeransimCliClient {
  constructor(
    private transport: UeransimTransport,
    private binPath: string = '/home/aperezl.guest/UERANSIM/build/nr-cli'
  ) {}

  async exec(deviceId: string, command: string): Promise<string> {
    const fullCommand = `sudo ${this.binPath} ${deviceId} --exec "${command}"`;
    const result = await this.transport.execute(fullCommand);
    if (result.exitCode !== 0) {
      throw new Error(`nr-cli failed: ${result.stderr}`);
    }
    return result.stdout;
  }

  async getUEStatus(imsi: string): Promise<string> {
    return this.exec(imsi, 'status');
  }

  async getUEInfo(imsi: string): Promise<string> {
    return this.exec(imsi, 'info');
  }

  async getUEPSList(imsi: string): Promise<string> {
    return this.exec(imsi, 'ps-list');
  }
}
