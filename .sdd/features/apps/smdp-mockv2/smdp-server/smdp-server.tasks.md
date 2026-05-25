# PLAN DE EJECUCIÓN (TASKS): Servidor SM-DP+ de Descarga eSIM (apps/smdp-mockv2/smdp-server)
**Fecha:** 2026-05-25 18:53:00

## 1. Hoja de Ruta (Milestones)
- [ ] Fase 1: Cimentación (Esquemas ES9+ y Modelos de Perfiles)
- [ ] Fase 2: Lógica de Negocio (Controlador SM-DP+ Mock)
- [ ] Fase 3: Exposición (Endpoints de Descarga eSIM)

## 2. Desglose de Tareas Atómicas

### Bloque A: Cimentación
- [ ] **TASK-A1:** Implementar validaciones Zod para los campos criptográficos de la interfaz ES9+.
- [ ] **TASK-A2:** Definir colecciones en MongoDB para gestionar el almacén de perfiles eSIM listos para descargar.

### Bloque B: Lógica de Negocio (TDD)
- [ ] **TASK-B1:** Escribir tests unitarios para comprobar que las transacciones se marcan como usadas y se bloquean descargas duplicadas.
- [ ] **TASK-B2:** Desarrollar controlador `SmdpController` y utilidades de simulación criptográfica.

### Bloque C: Exposición e Infraestructura
- [ ] **TASK-C1:** Levantar el servidor Fastify y registrar las rutas de autenticación y descarga.
- [ ] **TASK-C2:** Validar que los adaptadores de transporte externos del backend pueden negociar con la API del mock correctamente.

## 3. Definición de Hecho (DoD)
- [ ] Pruebas unitarias de ES9+ pasan al 100%.
- [ ] Cero errores de linter en el proyecto `smdp-mockv2`.
