# ESPECIFICACIÓN: Generador de Configuración de Terminales y Radio (packages/ueransim-lib/config-builder)
**Fecha:** 2026-05-25 18:37:00

## 1. Contexto y Objetivo de Negocio
Este módulo se encarga de estructurar y formatear los parámetros técnicos y de red necesarios para que los simuladores de terminales de usuario (UE) y de antenas de radio (gNodeB) puedan enlazarse entre sí y conectarse con el núcleo 5G (Core).

## 2. Historias de Usuario / Casos de Uso
- **Como** Orquestador de Red, **quiero** generar la configuración de un terminal con sus identificadores criptográficos y de red, **para** posibilitar su simulación en el aire.
- **Como** Diseñador de Topología, **quiero** construir la configuración de una celda de radio definiendo sus slices (rebanadas de red), **para** simular arquitecturas segmentadas.

## 3. Contrato de Negocio (Perspectiva Funcional)
### 3.1 Entradas (Inputs)
- **Dato:** Identificador de Suscriptor (SUPI) | **Requisito:** Obligatorio (para UE) | **Descripción:** Código identificativo del abonado.
- **Dato:** Claves de Autenticación | **Requisito:** Obligatorio (para UE) | **Descripción:** Llaves criptográficas de la SIM.
- **Dato:** Configuración de Rebanadas de Red (Slices) | **Requisito:** Opcional | **Descripción:** Identificadores SST y SD de rebanadas.

### 3.2 Salidas (Outputs)
- **Dato:** Archivo Estructurado de Configuración | **Significado:** El YAML final para el simulador correspondiente.

## 4. Reglas de Validación de Negocio
- **[BR-01] Limpieza de Campos Criptográficos:** Los campos Key y OP/OPC deben ser formateados eliminando cualquier espacio en blanco o tabulador interno.
- **[BR-02] Normalización del Diferenciador de Rebanada (SD):** El valor de SD de una rebanada debe forzarse a formato hexadecimal (añadiendo "0x" al inicio si no se incluye) para su correcto procesamiento.

## 5. Escenarios de Éxito y Fracaso
### Escenario: Asignación de rebanada de red por defecto
- **Dado** que el usuario no proporciona rebanadas de red específicas para la configuración del terminal.
- **Cuando** se genera la configuración.
- **Entonces** el sistema inyecta la rebanada por defecto de internet (SST: 1) para asegurar la conectividad básica.

---
**REGLA DE ORO:** Este documento NO debe contener detalles técnicos (lenguajes, frameworks, bases de datos).
