# Requisitos de Sistema

Para desplegar y ejecutar Unuko ToolKit de forma local, tu entorno de desarrollo debe cumplir con las siguientes especificaciones y dependencias.

---

## Sistema Operativo y Hardware

*   **Arquitectura**: Apple Silicon (M1, M2, M3, M4, M5) o Intel x86_64.
*   **Sistema Operativo**: macOS 13+ (Ventura o posterior) o Linux (Ubuntu 22.04 LTS recomendado).
*   **Recursos Recomendados**:
    *   Mínimo: 4 núcleos de CPU, 8 GB de RAM, 20 GB de espacio libre en disco.
    *   Recomendado: 8 CD de CPU, 16 GB de RAM.

---

## Software Requerido

Debes instalar las siguientes herramientas en tu host local antes de iniciar:

### 1. Homebrew (macOS)
Gestor de paquetes para instalar dependencias de desarrollo:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Lima VM y SoftHSM
Herramientas necesarias para la virtualización ligera y la emulación de criptografía por hardware:
```bash
brew install lima softhsm opensc
```

### 3. Node.js
Entorno de ejecución de JavaScript (versión 20 o posterior):
```bash
brew install node
```

---

## Instalación del CLI `unuko`

El ToolKit viene con su propia herramienta de comandos unificada. Una vez clonado el repositorio, instala el CLI de forma global en tu sistema para tener acceso al comando `unuko`:

```bash
cd unuko-toolkit
npm install -g .
```

Prueba la instalación verificando la versión:
```bash
unuko --version
```
