# ADR 0001 — SDD sobre la base existente

- Fecha: 2026-11-17
- Estado: aceptado para Fase 0 por el alcance solicitado.

## Contexto

SoundShed ya dispone de documentación técnica, agentes de otros clientes, CMake,
scripts de UI y pruebas. La revisión base ya contiene alphaTab y un visor Guitar
Pro. Reemplazar esas convenciones o partir de una supuesta ausencia del visor
crearía trabajo duplicado y riesgo para el audio.

## Decisión

Usar `AGENTS.md`, cinco subagentes nativos TOML y especificaciones en
`docs/guitar-studio/`. Mantener `docs/current-task.md` como único traspaso activo.
Enlazar documentación upstream, preservar código/manifiestos/lockfiles y registrar
el SHA base. Cada cambio futuro parte de criterios observables y termina con
evidencia; solo decisiones arquitectónicas relevantes producen ADR.

## Alternativas y consecuencias

Reescribir toda la documentación duplicaría fuentes; crear una herramienta SDD nueva
añadiría mantenimiento sin necesidad. Se elige Markdown y herramientas existentes.
El primer incremento deberá validar lo heredado, no demostrar un lector nuevo.
Un bloqueo reproducible satisface el análisis de compilación de Fase 0, pero no
certifica el producto. La definición de salida está en
[aceptación](../guitar-studio/acceptance.md).
