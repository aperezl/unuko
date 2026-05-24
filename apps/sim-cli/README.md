# Unuko 5G Core & RSP Simulation Suite 🚀

Unuko is a comprehensive simulation suite for **5G Core (Open5GS)** and **Remote SIM Provisioning (RSP)** that allows emulation of real 5G networks and eSIM profile provisioning processes in a 100% automated and interactive way.

The project orchestrates a virtual machine using **Lima VM** that hosts the 5G Core and the **UERANSIM** simulator, also offering an interactive web Dashboard and simulated SM-DP+ servers supporting both Consumer (**SGP.22**) and IoT (**SGP.32**) architectures.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your Mac:

1. **Node.js** (v20 or higher recommended)
2. **Lima VM** (for Linux virtualization and running the 5G Core):
   ```bash
   brew install lima
   ```

---

## 🚀 Quick Start Guide (Global Usage)

### 1. Installing the CLI
Install the Unuko CLI globally from NPM:

```bash
npm install -g unuko
```

*(For local development/testing, you can install it by linking the repository's CLI package: `npm install -g ./apps/sim-cli`)*

### 2. Provision and Start the 5G Network (Lima VM)
To create, download the Ubuntu image, install dependencies, and automatically start the 5G network services inside the VM:

```bash
unuko create core5g
```
*(Note: The first boot will take a few minutes as it automatically downloads and builds UERANSIM and Open5GS).*

For subsequent starts:
```bash
unuko start core5g
```

### 3. Start the Simulation Dashboard
To launch Unuko's interactive services (Frontend, API Backend, and SM-DP+ Mock):

```bash
unuko dashboard start
```

**Local addresses and access endpoints:**
* 🌐 **Web Dashboard**: [http://localhost:3000](http://localhost:3000)
* 📖 **OpenAPI Docs (Swagger)**: [http://localhost:3000/documentation](http://localhost:3000/documentation)
* 📡 **Mock SM-DP+ Server (SGP.22 & SGP.32)**: [http://localhost:8080](http://localhost:8080)
* 🛠️ **Open5GS WebUI**: [http://localhost:9999](http://localhost:9999) (mapped from the VM to your host)
* 🗄️ **Database (MongoDB)**: `mongodb://localhost:27017`

### 4. Stop the Environment
When you're done working and want to free up RAM on your Mac:

```bash
# Stops the interactive dashboard
unuko dashboard stop

# Stops the Lima core5g virtual machine
unuko stop core5g
```

---

## 💻 CLI Commands (`unuko`)

The `unuko` tool exposes simple commands to orchestrate the simulation network:

```text
unuko <command> <network> [options]
unuko dashboard start|stop
unuko list [options]
```

### General Commands:
* `unuko list`: Lists all virtualized networks (Lima VM instances) on your Mac.
* `unuko dashboard start`: Starts the simulation backend, SM-DP+ mock, and statically serves the web frontend.
* `unuko dashboard stop`: Cleanly shuts down all dashboard processes, freeing up ports.

### Environment Commands (`network` such as `core5g`):
* `unuko create core5g`: Cleanly creates, configures, and installs a new virtualized instance.
* `unuko start core5g`: Turns on the VM and starts the 5GS Core services and database.
* `unuko stop core5g`: Shuts down the VM to free up Mac resources.
* `unuko restart core5g`: Restarts all 5G Core services inside the VM without powering off the virtual machine.
* `unuko status core5g`: Shows an interactive health panel displaying VM status and internal services (mongod, open5gs, etc.).
* `unuko devices core5g`: Lists the gNodeB and UEs simulated by UERANSIM.
* `unuko logs core5g <device-id>`: Follows real-time logs of a specific simulated device (e.g., `gnb-0x000000010` or `imsi-999700000000001`).
* `unuko destroy core5g`: Stops and permanently removes the virtual machine and its disks from your Mac.

*Note: Append `--format=json` to any command above to get structured, programmable output.*

---

## 🏗️ Architecture and Project Structure

The repository is organized as a monorepo managed by **Turborepo** and **pnpm**:

```text
├── apps/
│   ├── sim-backend/     # Fastify server orchestrating the simulation, exposing APIs, and persistence.
│   ├── sim-frontend/    # Interactive React / Vite dashboard displaying the Core and eSIMs.
│   ├── sim-cli/         # Unuko CLI entry point and asset bundling scripts.
│   ├── smdp-mockv2/     # SM-DP+ mock server compatible with GSMA SGP.22 (Consumer) and SGP.32 (IoT).
│   └── smdp-mock/       # Legacy SM-DP+ mock server (basic SGP.22).
├── packages/
│   ├── core/            # Business rules for the digital twin, workflow engines, and transitions.
│   ├── cli/             # Shared logic to manage the Lima VM using limactl commands.
│   ├── ueransim-lib/    # Control library and configuration file generator for UERANSIM.
│   └── adapter-*/       # Communication adapters (HTTP, MongoDB, PKCS11, SoftHSM, etc.).
└── lima.yaml            # IaC configuration for automated provisioning of the core5g VM.
```

---

## 🔧 Development Guide (Repository Contributors)

If you want to modify code, add adapters, or extend simulation workflows:

### 1. Install Dependencies
Use `pnpm` to install dependencies in the workspace:
```bash
pnpm install
```

### 2. Run in Development Mode
To spin up all microservices live with Hot Module Reload (HMR):
```bash
pnpm dev
```
*This starts the frontend on port `5173`, the backend on `3000`, and the SM-DP+ Mock server on `8080` in watch mode.*

### 3. Run Tests
The suite has a comprehensive automated test suite for the backend, core, and frontend:
```bash
pnpm test
```

### 4. Build and Package
To prepare the CLI with static bundles before publishing to NPM or testing locally:

```bash
# Compile all packages and apps into distribution JS
pnpm build

# Copy backend, frontend, and config bundles to sim-cli/assets
pnpm --filter unuko run copy-assets

# Install the CLI globally from your local directory
npm install -g ./apps/sim-cli
```

---

## 🛡️ State and Log Storage

To avoid cluttering your development workspace and ensure the global execution is portable and free of permissions errors:
* In **Development** (`pnpm dev`), dynamic session data and logs are stored locally in the project's `scratch/` directory.
* In **Production** (global execution via `unuko dashboard start`), all configuration files, persistent database state (e.g., current environment), and log files are created and managed under the user's home directory:
  `~/.unuko/` and `~/.unuko/data/`
