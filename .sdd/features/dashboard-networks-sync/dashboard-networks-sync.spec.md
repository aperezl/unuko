# ESPECIFICACIÓN: Sincronización y Control de Entornos de Red en el Dashboard
**Fecha:** 2026-05-24 15:08:00

## 1. Contexto y Objetivo de Negocio
El panel de control visual (Dashboard) debe reflejar con exactitud y en tiempo real el estado de todos los entornos de red de simulación 5G disponibles en el sistema anfitrión. Actualmente, la interfaz muestra una única red predefinida que no se corresponde necesariamente con el estado real de las máquinas virtuales. Al sincronizar el listado y permitir el encendido/apagado directo desde la interfaz gráfica, se mejora la usabilidad y la experiencia de diagnóstico para los operadores de la simulación.

## 2. Historias de Usuario / Casos de Uso
- **Como** Operador de Simulación, **quiero** ver la lista de todos los entornos de red 5G creados en el host junto con su estado actual (encendido/apagado) y sus especificaciones (memoria, procesadores), **para** saber qué entornos tengo disponibles para simular.
- **Como** Operador de Simulación, **quiero** poder encender un entorno de red apagado haciendo clic en un botón del panel, **para** activar la red y realizar pruebas.
- **Como** Operador de Simulación, **quiero** poder apagar un entorno de red encendido desde el panel, **para** liberar recursos del sistema anfitrión cuando finalice la simulación.

## 3. Contrato de Negocio (Perspectiva Funcional)
### 3.1 Entradas (Inputs)
- **Dato:** Identificador de la Red | **Requisito:** Obligatorio | **Descripción:** El nombre del entorno de red sobre el que se quiere operar (ej. core5g, 5g-dev).
- **Dato:** Acción de Control | **Requisito:** Obligatorio | **Descripción:** La operación que se desea realizar (Encender o Apagar).

### 3.2 Salidas (Outputs)
- **Dato:** Listado de Redes | **Significado:** Una colección de todas las redes configuradas en el host, incluyendo: Nombre, Estado de Actividad (Activo/Inactivo), Puerto de comunicación SSH asignado, Cantidad de Procesadores y Memoria asignada.
- **Dato:** Estado de la Operación | **Significado:** Indicador de si la acción de encendido o apagado se completó con éxito o falló.

## 4. Reglas de Validación de Negocio
- **[BR-01]** Solo se pueden encender entornos de red que se encuentren actualmente en estado apagado/inactivo.
- **[BR-02]** Solo se pueden apagar entornos de red que se encuentren actualmente en estado encendido/activo.
- **[BR-03]** La información del estado de los entornos mostrada en el panel visual debe coincidir exactamente con el estado del sistema de virtualización subyacente.

## 5. Escenarios de Éxito y Fracaso
### Escenario: Encendido exitoso de un entorno de red
- **Dado** que el entorno de red "5g-dev" está en estado "Apagado"
- **Cuando** el operador solicita "Encender" el entorno "5g-dev"
- **Entonces** el sistema inicia la máquina correspondiente, cambia su estado a "Activo" en la interfaz y muestra una confirmación de éxito.

### Escenario: Intento de encender un entorno ya activo (Fallo)
- **Dado** que el entorno de red "core5g" ya está en estado "Activo"
- **Cuando** el operador solicita "Encender" el entorno "core5g"
- **Entonces** el sistema rechaza la acción, no realiza cambios y muestra una advertencia indicando que el entorno ya está funcionando.

---
**REGLA DE ORO:** Este documento NO debe contener detalles técnicos (lenguajes, frameworks, bases de datos).
