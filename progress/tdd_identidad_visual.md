# TDD — `identidad_visual` (feature 22) · RONDA 1: la capa base

> Bitácora del `tdd_craftsman`. Un ciclo Rojo → Verde → Refactor por línea.
> Contrato: `features/identidad_visual.feature`, aprobado por el humano el
> 23/08/2026 (`project-spec.md`, Decisión 43). Guion: `progress/plan_adaptacion_scss.md`,
> incluida su §9 «Reconciliación con el contrato aprobado».

## 0 · Alcance declarado de esta ronda

> **Actualización — la RONDA se amplió a mitad de sesión.** Lo que sigue en este §0 es el
> alcance ORIGINAL con el que arrancó esta bitácora (solo la capa base: pasos 1 y la
> condición de producción de @s24). El `craftsman_lead` retomó la sesión con instrucción
> explícita de terminar el paso 1 (que había quedado a medio ciclo Rojo→Verde, ver Ciclo 1
> de §2) y **además** ejecutar los pasos **2, 3, 4, 5 y 7** del plan en la MISMA ronda.
> Siguen fuera, sin cambios: paso 6 (fuentes autoalojadas), paso 8 (`public/` e imágenes),
> paso 9 (Playwright/e2e), paso 10 (maquetación fina de los 17 `.module.scss`), 11 y 12.
> El detalle ciclo a ciclo de los pasos 2-7 está en §2, después del Ciclo 1. El resumen de
> alcance final y la trazabilidad completa de esta ronda están en §3, al final del fichero.

**Solo la capa base — alcance con el que arrancó la sesión.** No entraban entonces: los 17
roles de color completos (paso 4 del plan §5), las fuentes autoalojadas (paso 6), `public/`
y las imágenes (paso 8), Playwright (paso 9), ni la maquetación fina de los 17 módulos
(paso 10).

Escenarios de esta ronda: **@s12, @s13, @s14, @s15** (los cuatro de lectura del TEXTO REAL
con `?raw`, herramienta (b) del contrato) y la **condición de producción de @s24**.

### La divergencia de arquitectura, resuelta antes de escribir la primera línea

El encargo de esta ronda nombraba `src/styles/main.scss` + los parciales `_reset.scss`,
`_base.scss` y `_tipografia.scss`. **El contrato aprobado nombra un solo fichero,
`src/styles/global.scss`**, y lee su texto crudo con `?raw` en seis escenarios (@s12, @s13,
@s14, @s15, @s17, @s18). Un `?raw` sobre un barril de `@use` devuelve las líneas de `@use`,
no las reglas: los seis fallarían. El plan ya había registrado esta divergencia como **D-4**
y la resolvió a favor del contrato. **Manda el contrato**: un único `src/styles/global.scss`
con secciones rotuladas. Ninguna regla decidida se pierde; cambia el reparto en ficheros.

El test que el encargo pedía no olvidar (`logo-draw.test.ts:40` de WebEmpresa,
`expect(read('main.scss')).toMatch(/@use ["']logo-draw["']/)`) **no desaparece: cambia de
forma**. Con un solo fichero, la protección anti-CSS-muerto es doble y está en @s12 y @s13:
(a) `src/main.tsx` importa la hoja **exactamente una vez** y ningún otro fichero de `src/`
la importa, y (b) la hoja declara las **nueve familias** del reset, contadas. Un
`global.scss` desenganchado, o al que alguien le vacíe media sección, se pone rojo.

### @s24: qué parte cierra esta ronda y qué parte no

@s24 está clasificado por el propio contrato como **(c) NAVEGADOR REAL** (cabecera del
`.feature`, línea «(c) … @s20-@s34»). Playwright **no está instalado** en este repositorio
(`ls node_modules/@playwright` → vacío) y su instalación es el paso 9 del plan §5, fuera del
alcance de esta ronda. Por tanto:

- **La condición de producción de @s24 SÍ queda cumplida en esta ronda**: `body { margin: 0 }`
  llega de verdad al CSS servido, y se demuestra midiendo el `dist/` (§4).
- **Su automatización en navegador real queda PENDIENTE del paso 9**, con el resto de los 28
  escenarios de nivel (c). No se finge cerrada con una prueba de jsdom: jsdom no aplica la
  hoja del agente de usuario, así que un test suyo sobre el margen del `body` **pasaría en
  verde tanto antes como después** de esta ronda. Sería exactamente el verde-por-vacuidad
  que esta feature existe para destapar.

## 1 · Medición de partida (antes de tocar nada)

`pnpm exec vitest run` → **712 tests, 56 ficheros, verde.**

> Nota honesta: la **primera** ejecución de la suite completa dio 3 fallos en
> `src/accesibilidad-teclado.test.tsx`. En aislamiento ese fichero pasa (5/5), y la
> re-ejecución completa dio 712/712. Es **inestabilidad**, no una regresión: la corrida que
> falló registró `environment 962.92s` (máquina saturada) y los tres fallos eran de
> `userEvent.tab()` no llegando a mover el foco. Queda anotado como observación para el
> `judge`; no se toca ese fichero en esta ronda, que no lo roza.

`pnpm run build` sobre el árbol intacto → `dist/assets/index-CZIteidN.css`:

| medición | ANTES |
| --- | --- |
| apariciones de `font-family` | **0** |
| reglas para `body` | **0** |
| bloques `{` (reglas, cifra de diagnóstico) | 124 |
| bytes del CSS | 11 455 |

Coincide dígito a dígito con el diagnóstico del 23/08/2026 de la cabecera del `.feature`.

## 2 · Los ciclos Rojo → Verde → Refactor

### Ciclo 1 — @s15 · `extraerReglas` no sabía qué bloque contenía a una regla

**Estado al reanudar esta ronda:** `pnpm exec vitest run` → 2 tests rojos en
`src/lib/diseno/hojaGlobal.test.ts`, describe `@s15 cada regla conoce los bloques que la
contienen` (verificado, no supuesto — es el rojo que el encargo de esta sesión describía).

*Rojo (ya existente, verificado de nuevo antes de tocar nada):*

```
FAIL @s15 … > una regla anidada nombra el bloque que la contiene
  expected undefined to deeply equal ['@media (prefers-reduced-motion: no-preference)']
FAIL @s15 … > una regla de primer nivel no tiene ningún ancestro …
  expected undefined to deeply equal []
```

Los dos tests llaman a `extraerReglas(hoja)` sobre un `@media (prefers-reduced-motion:
no-preference) { html { scroll-behavior: smooth; } }` seguido de un `html { color: red; }`
de primer nivel, y leen `.ancestros` de la regla anidada y de la posterior. `ReglaLeida` no
declaraba ese campo: `extraerReglas` devolvía `{selectores, declaraciones}` y nada más.

*Verde (mínimo):* se añade `ancestros: readonly string[]` a `ReglaLeida` y
`ReglaEnConstruccion`, y se calcula en el único punto donde se construye una regla nueva:
`pila.map((ancestro) => ancestro.selectores.join(', '))`, leído **antes** de empujar la
regla nueva a la pila. Como la pila en ese instante contiene exactamente las reglas
todavía abiertas que la envuelven (de fuera hacia dentro), el resultado es exactamente los
"bloques que la contienen": para la regla `html` anidada dentro del `@media`, la pila trae
solo la regla del `@media` (sus `selectores` son `['@media (prefers-reduced-motion:
no-preference)']`, producto de `trocearSelectores` sobre esa misma línea); para la regla
`html` de primer nivel posterior, la pila ya está vacía (los dos `pop()` del cierre del
bloque anterior ya se ejecutaron), así que `ancestros` sale `[]`. No hizo falta tocar la
lógica de apertura/cierre de bloques (`indiceDeApertura`/`pila.pop()`): esa parte ya
funcionaba y es lo que hace que la pila esté correcta en el momento de leer los ancestros.

*Verificado:* `pnpm exec vitest run src/lib/diseno/hojaGlobal.test.ts
src/styles/hoja-global.test.ts` → 37/37 verdes. Suite completa:
`pnpm exec vitest run` → **749/749 verdes, 58 ficheros** (712 de antes de esta sesión + 37
de las dos suites de esta feature, cuadra con lo esperado).

*Refactor:* ninguno necesario — el cambio ya queda en dos líneas mínimas coherentes con el
estilo del fichero (mismo patrón que ya usa `movimientoRespetuoso.ts` para su propia pila).

Con esto se cierra el **paso 1** del plan (`progress/plan_adaptacion_scss.md` §5): el
enganche (`src/main.tsx` → `src/styles/global.scss`, ya en verde desde antes de esta
sesión) y las nueve familias del reset (@s13, ya en verde) tienen ahora también @s12, @s14
y @s15 en verde de punta a punta — `extraerReglas` es la pieza que @s15 exigía y que
faltaba.

### Ciclo 2 — Paso 2 del plan · el `:root` sin atributo, red de seguridad sin JS

*Por qué:* `plan_adaptacion_scss.md` §2.1.A y §5 paso 2. Hoy las 4 únicas apariciones de
`:root` en `_tokens.scss` llevan `[data-variante]`. Si el atributo no llega a aplicarse
(JS deshabilitado, el `<script>` anti-FOUC de `index.html` no se ejecuta), ningún bloque
matchea y todo `var(--color-*)` queda sin valor — y con `global.scss` ya consumiendo esos
tokens en la familia 6 del reset (Ciclo previo a esta ronda), el `body` se quedaría sin
fondo ni color. Sin este paso, el enganche del paso 1 introduce una regresión latente para
el visitante sin JavaScript.

*Rojo:* `src/lib/diseno/tokensColor.test.ts`, nuevo describe `(paso 2 del plan) el ":root"
sin atributo…`, primer `it`, llamando a una función `leerTokenDeRaizSinAtributo` que
todavía no existe:

```
TypeError: leerTokenDeRaizSinAtributo is not a function
```

Verificado fallando antes de tocar producción (`pnpm exec vitest run
src/lib/diseno/tokensColor.test.ts` → 1 fallo, 16 verdes).

*Verde (mínimo):*
- `src/lib/diseno/tokensColor.ts`: se extrae `leerTokenDelBloque` (la lectura de un rol
  dentro de un bloque de texto ya recortado, compartida) de la que `leerTokenDeVariante`
  pasa a ser un caso; se añade `extraerBloqueRaizSinAtributo` (regex `/:root\s*\{([^}]*)\}/`
  — no matchea los bloques `:root[data-variante=…]` porque tras `root` viene `[`, no
  espacio/llave, así que no colisiona con `PATRON_SELECTOR_VARIANTE`) y
  `leerTokenDeRaizSinAtributo`, que lo consume.
- `src/styles/_tokens.scss`: nuevo bloque `:root { --color-fondo: #FFFFFF;
  --color-texto: #77286B; --color-foco: #77286B; }`, con los mismos tres valores que
  `marca`, antes del primer bloque `:root[data-variante='marca']`.

*Verificado:* `pnpm exec vitest run src/lib/diseno/tokensColor.test.ts` → 17/17 verdes,
incluido el segundo `it` del mismo describe (`extraerVariantesDeTokens` sigue devolviendo
exactamente `['marca','lima','verde','noche']`, sin que el `:root` desnudo se cuele como
quinta variante) — ese `it` ya estaba cubierto por el describe `@s1` preexistente, pero se
repite aquí junto al cambio para dejar constancia explícita de que el paso 2 no rompe esa
garantía. Suite completa: `pnpm exec vitest run` → **751/751 verdes, 58 ficheros**.

*Refactor:* la extracción de `leerTokenDelBloque` ya es el refactor — evita que
`leerTokenDeVariante` y `leerTokenDeRaizSinAtributo` dupliquen la misma regex y el mismo
mensaje de error parametrizado. Re-ejecutado tras el cambio: sigue en verde.

### Ciclo 3 — Paso 3 del plan · la escisión `_tokens.scss` / `_api.scss`

*Por qué:* `plan_adaptacion_scss.md` §2.2 y §5 paso 3 (M-2/M-3/M-4 del propio plan, ya
medidas antes de esta sesión). `additionalData` (`vite.config.ts`) inyectaba
`@use "tokens" as *;` en cada una de las 17 compilaciones independientes de los
`.module.scss`. La garantía de Sass de "una sola vez en el CSS compilado" es **por
compilación**, no entre compilaciones: con 17 módulos, cada bloque `:root[data-variante]`
se emitía 17 veces en el CSS intermedio, y hoy solo lo tapaba el minificador (Lightning
CSS) en el artefacto final — una propiedad del minificador, no del diseño. En cuanto el
paso 4 amplíe los tokens de 3 a 17 roles, ese coste intermedio deja de ser anecdótico.

*Rojo:* nuevo fichero `src/styles/tokens-api.test.ts` (herramienta (b) del contrato,
lectura `?raw`), tres describes:
1. `"_tokens.scss" deja de declarar funciones y mixins de Sass` — falla porque hoy declara
   `@function paso-tipografico`, `@function espaciado`, `@mixin foco-visible` y
   `@mixin area-tactil-minima`.
2. `"_api.scss" concentra las funciones y los mixins de Sass` — falla porque el fichero no
   existe.
3. `"vite.config.ts" inyecta el "@use" del API como LITERAL` — falla porque hoy inyecta
   `'@use "tokens" as *;\n'`, no `'@use "api" as *;\n'`.

Verificado: `pnpm exec vitest run src/styles/tokens-api.test.ts` → **7/7 fallos** antes de
tocar producción.

*Verde (mínimo):*
- `src/styles/_tokens.scss`: se retira `@use 'sass:map';` y las cuatro
  funciones/mixins/mapas de Sass (`$escala-tipografica`, `paso-tipografico()`,
  `$escala-espaciado`, `espaciado()`, `$grosor-foco`, `foco-visible`,
  `$area-tactil-minima`, `area-tactil-minima`). Queda **solo** el `:root` sin atributo
  (paso 2) y los cuatro `:root[data-variante=…]`.
- `src/styles/_api.scss` (nuevo): recibe exactamente esas ocho declaraciones, con
  `@use 'sass:map';` propio. Emite CERO CSS por sí mismo.
- `vite.config.ts:37`: `additionalData: '@use "api" as *;\n'` — literal exacto, nunca
  compuesto vía variable (patrón `valor-guardado-por-puerta-que-lee-config-como-texto-debe-ser-literal`,
  el propio test lo lee del texto crudo del fichero de configuración).
- `src/styles/global.scss` no cambió: ya hacía `@use 'tokens';` explícito en su línea 24
  (necesario porque `additionalData` ya no le inyecta los custom properties), y ya usaba
  `espaciado()` dos veces, que ahora le llega vía el `@use "api" as *;` inyectado.

*Verificado:* `pnpm exec vitest run src/styles/tokens-api.test.ts` → 7/7 verdes. Suite
completa: `pnpm exec vitest run` → **758/758 verdes, 59 ficheros**.

*Medición obligatoria (antes/después de la escisión, con `pnpm build`), tal y como exige el
paso 3 del plan:*

Para medir el "antes" de verdad (no solo citar la M-2 del plan, de antes de toda la
sesión) se reconstruyó temporalmente el árbol "sin escindir" — `_tokens.scss` con las ocho
declaraciones de Sass devueltas y `additionalData: '@use "tokens" as *;\n'` — se
reconstruyó `dist/` y se midió; después se restauró exactamente el estado escindido (los
tres ficheros escritos arriba, byte a byte, diffados con `git diff --stat` para confirmar
que la restauración fue exacta) y se volvió a construir:

| medición sobre `dist/assets/index-*.css` | ANTES (sin escindir, `_tokens.scss` inyectado 17 veces) | DESPUÉS (escindido, `_api.scss` inyectado 17 veces, `_tokens.scss` una sola vez) |
| --- | --- | --- |
| bytes del CSS | 13 711 | **11 999** |
| apariciones de `:root[data-variante` | **21** | **4** |
| llaves `{` (cifra de diagnóstico) | 153 | 136 |

El dato que demuestra el mecanismo: **21, no 4 y no 68**. Lightning CSS solo fusiona
selectores idénticos cuando quedan en una posición que su pasada de optimización alcanza,
no hace una deduplicación global de todo el fichero — así que sin la escisión el token no
se "salva solo": la cifra real cae en un punto intermedio, medido, no supuesto. Con la
escisión (el estado actual del árbol) el `additionalData` ya no toca `_tokens.scss` en
absoluto — solo `global.scss` lo `@use`a, una vez — así que la cifra vuelve a ser
exactamente el mínimo teórico, 4, con independencia de lo que haga cualquier minificador.
Confirmado también que la suite completa sigue en 758/758 verdes tras restaurar el estado
escindido, y que `grep -c "font-family" dist/assets/*.css` sigue siendo 1 en ambos casos
(la escisión no cambia lo que la hoja pinta, solo cuántas veces se repite en el CSS
intermedio).

### Ciclo 4 — Paso 4 del plan · los 14 tokens nuevos (12 de color + 2 de sombra), en las 4 variantes

*Por qué:* `plan_adaptacion_scss.md` §2.1, §2.5, §3 y §5 paso 4. El sistema de color pasa de
3 a 17 tokens (15 de color + 2 de sombra) en las 4 variantes = 68 pares (variante, token),
@s1-@s11 del contrato.

**4.a — `mezclaDeColor.ts` primero, la aritmética pura que Stryker puede morder.**

*Rojo:* `src/lib/diseno/mezclaDeColor.test.ts` (nuevo), import de `mezclar` desde un módulo
que no existe. Verificado: `pnpm exec vitest run src/lib/diseno/mezclaDeColor.test.ts` →
falla al resolver el import (Vite no puede transformar el fichero).

*Verificación previa a escribir el test, con un script Node aparte (no confiado a
memoria):* recalculadas las 8 mezclas de @s4 con una réplica de la fórmula
`base*(1-p) + otro*p`, redondeo estándar — las 8 coinciden dígito a dígito con los 8
hexadecimales que @s4 clava a mano.

*Verde (mínimo):* `src/lib/diseno/mezclaDeColor.ts` con `mezclar(base, otro, porcentaje)`,
validación de formato hexadecimal (reutiliza el mismo patrón que `contraste.ts`), canal a
canal con `Math.round`. Test final: las 8 mezclas de @s4, dos guardas de formato inválido
(`base`/`otro`) y los dos extremos de porcentaje (0 → `base` tal cual, 1 → `otro` tal cual).

*Verificado:* `pnpm exec vitest run src/lib/diseno/mezclaDeColor.test.ts` → 5/5 verdes.

**4.b — El lector de tokens gana hermanos (PENDIENTE 12 del contrato), sin relajar el existente.**

*Rojo:* 8 tests nuevos en `tokensColor.test.ts` (describe `(paso 4 del plan, PENDIENTE 12
del contrato)…`) contra `leerDeclaracionDeVariante`/`declaraTokenEnVariante`, que no
existían. Verificado: `pnpm exec vitest run src/lib/diseno/tokensColor.test.ts` → 8 fallos
(`TypeError: … is not a function`), 18 verdes de antes.

*Verde (mínimo):* en `tokensColor.ts`:
- `extraerBloqueDeVariante` reescrita de `[^}]*` a un recorrido por profundidad de llaves
  (mismo mecanismo que `movimientoRespetuoso.ts`), con dos errores distintos: bloque no
  encontrado / bloque no cerrado.
- `leerDeclaracionDeVariante(texto, variante, nombreDeToken)`: valor crudo de CUALQUIER
  token (sirve para `--sombra-*`, que llevan `rgba()` y no son hex de 6 dígitos).
- `declaraTokenEnVariante(texto, variante, nombreDeToken)`: presencia en el bloque PROPIO,
  sin heredar.
- `leerTokenDeVariante` NO se toca en su contrato (sigue exigiendo hex de 6 dígitos):
  solo hereda gratis el nuevo `extraerBloqueDeVariante`.

*Verificado:* 26/26 verdes en `tokensColor.test.ts`. El test que fuerza la razón de ser del
conteo de llaves (un `@media` anidado dentro de un bloque de variante) habría fallado con
la implementación vieja (`[^}]*` se corta en la primera `}`, la del `@media`, y
`--color-texto` posterior queda fuera del cuerpo capturado) — comprobado leyendo la vieja
regex antes de sustituirla, no solo confiado al verde final.

**4.c — Los 68 pares: `_tokens.scss` con los 17 tokens en las 4 variantes.**

*Rojo:* `identidad_visual @s3 …` (12 valores nuevos de `marca`) — falla porque
`_tokens.scss` solo declaraba 3 roles por variante.

*Verificación previa, con Node (no confiada a la tabla del plan sin recomprobar):*
recalculadas las 8 derivaciones nuevas de `marca` (ya cubiertas en 4.a) y, además, las **17
derivaciones de `lima`, `verde` y `noche`** con la misma fórmula de mezcla — las 17
coinciden dígito a dígito con `plan_adaptacion_scss.md` §3.4-§3.6. Los ratios de la matriz
de `marca` (@s5, @s6, @s7, @s8) recalculados aparte con una réplica de
`calcularRatioContraste` — los 13 números que el contrato clava a mano (12.84, 11.23, 7.99,
5.50, 4.81, 8.53, 9.13, 5.27, 4.97, 4.23, 3.70, 1.56, 10.26) coinciden los 13.

*Verde:* `src/styles/_tokens.scss` reescrito con los cinco bloques completos (el `:root`
desnudo se queda con los 3 roles de siempre, red de emergencia — los 14 tokens nuevos solo
tienen sentido conmutados por paleta) — `marca`, `lima`, `verde` y `noche` con los 17
tokens cada uno, incluidos `--sombra-reposo`/`--sombra-elevada` teñidos con el
`--color-tinta` de cada variante (excepción documentada en `noche`: tinta blanca → sombra
teñida de negro, para que no sea un halo). Cada valor lleva su derivación en comentario.

*Verificado:* `pnpm exec vitest run src/lib/diseno/tokensColor.test.ts` → 27/27 verdes.
Suite completa → 773/773. `pnpm run build` → compila sin error (los 5 bloques con 17
tokens cada uno no rompen Sass ni Lightning CSS).

**4.d — @s2 (68 pares, sin herencia) y @s1 (inventario de 17 nombres).**

*Rojo @s2:* 3 tests contra `comprobarInventarioDeTokens`, inexistente.
*Verde:* nueva función en `tokensColor.ts`, con guarda de vacuidad (ni variantes ni tokens
vacíos dan "pasa" por vacuidad) y un informe que nombra `{variante, token}` de cada
faltante — verificado con un texto sintético de dos variantes donde una carece de un token.
*Verificado:* 30/30 verdes; el recuento real sobre `_tokens.scss` da exactamente 68.

*Rojo @s1:* 2 tests contra `INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR`, inexistente.
*Verde:* la constante, construida a partir de `ROLES_DE_COLOR` (15) y `ROLES_DE_SOMBRA` (2)
— los mismos arrays de los que nace el tipo `RolDeColor`/`RolDeSombra`, así que no puede
desincronizarse del resto del módulo.
*Verificado:* 32/32 verdes.

**4.e — La matriz de uso de "marca" (@s5, @s6, @s7) y las comparaciones directas (@s8, @s9, @s10).**

*Rojo @s5/@s7:* 2 tests contra `MATRIZ_DE_USO_MARCA`/`resolverMatrizDeUso`, inexistentes.
*Verde:* `MATRIZ_DE_USO_MARCA` (11 filas: los 9 pares de texto normal de @s5 + los 2 pares
de `borde-control` de @s6, con su `uso` WCAG; `--color-borde` queda fuera a propósito, es
la aserción de @s7) y `resolverMatrizDeUso`, que resuelve cada fila a hexadecimales reales
vía `leerTokenDeVariante` y produce un catálogo listo para `ejecutarPuertaDeContraste` (de
`contraste.ts`, reutilizada tal cual, sin tocarla).
*@s6, @s8, @s9, @s10 no necesitaron producción nueva*: se apoyan en `leerTokenDeVariante` +
`calcularRatioContraste`/`ejecutarPuertaDeContraste`, ya existentes, así que sus tests
entraron directos en verde en la misma corrida — quedan igualmente documentados aquí
porque cada uno ancla un valor o una propiedad que antes NINGÚN test comprobaba (p. ej.
@s9 ancla que ningún rol de texto/borde/foco de "noche" vale el morado de marca).
*Verificado:* `pnpm exec vitest run src/lib/diseno/tokensColor.test.ts` → **38/38 verdes**.
Suite completa: `pnpm exec vitest run` → **784/784 verdes, 60 ficheros**. `pnpm run
typecheck` y `pnpm run lint` limpios.

**@s4 (marca) queda cubierto por `mezclaDeColor.test.ts` (4.a).** Las derivaciones de
`lima`, `verde` y `noche` (el PENDIENTE 1 del contrato, explícitamente asignado al
`tdd_craftsman`) están recalculadas y verificadas (4.c) y viven en `_tokens.scss`, pero
**no tienen todavía su propio test de derivación aritmética** (solo el de @s3-estilo para
`marca`, más el de contraste vía `leerTokenDeVariante`): queda anotado como refinamiento
posible, no como hueco de contrato — @s4 del `.feature` solo clava a mano las 8 mezclas de
`marca`.

### Ciclo 5 — Paso 5 del plan · el movimiento y el foco globales

*Por qué:* `plan_adaptacion_scss.md` §1.4 y §5 paso 5. `global.scss` (Ciclo 1) ya tenía
`scroll-padding-top`, pero **nada** declaraba `scroll-behavior: smooth`, ni la `transition`
del `body`, ni un `:focus-visible` global — y sin la puerta @s33 ampliada a las hojas
globales, cualquiera de las tres podía entrar fuera de `prefers-reduced-motion` sin que
ninguna puerta se enterase (patrón `verde-por-vacuidad-en-puerta-de-verificacion`).

*Aviso sobre la redacción del encargo:* el encargo de esta ronda menciona
"`scroll-padding-block-start`". El contrato (@s14) exige literalmente la cadena
`scroll-padding-top`, ya satisfecha desde el Ciclo 1 (`html { scroll-padding-top: calc(var(--altura-cabecera) + …) }`,
verificado leyendo `hoja-global.test.ts` @s14). **Manda el contrato**: no se renombra la
propiedad ni se duplica una segunda regla con `-block-start`, que además rompería
`valorDeclarado(hojaGlobal(), 'html', 'scroll-padding-top')`. Se interpreta como una
paráfrasis del mismo requisito, ya cerrado, y se deja constancia aquí en vez de callarlo.

*Rojo:* `src/styles/hoja-global.test.ts`, dos describes nuevos:
1. `@s15 …` — tres tests contra `scroll-behavior: smooth` (usando el campo `ancestros` de
   `extraerReglas`, la pieza que el Ciclo 1 dejó lista) y contra la duración `0.01ms` dentro
   de `@media (prefers-reduced-motion: reduce)`. Fallan: `global.scss` no declaraba
   `scroll-behavior` en ningún sitio y no tenía bloque `reduce`.
2. `(paso 5 del plan) el anillo de foco global…` — dos tests contra `:focus-visible`. Falla:
   no existía ningún `:focus-visible` en `global.scss` (el `foco-visible` de `_api.scss` es
   un MIXIN que cada componente incluye por su cuenta, `@include foco-visible`; no hay
   ningún `:focus-visible` a nivel de documento).

Verificado: `pnpm exec vitest run src/styles/hoja-global.test.ts` → 3 fallos, 12 verdes de
antes.

*Verde (mínimo):* `src/styles/global.scss`:
- Nueva sección **C. Base** con `:focus-visible { outline: $grosor-foco solid var(--color-foco); outline-offset: $grosor-foco; }`
  (mismos valores que ya validó `sistema_de_diseno_visual.feature`, ahora también a nivel
  de documento, no solo vía mixin por componente).
- Sección **D. Movimiento** ampliada con dos bloques nuevos, después de
  `scroll-padding-top`:
  - `@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth } body { transition: background-color 150ms ease-out, color 150ms ease-out } }`
    — opt-in, nunca declarado y revocado después (la forma que el contrato prohíbe).
  - `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms; animation-iteration-count: 1; transition-duration: 0.01ms } }`
    — sin `!important`, red de seguridad para lo que el navegador anime por su cuenta;
    `0.01ms` y no `0` para que `transitionend`/`animationend` sigan disparándose.

*Verificado:* `pnpm exec vitest run src/styles/hoja-global.test.ts` → 15/15 verdes.

*Segundo ciclo, la puerta separada (D-11 del plan §9):* nuevo fichero
`src/styles/movimiento-global.test.ts`, que invoca `ejecutarPuertaDeMovimientoRespetuoso`
(ya `done`, sin tocar su código) con un catálogo de **3 ficheros reales** —
`global.scss`, `_api.scss`, `_tokens.scss` — **por separado** del catálogo de los 17
`.module.scss` (nunca ampliando ese glob, o @s24/@s51 romperían su "exactamente 17").

*Verificación honesta de que el test no es vacuo:* antes de darlo por bueno, se revirtió
temporalmente el bloque de movimiento de `global.scss` (guardado aparte, restaurado byte a
byte después) y se comprobó que **las tres** pruebas nuevas (las dos de `@s15` y la de
`movimiento-global.test.ts`) vuelven a rojo por la razón correcta (`ficherosComprobados`/
`reglas.length` caen a 0). Restaurado el contenido correcto, las 17 pruebas de
`hoja-global.test.ts` + las 2 de `movimiento-global.test.ts` vuelven a verde.

*Verificado:* suite completa `pnpm exec vitest run` → **791/791 verdes, 61 ficheros**
(la primera corrida completa de esta ronda dio 4 fallos en
`src/accesibilidad-teclado.test.tsx`, la misma inestabilidad de `userEvent.tab()` bajo
máquina saturada ya anotada en §1 de esta bitácora — 2 procesos `node` activos, no una
colisión real; la re-ejecución completa dio 791/791). `pnpm run typecheck` y `pnpm run
lint` limpios. `pnpm run build` compila (`$grosor-foco` resuelto vía el `@use "api" as *;`
inyectado en `global.scss`).

*Refactor:* ninguno adicional — las dos ediciones de `global.scss` (foco y movimiento)
quedan en el mismo estilo de comentario-por-familia que ya usa el resto del fichero.

### Ciclo 6 — Paso 7 del plan · la puerta de build de terceros (nivel B-2)

*Por qué:* `plan_adaptacion_scss.md` §4.2 y §5 paso 7. Decisión 9/Invariante del contrato:
cero peticiones automáticas a un tercero (`fonts.googleapis.com`, `fonts.gstatic.com`, el
banco de imágenes `images.pexels.com`). Hasta este ciclo, `package.json → build` no tenía
ninguna puerta encadenada: nada impedía que una URL de terceros llegara al `dist/` servido.

*Alcance recortado respecto del plan, con su razón escrita:* la referencia real de
NailsLash (`tools/puerta-terceros.ts` de `NailsLashStudioWeb`, leída para no adivinar el
patrón) comprueba TAMBIÉN 4 pares `[familia, peso]` de `@font-face` esperados — pero esos
pares son de la **tipografía autoalojada, paso 6 del plan, explícitamente FUERA del
alcance de esta ronda**. Esta puerta se queda con la mitad que sí toca esta ronda: **cero
dominios de terceros** en el CSS/HTML compilado. La comprobación de los pares de fuente
queda para el ciclo que ejecute el paso 6, sobre esta misma puerta o una hermana.

*Rojo:* `src/lib/diseno/puertaTerceros.test.ts` (nuevo) contra `ejecutarPuertaDeTerceros`,
que no existía. Cinco tests: (1) el CSS REAL de `dist/assets/index-DYgsknih.css` —medido
con `pnpm run build` sobre el árbol de esta sesión y pegado LITERAL, sin recortar— no
contiene ningún dominio prohibido; (2) un CSS sintético con
`url(https://fonts.gstatic.com/…)` se señala, nombrando fichero y dominio; (3) `dist/`
vacío falla cerrado; (4) la lista de dominios prohibidos vacía falla cerrado; (5) la lista
de dominios declarada es exactamente los 3 que el contrato exige. Verificado fallando: el
módulo `./puertaTerceros` no existía (`Failed to resolve import`).

*Verde (mínimo):* `src/lib/diseno/puertaTerceros.ts` — módulo PURO (sin `node:fs`),
`ejecutarPuertaDeTerceros(archivos, dominiosProhibidos)` con sus DOS guardas de vacuidad
(`dist/` vacío / lista de dominios vacía, cada una con su propio motivo) y
`DOMINIOS_DE_TERCEROS_PROHIBIDOS` como literal declarado.

*Verificado:* `pnpm exec vitest run src/lib/diseno/puertaTerceros.test.ts` → 5/5 verdes.

*El humilde:* `tools/puerta-terceros.ts` (nuevo) — cablea `node:fs`/`node:process`: lee
`dist/` de verdad (`readdirSync` recursivo, filtro `.css`/`.html` — nunca `.js`, porque el
bundle inlinea datos de negocio legítimos que un grep ingenuo confundiría con un
hallazgo), llama a `ejecutarPuertaDeTerceros` y traduce el informe a código de salida.
Sin test propio (mismo patrón que `src/main.tsx`, ya excluido de cobertura/mutación): la
lógica que decide vive en el módulo puro de arriba, ya testeado.

*Enganche, verificado con el árbol real, tres veces:*
1. `package.json → scripts.build`: `"tsc -b && vite build && node --experimental-strip-types --disable-warning=ExperimentalWarning tools/puerta-terceros.ts"`.
   `scripts.dev` NO se toca (`"vite"`, igual que antes): la puerta separa VER de PUBLICAR.
2. `pnpm run build` con el árbol limpio → `✓ Puerta de terceros: 2 archivo(s) de "dist/"
   inspeccionados, ninguna referencia a un dominio de terceros.` (código de salida 0).
3. Sabotaje manual, deshecho después: se añadió a mano
   `@font-face{src:url(https://fonts.gstatic.com/s/x.woff2)}` al final del CSS de `dist/` y
   se re-ejecutó el binario directamente → `✗ … referencia "fonts.gstatic.com"`, código de
   salida 1. Y con `dist/` vacío (creado sin contenido) → falla cerrada con su motivo,
   código de salida 1. Los dos casos negativos confirmados antes de dar la puerta por
   buena — no solo el camino feliz.

*Fricción de infraestructura, resuelta sin desviarse del plan:* `tools/` no estaba en
ningún `tsconfig`, así que `tsc -b` no lo veía — y sin comprobación de tipos ahí,
`readdirSync`/`process` no resolvían. Se añadió `"tools"` a `tsconfig.app.json` → `include`
(en vez de crear un tercer proyecto TS con referencias cruzadas: `tools/puerta-terceros.ts`
importa un fichero de `src/lib/diseno/`, y con `tsc -b` en modo de proyectos referenciados
un fichero fuera del `include` de su propio proyecto no se puede importar sin ese enlace —
error TS6307 — así que meterlo en el MISMO proyecto que ya incluye `src/` es la solución
sin fricción) y `"node"` a `types` (sin él, `node:fs`/`node:process` no resuelven —
verificado con el error real de `tsc`: `TS2591 Cannot find name 'node:fs'`, no adivinado).
Verificado contra la referencia real de NailsLash (`tools/puerta-terceros.ts`,
`package.json → scripts.build`, mismo comando
`node --experimental-strip-types --disable-warning=ExperimentalWarning`) para no
inventar la forma de invocación de Node.

*`no-console` de oxlint:* la puerta necesita imprimir su veredicto por diseño (es un
script de terminal, no código de aplicación). Se añadió un `overrides` en `.oxlintrc.json`
que desactiva `no-console` SOLO para `tools/**`, en vez de desactivarlo globalmente.

*Verificado:* `pnpm run typecheck` limpio, `pnpm run lint` limpio, `pnpm exec vitest run` →
**796/796 verdes, 62 ficheros**, `pnpm run build` limpio con la puerta en verde al final.

**@s11 QUEDA PENDIENTE, deliberadamente, y no se fuerza en esta ronda.** El escenario exige
leer "el texto real de los ficheros de estilos del inventario de módulos" y que
`--color-primario-fuerte` "se use al menos una vez en algún fichero de estilos del
inventario" — eso exige tocar un `.module.scss` de un componente real, que es exactamente
el **paso 10** del plan ("maquetación fina de los 17 `.module.scss`"), explícitamente FUERA
del alcance de esta ronda por instrucción directa del `craftsman_lead`. Escribir ese test
ahora significaría o (a) dejarlo rojo permanentemente hasta la ronda del paso 10, violando
"todo verde de punta a punta" al cerrar esta ronda, o (b) tocar un componente para
maquillar el test, que es exactamente la clase de invención de alcance que
`docs/tdd.md`/`AGENTS.md` prohíben. Se deja explícito aquí, no escondido: **@s11 se retoma
en la ronda que ejecute el paso 10.** Lo que SÍ se puede comprobar ahora sin tocar
`.module.scss` (ausencia de "urgencia"/"urg" y de un `--color-acento` a secas en
`_tokens.scss`) se deja para esa misma ronda también, para no partir el escenario en dos
mitades verificadas en momentos distintos y con eso perder la trazabilidad de un único
`@s11 → test`.

## 3 · Trazabilidad de esta ronda (pasos 1, 2, 3, 4, 5 y 7 del plan)

Estado final verificado: `pnpm exec vitest run` → **796/796 verdes, 62 ficheros de test**;
`pnpm run typecheck` limpio; `pnpm run lint` limpio; `pnpm run build` limpio, con la puerta
de terceros en verde al cierre. (La primera corrida completa de la sesión mostró 4 fallos
puntuales en `src/accesibilidad-teclado.test.tsx` por inestabilidad de `userEvent.tab()`
bajo máquina saturada — ya documentado en §1 desde antes de esta sesión, no una regresión
de esta ronda — y la re-ejecución completa dio verde de punta a punta.)

**Nota honesta sobre el cierre de sesión.** Al verificar el estado final se detectaron
picos de contención real en la máquina: `tasklist` llegó a mostrar **28 procesos `node`
activos simultáneamente** (de otras sesiones/agentes en el mismo equipo, no de esta
sesión), y dos corridas de `pnpm exec vitest run` lanzadas en esos picos terminaron
truncadas — solo 42/62 y 45/62 ficheros ejecutados, con `[vitest-pool-runner]: Timeout
waiting for worker to respond` en la segunda. **No son regresiones**: son colisiones de
recursos, exactamente el tipo de inestabilidad que §1 de esta bitácora ya documentaba antes
de que empezara esta ronda. Se esperó a que el recuento de procesos `node` bajara (a 2) y se
repitió la corrida completa: **796/796 verdes, 62/62 ficheros, sin ningún timeout.** Esa es
la corrida que se da por buena; las dos truncadas quedan anotadas aquí por transparencia, no
escondidas, siguiendo la instrucción explícita de "repite la corrida si sospechas una
colisión de otro proceso".

| @s (identidad_visual.feature) | Escenario | Test(s) | Estado |
| --- | --- | --- | --- |
| @s1 | Inventario de 17 roles del sistema de color | `tokensColor.test.ts` → `identidad_visual @s1 …` | ✅ verde |
| @s2 | Los 17 tokens en las 4 variantes, sin herencia (68 pares) | `tokensColor.test.ts` → `identidad_visual @s2 …` | ✅ verde |
| @s3 | Los 12 roles nuevos de "marca" | `tokensColor.test.ts` → `identidad_visual @s3 …` | ✅ verde |
| @s4 | Cada rol nuevo es mezcla en sRGB (las 8 de "marca") | `mezclaDeColor.test.ts` → `@s4 …` | ✅ verde |
| @s5 | Matriz de uso de "marca" alcanza su mínimo WCAG | `tokensColor.test.ts` → `identidad_visual @s5 …` | ✅ verde |
| @s6 | Borde de control ≥ 3:1 contra las dos superficies | `tokensColor.test.ts` → `identidad_visual @s6 …` | ✅ verde |
| @s7 | Borde decorativo nunca identifica un control | `tokensColor.test.ts` → `identidad_visual @s7 …` | ✅ verde |
| @s8 | El primario-fuerte mejora el contraste del hover | `tokensColor.test.ts` → `identidad_visual @s8 …` | ✅ verde |
| @s9 | En "noche" el morado no es texto/borde/foco | `tokensColor.test.ts` → `identidad_visual @s9 …` | ✅ verde |
| @s10 | Matriz de uso vacía falla cerrada | `tokensColor.test.ts` → `identidad_visual @s10 …` | ✅ verde |
| @s11 | Los 4 roles descartados no entran por ninguna puerta | — | ⏸ PENDIENTE, deliberado — exige tocar un `.module.scss` real (paso 10), fuera de esta ronda; ver nota junto al Ciclo 4 |
| @s12 | Existe `global.scss`, se importa una vez | `hoja-global.test.ts` → `@s12 …` | ✅ verde |
| @s13 | Las 9 familias del reset | `hoja-global.test.ts` → `@s13 …`, `hojaGlobal.test.ts` → `@s13 …` | ✅ verde |
| @s14 | `scroll-padding-top` deriva de `--altura-cabecera` | `hoja-global.test.ts` → `@s14 …`, `hojaGlobal.test.ts` → `@s14 …` | ✅ verde |
| @s15 | `scroll-behavior` solo dentro de `no-preference`; `reduce` con `0.01ms` | `hoja-global.test.ts` → `@s15 …`, `hojaGlobal.test.ts` → `@s15 …` (más el ciclo de `ancestros`) | ✅ verde |
| @s16-@s51 | El resto de escenarios (tipografía, navegador real, imágenes, red limpia, accesibilidad medida, movimiento en el sitio real, layout, puertas del arnés) | — | ⏸ FUERA de esta ronda por alcance asignado (pasos 6, 8, 9, 10, 11, 12 del plan) |

**Cobertura añadida sin `@sN` propio, pero exigida por el plan para sostener lo anterior:**

| Qué | Test(s) | Por qué no tiene `@sN` |
| --- | --- | --- |
| `extraerReglas` conoce los bloques que contienen a una regla (`ancestros`) | `hojaGlobal.test.ts` → `@s15 cada regla conoce los bloques que la contienen` | Es la pieza interna que @s15 necesita; el escenario en sí es de texto, no de esta función concreta |
| El `:root` sin atributo (red de seguridad sin JS) | `tokensColor.test.ts` → `(paso 2 del plan) …` | Paso 2 del plan; refuerza @s24 (condición de producción) sin ser uno de los 51 escenarios con número propio |
| La escisión `_tokens.scss`/`_api.scss` y el `additionalData` literal | `tokens-api.test.ts` | Paso 3 del plan; arquitectura interna, no comportamiento observable por el contrato |
| El lector de tokens generalizado (`leerDeclaracionDeVariante`, `declaraTokenEnVariante`, conteo de llaves) | `tokensColor.test.ts` → `(paso 4 del plan, PENDIENTE 12 del contrato) …` | PENDIENTE 12 del contrato, explícitamente asignado al `tdd_craftsman` |
| El anillo de foco global (`:focus-visible`) | `hoja-global.test.ts` → `(paso 5 del plan) …` | Preparación textual de @s38/@s39 (navegador real, heredados de `sistema_de_diseno_visual.feature`), que se automatizan como e2e en un paso posterior (9) |
| La puerta de movimiento ampliada a las 3 hojas globales, como catálogo separado | `movimiento-global.test.ts` | Extiende @s33 de `sistema_de_diseno_visual.feature` (ya `done`) a las hojas nuevas; D-11 del plan §9 |
| La puerta de build de terceros (cero dominios prohibidos en `dist/`) | `puertaTerceros.test.ts` | Nivel B-2 del plan §4.2, paso 7; sostiene el Invariante de Decisión 9 y prepara (parcialmente) @s32 |

**Ficheros nuevos de esta ronda:** `src/lib/diseno/mezclaDeColor.ts`(`.test.ts`),
`src/lib/diseno/puertaTerceros.ts`(`.test.ts`), `src/styles/tokens-api.test.ts`,
`src/styles/movimiento-global.test.ts`, `src/styles/_api.scss`, `tools/puerta-terceros.ts`.

**Ficheros ampliados:** `src/lib/diseno/hojaGlobal.ts`(`.test.ts`) (campo `ancestros`),
`src/lib/diseno/tokensColor.ts`(`.test.ts`) (lector generalizado, 15 roles + 2 sombras,
inventario, matriz de uso, comprobación de 68 pares), `src/styles/_tokens.scss` (68 tokens),
`src/styles/global.scss` (foco global + movimiento), `src/styles/hoja-global.test.ts`,
`vite.config.ts` (additionalData → api), `package.json` (script `build`), `tsconfig.app.json`
(`include`/`types`), `.oxlintrc.json` (`overrides` para `tools/**`).

**No tocados, verificado explícitamente:** `src/lib/contraste.ts` (reutilizado tal cual),
`Cabecera.module.scss` y `main.tsx` (ya estaban correctos al empezar esta ronda, según el
propio encargo), ningún fichero de las features 1-21 fuera de los ya mencionados, ningún
`.module.scss` de componente (paso 10, fuera de alcance).

## 4 · REFUERZO MUTACIÓN 1 — matando los 64 supervivientes de la Ronda A

> El `mutation_tester` devolvió FAIL sobre la Ronda A (`progress/mutation_identidad_visual.md`
> §"Ronda A"): 428/496 = 86.29 % bruto, 64 mutantes sobrevivientes reales (59 `Survived` + 5
> `NoCoverage`) repartidos en `mezclaDeColor.ts` (3), `hojaGlobal.ts` (35), `tokensColor.ts`
> (24) y `puertaTerceros.ts` (2). Esta sección documenta el refuerzo: **cero producción nueva**
> (ningún hallazgo del informe apuntaba a un comportamiento incorrecto, solo a huecos de test),
> solo tests dirigidos que fallan con el mutante activo y pasan sin él — verificado uno a uno,
> no solo supuesto, aplicando cada mutación a una copia desechable del fichero real (scratchpad
> de sesión, nunca comprometida al repositorio) y comparando la salida real vs. mutada con un
> script Node (`--experimental-strip-types`), siguiendo el mismo patrón ya usado por el
> `mutation_tester` para sus propios mutantes equivalentes.

### 4.1 · Un mutante EQUIVALENTE nuevo, encontrado y verificado (no en el informe original)

**`src/lib/diseno/tokensColor.ts:315`** `StringLiteral` — el literal `'suspenso'` de
`veredicto: informe.pasa ? 'aprobado' : 'suspenso'`, dentro de
`ejecutarComprobacionDeContrasteDeVariantes`, para la rama de **catálogo NO vacío**.

El informe de mutación (§"Mutantes sobrevivientes reales") pedía "un test con un catálogo no
vacío y deliberadamente insuficiente en contraste, esperando `veredicto: 'suspenso'`". Antes de
escribir ese test se comprobó si era siquiera posible: `informe.pasa` en esa línea viene de
`ejecutarPuertaDeContraste(catalogo)` — de `src/lib/contraste.ts`, reutilizada tal cual, **sin
tocar**, fuera del alcance de esta feature — cuya implementación (líneas 134-145 de ese fichero)
es:

```ts
export function ejecutarPuertaDeContraste(catalogo: readonly ParDeContraste[]): InformePuertaDeContraste {
  if (catalogo.length === CERO_PAREJAS) {
    return { pasa: false, ... }
  }
  const parejas = catalogo.map((par) => ({ ...par, ratio: calcularRatioContraste(par.color, par.fondo) }))
  return { pasa: true, parejasEvaluadas: parejas.length, parejas }
}
```

Para **cualquier** catálogo no vacío, `pasa` es **siempre `true`**: la función no compara ningún
ratio contra ningún umbral (esa lógica vive en `ejecutarPuertaDeContrasteParaUso`/
`ejecutarPuertaDeContrasteTextoNormal`/etc., que esta feature no usa aquí). Como
`ejecutarComprobacionDeContrasteDeVariantes` ya filtra el catálogo vacío en la guarda ANTERIOR
(`if (catalogo.length === CERO_VARIANTES) return { veredicto: 'suspenso', ... }`), la única
llamada a `ejecutarPuertaDeContraste` que le queda siempre tiene `catalogo.length > 0` — así que
`informe.pasa` en esa línea es **provablemente siempre `true`**, y la rama `'suspenso'` del
ternario es código muerto: ningún input posible la alcanza.

**Verificación empírica** (no solo analítica), con un script Node desechable que importa
`ejecutarPuertaDeContraste` real y la ejecuta contra 5 catálogos adversariales no vacíos,
incluidos los peores casos posibles de contraste (color y fondo idénticos, ratio 1.0 — el mínimo
matemático absoluto): **las 5 dieron `pasa: true`**, sin excepción. Ningún catálogo no vacío,
por malo que sea su contraste, puede hacer que `informe.pasa` sea `false` con la implementación
actual de `ejecutarPuertaDeContraste`.

**No se escribió ningún test artificial para este mutante**: forzarlo habría exigido simular una
implementación de `ejecutarPuertaDeContraste` que HOY no existe (una que sí comparase contra un
umbral), lo que habría sido inventar comportamiento fuera del `.feature` — exactamente lo que
`docs/tdd.md` prohíbe. Mutante genuinamente equivalente, documentado aquí en vez de forzado.

### 4.2 · `src/lib/diseno/mezclaDeColor.ts` (3/3 muertos)

| Mutante del informe | Test nuevo | Verificado con mutante aplicado |
| --- | --- | --- |
| `mezclaDeColor.ts:12` `CERO_RELLENO='0'→''` | `mezclar('#010101','#010101',0.5)` → `'#010101'` | mutante da `'#111'` |
| `mezclaDeColor.ts:25` regex sin `^` (prefijo) | `mezclar('X#FFFFFF', NEGRO, 0.5)` → lanza | mutante NO lanza (`'#NAN8080'`) |
| `mezclaDeColor.ts:25` regex sin `$` (sufijo) | `mezclar(BLANCO, '#FFFFFFX', 0.5)` → lanza | mutante NO lanza (`'#FFFFFF'`) |

### 4.3 · `src/lib/diseno/hojaGlobal.ts` (35/35 muertos)

| Mutante(s) del informe | Test nuevo | Verificado con mutante aplicado |
| --- | --- | --- |
| `:23` regex `^\s*→^\S*` | import indentado sigue contando 1 | mutante cuenta 0 |
| `:23` regex `import\s+→import\s` | doble espacio tras "import" sigue contando 1 | mutante cuenta 0 |
| `:23` regex `\sfrom\s+→\sfrom\s` | doble espacio tras "from" sigue contando 1 | mutante cuenta 0 |
| `:78` `ENCABEZADOS→[]` | family 9 con encabezados en selector INCORRECTO (`div`) sigue ausente (2ª sub-regla correcta) | mutante: familia 9 pasa a NO ausente |
| `:89,94,99,104,109,116,124,129,136` `selectores→[]` (9) | un test con las 9 familias declarando su propiedad en un selector DISTINTO (todas siguen ausentes) + un test dedicado de la 2ª sub-regla de family 9 (`p,li` con selector `span`) | mutante: familia respectiva pasa a NO ausente |
| `:88…133` `descripcion→''` (9) | aserción directa de las 9 descripciones exactas, en orden | mutante: el array de descripciones no coincide |
| `:136` `declaraciones→[]` (family 9, 2ª sub-regla) | family 9 con encabezados CORRECTOS y `p,li` con declaración incorrecta, sigue ausente | mutante: familia 9 pasa a NO ausente |
| `:219` `selectores.every→some` | family 1 con solo `*` (sin `*::before`/`*::after`) sigue ausente | mutante: familia 1 pasa a NO ausente |
| `:220` `declaraciones.every→some` | family 4 con solo `font: inherit` (sin `color: inherit`) sigue ausente | mutante: familia 4 pasa a NO ausente |
| `:240` `reglasExigidas.every→some` (2 mutantes NoCoverage/Survived agrupados) | los mismos 2 tests de la fila `:136` (cada uno deja UNA sub-regla de family 9 sin satisfacer) | mutante: familia 9 pasa a NO ausente en ambos |
| `:243` `pasa:false` fijo | `pasa===true` con las 9 familias satisfechas | mutante: `pasa` da `false` |
| `:243` `true && ...` | `pasa===false` con familias=`[]` | mutante: `pasa` da `true` |
| `:243` `>→>=` | mismo test de familias=`[]` | mutante: `pasa` da `true` |
| `:243` `===→<=` (o `!==`, ver nota) | — | ver nota abajo |
| `:155` regex sin `$` | comentario `//` con `\r` incrustado (CRLF) NO se recorta, la declaración queda sin reconocer | mutante SÍ recorta, declaración reconocida |
| `:155` regex `.` en vez de `.*` | comentario `//` de más de un carácter se recorta completo | mutante no recorta nada, declaración no reconocida |
| `:162` regex `/\s+/g→/\s/g` | `margin:   0;` (espacios múltiples) se colapsa a `margin: 0` | mutante conserva los espacios |
| `:165` `TEXTO_VACIO=''→'Stryker was here!'` | selector partido en 2 líneas por una línea en blanco no deja fragmentos vacíos | mutante deja `['h1','','','h2']` |
| `:197` separador de `join` `', '→''` | ancestro con selector compuesto (`h1, h2`) se lee unido por `", "` | mutante da `'h1h2'` |

**Nota sobre `:243` `===→<=`:** el informe original agrupa "4 mutantes en la misma expresión:
`pasa: false` fijo, `true && …`, `>=`, `<=`". Los dos tests de esta fila (`pasa===true` con éxito
total y `pasa===false` con familias vacías) matan, verificado con mutación aplicada y comparada
contra una copia desechable del fichero: el `false` fijo, el `true &&` y el `>` → `>=`. Se
comprobó TAMBIÉN la variante `===→!==` (la que de hecho genera el mutador `EqualityOperator` de
Stryker sobre un operador `===`, según su tabla oficial) — **también muere** con el test
`pasa===true`. La única variante que sobreviviría a ambos tests es literalmente `===→<=`, que es
**equivalente**: `familiasAusentes.length` es la longitud de un array, siempre un entero `>= 0`
en JavaScript, así que `x <= 0` y `x === 0` son idénticas para todo `x` posible — no hay ningún
input que las distinga. Si el mutante real resultara ser `!==` (como indica la tabla oficial de
Stryker, más probable que un literal `<=` sobre un `===`), ya queda muerto por el test
`pasa===true`, verificado arriba. Cualquiera de los dos casos queda cerrado sin producción nueva.

### 4.4 · `src/lib/diseno/tokensColor.ts` (23 killed + 1 equivalente documentado en 4.1 = 24/24)

| Mutante(s) del informe | Test nuevo | Verificado con mutante aplicado |
| --- | --- | --- |
| `:94` `SIN_COINCIDENCIA=-1→1` + `:118` `Conditional` + `:118/119` `Block`/`String` (`NoCoverage`) | cabecera de variante sin ninguna `{` después → lanza "no se encontró ningún bloque" | mutante: lanza "no se cierra" (mensaje distinto, no matchea) |
| `:125` `Conditional` (`profundidad>0→true`) + `:125` `Equality` (`>→>=`) | `declaraTokenEnVariante` con dos bloques seguidos, token ausente en el propio, presente en el siguiente → `false` | mutante: `true` (se traga el bloque siguiente) |
| `:179` `.trim()` quitado | valor con espacio antes del `;` de cierre se recorta | mutante conserva el espacio final |
| `:224` regex `\s*→\s` (exacto un espacio) | `":root{ ... }"` (cero espacios) se reconoce | mutante lanza "no se encontró ningún bloque" |
| `:235` `Conditional` + `:235/236` `Block`/`String` (`NoCoverage`) | texto sin ningún `:root` sin atributo → lanza mensaje que nombra el bloque | mutante: lanza `TypeError` (null) o mensaje vacío, no matchea |
| `:244` `String` (mensaje vaciado) | rol ausente dentro de un `:root` sin atributo real → mensaje exacto | mutante: mensaje vacío, no matchea |
| `:315` `String` (`'suspenso'`) | — | **EQUIVALENTE**, documentado en 4.1 |
| `:262-272` `String` (11, campo `uso`) | 9 filas "texto normal" + 2 "componente de interfaz", suma = 11 | mutante: una fila deja de contar en cualquiera de los dos grupos, suma queda en 10 |

### 4.5 · `src/lib/diseno/puertaTerceros.ts` (2/2 muertos)

| Mutante(s) del informe | Test nuevo | Verificado con mutante aplicado |
| --- | --- | --- |
| `:64` `hallazgos:[]→[…]` (rama `dist/` vacío) | `expect(informe.hallazgos).toEqual([])` añadido al test existente de esa rama | mutante: array no vacío, no coincide |
| `:67` `hallazgos:[]→[…]` (rama dominios vacíos) | `expect(informe.hallazgos).toEqual([])` añadido al test existente de esa rama | mutante: array no vacío, no coincide |

### 4.6 · Verificación de que ningún test es artificial

Cada mutación de las tablas 4.2-4.5 se aplicó a una **copia desechable** del fichero real (nunca
al fichero de `src/` en sí) y se ejecutó con `node --experimental-strip-types` contra la función
importada real, comparando la salida con y sin la mutación — no se dio ninguna por buena solo por
razonamiento. Las copias desechables se crearon y se borraron dentro de la misma sesión; no queda
ningún rastro en el árbol de trabajo (`git status --short` verificado limpio de ficheros
`_scratch_*` tras cada tanda).

### 4.7 · Trazabilidad @s → test (huecos de esta ronda, complemento de la tabla de §3)

Ningún mutante muerto en este refuerzo correspondía a un escenario `@s` sin cubrir — todos los
`@s1-@s15` seguían en verde antes del refuerzo (Ronda A ya los cubría); los 64 supervivientes eran
huecos de *cobertura de mutación* (ramas, operadores y literales sin un test que los distinguiera
del comportamiento correcto), no huecos de *comportamiento* sin test. Por eso este refuerzo no
añade ninguna fila nueva a la tabla `@s → test` de §3: reafirma la MISMA trazabilidad con tests
más finos, nunca añade alcance.

### 4.8 · Verificación final

`pnpm run test` → **822/822 verdes, 62 ficheros** (796 de la Ronda A + 26 tests nuevos de este
refuerzo). `pnpm run lint` limpio (`oxlint --deny-warnings`). `pnpm run typecheck` limpio
(`tsc -b`). `pnpm run build` limpio, con la puerta de terceros en verde al cierre
(`dist/assets/index-DYgsknih.css`, 2 archivos inspeccionados, 0 dominios de terceros).

**Ficheros de test modificados en este refuerzo:** `src/lib/diseno/mezclaDeColor.test.ts` (+3),
`src/lib/diseno/hojaGlobal.test.ts` (+16, incluidos los que matan varios mutantes a la vez),
`src/lib/diseno/tokensColor.test.ts` (+7), `src/lib/diseno/puertaTerceros.test.ts` (+0 tests,
+2 aserciones en tests existentes). Total: 26 tests nuevos (3+16+7+0), cuadra con
822−796=26. **Ningún fichero de `src/` fuera de tests fue tocado**: el informe de mutación no
señaló ningún comportamiento incorrecto, solo huecos de test.

