# Roadmap

| Fase | Resultado | Criterio de salida |
| --- | --- | --- |
| 0 — Base y SDD | Arquitectura, agentes, especificación y evidencia de validación; ningún cambio funcional | P0-01…P0-08, admitiendo los bloqueos reproducibles de build |
| 1 — MVP sobre el visor heredado | Implementados panel Score, zoom y compases; corpus GP3–8, build y pruebas disponibles. Aceptación manual incompleta | MVP-01…MVP-09 demostrados en Standalone, ADR 0002 ratificado o revisado |
| 2 — Evolución y distribución | Alcance decidido según evidencia: compatibilidad de plugins/plataformas, mejoras de práctica y preparación de distribución | Especificación propia antes de implementar; licencias/marca/servicios resueltos antes de publicar |

No se crean fases separadas por cada prueba o documento. El trabajo pendiente está
en [current-task](../current-task.md). Fase 1 fue autorizada expresamente; no se
inicia Fase 2 ni se distribuye el fork de forma implícita.

La revalidación del 18 de noviembre resolvió tooling, descargas y build arm64; el
usuario confirmó la apertura del programa. La evidencia y las limitaciones de
pruebas permanecen en [validación](validation.md). Al 20 de noviembre existen corpus
y evidencia WKWebView/bridge real. El usuario confirmó interfaz y partitura visibles
tras reiniciar; faltan completar la matriz manual y validar audio con hardware.

## Decisiones pendientes

| Decisión | Responsable | Momento / evidencia necesaria |
| --- | --- | --- |
| Ratificar aceptación completa de alphaTab | Arquitectura + QA | Render y bridge comprobados; falta continuidad de audio y cierre de aceptación manual |
| Matriz GP certificada y macOS mínimo | Producto + QA | Fixtures legales por generación y pruebas WebKit; macOS 11 en CMake no basta |
| Interfaz de audio, archivos grandes y presupuesto CPU/memoria | QA + responsable del proyecto | Corpus mínimo disponible; fijar equipo, presets y umbral con baseline |
| Correcciones de fallos heredados de checks/build | Responsable técnico | Evaluar cada bloqueo; no aumentar límites ni actualizar dependencias sin causa |
| Identidad Guitar Studio y acceso a APIs SoundShed | Responsable del proyecto | Antes de distribución: permisos escritos o alternativa definida |
| Obligaciones del artefacto distribuido | Responsable de distribución | Licencias exactas, fuente correspondiente y derechos de NAM/IR/partituras |

La prioridad inicial Standalone macOS arm64 y la visualización local son decisiones
de alcance documentadas para avanzar. Plugins, síntesis y nuevas funciones de práctica
no se incorporan implícitamente al MVP.
