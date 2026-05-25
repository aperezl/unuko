# PLAN DE EJECUCIÓN (TASKS): Control de Virtualización Lima (packages/cli/lima-manager)
**Fecha:** 2026-05-25 18:50:00

## 1. Hoja de Ruta (Milestones)
- [ ] Fase 1: Cimentación (Esquemas de Entrada de Consola)
- [ ] Fase 2: Lógica de Negocio (Gestor de Procesos y VMs)
- [ ] Fase 3: Integración (Comandos de Virtualización)

## 2. Desglose de Tareas Atómicas

### Bloque A: Cimentación
- [ ] **TASK-A1:** Implementar tipos TypeScript para la información de VMs (`VMInfo`) y de servicios (`ServiceStatusInfo`).
- [ ] **TASK-A2:** Escribir esquemas Zod para la salida formateada JSON de los comandos de virtualización.

### Bloque B: Lógica de Negocio (TDD)
- [ ] **TASK-B1:** Escribir pruebas unitarias simulando salidas de comandos correctos e incorrectos del hipervisor.
- [ ] **TASK-B2:** Implementar lógica del controlador `LimaManager` (métodos `listInstances`, `startVM`, `stopVM`).

### Bloque C: Exposición e Infraestructura
- [ ] **TASK-C1:** Desarrollar los métodos para consultar y encender servicios del sistema operativo huésped (`systemctl`).
- [ ] **TASK-C2:** Validar el filtrado y escape de caracteres para evitar inyección en la terminal.

## 3. Definición de Hecho (DoD)
- [ ] Pruebas unitarias de comandos y parseo JSON pasan al 100%.
- [ ] Compilación TypeScript limpia sin tipo implicit `any`.
