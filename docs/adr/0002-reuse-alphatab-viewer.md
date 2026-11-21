# ADR 0002 — Reutilizar alphaTab en la WebView

- Fecha: 2026-11-17
- Estado: arquitectura autorizada e implementada en Fase 1; render y bridge comprobados, aceptación de audio en hardware pendiente.
- Decisión de Fase 0: documentar y conservar la implementación actual, sin cambios.

## Contexto

La base fija alphaTab 1.9.0 y lo encapsula en `practiceTool/tab/tabView.ts`.
El bridge conserva bytes en `JsonStore`; el parser y el render viven en la UI.
TuxGuitar es una aplicación Java y no un componente intercambiable de esta WebView.
La evidencia y licencias están en [integración](../guitar-studio/integration.md).

## Recomendación

Reutilizar la fachada y los mensajes actuales. Mantener recursos locales, carga bajo
demanda y modo de medios externos sin síntesis de partituras. El flujo NAM/IR/FX no
recibe dependencias de notación. No añadir JVM, JNI, proceso conversor, backend ni
modelo musical paralelo. Mantener alphaTab 1.9.0 durante Fase 1.

## Alternativas

Integrar TuxGuitar implica portabilidad Java/UI, empaquetado y comunicación adicionales;
puede servir como referencia visual manual, no como dependencia del MVP. Escribir
otro lector/renderizador supone mantener formatos y notación sin ventaja demostrada.

## Consecuencias y ratificación

Menor superficie de cambio, continuidad con la base y sin nuevo runtime.
Persisten riesgos de worker/esquema local, consumo de memoria, fidelidad de archivos,
atribución y evolución de licencia. Fase 1 debe comprobar los criterios MVP en
WKWebView y audio real. Si falla una capacidad necesaria, registrar evidencia y
revisar este ADR antes de sustituir el visor; el fallo no autoriza cambios DSP.

Actualización del 2026-11-20: las pruebas con fixtures GP3–8 y ejercicio multipista
validan la reutilización técnica. Se añadió un panel acoplado y controles visuales,
sin crear otro visor o almacenamiento. Ver [validación](../guitar-studio/validation.md)
para distinguir el host WKWebView aislado, el Standalone con bridge real y las
comprobaciones manuales pendientes; no se ratifica todavía toda la matriz MVP.
