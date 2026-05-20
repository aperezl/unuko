import { container } from '../../infrastructure/di/DependencyContainer.js';

export class EnvironmentUseCase {
  getEnvironment() {
    return { environment: container.getEnvironment() };
  }

  setEnvironment(environment: 'mock' | 'lima') {
    container.setEnvironment(environment);
    console.log(`[SYSTEM]: Switched active environment to: ${environment}`);
    return { environment };
  }
}

export const environmentUseCase = new EnvironmentUseCase();
