# Curva Elíptica secp256r1

Las especificaciones de la GSMA para eSIM dictan que las firmas y la autenticación mutua de red se basen en criptografía de curvas elípticas. En particular, se utiliza el estándar **secp256r1** (también denominado `prime256v1`).

---

## Generación de Claves en el HSM

Durante la inicialización de la suite, Unuko ToolKit genera el par de claves elípticas de pruebas dentro del token de SoftHSM, asegurando que la clave privada nunca sea exportable del almacén.

El comando equivalente en consola es:

```bash
pkcs11-tool --module /opt/homebrew/lib/softhsm/libsofthsm2.so \
  --login --pin 1234 \
  --keypairgen --key-type EC:prime256v1 --label "device-key" --id 01
```

*   `--key-type EC:prime256v1`: Define la curva elíptica secp256r1 de 256 bits.
*   `--label "device-key"`: Identificador del objeto de par de claves en el HSM.
*   `--id 01`: Identificador hexadecimal único.

---

## Verificación de Claves Creadas

Puedes comprobar que el token de SoftHSM ha guardado correctamente el par de claves consultando el estado desde el CLI:

```bash
unuko status --hsm --keys
```
*Este comando retornará el listado de objetos públicos y privados de curva elíptica almacenados de forma segura dentro del token `unuko-token`.*
