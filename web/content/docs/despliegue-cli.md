# Despliegue con el CLI de unuko

El núcleo de la red 5G, las interfaces de radio de simulación y los servidores de aprovisionamiento de eSIM se operan y orquestan bajo una única herramienta unificada de consola llamada **`unuko` CLI**.

Esta herramienta abstrae la complejidad de interactuar directamente con máquinas virtuales (como Lima), dockers, compilaciones o scripts Bash, proporcionando comandos limpios y declarativos.

---

## Comandos Principales

El formato estándar para interactuar con redes específicas es:
```bash
unuko <network> <command> [options]
```

### 1. Listar Redes Disponibles (`unuko list`)
Muestra un listado de las redes 5G configuradas y su estado actual:
```bash
unuko list
```

### 2. Arrancar el Laboratorio (`unuko <network> start`)
Inicia la máquina virtual Lima de la red especificada y arranca todos los servicios asociados:
```bash
unuko core5g start
```

### 3. Consultar el Estado del Entorno (`unuko <network> status`)
Muestra un dashboard interactivo detallando las especificaciones de la VM y el estado de cada microservicio del Core 5G y servicios del sistema:
```bash
unuko core5g status
```
*También puedes exportar este estado en formato JSON estructurado usando el flag `--format=json`: `unuko core5g status --format=json`.*

### 4. Listar Dispositivos Simulados (`unuko <network> devices`)
Permite ver las antenas y terminales UERANSIM activos con su correspondiente estado y direcciones IP:
```bash
unuko core5g devices
```

### 5. Reiniciar Servicios Core (`unuko <network> restart`)
Reinicia de manera rápida los microservicios systemd de Open5GS sin apagar la máquina virtual:
```bash
unuko core5g restart
```

### 6. Detener el Laboratorio (`unuko <network> stop`)
Apaga la máquina virtual liberando todos los recursos de memoria y procesador asignados al host:
```bash
unuko core5g stop
```
