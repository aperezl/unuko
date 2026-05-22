# Introducción a Unuko ToolKit

**Unuko ToolKit** nació de mi propia frustración tras años trabajando en telecomunicaciones en el ecosistema JavaScript. Probar flujos de eSIM y redes 5G en entornos reales suele ser increíblemente complejo, costoso y propenso a errores de configuración.

Creé este ToolKit de código abierto (**GNU AGPLv3**) para que cualquier desarrollador, especialmente si viene del mundo TypeScript/JavaScript, pueda levantar laboratorios completos, simular tarjetas eUICC y experimentar con aprovisionamiento remoto sin depender de costosos servidores cerrados ni hardware físico.

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

1.  **CLI de `unuko`**: La interfaz de comandos global que orquesta y despliega toda la suite con comandos simples (como `unuko core5g start` o `unuko core5g status`).
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
