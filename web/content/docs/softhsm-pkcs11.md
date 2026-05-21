# SoftHSM y PKCS#11

El almacenamiento seguro y la generación de claves en un entorno conforme a la GSMA requiere el uso de un módulo de seguridad de hardware (HSM). En Unuko emulamos este componente físico usando **SoftHSMv2** a través de la API estándar **PKCS#11**.

El CLI de `unuko` se encarga de automatizar la inicialización y el montaje del token criptográfico por debajo al arrancar el laboratorio, evitando comandos manuales complejos.

---

## Inicialización del Token (Bajo el Capó)

Durante la fase de configuración, el comando `unuko up` ejecuta internamente la inicialización de la ranura virtual de SoftHSM:

```bash
softhsm2-util --init-token --slot 0 --label "unuko-token" --pin 1234 --so-pin 1234
```

*   `--slot 0`: Posición del token.
*   `--label "unuko-token"`: Identificador del token utilizado por el adaptador de Node.js.
*   `--pin 1234`: PIN de acceso para operaciones de firma y cifrado.

---

## Verificación Manual de Slots Activos

Si deseas inspeccionar los tokens criptográficos y comprobar su estado o ranura asignada:

```bash
unuko status --hsm
```
*Este comando listará los slots lógicos detectados en el sistema por el driver dinámico de SoftHSM.*

---

## Drivers del Sistema

Los adaptadores en TypeScript de Unuko cargan la biblioteca PKCS#11 localizando el driver binario según la plataforma:

*   **macOS (Homebrew)**: `/opt/homebrew/lib/softhsm/libsofthsm2.so`
*   **Linux (apt)**: `/usr/lib/softhsm/libsofthsm2.so`
