### Fase 0: Instalación y Preparación de macOS (Lima)

En chips Apple Silicon modernos (M1-M5), **Lima** es mucho más estable que Multipass.

**1. Instalar Lima**
```bash
brew install lima
```

**2. Crear el servidor Ubuntu**
Este comando crea una máquina virtual optimizada para tu Mac.
```bash
limactl start --name=core5g template://ubuntu
```
*(Cuando te pregunte, elige **"Proceed with the default configuration"** y espera a que termine de arrancar).*

---

### Fase 1: Despliegue del Servidor (El "Hierro")

**1. Entrar al servidor**
```bash
limactl shell core5g
```

**2. Averiguar la IP de la máquina**
Lima usa una red interna. Para acceder desde el Mac, usaremos la IP de la interfaz `lima0` o la IP local.
```bash
ip addr show lima0
```


### Fase 2: Aprovisionamiento del Sistema Operativo

Como buen sysadmin, lo primero es actualizar los repositorios e instalar las herramientas de compilación y red.

**1. Actualizar el sistema base**

```bash
sudo apt update && sudo apt upgrade -y

```

**2. Instalar dependencias esenciales**
Necesitamos compiladores de C/C++, soporte para el protocolo SCTP y herramientas de red.

```bash
sudo apt install -y curl wget git build-essential cmake gcc g++ libsctp-dev lksctp-tools iproute2 net-tools iptables software-properties-common gnupg

```

---

### Fase 3: Instalación de la Red Core (Open5GS)

Open5GS necesita una base de datos MongoDB para almacenar los perfiles de los usuarios (IMSI, claves criptográficas) y su propio software.

**1. Cargar el módulo SCTP (Vital en Apple Silicon)**
En entornos virtualizados, a veces el protocolo SCTP no se carga por defecto. Sin esto, el AMF no podrá arrancar.

```bash
sudo modprobe sctp
echo "sctp" | sudo tee -a /etc/modules
```

**2. Instalar y arrancar MongoDB (Versión oficial para ARM64)**
Ubuntu 22.04+ no incluye `mongodb` en sus repositorios base. Usaremos el repo oficial de MongoDB 7.0.

```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [ arch=arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

**3. Añadir el repositorio oficial de Open5GS e instalar**

```bash
sudo add-apt-repository -y ppa:open5gs/latest
sudo apt update
sudo apt install -y open5gs
```

**4. Verificar que los demonios están corriendo**
El Core 5G no es un solo programa, son varios microservicios (AMF, SMF, UPF, etc.). Verifica que el AMF (Access and Mobility Management Function) está activo:

```bash
systemctl status open5gs-amfd
```

*(Pulsa `q` para salir del log).*


---

### Fase 4: Enrutamiento y Firewall (NAT)

Este es el paso donde el 90% de la gente se atasca. Cuando el móvil simulado se conecte a tu red, el Core 5G le dará una IP privada (por defecto en la subred `10.45.0.0/16`) a través de una interfaz virtual llamada `ogstun`. Si no le decimos al servidor cómo enrutar ese tráfico hacia Internet, el móvil tendrá 5G, pero no tendrá acceso a la red.

**1. Habilitar el reenvío de paquetes en el kernel (IP Forwarding)**

```bash
sudo sysctl -w net.ipv4.ip_forward=1

```

**2. Configurar la regla NAT en iptables**
Esto le dice al servidor que enmascare el tráfico que viene de la red 5G para que pueda salir a Internet.

```bash
sudo iptables -t nat -A POSTROUTING -s 10.45.0.0/16 ! -o ogstun -j MASQUERADE

```

---

### Fase 5: Compilar el Simulador (UERANSIM)

Vamos a descargar el código fuente de la antena y el móvil, y lo compilaremos directamente en la máquina.

**1. Clonar el repositorio y entrar en el directorio**

```bash
cd ~
git clone https://github.com/aligungr/UERANSIM
cd UERANSIM

```

**2. Compilar el código (Make)**
Este proceso tardará unos minutos. Estás compilando toda la pila de protocolos de radio 5G.

```bash
make

```

Si todo va bien, al terminar tendrás dos binarios dentro de la carpeta `build/`: `nr-gnb` (la antena) y `nr-ue` (el móvil).

---

### Fase 6: Alta de la "Tarjeta SIM"

Para gestionar los usuarios, necesitamos la Interfaz Web de Open5GS. No está en el PPA, así que usaremos el script oficial.

**1. Instalar Node.js (Requisito)**
La WebUI corre sobre Node.js. Instalaremos la versión 20:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

**2. Instalar la Interfaz Web**
Ejecuta el script oficial de Open5GS:

```bash
curl -fsSL https://open5gs.org/open5gs/assets/webui/install | sudo -E bash -
```

**3. Configurar el usuario desde tu Mac**

* Abre Safari o Chrome en tu macOS.
* Navega a `http://<LA_IP_DE_LIMA>:3000` (la que sacaste en el paso 1).
* Usuario: `admin` / Contraseña: `1423`
* Ve a la pestaña **Subscribers** y haz clic en **Add Subscriber**.
* Vamos a usar los datos de prueba que UERANSIM trae por defecto en sus archivos de configuración:
* **IMSI:** `901700000000001`
* **Subscriber Key (K):** `465B5CE8B199B49FAA5F0A2EE238A6BC`
* **USIM Type:** OPc
* **Operator Key (OPc):** `E8ED289DEBA952E4283B54E88E6183CA`


* Guarda los cambios.

---

### Fase 7: Encendido de la Red (El momento de la verdad)

Es hora de encender la radio. Necesitarás tener **dos terminales abiertas simultáneamente** (puedes abrir otra pestaña en la terminal de tu Mac y volver a hacer `limactl shell core5g`).

**Terminal 1: Enciende la Antena (gNB)**
Le diremos que lea la configuración que viene preparada para Open5GS.

```bash
cd ~/UERANSIM
build/nr-gnb -c config/open5gs-gnb.yaml

```

*Verás logs indicando que la conexión SCTP hacia el AMF ha sido exitosa.*

**Terminal 2: Enciende el Móvil (UE)**
Requiere `sudo` porque va a crear una interfaz de red virtual en el sistema.

```bash
cd ~/UERANSIM
sudo build/nr-ue -c config/open5gs-ue.yaml

```

*Si todo está perfecto, verás un mensaje que dice `PDU Session establishment is successful` y te indicará que ha creado la interfaz `uesimtun0`.*

**Terminal 3 (o detén el proceso de la WebUI): Prueba de tráfico**
Vamos a forzar un ping a Google haciendo que el tráfico pase *obligatoriamente* por la interfaz del móvil 5G que acabas de simular.

```bash
ping -I uesimtun0 google.com

```

Si hay respuesta al ping, enhorabuena: acabas de desplegar y validar una red 5G Standalone completa desde cero.