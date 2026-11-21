# Visión y MVP

Guitar Studio permitirá practicar guitarra viendo una partitura y su tablatura en
la misma aplicación que procesa la guitarra con los amplificadores NAM, IR y
efectos de SoundShed. La prioridad es conservar el sonido y la respuesta del equipo
de práctica mientras se consulta música local.

Usuario inicial: guitarrista con Mac Apple Silicon, interfaz de audio y archivos
Guitar Pro de uso autorizado. Plataforma de aceptación inicial: aplicación JUCE
Standalone con WebView; los formatos plugin y otras plataformas siguen formando
parte de la base y no deben sufrir cambios incidentales.

## Funcionalidades y estado real

| Capacidad | Situación en la revisión base | Papel en el MVP |
| --- | --- | --- |
| Amplificación NAM, cabinas IR, efectos y presets | Implementados en SoundShed | Reutilizar y comprobar regresión |
| Abrir/arrastrar partitura, conservarla en biblioteca | Implementado en Practice Tool | Validar archivos reales y errores |
| Tablatura, notación y vista combinada | Implementado con alphaTab 1.9.0 | Validar render y fuentes en WKWebView |
| Selección de pista, desplazamiento y vista | Implementado en UI | Validar legibilidad y uso simultáneo |
| Acceso directo y panel acoplado de partitura | Implementado en Fase 1 | Botón Score en la navegación principal; mueve el mismo visor sin duplicar estado, conserva Play y sus controles |
| Zoom y navegación por compases | Implementado en Fase 1 | Zoom 50–200 %, anterior/siguiente e ir al compás; desplazamiento visual sin controlar transporte |
| Partitura sin backing track | Documentada como vista estática | Flujo principal, sin servicios remotos |
| Recuperar partitura vinculada a proyecto/referencia | Implementado | Conservar compatibilidad y comprobar recall |
| Cursor y sincronización con backing track/YouTube | Implementados upstream | Preservar; no requisito de sincronización nueva |
| Audio sintetizado de partitura, edición/exportación GP | No forman parte del visor actual | Fuera del MVP |
| Visor Nano Q nativo | No implementado | Fuera del MVP |

La presencia de código no equivale a aceptación: consultar los resultados de
[validación](validation.md) y los [criterios](acceptance.md).

## Alcance

El MVP permite abrir un archivo local GP3/GP4/GP5, GPX (GP6) o GP (GP7/8), elegir
la pista y alternar tablatura/notación/combinada mientras el audio existente sigue
activo. La matriz exacta se certifica con fixtures autorizadas de cada generación;
no se promete fidelidad de todos los efectos de Guitar Pro por la extensión.
La visualización local no dependerá de cuenta, CDN, backend nuevo ni conexión.
Se mantienen los límites de importación y la persistencia existentes.

Abrir Guitar Pro no reproduce sus notas: el visor no incorpora Play/Pausa propio
ni síntesis de instrumentos. Los controles de reproducción heredados actúan sobre
el backing track o vídeo de referencia. La reproducción autónoma de la partitura
requiere una especificación posterior y no forma parte de esta Fase 1.

Flujo: iniciar Standalone → elegir dispositivo y preset existentes → abrir Score
desde la navegación principal → Open Guitar Pro y archivo local → seleccionar
pista/vista, zoom y compás → practicar y ajustar controles de audio → ocultar el
panel o cerrar la partitura sin cambiar el preset ni detener la guitarra.
Practice Tool conserva su acceso original; ambos accesos utilizan una única vista.
El panel se acopla al área de trabajo sin bloquear los controles de Play; en ventanas
estrechas se apila con altura acotada y desplazamiento propio. Ocultar conserva la
partitura; Close libera el renderizador. No se requiere backing track ni cuenta.
Cancelar o recibir un archivo inválido debe dejar un estado recuperable y conservar
el audio. Los detalles comprobables están exclusivamente en [aceptación](acceptance.md).

Fase 1 también acota el ciclo de carga: cerrar o abrir otra partitura invalida la
carga anterior, las respuestas tardías de recuperación no reabren una vista cerrada
y el arrastre comprueba 16 MiB antes de leer bytes. Se permiten identificadores
opcionales de solicitud en los mensajes existentes para correlacionar respuestas;
no cambia el formato persistido ni la responsabilidad de parsing/render de la UI.

No se añaden un lector propio, JVM, sintetizador, cambios de motor, editor musical,
exportación, grabación nueva, sincronización nueva, servicios en nube ni soporte de
visor Nano Q. Las capacidades heredadas fuera del MVP no se eliminan ni desactivan.
El nombre Guitar Studio identifica este trabajo; no autoriza todavía rebranding del
binario ni uso de marcas/servicios de SoundShed para distribuir el fork.
