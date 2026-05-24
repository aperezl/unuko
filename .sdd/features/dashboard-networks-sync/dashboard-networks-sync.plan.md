# DISEÑO TÉCNICO: Sincronización y Control de Entornos de Red en el Dashboard
**Fecha:** 2026-05-24 15:10:00

## 1. Mapeo de Conceptos (Business to Tech)
| Concepto Negocio | Implementación Técnica | Validación |
| :--- | :--- | :--- |
| Entorno de Red / VM | `VMInfo` (Interface en CLI y Backend) | Esquema Zod `vmInfoSchema` |
| Estado de Actividad | `VMStatus: 'Running' \| 'Stopped' \| 'Starting' \| 'Stopping'` | Zod enum |
| Cambio de VM Activa | `activeVm` (persiste en `environment.json`) | Esquema Zod `switchActiveVmSchema` |

## 2. Contratos de Interfaz (API)
*Nota: Todas las respuestas siguen estrictamente la Regla 3 de la Constitución: `{ data, error, meta }` o el formato existente.*

### Endpoint: `GET /v1/orchestrator/vms`
- **Path/Query Params:** Ninguno
- **Responses:**
  - `200 OK`:
    ```json
    {
      "activeVm": "core5g",
      "vms": [
        { "name": "5g", "status": "Stopped", "cpus": 4, "memory": "4GiB", "sshLocalPort": 64799 },
        { "name": "core5g", "status": "Running", "cpus": 4, "memory": "4GiB", "sshLocalPort": 50473 }
      ]
    }
    ```

### Endpoint: `POST /v1/orchestrator/vms/active`
- **Request Body:**
  ```json
  { "activeVm": "5g-dev" }
  ```
- **Responses:**
  - `200 OK`: `{ "activeVm": "5g-dev" }`
  - `400 Bad Request`: `{ "error": "Invalid VM name" }`

### Endpoint: `POST /v1/orchestrator/vms/:name/start`
- **Path Params:** `name` (Nombre de la VM)
- **Responses:**
  - `200 OK`: `{ "status": "starting" }`

### Endpoint: `POST /v1/orchestrator/vms/:name/stop`
- **Path Params:** `name` (Nombre de la VM)
- **Responses:**
  - `200 OK`: `{ "status": "stopping" }`

## 3. Modelo de Datos y Persistencia
No requiere tablas SQL adicionales. El estado de la VM activa se persistirá en el archivo existente `environment.json` añadiendo la propiedad `activeVm`:
```json
{
  "environment": "lima",
  "activeVm": "core5g"
}
```

## 4. Arquitectura de Componentes (Hexagonal / Clean Architecture)
| Componente | Capa | Ruta Sugerida |
| :--- | :--- | :--- |
| **Adaptadores de Dominio** | Dominio/DI | [DependencyContainer.ts](file:///Users/aperezl/mio/telcom/unuko-rsp/apps/sim-backend/src/infrastructure/di/DependencyContainer.ts) |
| **Servicio de VM** | Aplicación | [EnvironmentUseCase.ts](file:///Users/aperezl/mio/telcom/unuko-rsp/apps/sim-backend/src/application/use-cases/EnvironmentUseCase.ts) |
| **Controlador HTTP** | Infraestructura | [OrchestratorController.ts](file:///Users/aperezl/mio/telcom/unuko-rsp/apps/sim-backend/src/infrastructure/http/controllers/OrchestratorController.ts) |
| **Rutas HTTP** | Infraestructura | [orchestrator.routes.ts](file:///Users/aperezl/mio/telcom/unuko-rsp/apps/sim-backend/src/infrastructure/http/routes/orchestrator.routes.ts) |
| **Adaptador Cliente API** | Frontend Infra | [HttpEnvironmentRepository.ts](file:///Users/aperezl/mio/telcom/unuko-rsp/apps/sim-frontend/src/infrastructure/adapters/HttpEnvironmentRepository.ts) |
| **Layout Visual (Header)** | Frontend Vista | [DashboardLayout.tsx](file:///Users/aperezl/mio/telcom/unuko-rsp/apps/sim-frontend/src/ui/templates/DashboardLayout.tsx) |

## 5. Estrategia de Testing (Technical Red Phase)
- **[TEST-01] Aplicación:** Verificar que `EnvironmentUseCase.getVms()` invoca correctamente a `limaManager.listInstances()` y retorna la estructura adecuada.
- **[TEST-02] Aplicación:** Verificar que al cambiar la VM activa con `setActiveVm(name)`, el `DependencyContainer` se actualiza y recrea `Open5gsSdmAdapter` y `UeransimNetworkAdapter` apuntando a la nueva máquina virtual.
- **[TEST-03] Infraestructura:** Validar que los endpoints `GET /v1/orchestrator/vms` y `POST /v1/orchestrator/vms/active` respondan con los esquemas correctos.
- **[TEST-04] Frontend:** Verificar que el header renderice el desplegable de VMs, mostrando el estado en tiempo real (activo/inactivo) y reaccionando a los clics.

---
**CONSTITUCIÓN:** Este diseño sigue estrictamente el stack Node.js + Fastify + React + Tailwind v4 y respeta las leyes de soberanía de validación Zod y unificación de capas.
