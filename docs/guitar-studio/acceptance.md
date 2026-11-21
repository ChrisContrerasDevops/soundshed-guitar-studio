# Criterios de aceptación

## Fase 0: preparación

| ID | Criterio | Evidencia / estado |
| --- | --- | --- |
| P0-01 | SDD y cinco subagentes nativos configurados | [Índice](README.md), [AGENTS](../../AGENTS.md), [TOML](../../.codex/agents/); **5/5 invocados**, evidencia en validación |
| P0-02 | Arquitectura y dependencias reales identificadas | [Arquitectura](architecture.md), SHA base y visor heredado identificados |
| P0-03 | Compilación verificada o bloqueo reproducible | **Build Standalone Release arm64 y core Debug completados**; aplicación abierta, confirmada por el usuario; [validación](validation.md) |
| P0-04 | Alternativas, licencias y mantenimiento evaluados | [Integración](integration.md), [ADR 0002](../adr/0002-reuse-alphatab-viewer.md), posteriormente autorizado para Fase 1 |
| P0-05 | MVP y roadmap definidos | [Producto](product.md), [roadmap](roadmap.md) y criterios MVP siguientes |
| P0-06 | Estrategia contra regresiones de audio | [Pruebas](testing.md), distinción entre A/B offline y continuidad en vivo |
| P0-07 | Próxima tarea ejecutable preparada | [current-task](../current-task.md), con prerequisitos y salida |
| P0-08 | Comportamiento y motor conservados | Diff limitado a documentación/agentes; sin commits/push ni cambios de código, manifiestos o submódulos |

Los resultados y limitaciones de validación se mantienen en un solo lugar:
[validation.md](validation.md). P0-03 admite bloqueo documentado por definición;
ninguna fila de Fase 0 certifica los criterios MVP.

## MVP: evidencia exigida antes de declararlo operativo

Fase 1 implementada, con aceptación parcial al 2026-11-20. La matriz por generación
en [validación](validation.md) distingue parser, render y recorrido nativo; las
comprobaciones manuales pendientes impiden declarar aprobado todo el MVP.

| ID | Escenario y resultado observable | Verificación |
| --- | --- | --- |
| MVP-01 | Dado cada fixture autorizado GP3/4/5/GPX6/GP7/GP8, abrirlo por diálogo y arrastre muestra pista, compases, notas y tablatura esperados; no se confunde una extensión con el formato real | Matriz por formato, hash/procedencia y comparación visual |
| MVP-02 | Score abre el mismo visor desde la navegación principal; con archivo multipista, cambiar pista y alternar Tab / Notation + Tab / Notation mantiene legibilidad. Zoom 50–200 %, anterior/siguiente e ir a un compás desplazan la vista sin seek/play; se conservan límites válidos al cambiar pista/zoom | WKWebView, controles accesibles por teclado, tamaño habitual y ventana estrecha; ningún mensaje de transporte por navegación visual |
| MVP-03 | Con NAM+IR+FX activos, abrir/cerrar, cambiar vista y desplazar partitura no altera preset, parámetros, dispositivos ni audio; no aparece síntesis de partitura | Estado antes/después, señal y sesión de concurrencia |
| MVP-04 | Cancelar, abrir vacío/corrupto/incompatible o importar más de 16 MiB produce cancelación/error controlado; luego se puede abrir uno válido. Cerrar o reemplazar durante carga no reabre una instancia obsoleta | Casos límite y recuperación; comprobar frontera de tamaño antes de leer en JS, base64, respuestas tardías y una sola instancia |
| MVP-05 | Desde arranque frío sin red, se abre archivo local sin backing track y se cargan partitura, worker y Bravura desde el paquete | Inspección de recursos/red; sin CDN ni servicio de conversión |
| MVP-06 | Guardar y reabrir un proyecto existente con partitura recupera su binding; un proyecto sin partitura y un preset anterior conservan comportamiento | Recall con original movido, sin migración incompatible |
| MVP-07 | La vista respeta créditos y el bundle de prueba conserva avisos/licencias; los requisitos de fuente y distribución quedan documentados, sin exigir publicación | Revisión de UI, contenido del bundle y evaluación de integración |
| MVP-08 | Suite core y comparaciones A/B no muestran cambios injustificados de señal, latencia o colas; la interacción con visor no agrega cortes o incumplimientos de plazo | Protocolo de [pruebas](testing.md), con baseline y resultados |
| MVP-09 | Repetir apertura/cierre, ocultar/restaurar ventana y recuperarse de error no acumula indefinidamente memoria/workers ni deja la UI bloqueada | Serie de 20 ciclos, registro de recursos antes/después |

### Estado de ejecución de Fase 1

| Criterio | Evidencia alcanzada | Pendiente |
| --- | --- | --- |
| MVP-01 | Siete fixtures; parser real, SVG en WebKit y mensaje de importación con bridge nativo real; usuario confirma apertura de la partitura indicada | Completar diálogo y arrastre manual por generación; GP8 probado con silencios |
| MVP-02 | Panel único, zoom, compases, pistas y tres vistas comprobados; WebKit a 1200/800 px; controles sin mensajes de transporte; usuario confirma interfaz y partitura visibles en build normal | Comprobación manual de todos los controles de lectura y Play |
| MVP-03 | Preset sin cambios y Play activo en smoke nativo; DSP sin modificaciones | Señal de guitarra, ajustes de efectos y continuidad con interfaz real |
| MVP-04 | Tests de errores/límites/correlación y recuperación tras archivo inválido en Standalone | Matriz manual de diálogo/arrastre y archivos grandes representativos |
| MVP-05 | Worker, script y fuentes locales; cero peticiones HTTP(S) en runner | Arranque frío completo sin red, sin cambiar configuración global automáticamente |
| MVP-06 | Tests de importación/recall por hash y bindings existentes aprobados; esquema persistido intacto | Proyecto real reabierto con original movido |
| MVP-07 | Créditos visibles, vendor/licencias conservados y corpus con procedencia | Revisión de distribución cuando se autorice publicar |
| MVP-08 | CTest 186/187, mismo fallo heredado; 21 WAV Debug idénticos; sin fallos nuevos en suites | A/B Release/perf y matriz de audio+UI con hardware; incidencia de arranque aún sin causa aislada |
| MVP-09 | 20 ciclos en WebKit por ancho, cero workers después de Close y máximo uno activo | Memoria/CPU sostenida, minimizar/restaurar Standalone y archivo grande |

Si un formato o entorno no cumple, registrar la brecha y decidir explícitamente
si se corrige o se reduce la matriz soportada. No marcar el conjunto aprobado con
fixtures faltantes, tests simulados o solo un build satisfactorio.
