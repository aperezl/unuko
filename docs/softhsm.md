# Instalación

```bash
brew install softhsm
```

Una vez instalado, el driver (la librería dinámica .so) suele ubicarse en:
`/opt/homebrew/lib/softhsm/libsofthsm2.so`

Necesitarás crear un token para empezar:

```bash
softhsm2-util --init-token --slot 0 --label "unuko-token" --pin 1234 --so-pin 1234
```