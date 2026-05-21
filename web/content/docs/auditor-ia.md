# Auditoría de Logs con IA

Uno de los mayores retos al depurar flujos de aprovisionamiento de eSIM es la opacidad de los códigos de error. Un fallo en la instalación suele devolver simplemente un código hexadecimal de estado APDU (como `6F00` o `6A80`) o un error genérico REST de la GSMA.

Para simplificar esto, Unuko ToolKit integra un **Auditor de Logs con IA** alimentado por los modelos **Google Gemini** (a través de la API oficial de Gemini).

---

## Cómo Funciona la Auditoría

1.  **Recolección de Telemetría**: El orquestador de Unuko registra cada mensaje HTTP intercambiado con osmo-smdpp (Fase de transporte) y cada comando APDU enviado a la SIM virtual (Fase de chip).
2.  **Generación de Prompt Contextual**: Al solicitar una auditoría desde el dashboard web, el sistema consolida la secuencia temporal de logs, inyecta la especificación GSMA aplicable (SGP.22/32) como contexto y la envía a Gemini.
3.  **Análisis y Traducción**: La IA analiza dónde se rompió la cadena (por ejemplo, firmas de certificados inválidas, fallos de cifrado de perfil, claves maestras incorrectas) y devuelve una explicación detallada en lenguaje natural.

---

## Ejemplo de Diagnóstico de la IA

Supongamos que el eUICC responde con el código de estado `6A88` (Referenced data not found) al recibir la carga de un bloque del perfil.

### Entrada al Auditor
*   **Log APDU**: `80E29100...` -> RAPDU: `6A88`

### Diagnóstico de Gemini
> **[IA] Diagnóstico de Fallo en Instalación**:
> El chip virtual ha retornado el código `6A88`, que significa *'Datos referenciados no encontrados'*. Esto suele indicar que el perfil que se intenta cargar requiere una clave de dominio de seguridad del emisor (ISD-R) que no se ha inicializado o autenticado previamente durante la fase ES9+.
> 
> **Acciones sugeridas**:
> 1. Verifica si el paso `initiateAuthentication` usó el certificado del servidor SM-DP+ de pruebas correcto.
> 2. Asegúrate de que el token de SoftHSM no se haya corrompido y contenga la clave `device-key` cargada.
