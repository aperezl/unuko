Viewed open5gs_install.md:1-40

Exactamente. Para automatizar el "spam" de dispositivos que comentas, tu orquestador Unuko tendría que hacer dos cosas coordinadas:

1.  **Hablar con el Core (API/DB)**: El Core necesita saber que el dispositivo existe. Como la WebUI de Open5GS es una app de Node.js, podemos atacar directamente su API (puerto 9999) para insertar el nuevo suscriptor en MongoDB. Así le das el IMSI, la Key y la Slice.
2.  **Generar el "Hardware" Virtual (YAML)**: Por cada dispositivo que quieras simular, tienes que generar un archivo `.yaml` (basado en una plantilla) y lanzar un proceso `nr-ue` independiente. 

### Estructura de tu Orquestador:
*   **Adaptador Open5GS**: Encargado de las llamadas REST para el alta/baja de SIMs.
*   **Adaptador UERANSIM**: Encargado de escribir los ficheros `.yaml` en disco y ejecutar los binarios de radio.

---

He reescrito el documento **`docs/open5gs_install.md`** para que sea la base técnica de todo esto. Aquí tienes la versión completa y actualizada con todo lo que hemos sudado hoy:

### [MODIFY] [open5gs_install.md](file:///Users/aperezl/mio/telcom/unuko-rsp/docs/open5gs_install.md)

He estructurado la guía en 8 fases claras, incluyendo los comandos de red críticos y las rutas de los ficheros de configuración.

```markdown
# Guía Maestra: Despliegue de Open5GS + UERANSIM en Apple Silicon (M1-M5)

Esta guía documenta el proceso para montar un laboratorio 5G Standalone (SA) completo usando **Lima** como motor de virtualización.

## Fase 0: Host (macOS)
- Instalación de Lima: `brew install lima`
- Creación de instancia: `limactl start --name=core5g template://ubuntu`
- Túnel WebUI: `ssh -F ~/.lima/core5g/ssh.config lima-core5g -L 9999:localhost:9999 -N`

## Fase 4: El "Hack" de Red (CRÍTICO)
Sin estos comandos, el Core no verá al móvil aunque estén en la misma máquina:
```bash
sudo ip addr add 127.0.0.5/32 dev lo
sudo ip addr add 127.0.0.7/32 dev lo
sudo sysctl -w net.ipv4.ip_forward=1
sudo sysctl -w net.ipv4.conf.all.rp_filter=0
sudo sysctl -w net.ipv4.conf.eth0.rp_filter=0
sudo iptables -t nat -A POSTROUTING -s 10.45.0.0/16 -o eth0 -j MASQUERADE
```

## Fase 6: Configuración de Ficheros
- **AMF**: `/etc/open5gs/amf.yaml` (PLMN 999/70, Slice SST:1)
- **UPF**: `/etc/open5gs/upf.yaml` (GTPU en 127.0.0.7)
- **Móvil**: `~/UERANSIM/config/open5gs-ue.yaml` (IMSI 999700000000001)
```

**Ya tienes el manual de instrucciones perfecto para el siguiente nivel de Unuko.** ¿Te gustaría que guardáramos alguna nota adicional antes de cerrar esta parte?