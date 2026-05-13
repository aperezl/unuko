# Roadmap de Implementación SGP.22 (Consumer RSP)

Este documento detalla el estado actual de las capacidades de Unuko RSP y los pasos necesarios para alcanzar una implementación completa del estándar GSMA SGP.22.

## 1. Estado de Situación y Roadmap

| Categoría | Acción Protocolo | Máquina (`*.machine.ts`) | Estado | Observaciones |
| :--- | :--- | :--- | :--- | :--- |
| **Provisioning** | `initiateAuthentication` | `provisioning.machine.ts` | 🟢 Parcial | La URL y el `euiccChallenge` son estáticos. Necesita integración con `GetEUICCChallenge`. |
| | `getBoundProfilePackage` | `provisioning.machine.ts` | 🟢 Parcial | Falta validación de certificados y resolución dinámica de FQDN del SM-DP+. |
| | `installProfile` | `provisioning.machine.ts` | 🟢 Completo | Implementada segmentación dinámica del BPP y bucle de instalación STORE DATA (80 E2). |
| **Profile Mgmt** | `EnableProfile` | `profile-mgmt.machine.ts` | 🟢 Completo | Implementado comando `BF31` y lógica de refresco (REUICC). |
| | `DisableProfile` | `profile-mgmt.machine.ts` | 🟢 Completo | Implementado comando `BF32` para desactivación. |
| | `DeleteProfile` | `profile-mgmt.machine.ts` | 🟢 Completo | Implementado comando `BF33`. |
| | `SetNickname` | `profile-mgmt.machine.ts` | 🔴 Pendiente | Permitir la edición de alias de perfiles existentes. |
| **Visibility** | `GetProfilesInfo` | `inventory.machine.ts` | 🟢 Completo | Implementado parser BER-TLV manual para extraer ICCID, Nombre y Estado. |
| | `GetEUICCInfo` | `inventory.machine.ts` | 🔴 Pendiente | Consulta de capacidades y versiones de seguridad soportadas. |
| **Notifications** | `List/Handle` | `notification.machine.ts` | 🟢 Completo | Implementada lectura de cola de notificaciones y callback `handleNotification` al SM-DP+. |

---

## 2. Instrucciones para la Fase de Desarrollo

### Paso 1: "Des-hardcodear" la Instalación [COMPLETADO]
1.  **Refactorizar `tasks.ts`**: Creada función `segmentBPP` que divide el paquete en trozos compatibles.
2.  **Manejo de Respuestas**: La máquina gestiona el bucle de envío y valida el flujo de forma recursiva.

### Paso 2: Implementar el Inventario (Visibility) [COMPLETADO]
1.  **Crear `inventory.machine.ts`**: Máquina operativa que lanza el comando `BF2D` y gestiona el flujo.
2.  **ASN.1 Parser**: Implementado parser BER-TLV en `utils.ts` que extrae los datos reales de la eUICC (ICCID, Name, State).

### Paso 3: Gestión del Ciclo de Vida [COMPLETADO]
1.  **Crear `profile-mgmt.machine.ts`**: Máquina genérica que soporta Enable, Disable y Delete basándose en el ICCID.
2.  **Lógica de Comandos**: Implementada construcción dinámica de TLVs para los comandos `BF31/32/33` en `tasks.ts`.

### Paso 4: Notificaciones y Cierre de Transacción [COMPLETADO]
1.  **Cola de Notificaciones**: Creada la máquina `notification.machine.ts` y la tarea `listNotifications` para leer eventos.
2.  **Parser de Eventos**: Implementada la lógica para identificar números de secuencia y tipos de evento (Install/Delete).
3.  **Callback ES9+**: Implementado envío de `handleNotification` al SM-DP+ para cerrar el ciclo administrativo.

---
*Nota: Este documento es una guía viva para la evolución de Unuko RSP hacia un orquestador eUICC profesional.*
