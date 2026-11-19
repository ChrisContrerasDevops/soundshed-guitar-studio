# Tarea actual — preparar la validación del MVP heredado (Fase 1)

**Estado:** Fase 0 revalidada: build y arranque resueltos, resultados y fallos
heredados registrados. Fase 1 preparada, **sin iniciar implementación**.
**Fecha:** 2026-11-18 (America/Santiago).
**Base inmutable de comparación:** `a9f4fec1123d51218e090decaceec44c455740b5`.
**HEAD al iniciar esta tarea:** `7863d35` (documentación de Fase 0 ya incorporada).

## Trabajo realizado y límites

CMake/CTest quedaron aislados en `.cache/phase0-toolchain`; npm y los submódulos
se instalaron en sus versiones originales. Compilaron Standalone Release arm64 y
core Debug. El usuario confirmó que el programa abrió tras aceptar los avisos del
sistema y micrófono. Los cinco perfiles Codex fueron invocados con su selector
nativo. El [informe de validación](guitar-studio/validation.md) concentra comandos,
resultados, fallos y límites de evidencia; no duplicarlos aquí.

No se modificaron fuentes del producto, motor DSP, manifiestos, lockfile ni pins.
La única configuración global modificada por el agente fue la confianza Codex de
**este repositorio**, autorizada expresamente por el usuario. Cualquier otro cambio
global o instalación de herramientas del sistema necesita autorización previa.
No hacer commits, push ni instalar plugins automáticamente.

## Próxima tarea: validar el visor existente antes de corregir brechas

Leer [AGENTS](../AGENTS.md), [producto](guitar-studio/product.md), el mapa de
reutilización de [arquitectura](guitar-studio/architecture.md),
[pruebas](guitar-studio/testing.md) y [ADR 0002](adr/0002-reuse-alphatab-viewer.md).
Reutilizar alphaTab 1.9.0, el bridge, las vistas y la persistencia existentes.
No crear otro lector ni añadir síntesis, JVM o integración DSP.

### Dependencias de entrada

1. Corpus con derechos de uso, procedencia/hash y contenido conocido por generación
   GP3/4/5/GPX6/GP7/GP8; incluir multipista y casos inválidos/acotados. Los fixtures
   alphaTex de los tests no sustituyen archivos GP reales.
2. Interfaz/driver, entrada DI, preset NAM+IR+FX y monitorización definidos; registrar
   sample rate, buffer y baseline antes de medir. No cambiar dispositivos ni permisos
   globales de forma automática.
3. Resolver o clasificar explícitamente el fallo de `StartupPresetDeferralTests`
   (rutas del fixture en macOS) y los nueve incumplimientos de tamaño C++ antes de
   aceptar MVP-08. No elevar presupuestos ni modificar DSP para ocultarlos.
4. Reutilizar el artefacto y comandos validados; no repetir descargas ni suites
   completas si no hubo cambios o fallos que lo justifiquen.

### Ejecución y aceptación

Comprobar en WKWebView los escenarios [MVP-01…MVP-09](guitar-studio/acceptance.md):
diálogo/arrastre, pistas/vistas, apertura offline, errores/límites, recall y ciclos
de vida; después concurrencia con audio y comparación A/B conforme al protocolo.
Registrar la asimetría de `.gp7` entre diálogo y arrastre como caso a verificar,
sin confundir extensión con generación del formato. Medir el presupuesto de recursos
a partir de la base; no inventar umbrales.

Cada criterio debe tener resultado y evidencia o una brecha reproducible. Si hace
falta corregirla, especificar y acotar el cambio antes de implementarlo. Ratificar
ADR 0002 solo con evidencia de render local y continuidad de audio. El build y la
apertura de Fase 0 no certifican todavía el MVP.

Licencia, branding, servicios SoundShed y distribución permanecen fuera de esta
tarea; decisiones pendientes en [roadmap](guitar-studio/roadmap.md).
