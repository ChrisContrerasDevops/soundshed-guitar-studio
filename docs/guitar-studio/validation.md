# Validación de Fase 0

Fecha local: **2026-11-17, America/Santiago**. Repositorio:
`soundshed-guitar-studio`, origin `https://github.com/ChrisContrerasDevops/soundshed-guitar-studio.git`.
Base HEAD: `a9f4fec1123d51218e090decaceec44c455740b5`; árbol inicialmente limpio.
No se cambió origin, no se hizo commit/push y no se lanzó la aplicación ni se
instalaron plugins. Los resultados siguientes no certifican todavía el MVP.

## Entorno observado

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

## Resultados ejecutados

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

## Reproducción una vez resueltos los prerequisitos

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

Estos comandos de recuperación **no se ejecutaron después del bloqueo**. Revisar
`CI` antes de configurar: `juce/cmake/PamplejuceMacOS.cmake` fuerza universal para
Release si la variable está definida, incluso vacía. Comprobar la arquitectura
del artefacto con `lipo`, no solo el flag.
Los directorios propuestos están ignorados por las reglas existentes. El CMake
heredado tiene `COPY_PLUGIN_AFTER_BUILD FALSE`.

No usar el helper de distribución como requisito de aceptación Standalone:
`build_macos.sh` predetermina universal+pkg y solicita AAX aunque no haya SDK.
`--native --no-pkg` no elimina esa solicitud. No se modificó ni ejecutó su limpieza
de staging. Los SDK/formats adicionales y firma se evalúan cuando se distribuya.

## Documentos y agentes

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
