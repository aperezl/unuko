# Patrones de Diseño ElysiaJS

## 1. Definición de Rutas
Siempre usa el patrón de "Instance" para modularizar:
```typescript
// Ejemplo correcto
export const userRoutes = new Elysia({ prefix: '/users' })
  .post('/', ({ body }) => createUser(body), {
    body: t.Object({ name: t.String() })
  })
```

## 2. Inyección de Dependencias
Usa el método `.decorate` o `.derive` de Elysia para pasar servicios (DB, Loggers). No importes instancias globales directamente en las rutas para facilitar el testeo.

## 3. Servidor Bun
El runtime es Bun. Usa `Bun.password` para hashes y `Bun.env` para variables de entorno.