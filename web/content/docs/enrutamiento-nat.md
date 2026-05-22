# Rutas y Enrutamiento NAT

Para que el tráfico generado por el teléfono móvil simulado (`nr-ue`) a través de su interfaz virtual `uesimtun0` pueda fluir hacia el host local de macOS y salir a Internet, debemos configurar una serie de reglas de enrutamiento y NAT a nivel de kernel dentro de la máquina virtual.

En **Unuko ToolKit**, todas estas reglas de red se inicializan automáticamente al arrancar los servicios lógicos de red.

---

## 1. El "Hack" de Direcciones Locales

Por defecto, los microservicios de Open5GS y el simulador de UERANSIM se enlazan a direcciones del bucle de retorno (`loopback`). Añadimos estos alias a la interfaz `lo` al arrancar el entorno:

```bash
sudo ip addr add 127.0.0.5/32 dev lo
sudo ip addr add 127.0.0.7/32 dev lo
```

*   `127.0.0.5`: Utilizado por el AMF de Open5GS para el plano de control.
*   `127.0.0.7`: Utilizado por el UPF para recibir paquetes GTP-U encapsulados.

---

## 2. Reenvío IP y NAT

Para que la VM Linux actúe como un router y enmascare los paquetes de salida del UE simulado:

```bash
# Habilitar reenvío en el kernel
sudo sysctl -w net.ipv4.ip_forward=1
sudo sysctl -w net.ipv4.conf.all.rp_filter=0
sudo sysctl -w net.ipv4.conf.eth0.rp_filter=0

# Enmascarar paquetes (NAT) de la subred del móvil
sudo iptables -t nat -A POSTROUTING -s 10.45.0.0/16 -o eth0 -j MASQUERADE
```

El CLI de `unuko` valida que estas reglas estén activas cada vez que ejecutas `unuko core5g start` o `unuko core5g status`.
