# Tarea actual — Fase 1: visor integrado, aceptación pendiente

**Estado al 2026-11-20 (America/Santiago):** implementación y validaciones técnicas
realizadas; el usuario confirmó interfaz visible y apertura de la partitura en la
build normal tras reiniciar.
La aceptación de audio en hardware sigue pendiente por falta de equipo disponible.
**HEAD de entrada:** `72294ee2ac0206066c831ab71e57b7f9fe2f3916`.
**Base de producto:** `a9f4fec1123d51218e090decaceec44c455740b5`.

## Implementado y comprobado

- Score abre el mismo visor desde la navegación principal y mantiene Play accesible.
  Pistas, tablatura/notación/combinada, zoom 50–200 % y navegación por compases.
- alphaTab 1.9.0, bridge y JsonStore reutilizados. Cargas tardías invalidadas,
  cierre libera worker, errores recuperables y límite previo al arrastre de 16 MiB.
- Corpus autorizado GP3–8 y ejercicio original Guitar/Bass. Parser, render WebKit y
  recorrido de importación con bridge nativo real comprobados.
- Build Release arm64; UI 1.475 tests aprobados; core 186/187 con el mismo
  `StartupPresetDeferralTests`; 21/21 WAV Debug idénticos a la base.

[Validación](guitar-studio/validation.md) es la fuente única de comandos, evidencia,
incidencias y límites. [Aceptación](guitar-studio/acceptance.md) distingue cada
criterio cumplido parcialmente de su comprobación pendiente.

## Siguiente acción concreta

1. Completar la comprobación manual de Guitar/Bass, zoom, compás 12 y controles
   de Play con `core/ui/tests/fixtures/guitar-studio/reading-exercise.gp`.
   La apertura ya fue confirmada por el usuario. La ventana negra inicial quedó
   recuperada tras reiniciar, con causa sin aislar; si reaparece, capturar stack y
   estado del bootstrap antes de atribuirla al visor o modificar más código.
2. Completar diálogo/arrastre por generación, apertura sin red y recall de un
   proyecto con el original movido. No modificar red, permisos o dispositivos
   globales para simular estas condiciones sin autorización.
3. Cuando haya guitarra/interfaz, fijar dispositivo, driver, NAM+IR+FX, frecuencia
   y buffer; ejecutar la matriz de [pruebas](guitar-studio/testing.md) frente a la
   base. El usuario confirmó que ahora no dispone de hardware para comprobarlo.
4. Actualizar aceptación/ADR con esos resultados. No iniciar sincronización,
   velocidad, bucles avanzados ni Fase 2 sin especificación y encargo nuevo.

El usuario señaló que esperaba Play/Pausa para la partitura. La Fase 1 solicitada
es de visualización: no incorpora reproducción propia de notas Guitar Pro.
Los controles heredados manejan la referencia de audio/vídeo. Especificar una
eventual reproducción de partitura antes de ampliar alcance; no añadir un botón
sin un mecanismo de reproducción definido.

## Límites conservados

No se modificaron DSP, manifiestos, lockfile, pins ni configuración global; no hay
commits ni push. Se conservan el fallo heredado de CTest y los nueve presupuestos
C++ incumplidos, sin ocultarlos o corregir deuda ajena. Los scripts temporales de
diagnóstico se retiraron del bundle y su HTML vuelve a coincidir con el build UI.
La confianza Codex autorizada en Fase 0 sigue limitada a este repositorio.
Licencias, branding y distribución continúan según el [roadmap](guitar-studio/roadmap.md).
