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

Flujo: iniciar Standalone → elegir dispositivo y preset existentes → abrir Practice
Tool y archivo local → seleccionar pista/vista → practicar y ajustar controles de
audio → cerrar la partitura sin cambiar el preset ni detener la guitarra.
Cancelar o recibir un archivo inválido debe dejar un estado recuperable y conservar
el audio. Los detalles comprobables están exclusivamente en [aceptación](acceptance.md).

No se añaden un lector propio, JVM, sintetizador, cambios de motor, editor musical,
exportación, grabación nueva, sincronización nueva, servicios en nube ni soporte de
visor Nano Q. Las capacidades heredadas fuera del MVP no se eliminan ni desactivan.
El nombre Guitar Studio identifica este trabajo; no autoriza todavía rebranding del
binario ni uso de marcas/servicios de SoundShed para distribuir el fork.
