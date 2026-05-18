import { UniversalNetworkPort } from '../../domain/ports/out/network.port';
import { Subscriber, UESession, NetworkMetrics, AttachOptions } from '../../domain/models/network.types';
import { spawn } from 'child_process';
import { UeransimConfigGenerator } from './utils/UeransimConfigGenerator';

export class LimaOpen5gsAdapter implements UniversalNetworkPort {
  private activeSessions: Map<string, { process: any; session: UESession }> = new Map();
  private readonly LIMA_INSTANCE = 'core5g';
  private readonly WEBUI_API_URL = 'http://localhost:9999/api';

  async provision(subscriber: Subscriber): Promise<void> {
    console.log(`[LIMA NETWORK] Provisioning subscriber ${subscriber.imsi} via WebUI API...`);
    
    const payload = {
      imsi: subscriber.imsi,
      key: subscriber.k,
      opc: subscriber.opc,
      amf: subscriber.amf || '8000',
      op_type: subscriber.opType || 'OPC',
      slice: subscriber.slices.map(s => ({
        sst: s.sst,
        sd: s.sd || '000000',
        default_indicator: s.isDefault || false
      }))
    };

    try {
      const response = await fetch(`${this.WEBUI_API_URL}/subscriber`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to provision subscriber: ${error}`);
      }
    } catch (err: any) {
      throw new Error(`Open5GS API Error: ${err.message}`);
    }
  }

  async deprovision(imsi: string): Promise<void> {
    console.log(`[LIMA NETWORK] Deprovisioning subscriber ${imsi}...`);
    try {
      const response = await fetch(`${this.WEBUI_API_URL}/subscriber/${imsi}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error(await response.text());
    } catch (err: any) {
      throw new Error(`Open5GS API Error: ${err.message}`);
    }
  }

  async attachUE(imsi: string, options?: AttachOptions): Promise<UESession> {
    console.log(`[LIMA NETWORK] Starting UE attachment for ${imsi}...`);

    // 1. Generar Configuración UERANSIM (Usando el nuevo generador)
    // Nota: Necesitamos recuperar el suscriptor completo si solo tenemos el IMSI
    // Por simplicidad en esta fase, asumimos que los datos están disponibles o usamos defaults
    const mockSub: Subscriber = {
      imsi,
      k: '465B5CE8B199B49FAA5F0A2EE238A6BC',
      opc: 'E8ED289DEBA952E4283B54E88E6183CA',
      slices: [{ sst: 1, isDefault: true }]
    };

    const yamlConfig = UeransimConfigGenerator.generate(mockSub, options);
    const remotePath = `/tmp/ue-${imsi}.yaml`;

    // 2. Transferir Configuración a Lima
    await this.execLima(`sudo tee ${remotePath} > /dev/null`, yamlConfig);

    // 3. Ejecutar nr-ue y monitorizar logs
    return new Promise((resolve, reject) => {
      const nrUe = spawn('limactl', ['shell', this.LIMA_INSTANCE, 'sudo', '/opt/ueransim/build/nr-ue', '-c', remotePath]);

      const session: UESession = {
        sessionId: `lima-${imsi}-${Date.now()}`,
        imsi,
        status: 'ATTACHING'
      };

      this.activeSessions.set(imsi, { process: nrUe, session });

      nrUe.stdout.on('data', (data) => {
        const line = data.toString();
        if (line.includes('PDU Session establishment is successful')) {
          session.status = 'CONNECTED';
          const ipMatch = line.match(/TUN interface\[(.+), (.+)\] is up/);
          if (ipMatch) {
            session.interfaceName = ipMatch[1];
            session.ipAddress = ipMatch[2];
          }
          resolve({ ...session });
        }

        if (line.includes('Registration Reject')) {
          session.status = 'ERROR';
          session.error = 'Registration Rejected by Core';
          this.detachUE(imsi);
          reject(new Error(session.error));
        }
      });

      nrUe.on('close', (code) => {
        session.status = 'DISCONNECTED';
        this.activeSessions.delete(imsi);
      });

      setTimeout(() => {
        if (session.status === 'ATTACHING') {
          this.detachUE(imsi);
          reject(new Error('UE Attachment timeout'));
        }
      }, options?.timeout || 30000);
    });
  }

  async detachUE(imsi: string): Promise<void> {
    const active = this.activeSessions.get(imsi);
    if (active) {
      active.process.kill('SIGINT');
      this.activeSessions.delete(imsi);
    }
  }

  async getMetrics(imsi: string): Promise<NetworkMetrics> {
    return {
      sessionId: this.activeSessions.get(imsi)?.session.sessionId || 'none',
      timestamp: Date.now(),
      uplinkBytes: 0,
      downlinkBytes: 0
    };
  }

  async getSessions(): Promise<UESession[]> {
    return Array.from(this.activeSessions.values()).map(s => s.session);
  }

  private async execLima(command: string, stdin?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const proc = spawn('limactl', ['shell', this.LIMA_INSTANCE, 'bash', '-c', command]);
      let output = '';
      let error = '';

      if (stdin) {
        proc.stdin.write(stdin);
        proc.stdin.end();
      }

      proc.stdout.on('data', d => output += d);
      proc.stderr.on('data', d => error += d);
      proc.on('close', code => {
        if (code === 0) resolve(output);
        else reject(new Error(error));
      });
    });
  }
}
