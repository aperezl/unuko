# Roadmap de Implementación SGP.22 (Consumer RSP)

Este documento detalla el estado actual de las capacidades de Unuko RSP y los pasos necesarios para alcanzar una implementación completa del estándar GSMA SGP.22.

## 1. Estado de Situación y Roadmap

| Categoría | Acción Protocolo | Máquina (`*.machine.ts`) | Estado | Observaciones |
| :--- | :--- | :--- | :--- | :--- |
| **Provisioning** | `initiateAuthentication` | `provisioning.machine.ts` | 🟢 Parcial | La URL y el `euiccChallenge` son estáticos. Necesita integración con `GetEUICCChallenge`. |
| | `getBoundProfilePackage` | `provisioning.machine.ts` | 🟢 Parcial | Falta validación de certificados y resolución dinámica de FQDN del SM-DP+. |
| | installProfile | provisioning.machine.ts | 🟢 Completo | Implementada segmentación dinámica del BPP y bucle de instalación STORE DATA (80 E2). |
| **Profile Mgmt** | `EnableProfile` | `profile-mgmt.machine.ts` | 🔴 Pendiente | Implementar comando `ENABLE_PROFILE` y gestionar el *Profile Refresh* del módem. |
| | `DisableProfile` | `profile-mgmt.machine.ts` | 🔴 Pendiente | Lógica para deseleccionar el ISD-P activo sin borrar los datos. |
| | `DeleteProfile` | `profile-mgmt.machine.ts` | 🔴 Pendiente | Acción crítica: requiere generación de notificación de borrado para el SM-DP+. |
| | `SetNickname` | `profile-mgmt.machine.ts` | 🔴 Pendiente | Permitir la edición de alias de perfiles existentes. |
| **Visibility**| `GetProfilesInfo` | `inventory.machine.ts` | 🟢 Parcial | Creada la máquina y la tarea APDU. Falta el parser ASN.1 completo. |
| | `GetEUICCInfo` | `inventory.machine.ts` | 🔴 Pendiente | Consulta de capacidades y versiones de seguridad soportadas. |
| **Notifications** | `List/Handle` | `notification.machine.ts` | 🔴 Pendiente | Cierre del ciclo: informar al SM-DP+ del éxito o fallo de las operaciones. |

---

## 2. Instrucciones para la Fase de Desarrollo

Para evolucionar el proyecto, se recomienda seguir este orden de prioridad:

### Paso 1: "Des-hardcodear" la Instalación [COMPLETADO]
1.  **Refactorizar `tasks.ts`**: Creada función `segmentBPP` que divide el paquete en trozos compatibles.
2.  **Manejo de Respuestas**: La máquina gestiona el bucle de envío y valida el flujo.

### Paso 2: Implementar el Inventario (Visibility)
1.  **Crear `inventory.machine.ts`**: Esta máquina debe ejecutarse al inicio para detectar qué perfiles ya existen en la SIM.
2.  **ASN.1 Parser**: Integrar una librería o utilidad para parsear las respuestas de la tarjeta, que vienen en formato DER/ASN.1 según el estándar GSMA.

### Paso 3: Gestión del Ciclo de Vida
1.  **Crear `profile-mgmt.machine.ts`**: Definir los estados para `enabling`, `disabling` y `deleting`.
2.  **Integración UI**: Vincular estos estados a botones en el dashboard para que el usuario pueda gestionar su eSIM en tiempo real.

### Paso 4: Notificaciones y Cierre de Transacción
1.  **Cola de Notificaciones**: Implementar la lectura de notificaciones pendientes en la eUICC tras cada operación.
2.  **Callback ES9+**: Asegurar que el SM-DP+ recibe el `handleNotification` para que el estado del perfil sea coherente tanto en el dispositivo como en la red.

---
*Nota: Este documento es una guía viva para la evolución de Unuko RSP hacia un orquestador eUICC profesional.*
