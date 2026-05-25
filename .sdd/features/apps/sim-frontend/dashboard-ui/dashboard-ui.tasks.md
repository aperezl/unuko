# PLAN DE EJECUCIÓN (TASKS): Interfaz de Dashboard (apps/sim-frontend/dashboard-ui)
**Fecha:** 2026-05-25 18:54:00

## 1. Hoja de Ruta (Milestones)
- [ ] Fase 1: Cimentación (Esquemas de Componentes y Monaco Editor)
- [ ] Fase 2: Lógica de Negocio (Control de Estado y Sondeo de Fondo)
- [ ] Fase 3: Exposición (Efectos Visuales e Interacciones Optimistas)

## 2. Desglose de Tareas Atómicas

### Bloque A: Cimentación
- [ ] **TASK-A1:** Configurar tipos de propiedades (props) para componentes de tarjeta de VM y filas de servicios.
- [ ] **TASK-A2:** Integrar el editor Monaco con esquemas de validación de sintaxis YAML en tiempo de edición.

### Bloque B: Lógica de Negocio (TDD)
- [ ] **TASK-B1:** Escribir pruebas unitarias de renderizado para componentes clave utilizando React Testing Library.
- [ ] **TASK-B2:** Desarrollar los ganchos personalizados (custom hooks) para gestionar el sondeo periódico de fondo y actualizar el estado local de React.

### Bloque C: Exposición e Infraestructura
- [ ] **TASK-C1:** Implementar transiciones visuales de estado optimista en los botones de encendido/parada.
- [ ] **TASK-C2:** Validar que la bitácora de auditoría en pantalla muestra los registros ordenados de forma cronológica inversa.

## 3. Definición de Hecho (DoD)
- [ ] Pruebas unitarias de UI y ganchos pasan al 100%.
- [ ] Cero advertencias TSC y estilos adaptados a Tailwind CSS v4.
