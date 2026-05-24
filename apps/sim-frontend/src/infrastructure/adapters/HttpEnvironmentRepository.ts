import { EnvironmentRepository, VMData } from '../../core/ports/EnvironmentRepository';
import { APP_CONFIG } from '../config/app.config';

export class HttpEnvironmentRepository implements EnvironmentRepository {
  async getEnvironment(): Promise<'mock' | 'lima'> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.ENVIRONMENT);
    if (!response.ok) throw new Error('Failed to fetch environment');
    const data = await response.json();
    return data.environment || 'mock';
  }

  async setEnvironment(environment: 'mock' | 'lima'): Promise<any> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.ENVIRONMENT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ environment })
    });
    if (!response.ok) throw new Error('Failed to update environment');
    return response.json();
  }

  async getVms(): Promise<VMData> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.VMS);
    if (!response.ok) throw new Error('Failed to fetch VMs');
    return response.json();
  }

  async setActiveVm(activeVm: string): Promise<any> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.ACTIVE_VM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activeVm })
    });
    if (!response.ok) throw new Error('Failed to update active VM');
    return response.json();
  }

  async startVm(name: string): Promise<any> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.START_VM(name), {
      method: 'POST'
    });
    if (!response.ok) throw new Error(`Failed to start VM ${name}`);
    return response.json();
  }

  async stopVm(name: string): Promise<any> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.STOP_VM(name), {
      method: 'POST'
    });
    if (!response.ok) throw new Error(`Failed to stop VM ${name}`);
    return response.json();
  }
}

export const environmentRepository = new HttpEnvironmentRepository();

