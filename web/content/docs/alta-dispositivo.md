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

---

## 2. Configuración e Inicio de la Simulación con `unuko`

En lugar de levantar manualmente los binarios `nr-gnb` y `nr-ue` en consolas separadas, el CLI de `unuko` se encarga de arrancar y enlazar la antena (gNodeB) y el terminal de usuario (UE) en un solo paso:

### Iniciar la simulación de radio
```bash
unuko up ueransim
```
*Este comando arrancará la antena virtual, esperará a que establezca la comunicación SCTP con el AMF de Open5GS y, posteriormente, levantará el móvil creando la interfaz TUN `uesimtun0`.*

---

## 3. Pruebas de Tráfico

Una vez levantada la interfaz virtual, puedes verificar que el móvil 5G tiene salida a Internet forzando que los pings viajen a través del túnel de simulación:
```bash
unuko ping google.com
```
*El comando `unuko ping` encapsula la llamada usando la interfaz virtual `uesimtun0` y reporta la latencia real y el tráfico a través del Core Network 5G.*
