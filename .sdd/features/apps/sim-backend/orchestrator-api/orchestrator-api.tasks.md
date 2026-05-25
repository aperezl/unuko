# PLAN DE EJECUCIÓN (TASKS): API de Orquestación (apps/sim-backend/orchestrator-api)
**Fecha:** 2026-05-25 18:52:00

## 1. Hoja de Ruta (Milestones)
- [ ] Fase 1: Cimentación (Modelos de Sesiones y Validaciones Zod)
- [ ] Fase 2: Lógica de Negocio (Controladores de Orquestación)
- [ ] Fase 3: Exposición (Rutas Fastify y Respuestas Uniformes)

## 2. Desglose de Tareas Atómicas

### Bloque A: Cimentación
- [ ] **TASK-A1:** Implementar esquemas de validación Zod para los cuerpos de petición HTTP (cambio de entorno, inicio de sesión).
- [ ] **TASK-A2:** Configurar esquemas de base de datos en MongoDB para la colección de sesiones y auditorías.

### Bloque B: Lógica de Negocio (TDD)
- [ ] **TASK-B1:** Escribir pruebas unitarias simulando peticiones HTTP con supertest contra el servidor de pruebas Fastify.
- [ ] **TASK-B2:** Desarrollar los métodos del controlador `OrchestratorController` para gestionar el ciclo de vida de las sesiones y la lectura de logs en segundo plano.

### Bloque C: Exposición e Infraestructura
- [ ] **TASK-C1:** Registrar los endpoints HTTP en Fastify (`/v1/orchestrator/session`, `/v1/orchestrator/vms`).
- [ ] **TASK-C2:** Validar que todas las respuestas del backend siguen estrictamente la estructura `{ data, error, meta }`.

## 3. Definición de Hecho (DoD)
- [ ] Pruebas unitarias de endpoints y validaciones pasan al 100%.
- [ ] Swagger / OpenAPI integrado y con esquemas en verde.
