# KNOWLEDGE ITEM: Organización Jerárquica de Especificaciones (SDD.FEATURES)
**Fecha:** 2026-05-25 19:10:00

## 1. Contexto del Problema
Inicialmente, la suite Unuko RSP utilizaba una organización plana de características en la carpeta `.sdd/features/<feature-name>/`. Sin embargo, al tener un monorepo complejo con múltiples librerías internas (`packages/*`) y aplicaciones independientes (`apps/*`), la estructura plana provocaba confusión sobre qué especificación técnica y de negocio correspondía a cada componente físico, además de dificultar el control de alcance de las tareas de desarrollo.

## 2. Solución / Patrón Aprobado
Para monorrepos y arquitecturas modulares, las características y especificaciones de SDD deben estructurarse de manera jerárquica distinguiendo el tipo de componente (`packages` o `apps`) y el nombre del módulo/aplicación:

```text
.sdd/features/
├── packages/
│   └── <package-name>/
│       └── <feature-name>/
│           ├── <feature-name>.spec.md
│           ├── <feature-name>.plan.md
│           ├── <feature-name>.tasks.md
│           ├── <feature-name>.verify.md
│           └── <feature-name>.evidence.md
└── apps/
    └── <app-name>/
        └── <feature-name>/
            └── ...
```

## 3. Ejemplo de Código

```typescript
// Mal (Ruta plana antigua en las skills de desarrollo)
Ubicación: `.sdd/features/<feature-name>/<feature-name>.spec.md`

// Bien (Ruta jerárquica obligatoria para monorrepos)
Ubicación: `.sdd/features/<packages|apps>/<package-or-app-name>/<feature-name>/<feature-name>.spec.md`
```

## 4. Acción Recomendada
- [x] ¿Añadir a la Constitución? [SÍ]
- [ ] ¿Actualizar Templates? [NO]

---
**ARCHIVO:** Registro histórico para evitar errores recurrentes.
