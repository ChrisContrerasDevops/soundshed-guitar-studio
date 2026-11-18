# Roadmap

| Fase | Resultado | Criterio de salida |
| --- | --- | --- |
| 0 — Base y SDD | Arquitectura, agentes, especificación y evidencia de validación; ningún cambio funcional | P0-01…P0-08, admitiendo los bloqueos reproducibles de build |
| 1 — MVP sobre el visor heredado | Build arm64 reproducible, corpus autorizado y validación de visor+audio; corregir solo brechas especificadas y autorizadas | MVP-01…MVP-09 demostrados en Standalone, ADR 0002 ratificado o revisado |
| 2 — Evolución y distribución | Alcance decidido según evidencia: compatibilidad de plugins/plataformas, mejoras de práctica y preparación de distribución | Especificación propia antes de implementar; licencias/marca/servicios resueltos antes de publicar |

No se crean fases separadas por cada prueba o documento. La tarea de inicio de
Fase 1 está en [current-task](../current-task.md). Terminar Fase 0 no autoriza
implementar Fase 1 durante esta sesión ni a distribuir el fork.

## Decisiones pendientes

| Decisión | Responsable | Momento / evidencia necesaria |
| --- | --- | --- |
| Ratificar reutilización de alphaTab | Arquitectura + QA | Fase 1: render real, carga local y continuidad de audio |
| Matriz GP certificada y macOS mínimo | Producto + QA | Fixtures legales por generación y pruebas WebKit; macOS 11 en CMake no basta |
| Corpus, interfaz de audio y presupuesto CPU/memoria | QA + responsable del proyecto | Antes de aceptar mediciones; fijar equipo, presets y umbral con baseline |
| Correcciones de fallos heredados de checks/build | Responsable técnico | Evaluar cada bloqueo; no aumentar límites ni actualizar dependencias sin causa |
| Identidad Guitar Studio y acceso a APIs SoundShed | Responsable del proyecto | Antes de distribución: permisos escritos o alternativa definida |
| Obligaciones del artefacto distribuido | Responsable de distribución | Licencias exactas, fuente correspondiente y derechos de NAM/IR/partituras |

La prioridad inicial Standalone macOS arm64 y la visualización local son decisiones
de alcance documentadas para avanzar. Plugins, síntesis y nuevas funciones de práctica
no se incorporan implícitamente al MVP.
