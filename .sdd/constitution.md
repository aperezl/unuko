# CONSTITUCIÓN DEL PROYECTO: Unuko 5G & RSP Simulation Suite

## I. Stack Tecnológico Soberano
- **Runtime:** Node.js (v20 o superior recomendado, con `pnpm` como gestor de paquetes y espacio de trabajo)
- **Lenguaje:** TypeScript (con configuraciones estrictas, compilación ESM mediante `tsup`)
- **Framework Web / APIs:** Fastify (en `apps/sim-backend` y `apps/smdp-mockv2`)
- **Frontend Framework:** React (con Vite y Monaco Editor en `apps/sim-frontend`)
- **Persistencia / Base de Datos:** MongoDB (en puerto local 27017, mapeado al host y gestionado a través de `packages/adapter-mongodb`)
- **Motor de Estados (Workflows):** XState v5 (en `packages/core` para modelar el comportamiento del gemelo digital y las transiciones)
- **Validación:** Zod (usado en frontera de APIs, CLI y parseo de configuraciones dinámicas)

## II. Leyes de Hierro (Reglas de Oro)
1. **Soberanía de la Frontera (Validación estricta):** Cualquier dato entrante a través de llamadas API, la CLI de terminal, o ficheros YAML de workflow debe ser validado de forma mandatoria con esquemas de Zod antes de ingresar al dominio.
2. **Prohibición de Tipos Implícitos (`any`):** Se limita el uso de `any` en el código. Debe priorizarse el tipado fuerte y el uso de `unknown` en datos dinámicos.
3. **Aislamiento de la Lógica de Negocio (Core):** Las reglas del negocio del gemelo digital y los motores de estados deben residir únicamente en `packages/core`, manteniéndose 100% agnósticas de la infraestructura (Fastify, la CLI de terminal o base de datos).

## III. Arquitectura de Carpetas (Monorepo)
```text
unuko-rsp/
├── apps/
│   ├── sim-backend/      # API Fastify y orquestación de simulación
│   ├── sim-frontend/     # Dashboard React + editor Monaco
│   ├── sim-cli/          # CLI principal (unuko) y bundles
│   └── smdp-mockv2/      # Servidor mock SM-DP+ (SGP.22 / SGP.32)
├── packages/
│   ├── core/             # Lógica del dominio y workflows XState
│   ├── cli/              # Lógica para gestionar la VM Lima con comandos
│   ├── ueransim-lib/     # Generador de configuraciones UERANSIM
│   └── adapter-*/        # Adaptadores (HTTP, MongoDB, PKCS11)
├── config/               # Ficheros YAML/JSON de configuración semilla
└── lima.yaml             # Configuración IaC de la VM (para Lima VM)
```

## IV. Convenciones y Calidad
- **Tests:** Vitest (ejecutados de forma unificada mediante Turborepo con `pnpm test`)
- **Calidad de Código:** Compilación TypeScript estricta.
- **Commits:** Conventional Commits (administrado bajo el estándar de `@/pod-commit`)
- **Estructura SDD:** La documentación de desarrollo (especificaciones, planos técnicos, tareas y evidencias) debe organizarse jerárquicamente bajo `.sdd/features/<packages|apps>/<nombre-módulo>/<nombre-feature>/` para monorrepos complejos.
- **Publicación:** Registro NPM mediante `@/pod-npm` (empaquetando assets bajo demanda de forma controlada y segura)

---
**SOBERANÍA:** Cualquier cambio en este documento debe ser aprobado por el Propietario del Proyecto.
