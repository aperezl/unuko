# DISEÑO TÉCNICO: Interfaz del Panel de Simulación y Dashboard (apps/sim-frontend/dashboard-ui)
**Fecha:** 2026-05-25 18:47:00

## 1. Mapeo de Conceptos (Business to Tech)
| Concepto Negocio | Implementación Técnica | Validación |
| :--- | :--- | :--- |
| Interacciones de Control | `handleStartVM` / `handleStopVM` / `handleStartWorkflow` | Controlado por el estado de componentes React y peticiones API |
| Configuración YAML | `MonacoEditor` editor value (string) | Parseo dinámico e inspección sintáctica con Zod y parser YAML |
| Indicadores de Estado | `status` (colores e iconos mapeados a estados de la VM) | Unión de tipos: `'Running' | 'Stopped' | 'Starting' | 'Stopping'` |

## 2. Contratos de Interfaz (API)
La aplicación frontend consume los endpoints de `sim-backend` (que responden bajo el esquema `{ data, error, meta }`).

- **Sondeo (Polling):** Ejecutado en segundo plano cada 5000ms hacia `/v1/orchestrator/vms` y `/v1/orchestrator/services/status`.
- **Acciones Directas:** POST `/v1/orchestrator/vms/:name/start`, POST `/v1/orchestrator/vms/:name/stop`, y POST `/v1/orchestrator/session`.

## 3. Modelo de Datos y Persistencia
- **Estado Local de React (Context/Store):** Mantiene el estado activo del entorno (`lima` vs `mock`), lista de VMs, lista de servicios, e información del workflow activo.

## 4. Arquitectura de Componentes (Hexagonal)
| Componente | Capa | Ruta Sugerida |
| :--- | :--- | :--- |
| **Componentes de UI (VMCard, ServiceRow)** | Componentes | `apps/sim-frontend/src/components/` |
| **Editor Monaco** | Componentes | `apps/sim-frontend/src/components/Editor/` |
| **Dashboard Page** | Vistas / Páginas | `apps/sim-frontend/src/pages/Dashboard.tsx` |

## 5. Estrategia de Testing (Technical Red Phase)
- **[TEST-01] Interfaz:** Probar la renderización de la tarjeta de VM según sus diferentes estados físicos (colores e iconos correspondientes).
- **[TEST-02] UI / Integración:** Probar el comportamiento optimista: al hacer clic en encender, cambiar inmediatamente el botón y estado a "Starting" de manera local antes de la confirmación asíncrona.
- **[TEST-03] Robustez:** Verificar que el editor Monaco muestra y bloquea el envío de configuraciones que no pasan el esquema de validación Zod del frontend.

---
**CONSTITUCIÓN:** Implementado utilizando React, Vite, Tailwind CSS v4, y Monaco Editor.
