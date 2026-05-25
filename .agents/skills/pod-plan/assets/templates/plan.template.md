# DISEÑO TÉCNICO: <Nombre de la Funcionalidad>
**Fecha:** <AAAA-MM-DD HH:mm:ss>

## 1. Mapeo de Conceptos (Business to Tech)
| Concepto Negocio | Implementación Técnica | Validación |
| :--- | :--- | :--- |
| <Concepto> | <Tipo/Interface> | <Esquema Zod> |

## 2. Contratos de Interfaz (API)
*Nota: Todas las respuestas siguen estrictamente la Regla 3 de la Constitución: `{ data, error, meta }`.*

### Endpoint: `<MÉTODO> <RUTA>`
- **Path/Query Params:** <Detalles>
- **Request Body:**
  ```json
  { "campo": "tipo" }
  ```
- **Responses:**
  - `200 OK`: `{ "data": { ... }, "error": null, "meta": {} }`
  - `400 Bad Request`: `{ "data": null, "error": "...", "meta": {} }`

## 3. Modelo de Datos y Persistencia
- **Nombre Tabla:** `<nombre_tabla>`
- **Esquema (Drizzle):**
  ```typescript
  // Fragmento de código Drizzle
  ```

## 4. Arquitectura de Componentes (Hexagonal)
| Componente | Capa | Ruta Sugerida |
| :--- | :--- | :--- |
| **Entidad** | Dominio | `src/domain/<feature>/entities.ts` |
| **Servicio** | Aplicación | `src/application/<feature>/<use-case>.service.ts` |
| **Handler** | Infraestructura | `src/infrastructure/http/<feature>/handler.ts` |

## 5. Estrategia de Testing (Technical Red Phase)
- **[TEST-01] Dominio:** <Qué probar>
- **[TEST-02] Aplicación:** <Qué probar>
- **[TEST-03] Infraestructura:** <Qué probar>

---
**CONSTITUCIÓN:** Este diseño sigue estrictamente el stack Node.js + Express + Drizzle + Zod y la regla de respuesta unificada `{ data, error, meta }`.
