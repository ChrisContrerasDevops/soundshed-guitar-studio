# Estrategia de pruebas y regresión de audio

Los criterios de producto están en [aceptación](acceptance.md); este documento
define cómo verificarlos. Los resultados ejecutados están en [validación](validation.md).
Se reutilizan las herramientas existentes, sin introducir frameworks ni tests de
producto en Fase 0.

## Base de comparación

Usar SHA `a9f4fec1123d51218e090decaceec44c455740b5` frente al árbol candidato.
Mantener máquina, compilador, configuración, frecuencia, buffer, presets, NAM/IR,
entradas DI y semillas comparables. Registrar hashes y licencias de fixtures,
versión macOS/WebKit, interfaz/driver y modo Standalone/plugin.

No hacer checkout destructivo sobre el trabajo del usuario: el harness A/B ya usa
worktrees. Una comparación entre arquitecturas/compiladores distintos no demuestra
regresión causada por UI. Primero medir la variabilidad de la propia base.

## Capas de evidencia

| Capa | Herramientas/casos existentes | Qué prueba y qué no |
| --- | --- | --- |
| Contratos y UI | `npm run build`, `npm run verify`; Vitest/jsdom | Tipos, DOM simulado, estado y reglas; no render WebKit ni audio real |
| Importación del visor | `PracticeTabMessagesTests` y `practiceToolTab.test.ts` | Bytes, límites, hash, bindings y sync; el fixture C++ es alphaTex incluso cuando se llama `.gp5`, no decodificación GP real |
| Formatos GP | `guitarProFixtures.test.ts` y corpus con hashes | Parser alphaTab 1.9.0 real; estructura conocida GP3–8, sin certificar todas sus técnicas |
| Render WebKit | `tools/guitar-studio/wk-smoke.swift` | Módulos reales, worker, fuentes, controles y ciclos; bridge simulado, sin motor de audio |
| Core funcional | CTest Debug: grafos, mixer, presets, NAM/IR, automatización y cambios de preset | Invariantes DSP y control; no equivale a validar el dispositivo |
| Señal offline | `tools/audio-ab/audio-ab.mjs`, Release | Comparación reproducible de efectos/cadenas; no contención del render UI |
| Coste DSP | Modo `perf` / `AudioPerf` | Tiempo de grafos; no coste total de WebView/controlador ni deadline del dispositivo |
| Host y concurrencia | Standalone arm64 real, WKWebView y captura/telemetría | Continuidad y recursos mientras se usa el visor; requiere hardware y fixtures |

Suites prioritarias del core: `SignalGraphExecutorTests`, `MultiPresetMixerTests`,
`PresetDSPLoadingTests`, `PresetManagementWorkflowTests`, `GaplessSwitchingTests`,
`SwapLatencyAlignmentTests`, `NamResamplerLatencyTests`, `AutomationNodeRealtimeTests`,
`IRCabAutomationRealtimeTests`, `IRReverbAutomationRealtimeTests`,
`MixerInstanceLockTests`, `PracticeToolCrossfadeTests` y `PracticeTabMessagesTests`.

`helpers/AudioThreadAllocations.h` detecta asignaciones en pruebas simuladas; no
demuestra ausencia de locks, I/O o incumplimientos de tiempo. Benchmarks/estrés son
optativos (`GUITARFX_TEST_BENCHMARKS`, `GUITARFX_TEST_STRESS`). Las suites extendidas
usan `GUITARFX_TEST_EXTENDED_DSP=ON`. `AudioSnapshot` y `AudioPerf` no están
registrados como tests CTest. No asumir que los targets JUCE exclusivos de Windows
están disponibles en Mac. Comandos base en [validación](validation.md).

## Comparación de señal

Después de resolver dependencias, desde la raíz:

```sh
node tools/audio-ab/audio-ab.mjs a9f4fec1123d51218e090decaceec44c455740b5 WORKTREE \
  --work-dir .cache/audio-ab --rate 48000 --block 64 --fail-on slight
node tools/audio-ab/audio-ab.mjs perf a9f4fec1123d51218e090decaceec44c455740b5 WORKTREE \
  --work-dir .cache/audio-ab --rate 48000 --block 64
```

El harness compila revisiones, descarga dependencias y puede ocupar varios GB;
no se ejecutó en Fase 0. Consultar [su documentación](../../tools/audio-ab/README.md).
Los 18 tests ligeros del analizador verifican el instrumento de comparación,
no el sonido de SoundShed.

Como comprobación adicional acotada, Fase 1 ejecutó `AudioSnapshot` de la build
Debug de Fase 0 antes de recompilar y de la candidata después:

```sh
core/build-phase0-arm64/tests/AudioSnapshot --out .cache/audio-candidate \
  --definition tools/audio-ab/snapshot.json --assets core/tests/testdata/assets \
  --di core/ui/demo/DI_Guitar_L.mp3 --rate 48000 --block 64 \
  --only chains --signals di,impulse,silence
```

Guardar cada revisión en un directorio distinto y comparar SHA256 de los WAV.
Ejecutar dos veces la candidata no reconstruye una baseline. Esta comprobación
no sustituye el harness Release, el benchmark o las mediciones de dispositivo.

Para cambios visuales, exigir igualdad o redondeo explicable en casos deterministas
y ausencia de diferencias injustificadas de nivel, espectro, cola o latencia en
los demás. Revisar el desplazamiento temporal por separado: el analizador puede
informarlo sin hacer fallar la clasificación. Rechazar NaN/Inf y cambios audibles
sin causa. Las modulaciones no deterministas se contrastan contra la variabilidad
base, no mediante una exigencia de identidad binaria universal.

Incluir bypass, NAM+IR y cadena con delay/reverb; silencio, impulso, barrido y DI
representativa. No normalizar entradas/salidas para ocultar cambios de nivel.
La cobertura del harness no incluye todos los plugins externos, WASM real,
recursos de usuario o comportamiento de hosts. En macOS el benchmark no fija
afinidad de CPU; registrar carga y condiciones térmicas.

## Continuidad mientras se usa el visor

En la misma máquina realizar una sesión base y otra candidata de al menos 10 minutos
por combinación 44.1/48 kHz × 64/128/256 muestras, con el mismo preset y señal de
entrada controlada. Alternar visor cerrado, partitura abierta y acciones de apertura,
cambio de pista/vista, desplazamiento, redimensionamiento y error de importación.
Incluir archivo representativo y uno grande dentro del límite, con derechos de uso.

Registrar cortes/xruns, silencios inesperados, latencia, CPU de audio, tiempo de
bloque p99/máximo cuando exista instrumentación, memoria y workers. El plazo es
`buffer / sampleRate` (1.33 ms a 48 kHz/64 muestras). No inferir cumplimiento del
plazo a partir de CPU promedio o escucha solamente. Si falta instrumentación,
declarar esa cobertura pendiente y especificar el método antes de añadir código.

Criterio: ningún corte, silencio o incumplimiento nuevo atribuible al visor frente
a la base; señal y latencia sin cambios injustificados. El presupuesto relativo
de CPU/memoria se fija a partir de la base medida y queda pendiente de aceptación,
sin inventar un porcentaje. Registrar problemas ya presentes y no encubrirlos.
Completar 20 ciclos de abrir/cerrar y ocultar/restaurar para detectar crecimiento
sostenido. Confirmar presets/parámetros y recuperación de proyectos anteriores.

Para render, usar referencias de contenido conocido por cada generación GP y
comparar notación, tablatura, afinación, compases/repeticiones y selección de pista.
Capturas y grabaciones, si se conservan, deben tener procedencia y uso autorizado.

## Runner WKWebView de Fase 1

Desde la raíz, después del build UI, con Xcode Command Line Tools disponibles:

```sh
mkdir -p .cache/guitar-studio-wk
xcrun swiftc -module-cache-path .cache/guitar-studio-wk/modules \
  tools/guitar-studio/wk-smoke.swift -o .cache/guitar-studio-wk/wk-smoke \
  -framework AppKit -framework WebKit
.cache/guitar-studio-wk/wk-smoke "$PWD" "$PWD/.cache/guitar-studio-wk/wide" 1200
.cache/guitar-studio-wk/wk-smoke "$PWD" "$PWD/.cache/guitar-studio-wk/narrow" 800
```

Requiere sesión gráfica. Usa un almacén WebKit efímero y captura su propia vista,
sin pedir permisos de grabación de pantalla, cambiar preferencias globales ni
instalar herramientas. Escribe `wk-report.json` y `wk-score.png`; salida 0 solo si
pasan los escenarios. `wk-smoke.mjs` monta la sección de producción y simula las
respuestas del bridge: no demuestra que el diálogo nativo abra ni que suene audio.

Complementarlo en el Standalone: abrir Score desde Play, elegir
`core/ui/tests/fixtures/guitar-studio/reading-exercise.gp`, comprobar Guitar/Bass,
tres vistas, zoom y compases; repetir por generación y con arrastre. Cancelar y
abrir un archivo inválido seguido de uno válido. Guardar/reabrir proyecto con el
original movido, comprobar recursos locales y conservar el preset. Registrar
separadamente una ventana negra o error de arranque aunque los tests aislados pasen.

## Alcance de ejecución

Cambios documentales: enlaces, TOML, diff y exactitud de comandos. Cambios
de UI/bridge: build+verify, tests afectados, core cuando corresponda y aplicación
real; el MVP exige además A/B y concurrencia. No ejecutar de nuevo suites aprobadas
sin cambios/fallos que lo justifiquen.

El smoke de `tools/agent-ui-debug` usa WebView2/CDP y un `.exe`; no valida WKWebView
de macOS. En Mac usar comprobación manual documentada o automatización específica
cuando esté disponible. Si `MixerInstanceLockTests` falla bajo carga, repetirlo
aislado según advertencia upstream y registrar ambos resultados, sin esconderlo.
