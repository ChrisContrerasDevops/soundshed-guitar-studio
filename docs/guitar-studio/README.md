# Guitar Studio — desarrollo guiado por especificaciones

Fase 0, 17 de noviembre de 2026. Base: SoundShed
`a9f4fec1123d51218e090decaceec44c455740b5`. Esta documentación describe el proyecto
derivado; la referencia técnica upstream se conserva en el resto de `docs/`.

**Hallazgo de partida:** ya existen alphaTab 1.9.0 y visualización Guitar Pro en
Practice Tool. Fase 0 no los implementa ni los cambia. Fase 1 comprobará su idoneidad
para el MVP; no se presupone que hayan sido validados en este Mac.

| Fuente única | Contenido |
| --- | --- |
| [Producto](product.md) | Visión, usuarios, funciones y alcance MVP |
| [Arquitectura](architecture.md) | Base real, dependencias y límites recomendados |
| [Integración](integration.md) | alphaTab/TuxGuitar, licencias y riesgos |
| [Aceptación](acceptance.md) | Criterios de Fase 0 y del MVP |
| [Pruebas](testing.md) | Regresión de audio y verificación del visor |
| [Validación](validation.md) | Entorno, resultados y comandos reproducibles |
| [Roadmap](roadmap.md) | Fases y decisiones pendientes |
| [ADR 0001](../adr/0001-sdd-and-existing-baseline.md) | Metodología y respeto a la base |
| [ADR 0002](../adr/0002-reuse-alphatab-viewer.md) | Recomendación del visor |
| [Tarea actual](../current-task.md) | Traspaso concreto a Fase 1 |

## Metodología

Una tarea comienza por el problema, comportamiento actual, alcance y criterios
observables. Primero se ajusta la especificación; después se implementa el cambio
autorizado y se valida contra esos criterios. El cierre aporta evidencia y actualiza
la tarea actual. Un ADR conserva decisiones duraderas y sus consecuencias, no pasos
de ejecución. No se exige un documento nuevo por prueba, pantalla o subtarea.

Estados de evidencia: **verificado**, **fallo heredado**, **bloqueado** o **pendiente**.
El estado del producto se decide por [aceptación](acceptance.md), no por la existencia
de archivos. Los bloqueos nativos registrados permiten cerrar el análisis de Fase 0,
pero no permiten declarar el MVP operativo ni publicar una distribución.

## Configuración Codex

[AGENTS.md](../../AGENTS.md) contiene las reglas comunes. Los cinco TOML de
[`.codex/agents/`](../../.codex/agents/) usan `name`, `description` y
`developer_instructions`; son subagentes nativos, no skills ni prompts Markdown.
Se descubren en el ámbito del proyecto. No se añade `config.toml`: los archivos
autónomos bastan y se heredan modelo, permisos y preferencias de la sesión.
La política administrada del cliente sigue aplicándose. Fuente:
[documentación oficial de subagentes](https://learn.chatgpt.com/docs/agent-configuration/subagents).

Abrir la raíz `soundshed-guitar-studio` como proyecto de Codex. Ejemplo de encargo:
«Usa `architecture` para revisar ADR 0002 y `qa` para comprobar los criterios de
Fase 1; solo lectura y sin cambios DSP». No hace falta activar los cinco a la vez.
Si el cliente ya estaba abierto antes de crear los archivos, comprobar su descubrimiento
en una sesión nueva. La validación del formato y las limitaciones de activación se
registran en [validación](validation.md); no se afirma una invocación de estos perfiles
cuando solo se han utilizado agentes de revisión de la sesión actual.

Referencias heredadas de entrada: [quickstart](../agent-quickstart.md),
[arquitectura](../architecture-overview.md), [visor](../practice-tool-tablature.md)
y [convenciones](../../.github/copilot-instructions.md).
