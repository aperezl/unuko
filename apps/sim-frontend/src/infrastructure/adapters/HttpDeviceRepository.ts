import { DeviceRepository } from '../../core/ports/DeviceRepository';
import { Device } from '../../core/domain/device.types';
import { APP_CONFIG } from '../config/app.config';

export class HttpDeviceRepository implements DeviceRepository {
  async getDevices(): Promise<Device[]> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.DEVICES);
    if (!response.ok) throw new Error('Failed to fetch devices');
    return response.json();
  }

  async clearAllDevices(): Promise<any> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.DEVICES, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to clear devices');
    return response.json();
  }

  async provisionAll(): Promise<any> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.PROVISION_ALL, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to provision devices');
    return response.json();
  }

  async attachUE(imsi: string, gnbAddress?: string): Promise<any> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.UE_PROVISION, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imsi, gnbAddress })
    });
    if (!response.ok) throw new Error('Failed to attach UE');
    return response.json();
  }

  async updateUE(imsi: string, config: any): Promise<any> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.UE_PROVISION_DETAIL(imsi), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (!response.ok) throw new Error('Failed to update UE');
    return response.json();
  }

  async startGNB(config: any): Promise<any> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.GNB_PROVISION, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (!response.ok) throw new Error('Failed to start gNodeB');
    return response.json();
  }

  async updateGNB(nci: string, config: any): Promise<any> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.GNB_PROVISION_DETAIL(nci), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (!response.ok) throw new Error('Failed to update gNodeB');
    return response.json();
  }

  async stopDevice(id: string): Promise<any> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.DEVICE_STOP(id), { method: 'POST' });
    if (!response.ok) throw new Error('Failed to stop device');
    return response.json();
  }

  async removeDevice(id: string): Promise<any> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.DEVICE_DETAIL(id), { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to remove device');
    return response.json();
  }

  async startDevice(id: string): Promise<any> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.DEVICE_START(id), { method: 'POST' });
    if (!response.ok) throw new Error('Failed to start device');
    return response.json();
  }

  async getDeviceLogs(id: string): Promise<string> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.DEVICE_LOGS(id));
    if (!response.ok) throw new Error('Failed to retrieve logs');
    const data = await response.json();
    return Array.isArray(data.logs) ? data.logs.join('\n') : (data.logs || '');
  }

  async getDeviceYaml(id: string): Promise<string> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.DEVICE_CONFIG(id));
    if (!response.ok) throw new Error('Failed to retrieve config');
    const data = await response.json();
    return data.yaml || '';
  }

  async saveDeviceYaml(id: string, yaml: string): Promise<any> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.DEVICE_CONFIG(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ yaml })
    });
    if (!response.ok) throw new Error('Failed to save config');
    return response.json();
  }
}

export const deviceRepository = new HttpDeviceRepository();
