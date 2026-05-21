# Introducción a Unuko ToolKit

**Unuko ToolKit** es un entorno de desarrollo, simulación y pruebas extensible y de código abierto para el aprovisionamiento remoto de tarjetas eSIM en redes 5G.

El proyecto está diseñado bajo la licencia **GNU AGPLv3** para dotar a los ingenieros y desarrolladores de telecomunicaciones de una suite de herramientas moderna, interactiva y totalmente extensible que sustituye el software cerrado tradicional o los engorrosos scripts de bajo nivel.

---

## Un Stack Tecnológico Disruptivo en Telco

Frente a la rigidez habitual del ecosistema de telecomunicaciones clásico, Unuko ToolKit implementa un stack de alta productividad y fiabilidad:
*   **TypeScript y Node.js**: Lenguaje estructurado y robusto para implementar flujos de lógica de red, reduciendo el riesgo de desbordamientos de memoria comunes en implementaciones legacy de C/C++.
*   **Fastify**: Framework de servidor de alta velocidad y baja latencia para exponer endpoints de orquestación y escuchar APIs REST de aprovisionamiento.
*   **Zod**: Validación estricta en tiempo de ejecución de esquemas de datos de red, impidiendo el procesamiento de tramas malformadas.
*   **XState Engine**: Máquinas de estado lógicas y deterministas para orquestar la activación de eSIM de forma visual y libre de fallos por concurrencia.

---

## Componentes del Ecosistema

Unuko ToolKit coordina y expone la interacción de múltiples componentes:

1.  **CLI de `unuko`**: La interfaz de comandos global que orquesta y despliega toda la suite con comandos simples (como `unuko up core5g` o `unuko status`).
2.  **osmo-smdpp & Mock Server**: Servidores de pruebas SM-DP+ de Osmocom que responden a las APIs REST definidas por la GSMA (ES9+ para consumo, ESips para IoT) entregando los perfiles de eSIM encriptados (`BoundProfilePackage`).
3.  **eUICC (SIM Virtual)**: Emulación del chip de la tarjeta SIM (eUICC) en UERANSIM, capaz de recibir y procesar comandos de APDU para la instalación segura de perfiles.
4.  **Core Network (Open5GS)**: Un núcleo de red 5G Standalone real (AMF, SMF, UPF, UDM) que gestiona el registro del dispositivo y el establecimiento de la sesión de datos.
5.  **RAN Simulator (UERANSIM)**: Simulador de la antena de radio (gNodeB) y del equipo de usuario (móvil/UE).

---

## Filosofía de Extensibilidad

Unuko no es una "caja negra" cerrada. Es un **ToolKit** diseñado para ser modificado. Los desarrolladores pueden:
*   Clonar el proyecto y escribir comandos personalizados en el CLI `unuko`.
*   Añadir o modificar estados en el workflow de aprovisionamiento de eSIM (XState).
*   Configurar perfiles e interfaces de red adaptadas a sus necesidades de laboratorio específicas.
