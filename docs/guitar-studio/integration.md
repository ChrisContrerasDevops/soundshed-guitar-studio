# Viabilidad, licencias y riesgos

Evaluación al 2026-11-17. Se conserva la versión instalada en el manifiesto;
consultar upstream sirve para evaluar, no para actualizar dependencias.

## Comparación técnica

| Aspecto | alphaTab | TuxGuitar |
| --- | --- | --- |
| Naturaleza | Biblioteca de notación y tablatura, núcleo TypeScript | Aplicación/editor multipista Java |
| Encaje local | Ya integrada en la WebView con versión 1.9.0 fijada | Requeriría integrar Java o conversión/IPC, o portar componentes |
| macOS arm64 | Sin JVM añadida; pendiente prueba real de WebKit, worker y fuentes | JDK 17+, Maven y UI SWT/JavaFX; verificar artefactos arm64 y empaquetado nativo |
| Guitar Pro | La base declara GP3–8; validar cada generación con fixtures reales | Importadores por formato; verificar módulos/versiones antes de prometer equivalencia |
| Audio | Modo externo heredado, sin sintetizador de partitura | Evitar introducir su reproducción MIDI o competir por dispositivos |
| Coste incremental | Validación y posibles ajustes acotados del visor existente | Nueva frontera de runtime/UI, distribución y mantenimiento |
| Uso recomendado | Candidato MVP conservando la integración actual | Referencia funcional/visual opcional; no dependencia del producto |

La caracterización se apoya en los repositorios de
[alphaTab](https://github.com/CoderLine/alphaTab) y
[TuxGuitar](https://github.com/helge17/tuxguitar), las
[instrucciones de compilación de TuxGuitar](https://github.com/helge17/tuxguitar/blob/master/INSTALL.md)
y la inspección local. La menor complejidad de alphaTab es una conclusión de esta
evaluación, no una garantía de fidelidad o rendimiento.

Ambos muestran mantenimiento: los listados oficiales consultados ofrecen
[alphaTab v1.9.0](https://github.com/CoderLine/alphaTab/releases) y
[TuxGuitar 2.1.1](https://github.com/helge17/tuxguitar/releases), además de versiones
previas/prereleases. No se considera TuxGuitar abandonado. Tampoco se presupone SLA
en ninguno: fijar versiones, revisar cambios de API/licencia y ejecutar regresión
antes de actualizarlas. No se descargó ni compiló TuxGuitar en esta fase.

## Condiciones de reutilización

| Componente | Condición y acción para Guitar Studio |
| --- | --- |
| SoundShed | AGPL-3.0 según README/LICENSE. Conservar avisos y cumplir obligaciones de fuente correspondiente al distribuir una obra derivada; considerar también acceso por red cuando aplique |
| alphaTab 1.9.0 | MPL-2.0. Mantener licencia/avisos y acceso a su fuente correspondiente; los cambios a archivos cubiertos conservan sus obligaciones |
| Bravura | SIL OFL-1.1 según avisos y copia de vendor heredados; distribuir texto OFL junto a las fuentes |
| TuxGuitar | LGPL declarada por el proyecto; ayuda oficial publica LGPL 2.1. Revisar avisos de cada módulo y el tag elegido antes de integrar, incluida la variante «or later» y terceros |
| JUCE, SDK y recursos NAM/IR | Conservar sus condiciones individuales; la licencia raíz no sustituye la revisión del artefacto concreto distribuido |

Fuentes: [LICENSE de SoundShed](../../LICENSE),
[README upstream y restricciones de marca/servicios](https://github.com/webprofusion/soundshed-guitar),
[LICENSE de alphaTab v1.9.0](https://raw.githubusercontent.com/CoderLine/alphaTab/v1.9.0/LICENSE),
[FAQ MPL de Mozilla](https://www.mozilla.org/en-US/MPL/2.0/FAQ/),
[licencia publicada en la ayuda TuxGuitar 1.6.6](https://www.tuxguitar.app/files/1.6.6/desktop/help/license.html)
y [avisos heredados](../../THIRD_PARTY_NOTICES.md).
No se verificó el texto de cada módulo del tag TuxGuitar 2.1.1; no se afirma una
auditoría legal completa de ese paquete.

La combinación propuesta mantiene la base AGPL y alphaTab como componente MPL
sin modificar. MPL contempla obras combinadas y licencias secundarias bajo sus
condiciones; no autoriza a convertir SoundShed en software propietario. Antes de
distribuir, comprobar licencias exactas, avisos y acceso al código de todos los
componentes del artefacto. Para TuxGuitar habría además obligaciones de la biblioteca
LGPL modificada/enlazada y sus terceros; no se descarta por incompatibilidad legal
automática, sino por el coste técnico que no necesita este MVP.

La [política oficial de atribución alphaTab](https://www.alphatab.net/docs/attribution)
pide conservar visible su crédito. La propia página distingue esa política de
MPL-2.0, que no impone una cláusula de crédito en UI, y anuncia una futura licencia
con atribución aún no decidida. Conservar el crédito existente por política del
proyecto y revisar la licencia de cada actualización; no aplicar una licencia
futura a 1.9.0 ni ocultar el crédito para el fork.

SoundShed reserva su marca y exige permiso escrito para usar sus servicios/API
desde otro proyecto. Esto es independiente del código AGPL. Fase 0 no cambia
branding/endpoints ni publica binarios. El MVP local no necesita esos servicios;
una distribución Guitar Studio requiere resolver identidad, servicios y derechos
de los recursos/fixtures antes del empaquetado público.

## Riesgos concretos a validar en Fase 1

| Riesgo | Control existente / evidencia pendiente |
| --- | --- |
| Archivo inválido o comprimido expansivo | Límite de 16 MiB y validación de importación existentes; no limita por sí solo bytes descomprimidos ni tiempo del parser. Medir entradas acotadas adversas, memoria y recuperación |
| Metadatos hostiles y bridge nativo | Revisar render/escaping y mensajes; nunca interpretar metadatos como HTML confiable ni ampliar capacidades nativas |
| Worker/fuentes bajo esquema local | Copia local existente; probar arranque frío/offline y primera carga en WKWebView, sin relajar CSP global para resolver fallos |
| Lectura/hash/base64 y render durante audio | Fuera del callback, pero pueden competir por CPU/memoria. Medir continuidad real, no inferirla de separación de módulos |
| Persistencia sin recolección | La base no elimina partituras huérfanas. Registrar uso de disco; limpieza o migración futura requiere especificación propia |
| Mensajes de referencia YouTube | Función heredada con origen/iframe restringidos; preservar controles. No añadir dependencia remota al flujo local del MVP |

No se implementan mitigaciones ni cambios de parser aquí. Los hallazgos se convierten
en pruebas o especificaciones concretas antes de modificar producto.
