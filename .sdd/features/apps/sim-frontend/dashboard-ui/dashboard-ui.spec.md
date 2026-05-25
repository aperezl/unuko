# ESPECIFICACIÓN: Interfaz del Panel de Simulación y Dashboard (apps/sim-frontend/dashboard-ui)
**Fecha:** 2026-05-25 18:40:00

## 1. Contexto y Objetivo de Negocio
El panel de control visual permite a los usuarios gestionar el entorno de virtualización, editar las configuraciones de terminales/antenas, y visualizar el progreso de las simulaciones y el aprovisionamiento de perfiles de forma interactiva y amigable.

## 2. Historias de Usuario / Casos de Uso
- **Como** Operador, **quiero** encender y apagar las máquinas virtuales y servicios desde la interfaz con un clic, **para** operar de forma rápida.
- **Como** Operador, **quiero** ver la secuencia de pasos de la simulación activa y sus logs de auditoría asociados, **para** diagnosticar problemas rápidamente.

## 3. Contrato de Negocio (Perspectiva Funcional)
### 3.1 Entradas (Inputs)
- **Dato:** Acciones del Usuario (Clics, edición de texto YAML) | **Requisito:** Obligatorio | **Descripción:** Comandos de inicio/parada, arranque de workflows y modificaciones en la topología de red.

### 3.2 Salidas (Outputs)
- **Dato:** Panel Visual de Estado | **Significado:** Indicadores de colores y progresos actualizados.

## 4. Reglas de Validación de Negocio
- **[BR-01] Gestión Optimista del Estado:** Para ofrecer una experiencia de usuario responsiva, el cambio de estado visual ante una acción debe ser optimista e inmediato, sincronizándose mediante sondeo asíncrono con el backend.
- **[BR-02] Ordenamiento de Bitácora:** Las bitácoras de auditoría en pantalla deben presentarse ordenadas cronológicamente para facilitar la lectura del flujo.

## 5. Escenarios de Éxito y Fracaso
### Escenario: Encendido optimista de servicio
- **Dado** que un servicio de red está "Inactivo" (indicador rojo).
- **Cuando** el usuario hace clic en "Arrancar".
- **Entonces** el estado visual cambia a "Arrancando" de inmediato, y tras las consultas de estado en segundo plano, se consolida como "Activo" (indicador verde).

---
**REGLA DE ORO:** Este documento NO debe contener detalles técnicos (lenguajes, frameworks, bases de datos).
