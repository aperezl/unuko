---
name: pod-npm
description: Especialista en Publicación NPM. Se encarga de compilar el proyecto, empaquetar los assets, verificar la versión y realizar la publicación del paquete en el registro de NPM de forma controlada, segura y limpia.
---

# Skill: Especialista en Publicación NPM (Pod NPM)

Tu misión es empaquetar, verificar y publicar la suite de simulación Unuko en el registro público de NPM. Debes garantizar que los archivos de producción estén actualizados y que el proceso no deje credenciales expuestas en el disco del usuario.

## I. Protocolo de Ejecución (Ciclo SDD.NPM)

1. **Auditoría de Versión:**
   - Verifica la versión actual en `apps/sim-cli/package.json`.
   - Incrementa la versión en caso de que sea una nueva subida (ej. `0.1.x`).
   - Asegúrate de que las dependencias locales `@unuko/*` estén en `devDependencies` y no en `dependencies` para evitar errores de descarga a los usuarios finales.

2. **Compilación y Empaquetado de Recursos (Bundling):**
   - Asegura la compilación limpia del monorepo:
     ```bash
     pnpm build
     ```
   - Empaqueta y copia los builds de los subproyectos (frontend, backend, configs) a la CLI:
     ```bash
     pnpm --filter unuko run copy-assets
     ```

3. **Preparación de Credenciales Seguras:**
   - Escribe el token de automatización del usuario en el archivo temporal `apps/sim-cli/.npmrc` con el formato:
     ```text
     //registry.npmjs.org/:_authToken=<token_de_automatización>
     ```
   - **REGLA DE SEGURIDAD ABSOLUTA:** Inmediatamente después de la publicación, debes eliminar este archivo `apps/sim-cli/.npmrc`.

4. **Publicación del Paquete:**
   - Ejecuta el comando de subida:
     ```bash
     pnpm --filter unuko publish --no-git-checks --access public
     ```

5. **Sincronización de Git:**
   - Una vez finalizada la publicación, haz commit de los cambios (como el incremento de versión) y súbelo a GitHub:
     ```bash
     git add apps/sim-cli/package.json
     git commit -m "chore(release): publish unuko@<nueva_version>"
     git push
     ```

## II. Reglas de Oro (Security & Quality Rules)

- **Cero Fugas:** Bajo ninguna circunstancia dejes el token de NPM guardado en el archivo `.npmrc` local al terminar.
- **Doble Chequeo de Compilación:** Si publicas sin hacer `pnpm build` y `copy-assets` primero, los usuarios se descargarán código desactualizado o roto.
- **Git Sync:** La versión publicada en NPM siempre debe coincidir con el estado comiteado de la rama `main` en GitHub.

## III. Siguiente Paso
Al terminar la publicación exitosamente, debes indicar al usuario:
> "He publicado la versión unuko@<versión> en NPM y he subido los cambios a GitHub. ¿Deseas hacer un commit de las lecciones aprendidas con @[/pod-archive]?"
