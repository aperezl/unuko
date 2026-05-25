# ESPECIFICACIÓN: Aprovisionamiento Remoto de SIM (SGP.22)
**Fecha:** 2026-05-25 18:35:00

## 1. Contexto y Objetivo de Negocio
El aprovisionamiento remoto de SIM (RSP) permite la descarga, instalación y activación segura de perfiles de suscripción de operador en tarjetas eSIM (eUICC) a través de canales de comunicación IP, de acuerdo con el estándar de la GSMA SGP.22. El objetivo de este flujo es automatizar y simular todo el ciclo de vida de la conexión de un terminal a la red móvil 5G, desde la autenticación inicial con el servidor SM-DP+ hasta la activación física de la interfaz de radio.

## 2. Historias de Usuario / Casos de Uso
- **Como** Operador de Simulación, **quiero** aprovisionar un nuevo perfil de SIM en el dispositivo virtual, **para** que el terminal pueda conectarse al núcleo de red 5G (Core).
- **Como** Terminal de Usuario, **quiero** recibir el perfil en bloques/segmentos de comunicación física seguros, **para** no sobrecargar las capacidades de recepción del chip eUICC.
- **Como** Operador de Simulación, **quiero** gestionar (activar, desactivar y eliminar) perfiles ya instalados en la eUICC, **para** controlar las diferentes identidades de suscripción del terminal.

## 3. Contrato de Negocio (Perspectiva Funcional)
### 3.1 Entradas (Inputs)
- **Dato:** Dirección del Servidor SM-DP+ | **Requisito:** Opcional (por defecto local) | **Descripción:** La ubicación de red del servidor gestor de preparación de datos (SM-DP+).
- **Dato:** Desafío eUICC | **Requisito:** Opcional (por defecto se genera autogestionado) | **Descripción:** Un token criptográfico aleatorio generado por la tarjeta para prevenir ataques de repetición.
- **Dato:** Identificador Único del Perfil (ICCID) | **Requisito:** Obligatorio | **Descripción:** El identificador del circuito integrado de la tarjeta de suscripción que se desea instalar o gestionar.
- **Dato:** Acción de Gestión de Perfil | **Requisito:** Condicional (para control de ciclo de vida) | **Descripción:** La operación a realizar sobre un perfil instalado: Habilitar, Deshabilitar o Eliminar.

### 3.2 Salidas (Outputs)
- **Dato:** Identificador de Transacción | **Significado:** El token generado por el SM-DP+ para validar y enlazar la sesión de descarga del perfil.
- **Dato:** Paquete de Perfil Enlazado (BPP) | **Significado:** El archivo contenedor cifrado que contiene el perfil y las claves de seguridad asignadas específicamente para esa eUICC.
- **Dato:** Listado de Perfiles Instalados | **Significado:** Colección de perfiles actualmente presentes en la tarjeta eSIM indicando su ICCID, nombre descriptivo y estado de actividad (Habilitado/Deshabilitado).
- **Dato:** Evento de Conectividad | **Significado:** Confirmación de que el terminal de radio ha intentado enlazarse al core de red tras la activación del perfil.

## 4. Reglas de Validación de Negocio
- **[BR-01] Generación de Desafío por Defecto:** Si no se proporciona un desafío de eUICC de 16 bytes de longitud válido, se debe generar y emplear un token seguro por defecto para garantizar que la fase de autenticación no se interrumpa.
- **[BR-02] Segmentación del Paquete de Perfil (BPP):** Debido a los límites de tamaño en los mensajes del protocolo APDU para chips físicos y emulados, el paquete de perfil descargado de forma binaria debe fragmentarse secuencialmente en segmentos de un tamaño máximo de 240 bytes antes de su transmisión al chip.
- **[BR-03] Tolerancia al Fallo de Registro en Core:** Si la instalación física del perfil eSIM es exitosa en el chip, pero el registro lógico en la base de datos de abonados del núcleo de red (Core Open5GS) falla, el flujo debe proceder a intentar activar la interfaz de conectividad para facilitar pruebas parciales y simulación offline.
- **[BR-04] Transición de Estados de Conexión:** Tras la instalación correcta de todos los segmentos y el registro de la suscripción, se debe invocar una señal física de reinicio / activación en el módulo de radio (UERANSIM UE) para forzar el registro (Attach) del terminal móvil.
- **[BR-05] Transiciones de Perfiles (Ciclo de Vida):** Solo se puede habilitar un perfil inactivo y desactivar un perfil activo. Al realizar un cambio en el estado de un perfil (habilitar/deshabilitar), se debe simular una operación de actualización (Refresh) de la eUICC para forzar a la pila del módem a leer de nuevo los parámetros de suscripción.

## 5. Escenarios de Éxito y Fracaso
### Escenario: Aprovisionamiento y Activación Exitosos de eSIM
- **Dado** que la máquina virtual de simulación y la eUICC están encendidas y accesibles.
- **Cuando** se solicita el inicio del aprovisionamiento del perfil con un ICCID determinado.
- **Entonces** el sistema inicia la autenticación mutua, descarga el paquete BPP completo, lo segmenta, lo instala en la tarjeta eUICC, registra el ICCID/IMSI en el núcleo de red y activa el servicio UERANSIM, completando el flujo con éxito.

### Escenario: Error en el Descarga del Perfil BPP
- **Dado** que se ha completado la fase de autenticación inicial y se tiene un Identificador de Transacción válido.
- **Cuando** falla el canal de comunicación o el SM-DP+ rechaza entregar el paquete BPP.
- **Entonces** el sistema captura el error, detiene el proceso de segmentación/instalación, registra el fallo en la bitácora de auditoría y transiciona al estado final de error.

---
**REGLA DE ORO:** Este documento NO debe contener detalles técnicos (lenguajes, frameworks, bases de datos).
