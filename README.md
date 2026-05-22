# Unuko 5G Core & RSP Simulation Suite 🚀

Unuko es una suite completa de simulación para **Core 5G (Open5GS)** y **Remote SIM Provisioning (RSP)** que permite emular redes 5G reales y procesos de aprovisionamiento de perfiles eSIM de forma 100% automatizada e interactiva.

El proyecto orquesta una máquina virtual en **Lima VM** que aloja el Core 5G y el simulador **UERANSIM**, ofreciendo además un Dashboard web interactivo y servidores SM-DP+ simulados con soporte para las arquitecturas de Consumo (**SGP.22**) e IoT (**SGP.32**).

---

## 🛠️ Requisitos Previos

Antes de empezar, asegúrate de tener instalado lo siguiente en tu Mac:

1. **Node.js** (versión v20 o superior recomendada)
2. **Lima VM** (para la virtualización de Linux y ejecución del Core 5G):
   ```bash
   brew install lima
   ```

---

## 🚀 Guía de Inicio Rápido (Uso Global)

### 1. Instalación de la CLI
Una vez publicado en NPM, los desarrolladores podrán instalar la CLI de Unuko de manera global. En local, puedes instalarla enlazando el paquete CLI del repositorio:

```bash
npm install -g ./apps/sim-cli
```

### 2. Aprovisionar y Arrancar la Red 5G (Lima VM)
Para crear, descargar la imagen Ubuntu, instalar dependencias e iniciar los servicios de red 5G dentro de la VM automáticamente:

```bash
unuko core5g create
```
*(Nota: El primer arranque tomará unos minutos mientras descarga y compila UERANSIM y Open5GS automáticamente).*

Para arranques posteriores:
```bash
unuko core5g start
```

### 3. Iniciar el Dashboard de Simulación
Para lanzar los servicios interactivos de Unuko (Frontend, API Backend y SM-DP+ Mock):

```bash
unuko dashboard start
```

**Direcciones y accesos locales:**
* 🌐 **Dashboard Web**: [http://localhost:3000](http://localhost:3000)
* 📖 **OpenAPI Docs (Swagger)**: [http://localhost:3000/documentation](http://localhost:3000/documentation)
* 📡 **Mock SM-DP+ Server (SGP.22 & SGP.32)**: [http://localhost:8080](http://localhost:8080)
* 🛠️ **WebUI de Open5GS**: [http://localhost:9999](http://localhost:9999) (mapeado de la VM al host)
* 🗄️ **Base de datos (MongoDB)**: `mongodb://localhost:27017`

### 4. Detener el Entorno
Cuando termines de trabajar y quieras liberar memoria RAM en tu Mac:

```bash
# Detiene el dashboard interactivo
unuko dashboard stop

# Detiene la máquina virtual Lima core5g
unuko core5g stop
```

---

## 💻 Comandos de la CLI (`unuko`)

La herramienta `unuko` expone comandos fáciles para orquestar la red de simulación:

```text
unuko <network> <command> [options]
unuko dashboard start|stop
unuko list [options]
```

### Comandos Generales:
* `unuko list`: Lista todas las redes virtualizadas (instancias de Lima VM) en tu Mac.
* `unuko dashboard start`: Inicia el backend de simulación, el mock de SM-DP+ y sirve estáticamente el frontend web.
* `unuko dashboard stop`: Apaga de forma limpia todos los procesos del dashboard liberando puertos.

### Comandos del Entorno (`network` como `core5g`):
* `unuko core5g create`: Crea, configura e instala de forma limpia una nueva instancia virtualizada.
* `unuko core5g start`: Enciende la VM e inicia la base de datos y servicios del Core 5GS.
* `unuko core5g stop`: Apaga la VM liberando recursos del Mac.
* `unuko core5g restart`: Reinicia todos los servicios del Core 5G dentro de la VM sin apagar la máquina virtual.
* `unuko core5g status`: Muestra un panel de salud interactivo del estado de la VM y de los servicios internos (mongod, open5gs, etc.).
* `unuko core5g devices`: Lista los dispositivos gNodeB y UEs simulados por UERANSIM.
* `unuko core5g logs <device-id>`: Sigue los logs en tiempo real de un dispositivo simulado específico (ej. `gnb-0x000000010` o `imsi-999700000000001`).
* `unuko core5g destroy`: Detiene y elimina permanentemente la máquina virtual y sus discos del Mac.

*Nota: Añade `--format=json` a cualquiera de los comandos anteriores para obtener una salida estructurada y programable.*

---

## 🏗️ Arquitectura y Estructura del Proyecto

El repositorio está organizado como un monorepo administrado por **Turborepo** y **pnpm**:

```text
├── apps/
│   ├── sim-backend/     # Servidor Fastify que orquesta la simulación, expone APIs y persistencia.
│   ├── sim-frontend/    # Dashboard React / Vite interactivo con visualización del Core y eSIMs.
│   ├── sim-cli/         # Entrypoint de la CLI (unuko) y scripts de empaquetado de assets.
│   ├── smdp-mockv2/     # Servidor mock SM-DP+ compatible con GSMA SGP.22 (Consumer) y SGP.32 (IoT).
│   └── smdp-mock/       # Servidor mock SM-DP+ heredado (SGP.22 básico).
├── packages/
│   ├── core/            # Reglas de negocio del gemelo digital, motores de workflow y transiciones.
│   ├── cli/             # Lógica compartida para gestionar la VM Lima a través de comandos limactl.
│   ├── ueransim-lib/    # Librería de control y generación de ficheros de configuración para UERANSIM.
│   └── adapter-*/       # Adaptadores de comunicación (HTTP, MongoDB, PKCS11, SoftHSM, etc.).
└── lima.yaml            # Configuración IaC del aprovisionamiento automatizado de la VM core5g.
```

---

## 🔧 Guía de Desarrollo (Desarrolladores del Repositorio)

Si deseas modificar código, añadir adaptadores o extender los workflows de simulación, sigue estos pasos:

### 1. Instalación de dependencias
Usa `pnpm` para la instalación de dependencias en el espacio de trabajo:
```bash
pnpm install
```

### 2. Ejecución en Modo Desarrollo
Para levantar todos los microservicios en vivo con Hot Module Reload (HMR):
```bash
pnpm dev
```
*Esto levantará el frontend en el puerto `5173`, el backend en el `3000` y el servidor SM-DP+ Mock en el `8080` en modo observador (`watch`).*

### 3. Ejecutar Tests
La suite cuenta con tests automatizados completos de backend, core y frontend que se pueden correr con:
```bash
pnpm test
```

### 4. Compilar y Empaquetar
Para preparar la CLI con los bundles estáticos antes de publicar a NPM o probar en local:

```bash
# Compila todos los paquetes y apps en JS de distribución
pnpm build

# Copia los bundles de backend, frontend y configuraciones a sim-cli/assets
pnpm --filter unuko run copy-assets

# Instala la CLI globalmente desde tu directorio local
npm install -g ./apps/sim-cli
```

---

## 🛡️ Almacenamiento de Estados y Logs

Para no interferir con tu workspace de desarrollo y garantizar que la ejecución global sea portátil y libre de errores de permisos:
* En **Desarrollo** (`pnpm dev`), los datos dinámicos de sesiones y logs se guardan localmente en el directorio `scratch/` del proyecto.
* En **Producción** (ejecución global mediante `unuko dashboard start`), todos los archivos de configuración, estado persistido de la base de datos (e.g. entorno actual) y ficheros de logs se crean y gestionan bajo la home del usuario en:
  `~/.unuko/` y `~/.unuko/data/`
