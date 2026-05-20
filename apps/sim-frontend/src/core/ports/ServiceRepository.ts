import { ServiceStatus } from '../domain/service.types';

export interface ServiceRepository {
  getServicesStatus(): Promise<ServiceStatus[]>;
  toggleServiceState(name: string, action: 'start' | 'stop'): Promise<any>;
}
