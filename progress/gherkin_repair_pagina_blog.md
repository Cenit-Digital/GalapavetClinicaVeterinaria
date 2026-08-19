# Reparación de features/pagina_blog.feature — 18/08/2026

Contra `progress/revision/VEREDICTO_pagina_blog.md` (10 hallazgos CONFIRMADO).
Se tocan únicamente las filas CONFIRMADO; las 8 REFUTADO no se modifican (ya
llevan su propia justificación escrita en el veredicto).

## Hallazgos CONFIRMADO atendidos

1. **@s28 (grave, L1) — alt "describe la fotografía" es juicio de prosa libre.**
   Línea ~467. Se sustituye `"...describe la fotografía y no afirma ningún
   servicio"` por `"...no está vacío y no afirma ningún servicio"`: queda
   contrastable (no-vacío + ausencia de literal de servicio) sin exigir un
   juicio subjetivo de si el alt "describe" la foto. Se sincroniza también el
   comentario PENDIENTE de fotografías (línea ~137-139), que citaba la misma
   frase, para no dejar la documentación contradiciendo al escenario.

2. **@s3 (y @s15, CABECERA) (grave, L2) — "Galapavet no tiene blog" es un hecho
   de negocio no verificado en `docs/datos-galapavet.md`** (`grep -i blog`
   devuelve 0 coincidencias). Se quita la cláusula "no tiene blog y" en los tres
   sitios donde aparecía el literal: cabecera del fichero (título de la
   sección "EL CAMBIO DE FONDO" línea ~28 y su párrafo, línea ~30-34),
   bloque "TEXTOS LITERALES" (línea ~118), `@s3` Then (línea ~197) y `@s15`
   Then (línea ~328). El texto que queda ("Galapavet no ha escrito ninguno de
   estos artículos...") es verdadero por construcción del propio contrato
   (Decisión 1b: el blog se rehace como demo), no una afirmación no verificada
   sobre si el negocio real tiene o no sección de blog.

3. **Background (y @s13) (bloqueante, L3) — no se ancla si la tabla de 6
   artículos es el catálogo de producción real o un doble inyectable.** Se
   añade una línea al Background (línea ~168): "esa tabla escrita a mano es el
   catálogo que exporta el módulo de producción del blog; ningún escenario la
   sustituye por un doble salvo que declare explícitamente su propio catálogo o
   cuerpo de artículo en el Given". Deja claro que, salvo excepción explícita
   (@s13, @s16, @s19, @s25, @s26, y los nuevos @s30/@s31), todo escenario
   ejercita el array real exportado, no una copia de test aislada — mismo
   patrón que `features/accesibilidad.feature @s1`.

4. **@s22 (bloqueante, L3) — el tope "nunca más de 3" nunca se ejercita porque
   la categoría más poblada del Background solo tiene 3 artículos.** No se
   toca `@s22` (su Given usa el Background real y no puede forzar >3
   candidatos sin romper otros escenarios que dependen del mismo catálogo
   compartido, p. ej. @s9). Se añade un escenario nuevo **`@s30`** (línea
   ~484) con su propio catálogo inyectado de 5 artículos de una categoría (4
   candidatos + el actual) que exige exactamente 3 enlaces y descarta
   expresamente el cuarto candidato: mata cualquier mutante que suba el tope
   de 3 a 4 o más.

5. **@s27 (bloqueante, L3) — la puerta anti-primera-persona son 7 negaciones
   sin ningún control positivo de que el texto recorrido no esté vacío.** Se
   añade, como primer `Then` (línea ~451, antes de las negaciones): "el texto
   recorrido no está vacío y contiene el título de cada uno de los seis
   artículos del catálogo". Si el recorrido agregado devuelve cadena vacía,
   este `Then` ahora sí lo delata.

6. **@s28 (grave, L3) — los 5 Then de la puerta de imágenes son universales o
   negaciones, sin recuento que pruebe que se inspeccionó alguna imagen.** Se
   añade como primer `Then` (línea ~464): "se han inspeccionado exactamente 3
   imágenes: la del cuerpo del artículo y las 2 miniaturas del bloque «Sigue
   leyendo»" — cifra derivada mecánicamente del propio Background (demo-1 es
   de "Medicina general", quedan demo-2 y demo-3 como relacionados, igual que
   ya establece @s22 para el mismo identificador).

7. **@s19 (grave, L3) — ningún Then de todo el fichero afirma un tiempo de
   lectura POSITIVO sobre una página de artículo realmente renderizada.** No
   se toca `@s19` (su propósito es la negación del caso vacío). Se añade un
   escenario nuevo **`@s31`** (línea ~498): artículo con cuerpo de exactamente
   200 palabras, renderizado en `/blog/demo-2`, que exige ver el texto "1 min"
   dentro del `article` — mismo par (200 palabras → "1 min") que ya fija la
   tabla de `@s18`, sin inventar ninguna cifra nueva.

8. **@s18 (grave, L3) — la velocidad de 200 ppm entra como dato de prueba por
   el Given, sin ningún Then que la fije como constante de producción.** Se
   añade un `Then` (línea ~355), antes de la tabla: "la velocidad de lectura
   que exporta el módulo de cálculo es exactamente 200 palabras por minuto" —
   ahora el valor exportado del módulo se compara contra un literal, no solo
   se usa como entrada.

9. **@s26 (grave, L3) — el catálogo de patrones prohibidos no está anclado
   contra una lista completa, solo se ejercitan 5 casos por el camino feliz.**
   Se añade un `And` de cierre (línea ~445), mismo patrón que ya usa `@s7`
   para su lista de botones: "la lista de patrones prohibidos que declara el
   validador contiene exactamente estos 5 y ningún otro".

10. **@s29 (menor, L3) — el último Then sobre orden de llamadas internas no
    corresponde a ningún mutante nombrable de `src/**/*-logica.ts` y exige
    espiar el cableado `.tsx` (excluido de `stryker.config.json`).** Se
    elimina la cláusula "y en ningún punto de la página se pide un
    desplazamiento con 'smooth' sin haber consultado antes esa preferencia"
    (última línea de `@s29`). La tabla de comportamiento que queda ya agota la
    lógica pura mutable.

## Hallazgos REFUTADO — no tocados

@s28 (menor, L1 peticiones a terceros), @s5 (menor, L1 "ningún otro
distintivo"), @s3 (menor, L1 "texto visible"), @s2 (menor, L2 nav
"aria-current"), @s14/@s28 (menor, L2 fotografía obligatoria), @s11 (grave, L3
"0==0"), @s5 (grave, L3 tautología de título), @s6/@s17 (grave, L3 negación
sin no-vacío): sin cambios, cada uno lleva su propia justificación en el
veredicto.

## Escenarios añadidos

- `@s30` — cierra el hallazgo del tope de 3 en «Sigue leyendo» (ligado a
  `@s22`).
- `@s31` — cierra el hallazgo del tiempo de lectura positivo sobre página real
  (ligado a `@s19`/`@s18`).

Numeración: se conservan `@s1`-`@s29` sin renumerar (las citas ya existentes
en `progress/` y `feature_list.json` siguen siendo válidas); los dos nuevos se
añaden al final bajo una sección `E` explícita.
