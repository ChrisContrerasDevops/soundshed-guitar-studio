# Validación de Guitar Studio


## Fase 1 — 2026-11-20

HEAD de entrada: `72294ee2ac0206066c831ab71e57b7f9fe2f3916` (árbol limpio).
La base de producto sigue siendo `a9f4fec1123d51218e090decaceec44c455740b5`.
Especificación y aceptación se actualizaron antes de implementar. No se cambiaron
DSP, versiones npm, lockfile, CMake ni submódulos; no hubo commits/push ni cambios
globales. Mismo entorno macOS arm64 y tooling de Fase 0, detallado más abajo.
Los logs están en `.cache/phase1-2026-11-19/`; se conserva el nombre del directorio
inicial aunque la ejecución y este informe se completaron el día 20.

### Resultado frente a la base

| Comprobación | Fase 0 | Fase 1 / evidencia local |
| --- | --- | --- |
| Standalone Release arm64 | Build aprobado | **Aprobado**, `standalone-build.log`; `lipo -archs`: arm64 |
| UI build, tipos y lint | Aprobados | **Aprobados**, `ui-build.log`, `ui-results.json` |
| Vitest | 172 archivos / 1.455 tests | **175 archivos / 1.475 tests aprobados**; parser real, cargas concurrentes y respuestas tardías añadidos |
| Checks UI | Todos aprobados | Ciclos, estado, protocolo, presentación, pickup sensing, tamaños y estilos **aprobados** |
| Core Debug / CTest | 186/187 | **186/187**, salida 8; solo `StartupPresetDeferralTests`; `ctest-result.json`, `ctest.xml` |
| Pruebas del analizador A/B | 18/18 | **18/18**, `audio-analysis-tests.log` |
| Señal offline | Sin comparación ejecutada | **21/21 WAV idénticos por SHA256**, siete cadenas × DI/impulso/silencio; `audio-comparison.json` |
| Pines | 13 aprobados | **13 aprobados**, `dependency-pins.log`; gitlinks JUCE/Eigen sin cambios |
| Tamaños C++ | 9 incumplimientos | **Los mismos 9**, salida 1, `cpp-sizes.log`; sin elevar presupuestos |
| Recursos del bundle | alphaTab 1.9.0 y Bravura locales | Build copia 6/6 vendor; UI candidata y bundle coinciden, `bundle-ui-check.json` |

`StartupPresetDeferralTests` conserva el problema de rutas del fixture macOS
explicado en Fase 0. No se corrigió ni ocultó. Las suites prioritarias de grafos,
mixer, presets, NAM/IR, automatización, latencia y Practice Tool pasaron dentro de
CTest. No hubo fallos nuevos en estas suites; esto no resuelve por sí solo la
incidencia visual de arranque descrita a continuación.

La comparación de señal usó **Debug arm64, 48 kHz, buffer 64**, el binario de Fase 0
antes de reconstruir y el candidato después. Se mantuvieron assets, definición y
DI. No se ejecutaron el harness completo Release de dos worktrees ni el benchmark
`AudioPerf`; no se deducen latencia de dispositivo, rendimiento o continuidad de
UI+audio a partir de los hashes.

### Ejecución real e incidencia de ventana negra

La primera apertura de la candidata creó el proceso, pero el usuario confirmó una
ventana negra. El registro contenía `InvalidStateError: The object is in an invalid
state`, sin stack. **Esa apertura no se considera aprobada.** No hay evidencia para
atribuirla al visor o clasificarla como fallo heredado.

Se ejecutó el HTML completo en un host WKWebView independiente: llegó a `uiReady`,
retiró el splash y no registró errores (`full-ui-probe-result/`). Después, dos
reinicios normales del Standalone con diagnóstico temporal en el bundle generado
llegaron a UI completa; el segundo ejercitó el bridge nativo real:

- Importación, guardado por hash y respuesta de los siete fixtures; SVG visible en
  el DOM y pistas/compases esperados.
- Zoom 150 %, compás 12, pista Bass, vista combinada; Play activo y mismo preset.
- Archivo inválido: error controlado, retirada de notación anterior y reapertura
  correcta del ejercicio. No hubo error no capturado en ese recorrido.

Evidencia: `native-smoke.log`, `native-smoke.js` y offsets locales de la sesión.
Las líneas con origen `phase1-diagnostic`/`phase1-native-smoke` reutilizan el canal
existente de log de bootstrap: **son resultados del diagnóstico**, no nuevos
fallos de bootstrap. La prueba importa bytes por el mismo mensaje del arrastre;
no automatiza la selección de archivo en el diálogo del sistema.

Se restauró exactamente `index.html`, se borraron los dos scripts temporales del
bundle y se abrió la build normal (PID 57651). Ejecutable SHA256
`d8b8564d61758b7f61fe3dba9de61d0ea4a0e3019315ee2bde88c5dddb955841`.
**Confirmación visual recibida del usuario:** «veo la interfaz y se abre la
partitura». Confirma la recuperación del arranque y apertura en la build normal;
no se identificó la causa de la ventana negra inicial ni se afirma una corrección
definitiva. La sesión normal posterior no añadió errores al log durante la
revisión. No se añadieron hooks de diagnóstico al producto ni se cambiaron
permisos/dispositivos del Mac.

El usuario también indicó que no encuentra Play/Pausa para la partitura. La
implementación es de visualización y mantiene alphaTab en `EnabledExternalMedia`,
sin síntesis propia. Esta observación no valida reproducción: queda registrada
como expectativa fuera del alcance actual, explicitado en [producto](product.md).

### Corpus Guitar Pro y render WebKit

Procedencia, hashes y licencia en
[fixtures/README](../../core/ui/tests/fixtures/guitar-studio/README.md) y su manifiesto.
Los fixtures upstream conservan los bytes del tag alphaTab v1.9.0 y MPL-2.0; el
ejercicio multipista es original, generado con el exportador GP7+ instalado.

| Formato / fixture | Contenido esperado y comprobado por parser | WKWebView / bridge real |
| --- | --- | --- |
| GP3 `notes-gp3.gp3` | 1 pista, 1 compás, afinación estándar, trastes 1–4 | SVG / aprobado |
| GP4 `notes-gp4.gp4` | Igual | SVG / aprobado |
| GP5 `notes-gp5.gp5` | Igual | SVG / aprobado |
| GP6 `notes-gp6.gpx` | Igual | SVG / aprobado |
| GP7 `notes-gp7.gp` | Igual | SVG / aprobado |
| GP8 `barnumbers-gp8.gp` | Steel Guitar, 6 compases de silencios | SVG / aprobado; no acredita técnicas GP8 con notas |
| GP7+ `reading-exercise.gp` | 12 compases, Guitar/Bass, 6/4 cuerdas, 100 bpm | Ambas pistas y controles / aprobado |

No se certifica la fidelidad de todas las técnicas, repeticiones, archivos grandes
ni otros formatos que upstream admite. `.gp7` se añadió al filtro nativo para igualar
el arrastre; `.gp` es la extensión de los fixtures GP7/8, no se infiere versión por
extensión. MusicXML/Capella/alphaTex siguen disponibles, fuera de esta matriz GP.

El runner [wk-smoke.swift](../../tools/guitar-studio/wk-smoke.swift) carga módulos
reales, CSS y fixtures bajo `juce://juce.backend`, con CSP equivalente y respuestas
nativas **simuladas**. A 1200 y 800 CSS px pasó apertura, tres perfiles de pentagrama,
pistas, zoom, compases, movimiento del mismo panel, recuperación de error y
20 ciclos. Cada Close dejó cero workers; máximo uno simultáneo, uno al finalizar
con partitura abierta. No hubo peticiones HTTP(S) del visor ni mensajes de
transporte/audio por sus controles visuales. No es una medición de memoria RSS.

Informes y capturas: `wk-1200/wk-report.json`, `wk-800/wk-report.json` y sus
`wk-score.png`. La captura estrecha muestra partitura+tablatura y atribución alphaTab.
Ese host **no ejecuta el motor de audio**; se complementa con la prueba nativa
anterior, no se presenta como captura del Standalone.

### Reproducción y cobertura pendiente

Con las builds ya configuradas en Fase 0:

```sh
npm --prefix core/ui run build
npm --prefix core/ui run verify
.cache/phase0-toolchain/bin/cmake --build core/build-phase0-arm64 --parallel 4
.cache/phase0-toolchain/bin/ctest --test-dir core/build-phase0-arm64 -C Debug -j 4 --output-on-failure
.cache/phase0-toolchain/bin/cmake --build juce/builds-phase0-arm64 --config Release --target SoundshedGuitar_Standalone --parallel 4
```

Se ejecutaron individualmente todos los scripts de `verify` para conservar sus
salidas. Reproducción del runner WebKit y protocolo de audio en [pruebas](testing.md).

Pendientes: controles de lectura manuales, completar diálogo/arrastre por
formato, recall de proyecto con original movido, y la matriz de concurrencia con
hardware. El usuario confirmó que **no dispone ahora de hardware para comprobar
audio**. No se cambian dispositivos ni se marca MVP-03/MVP-08 como completo.
También faltan memoria/CPU bajo carga y macOS mínimo soportado. No hay bloqueo de
compilación o dependencia pendiente. Revisión final: `git diff --check` aprobado,
enlaces locales sin destinos rotos y cinco TOML válidos. El bundle restaurado
coincide con los archivos UI generados; no contiene scripts temporales.

Se utilizó revisión especializada de arquitectura para definir reutilización,
navegación y ciclo de vida. Otras revisiones delegadas terminaron por límite de uso;
el agente principal continuó análisis, implementación y pruebas. No se presenta
una revisión independiente final de cinco agentes que no ocurrió.

## Revalidación del 2026-11-18

HEAD al comenzar: `7863d35` (Fase 0 incorporada por el usuario); comparación del
producto contra `a9f4fec1123d51218e090decaceec44c455740b5`. Árbol inicialmente limpio.
Logs de esta ejecución en `.cache/phase0-2026-11-18/`, ignorados por Git.
El registro del 17 de noviembre se conserva más abajo como histórico, no como
estado actual de los prerequisitos.

| Comprobación actual | Resultado |
| --- | --- |
| Xcode Command Line Tools / SDK | Disponibles; una prueba C++20 con `clang++ -arch arm64` compiló y ejecutó; `file` confirmó Mach-O arm64 |
| CMake / CTest | **3.31.10**, instalados en `.cache/phase0-toolchain` mediante venv; sin instalación del sistema ni PATH global |
| Submódulos | **JUCE 9.0.5 y Eigen 5.0.1** inicializados en los SHA registrados; árboles limpios y sin cambios de gitlink |
| Standalone Release | **Build completado**, salida 0; `lipo` confirma **arm64**, versión 1.8.0 |
| Ejecución macOS | **Aplicación abierta**, confirmada por el usuario tras aceptar los avisos de macOS y micrófono; proceso y recursos/NAM verificados |
| npm | **192 paquetes instalados** desde el lockfile; versiones de manifiesto/lockfile sin cambios |
| UI build, typecheck, lint | **Aprobados**; HTML y vendor generados |
| Vitest | **172 archivos / 1.455 tests aprobados** |
| Core Debug / CTest | Build completo; **186/187 aprobados**, salida 8. `StartupPresetDeferralTests` falla también aislado |
| Checks UI | Ciclos, escrituras de estado, protocolo, presentación, pickup sensing, tamaños y estilos: **aprobados** |
| Assets alphaTab / Bravura | Versión instalada **1.9.0**; script, licencia, dos fuentes y OFL copiados idénticos a npm por SHA256 |
| Herramientas de comparación A/B | **18/18 tests aprobados**; no es procesamiento de audio real |
| Pines de dependencias | **13 dependencias comprobadas**, sin ramas flotantes |
| Perfiles Codex | **5/5 descubiertos e invocados** con selector nativo en sesión normal de solo lectura |
| Tamaños C++ | Persisten los mismos **9 fallos heredados**, sin modificar código ni límites |

### Resolución de descargas y herramientas aisladas

El sandbox devuelve `ENOTFOUND`/fallo DNS para los hosts externos. Con acceso de red
autorizado, npm, GitHub y PyPI respondieron HTTP 200. Se resolvió npm mediante caché
local, menos conexiones simultáneas y un timeout/reintento acotado, sin cambiar
registry, TLS, proxy, certificados ni versiones. Se conservaron los avisos sobre
ESLint deprecado y el script opcional de `fsevents`; no se autorizó globalmente la
ejecución de scripts ni se necesitó para compilar/probar la UI.

Comandos ejecutados desde la raíz (requieren acceso de red para descargar):

```sh
python3 -m venv .cache/phase0-toolchain
.cache/phase0-toolchain/bin/python -m pip install --disable-pip-version-check \
  --cache-dir .cache/pip --timeout 30 --retries 1 'cmake>=3.25,<4'
npm --prefix core/ui ci --cache /private/tmp/guitar-studio-npm-cache \
  --no-audit --no-fund --fetch-retries=1 --fetch-retry-mintimeout=1000 \
  --fetch-retry-maxtimeout=5000 --fetch-timeout=60000 --maxsockets=4
```

El rango resolvió a CMake 3.31.10; para reconstruir este mismo entorno usar
`cmake==3.31.10`. El venv es tooling local, no una dependencia nueva del producto.
Se ejecutaron `build` y todos los scripts de `verify` individualmente para registrar
cada resultado; `ui-results.json` y `ui-*.log` contienen sus códigos de salida.

El clonado completo de JUCE falló dos veces con `curl 56`, `curl 18`, `early EOF`
y `invalid index-pack output`. El siguiente comando, incluido su reintento interno,
completó ambos submódulos sin cambiar las revisiones:

```sh
git -c http.version=HTTP/1.1 submodule update --init --recursive --depth 1
git submodule status
```

`http.version` se aplica solo a ese comando; no se escribió configuración Git
global. Resultado: JUCE `d60b7a78030661574a615b586d9325ba7a7fa7dd`, Eigen
`bc3b39870ecb690a623a3f49149a358b95c5781d`.

El primer configure CMake estaba descargando todo el historial de nlohmann/json.
Se detuvo ese proceso y sus hijos propios (salida 143, cancelación deliberada),
para usar un checkout superficial del **mismo** tag mediante la opción estándar
de FetchContent, sin editar CMakeLists ni sustituir versiones:

```sh
git clone --depth 1 --single-branch --branch v3.11.3 \
  https://github.com/nlohmann/json.git .cache/phase0-sources/json-3.11.3
git -C .cache/phase0-sources/json-3.11.3 describe --tags --exact-match
git -C .cache/phase0-sources/json-3.11.3 rev-parse HEAD
.cache/phase0-toolchain/bin/cmake -S juce -B juce/builds-phase0-arm64 \
  -G 'Unix Makefiles' -DCMAKE_BUILD_TYPE=Release -DCMAKE_OSX_ARCHITECTURES=arm64 \
  -DFETCHCONTENT_SOURCE_DIR_NLOHMANN_JSON="$PWD/.cache/phase0-sources/json-3.11.3"
```

Tag verificado: `v3.11.3`; commit
`9cca280a4d0ccf0c08f47a99aa71d1b0e52f8d03`. El core independiente usa 3.12.0;
no reutilizar este override del host para cambiar esa versión del core.

Una segunda descarga completa repetía el historial de Eigen dentro de
AudioDSPTools. Se canceló ese configure (143) y se completó el submódulo usando
objetos Git locales, con `--dissociate` para no dejar dependencia de su almacén:

```sh
git -C juce/builds-phase0-arm64/_deps/nam_oversampler_audio_dsp_tools-src \
  submodule update --init --reference "$PWD/Dependencies/eigen" --dissociate \
  -- Dependencies/eigen
.cache/phase0-toolchain/bin/cmake -S juce -B juce/builds-phase0-arm64 \
  -G 'Unix Makefiles' -DCMAKE_BUILD_TYPE=Release -DCMAKE_OSX_ARCHITECTURES=arm64 \
  -DFETCHCONTENT_SOURCE_DIR_NLOHMANN_JSON="$PWD/.cache/phase0-sources/json-3.11.3" \
  -DFETCHCONTENT_SOURCE_DIR_NAM_OVERSAMPLER_AUDIO_DSP_TOOLS="$PWD/juce/builds-phase0-arm64/_deps/nam_oversampler_audio_dsp_tools-src"
```

El Eigen anidado quedó en su pin `6d829e766ff1b1ab867d93631163cbc63ed5798f`,
sin sustituirlo por Eigen 5.0.1. También se conservó el Eigen propio de NAM.
El configure final del host terminó correctamente; JUCE compiló `juceaide`.
Se mantuvo el aviso heredado de política CMP0177 de CLAP y la ausencia de clave
para búsqueda Jam; ninguno impidió generar el target Standalone.

Para el core se preparó `v3.12.0`, SHA
`55f93686c01528224f448c19128836e7df245f72`, y se reutilizaron las fuentes ya
descargadas por el host, con un directorio de compilación Debug independiente:

```sh
git clone --depth 1 --single-branch --branch v3.12.0 \
  https://github.com/nlohmann/json.git .cache/phase0-sources/json-3.12.0
phase0_core_deps=()
for phase0_dep in signalsmith_linear signalsmith_stretch stftpitchshift \
  neuralampmodelercore nam_oversampler_audio_dsp_tools guitarfx_miniz_src \
  guitarfx_minimp3_src guitarfx_sqlite_src guitarfx_wasmtime_src; do
  phase0_name=$(printf '%s' "$phase0_dep" | tr '[:lower:]' '[:upper:]')
  phase0_core_deps+=("-DFETCHCONTENT_SOURCE_DIR_${phase0_name}=$PWD/juce/builds-phase0-arm64/_deps/${phase0_dep}-src")
done
.cache/phase0-toolchain/bin/cmake -S core -B core/build-phase0-arm64 \
  -G 'Unix Makefiles' -DCMAKE_BUILD_TYPE=Debug -DCMAKE_OSX_ARCHITECTURES=arm64 \
  -DGUITARFX_CORE_BUILD_TESTS=ON \
  -DFETCHCONTENT_SOURCE_DIR_NLOHMANN_JSON="$PWD/.cache/phase0-sources/json-3.12.0" \
  "${phase0_core_deps[@]}"
```

Este configure también terminó correctamente. Las opciones son de esta build,
no cambios a CMakeLists, pins ni configuración global. `CI` no estaba definida;
se evitó así la selección universal del helper de CI. Logs:
`cmake-host-configure-final.log`, `cmake-core-configure.log` y el argv exacto en
`core-configure-command.json` bajo el directorio de evidencias local.

### Standalone arm64 y arranque

```sh
.cache/phase0-toolchain/bin/cmake --build juce/builds-phase0-arm64 \
  --config Release --target SoundshedGuitar_Standalone --parallel 4
lipo -archs 'juce/builds-phase0-arm64/SoundshedGuitar_artefacts/Release/Standalone/Soundshed Guitar.app/Contents/MacOS/Soundshed Guitar'
open 'juce/builds-phase0-arm64/SoundshedGuitar_artefacts/Release/Standalone/Soundshed Guitar.app'
```

Build: salida **0**; arquitectura: **arm64**. Ejecutable SoundShed 1.8.0,
bundle `com.soundshed.guitar`, SHA256
`a408beb4a28b8ff44c54e0c38ca2d73fbb843233691e583b173bb6318f134e5d`.
No se construyeron/instalaron plugins, instalador ni distribución firmada.
Se conservaron los warnings heredados del compilador; no impidieron el enlace.
El paquete contiene `index.html`, `dist/main.js`, alphaTab minificado, su licencia,
Bravura WOFF/WOFF2 y OFL idénticos al build UI por SHA256.

`open` terminó con salida 0. Se identificó el proceso por la ruta completa del
artefacto (PID 45801 en esta ejecución) y AppKit informó `finishedLaunching=true`,
`terminated=false`. El incremento del log desde el arranque registra carga de
recursos, motor NAM e inicialización/restauración de sesión. El perfil existente
emitió un aviso de último preset no encontrado y utilizó su preset predeterminado;
no se corrigieron ni reemplazaron datos del usuario. Lanzar la aplicación utiliza
su perfil normal `~/Library/Soundshed Guitar`.

Evidencia local: `standalone-build.log`, `standalone-artifact.json`,
`app-smoke.json` y `standalone-session-new.log`. Este último contiene únicamente
las líneas añadidas durante esta ejecución y no se versiona. La consulta automática
inicial no encontró ventanas en pantalla. Después, **el usuario confirmó que
aceptó los avisos de macOS y del micrófono y se abrió el programa**. Es evidencia
manual de apertura de la aplicación; no se confunde con validar render Guitar Pro,
entrada/salida de guitarra, latencia o continuidad de audio. El agente no cambió
permisos del sistema ni seleccionó dispositivos.

### Core Debug, regresión y límites

```sh
.cache/phase0-toolchain/bin/cmake --build core/build-phase0-arm64 --parallel 2
.cache/phase0-toolchain/bin/ctest --test-dir core/build-phase0-arm64 \
  -C Debug -j 4 --output-on-failure \
  --output-junit "$PWD/.cache/phase0-2026-11-18/ctest.xml"
.cache/phase0-toolchain/bin/ctest --test-dir core/build-phase0-arm64 \
  -C Debug -j 1 -R '^StartupPresetDeferralTests$' --output-on-failure
```

El build del core terminó con salida **0**. Los tests usan `-g`, `-arch arm64`
y aserciones activas, sin `NDEBUG`. CTest ejecutó los **187** casos registrados por
defecto en **200,90 s**: **186 aprobados y uno fallido**, salida **8**. La repetición
aislada del fallo tardó **0,17 s**, también salida **8**; no depende de ejecutar la
suite en paralelo. Logs: `core-build.log`, `ctest.log`, `ctest.xml`,
`ctest-result.json` y `ctest-startup-isolated.log` en la caché de evidencias.

Pasaron las suites prioritarias de grafos, mixer, presets, cambio sin cortes,
alineación de latencia, resampling NAM, automatización en tiempo real, IR cab/reverb,
bloqueo entre instancias, crossfade de Practice Tool e importación de tablaturas.
También pasaron `WasmEffectHostTests` y el smoke `SteadyStateProfiler`.
Esto acredita las invariantes comprobadas por la suite original; no certifica
latencia del dispositivo, fidelidad Guitar Pro ni concurrencia del visor con audio.

**Fallo heredado identificado:** `StartupPresetDeferralTests` prepara su fixture
en `root/Soundshed Guitar/data/v1/soundshed.db`
([línea de apertura](../../core/tests/StartupPresetDeferralTests.cpp)), mientras
`FileSystem::ResolvePlatformRootDirectory()` usa
`root/Library/Soundshed Guitar` en macOS. El helper aísla el perfil del test,
pero el fixture escribe en otra base de datos. Esta discrepancia explica la
ausencia del preset de prueba y es la causa probable a corregir/verificar en una
tarea acotada; no se aplicó un parche ni se marcó el test como aprobado.
Fuentes, tests y build scripts coinciden con la base inmutable. No se retocó DSP
ni se ocultaron los nueve fallos heredados del check de tamaños C++.

Los benchmarks/estrés optativos y DSP extendido permanecieron desactivados según
la configuración original. `AudioSnapshot` y `AudioPerf` compilaron, pero no se
ejecutó el harness A/B entre revisiones: no hubo cambios de producto y esa medición
pertenece a la validación del MVP. Los **18 tests del analizador** sí pasaron.

**Estado de salida:** sin bloqueo de herramientas, descarga, build o arranque.
Fase 1 puede comenzar con su validación especificada. Sigue pendiente resolver
o clasificar explícitamente el fallo del fixture antes de aceptar MVP-08, disponer
del corpus GP autorizado y medir render/continuidad de audio en hardware. Fase 0
no acredita una suite completamente aprobada ni el MVP operativo.

Revisión documental: cinco TOML válidos y **77 enlaces locales en 13 documentos**
sin destinos ausentes. `git diff --check` aprobado; el diff del producto contra
HEAD y la base original está vacío. Solo se actualiza documentación SDD; no hubo
commits ni push. Los artefactos/tooling/logs permanecen ignorados por Git.

### Agentes: pruebas del cliente instalado

Cliente Codex 0.169.0-alpha.11.1. La primera sesión no descubrió los perfiles por
falta de confianza del proyecto. El usuario autorizó explícitamente marcar **solo
este repositorio** como confiable con `codex exec --trust`; no se cambiaron otros
proyectos, modelos, permisos globales ni herramientas del sistema.

Tras esa autorización el cliente ofreció los cinco nombres en el selector nativo.
La prueba con `--ephemeral` falló al crear cada hijo con `no rollout found` para el
hilo padre. La repetición en sesión normal de solo lectura completó **5/5**.
Se contrastó el selector `agent_type` de cada llamada con el registro real del
cliente: no se usó un nombre de tarea como sustituto del perfil.

| Perfil | Hilo devuelto | Evidencia de respuesta |
| --- | --- | --- |
| `architecture` | `/root/architecture` | `tabView.ts:228`, `EnabledExternalMedia` |
| `functional_analysis` | `/root/functional_analysis` | `panel.ts`: arrastre, pista y vista |
| `security` | `/root/security` | `PracticeTabMessages.h:38`, 16.777.216 bytes |
| `qa` | `/root/qa` | `package.json:11`, `vitest run` (solo lectura) |
| `documentation` | `/root/documentation` | Título y fecha de `current-task.md` |

Sesión de comprobación: `01a1f0e7-b71f-72a0-a803-8a14ffe11b2f`.
Evidencia local saneada: `native-agents-proof.json`, resultado:
`native-agents-persistent-result.json`, ambos bajo el directorio de logs de esta
ejecución. No se versionan registros completos del cliente. Hubo como máximo tres
hijos activos a la vez; todos finalizaron. El cliente no ofrece cierre explícito
de hilos, por lo que no se afirma su eliminación. El aviso de timeout al refrescar
el catálogo de modelos no impidió esta prueba.

Los TOML no necesitaron cambios. Usar sesión normal para esta comprobación con
esta versión del cliente. La confianza autoriza configuración local de Codex/MCP;
no sustituye políticas administradas ni se extendió a otros proyectos.

## Registro histórico — 2026-11-17

Fecha local: **2026-11-17, America/Santiago**. Repositorio:
`soundshed-guitar-studio`, origin `https://github.com/ChrisContrerasDevops/soundshed-guitar-studio.git`.
Base HEAD: `a9f4fec1123d51218e090decaceec44c455740b5`; árbol inicialmente limpio.
No se cambió origin, no se hizo commit/push y no se lanzó la aplicación ni se
instalaron plugins. Los resultados siguientes no certifican todavía el MVP.

### Entorno observado

| Comprobación | Resultado |
| --- | --- |
| `uname -m` | `arm64` |
| `sw_vers` | macOS 27.2.1, build 26B131 |
| `xcode-select -p` | `/Library/Developer/CommandLineTools` |
| `xcrun --show-sdk-version` | 27.2 |
| `clang --version` | Apple clang 21.0.0, target arm64-apple-darwin27.2.0 |
| `node --version` / `npm --version` | v24.22.2 / 11.19.1; Node 24 coincide con CI UI |
| `cmake --version` / `ninja --version` | No encontrados en PATH; Ninja es opcional |
| `python3 --version` | 3.9.6; parser TOML disponible como `pip._vendor.tomli` |
| `codex --version` | 0.169.0-alpha.11.1 |
| `git submodule status` | JUCE y Eigen sin inicializar (prefijo `-`) |

Revisiones registradas: JUCE `d60b7a78030661574a615b586d9325ba7a7fa7dd`;
Eigen `bc3b39870ecb690a623a3f49149a358b95c5781d`.
No se descargaron ni alteraron esos submódulos en Fase 0.

### Resultados ejecutados

Todos los comandos parten de la raíz, salvo donde se indica `core/ui`.

| Comando / comprobación | Resultado | Límite de la evidencia |
| --- | --- | --- |
| `bash -n build_macos.sh` | Aprobado | Sintaxis solamente; no ejecuta packaging |
| `cmake -S juce -B juce/builds-phase0-arm64 -DCMAKE_BUILD_TYPE=Release -DCMAKE_OSX_ARCHITECTURES=arm64` | Bloqueado, salida 127: `command not found: cmake` | No hubo configuración ni compilación C++ |
| `npm ci --cache /private/tmp/guitar-studio-npm-cache --no-audit --no-fund --fetch-retries=0 --fetch-timeout=15000` en `core/ui` | Falló, salida 1: `ENOTFOUND registry.npmjs.org` | Red del sandbox |
| Mismo `npm ci`, timeout 20000, con acceso de red autorizado | Falló, salida 1: `FETCH_ERROR`, timeout descargando `keyv-4.5.4.tgz` | La instalación no terminó; puede quedar `node_modules` parcial e ignorado |
| `npm run build` en `core/ui` | Bloqueado, salida 127: `tsc: command not found` | No hay bundle UI verificado |
| `npm run verify` en `core/ui` | Bloqueado al primer typecheck: `tsc: command not found` | ESLint/Vitest y checks posteriores de esa cadena no ejecutados |
| `node --test tools/audio-ab/analysis.test.mjs tools/audio-ab/perf.test.mjs` | **18/18 aprobados** | Tests del analizador, no render del motor |
| `node tools/check-protocol.mjs` | **Aprobado**, 219 tipos UI→engine, 141 engine→UI; GUID coincidente | Coherencia estática de protocolo |
| `node tools/check-cpp-file-sizes.js` | **Fallo heredado**, nueve archivos sobre presupuesto | No se elevan límites ni se corrige código en Fase 0 |
| Parser TOML y campos nativos | **5/5 perfiles válidos**, nombres únicos | No prueba activación en una sesión nueva |
| Enlaces locales de documentación | **72 enlaces válidos en 13 documentos** | Comprobación de destinos locales, no disponibilidad futura de fuentes web |
| `git diff --check` y comparación de fuentes/manifiestos contra HEAD | **Aprobados**, producto sin cambios | Solo documentación y perfiles nuevos; README enlaza el índice |
| CTest, A/B de señal, perf, arranque WKWebView y audio real | No ejecutados | Requieren build/dependencias y, para audio real, hardware |

Logs de npm locales, no versionados:
`/private/tmp/guitar-studio-npm-cache/_logs/2026-11-18T01_49_36_543Z-debug-0.log`
y `2026-11-18T01_49_57_004Z-debug-0.log` en el mismo directorio.
Sus nombres usan UTC; corresponden al 17 de noviembre en Santiago. No se incluyen
logs completos ni secretos en el repositorio.

Fallos de tamaño observados en archivos sin modificar:

| Archivo | Líneas / presupuesto |
| --- | --- |
| `core/src/dsp/effects/IRCabEffect.h` | 2543 / 2500 |
| `core/src/dsp/effects/WasmEffect.cpp` | 2480 / 2250 |
| `core/tests/WasmEffectHostTests.cpp` | 1938 / 1500 |
| `core/src/automation/AutomationSlotTable.cpp` | 1556 / 1500 |
| `core/tests/Tone3000ResourceWorkflowTests.cpp` | 1047 / 800 |
| `core/tests/ResourceFilePathTests.cpp` | 850 / 800 |
| `core/src/controller/internal/PresetArchiveSupport.cpp` | 820 / 800 |
| `core/src/controller/PluginControllerHostState.cpp` | 817 / 800 |
| `core/src/dsp/SignalGraphExecutor.h` | 801 / 800 |

### Reproducción una vez resueltos los prerequisitos

Disponer de CMake ≥3.25, Command Line Tools, Node 24 y red para npm, submódulos,
CPM/FetchContent y bundles Wasmtime. No hace falta Ninja con Unix Makefiles.
No asumir que resolver el primer bloqueo garantiza que no existan otros.

```sh
git submodule update --init --recursive
npm --prefix core/ui ci
npm --prefix core/ui run build
npm --prefix core/ui run verify
cmake -S juce -B juce/builds-phase0-arm64 \
  -DCMAKE_BUILD_TYPE=Release -DCMAKE_OSX_ARCHITECTURES=arm64
cmake --build juce/builds-phase0-arm64 \
  --config Release --target SoundshedGuitar_Standalone --parallel 4
lipo -archs 'juce/builds-phase0-arm64/SoundshedGuitar_artefacts/Release/Standalone/Soundshed Guitar.app/Contents/MacOS/Soundshed Guitar'

cmake -S core -B core/build-phase0-arm64 \
  -DCMAKE_BUILD_TYPE=Debug -DCMAKE_OSX_ARCHITECTURES=arm64 \
  -DGUITARFX_CORE_BUILD_TESTS=ON
cmake --build core/build-phase0-arm64 --parallel 4
ctest --test-dir core/build-phase0-arm64 -C Debug -j 4 --output-on-failure
```

Al cerrar el registro del 17, estos comandos de recuperación **no se habían
ejecutado después del bloqueo**. Revisar
`CI` antes de configurar: `juce/cmake/PamplejuceMacOS.cmake` fuerza universal para
Release si la variable está definida, incluso vacía. Comprobar la arquitectura
del artefacto con `lipo`, no solo el flag.
Los directorios propuestos están ignorados por las reglas existentes. El CMake
heredado tiene `COPY_PLUGIN_AFTER_BUILD FALSE`.

No usar el helper de distribución como requisito de aceptación Standalone:
`build_macos.sh` predetermina universal+pkg y solicita AAX aunque no haya SDK.
`--native --no-pkg` no elimina esa solicitud. No se modificó ni ejecutó su limpieza
de staging. Los SDK/formats adicionales y firma se evalúan cuando se distribuya.

### Documentos y agentes

Se comprueban cinco archivos TOML con parser real, campos obligatorios no vacíos,
nombres únicos y correspondencia nombre/archivo. Se revisan enlaces locales de los
documentos nuevos y alcance del diff contra HEAD. El formato autónomo está descrito
en la [documentación oficial](https://learn.chatgpt.com/docs/agent-configuration/subagents).
No hay `config.toml` nuevo ni cambios de preferencias globales.

Comando de comprobación de los perfiles, desde la raíz:

```sh
python3 - <<'PY'
from pathlib import Path
import pip._vendor.tomli as tomli
paths = sorted(Path('.codex/agents').glob('*.toml'))
assert len(paths) == 5
names = set()
for path in paths:
    data = tomli.loads(path.read_text())
    assert set(data) == {'name', 'description', 'developer_instructions'}, path
    assert all(isinstance(v, str) and v.strip() for v in data.values()), path
    assert data['name'] == path.stem and data['name'] not in names, path
    names.add(data['name'])
print('5 perfiles TOML válidos')
PY
git diff --check
git diff --exit-code HEAD -- core juce nanoq android ios tools build_macos.sh .gitmodules .github
git status --short
```

La sintaxis y estructura no prueban descubrimiento en una sesión nueva del cliente.
La activación de esos cinco perfiles queda por comprobar al abrir el proyecto;
las auditorías delegadas de Fase 0 fueron agentes de la sesión, no una prueba de
invocación de los TOML recién creados. El helper de manual Codex falló por DNS;
el formato se contrastó con la documentación oficial mediante navegación web.
