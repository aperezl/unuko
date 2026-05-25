# ESPECIFICACIÓN: Servidor SM-DP+ de Descarga eSIM (apps/smdp-mockv2/smdp-server)
**Fecha:** 2026-05-25 18:39:00

## 1. Contexto y Objetivo de Negocio
Este módulo emula las respuestas del nodo central SM-DP+ de la red móvil según los requerimientos de la GSMA. Permite validar las fases de autenticación inicial y descargar el paquete BPP enlazado para que la eSIM virtual del terminal se configure de forma segura.

## 2. Historias de Usuario / Casos de Uso
- **Como** Chip eUICC, **quiero** autenticarme con el servidor SM-DP+, **para** generar un contexto de descarga seguro.
- **Como** Gestor de Simulación, **quiero** descargar el paquete de perfil en base a una transacción, **para** proceder con su segmentación e instalación.

## 3. Contrato de Negocio (Perspectiva Funcional)
### 3.1 Entradas (Inputs)
- **Dato:** Desafío del Terminal y Datos eUICC | **Requisito:** Obligatorio | **Descripción:** Parámetros para la autenticación criptográfica.
- **Dato:** ID de Transacción | **Requisito:** Obligatorio (para descarga) | **Descripción:** Código enlazador de la descarga de perfil.

### 3.2 Salidas (Outputs)
- **Dato:** Token de Transacción | **Significado:** Código único generado tras la autenticación.
- **Dato:** Paquete de Perfil Enlazado (BPP) | **Significado:** Perfil de red codificado y cifrado.

## 4. Reglas de Validación de Negocio
- **[BR-01] Unicidad de la Transacción:** Un ID de transacción generado sólo puede emplearse una única vez para la descarga del BPP. Peticiones posteriores con el mismo ID deben ser denegadas.
- **[BR-02] Integridad del Desafío:** Si el desafío criptográfico recibido no se ajusta al tamaño y formato seguro exigido, el servidor abortará el proceso de autenticación.

## 5. Escenarios de Éxito y Fracaso
### Escenario: Descarga exitosa de perfil eSIM
- **Dado** que se ha completado con éxito la autenticación y se dispone del ID de transacción "TX-OK-100".
- **Cuando** se solicita la descarga del perfil con el ID "TX-OK-100".
- **Entonces** el servidor devuelve el paquete BPP y marca el ID de transacción como utilizado.

---
**REGLA DE ORO:** Este documento NO debe contener detalles técnicos (lenguajes, frameworks, bases de datos).
