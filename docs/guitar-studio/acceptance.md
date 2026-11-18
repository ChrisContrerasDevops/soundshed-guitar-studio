# Criterios de aceptación

## Fase 0: preparación

| ID | Criterio | Evidencia / estado |
| --- | --- | --- |
| P0-01 | SDD y cinco subagentes nativos configurados | [Índice](README.md), [AGENTS](../../AGENTS.md), [TOML](../../.codex/agents/); comprobación en validación |
| P0-02 | Arquitectura y dependencias reales identificadas | [Arquitectura](architecture.md), SHA base y visor heredado identificados |
| P0-03 | Compilación verificada o bloqueo reproducible | [Validación](validation.md): CMake ausente, submódulos pendientes y descarga npm fallida; no hay build aprobado |
| P0-04 | Alternativas, licencias y mantenimiento evaluados | [Integración](integration.md), [ADR 0002](../adr/0002-reuse-alphatab-viewer.md) propuesto |
| P0-05 | MVP y roadmap definidos | [Producto](product.md), [roadmap](roadmap.md) y criterios MVP siguientes |
| P0-06 | Estrategia contra regresiones de audio | [Pruebas](testing.md), distinción entre A/B offline y continuidad en vivo |
| P0-07 | Próxima tarea ejecutable preparada | [current-task](../current-task.md), con prerequisitos y salida |
| P0-08 | Comportamiento y motor conservados | Diff limitado a documentación/agentes; sin commits/push ni cambios de código, manifiestos o submódulos |

Los resultados y limitaciones de validación se mantienen en un solo lugar:
[validation.md](validation.md). P0-03 admite bloqueo documentado por definición;
ninguna fila de Fase 0 certifica los criterios MVP.

## MVP: evidencia exigida antes de declararlo operativo

Todos **pendientes de ejecución en la aplicación macOS** al cerrar Fase 0.

| ID | Escenario y resultado observable | Verificación |
| --- | --- | --- |
| MVP-01 | Dado cada fixture autorizado GP3/4/5/GPX6/GP7/GP8, abrirlo por diálogo y arrastre muestra pista, compases, notas y tablatura esperados; no se confunde una extensión con el formato real | Matriz por formato, hash/procedencia y comparación visual |
| MVP-02 | Con archivo multipista, cambiar pista y alternar Tab / Notation + Tab / Notation mantiene legibilidad; desplazar y redimensionar no rompe controles de audio | WKWebView, tamaño habitual y mínimo de ventana soportado |
| MVP-03 | Con NAM+IR+FX activos, abrir/cerrar, cambiar vista y desplazar partitura no altera preset, parámetros, dispositivos ni audio; no aparece síntesis de partitura | Estado antes/después, señal y sesión de concurrencia |
| MVP-04 | Cancelar, abrir vacío/corrupto o importar más de 16 MiB produce cancelación/error controlado; luego se puede abrir uno válido y la guitarra sigue funcionando | Casos límite y recuperación; comprobar también frontera de tamaño/base64 |
| MVP-05 | Desde arranque frío sin red, se abre archivo local sin backing track y se cargan partitura, worker y Bravura desde el paquete | Inspección de recursos/red; sin CDN ni servicio de conversión |
| MVP-06 | Guardar y reabrir un proyecto existente con partitura recupera su binding; un proyecto sin partitura y un preset anterior conservan comportamiento | Recall con original movido, sin migración incompatible |
| MVP-07 | La vista respeta créditos y el bundle de prueba conserva avisos/licencias; los requisitos de fuente y distribución quedan documentados, sin exigir publicación | Revisión de UI, contenido del bundle y evaluación de integración |
| MVP-08 | Suite core y comparaciones A/B no muestran cambios injustificados de señal, latencia o colas; la interacción con visor no agrega cortes o incumplimientos de plazo | Protocolo de [pruebas](testing.md), con baseline y resultados |
| MVP-09 | Repetir apertura/cierre, ocultar/restaurar ventana y recuperarse de error no acumula indefinidamente memoria/workers ni deja la UI bloqueada | Serie de 20 ciclos, registro de recursos antes/después |

Si un formato o entorno no cumple, registrar la brecha y decidir explícitamente
si se corrige o se reduce la matriz soportada. No marcar el conjunto aprobado con
fixtures faltantes, tests simulados o solo un build satisfactorio.
