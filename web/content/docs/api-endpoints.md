# Endpoints de Orquestación

El backend de Unuko ToolKit expone una API REST construida con **Fastify** y validada mediante esquemas **Zod**. Esta API permite controlar de forma programática las sesiones de simulación de eSIM, interactuar con el HSM y auditar los logs del core 5G.

---

## 1. Gestión de Entornos

### Obtener entorno activo
*   **Método**: `GET`
*   **Ruta**: `/v1/orchestrator/environment`
*   **Respuesta (`200 OK`)**:
    ```json
    { "environment": "lima" }
    ```

### Cambiar entorno activo
*   **Método**: `POST`
*   **Ruta**: `/v1/orchestrator/environment`
*   **Cuerpo (JSON)**:
    ```json
    { "environment": "mock" }
    ```

---

## 2. Control de Sesiones de eSIM

### Crear y arrancar nueva sesión de aprovisionamiento
*   **Método**: `POST`
*   **Ruta**: `/v1/orchestrator/session`
*   **Cuerpo (JSON)**:
    ```json
    {
      "workflowType": "sgp22",
      "eid": "89049032000008888888888888888888",
      "activationCode": "1$LPA.UNUKO.COM$CONFIRM_CODE"
    }
    ```
*   **Respuesta (`200 OK`)**:
    ```json
    {
      "status": "created",
      "sessionId": "sess_9a2f1c8e",
      "workflow": "ProvisioningWorkflow",
      "url": "/session/sess_9a2f1c8e"
    }
    ```

### Obtener logs e historial de la sesión
*   **Método**: `GET`
*   **Ruta**: `/v1/orchestrator/session/:id`
*   **Respuesta (`200 OK`)**: Retorna el estado actual de la máquina de estados lógicos de XState y la lista cronológica de payloads JSON ES9+ y comandos hexadecimales APDU de la SIM virtual.
