import { container } from '../../infrastructure/di/DependencyContainer.js';
import { limaManager } from '@unuko/cli';
import { exec } from 'child_process';

export class EnvironmentUseCase {
  getEnvironment() {
    return { environment: container.getEnvironment() };
  }

  setEnvironment(environment: 'mock' | 'lima') {
    container.setEnvironment(environment);
    console.log(`[SYSTEM]: Switched active environment to: ${environment}`);
    return { environment };
  }

  getVms() {
    const activeVm = container.getActiveVm();
    const vms = limaManager.listInstances().map(vm => ({
      name: vm.name,
      status: vm.status,
      cpus: vm.cpus,
      memory: vm.memory ? `${(vm.memory / (1024*1024*1024)).toFixed(0)}GiB` : undefined,
      sshLocalPort: vm.sshLocalPort
    }));
    return { activeVm, vms };
  }

  setActiveVm(activeVm: string) {
    container.setActiveVm(activeVm);
    console.log(`[SYSTEM]: Switched active VM to: ${activeVm}`);
    return { activeVm };
  }

  async startVm(name: string) {
    console.log(`[SYSTEM]: Starting VM "${name}" asynchronously...`);
    exec(`limactl start ${name} --tty=false`, (error) => {
      if (error) {
        console.error(`[SYSTEM]: Failed to start VM ${name}:`, error.message);
      } else {
        console.log(`[SYSTEM]: VM ${name} started successfully.`);
      }
    });
    return { status: 'starting' };
  }

  async stopVm(name: string) {
    console.log(`[SYSTEM]: Stopping VM "${name}" asynchronously...`);
    exec(`limactl stop ${name}`, (error) => {
      if (error) {
        console.error(`[SYSTEM]: Failed to stop VM ${name}:`, error.message);
      } else {
        console.log(`[SYSTEM]: VM ${name} stopped successfully.`);
      }
    });
    return { status: 'stopping' };
  }
}

export const environmentUseCase = new EnvironmentUseCase();

