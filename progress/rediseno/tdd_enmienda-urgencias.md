# TDD — lote `enmienda-urgencias` (@s13, @s14, @s15, @s16 de `rediseno_visual`)

> Artesano: `tdd_craftsman`. Fecha: 26/08/2026.
> Contrato: `features/rediseno_visual.feature`. Matriz de partida:
> `progress/rediseno/matriz_trazabilidad.md` (@s13 PARCIAL, @s14 PARCIAL,
> @s15 AUSENTE, @s16 PARCIAL).
> Ámbito de ficheros CERRADO (había otros artesanos trabajando en paralelo en
> el mismo árbol). Ficheros tocados, y ninguno más:
>
> - `src/lib/diseno/rolesDescartados.ts` (reescrito)
> - `src/lib/diseno/rolesDescartados.test.ts` (reescrito)
> - `src/lib/diseno/usoDelAcento.ts` (NUEVO)
> - `src/lib/diseno/usoDelAcento.test.ts` (NUEVO)
> - `tests/e2e/urgencias.spec.ts` (NUEVO)

## Veredicto en una línea

@s13 y @s16 quedan **cerrados y verdes**. @s15 queda **cerrado como puerta y
ROJO como producto**: la puerta que exigía el escenario destapa dos usos
ilegales de `--color-acento` en ficheros **fuera de mi ámbito**, y por
instrucción expresa NO los he corregido. @s14 queda **escrito y verificado
estáticamente** (typecheck + lint), pendiente de que el orquestador ejecute
Playwright.

---

## 1. Los ciclos Rojo-Verde-Refactor

Cada ciclo lleva el mensaje de fallo **literal** que se vio antes de escribir
la implementación.

### Ciclo 1 — @s13: el literal escrito a mano de afirmaciones prohibidas

- **ROJO** — `rolesDescartados.test.ts`, «declara exactamente las cinco
  afirmaciones que el contrato escribe a mano». Literal a mano en el test
  (patrón `doble-de-test-anclado-al-literal`), tomado de
  `features/rediseno_visual.feature:262-263`.

  ```
  AssertionError: expected undefined to deeply equal [ '24 h', '24h', '365', …(2) ]
  - Expected: [ "24 h", "24h", "365", "todos los días del año", "siempre hay alguien de guardia" ]
  + Received: undefined
  ```

- **VERDE** — `AFIRMACIONES_CLINICAS_PROHIBIDAS` en `rolesDescartados.ts`.

### Ciclo 2 — @s13: la puerta señala cada afirmación nombrando el fichero

- **ROJO** — `TypeError: ejecutarPuertaDeAfirmacionesFalsas is not a function`
- **VERDE** — `ejecutarPuertaDeAfirmacionesFalsas(ficheros, afirmaciones)`,
  devolviendo `{ pasa, ficherosInspeccionados, hallazgos }` con `ruta` +
  `afirmacion` por hallazgo. El caso incluye un fichero de tokens con
  `--color-urgencia` y `--color-acento`: la puerta **ya no los prohíbe**, que
  es el corazón de la enmienda.

### Ciclo 3 — @s13: fallo cerrado (la última cláusula del escenario)

- **ROJO** (dos tests a la vez):

  ```
  AssertionError: expected true to be false // Object.is equality
  - Expected: false
  + Received: true
  ```

- **VERDE** — `vacuidadDe()`: lista de afirmaciones vacía → `pasa:false` +
  `motivo`; corpus vacío → `pasa:false`, `ficherosInspeccionados:0` + `motivo`.

### Ciclo 4 — @s13: «texto visible» ≠ texto del fichero

- **ROJO** — `TypeError: textoVisibleDe is not a function`
- **VERDE** — `textoVisibleDe()` descarta el comentario de bloque y el de
  línea COMPLETA. **Por qué**: el Then dice literalmente «en ningún **texto
  visible**» (`features/rediseno_visual.feature:262`); un comentario no llega
  jamás al usuario (medido: `dist/` no contiene ninguna de las cinco cadenas)
  y varios comentarios legítimos del repositorio **citan** la afirmación justo
  para explicar que está prohibida (`src/pages/PaginaBlog-logica.ts:62`).
  Recorta de MENOS a propósito: una `//` en mitad de una línea puede ser una
  URL (`https://wa.me/`, `src/lib/telefono.ts:44`) y recortar ahí podría
  ESCONDER una afirmación escrita detrás. Recortar de menos solo produce
  falsos positivos, nunca falsos permisos.

### Ciclo 5 — @s13: el corpus REAL (`src/` + artefacto de producción)

- **ROJO** — la puerta, alimentada por primera vez con los 99 ficheros reales
  de `src/` y los 4 de `dist/`, encontró el comentario:

  ```
  AssertionError: expected [ { …(2) } ] to deeply equal []
  + [ { "afirmacion": "24 h", "ruta": "src/pages/PaginaBlog-logica.ts" } ]
  ```

- **VERDE** — se cablea `textoVisibleDe` dentro de la puerta.
- Corpus: `import.meta.glob(['../../**/*.{ts,tsx,scss,css}', …], {query:'?raw'})`
  + `import.meta.glob('../../../dist/**/*.{html,css,js}', {query:'?raw'})`.
  Exclusiones **declaradas**: `*.test.*`, `*.spec.*`, `src/test/**` (no se
  sirven, y varios citan la afirmación para comprobar que NO aparece) y
  `rolesDescartados.ts` (es el fichero que DECLARA la prohibición: incluirlo
  haría que la puerta no pudiera pasar jamás; además no llega a `dist/`).

### Ciclo 6 — @s13: mayúsculas

- **ROJO** — `AssertionError: expected [] to deeply equal [ { …(2) }, { …(2) } ]`
- **VERDE** — comparación en minúsculas por los dos lados. «Atención 24 H»
  miente igual que «atención 24 h».

### Ciclo 7 — @s16: declarado en las CINCO variantes + usado de verdad

- **ROJO** — `TypeError: ejecutarPuertaDePrimarioFuerte is not a function`
- **VERDE** — `ejecutarPuertaDePrimarioFuerte(tokens, variantes, estilos)`,
  que delega la lectura por variante en `declaraTokenEnVariante`
  (`tokensColor.ts:208`, ya probado): busca el token en el **bloque propio**
  de cada variante, así que un token heredado del `:root` global se marcaría
  como faltante.

### Ciclo 8 — @s16: los tres modos de suspenso

- **ROJO** (tres tests):

  ```
  AssertionError: expected [] to deeply equal [ 'tech' ]
  AssertionError: expected true to be false   (sin variantes)
  AssertionError: expected true to be false   (sin ficheros de estilos)
  ```

- **VERDE** — guardas de vacuidad con `motivo`, y `variantesSinDeclararlo`.
- El doble de la variante `tech` **no escribe ningún hexadecimal a mano**:
  borra quirúrgicamente la única línea `--color-primario-fuerte:` del bloque
  de esa variante sobre el TEXTO REAL de `_tokens.scss`, y **se verifica a sí
  mismo** (`declaracionesDePrimarioFuerte(mutilado) === original - 1`), para
  que un sabotaje que no sabotea nada no dé verde.

### REFACTOR (con la barra verde) — «deja el módulo diciendo la verdad»

Los tres restos que el orquestador señaló, eliminados:

| Resto | Qué era | Qué se ha hecho |
| --- | --- | --- |
| `tokenAcentoASecasEncontrado` | constante muerta cableada a `false`, publicada en la interfaz y sin ninguna aserción | **eliminada** junto con `InformeRolesDescartados` |
| `if (todos.length === CERO_FICHEROS)` | guarda **inalcanzable**: `todos = [tokens, ...estilos]` nunca tiene longitud 0 (mutantes #1198 superviviente y #1200-#1206 sin cobertura, medición del 26/08) | **eliminada**; las guardas nuevas son alcanzables y cada una tiene su test |
| Cabecera del fichero, comentario de `PATRON_AFIRMACION_DE_URGENCIA_FALSA` y campo `tokensDeUrgencia` | describían la regla ANTERIOR (prohibir el token por nombre) | cabecera reescrita contando la enmienda y su porqué; el campo se llama ahora `hallazgos: {ruta, afirmacion}[]`; el patrón viejo, borrado |

Verificado tras el refactor: 16/16 verde y `oxlint --deny-warnings` limpio en
mis ficheros.

### Ciclo 9 — @s15: nace `usoDelAcento.ts`

- **ROJO** — `Failed to resolve import "./usoDelAcento" … Does the file exist?`
- **VERDE** — módulo PURO que clasifica **cada** uso de `var(--color-acento)`
  por la propiedad CSS que lo pinta, con `ruta`, `linea` y `declaracion`.

### Ciclo 10 — @s15: los bordes del clasificador

Seis casos más (tinta/suave, regla anidada en una línea, sin clasificar,
aprobado, suspenso por falta de relleno, fallo cerrado). **Pasaron a la
primera**: en el ciclo 9 escribí más implementación de la mínima. Como
`docs/tdd.md` manda sospechar de un test que nace verde, cada uno se ha
verificado con **sabotaje** (§3, sabotajes C1-C4): todos se ponen rojos.

### Ciclo 11 — @s15: el corpus REAL de ficheros de estilos

- **ROJO — y sigue rojo, porque el defecto es del producto**:

  ```
  AssertionError: expected [ { …(3) }, { …(3) } ] to deeply equal []
  + [ { "declaracion": "color: var(--color-acento);", "linea": 19,
  +     "ruta": "src/components/BarraUrgencias.module.scss" },
  +   { "declaracion": "color: var(--color-acento);", "linea": 46,
  +     "ruta": "src/components/Hero.module.scss" } ]
  ```

  Los dos ficheros están **fuera de mi ámbito**. Ver §4 (bloqueantes).

### Ciclo 12 — @s14: el spec de navegador real

`tests/e2e/urgencias.spec.ts`. **No ejecutado** (prohibido: `playwright test`
y `vite preview` comparten el puerto 4173 y reconstruyen `dist/`). Verificado
con `pnpm run typecheck` (0) y `oxlint --deny-warnings` (0).

---

## 2. Mapa cláusula → aserción

### @s13 (`features/rediseno_visual.feature:257-265`)

| Cláusula | Aserción (fichero:línea) |
| --- | --- |
| Given el texto real de todos los ficheros de `src` y el contenido del artefacto de producción | `rolesDescartados.test.ts:115-136` (los dos `import.meta.glob` con `?raw`) y `:171-192` (anclas concretas: `src/App.tsx`, `src/lib/site.ts`, `src/pages/Landing.tsx`, `src/styles/_tokens.scss`, `src/components/BarraUrgencias.module.scss`, `dist/index.html`, `dist/assets/*.css`, `dist/assets/*.js`; además `:183-184` comprueba que ni los tests ni el propio módulo de la puerta entran en el corpus) |
| And un literal escrito a mano con las afirmaciones prohibidas | `rolesDescartados.test.ts:15-17` (literal a mano ↔ `AFIRMACIONES_CLINICAS_PROHIBIDAS`) |
| When se busca cualquiera de esas afirmaciones | `rolesDescartados.test.ts:195` (puerta ejecutada sobre `corpusReal`) |
| Then no aparece «24 h» ni «24h» en ningún texto visible | `rolesDescartados.test.ts:197` (`hallazgos` = `[]`, con las 5 cadenas buscadas) + `:77-99` (qué es «texto visible») |
| And no aparece «365» ni «todos los días del año» ni «siempre hay alguien de guardia» | misma `:197`; que las cinco se buscan de verdad, `:17`; que cada una delata, `:203-212` |
| And el recuento de ficheros efectivamente inspeccionados es mayor que 0 | `rolesDescartados.test.ts:198-199` |
| And con la lista de afirmaciones vacía la puerta falla cerrada | `rolesDescartados.test.ts:52-58` (y corpus vacío, `:60-67`) |

### @s14 (`features/rediseno_visual.feature:267-273`)

| Cláusula | Aserción (fichero:línea) |
| --- | --- |
| Given el sitio construido y servido | `tests/e2e/urgencias.spec.ts` entero (Playwright sobre `vite preview` de `dist/`) |
| When se recorre el texto de las seis rutas buscando «urgencias» | `urgencias.spec.ts:103-111` (bucle sobre `RUTAS_DEL_INVENTARIO`) + `:56-85` (`TreeWalker` sobre nodos de TEXTO, no un selector de componente) + `:138-139` (`rutasRecorridas === RECUENTO_DE_RUTAS` y `=== 6`) |
| Then el rótulo que aparece es exactamente el que declara la fuente única | `urgencias.spec.ts:118` (`toContain(ROTULO_DE_URGENCIAS)` en TODO texto que diga «urgencias») y `:125` (`toBe(ROTULO_DE_URGENCIAS)`, igualdad EXACTA, en todo rótulo accesible) |
| And el teléfono que lo acompaña es el de urgencias, no el de la clínica ni el móvil | `urgencias.spec.ts:120-121` (el texto no contiene los otros dos números) y `:132-133` (el `href` no es el de la clínica ni el del móvil) + `:92-93` (los tres son distintos entre sí: sin esto la comprobación sería vacía) |
| And el enlace de llamada se deriva de ese mismo número, sin retipearlo | `urgencias.spec.ts:131` contra `ENLACE_ESPERADO` = `enlaceLlamada(telefonoUrgencias.textoVisible)` (`:40`), recalculado con la función real del repo |
| (recuentos, regla del repo) | `urgencias.spec.ts:113` (menciones > 0 por ruta), `:128` (enlaces > 0 por ruta), `:140-141` (totales > 0) |

### @s15 (`features/rediseno_visual.feature:275-282`)

| Cláusula | Aserción (fichero:línea) |
| --- | --- |
| Given el texto real de los ficheros de estilos del inventario de módulos | `usoDelAcento.test.ts:152-156` (glob `?raw`) y `:180-191` (anclas + `toHaveLength(20)`) |
| When se busca cada uso de `--color-acento` | `usoDelAcento.ts:29` (patrón que exige `)` o `,`) + `usoDelAcento.test.ts:40-66` (no confunde con `-tinta`/`-suave`) |
| Then no aparece como valor de `color` | `usoDelAcento.test.ts:196` — **ROJO HOY**, ver §4; el clasificador, `usoDelAcento.ts:78-89` |
| And no aparece como `border-color` ni en una declaración abreviada de borde | `usoDelAcento.test.ts:197` + el caso `:29-32` que distingue `border-color` (línea 30) de la abreviada `border: 1px solid …` (línea 31) |
| And aparece al menos una vez como relleno | `usoDelAcento.test.ts:199` (`comoRelleno.length > 0`) y `:113-125` (sin relleno, suspende) |
| And el recuento de ficheros inspeccionados es mayor que 0 | `usoDelAcento.test.ts:200-201` (`=== 20` y `> 0`); fallo cerrado con corpus vacío, `:127-132` |

### @s16 (`features/rediseno_visual.feature:284-290`)

| Cláusula | Aserción (fichero:línea) |
| --- | --- |
| Given el texto real de `_tokens.scss` y el de los ficheros de estilos del inventario | `rolesDescartados.test.ts:226-241` (corpus de estilos) y `:232-237` (texto real de `_tokens.scss`), montados en `:269-271` |
| Then está declarado en las cinco variantes | `rolesDescartados.test.ts:276-278` (`variantesSinDeclararlo === []`, `variantesComprobadas === 5`, `> 0`), leído del bloque PROPIO de cada variante |
| And se usa al menos una vez en algún fichero de estilos del inventario | `rolesDescartados.test.ts:284-287` (`ficherosQueLoUsan` contiene `src/styles/_api.scss`; 20 ficheros inspeccionados, `> 0`) |
| And no basta con que esté declarado: si no se usara, la puerta fallaría | `rolesDescartados.test.ts:290-298` (corpus sin ningún uso → `pasa:false`) y `:301-315` (una variante que no lo declara → `['tech']`, con el doble autoverificado) + sabotaje B1 (§3) |
| (anti-vacuidad, regla del repo) | `rolesDescartados.test.ts:317-323` (sin variantes) y `:325-331` (sin ficheros de estilos) |

---

## 3. Sabotajes (una puerta que no se ha visto fallar no está verificada)

Todos ejecutados y **restaurados**; los dos ficheros de producción se
verificaron por `sha256sum` idéntico tras restaurar, y `dist/404.html`
byte a byte.

| # | Qué se rompió | Test que se puso ROJO | Mensaje literal |
| --- | --- | --- | --- |
| A1 | Se añadió `const RECLAMO_FALSO = 'Atención 24 h todos los días del año'` a un fichero real de `src/` | @s13 corpus real | `expected [ { …(2) }, { …(2) } ] to deeply equal []` → `{afirmacion:"24 h", ruta:"src/lib/diseno/usoDelAcento.ts"}` y `{afirmacion:"todos los días del año", …}` |
| A2 | Se añadió `<p>Siempre hay alguien de guardia</p>` a `dist/404.html` (artefacto real) | @s13 corpus real | `expected [ { ruta: 'dist/404.html', …(1) } ] to deeply equal []` → `{afirmacion:"siempre hay alguien de guardia", ruta:"dist/404.html"}` (prueba además que la búsqueda ignora mayúsculas) |
| B1 | `pasa` de @s16 deja de exigir que el token se USE | «no basta con declararlo…» | `expected true to be false // Object.is equality` |
| C1 | El patrón del acento pasa a casar por PREFIJO | «no confunde el acento a secas con `-tinta`/`-suave`» | `expected 3 to be +0` |
| C2 | El borde solo se vigila en `border-color` | «separa el uso como texto, como borde y como relleno» | faltó `{declaracion:"border: 1px solid var(--color-acento);", linea:3}` |
| C3 | `propiedadDe` deja de cortar por la llave | «lee la propiedad de una regla anidada…» (+3 más) | `expected [] to deeply equal [ { …(3) } ]` |
| C4 | `pasa` de @s15 deja de exigir al menos un relleno | «suspende si nadie usa el acento como relleno…» | `expected true to be false` |
| D1 | `textoVisibleDe` deja de descartar el comentario de línea | «descarta el comentario de bloque y el de línea completa» | `expected '\n  // Nota: nunca 365 días.\nconst r…' not to contain '365'` |
| D2 | `textoVisibleDe` deja de descartar el comentario de bloque | el mismo, y @s13 corpus real | `expected '/** Prohibido prometer 24 h en el sit…' not to contain '24 h'` |

Los **datos** de @s16 también se sabotearon, pero en memoria y sobre el texto
real de `_tokens.scss` (`sinLaDeclaracionDePrimarioFuerteDe`), porque
`_tokens.scss` y `_api.scss` son de otros artesanos y el ámbito me prohíbe
editarlos ni siquiera de forma temporal.

---

## 4. BLOQUEANTE: dos usos ilegales de `--color-acento` (fuera de mi ámbito)

La puerta de @s15, alimentada con el texto real, destapa **dos usos del acento
saturado como color de texto**. NO los he corregido, por instrucción expresa.

| Fichero | Línea | Declaración |
| --- | --- | --- |
| `src/components/BarraUrgencias.module.scss` | 19 | `color: var(--color-acento);` (el `<span>` pulsante, dentro de `.barra span`) |
| `src/components/Hero.module.scss` | 46 | `color: var(--color-acento);` (el cintillo, `> p:first-child`) |

**Por qué es un defecto real y no un falso positivo:** el motivo original
—citado en la cabecera del contrato, `features/rediseno_visual.feature:58-60`—
sigue vigente: el lima da **1,89 de ratio sobre blanco** y no puede llevar
texto. La enmienda devuelve el token **y vigila su uso**: «solo relleno, nunca
`color:` ni `border-color:`».

**Qué haría falta** (una de las dos, a decidir por quien posea esos módulos):

1. Cambiar las dos declaraciones a un rol que sí pueda llevar texto
   —`--color-acento-tinta` es el rol previsto para eso y ya se usa como texto
   en nueve sitios del repositorio—; en `BarraUrgencias.module.scss:19`, sobre
   el fondo `--color-urgencia` (línea 12) lo coherente con @s7 sería
   `--color-sobre-primario`, que es además lo que ya usa la línea 13. Nota
   cruzada: la matriz (@s7) señala esa misma línea 19 como incumplimiento del
   escenario @s7 («el color de encima es siempre `--color-sobre-primario`»), o
   sea que las dos puertas piden lo mismo.
2. O, si el diseño exige de verdad el lima ahí, pedir cambio al contrato: hoy
   @s15 lo prohíbe sin matices.

Mientras tanto, `src/lib/diseno/usoDelAcento.test.ts` queda **rojo a
propósito**. Es la barra roja que el contrato pedía y que hasta hoy no
existía: `progress/rediseno/matriz_trazabilidad.md` (@s15) ya avisaba de que
«un test honesto de este escenario fallaría en rojo hoy».

### Observación NO bloqueante

`src/pages/PaginaBlog-logica.ts:62` contiene, en un comentario JSDoc, la
cadena «urgencias 24 h». No es un incumplimiento —el Then habla de «texto
visible» y `dist/` está limpio, medido— y la puerta no lo señala. Se anota
por si alguien prefiere reformularlo.

---

## 5. Decisiones de interpretación que conviene revisar

1. **«Texto visible» (@s13)** — la puerta ignora comentarios. Justificación en
   el ciclo 4. Si el `judge` prefiere la lectura literal «ninguna cadena de
   `src/`», basta con quitar `textoVisibleDe` de la puerta, y entonces
   `src/pages/PaginaBlog-logica.ts:62` pasa a ser un segundo bloqueante.
2. **«Los ficheros de estilos del inventario» (@s15 y @s16)** — el corpus son
   los 18 `*.module.scss` **más** `src/styles/_api.scss` y
   `src/styles/global.scss`. No es una comodidad: `vite.config.ts` →
   `css.preprocessorOptions.scss.additionalData` inyecta literalmente
   `@use "api" as *;` en CADA `.module.scss`, así que `_api.scss` es parte del
   texto con el que los 18 se compilan. Leer solo los 18 daría un **falso
   negativo** en @s16, porque el único uso de `var(--color-primario-fuerte)`
   vive en el `@mixin boton-primario` (`_api.scss:239`) que 8 de los 18
   incluyen; forzar a cada módulo a retipear el token sería duplicar la regla
   sistémica. Para @s15 ampliar el corpus solo puede AÑADIR hallazgos, nunca
   ocultarlos.
3. **El spec de @s14 importa de `src/`**, al revés que el resto de
   `tests/e2e/`. Motivo en la cabecera del propio fichero: las cláusulas dicen
   «el que declara la fuente única» y «sin retipearlo», así que un literal a
   mano probaría lo contrario de lo que se pide. El inventario de RUTAS sí
   sigue siendo el literal a mano de `rutas.ts`. `tsc -b` con los tres
   proyectos da 0 errores.
4. **`src/lib/diseno/rolesDescartados.ts` se excluye del corpus de @s13**
   porque es el fichero que declara la prohibición. Sus literales son la lista
   de lo prohibido, no una afirmación.
5. **@s13 depende de que exista `dist/`.** Es lo que pide el Given. Si no
   existe, la puerta **falla cerrada** (no da verde por no haber mirado).
   `bin/harness init` no construye, así que en un árbol recién clonado hay que
   pasar antes por `pnpm run build`.

---

## 6. Salida literal de los comandos de verificación

### `pnpm exec vitest run src/lib/diseno/rolesDescartados.test.ts src/lib/diseno/usoDelAcento.test.ts`

```
 FAIL  src/lib/diseno/usoDelAcento.test.ts > @s15 la puerta corre sobre el texto real de los ficheros de estilos > el acento no se pinta como texto ni como borde, y sí se pinta al menos una vez como relleno
AssertionError: expected [ { …(3) }, { …(3) } ] to deeply equal []

- Expected
+ Received

- []
+ [
+   {
+     "declaracion": "color: var(--color-acento);",
+     "linea": 19,
+     "ruta": "src/components/BarraUrgencias.module.scss",
+   },
+   {
+     "declaracion": "color: var(--color-acento);",
+     "linea": 46,
+     "ruta": "src/components/Hero.module.scss",
+   },
+ ]

 ❯ src/lib/diseno/usoDelAcento.test.ts:196:31

 Test Files  1 failed | 1 passed (2)
      Tests  1 failed | 24 passed (25)
```

El único fallo es el bloqueante de §4. `rolesDescartados.test.ts` va 16/16.

### `pnpm run lint`

```
> galapavet-web@0.0.0 lint
> oxlint --deny-warnings

(sin hallazgos)
```

Y acotado a mis cinco ficheros, `oxlint --deny-warnings` sale con **código 0**.

### `pnpm run typecheck`

```
> galapavet-web@0.0.0 typecheck
> tsc -b

(sin errores; código de salida 0)
```

### Nota sobre el árbol compartido

`pnpm run lint` y `pnpm run typecheck` se ejecutaron varias veces durante el
lote. En dos momentos dieron errores **de otros artesanos** trabajando en
paralelo (`src/lib/diseno/matrizDeContraste.ts`, `src/components/Hero-logica.test.ts`,
`src/lib/diseno/datosDelSitio.ts`), que ellos mismos corrigieron. Acotados a
mis cinco ficheros, `oxlint --deny-warnings` y `tsc -b` han dado **siempre 0**.
La medición final de arriba es con el árbol ya estabilizado.

### No ejecutados (prohibidos en esta oleada)

`pnpm run build`, `pnpm exec playwright test`, `vite preview` y
`pnpm exec stryker run`. Los ejecuta el orquestador en serie al cerrar la
oleada. `tests/e2e/urgencias.spec.ts` queda escrito, typecheckeado y linteado.

---

## 7. Qué espera medir cada aserción del spec de Playwright (no ejecutado)

| Aserción | Qué mide en el navegador | Contra qué dato lo compara |
| --- | --- | --- |
| `menciones.textos.length > 0` por ruta | nodos de TEXTO del DOM real que casan `/urgencias/i`, recorridos con `TreeWalker` y descartando `SCRIPT`/`STYLE`/`NOSCRIPT`/`TEMPLATE` | contra 0: si una ruta no dijera nada de urgencias, el barrido estaría mirando al vacío. Las seis la tienen porque `BarraUrgencias` y `PieDePagina` viven en el shell (`src/App.tsx:56` y `:69`) |
| `toContain(ROTULO_DE_URGENCIAS)` | cada uno de esos textos | `datosNegocio.telefonoUrgencias.rotulo` (`src/lib/site.ts:13`). Un «Urgencias 24 h» no contendría el rótulo real → rojo |
| `not.toContain(telefonoClinica.textoVisible)` / `telefonoMovil` | el mismo texto | `src/lib/site.ts:10` y `:11`. Detecta el número equivocado junto al rótulo |
| `toBe(ROTULO_DE_URGENCIAS)` sobre `aria-label` | todo `[aria-label]` que diga «urgencias» | igualdad EXACTA con la fuente única (el «exactamente» de la cláusula) |
| `toBe(ENLACE_ESPERADO)` | el `href` de cada `a[href^="tel:"]` cuyo nombre accesible propio o el de su contenedor (`closest('[aria-label]')`) diga «urgencias» | `enlaceLlamada(datosNegocio.telefonoUrgencias.textoVisible)`, RECALCULADO con `src/lib/telefono.ts:40`. Cierra el «sin retipearlo»: si un componente escribe `tel:+34918511393` a mano y el número cambia en la fuente única, esto se pone rojo |
| `not.toBe(enlaceLlamada(clinica))` / `(movil)` | el mismo `href` | los otros dos teléfonos derivados igual. Cierra el «no el de la clínica ni el móvil», que hoy `tests/e2e/rediseno-visual.spec.ts:46` deja pasar con solo `/^tel:/` |
| `new Set([...3 enlaces]).size === 3` | nada del navegador | la propia fuente única: sin esto, las dos aserciones anteriores serían vacías si los tres números coincidieran |
| `rutasRecorridas === RECUENTO_DE_RUTAS` y `=== 6` | el contador del bucle | `tests/e2e/rutas.ts:35` **y** el literal 6. Doble ancla: si alguien borrara una ruta del inventario, el primero seguiría cuadrando y el segundo no |

Riesgo conocido a vigilar cuando se ejecute: si otro artesano añade en la
cabecera un control rotulado solo «Urgencias» (@s28 pide «un control de
urgencias»), la aserción de igualdad exacta del `aria-label` se pondrá roja.
Sería un rojo **correcto** según @s14 —el rótulo tiene que ser el de la fuente
única—, pero conviene saberlo de antemano.

---

## 8. Fix posterior (28/08/2026) — falso positivo de "365" contra un hexadecimal de color

**Ámbito CERRADO de este ciclo**: solo `src/lib/diseno/rolesDescartados.ts` y
`src/lib/diseno/rolesDescartados.test.ts`.

### 8.1 El defecto

La Enmienda 1 (@s3, aprobada e implementada tras el cierre de este lote) hizo
que `--color-borde` de la variante `tech` se derivara a `#273650`
(`src/styles/_tokens.scss:126`, `mezclar('#0F172A', '#94C5FF', 0.18)`). La
puerta de @s13 buscaba cada afirmación prohibida con `String.includes` —una
subcadena cruda, sin límite de palabra— y `"273650".includes("365")` es
`true`: la puerta señalaba el color como si afirmara «los 365 días», un falso
positivo real que rompía dos tests del corpus real:

```
FAIL  … > ninguna de las cinco afirmaciones falsas aparece en el texto visible de "src" ni en "dist"
AssertionError: expected [ { …(2) } ] to deeply equal []
+ [ { "afirmacion": "365", "ruta": "src/styles/_tokens.scss" } ]

FAIL  … > una sola afirmación colada en el corpus real la delata: la puerta no está inerte
AssertionError: expected [ { …(2) }, { …(2) } ] to deeply equal [ { …(2) } ]
+ [ { "afirmacion": "365", "ruta": "src/styles/_tokens.scss" }, { "afirmacion": "24 h", "ruta": "src/components/Inventado.tsx" } ]
```

Confirmado ejecutando `pnpm exec vitest run src/lib/diseno/rolesDescartados.test.ts` antes de tocar nada: 2 failed | 14 passed (16).

### 8.2 Ciclo ROJO-VERDE-REFACTOR

- **ROJO** — nuevo test `no confunde un hexadecimal de color con la
  afirmación "365": "#273650" no es "los 365 días"`
  (`rolesDescartados.test.ts`, en `describe('@s13 el literal de afirmaciones
  prohibidas', …)`), con el texto REAL de `src/styles/_tokens.scss:126`
  copiado tal cual (`"  --color-borde: #273650;"`), no un literal inventado.
  Falló con el mismo mensaje real que arriba:
  `expected [ { "afirmacion": "365", "ruta": "src/styles/_tokens.scss" } ] to deeply equal []`.
- **VERDE** — en `rolesDescartados.ts`: `comoAfirmacionDePalabraSuelta()`,
  que construye una `RegExp` con límite de palabra Unicode
  (`(?<![\p{L}\p{N}])afirmación(?![\p{L}\p{N}])`, flag `u`) y sustituye el
  `visible.includes(afirmacion)` crudo en `ejecutarPuertaDeAfirmacionesFalsas`.
  `\p{L}`/`\p{N}` (no `\w`, que es solo ASCII) para que una tilde («días»,
  «año») no rompa el límite de ninguna de las cinco afirmaciones. Se añadió
  `escapadaParaRegex()` para no romper si una futura afirmación llevara un
  carácter especial de regex.
- **REFACTOR** — ninguno adicional: la barra quedó verde a la primera
  implementación (18/18) y no había duplicación que limpiar.

### 8.3 Prueba de que NO es un falso negativo (sabotaje real)

Se añadió el test `SIGUE detectando "365" como palabra suelta en prosa real,
con o sin puntuación, en mayúsculas y a final de fichero` (seguida de espacio,
con punto, en mayúsculas, y sin ningún carácter detrás — fin del propio
contenido del fichero, el caso límite del lookahead), que ya pasaba en verde
con la implementación vieja (confirma que la prosa real nunca dependió del
bug) y sigue en verde con la nueva.

Sabotaje ejecutado y restaurado sobre `rolesDescartados.ts`: se quitó
temporalmente el límite de palabra de `comoAfirmacionDePalabraSuelta`
(`return new RegExp(afirmacionEscapada, 'u')`, sin los lookaround) y se
corrió `vitest -t "no confunde un hexadecimal|SIGUE detectando"`:

```
× no confunde un hexadecimal de color con la afirmación "365"…   (ROJO, correcto: reaparece el falso positivo)
✓ SIGUE detectando "365" como palabra suelta en prosa real…       (sigue VERDE: la prosa no depende del límite)
Tests  1 failed | 1 passed | 16 skipped (18)
```

Restaurado el fichero y verificado `diff` idéntico contra la copia previa al
sabotaje antes de continuar. Con el límite restaurado, la suite completa del
fichero vuelve a 18/18.

### 8.4 Trazabilidad @s13 → test (ampliada)

| Cláusula | Test |
| --- | --- |
| Then no aparece «365» — pero no como subcadena de un token más largo (hexadecimal) | `rolesDescartados.test.ts` → `no confunde un hexadecimal de color con la afirmación "365"...` |
| Then no aparece «365» — sigue detectándose como palabra suelta en prosa real | `rolesDescartados.test.ts` → `SIGUE detectando "365" como palabra suelta en prosa real...` |

### 8.5 Verificación final

- `pnpm exec vitest run src/lib/diseno/rolesDescartados.test.ts` → 18/18 verde.
- `pnpm exec oxlint --deny-warnings src/lib/diseno/rolesDescartados.ts src/lib/diseno/rolesDescartados.test.ts` → sin hallazgos.
- `pnpm run typecheck` (`tsc -b`, no acotable por fichero) → 0 errores.
- `pnpm exec vitest run` (suite completa del repo) → 88 ficheros, 1145 tests, todos verdes: sin regresión colateral.

### 8.6 Aviso NO bloqueante — mismo patrón fuera de ámbito

`src/lib/diseno/contratoRedisenho.ts:110`
(`buscarAfirmacionesClinicasProhibidas`) usa el mismo
`textoCompleto.includes(afirmacion.toLocaleLowerCase())` crudo, sin límite de
palabra, sobre la misma lista de afirmaciones. Es susceptible EN TEORÍA al
mismo falso positivo (p. ej. si algún texto que ese módulo inspecciona
contuviera un hexadecimal u otro token alfanumérico con "365" dentro), pero
hoy no está en rojo — no se ha tocado, por estar fuera del ámbito cerrado de
este ciclo (`src/lib/diseno/rolesDescartados.ts` +
`rolesDescartados.test.ts` únicamente). Se documenta para que quien posea ese
módulo decida si aplica el mismo arreglo.

`src/lib/diseno/usoDelAcento.ts` se revisó también: no comparte el patrón —
usa un patrón regex específico para `var(--color-acento…)`, no una búsqueda
de subcadena cruda sobre `AFIRMACIONES_CLINICAS_PROHIBIDAS` — así que no
aplica el mismo aviso.
