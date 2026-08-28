# Fix @s40 (`rediseno_visual.feature`) — tarjetas del listado del blog

**Encargo:** `judge_rediseno_visual.md`, Hallazgo 2 / "Cambios requeridos" #2.
**Alcance autorizado:** `src/pages/PaginaBlog.tsx`, `src/pages/PaginaBlog.module.scss`,
`src/pages/PaginaBlog.test.tsx`. Ningún otro fichero se ha tocado.

## 1. Decisión de diseño (con evidencia, no con criterio a ciegas)

El encargo proponía conservar `DISTINTIVO_DEMOSTRACION` ("Demostración") Y
añadir `articulo.categoria` como elemento hermano, con el precedente de
`TarjetaCampana` (`PaginaCampanas.tsx:41-53`, ya `done`). Antes de aplicarlo
a ciegas comprobé el prototipo versionado (fuente de mayor autoridad para
"el patrón de tarjeta del sistema" que exige literalmente el `Then` de
@s40) y el propio `progress/estudio_diseno_referencia.md`:

- `docs/diseno-claude-design/Blog.dc.html:106-122` (listado real de
  tarjetas, `hint-placeholder-count="6"`): cada tarjeta es
  `imagen (aspect-ratio:16/10) → categoría (span uppercase, color
  var(--accent-ink), SIN fondo/píldora) → título → entradilla → pie`.
  La categoría en el prototipo **no es una píldora**: es un rótulo corto en
  versalitas con la tinta de acento, exactamente la forma del mixin
  `eyebrow` que ya usa el resto del sistema (`_api.scss:324-332`), no
  `pildora-etiqueta`.
- `progress/estudio_diseno_referencia.md:285-289` (§3.6, "Relaciones de
  aspecto de imagen: 3"): confirma por escrito que la tarjeta de artículo
  del blog usa **16/10**, no 16/9 — la misma proporción que la tarjeta de
  servicio (`Servicios.tsx:24` + `Servicios.module.scss:24`,
  `hueco-de-imagen(8, 5)`, ya `done`), y **distinta** de la imagen grande de
  artículo de este mismo fichero (`> article > img`, 16/9, sin tocar).
- `progress/estudio_diseno_referencia.md:307-308` y `:346`: el distintivo
  tipo píldora del prototipo (`--accent-soft`/`--accent-ink`) es del patrón
  "Destacado" (single, absoluto) — no coexiste con un segundo rótulo de
  categoría en píldora en ningún sitio del bundle real.

**Decisión final, con las dos fuentes de acuerdo:**
1. Se CONSERVA `<span>{DISTINTIVO_DEMOSTRACION}</span>` (pildora-etiqueta) —
   sigue siendo el único distintivo de *estado*, exigido y cerrado por
   `pagina_blog.feature` @s5 (ya `done`; ninguna categoría lo sustituye).
2. Se AÑADE `<p className={styles.categoria}>{articulo.categoria}</p>`
   como elemento hermano nuevo, estilado con el mixin `eyebrow` (uppercase,
   letter-spacing, `--color-acento-tinta`, sin fondo) — no con
   `pildora-etiqueta` de nuevo, porque (a) el prototipo real la pinta así
   (`Blog.dc.html:114`) y (b) usar la píldora otra vez habría duplicado
   visualmente el distintivo "Demostración" con el mismo lenguaje visual,
   perdiendo la distinción entre "esto es relleno de demo" y "esto es la
   categoría real del artículo" que el propio Hallazgo 2 pedía preservar.
3. Imagen real: `<img src={hrefDeDestino(articulo.imagen)} alt="" width={800}
   height={500} loading="lazy" decoding="async" />`, decorativa
   (`alt=""`), mismo patrón exacto que `TarjetaServicio`
   (`Servicios.tsx:24`) y `TarjetaCampana`/`CampanasPortada`
   (`PaginaCampanas.tsx:44-46`, `CampanasPortada.tsx:50-52`): la tarjeta ya
   lleva el título como texto real (`h2`) y la categoría como texto real
   (el `p` nuevo), así que la fotografía no necesita duplicar esa
   información en su alternativo — evita narración redundante en lector de
   pantalla, mismo criterio que el propio fichero ya aplica en
   `BloqueSigueLeyendo` (`PaginaBlog.tsx`, `alt=""` porque el título ya
   sigue a la imagen).
4. CSS: `img { @include hueco-de-imagen(8, 5); }` dentro de
   `ul[aria-label='Listado de artículos']`, y `.categoria { @include
   eyebrow; margin: espaciado(12) espaciado(20) 0; }`. Se quitó el
   `padding: espaciado(20); gap: espaciado(8);` que tenía `a` (pensado para
   cuando no había imagen) y se repartió el espaciado en márgenes
   individuales de `span`/`.categoria`/`h2`, igual que hace
   `PaginaCampanas.module.scss:76-92` para su propia tarjeta con imagen.

Los otros dos "Then" de @s40 (ancho/interlineado de prosa del artículo,
aviso de demostración) ya estaban cerrados y no se han tocado, tal como
indicaba el encargo.

## 2. Ciclo Rojo → Verde → Refactor (real, con mensajes literales)

### Baseline
`pnpm exec vitest run src/pages/PaginaBlog.test.tsx` → 28/28 verde antes de
tocar nada (confirmado).

### Ciclo 1 — imagen real en la tarjeta del listado

**ROJO.** Test nuevo en `PaginaBlog.test.tsx` (`@s40`, primer `it`):
recorre las 6 `li` de `ul[aria-label='Listado de artículos']` y exige
`tarjeta.querySelector('img')` no nulo, con `src` == `articulo.imagen`,
`alt=""`, `loading="lazy"`, `decoding="async"` y proporción `width/height`
≈ 8/5. Falló con el mensaje literal:

```
AssertionError: la tarjeta 0 ("Artículo de demostración 1") no tiene ninguna imagen: expected null not to be null
 ❯ src/pages/PaginaBlog.test.tsx:176:101
```

**VERDE.** En `TarjetaArticulo` (`PaginaBlog.tsx`) se añadió:
`<img src={hrefDeDestino(articulo.imagen)} alt="" width={800} height={500}
loading="lazy" decoding="async" />` como primer hijo del `<Link>`, y en
`PaginaBlog.module.scss` la regla `img { @include hueco-de-imagen(8, 5); }`
dentro del bloque del listado.

### Ciclo 2 — categoría real en la tarjeta del listado

**ROJO.** Segundo `it` de `@s40`: para cada tarjeta, `within(tarjeta)
.getByText(articulo.categoria)` (texto real del catálogo, no un literal
fijo), y comprueba que hay más de un texto de categoría distinto entre las
6 tarjetas (mismo patrón anti-defecto que `Servicios-logica.test.ts`/@s31:
nunca fijar un único valor esperado para todas). Falló con el mensaje
literal:

```
TestingLibraryElementError: Unable to find an element with the text: Medicina general. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.
...
<li>
  <a data-discover="true" href="/blog/demo-1">
    <span>Demostración</span>
    <h2>Artículo de demostración 1</h2>
  </a>
</li>
 ❯ src/pages/PaginaBlog.test.tsx:204:30
```

**VERDE.** En `TarjetaArticulo` se añadió
`<p className={styles.categoria}>{articulo.categoria}</p>` entre el `span`
de "Demostración" y el `h2` del título, y en el `.scss` la regla
`.categoria { @include eyebrow; margin: espaciado(12) espaciado(20) 0; }`.

Tras VERDE 2: `pnpm exec vitest run src/pages/PaginaBlog.test.tsx` →
**1 fallo inesperado**, no de los tests nuevos, sino de un test YA
existente (@s6):

```
FAIL  src/pages/PaginaBlog.test.tsx > @s6 ninguna tarjeta atribuye el texto a una persona ni lo fecha > sin nombres, iniciales, fechas ni imágenes en las tarjetas del listado
AssertionError: expected <img alt width="800" …(4)></img>…(5) to have a length of +0 but got 6
 ❯ src/pages/PaginaBlog.test.tsx:216:42
    expect(main.querySelectorAll('img')).toHaveLength(0)
```

### Reparación forward de @s6 (no una nueva feature, una corrección de un test sobre-específico)

`features/pagina_blog.feature:224-231` (@s6, `pagina_blog`, feature 17,
`done`) dice literalmente:

```
Then ninguna tarjeta muestra un nombre de persona
And ninguna tarjeta muestra iniciales de autor ni ningún elemento con rol "img" que las represente
And ninguna tarjeta muestra una fecha de publicación
```

El `Then` prohíbe un elemento con **rol** "img" que represente **iniciales
de autor** — no toda imagen sin condición. El test existente
(`main.querySelectorAll('img')).toHaveLength(0)`) era una implementación
más estricta que el contrato: en su momento era equivalente (no había
ninguna imagen en el listado, así que "0 iniciales-avatar" y "0 imágenes"
coincidían), pero dejó de serlo en cuanto @s40 exige una fotografía real
del artículo. El modelo `ArticuloDemo` (`src/data/blog.ts:43-49`) sigue sin
declarar ningún campo de autor (regla R1 del `.feature`, sin cambios), así
que no hay ningún dato del que derivar un avatar de iniciales — la nueva
imagen es la fotografía del artículo, decorativa (`alt=""`), y por eso no
se expone con rol "img" en el árbol de accesibilidad (colapsa a
"presentation" quando `alt` está vacío).

Corrección aplicada, literal al `Then` real: cambié la aserción de
`main.querySelectorAll('img')).toHaveLength(0)` (cuenta etiquetas `<img>`)
a `within(main).queryAllByRole('img')).toHaveLength(0)` (cuenta el **rol**
"img" del árbol de accesibilidad, que es exactamente lo que el `Then`
nombra). Añadí un comentario en el test explicando la cita exacta del
`.feature` y por qué sigue siendo correcto. Con esto @s6 vuelve a medir lo
que el contrato pide, ni más ni menos, y ahora SÍ acomoda la fotografía
real de @s40 sin dejar de proteger contra un futuro avatar de autor (si
algún día se le pusiera un `alt` con nombre, el test volvería a fallar).

`pnpm exec vitest run src/pages/PaginaBlog.test.tsx` tras la corrección →
**30/30 verde** (28 preexistentes + 2 nuevos de @s40; @s6 sigue siendo el
mismo escenario, solo con la aserción alineada al `Then` real).

### Refactor

`TarjetaArticulo` quedó en 4 hijos directos del `<Link>` (imagen, span,
párrafo de categoría, h2), sin lógica añadida — mismo tamaño y forma que
`TarjetaServicio`/`TarjetaCampana`, sin duplicación nueva. No hizo falta
extraer nada.

## 3. Trazabilidad @s → test

| Cláusula del `Then` de @s40 | Test | Estado |
| --- | --- | --- |
| "el listado usa el patrón de tarjeta del sistema, con imagen" | `PaginaBlog.test.tsx`, describe `@s40 ...`, primer `it` (imagen con `src`/`alt`/`width`/`height`/`loading`/`decoding`, 8/5, `src` distinto por tarjeta) | Verde |
| "...y categoría" | `PaginaBlog.test.tsx`, describe `@s40 ...`, segundo `it` (texto real de `articulo.categoria` por tarjeta, ≥2 valores distintos entre las 6) | Verde (ya lo era) |
| "el artículo abierto conserva su ancho de lectura y su interlineado de prosa" | Sin cambios: `PaginaBlog.module.scss:100-103` (`> article { @include prosa; max-width: 760px; }`), no tocado | Ya cerrado antes de este fix |
| "el aviso de contenido de demostración sigue presente" | Sin cambios: `PaginaBlog.tsx` `AVISO_DEMOSTRACION` en `VistaListado` y `VistaArticulo`, cubierto por `@s3`/`@s15` | Ya cerrado antes de este fix |
| (regresión colateral) `pagina_blog.feature` @s6 | `PaginaBlog.test.tsx`, describe `@s6 ...` (corregido: `queryAllByRole('img')` en vez de `querySelectorAll('img')`) | Verde, reparado hacia delante |

## 4. Verificación

- `pnpm exec vitest run src/pages/PaginaBlog.test.tsx` → **30/30 verde**
  (fichero completo, no solo los tests nuevos).
- `pnpm run lint` (`oxlint --deny-warnings`) → limpio, 0 avisos.
- `pnpm run typecheck` (`tsc -b`) → limpio, 0 errores.
- `pnpm run build` fresco → verde. CSS servido: **60.72 kB / gzip 7.51 kB**
  (idéntico, al redondeo de dos decimales, a los 7.51 kB que medía el
  `judge` antes de este cambio) — muy por debajo del techo de 8000 B; la
  puerta de terceros del artefacto también dio 0 hallazgos.
- `pnpm exec playwright test --workers=1 --reporter=list` (suite e2e
  completa) → lanzada en segundo plano; resultado pendiente de añadir a
  este informe en cuanto termine (ver nota al pie).

## 5. HALLAZGO BLOQUEANTE fuera de mi alcance — NO reparado, solo reportado

`pnpm exec vitest run` (suite completa del repositorio) da **1229/1230
verdes, 1 fallo**, y ese fallo NO está en ninguno de los tres ficheros
autorizados:

```
FAIL src/imagenes-hrefDeDestino.test.ts > @s19 los seis componentes que pintan una imagen local llaman a hrefDeDestino para resolver su src > "PaginaBlog.tsx" llama a "hrefDeDestino" en sus dos puntos de renderizado de imagen: "Sigue leyendo" y la cabecera del artículo
AssertionError: expected 3 to be 2 // Object.is equality
 ❯ src/imagenes-hrefDeDestino.test.ts:70:29
    const llamadas = paginaBlogTexto.match(/src=\{hrefDeDestino\(/g) ?? []
    expect(llamadas.length).toBe(2)
```

**Qué es y por qué pasa.** Este test pertenece a OTRA feature
(`features/despliegue_github_pages.feature` @s19/@s20, enmienda
26/08/2026, Decisiones 53-54) y lee el TEXTO REAL de `PaginaBlog.tsx` con
`?raw` para contar cuántas veces aparece literalmente `src={hrefDeDestino(`
en el fichero, con la expectativa fija de que sean exactamente 2 (la
miniatura de "Sigue leyendo" y la imagen grande del artículo). Mi cambio,
en `src/pages/PaginaBlog.tsx` (autorizado), añade una TERCERA llamada
legítima — `<img src={hrefDeDestino(articulo.imagen)} .../>` en
`TarjetaArticulo` — que es exactamente el patrón que esa misma feature
exige ("el `.tsx` que pinta el `<img>` resuelve `src` con
`hrefDeDestino`, nunca `src/data/*.ts`"): la nueva llamada es CORRECTA
según la regla que este test protege, simplemente el recuento
`toBe(2)` quedó desactualizado por un caso que no existía cuando se
escribió.

**Por qué no lo he tocado.** El encargo fija un alcance estricto y
explícito — "SOLO `src/pages/PaginaBlog.tsx`, `src/pages/PaginaBlog.module.scss`,
`src/pages/PaginaBlog.test.tsx`... Si concluyes que hace falta tocar...
cualquier otro fichero, PARA y explica el motivo en tu informe en vez de
editarlo." `src/imagenes-hrefDeDestino.test.ts` es "cualquier otro
fichero": no está en la lista autorizada, así que me he detenido sin
editarlo, tal como exige la regla.

**Arreglo que haría falta (para quien lo autorice), documentado para no
repetir la investigación:**
- `src/imagenes-hrefDeDestino.test.ts:68-71`: cambiar la expectativa
  `expect(llamadas.length).toBe(2)` por `toBe(3)`, y actualizar la
  descripción del `it` ("...sus dos puntos de renderizado de imagen:
  'Sigue leyendo' y la cabecera del artículo") para nombrar los tres
  puntos reales (añadiendo "y la tarjeta del listado").
- Ningún otro cambio de producción hace falta: el comportamiento de
  `PaginaBlog.tsx` ya es correcto según la propia regla que ese test
  protege; es solo el recuento literal el que quedó desfasado.

Por esto la verificación de "suite completa sin regresión nueva" que pedía
el encargo **no puede darse por cumplida sin tocar un fichero fuera de mi
alcance autorizado**. Marco este informe como `blocked` para que el
`craftsman_lead` decida: ampliar mi alcance en una nueva invocación con ese
único fichero añadido, o despachar la corrección de una línea a otro
agente. El trabajo en los tres ficheros autorizados (`PaginaBlog.tsx`,
`.module.scss`, `.test.tsx`) está completo, verificado y en verde por sí
mismo.

## 6. Evidencia e2e (completada)

`pnpm exec playwright test --workers=1 --reporter=list`, contra el
`pnpm run build` fresco de este mismo cambio: **110/110 verdes**, código de
salida 0, 1.6 min. Sin ningún fallo. Se prestó atención particular a:

- `tests/e2e/imagenes.spec.ts` — `@s27` (las 6 rutas, `naturalWidth > 0`,
  ningún origen remoto, incluida la ruta "Blog"), `@s30` (`width`/`height`/
  `loading="lazy"`/`decoding="async"` en todas las imágenes de las 6 rutas,
  CLS <= 0.1) y `@s31` (con `/img/` bloqueado, el hueco de cada imagen —
  incluidas las nuevas de las tarjetas del blog — respeta su relación de
  aspecto declarada y se pinta con `--color-fondo-alterno`): todas verdes,
  confirmando que las 6 imágenes nuevas de las tarjetas del listado no
  rompen ninguna de estas puertas.
- `tests/e2e/layout.spec.ts` (`@s44`/`@s45`/`@s47`, sin desborde horizontal
  en ninguna de las 6 rutas a 320px, ancho de contenedor único, pies de
  tarjeta alineados) y `tests/e2e/red-limpia.spec.ts` (`@s32`/`@s33`/`@s34`,
  sin peticiones a terceros, sin respuestas de error, sin errores/avisos de
  consola en las 6 rutas): todas verdes.
- `tests/e2e/despliegue-subpath.spec.ts` `@s23` ("las imágenes de las 6
  features... resuelven con 200 bajo el subpath real", recuento exacto de
  25 rutas de imagen): verde sin cambios, confirma que las imágenes de
  `public/img/blog/` ya estaban en su inventario.

Con esto, la única puerta que no cierra en este informe es la de la
sección 5 (fuera de mi alcance autorizado).
