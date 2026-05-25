# ESPECIFICACIÓN: Control de Entorno de Virtualización Lima (packages/cli/lima-manager)
**Fecha:** 2026-05-25 18:36:00

## 1. Contexto y Objetivo de Negocio
El gestor de virtualización Lima proporciona un mecanismo unificado para interactuar con las máquinas virtuales locales del anfitrión que alojan las funciones lógicas de la red 5G y las bases de datos. Permite automatizar operaciones de infraestructura y verificar el estado y los servicios en ejecución dentro de las máquinas.

## 2. Historias de Usuario / Casos de Uso
- **Como** Backend de Simulación, **quiero** interrogar el estado de las máquinas virtuales y de sus servicios internos, **para** representarlos fielmente en la consola o panel web.
- **Como** Operador de Red, **quiero** encender y apagar las máquinas virtuales específicas, **para** ahorrar recursos en el sistema anfitrión.

## 3. Contrato de Negocio (Perspectiva Funcional)
### 3.1 Entradas (Inputs)
- **Dato:** Nombre de la Instancia Virtual | **Requisito:** Obligatorio | **Descripción:** Nombre único de la máquina virtual que se desea gestionar o auditar.
- **Dato:** Configuración Semilla de Aprovisionamiento | **Requisito:** Opcional | **Descripción:** Plantilla descriptiva de recursos para aprovisionar si la máquina no existe.

### 3.2 Salidas (Outputs)
- **Dato:** Estado Físico de la VM | **Significado:** Indicador de actividad (En ejecución, Apagado, Roto, etc.).
- **Dato:** Listado de Estado de Servicios del Sistema | **Significado:** Diccionario con la salud/actividad de los servicios clave del sistema operativo huésped.

## 4. Reglas de Validación de Negocio
- **[BR-01] Prerrequisitos de Infraestructura:** El sistema debe verificar la disponibilidad de herramientas de virtualización de bajo nivel. En caso de ausencia, no se procesará ninguna solicitud y se informará de un error fatal de entorno.
- **[BR-02] Aprovisionamiento en Caliente:** Si se solicita iniciar una máquina que no se encuentra registrada en el sistema, pero se suministra una configuración semilla válida, el gestor debe primero aprovisionar la máquina antes de iniciarla.
- **[BR-03] Ejecución de Comandos Aislada:** Los comandos del sistema operativo anfitrión e interno huésped se deben sanitizar para impedir ejecuciones accidentales o comandos dañinos.

## 5. Escenarios de Éxito y Fracaso
### Escenario: Intento de detener una máquina ya apagada
- **Dado** que la máquina virtual con nombre "5g-dev" está en estado "Apagado".
- **Cuando** se solicita apagar la máquina "5g-dev".
- **Entonces** el sistema no realiza ninguna acción en el hipervisor y devuelve un estado de éxito indicando que ya está apagada.

---
**REGLA DE ORO:** Este documento NO debe contener detalles técnicos (lenguajes, frameworks, bases de datos).
