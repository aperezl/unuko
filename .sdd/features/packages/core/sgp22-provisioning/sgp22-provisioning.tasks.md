# PLAN DE EJECUCIÓN (TASKS): Aprovisionamiento Remoto de SIM (SGP.22)
**Fecha:** 2026-05-25 18:49:00

## 1. Hoja de Ruta (Milestones)
- [ ] Fase 1: Cimentación (Esquemas y Puertos de Salida)
- [ ] Fase 2: Lógica de Negocio (Máquinas de Estado XState v5)
- [ ] Fase 3: Integración (Adaptadores de Hardware eUICC)

## 2. Desglose de Tareas Atómicas

### Bloque A: Cimentación
- [ ] **TASK-A1:** Definir esquemas Zod de entrada/salida para iniciar autenticación y descarga.
- [ ] **TASK-A2:** Declarar las firmas e interfaces en los puertos de salida de criptografía, hardware y transporte.

### Bloque B: Lógica de Negocio (TDD)
- [ ] **TASK-B1:** Escribir los tests unitarios con Vitest para validar las transiciones de la máquina de estados SGP.22.
- [ ] **TASK-B2:** Implementar la máquina de estados de aprovisionamiento en XState v5 y sus tareas asociadas (authenticate, downloadProfile, installSegment).

### Bloque C: Exposición e Infraestructura
- [ ] **TASK-C1:** Desarrollar el adaptador para segmentar el Bound Profile Package (BPP) en tramas de 240 bytes.
- [ ] **TASK-C2:** Validar que los logs de auditoría capturan correctamente las transiciones internas y los fallos de descarga.

## 3. Definición de Hecho (DoD)
- [ ] Tests de la máquina de estados y segmentación pasan al 100%.
- [ ] Linter y compilador TypeScript en verde.
