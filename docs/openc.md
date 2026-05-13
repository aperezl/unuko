
```bash
# 1. Inicializar el token (si no lo hiciste antes)
softhsm2-util --init-token --slot 0 --label "unuko-token" --pin 1234 --so-pin 1234

# 2. Generar un par de claves ECDSA (secp256r1) que es el estándar GSMA
# Usamos pkcs11-tool (viene con el paquete opensc: brew install opensc)
pkcs11-tool --module /opt/homebrew/lib/softhsm/libsofthsm2.so \
  --login --pin 1234 \
  --keypairgen --key-type EC:prime256v1 --label "device-key" --id 01
```

Ejemplo: 

```bash
➜  unuko-rsp git:(main) ✗ pkcs11-tool --module /opt/homebrew/lib/softhsm/libsofthsm2.so \                  
  --login --pin 1234 \
  --keypairgen --key-type EC:prime256v1 --label "device-key" --id 01
Using slot 0 with a present token (0x296254a)
Key pair generated:
Private Key Object; EC
  label:      device-key
  ID:         1 (0x01)
  Usage:      decrypt, sign, signRecover, unwrap, derive
  Access:     sensitive, always sensitive, never extractable, local
  uri:        pkcs11:model=SoftHSM%20v2;manufacturer=SoftHSM%20project;serial=0374d4d58296254a;token=unuko-token;id=%01;object=device-key;type=private
Public Key Object; EC  EC_POINT 256 bits
  EC Point:   044104a2c6f59a9ef636f41b8e9122207912f7e1e170ba125788fb819196af09
              e6b13f3e335fc8270af0ced08bc87871d1aa0feff20cc81f00ae58799b76b16e
              89c941
  EC Params:  06:08:2a:86:48:ce:3d:03:01:07 ("prime256v1" OID:"1.2.840.10045.3.1.7")
  label:      device-key
  ID:         1 (0x01)
  Usage:      encrypt, verify, verifyRecover, wrap, derive
  Access:     local
  uri:        pkcs11:model=SoftHSM%20v2;manufacturer=SoftHSM%20project;serial=0374d4d58296254a;token=unuko-token;id=%01;object=device-key;type=public
  ```


# Verificar slots

```bash
softhsm2-util --show-slots
```

# forzar

```bash
softhsm2-util --init-token --free --label "unuko-token" --pin 1234 --so-pin 1234
```

ejemplo:

```bash
Slot 1 has a free/uninitialized token.
The token has been initialized and is reassigned to slot 1004348043
```