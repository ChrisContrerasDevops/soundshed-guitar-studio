# Tarea actual — entrada a Fase 1

**Estado:** Fase 0 documentada; Fase 1 preparada, no iniciada funcionalmente.
**Fecha:** 2026-11-17 (America/Santiago).
**Base inmutable de comparación:** `a9f4fec1123d51218e090decaceec44c455740b5`.

## Objetivo siguiente

Reproducir el build Standalone arm64 y validar el visor alphaTab heredado con
archivos Guitar Pro reales mientras funciona el audio SoundShed. No construir
otro lector. [ADR 0002](adr/0002-reuse-alphatab-viewer.md) sigue propuesto hasta
obtener esa evidencia.

## Punto de partida y bloqueos

Leer [AGENTS](../AGENTS.md), [producto](guitar-studio/product.md),
[arquitectura](guitar-studio/architecture.md) y
[validación](guitar-studio/validation.md). El último contiene comandos y salidas:
faltan CMake/submódulos y la instalación npm no completó por red. Los checks C++
tienen incumplimientos heredados. La base ya contiene alphaTab 1.9.0, importación,
vistas y persistencia. Ninguna prueba en hardware ha sido realizada en Fase 0.

## Trabajo acotado al comenzar

1. Resolver CMake ≥3.25 y acceso a dependencias; inicializar submódulos en sus
   revisiones registradas. No actualizar pins para sortear errores.
2. Repetir instalación UI, build/verify, build Standalone arm64 y CTest con los
   comandos de validación. Registrar cada fallo con reproducción y atribución.
3. Preparar fixtures autorizadas GP3/4/5/GPX6/GP7/8, hashes, referencias esperadas,
   preset NAM/IR permitido y equipo de prueba; no incorporar partituras comerciales
   sin autorización. Acordar presupuesto de recursos después de medir la base.
4. Ejecutar la matriz [MVP-01…MVP-09](guitar-studio/acceptance.md) y la estrategia
   [de regresión](guitar-studio/testing.md), separando automatización y prueba real.
5. Si hay brechas, especificar el cambio mínimo antes de implementarlo, dentro de
   autorización de Fase 1. No modificar motor, sintetizar partituras ni introducir
   nuevo runtime. Si exige ese alcance, registrar la decisión pendiente.

## Salida y entrega

Build y arquitectura arm64 comprobados, matriz por fixture y audio con evidencia,
fallos heredados separados de regresiones, ADR ratificado/revisado y tarea actual
actualizada. El MVP solo se acepta si cumple sus criterios; un bloqueo documentado
ya no sustituye la validación funcional. Conservar un registro breve de comandos,
SHA, entorno, resultados y ubicación de artefactos.

No hacer commits, push, cambios de licencia/branding, publicación ni instalación
de plugins automáticamente. La siguiente sesión comienza por resolver el entorno,
no por implementar una función nueva.
