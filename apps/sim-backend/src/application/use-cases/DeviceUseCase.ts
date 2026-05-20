import fsPromises from 'fs/promises';
import { CONFIG } from '../../config/config.js';
import { container } from '../../infrastructure/di/DependencyContainer.js';

export class DeviceUseCase {
  async getDevices(): Promise<any[]> {
    const controller = container.getActiveUeransim().controller;
    return await controller.getDevices();
  }

  async clearAllDevices(): Promise<{ status: string }> {
    // 1. Wipe subscriber DB
    await container.getActiveSdm().clearAll();

    // 2. Kill simulated processes and delete config/log files
    const controller = container.getActiveUeransim().controller;
    await controller.removeAllDevices();

    return { status: 'all_cleared' };
  }

  async provisionAll(): Promise<any> {
    console.log('=== Starting Resilient Automatic Seed Provisioning ===');

    const sdm = container.getActiveSdm();
    const ueransim = container.getActiveUeransim();

    // 1. Wipe Slate Clean: Delete all existing subscribers and simulated devices
    console.log('[SEED]: Clearing existing subscriber database...');
    await sdm.clearAll();

    console.log('[SEED]: Stopping and removing all simulated 5G devices...');
    await ueransim.controller.removeAllDevices();
    
    // Ensure the config directory exists
    await ueransim.controller.init();

    // 2. Seed subscribers in Open5GS MongoDB
    let subscribersCount = 0;
    const subscribersData = await fsPromises.readFile(CONFIG.PATHS.SUBSCRIBERS_SEED, 'utf-8');
    const subscribers = JSON.parse(subscribersData);
    for (const sub of subscribers) {
      await sdm.upsert(sub);
      subscribersCount++;
    }
    console.log(`[SEED]: Registered ${subscribersCount} fresh subscribers`);

    // 3. Seed gNB configurations and start them
    let gnbsCount = 0;
    const gnbsData = await fsPromises.readFile(CONFIG.PATHS.GNBS_SEED, 'utf-8');
    const gnbs = JSON.parse(gnbsData);
    for (const gnb of gnbs) {
      await ueransim.controller.startGNB(gnb, false);
      gnbsCount++;
    }
    console.log(`[SEED]: Inventoried ${gnbsCount} slice-aware gNB simulated antennas`);

    // 4. Seed UE configurations and start them
    let uesCount = 0;
    const uesData = await fsPromises.readFile(CONFIG.PATHS.UES_SEED, 'utf-8');
    const ues = JSON.parse(uesData);
    for (const ue of ues) {
      await ueransim.controller.startUE(ue, false);
      uesCount++;
    }
    console.log(`[SEED]: Inventoried ${uesCount} slice-aware UE simulated devices`);

    return {
      status: 'success',
      message: 'Automatic provisioning completed successfully.',
      details: {
        subscribersSeeded: subscribersCount,
        gnbsStarted: gnbsCount,
        uesStarted: uesCount
      }
    };
  }

  async attachUE(imsi: string, gnbAddress?: string): Promise<{ status: string; session: any }> {
    const session = await container.getActiveUeransim().attachUE(imsi, { gnbAddress });
    return { status: 'created', session };
  }

  async updateUE(imsi: string, config: any): Promise<{ status: string; id: string }> {
    const controller = container.getActiveUeransim().controller;
    const fullConfig = {
      supi: imsi,
      mcc: config.mcc || '999',
      mnc: config.mnc || '70',
      key: '465B5CE8B199B49FAA5F0A2EE238A6BC',
      opType: 'OPC' as const,
      opc: 'E8ED289DEBA952E4283B54E88E6183CA',
      amf: '8000',
      imei: '356938035643803',
      imeiSv: '4370816125816151',
      gnbSearchList: [config.gnbAddress || '127.0.0.1'],
      sessions: [{ type: 'IPv4', apn: 'internet', slice: { sst: 1 } }],
      configuredNssai: [{ sst: 1 }],
      defaultNssai: [{ sst: 1 }]
    };
    await controller.updateUE(imsi, fullConfig);
    return { status: 'updated', id: imsi };
  }

  async startGNB(config: any): Promise<{ status: string; device: any }> {
    const controller = container.getActiveUeransim().controller;
    const fullConfig = {
      mcc: config.mcc || '999',
      mnc: config.mnc || '70',
      nci: config.nci || '0x000000010',
      idLength: Number(config.idLength || 32),
      tac: String(config.tac || '1'),
      linkIp: '127.0.0.1',
      ngapIp: '127.0.0.1',
      gtpIp: '127.0.0.1',
      amfConfigs: [{ address: config.amfAddress || '127.0.0.5', port: 38412 }],
      slices: [{ sst: 1 }],
      amfSelection: [{ sst: 1 }]
    };
    const device = await controller.startGNB(fullConfig);
    return { status: 'created', device };
  }

  async updateGNB(nci: string, config: any): Promise<{ status: string; id: string }> {
    const controller = container.getActiveUeransim().controller;
    const fullConfig = {
      mcc: config.mcc || '999',
      mnc: config.mnc || '70',
      nci: nci,
      idLength: Number(config.idLength || 32),
      tac: String(config.tac || '1'),
      linkIp: '127.0.0.1',
      ngapIp: '127.0.0.1',
      gtpIp: '127.0.0.1',
      amfConfigs: [{ address: config.amfAddress || '127.0.0.5', port: 38412 }],
      slices: [{ sst: 1 }],
      amfSelection: [{ sst: 1 }]
    };
    await controller.updateGNB(nci, fullConfig);
    return { status: 'updated', id: nci };
  }

  async stopDevice(id: string): Promise<{ status: string; id: string }> {
    const controller = container.getActiveUeransim().controller;
    await controller.stopDevice(id);
    return { status: 'stopped', id };
  }

  async removeDevice(id: string): Promise<{ status: string; id: string }> {
    const controller = container.getActiveUeransim().controller;
    await controller.removeDevice(id);
    return { status: 'deleted', id };
  }

  async startDevice(id: string): Promise<{ status: string; id: string }> {
    const controller = container.getActiveUeransim().controller;
    const devices = await controller.getDevices();
    const device = devices.find((d: any) => d.id === id);
    
    if (!device) {
      throw new Error('Device config not found');
    }
    
    if (device.type === 'UE') {
      await controller.startUE(device.config);
    } else {
      await controller.startGNB(device.config);
    }
    
    return { status: 'started', id };
  }

  async getDeviceLogs(id: string): Promise<{ logs: string[] }> {
    const controller = container.getActiveUeransim().controller;
    const logs = await controller.getLogs(id);
    return { logs: logs.split('\n') };
  }

  async getDeviceYaml(id: string): Promise<{ yaml: string }> {
    const controller = container.getActiveUeransim().controller;
    const config = await controller.getDeviceYaml(id);
    return { yaml: config };
  }

  async saveDeviceYaml(id: string, yaml: string): Promise<{ status: string }> {
    const controller = container.getActiveUeransim().controller;
    await controller.saveDeviceYaml(id, yaml);
    return { status: 'saved' };
  }
}

export const deviceUseCase = new DeviceUseCase();
