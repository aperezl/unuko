import { ServiceRepository } from '../../core/ports/ServiceRepository';
import { ServiceStatus } from '../../core/domain/service.types';
import { APP_CONFIG } from '../config/app.config';

export class HttpServiceRepository implements ServiceRepository {
  async getServicesStatus(): Promise<ServiceStatus[]> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.SERVICES_STATUS);
    if (!response.ok) throw new Error('Failed to fetch services status');
    return response.json();
  }

  async toggleServiceState(name: string, action: 'start' | 'stop'): Promise<any> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.SERVICES_STATE(name), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    if (!response.ok) throw new Error(`Failed to change state of service ${name}`);
    return response.json();
  }
}

export const serviceRepository = new HttpServiceRepository();
