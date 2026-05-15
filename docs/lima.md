Esta es una guía rápida y profesional para gestionar tu instancia de **Lima** configurada para el proyecto **Unuko RSP**, específicamente enfocada en la máquina `core5g` que utilizas para Open5GS y UERANSIM.

# 🚀 Guía de Gestión de Lima (Instancia `core5g`)

Esta guía cubre los comandos esenciales para operar el entorno de red 5G virtualizado en tu macOS.

## 1. Control de Energía y Memoria

Para gestionar el ciclo de vida de la máquina virtual y **liberar recursos del Mac**:

| Acción | Comando | Descripción |
| :--- | :--- | :--- |
| **Encender** | `limactl start core5g` | Inicia la VM y reserva la memoria RAM configurada. |
| **Apagar** | `limactl stop core5g` | Detiene la VM y **libera toda la memoria RAM** en tu Mac. |
| **Estado** | `limactl list` | Verifica si la instancia está `Running` (consumiendo recursos) o `Stopped`. |
| **Forzar Apagado** | `limactl stop -f core5g` | Úsalo si el proceso de liberación de memoria se bloquea. |

---

## 2. Gestión de Servicios Internos (Open5GS)

Si la VM está encendida pero necesitas reiniciar solo el Core 5G para aplicar cambios o liberar memoria interna:

### Reiniciar todos los servicios de Open5GS
```bash
limactl shell core5g sudo systemctl restart "open5gs-*"
```

### Apagar servicios para ahorrar CPU (sin apagar la VM)
```bash
limactl shell core5g sudo systemctl stop "open5gs-*"
```

### Ver estado de los servicios
```bash
limactl shell core5g sudo systemctl status "open5gs-*"
```

---

## 3. Acceso y SSH

Existen varias formas de entrar en la terminal de la máquina:

### A. El método nativo (Recomendado)
```bash
limactl shell core5g
```

### B. SSH Estándar (vía alias)
```bash
lima ssh core5g
```

---

## 4. Gestión y Mantenimiento

### Editar recursos (CPU/RAM)
Si notas que el sistema va lento, puedes aumentar los recursos asignados:
```bash
limactl edit core5g
```
> [!IMPORTANT]
> Debes hacer `stop` y `start` para que los cambios de CPU/RAM surtan efecto.

### Transferencia de Archivos
```bash
# Del Mac a la VM
lima scp local-file.txt core5g:/home/aperezl/

# De la VM al Mac
lima scp core5g:/tmp/log.txt ./
```

---

## 5. Notas Específicas para Unuko RSP

En tu entorno actual (`core5g`):
- **WebUI de Open5GS**: [http://localhost:9999](http://localhost:9999) (Mapeado automáticamente).
- **Rutas de Binarios**: `/home/aperezl/UERANSIM/build/`.
- **Logs en tiempo real**: 
  ```bash
  limactl shell core5g sudo tail -f /var/log/open5gs/*.log
  ```

---

## 6. Resolución de Problemas

Si la máquina se queda en estado `Broken` o quieres **limpiar todo rastro**:

1. **Eliminar y Recrear** (Borra el disco de la VM):
   ```bash
   limactl delete core5g
   limactl start core5g
   ```

> [!TIP]
> Añade `alias l='limactl'` a tu archivo `~/.zshrc` para gestionar tu entorno con una sola letra.