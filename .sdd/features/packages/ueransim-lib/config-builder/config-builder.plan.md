# DISEÑO TÉCNICO: Generador de Configuración de Terminales y Radio (packages/ueransim-lib/config-builder)
**Fecha:** 2026-05-25 18:44:00

## 1. Mapeo de Conceptos (Business to Tech)
| Concepto Negocio | Implementación Técnica | Validación |
| :--- | :--- | :--- |
| Configuración de Terminal | `UEConfig` (interface) | Esquema Zod de validación de UE |
| Configuración de Antena | `GNBConfig` (interface) | Esquema Zod de validación de gNB |
| Rebanada de Red (Slice) | `sst` (number) y `sd` (hex string) | Esquema Zod: `sst: z.number().int()`, `sd: z.string().optional()` |

## 2. Contratos de Interfaz (API)
El generador provee métodos estáticos y asíncronos para construir ficheros en formato estructurado YAML:

- **Firma del Método UE:** `UeransimConfigBuilder.buildUE(config: UEConfig): string`
- **Firma del Método gNodeB:** `UeransimConfigBuilder.buildGNB(config: GNBConfig): string`

## 3. Modelo de Datos y Persistencia
No persiste información. Convierte tipos TypeScript fuertemente tipados a cadenas formateadas YAML de manera determinista.

## 4. Arquitectura de Componentes (Hexagonal)
| Componente | Capa | Ruta Sugerida |
| :--- | :--- | :--- |
| **Clase Generadora (UeransimConfigBuilder)** | Aplicación | `packages/ueransim-lib/src/config/UeransimConfigBuilder.ts` |
| **Exportación del Módulo** | Infraestructura | `packages/ueransim-lib/src/index.ts` |

## 5. Estrategia de Testing (Technical Red Phase)
- **[TEST-01] Dominio:** Probar que el método `buildUE` escapa y formatea correctamente las claves criptográficas (eliminando espacios).
- **[TEST-02] Dominio:** Verificar que la rebanada de red añade el prefijo hexadecimal `0x` automáticamente si el diferenciador (SD) se ingresa como texto plano.
- **[TEST-03] Validación:** Asegurar que los códigos de país y red (mcc/mnc) se renderizan siempre como cadenas de texto con comillas para preservar ceros a la izquierda (ej: `'01'`).

---
**CONSTITUCIÓN:** El generador utiliza la biblioteca `js-yaml` o interpolación controlada y es agnóstico a la base de datos o APIs.
