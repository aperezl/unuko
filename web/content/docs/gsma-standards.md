# Estándares GSMA: SGP.22 vs SGP.32

El aprovisionamiento de tarjetas eSIM se rige por las especificaciones de la **GSMA** (Global System for Mobile Communications Association). Unuko ToolKit da soporte nativo a los dos principales modelos de arquitectura para desarrollo y pruebas:

---

## GSMA SGP.22 (Consumer Architecture)

Diseñado para dispositivos comerciales orientados al usuario final (como smartphones, tablets y relojes inteligentes).

*   **Modelo de Operación**: Modelo de "Tirón" (**Pull**).
*   **LPA (Local Profile Assistant)**: Un módulo de software en el dispositivo interactúa con el usuario (por ejemplo, escaneando un código QR) y solicita la descarga de la eSIM conectándose al servidor SM-DP+ a través de la interfaz **ES9+** (HTTP REST con payloads JSON).
*   **Seguridad**: Autenticación mutua entre el chip eUICC y el servidor utilizando curvas elípticas, garantizando que el perfil se encripte de forma exclusiva para el eUICC destino.

---

## GSMA SGP.32 (IoT Architecture)

Es la nueva especificación diseñada para dispositivos IoT y máquinas industriales (M2M) donde los terminales no disponen de pantalla o entrada de usuario.

*   **Modelo de Operación**: Modelo de "Empuje" (**Push**).
*   **eIM (eSIM IoT Manager)**: Un componente centralizado de control remoto orquesta las descargas y envía instrucciones directas al dispositivo a través de la interfaz **ESips**.
*   **IPA (IoT Profile Assistant)**: Simplifica el LPA tradicional y actúa bajo mandatos directos del eIM.

---

## Comparativa de Arquitectura

| Característica | SGP.22 (Consumo) | SGP.32 (IoT) |
| :--- | :--- | :--- |
| **Disparador de la descarga** | Usuario final (QR, menú) | Servidor de control (eIM) |
| **Interfaz de Aprovisionamiento** | ES9+ (LPA a SM-DP+) | ESips / ES8+ |
| **Interactividad** | Alta (Requiere consentimiento) | Cero (Totalmente automatizado) |
| **Casos de Uso** | Smartphones, Relojes, Laptops | Contadores de agua, Automoción, Sensores |
