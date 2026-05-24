export interface IUseCase<Input, Output> {
  execute(input: Input): Promise<Output>;
}

export class ApplicationService implements IUseCase<any, any> {
  constructor(
    // Inyectar puertos/repositorios
  ) {}

  async execute(input: any): Promise<any> {
    // 1. Validar reglas de negocio
    // 2. Coordinar entidades de dominio
    // 3. Persistir cambios
    // 4. Devolver resultado
    return {};
  }
}
