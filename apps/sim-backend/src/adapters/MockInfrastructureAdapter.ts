import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { Subscriber, UniversalNetworkPort, UESession, NetworkMetrics, AttachOptions } from '@unuko/core';
import { CONFIG } from '../config/config.js';

export class MockSdmAdapter {
  private filePath = path.join(CONFIG.PATHS.DATA_DIR, 'mock-subscribers.json');

  private read(): Subscriber[] {
    try {
      if (!fs.existsSync(this.filePath)) {
        return [];
      }
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  private write(data: Subscriber[]) {
    try {
      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('[MockSdmAdapter] Failed to write mock subscribers:', e);
    }
  }

  async findAll(): Promise<Subscriber[]> {
    return this.read();
  }

  async findById(imsi: string): Promise<Subscriber | undefined> {
    const subs = this.read();
    return subs.find(s => s.imsi === imsi);
  }

  async upsert(subscriber: Subscriber): Promise<void> {
    const subs = this.read();
    const idx = subs.findIndex(s => s.imsi === subscriber.imsi);
    
    const normalizedSub: Subscriber = {
      imsi: subscriber.imsi,
      k: (subscriber.k || '').replace(/\s+/g, ''),
      opc: (subscriber.opc || '').replace(/\s+/g, ''),
      opType: subscriber.opType || 'OPC',
      amf: subscriber.amf || '8000',
      slices: subscriber.slices || []
    };

    if (idx !== -1) {
      subs[idx] = normalizedSub;
    } else {
      subs.push(normalizedSub);
    }
    this.write(subs);
  }

  async delete(imsi: string): Promise<void> {
    const subs = this.read();
    const filtered = subs.filter(s => s.imsi !== imsi);
    this.write(filtered);
  }

  async clearAll(): Promise<void> {
    this.write([]);
  }
}

export class MockUeransimController {
  private filePath = path.join(CONFIG.PATHS.DATA_DIR, 'mock-devices.json');

  private read(): any[] {
    try {
      if (!fs.existsSync(this.filePath)) {
        return [];
      }
      return JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
    } catch (e) {
      return [];
    }
  }

  private write(data: any[]) {
    try {
      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('[MockUeransimController] Failed to write mock devices:', e);
    }
  }

  async init() {
    fs.mkdirSync(CONFIG.PATHS.DATA_DIR, { recursive: true });
  }

  async getDevices() {
    return this.read();
  }

  async startGNB(config: any, runProcess: boolean = true) {
    const devices = this.read();
    const id = `gnb-${config.nci}`;
    const idx = devices.findIndex(d => d.id === id);

    const device = {
      id,
      type: 'GNB',
      status: runProcess ? 'RUNNING' : 'STOPPED',
      connected: runProcess ? true : false,
      mcc: config.mcc || '999',
      mnc: config.mnc || '70',
      config
    };

    if (idx !== -1) {
      devices[idx] = device;
    } else {
      devices.push(device);
    }
    this.write(devices);
    return device;
  }

  async startUE(config: any, runProcess: boolean = true) {
    const devices = this.read();
    const id = config.supi;
    const idx = devices.findIndex(d => d.id === id);

    const device = {
      id,
      type: 'UE',
      status: runProcess ? 'RUNNING' : 'STOPPED',
      connected: runProcess ? true : false,
      ip: runProcess ? `10.45.0.${Math.floor(Math.random() * 253) + 2}` : undefined,
      config
    };

    if (idx !== -1) {
      devices[idx] = device;
    } else {
      devices.push(device);
    }
    this.write(devices);
    return device;
  }

  async updateUE(imsi: string, config: any) {
    return this.startUE(config, false);
  }

  async updateGNB(nci: string, config: any) {
    return this.startGNB(config, false);
  }

  async stopDevice(id: string) {
    const devices = this.read();
    const device = devices.find(d => d.id === id);
    if (device) {
      device.status = 'STOPPED';
      device.connected = false;
      device.ip = undefined;
      this.write(devices);
    }
  }

  async removeDevice(id: string) {
    const devices = this.read();
    const filtered = devices.filter(d => d.id !== id);
    this.write(filtered);
  }

  async stopAll() {
    const devices = this.read();
    devices.forEach(d => {
      d.status = 'STOPPED';
      d.connected = false;
      d.ip = undefined;
    });
    this.write(devices);
  }

  async removeAllDevices() {
    this.write([]);
  }

  async getLogs(id: string, lines: number = 100): Promise<string> {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    if (id.startsWith('gnb-')) {
      return `[${timestamp}.100] [gnb] [info] UERANSIM gNodeB started (Mocked)
[${timestamp}.150] [gnb] [info] Connecting to AMF at 127.0.0.5:38412
[${timestamp}.200] [gnb] [info] SCTP connection established
[${timestamp}.250] [gnb] [info] NG Setup successful
[${timestamp}.300] [gnb] [info] Cell [1] configured with TAC: 1`;
    } else {
      const imsi = id.replace('imsi-', '');
      return `[${timestamp}.100] [ue] [info] UERANSIM User Equipment started (IMSI: ${imsi}) (Mocked)
[${timestamp}.150] [ue] [info] Scanning cells...
[${timestamp}.200] [ue] [info] Selected Cell [1]
[${timestamp}.250] [ue] [info] Sending Registration Request
[${timestamp}.300] [ue] [info] Authentication Challenge received
[${timestamp}.350] [ue] [info] Authentication Response sent
[${timestamp}.400] [ue] [info] Security Mode Command received (Ciphering: EEA0, Integrity: EIA2)
[${timestamp}.450] [ue] [info] Registration Accept received
[${timestamp}.500] [ue] [info] PDU Session Establishment Request sent
[${timestamp}.550] [ue] [info] PDU Session Setup successful (IP: 10.45.0.3, Interface: uesimtun0)
[${timestamp}.600] [ue] [info] RRC Connection Connected`;
    }
  }

  async getDeviceYaml(id: string): Promise<string> {
    const devices = this.read();
    const device = devices.find(d => d.id === id);
    if (!device) throw new Error('Device not found');
    return yaml.dump(device.config);
  }

  async saveDeviceYaml(id: string, yamlStr: string): Promise<void> {
    const config = yaml.load(yamlStr);
    const devices = this.read();
    const device = devices.find(d => d.id === id);
    if (!device) throw new Error('Device not found');
    device.config = config;
    this.write(devices);
  }
}

export class MockUeransimNetworkAdapter implements UniversalNetworkPort {
  public controller = new MockUeransimController();

  async provision(subscriber: Subscriber): Promise<void> {
    console.log(`[MOCK UERANSIM] Provisioning subscriber: ${subscriber.imsi}`);
  }

  async deprovision(imsi: string): Promise<void> {
    console.log(`[MOCK UERANSIM] Deprovisioning subscriber: ${imsi}`);
  }

  async attachUE(imsi: string, options?: AttachOptions): Promise<UESession> {
    const id = `imsi-${imsi}`;
    const ueConfig = {
      supi: id,
      mcc: '999',
      mnc: '70',
      key: '465B5CE8B199B49FAA5F0A2EE238A6BC',
      opType: 'OPC',
      op: 'E8ED289DEBA952E4283B54E88E6183CA',
      amf: '8000',
      imei: '356938035643803',
      imeiSv: '4370816125816151',
      gnbSearchList: [options?.gnbAddress || '127.0.0.1'],
      sessions: [{ type: 'IPv4', apn: options?.apn || 'internet', slice: { sst: 1 } }],
      configuredNssai: [{ sst: 1 }],
      defaultNssai: [{ sst: 1 }]
    };
    
    await this.controller.startUE(ueConfig, true);
    
    return {
      sessionId: `session-${imsi}`,
      imsi,
      status: 'CONNECTED',
      ipAddress: '10.45.0.2'
    };
  }

  async detachUE(imsi: string): Promise<void> {
    await this.controller.stopDevice(`imsi-${imsi}`);
  }

  async getMetrics(imsi: string): Promise<NetworkMetrics> {
    return {
      sessionId: `session-${imsi}`,
      timestamp: Date.now(),
      uplinkBytes: 0,
      downlinkBytes: 0,
      rrcState: 'CONNECTED'
    };
  }

  async getSessions(): Promise<UESession[]> {
    const devices = await this.controller.getDevices();
    return devices
      .filter(d => d.type === 'UE' && d.status === 'RUNNING')
      .map(d => ({
        sessionId: `session-${d.id.replace('imsi-', '')}`,
        imsi: d.id.replace('imsi-', ''),
        status: 'CONNECTED',
        ipAddress: d.ip || '10.45.0.2'
      }));
  }
}
