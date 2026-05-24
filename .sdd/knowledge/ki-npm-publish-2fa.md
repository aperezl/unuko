# KNOWLEDGE ITEM: NPM Publish con 2FA (Double Factor Authentication)
**Fecha:** 2026-05-24 14:31:00

## 1. Contexto del Problema
Al intentar realizar publicaciones automáticas de paquetes en el registro de NPM mediante un agente o en tareas en segundo plano no interactivas, el proceso fallará con el error `EOTP` (o error de permisos 401/404) si la cuenta de NPM del usuario tiene activada la autenticación de dos factores (2FA / OTP).

## 2. Solución / Patrón Aprobado
Para cuentas con 2FA activo:
1. El agente debe encargarse de toda la preparación local: incrementar la versión en `package.json`, construir el monorepo (`pnpm build`), y copiar/empaquetar los assets necesarios.
2. Detener el flujo automatizado antes de la publicación y pedirle al usuario que ejecute la publicación manualmente desde su terminal interactiva local para poder ingresar el código OTP o verificar vía web.
3. El usuario ejecuta:
   ```bash
   pnpm --filter unuko publish --no-git-checks --access public
   ```
4. Una vez publicado con éxito, el agente reanuda las tareas pendientes (hacer commit de la versión y hacer `git push`).

## 3. Ejemplo de Código
```bash
# Mal: Intentar publicar directamente desde procesos no interactivos
pnpm --filter unuko publish --no-git-checks --access public # Falla si requiere OTP

# Bien: Pedir acción interactiva del usuario para OTP y luego completar git
pnpm --filter unuko publish ... # (Ejecutado por el usuario en su terminal)
git add apps/sim-cli/package.json
git commit -m "chore(release): publish unuko@<versión>"
git push
```

## 4. Acción Recomendada
- [x] ¿Añadir a la Constitución? [SÍ]
- [ ] ¿Actualizar Templates? [NO]

---
**ARCHIVO:** Registro histórico para evitar errores recurrentes.
