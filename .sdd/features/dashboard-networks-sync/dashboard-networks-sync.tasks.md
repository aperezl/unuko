# PLAN DE EJECUCIÓN (TASKS): Sincronización y Control de Entornos de Red en el Dashboard
**Fecha:** 2026-05-24 15:12:00

## 1. Hoja de Ruta (Milestones)
- [ ] Fase 1: Cimentación (Data & Types)
- [ ] Fase 2: Lógica de Negocio (TDD - Services)
- [ ] Fase 3: Exposición e Infraestructura (API & Frontend)

## 2. Desglose de Tareas Atómicas

### Bloque A: Cimentación
- [ ] **TASK-A1:** Modificar [DependencyContainer.ts](file:///Users/aperezl/mio/telcom/unuko-rsp/apps/sim-backend/src/infrastructure/di/DependencyContainer.ts) para almacenar la propiedad `activeVmName` (por defecto `'core5g'`) y cargarla/guardarla en `environment.json`. Añadir los métodos `getActiveVm()` y `setActiveVm(name)` que re-inicializa `Open5gsSdmAdapter` y `UeransimNetworkAdapter` con el nuevo nombre.
- [ ] **TASK-A2:** Definir esquemas Zod en backend para validar las entradas de la API relacionadas con la selección de la VM activa y los datos de respuesta.

### Bloque B: Lógica de Negocio (TDD)
- [ ] **TASK-B1:** Modificar [ServiceUseCase.ts](file:///Users/aperezl/mio/telcom/unuko-rsp/apps/sim-backend/src/application/use-cases/ServiceUseCase.ts) sustituyendo el valor estático `'core5g'` por la llamada dinámica `container.getActiveVm()`.
- [ ] **TASK-B2:** Modificar [EnvironmentUseCase.ts](file:///Users/aperezl/mio/telcom/unuko-rsp/apps/sim-backend/src/application/use-cases/EnvironmentUseCase.ts) implementando `getVms()`, `setActiveVm(name)`, y los métodos de control asíncrono no bloqueantes `startVm(name)` y `stopVm(name)` utilizando `child_process.exec`.
- [ ] **TASK-B3:** Escribir tests unitarios en `EnvironmentUseCase.spec.ts` y `DependencyContainer.spec.ts` para validar el cambio dinámico y el listado de VMs.

### Bloque C: Exposición e Infraestructura
- [ ] **TASK-C1:** Implementar rutas y handlers en `orchestrator.routes.ts` y `OrchestratorController.ts` exponiendo los endpoints `GET /v1/orchestrator/vms`, `POST /v1/orchestrator/vms/active`, y `POST /v1/orchestrator/vms/:name/(start|stop)`.
- [ ] **TASK-C2:** Modificar [HttpEnvironmentRepository.ts](file:///Users/aperezl/mio/telcom/unuko-rsp/apps/sim-frontend/src/infrastructure/adapters/HttpEnvironmentRepository.ts) en el frontend implementando el mapeo a los nuevos endpoints de las VMs.
- [ ] **TASK-C3:** Modificar [DashboardLayout.tsx](file:///Users/aperezl/mio/telcom/unuko-rsp/apps/sim-frontend/src/ui/templates/DashboardLayout.tsx) para sustituir el botón simple de "LIMA (5G)" por un selector interactivo que muestre el listado de VMs reales, sus estados (verde/rojo/amarillo), permita encenderlas/apagarlas de forma visual y establecer la VM activa con animaciones fluidas de hover/transiciones.
- [ ] **TASK-C4:** Ejecutar la suite completa de pruebas unitarias (`pnpm test`) y verificar el correcto empaquetamiento monorepo (`pnpm build`).

## 3. Definición de Hecho (DoD)
- [ ] Tests pasan al 100%.
- [ ] Cero errores de Lint y TSC.
- [ ] El dashboard de simulación responde visualmente a los cambios de estado en tiempo real.
- [ ] Los recursos de la máquina virtual se inician y detienen asíncronamente sin congelar el backend.
