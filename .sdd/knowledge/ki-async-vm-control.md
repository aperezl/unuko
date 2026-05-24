# KNOWLEDGE ITEM: Control Asíncrono de VMs y Recarga de Contexto
**Fecha:** 2026-05-24 15:23:00

## 1. Contexto del Problema
Al integrar el control y la monitorización de instancias de Lima VM directamente desde la API del backend en Fastify y el dashboard de React, nos topamos con dos retos críticos de bloqueo y sincronización:
1. Las llamadas a comandos del CLI de terminal para arrancar (`lima start`) o parar (`lima stop`) máquinas virtuales son altamente costosas en tiempo. El uso de `execSync` en los casos de uso del backend bloquea por completo el hilo principal de Node.js/Fastify, impidiendo responder a otras peticiones durante más de 30-40 segundos.
2. Al cambiar la máquina virtual activa en el backend, los adaptadores de infraestructura dependientes (UERANSIM, Open5gs) se instancian dinámicamente en el contenedor de dependencias. Si el frontend mantiene el estado anterior en memoria, se producen inconsistencias de datos.

## 2. Solución / Patrón Aprobado
1. **Control de VMs no bloqueante:** En lugar de sincronizar comandos largos, se levanta el proceso con `child_process.exec`, retornando inmediatamente una respuesta exitosa (por ejemplo, `202` Accepted) e iniciando la transición en segundo plano. La interfaz del frontend debe realizar sondeo (polling) periódico para reflejar los cambios de estado transicionales (`starting`, `stopping`, `running`, `stopped`).
2. **Reinicio de Contexto en el Frontend:** En vez de intentar sincronizar manualmente cada store de React al cambiar la VM activa, se ejecuta un refresco completo de la aplicación (`window.location.reload()`) tras la confirmación de cambio exitoso. Esto limpia el estado cargado en memoria y garantiza que todas las llamadas API subsiguientes utilicen la configuración de la nueva VM activa.

## 3. Ejemplo de Código
```typescript
// Mal - Bloquea el hilo del Servidor Fastify
export class EnvironmentUseCase {
  public startVm(vmName: string): void {
    execSync(`limactl start ${vmName}`);
  }
}

// Bien - Ejecuta de forma asíncrona sin bloquear el hilo principal
export class EnvironmentUseCase {
  public async startVm(vmName: string): Promise<void> {
    // Registra la llamada y ejecuta asíncronamente
    exec(`limactl start ${vmName}`, (error) => {
      if (error) {
        console.error(`Error starting VM ${vmName}:`, error);
      }
    });
  }
}
```

## 4. Acción Recomendada
- [x] ¿Añadir a la Constitución? [SÍ]
- [ ] ¿Actualizar Templates? [NO]

---
**ARCHIVO:** Registro histórico para evitar errores recurrentes.
