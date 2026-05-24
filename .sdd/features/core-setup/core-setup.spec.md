# ESPECIFICACIÓN: Core Setup (Inicialización del Entorno de Simulación)
**Fecha:** 2026-05-24 14:12:00

## 1. Contexto y Objetivo de Negocio
El objetivo es proveer a los ingenieros de telecomunicaciones y desarrolladores un entorno automatizado y unificado para simular una red móvil core 5G y realizar el aprovisionamiento de perfiles eSIM (Remote SIM Provisioning - RSP). Esto permite a los usuarios testear flujos, probar integraciones y auditar comportamientos sin la necesidad de desplegar hardware físico real o infraestructuras complejas en la nube.

## 2. Historias de Usuario / Casos de Uso
- **Como** Desarrollador de Redes Móviles, **quiero** aprovisionar e iniciar una red core 5G virtualizada local de forma automática, **para** realizar pruebas funcionales de conexión y flujos de red.
- **Como** Integrador de Sistemas eSIM, **quiero** desplegar un servidor simulado de preparación de datos (SM-DP+) que responda a flujos de consumo (SGP.22) e Internet de las Cosas (SGP.32), **para** simular el ciclo de vida de los perfiles eSIM en dispositivos.
- **Como** Operador de Laboratorio, **quiero** acceder a un panel visual interactivo (Dashboard) que consolide el estado de todos los componentes, **para** monitorear la red de simulación en tiempo real.

## 3. Contrato de Negocio (Perspectiva Funcional)
### 3.1 Entradas (Inputs)
- **Dato:** Comando de Red | **Requisito:** Obligatorio | **Descripción:** El tipo de instrucción funcional a ejecutar (crear, arrancar, detener o auditar).
- **Dato:** Identificador de Red | **Requisito:** Obligatorio | **Descripción:** El nombre de la red o entorno virtualizado que se desea orquestar (por defecto `core5g`).
- **Dato:** Archivo de Workflow de Simulación | **Requisito:** Opcional | **Descripción:** Configuración en formato declarativo que define la secuencia de estados de la simulación.

### 3.2 Salidas (Outputs)
- **Dato:** Estado de Salud | **Significado:** Indicador visual o lógico de si el entorno de virtualización, base de datos y servidores de aprovisionamiento están operativos.
- **Dato:** Lista de Dispositivos Activos | **Significado:** Detalle de las antenas (gNodeB) y dispositivos móviles (UEs) simulados y conectados.
- **Dato:** Panel del Dashboard | **Significado:** Interfaz interactiva accesible para administrar la suite de simulación.

## 4. Reglas de Validación de Negocio
- **[BR-01]** No se puede iniciar la simulación del dashboard si los puertos de comunicación necesarios están ocupados por otros servicios locales.
- **[BR-02]** Cualquier comando de red debe validar previamente que el identificador de la red corresponda a un entorno creado y configurado.
- **[BR-03]** Toda operación que involucre un cambio en la configuración de la simulación debe registrar un log persistente para auditorías posteriores.

## 5. Escenarios de Éxito y Fracaso
### Escenario: Inicialización Exitosa de la Red 5G
- **Dado** que el usuario no tiene ninguna máquina de red creada en su sistema local.
- **Cuando** solicita la creación e inicio del entorno `core5g`.
- **Entonces** el sistema descarga e instala de forma autónoma los servicios de red 5G, levanta la máquina virtual y confirma que todos los servicios de red están online.

### Escenario: Intento de arranque de red no creada
- **Dado** que la red `core5g` no existe en el sistema local.
- **Cuando** el usuario solicita arrancar el servicio para dicha red.
- **Entonces** el sistema debe denegar el inicio e indicarle de forma clara que primero debe crear y aprovisionar el entorno.

---
**REGLA DE ORO:** Este documento NO debe contener detalles técnicos (lenguajes, frameworks, bases de datos).
