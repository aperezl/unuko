# DISEÑO TÉCNICO: Core Setup (Inicialización del Entorno de Simulación)
**Fecha:** 2026-05-25 18:41:00

## 1. Mapeo de Conceptos (Business to Tech)
| Concepto Negocio | Implementación Técnica | Validación |
| :--- | :--- | :--- |
| Comando de Red | `CommandString` ('create' \| 'start' \| 'stop' \| 'audit') | Esquema Zod: `z.enum(['create', 'start', 'stop', 'audit'])` |
| Identificador de Red | `networkId` (string) | Esquema Zod: `z.string().min(1)` |
| Archivo de Workflow | `workflowPath` (string/ruta) | Esquema Zod: `z.string().optional()` |

## 2. Contratos de Interfaz (API)
*Nota: Todas las respuestas siguen estrictamente la Regla 1 de la Constitución: validación con Zod y tipado fuerte.*

Este componente se invoca principalmente a través del CLI (`sim-cli`) y los scripts de ciclo de vida del backend.

## 3. Modelo de Datos y Persistencia
- **Colección de Configuración Semilla:** `simulation_seeds` (almacenada en MongoDB, puerto 27017).
- **Esquema:**
  ```json
  {
    "networkId": "string",
    "status": "string",
    "createdAt": "date",
    "updatedAt": "date"
  }
  ```

## 4. Arquitectura de Componentes (Hexagonal)
| Componente | Capa | Ruta Sugerida |
| :--- | :--- | :--- |
| **Dominio de Inicialización** | Dominio | `packages/core/src/domain/models/network.types.ts` |
| **Servicio de Configuración** | Aplicación | `packages/core/src/application/use-cases/base/engine.ts` |
| **Manejador CLI** | Infraestructura | `apps/sim-cli/src/index.ts` |

## 5. Estrategia de Testing (Technical Red Phase)
- **[TEST-01] Dominio:** Probar que el motor inicializa con variables de entorno correctas.
- **[TEST-02] Aplicación:** Verificar que el caso de uso `core-setup` inicializa correctamente las dependencias de red de la VM.
- **[TEST-03] Infraestructura:** Comprobar que los scripts de arranque local levantan la base de datos MongoDB y las variables de puerto.

---
**CONSTITUCIÓN:** Este diseño sigue estrictamente el stack Node.js + Fastify + MongoDB + Zod y las directivas del monorepo.
