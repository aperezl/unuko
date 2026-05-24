import net from 'net';
import fs from 'fs';
import { CONFIG } from '../../config/config.js';
import { container } from '../../infrastructure/di/DependencyContainer.js';
import { limaManager } from '@unuko/cli';

export type ServiceEntry = {
  name: string;
  serviceName?: string;
  type: string;
  port: number | null;
  host: string;
  forwardedPort?: number;
  status: string;
  description: string;
};

export class ServiceUseCase {
  private checkPort(port: number, host: string = '127.0.0.1'): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let status = false;
      socket.setTimeout(800);
      socket.on('connect', () => { status = true; socket.destroy(); });
      socket.on('timeout', () => socket.destroy());
      socket.on('error', () => socket.destroy());
      socket.on('close', () => resolve(status));
      socket.connect(port, host);
    });
  }

  async getServicesStatus(): Promise<ServiceEntry[]> {
    const currentEnvironment = container.getEnvironment();
    const coreServices = CONFIG.SERVICES.CORE_TOPOLOGY;

    if (currentEnvironment === 'lima') {
      const mongoOnline = await this.checkPort(27017);
      const webUiOnline = await this.checkPort(9999);
      const smdpOnline = await this.checkPort(8081);

      let systemctlStatuses: string[] = [];
      try {
        const richStatus = limaManager.getRichStatus(container.getActiveVm());
        const serviceNames = coreServices.map(s => s.name);
        systemctlStatuses = serviceNames.map(name => {
          const found = richStatus.services.find(s => s.name === name);
          return found ? found.status : 'inactive';
        });
      } catch (e: any) {
        systemctlStatuses = coreServices.map(() => 'inactive');
      }

      const servicesList: ServiceEntry[] = [
        {
          name: 'MongoDB',
          type: 'Database',
          port: 27017,
          host: '127.0.0.1',
          status: mongoOnline ? 'online' : 'offline',
          description: 'Open5GS subscriber database'
        },
        {
          name: 'Open5GS WebUI',
          type: 'Web Portal',
          port: 3000,
          forwardedPort: 9999,
          host: '127.0.0.1',
          status: webUiOnline ? 'online' : 'offline',
          description: 'Core network management portal'
        },
        {
          name: 'Osmocom SM-DP+',
          type: 'RSP Server',
          port: 8080,
          forwardedPort: 8081,
          host: '127.0.0.1',
          status: smdpOnline ? 'online' : 'offline',
          description: 'Subscription Manager Data Preparation server'
        }
      ];

      coreServices.forEach((svc, idx) => {
        const isOnline = systemctlStatuses[idx] === 'active';
        servicesList.push({
          name: svc.label,
          serviceName: svc.name,
          type: '5G Core Service',
          port: svc.port,
          host: svc.ip,
          status: isOnline ? 'online' : 'offline',
          description: svc.desc
        });
      });

      return servicesList;
    } else {
      const smdpOnline = await this.checkPort(8080);
      const dbWritable = fs.existsSync(CONFIG.PATHS.MOCK_PERSISTENCE_DIR);

      const servicesList: ServiceEntry[] = [
        {
          name: 'Mock SM-DP+ Server',
          type: 'RSP Server',
          port: 8080,
          host: '127.0.0.1',
          status: smdpOnline ? 'online' : 'offline',
          description: 'Simulated SM-DP+ subscription profile server'
        },
        {
          name: 'Mock Database (JSON)',
          type: 'Database',
          port: null,
          host: 'Local',
          status: dbWritable ? 'online' : 'offline',
          description: 'Local flat-file json storage for mock subscriber profiles'
        }
      ];

      coreServices.forEach(svc => {
        servicesList.push({
          name: `Mock ${svc.label}`,
          serviceName: svc.name,
          type: '5G Core Service',
          port: svc.port,
          host: 'Local',
          status: 'online',
          description: `Simulated ${svc.desc}`
        });
      });

      return servicesList;
    }
  }

  async toggleServiceState(name: string, action: 'start' | 'stop') {
    const currentEnvironment = container.getEnvironment();

    if (currentEnvironment !== 'lima') {
      return { status: action === 'start' ? 'active' : 'inactive' };
    }

    const newStatus = limaManager.toggleService(container.getActiveVm(), name, action);
    return { status: newStatus };
  }
}

export const serviceUseCase = new ServiceUseCase();
