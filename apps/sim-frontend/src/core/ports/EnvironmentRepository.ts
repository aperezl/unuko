export interface EnvironmentRepository {
  getEnvironment(): Promise<'mock' | 'lima'>;
  setEnvironment(environment: 'mock' | 'lima'): Promise<any>;
}
