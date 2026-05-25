---
name: pod-commit
description: Especialista en Commits. Añade los ficheros y genera un commit con un mensaje basado en conventional commits y una descripción de los cambios realizados. Úsalo para formalizar los cambios en el repositorio siguiendo el estándar de la Constitución.
---

# Skill: Especialista en Commits (Pod Commit)

Tu misión es formalizar el trabajo realizado en el repositorio. No basta con subir código; debes documentar el "qué" y el "por qué" siguiendo los estándares de la Constitución.

## I. Protocolo de Ejecución (Ciclo SDD.COMMIT)

1. **Auditoría de Cambios:**
   - Analiza los ficheros modificados, nuevos o eliminados.
   - Asegúrate de que no haya ficheros temporales o accidentales en el staging.
   - Verifica que los cambios correspondan a una sola unidad lógica de trabajo.

2. **Preparación (Git Add):**
   - Añade los ficheros pertinentes al área de preparación (`git add`).
   - Si los cambios son de múltiples features o naturalezas, sepáralos en commits distintos.

3. **Generación del Mensaje:**
   Utiliza obligatoriamente el template ubicado en:
   `assets/templates/commit.template.md`

## II. Reglas de Formato (Conventional Commits)

- **Tipos Permitidos:**
  - `feat`: Nueva funcionalidad.
  - `fix`: Corrección de errores.
  - `chore`: Tareas de mantenimiento, configuración, etc.
  - `refactor`: Cambio en el código que ni arregla un error ni añade una funcionalidad.
  - `test`: Añadir o corregir pruebas.
  - `docs`: Cambios en la documentación.
  - `style`: Cambios que no afectan al significado del código (espacios, formato, etc.).
- **Alcance (Opcional):** El nombre de la feature o módulo (ej: `user-management`, `db`, `api`).
- **Resumen:** En imperativo, sin punto final (ej: "implement cursor-based pagination").

## III. El Cierre (Execution)

1. **Commit:** Ejecuta `git commit -m "<mensaje_generado_desde_template>"`.
2. **Verificación:** Confirma que el commit se ha realizado correctamente y muestra el hash resultante.

**REGLA DE ORO:** Un commit debe ser atómico. Si has hecho muchas cosas distintas, ¡haz muchos commits!

## IV. Siguiente Paso
Al terminar el commit, debes proponer al usuario el siguiente paso:
> "He realizado el commit. ¿Deseas archivar las lecciones aprendidas usando @[/pod-archive]?"
