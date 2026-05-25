# DISEÑO TÉCNICO: API de Orquestación de Simulación (apps/sim-backend/orchestrator-api)
**Fecha:** 2026-05-25 18:45:00

## 1. Mapeo de Conceptos (Business to Tech)
| Concepto Negocio | Implementación Técnica | Validación |
| :--- | :--- | :--- |
| Entorno de Simulación | `environment` ('mock' \| 'lima') | Esquema Zod: `z.enum(['mock', 'lima'])` |
| Creación de Sesión | `sessionId` y `workflow` (string) | Esquema Zod: `createSessionSchema` |
| Respuesta Unificada | Estructura `{ data, error, meta }` | Validación en el controlador de Fastify |

## 2. Contratos de Interfaz (API)
*Nota: Todas las respuestas de Fastify siguen estrictamente el estándar de tipado Zod y respuesta unificada.*

### Endpoints Principales:
- **POST `/v1/orchestrator/environment`**
  - **Body:** `{ "environment": "lima"|"mock" }`
  - **Response 200:** `{ "data": { "environment": "lima" }, "error": null, "meta": {} }`
- **POST `/v1/orchestrator/session`**
  - **Body:** `{ "workflow": "sgp22-provisioning" }`
  - **Response 200:** `{ "data": { "sessionId": "string", "workflow": "string", "url": "string" }, "error": null, "meta": {} }`
- **GET `/v1/orchestrator/session/:id`**
  - **Response 200:** `{ "data": { "sessionId": "string", "status": "string", "progress": 85, "logs": [...] }, "error": null, "meta": {} }`

## 3. Modelo de Datos y Persistencia
- **Colección de Sesiones:** `simulation_sessions` (almacenada en MongoDB, puerto 27017).
- **Colección de Logs de Auditoría:** `audit_logs` (vinculada con `sessionId`).

## 4. Arquitectura de Componentes (Hexagonal)
| Componente | Capa | Ruta Sugerida |
| :--- | :--- | :--- |
| **Definición de Esquemas** | Aplicación | `apps/sim-backend/src/domain/schemas/orchestrator.schema.ts` |
| **Controlador Fastify** | Infraestructura | `apps/sim-backend/src/infrastructure/http/controllers/OrchestratorController.ts` |
| **Rutas Fastify** | Infraestructura | `apps/sim-backend/src/infrastructure/http/routes/orchestrator.routes.ts` |

## 5. Estrategia de Testing (Technical Red Phase)
- **[TEST-01] Integración:** Probar la creación de sesión HTTP utilizando supertest contra el servidor Fastify.
- **[TEST-02] Integración:** Verificar que el cambio de entorno a "lima" actualiza correctamente la persistencia y bloquea accesos no autorizados.
- **[TEST-03] Robustez:** Asegurar que las validaciones de Zod interceptan cuerpos de petición incorrectos y devuelven código `400 Bad Request`.

---
**CONSTITUCIÓN:** El backend se implementa sobre NodeJS y Fastify con validación estricta Zod en la frontera.
