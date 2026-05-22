# Alta de Dispositivo

Para que un terminal simule su conexión a la antena de radio 5G y tenga salida a Internet, debe darse de alta tanto en el simulador de hardware como en la base de datos de abonados de Open5GS.

El CLI de `unuko` simplifica y automatiza el inicio y la coordinación de estas simulaciones de radio.

---

## 1. Alta en Open5GS WebUI

1.  Abre el navegador en tu host macOS y accede al panel de control de Open5GS en [http://localhost:9999](http://localhost:9999).
2.  Inicia sesión con las credenciales por defecto:
    *   **Usuario**: `admin`
    *   **Contraseña**: `1423`
3.  Ve a la sección **Subscribers** y haz clic en **Add Subscriber**.
4.  Rellena el formulario con los parámetros del eUICC virtual:
    *   **IMSI**: `901700000000001`
    *   **Subscriber Key (K)**: `465B5CE8B199B49FAA5F0A2EE238A6BC`
    *   **USIM Type**: OPc
    *   **Operator Key (OPc)**: `E8ED289DEBA952E4283B54E88E6183CA`
5.  Haz clic en **Save** para confirmar.

## 2. Monitoreo de Dispositivos con `unuko`

El CLI de `unuko` permite listar todos los dispositivos simulados por la pila UERANSIM (antenas gNodeB y teléfonos UE) que han sido aprovisionados y registrados en el entorno:

### Listar los dispositivos activos
```bash
unuko core5g devices
```
*Este comando consultará el controlador de UERANSIM dentro de la máquina virtual y mostrará el identificador del dispositivo, su tipo, estado de ejecución, dirección IP asignada y estado de conexión.*

---

## 3. Inspección de Logs en Tiempo Real

Puedes inspeccionar y seguir los logs detallados de cualquier dispositivo UE o gNodeB simulado directamente usando el CLI:

### Seguir logs de un dispositivo
```bash
unuko core5g logs <device-id>
```
*Por ejemplo, para seguir el registro de conexión de un móvil específico: `unuko core5g logs imsi-999700000000001`.*
