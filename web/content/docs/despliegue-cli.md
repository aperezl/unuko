# Despliegue con el CLI de unuko

El núcleo de la red 5G, las interfaces de radio de simulación y los servidores de aprovisionamiento de eSIM se operan y orquestan bajo una única herramienta unificada de consola llamada **`unuko` CLI**.

Esta herramienta abstrae la complejidad de interactuar directamente con máquinas virtuales (como Lima), dockers, compilaciones o scripts Bash, proporcionando comandos limpios y declarativos.

---

## Comandos Principales

### 1. Levantar el laboratorio completo (`unuko up`)
Para iniciar todos los servicios del núcleo 5G (Open5GS), el simulador de SIM (UERANSIM) y el servidor SM-DP+ (osmo-smdpp):
```bash
unuko up core5g
```

### 2. Modulación y Optimización (Flags)
Si deseas arrancar el laboratorio omitiendo funciones de red no esenciales para tu caso de uso de prueba (por ejemplo, para acelerar el arranque o ahorrar memoria RAM):
```bash
unuko up core5g --without-udr --without-upf
```

### 3. Consultar el estado del entorno (`unuko status`)
Muestra en tiempo real qué Network Functions, puertos y servicios están levantados y listos:
```bash
unuko status
```
*Salida esperada:*
```text
[unuko] Estado de la suite de servicios:
  ● MongoDB Database                 [ ACTIVO - Puerto 27017 ]
  ● Open5GS (AMF, SMF, UPF)          [ ACTIVO - Enlace 127.0.0.5 ]
  ● Osmocom SM-DP+ (osmo-smdpp)      [ ACTIVO - Puerto 8081 ]
  ● SoftHSM Token (unuko-token)      [ INICIALIZADO - PKCS11 ]
  ● UERANSIM gNodeB / UE             [ CONECTADO - uesimtun0 ]
```

### 4. Apagar y limpiar el laboratorio (`unuko down`)
Detiene de forma segura los servicios en ejecución y libera los recursos del host:
```bash
unuko down core5g
```
*Este comando descarga las interfaces virtuales de red TUN (`uesimtun0`) y detiene de forma limpia las conexiones de sockets.*
