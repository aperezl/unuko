# UERANSIM y eSIM

**UERANSIM** es la herramienta líder de código abierto para simular antenas de acceso de radio (gNodeB) y equipos de usuario (UE) 5G.

En **Unuko ToolKit**, hemos configurado el simulador para dotar a los terminales móviles virtuales (`nr-ue`) de un socket TCP/IP que emula la conexión física con un chip inteligente **eUICC**.

---

## Interfaz eUICC por Sockets

En un teléfono móvil real, el sistema operativo (a través del LPA) interactúa con la tarjeta SIM insertada usando comandos APDU.

En nuestro ToolKit:
1.  Al arrancar la simulación, el entorno inicia el simulador de radio y abre un puerto de escucha TCP en el UE simulado.
2.  El motor de orquestación en TypeScript se conecta al puerto del UE y transmite los comandos APDU desglosados del `BoundProfilePackage` (obtenido desde osmo-smdpp).
3.  La SIM virtual procesa el descifrado del perfil y escribe las claves secretas (IMSI, K, OPc) en su memoria interna simulada.
4.  Tras responder con éxito al orquestador, el simulador de radio reinicia su pila lógica para autenticarse contra el AMF de Open5GS utilizando la nueva SIM descargada.
