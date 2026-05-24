export interface VMInfo {
  name: string;
  status: string;
  cpus?: number;
  memory?: string;
  sshLocalPort?: number;
}

export interface VMData {
  activeVm: string;
  vms: VMInfo[];
}

export interface EnvironmentRepository {
  getEnvironment(): Promise<'mock' | 'lima'>;
  setEnvironment(environment: 'mock' | 'lima'): Promise<any>;
  getVms(): Promise<VMData>;
  setActiveVm(activeVm: string): Promise<any>;
  startVm(name: string): Promise<any>;
  stopVm(name: string): Promise<any>;
}

