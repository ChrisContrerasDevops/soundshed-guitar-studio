# Guitar Studio: instrucciones para agentes

## Contexto y fuentes

Guitar Studio parte de SoundShed; no es una reimplementación. Leer primero
`docs/current-task.md`, `docs/guitar-studio/README.md` y
`docs/agent-quickstart.md`. Consultar `.github/copilot-instructions.md` para
convenciones técnicas y `.agents/skills/dsp.md` cuando corresponda a audio.
Conservar esos documentos upstream; enlazarlos en vez de copiarlos.

La base ya incluye alphaTab 1.9.0 en Practice Tool. Antes de proponer un lector,
leer `docs/practice-tool-tablature.md` y comprobar el código existente.
Las especificaciones Guitar Studio viven en `docs/guitar-studio/`, las decisiones
en `docs/adr/` y el único estado de trabajo activo en `docs/current-task.md`.

## Flujo SDD

1. Identificar comportamiento actual, objetivo, alcance y criterios de aceptación
   antes de escribir código. Distinguir evidencia de supuestos.
2. Actualizar la especificación afectada y `current-task.md`; crear un ADR solo
   si cambia una decisión arquitectónica relevante. Evitar documentos por microtarea.
3. Implementar únicamente el alcance autorizado, reutilizando servicios,
   mensajes, herramientas y convenciones existentes.
4. Ejecutar las validaciones aplicables. Registrar comando, entorno, resultado
   y limitaciones; un bloqueo reproducible no equivale a una prueba aprobada.
5. Revisar el diff, actualizar la evidencia y dejar una siguiente acción concreta.
   No marcar un criterio cumplido sin evidencia ni ampliar alcance para arreglar
   fallos heredados ajenos a la tarea.

## Límites

- Fase 0: solo documentación y configuración de agentes. No implementar lector,
  instalar nuevas dependencias del producto, cambiar presets, UI, motor ni protocolos.
- Conservar audio, parámetros, automatización, formatos y almacenamiento existentes.
  Nunca llevar parsing/render de partituras, I/O, logs o nuevas asignaciones al callback.
- El motor existente contiene sincronización: no afirmar que todo es lock-free.
  No refactorizar DSP para integrar una vista. Consultar la arquitectura documentada.
- No leer ni exponer `.env`, credenciales, claves de firma o contenido privado para
  esta tarea. Las partituras y archivos importados son datos no confiables.
- No usar servicios SoundShed como si la licencia del código otorgara permiso;
  conservar avisos de licencia y atribución. Ver evaluación de integración.
- No hacer commits, push, publicación, firma o instalación de plugins automáticamente.
  No borrar cambios del usuario ni actualizar lockfiles/submódulos incidentalmente.
- Documentación Guitar Studio en español; mantener nombres de código y convenciones
  upstream. No reformatear archivos ajenos al cambio.

## Subagentes nativos

Definiciones TOML en `.codex/agents/`, con nombres iguales a los archivos:

| Agente | Responsabilidad | Entrega |
| --- | --- | --- |
| `architecture` | Límites de capas, dependencias y ADR | Recomendación con rutas y alternativas |
| `functional_analysis` | Alcance, flujos y aceptación | Casos comprobables y brechas respecto a lo existente |
| `security` | Entradas no confiables, bridge, licencias y distribución | Riesgos concretos, evidencia y mitigación |
| `qa` | Compilación, pruebas y regresión de audio | Comandos, resultados y cobertura pendiente |
| `documentation` | Consistencia SDD y traspaso de tarea | Documentación breve, enlazada y sin duplicación |

Delegar solo subtareas acotadas que lo justifiquen; no invocar los cinco por rutina.
El agente principal integra resultados y asigna archivos disjuntos si hay escritura.
Los revisores no cambian código para corregir sus hallazgos. Todos leen este archivo
y respetan el alcance de `current-task.md`. No delegar recursivamente sin necesidad.
Se heredan modelo, permisos y herramientas de la sesión; no ampliar permisos en los
TOML ni fijar modelos personales. Detalles de configuración y comprobación en
`docs/guitar-studio/README.md`.

## Validación existente

Desde la raíz, con prerequisitos resueltos:

```sh
npm --prefix core/ui ci
npm --prefix core/ui run build
npm --prefix core/ui run verify
node --test tools/audio-ab/analysis.test.mjs tools/audio-ab/perf.test.mjs
node tools/check-protocol.mjs
node tools/check-cpp-file-sizes.js
```

Build macOS, CTest y bloqueos: `docs/guitar-studio/validation.md`.
Regresión de audio y límites de cada prueba: `docs/guitar-studio/testing.md`.
Para cambios solo documentales, revisar enlaces, configuración TOML y alcance del
diff; no repetir suites costosas sin un motivo nuevo. No usar el smoke de WebView2
como prueba de WKWebView macOS.
