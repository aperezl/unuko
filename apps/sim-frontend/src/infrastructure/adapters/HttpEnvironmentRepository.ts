import { EnvironmentRepository } from '../../core/ports/EnvironmentRepository';
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
}

export const environmentRepository = new HttpEnvironmentRepository();
