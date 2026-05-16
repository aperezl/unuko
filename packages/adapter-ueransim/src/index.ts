import { 
  UniversalHardwarePort, APDU, TransportError, ChipStatus,
  UniversalNetworkPort, Subscriber, UESession, NetworkMetrics, AttachOptions
} from '@unuko/core';
import { 
  UeransimController, LimaTransport, UEConfig 
} from '@unuko/ueransim-lib';
import * as net from 'net';

export class UeransimHardwareAdapter implements UniversalHardwarePort {
  constructor(private host: string, private port: number) { }

  async reset(): Promise<boolean> {
    return true;
  }

  async transmit(command: APDU): Promise<{
    success: boolean;
    data?: Buffer;
    status?: ChipStatus;
    error?: TransportError;
  }> {
    return new Promise((resolve) => {
      const client = new net.Socket();
      let responseData = Buffer.alloc(0);
      client.setTimeout(5000);
      client.connect(this.port, this.host, () => {
        client.write(command);
      });
      client.on('data', (chunk) => {
        const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        responseData = Buffer.concat([responseData, bufferChunk]);
        if (responseData.length >= 2) {
          const sw1 = responseData[responseData.length - 2];
          const sw2 = responseData[responseData.length - 1];
          client.destroy();
          resolve({
            success: true,
            data: responseData.subarray(0, responseData.length - 2),
            status: { sw1, sw2, isSuccess: sw1 === 0x90 && sw2 === 0x00 }
          });
        }
      });
      client.on('error', () => resolve({ success: false, error: TransportError.READER_ERROR }));
      client.on('timeout', () => {
        client.destroy();
        resolve({ success: false, error: TransportError.TIMEOUT });
      });
    });
  }
}

export class UeransimNetworkAdapter implements UniversalNetworkPort {
  private controller: UeransimController;

  constructor(instanceName: string = 'core5g') {
    const transport = new LimaTransport(instanceName);
    this.controller = new UeransimController(transport);
  }

  async provision(subscriber: Subscriber): Promise<void> {
    // In UERANSIM, provisioning is just preparing the config file
    // Real provisioning would happen in Open5GS/Free5GC
    console.log(`Provisioning subscriber ${subscriber.imsi} (Simulation only)`);
  }

  async deprovision(imsi: string): Promise<void> {
    console.log(`Deprovisioning subscriber ${imsi}`);
  }

  async attachUE(imsi: string, options?: AttachOptions): Promise<UESession> {
    // Basic mapping from IMSI to MCC/MNC
    const mcc = imsi.substring(0, 3);
    const mnc = imsi.substring(3, 5);

    const config: UEConfig = {
      supi: `imsi-${imsi}`,
      mcc,
      mnc,
      key: '465B5CE8B199B49FAA5F0A2EE238A6BC', // Default or from subscriber
      opType: 'OPC',
      opc: 'E8ED289DEBA952E4283B54E88E6183CA',
      amf: '8000',
      imei: '356938035643803',
      imeiSv: '4370816125816151',
      gnbSearchList: [options?.gnbAddress || '127.0.0.1'],
      sessions: [
        {
          type: 'IPv4',
          apn: options?.apn || 'internet',
          slice: { sst: 1 }
        }
      ],
      configuredNssai: [{ sst: 1 }],
      defaultNssai: [{ sst: 1 }]
    };

    await this.controller.init();
    await this.controller.startUE(config);

    return {
      sessionId: `session-${imsi}`,
      imsi,
      status: 'CONNECTED', // We should ideally wait and check via nr-cli
      ipAddress: '10.45.0.2' // Placeholder
    };
  }

  async detachUE(imsi: string): Promise<void> {
    await this.controller.stopDevice(`imsi-${imsi}`);
  }

  async getMetrics(imsi: string): Promise<NetworkMetrics> {
    const status = await this.controller.getUEStatus(`imsi-${imsi}`);
    // Parse status to get metrics...
    return {
      sessionId: `session-${imsi}`,
      timestamp: Date.now(),
      uplinkBytes: 0,
      downlinkBytes: 0,
      rrcState: status.includes('CONNECTED') ? 'CONNECTED' : 'IDLE'
    };
  }

  async getSessions(): Promise<UESession[]> {
    return [];
  }
}

// Keep backward compatibility if needed, but the user likely wants the new classes
export const UeransimAdapter = UeransimHardwareAdapter;