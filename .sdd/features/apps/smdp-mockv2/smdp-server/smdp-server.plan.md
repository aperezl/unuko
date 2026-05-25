# DISEÑO TÉCNICO: Servidor SM-DP+ de Descarga eSIM (apps/smdp-mockv2/smdp-server)
**Fecha:** 2026-05-25 18:46:00

## 1. Mapeo de Conceptos (Business to Tech)
| Concepto Negocio | Implementación Técnica | Validación |
| :--- | :--- | :--- |
| Solicitud de Autenticación | `initiateAuthentication` | Esquema Zod de autenticación del protocolo ES9+ |
| Descarga de Perfil | `getBoundProfilePackage` | Esquema Zod para validar ID de transacción |
| Perfil eSIM Enlazado (BPP) | `boundProfilePackage` (base64 string) | Esquema Zod de salida criptográfica |

## 2. Contratos de Interfaz (API)
El servidor mock expone los endpoints que representan las interfaces GSMA SGP.22 ES9+:

- **POST `/gsma/rsp2/es9plus/initiateAuthentication`**
  - **Body:** `{ "euiccChallenge": "string", "smdpAddress": "string", "euiccInfo1": "string" }`
  - **Response 200:** `{ "transactionId": "TX-100", "serverChallenge": "string", "serverCertificate": "string" }`
- **POST `/gsma/rsp2/es9plus/getBoundProfilePackage`**
  - **Body:** `{ "transactionId": "TX-100" }`
  - **Response 200:** `{ "boundProfilePackage": "string" }`

## 3. Modelo de Datos y Persistencia
- **Memoria / Cache Local:** Registro de transacciones generadas en la fase de autenticación y estado de uso.
- **Colección de Perfiles (MongoDB):** `esim_profiles` para buscar perfiles asignados.

## 4. Arquitectura de Componentes (Hexagonal)
| Componente | Capa | Ruta Sugerida |
| :--- | :--- | :--- |
| **Controlador Mock** | Infraestructura | `apps/smdp-mockv2/src/controllers/SmdpController.ts` |
| **Mapeador Criptográfico** | Infraestructura | `apps/smdp-mockv2/src/utils/crypto.ts` |
| **Punto de Entrada Servidor** | Infraestructura | `apps/smdp-mockv2/src/server.ts` |

## 5. Estrategia de Testing (Technical Red Phase)
- **[TEST-01] Dominio:** Probar que la transacción se invalida tras un único uso de descarga de BPP.
- **[TEST-02] Integración:** Validar los flujos de respuesta ES9+ con clientes HTTP de prueba simulando transacciones correctas.
- **[TEST-03] Robustez:** Verificar el comportamiento ante IDs de transacción no registrados o caducados, devolviendo respuestas con errores estándar de la GSMA.

---
**CONSTITUCIÓN:** Implementado utilizando Fastify en `apps/smdp-mockv2`.
