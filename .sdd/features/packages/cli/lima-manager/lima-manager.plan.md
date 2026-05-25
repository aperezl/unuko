# DISEÑO TÉCNICO: Control de Entorno de Virtualización Lima (packages/cli/lima-manager)
**Fecha:** 2026-05-25 18:43:00

## 1. Mapeo de Conceptos (Business to Tech)
| Concepto Negocio | Implementación Técnica | Validación |
| :--- | :--- | :--- |
| Instancia Virtual | `VMInfo` (interfaz) | Esquema Zod para parser de salida JSON de `limactl` |
| Estado Físico | `status` (string: 'Running' \| 'Stopped' \| 'Broken') | Esquema Zod: `z.enum(['Running', 'Stopped', 'Broken', 'Unknown'])` |
| Estado de Salud de Servicios | `ServiceStatusInfo` (interfaz) | Esquema Zod: `z.object({ name: z.string(), status: z.string() })` |

## 2. Contratos de Interfaz (API)
Este módulo se ejecuta directamente sobre el sistema operativo mediante comandos de consola a través de NodeJS `child_process` (`execSync` / `exec`).

- **Comandos de Consola Utilizados:**
  - Comprobación: `command -v limactl`
  - Listado: `limactl list --format=json`
  - Control de VM: `limactl start <name> --tty=false` y `limactl stop <name>`
  - Ejecución Interna: `limactl shell <name> bash -c '<command>'`
  - Control de Servicios: `systemctl is-active <service>` y `sudo systemctl <action> <service>`

## 3. Modelo de Datos y Persistencia
No requiere persistencia en base de datos. Los estados se leen en tiempo real directamente de la salida estándar (stdout) de los comandos del sistema.

## 4. Arquitectura de Componentes (Hexagonal)
| Componente | Capa | Ruta Sugerida |
| :--- | :--- | :--- |
| **Clase Controladora (LimaManager)** | Infraestructura | `packages/cli/src/LimaManager.ts` |
| **Punto de Entrada del Paquete** | Infraestructura | `packages/cli/src/index.ts` |

## 5. Estrategia de Testing (Technical Red Phase)
- **[TEST-01] Integración:** Probar la ejecución de comandos `limactl` simulando salidas JSON controladas.
- **[TEST-02] Integración:** Validar que los métodos de inicio y parada de VMs capturan y propagan los errores del sistema operativo huéspedes.
- **[TEST-03] Robustez:** Asegurar que la función `executeCommand` maneja correctamente el escape de caracteres especiales (comillas simples, barras diagonales).

---
**CONSTITUCIÓN:** El componente interactúa con el sistema mediante scripts locales NodeJS ejecutados de forma controlada.
