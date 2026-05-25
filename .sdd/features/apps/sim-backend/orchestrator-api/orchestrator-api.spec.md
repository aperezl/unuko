# ESPECIFICACIÓN: API de Orquestación de Simulación (apps/sim-backend/orchestrator-api)
**Fecha:** 2026-05-25 18:38:00

## 1. Contexto y Objetivo de Negocio
La pasarela del backend sirve de interfaz unificada para interactuar con la plataforma Unuko, abstrayendo las peticiones del frontend para controlar el estado de virtualización, el arranque de flujos de aprovisionamiento eSIM y la verificación del estado de salud de la red 5G.

## 2. Historias de Usuario / Casos de Uso
- **Como** Desarrollador de Frontend, **quiero** interactuar con un conjunto ordenado de servicios HTTP, **para** desencadenar flujos de simulación de forma remota.
- **Como** Operador, **quiero** monitorizar logs de auditoría agregados de una sesión activa, **para** diagnosticar errores del aprovisionamiento en tiempo real.

## 3. Contrato de Negocio (Perspectiva Funcional)
### 3.1 Entradas (Inputs)
- **Dato:** Parámetros de Sesión y Workflow | **Requisito:** Obligatorio | **Descripción:** El tipo de flujo a instanciar.
- **Dato:** Evento de Entrada | **Requisito:** Condicional | **Descripción:** Señales para conducir el estado de la sesión de simulación activa.

### 3.2 Salidas (Outputs)
- **Dato:** Estado e Identificadores de Sesión | **Significado:** Código único, barra de progreso y logs acumulados de la sesión.

## 4. Reglas de Validación de Negocio
- **[BR-01] Persistencia del Entorno Activo:** El backend debe mantener el estado del entorno de virtualización seleccionado (Virtual vs Simulado) y enrutar todas las consultas e interacciones de servicios a dicho entorno.
- **[BR-02] No Bloqueo en Procesamiento:** El arranque de flujos de simulación y encendido de máquinas virtuales debe realizarse asíncronamente en segundo plano. La API debe responder de inmediato con la sesión inicializada.

## 5. Escenarios de Éxito y Fracaso
### Escenario: Envío de evento a sesión inactiva (Fallo)
- **Dado** que la sesión de simulación "SESION-EXPIRED" ya ha sido eliminada o nunca existió.
- **Cuando** se envía un evento de transición a la sesión "SESION-EXPIRED".
- **Entonces** el sistema rechaza la petición e informa de que la sesión especificada no se encuentra activa.

---
**REGLA DE ORO:** Este documento NO debe contener detalles técnicos (lenguajes, frameworks, bases de datos).
