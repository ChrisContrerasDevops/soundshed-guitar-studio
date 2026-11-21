# Fixtures de visualización Guitar Studio

`reading-exercise.gp` es un ejercicio sintético original, sin música comercial:
12 compases, guitarra de seis cuerdas y bajo de cuatro, a 100 bpm. Se genera con
`node tools/guitar-studio/generate-fixture.cjs` desde la raíz usando el exportador
GP7+ de alphaTab **1.9.0** ya instalado. Es un archivo ZIP/GPIF compatible, no un
alphaTex renombrado. Se distribuye bajo la licencia del proyecto.

Los cinco archivos `notes-gp*` y `barnumbers-gp8.gp` son fixtures mínimos sin
modificar del tag [alphaTab v1.9.0](https://github.com/CoderLine/alphaTab/tree/v1.9.0/packages/alphatab/test-data).
Su procedencia exacta, tamaño y SHA256 están en [upstream.json](upstream.json).
Se conserva la [licencia MPL-2.0](alphatab-LICENSE) del repositorio de origen;
el código fuente correspondiente está disponible en ese tag. No son canciones
comerciales ni se incluyen como contenido de usuario del producto.

Esperado: GP3/4/5/6/7 contienen un compás, una pista, afinación estándar de guitarra
y trastes iniciales 1, 2, 3, 4. El fixture GP8 contiene seis compases de silencios y
la pista Steel Guitar: acredita ese contenido GP8, no todas sus técnicas musicales.
`guitarProFixtures.test.ts` comprueba bytes, parser y estructura. El render real y
los límites de fidelidad se registran en la validación SDD; parsear no equivale a
validar visualmente todo el formato.
