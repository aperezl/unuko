# DISEÑO TÉCNICO: Aprovisionamiento Remoto de SIM (SGP.22)
**Fecha:** 2026-05-25 18:42:00

## 1. Mapeo de Conceptos (Business to Tech)
| Concepto Negocio | Implementación Técnica | Validación |
| :--- | :--- | :--- |
| Dirección SM-DP+ | `smdpAddress` (string) | Esquema Zod: `z.string().default('localhost')` |
| Desafío eUICC | `euiccChallenge` (base64 string) | Esquema Zod: `z.string().optional()` |
| Identificador Perfil | `iccid` (string) | Esquema Zod: `z.string().regex(/^[0-9]{19,20}$/)` |
| Acción de Ciclo de Vida | `action` ('enable' \| 'disable' \| 'delete') | Esquema Zod: `z.enum(['enable', 'disable', 'delete'])` |

## 2. Contratos de Interfaz (API)
Este flujo es orquestado internamente por el motor de estados de XState v5 en `packages/core`.

- **Workflow ID:** `sgp22-provisioning`
- **Estados Clave:**
  - `initializing` -> Llama a `ports.crypto.initialize` y `ports.hardware.reset`.
  - `authenticating` -> POST `/gsma/rsp2/es9plus/initiateAuthentication`.
  - `downloading` -> POST `/gsma/rsp2/es9plus/getBoundProfilePackage`.
  - `preparing_package` -> Segmentación en fragmentos de 240 bytes.
  - `installing` -> Envío secuencial de comandos APDU `80E2` al chip virtual.
  - `registering_in_core` -> Registro en base de datos de Open5GS Subscriber.
  - `activating_connectivity` -> Señal física a UERANSIM UE (`FFFFFFFF00`).

## 3. Modelo de Datos y Persistencia
- **Contexto del Workflow (XState Context):**
  ```typescript
  export interface ProvisioningContext {
    smdpAddress?: string;
    transactionId?: string;
    boundProfilePackage?: Buffer;
    segments: string[];
    currentSegmentIndex: number;
    iccid?: string;
    error?: string;
  }
  ```
- **Auditoría:** Guardado en la colección `audit_logs` (MongoDB) utilizando `ports.audit.log`.

## 4. Arquitectura de Componentes (Hexagonal)
| Componente | Capa | Ruta Sugerida |
| :--- | :--- | :--- |
| **Workflow XState** | Aplicación | `packages/core/src/application/use-cases/sgp22/provisioning.machine.ts` |
| **Definición de Tareas** | Aplicación | `packages/core/src/application/use-cases/sgp22/tasks.ts` |
| **Mapeador TLV** | Infraestructura | `packages/core/src/infrastructure/mappers/sgp22-tlv.mapper.ts` |
| **Puertos de Salida** | Dominio | `packages/core/src/domain/ports/out/` |

## 5. Estrategia de Testing (Technical Red Phase)
- **[TEST-01] Dominio:** Probar que la segmentación de BPP (Bung Profile Package) genera fragmentos APDU correctos con cabeceras `80E2`.
- **[TEST-02] Aplicación:** Validar la máquina de estados simulando respuestas correctas (fase Green de XState) y errores del SM-DP+ (fase Red).
- **[TEST-03] Infraestructura:** Probar el parser BER-TLV contra tramas hex de respuesta reales de la eUICC.

---
**CONSTITUCIÓN:** Este diseño sigue la Constitución del proyecto utilizando XState v5 y puertos de aislamiento de infraestructura en `packages/core`.
