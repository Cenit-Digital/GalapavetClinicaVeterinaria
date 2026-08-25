# TDD — `sistema_de_diseno_visual` (feature 21)

Arranque: 22/08/2026. Feature `in_progress` en `feature_list.json`, contrato
aprobado en `features/sistema_de_diseno_visual.feature` (34 escenarios,
`@s1`-`@s34`). Ronda 1, TDD estricto desde cero (el repo no tenía ningún
`.scss`/`.css` — confirmado al arrancar: `find src -iname "*.scss" -o -iname
"*.css"` → 0).

## Re-verificación de los ratios de contraste (antes de fijar nada)

Instrucción explícita de la cabecera del `.feature`: no dar por buenos los
ratios citados sin repetir el cálculo con el módulo real. Recalculados el
22/08/2026 con `src/lib/contraste.ts` (`calcularRatioContraste`), invocado
vía `node --experimental-strip-types` sobre un script desechable del
scratchpad de la sesión (nunca reimplementando la fórmula):

| par | ratio recalculado | ratio del `.feature` |
| --- | --- | --- |
| `#77286B` / `#FFFFFF` (marca) | 9.1296 → 9.13 | 9.13 |
| `#77286B` / `#F8F9E8` (lima, texto/fondo) | 8.5674 → 8.57 | 8.57 |
| `#B4C718` / `#F8F9E8` (lima de marca sobre fondo lima, @s4) | 1.7717 → 1.77 | 1.77 |
| `#48704B` / `#F0F4F1` (verde) | 5.1195 → 5.12 | 5.12 |
| `#FFFFFF` / `#000000` (noche) | 21.0000 → 21.00 | 21.00 |
| `#B4C718` / `#000000` (foco noche) | 11.1232 → 11.12 | 11.12 |
| `#B4C718` / `#FFFFFF` (lima sobre blanco, @s10) | 1.8879 → 1.89 | 1.89 |
| `#77286B` / `#000000` (morado sobre negro, @s8) | 2.3002 → 2.30 | 2.30 |
| `#77286B` / `#F0F4F1` (foco verde, @s9) | 8.2234 → 8.22 | 8.22 |

Mezclas verificadas canal a canal (redondeo estándar): blanco + 10% lima de
marca → `#F8F9E8`; blanco + 8% verde profundo de marca → `#F0F4F1`. Los 9
valores coinciden dígito a dígito con la cabecera del `.feature`: se fijan
tal cual en `src/styles/_tokens.scss`.

## Escala tipográfica: valores finales y justificación Utopia

Decisión 24 fija literalmente 4 parámetros y solo 4: ratio 1.25 ("tercera
mayor"), base 16px, viewport mínimo 320px, viewport máximo 1024px — **un
único** valor de ratio y **un único** valor de base, no dos (uno para cada
extremo del viewport, que es lo que suele variar en la calculadora oficial
para lograr crecimiento visible). Aplicando la fórmula real de Utopia
(`minSize = baseMin·ratioMin^paso`, `maxSize = baseMax·ratioMax^paso`,
`slope = (maxSize−minSize)/(maxViewport−minViewport)`) con
`baseMin=baseMax=16` y `ratioMin=ratioMax=1.25`, el resultado matemático es
que `minSize(paso) = maxSize(paso)` para **todos** los pasos, no solo el
paso 0: la pendiente siempre es 0 con estos parámetros concretos. Verificado
en vivo repitiendo la fórmula (no solo argumentado). Por eso `@s16` usa
"menor o igual" (no "menor que") y `@s18` (saturación) se cumple de forma no
trivial en su estructura (la función real tiene rama de saturación por
debajo/encima del rango, aunque con esta elección de parámetros min=max en
todo el dominio). No se inventó un segundo ratio ni una segunda base para
forzar crecimiento visible: habría sido producción sin ningún test que la
pidiera (@s13 solo exige EXACTAMENTE los 4 parámetros citados).

Pasos elegidos (decisión de `tdd_craftsman`, pendiente explícitamente dejada
abierta por la cabecera del `.feature`): 8 pasos, `-2` a `5` (letra pequeña →
titular), el rango habitual de la calculadora oficial de Utopia:

| paso | px (min = max) |
| --- | --- |
| -2 | 10.24 |
| -1 | 12.8 |
| 0 | 16 |
| 1 | 20 |
| 2 | 25 |
| 3 | 31.25 |
| 4 | 39.06 |
| 5 | 48.83 |

`src/lib/diseno/escalaTipografica.ts` calcula estos valores con la fórmula
real (`base * ratio ** paso`, redondeada a 2 decimales), no los declara como
literales sueltos. `src/styles/_tokens.scss` los expone también como mapa
SCSS (`$escala-tipografica`, función `paso-tipografico($paso)`) para que los
17 módulos los consuman sin repetir píxeles a mano.

## Arquitectura entregada

- `src/styles/_tokens.scss` (nuevo): Bloque A (custom properties de color por
  variante, conmutadas por `:root[data-variante='...']`, el mismo atributo
  que `index.html`/`SelectorPaleta` ya aplican — no se toca ese mecanismo);
  Bloque B (mapa + función de la escala tipográfica); Bloque C (mapa +
  función de la escala de espaciado, rejilla de 8px de Material Design:
  4/8/12/16/24/32/48/64/96); Bloque D (mixins `foco-visible` y
  `area-tactil-minima` compartidos). **Nunca se importa directamente desde un
  `.tsx`**: si se compilara como entrada propia, `additionalData` (`@use
  "tokens" as *;`, inyectado en todo `.scss` por `vite.config.ts`) se
  inyectaría también sobre sí mismo y produciría un `@use` circular —
  verificado en vivo (error real de Sass "Module loop", reproducido a
  propósito con `?inline` y revertido). Solo se lee su texto crudo con
  `?raw` en los tests (nunca compila) y se consume vía `@use "tokens" as *;`
  desde los demás `.scss` (donde Sass lo resuelve como dependencia, sin
  reinyectar `additionalData` sobre él — también verificado en vivo).
- `src/lib/diseno/tokensColor.ts` (nuevo, mordible): `extraerVariantesDeTokens`,
  `leerTokenDeVariante` (parser de texto real, patrón de memoria
  `tokens/contraste-de-tokens-verificado-por-matriz-de-uso.md`),
  `ejecutarComprobacionDeContrasteDeVariantes` (envuelve
  `ejecutarPuertaDeContraste` de `contraste.ts`, ya `done`, reutilizado tal
  cual — solo añade la guarda de vacuidad con vocabulario de "variantes").
- `src/lib/diseno/escalaTipografica.ts` (nuevo, mordible): parámetros,
  `PASOS_ESCALA_TIPOGRAFICA`, `calcularTamanoDePaso`, `tamanoEnViewport`. El
  viewport máximo se IMPORTA de `Cabecera-logica.ts`
  (`PUNTO_DE_CORTE_NAVEGACION_PX`), nunca se repite como literal (@s14,
  verificado con sabotaje: cambiarlo a 999 puso el test en rojo).
- `src/lib/diseno/escalaEspaciado.ts` (nuevo, mordible): `ESCALA_DE_ESPACIADO_PX`.
- `src/lib/diseno/inventarioModulos.ts` (nuevo, mordible):
  `INVENTARIO_MODULOS_CON_ESTILOS` (17 módulos), `comprobarCoLocalizacion`
  (vacuidad fail-closed).
- `src/lib/diseno/puntoDeCorte.ts` (nuevo, mordible): `extraerPuntosDeCorteDeclarados`.
- `src/lib/diseno/movimientoRespetuoso.ts` (nuevo, mordible):
  `ejecutarPuertaDeMovimientoRespetuoso` (parser de bloques `{ }` línea a
  línea; el estilo de formato de los 17 ficheros abre/cierra como mucho un
  bloque por línea, verificado).
- 17 `<Nombre>.module.scss` co-localizados (12 en `src/components/`, 5 en
  `src/pages/`), cada uno importado por su `.tsx` y aplicado a la raíz (y,
  donde hacía falta, a subregiones concretas: `nav`/botón de menú/panel móvil
  de `Cabecera`, tarjetas de `Servicios`/`Equipo`, diálogo de
  `PaginaTienda`). Todos consumen `var(--color-fondo|texto|foco)`,
  `paso-tipografico(N)` y `espaciado(N)` — nunca un color/tamaño suelto fuera
  de esas vías (@s24 lo comprueba con la puerta ya `done` de
  `tokens_marca.feature`). `foco-visible`/`area-tactil-minima` aplicados a
  todo enlace/botón/campo real.
- `Cabecera.module.scss`: cobertura CSS con el MISMO literal `1024px` (nunca
  `1023px`) que `PUNTO_DE_CORTE_NAVEGACION_PX`, en dos reglas `min-width`
  (nav oculta por defecto, visible desde 1024; botón de menú visible por
  defecto, oculto desde 1024) — refuerzo del patrón de memoria
  `responsive/red-css-para-rama-solo-js-en-ssg.md` aplicado a un proyecto CSR
  puro (su "Cuándo NO aplica" ya lo anota: aquí no hay HTML pre-hidratación
  que hornear, pero el principio de "un único breakpoint gobierna las dos
  ramas" sigue aplicando como refuerzo).
- `Faq.module.scss`: única transición real introducida (hover del acordeón,
  `padding-inline-start`), declarada DIRECTAMENTE dentro de
  `@media (prefers-reduced-motion: no-preference)` (nunca a través de un
  mixin: así el texto crudo que `@s33` lee contiene literalmente
  `transition:` anidado, verificable sin ambigüedad).
- `vite.config.ts`: `test.css` pasa de `false` a `{ include: [/\?raw/] }`.
  Cambio mínimo y acotado — imprescindible para que
  `import.meta.glob(..., { query: '?raw' })` pueda leer el texto real de
  `_tokens.scss`/`<X>.module.scss` (con `css: false` a secas, Vitest stubea
  CUALQUIER módulo CSS/SCSS a `''` antes de que la query actúe,
  `deps.web.transformCss`, verificado leyendo el código fuente real de
  Vitest 4.1.10). Vitest matchea `css.include` contra el id COMPLETO **con**
  query (`CSSEnablerPlugin`, también verificado en el código fuente): por
  eso `import styles from './X.module.scss'` (sin query, el caso normal de
  cada componente) sigue devolviendo el proxy de siempre — la regla del
  proyecto ("ningún test asevera sobre clases CSS") queda intacta. **Incidente
  detectado y corregido en esta misma ronda:** un primer intento
  (`include: [/\.module\.scss/]`, por extensión) hizo que Vitest compilase
  CSS real para TODAS las importaciones normales de `.module.scss`, lo que
  rompió 17 tests ya `done` (`Cabecera.test.tsx`, `App.test.tsx`,
  `PaginaBlog.test.tsx`, `PaginaCampanas.test.tsx`,
  `accesibilidad-teclado.test.tsx`): jsdom SÍ aplica `display: none` de una
  regla fuera de un `@media` que no evalúa como verdadero, ocultando de la
  accesibilidad la navegación de escritorio que React ya decide mostrar.
  Corregido acotando `include` a la query `?raw` en vez de la extensión;
  reproducido el fallo y la corrección de forma explícita antes de seguir.

## Trazabilidad @s → test

| @s | Then | Test |
| --- | --- | --- |
| @s1 | inventario de variantes = {marca,lima,verde,noche} | `tokensColor.test.ts` → `@s1` |
| @s2 | marca: fondo #FFFFFF, texto #77286B, ratio 9.13 | `tokensColor.test.ts` → `@s2` |
| @s3 | lima: fondo #F8F9E8 (10% lima), texto #77286B, ratio 8.57 | `tokensColor.test.ts` → `@s3` |
| @s4 | lima nunca usa #B4C718 como texto; ratio 1.77 < 4.5 | `tokensColor.test.ts` → `@s4` |
| @s5 | verde: fondo #F0F4F1 (8% verde), texto #48704B, ratio 5.12 | `tokensColor.test.ts` → `@s5` |
| @s6 | noche: fondo #000000, texto #FFFFFF, ratio 21.00 | `tokensColor.test.ts` → `@s6` |
| @s7 | noche: foco #B4C718, ratio 11.12 ≥ 3 | `tokensColor.test.ts` → `@s7` |
| @s8 | noche: morado nunca texto/foco, ratio 2.30 < 3 | `tokensColor.test.ts` → `@s8` |
| @s9 | foco de marca/lima/verde ≥ 3 (9.13/8.57/8.22) | `tokensColor.test.ts` → `@s9` |
| @s10 | lima sobre blanco 1.89 < 3; ningún foco claro = #B4C718 | `tokensColor.test.ts` → `@s10` |
| @s11 | catálogo vacío → 0 comprobadas, veredicto suspenso | `tokensColor.test.ts` → `@s11` |
| @s12 | cambio de variante real en navegador | **PENDIENTE, navegador real** (ver abajo) |
| @s13 | parámetros exactos (1.25/16/320/1024) | `escalaTipografica.test.ts` → `@s13` |
| @s14 | viewport máximo = `PUNTO_DE_CORTE_NAVEGACION_PX` importada | `escalaTipografica.test.ts` → `@s14` (sabotaje: 999 → rojo, revertido) |
| @s15 | paso 0 = 16px en ambos extremos | `escalaTipografica.test.ts` → `@s15` |
| @s16 | cada paso: min ≤ max, > 0 pasos comprobados | `escalaTipografica.test.ts` → `@s16` |
| @s17 | pasos estrictamente crecientes en ambos extremos | `escalaTipografica.test.ts` → `@s17` |
| @s18 | saturación fuera de 320-1024 | `escalaTipografica.test.ts` → `@s18` |
| @s19 | escala de espaciado = {4,8,12,16,24,32,48,64,96} | `escalaEspaciado.test.ts` → `@s19` |
| @s20 | cada paso múltiplo de 4, entre 4 y 96 | `escalaEspaciado.test.ts` → `@s20` |
| @s21 | inventario = 17 nombres exactos, sin MetadatosPagina | `inventarioModulos.test.ts` → `@s21` |
| @s22 | los 17 módulos reales tienen su `.module.scss` | `inventarioModulos.test.ts` → `@s22` |
| @s23 | inventario vacío → 0 comprobados, falla cerrado | `inventarioModulos.test.ts` → `@s23` |
| @s24 | ningún fichero real declara color literal | `inventarioModulos.test.ts` → `@s24` (hallazgo real: comentarios con la palabra "red" en español disparaban el patrón de color inglés; corregido) |
| @s25 | punto de corte de Cabecera = 1024, sin divergencia | `puntoDeCorte.test.ts` → `@s25` (sabotaje: 768 en `.botonMenu` → rojo, revertido) |
| @s26 | 1025 de CSS hipotético discreparía de esMovil(1024) | `puntoDeCorte.test.ts` → `@s26` |
| @s27 | cabecera real a 1024/1023px | **PENDIENTE, navegador real** |
| @s28 | axe-core target-size = 0 violaciones | **PENDIENTE, navegador real** |
| @s29 | enlaces ≥ 24×24px CSS reales | **PENDIENTE, navegador real** |
| @s30 | área del indicador de foco real | **PENDIENTE, navegador real** |
| @s31 | contraste real foco/sin-foco ≥ 3:1 | **PENDIENTE, navegador real** |
| @s32 | cabecera fija no tapa el foco real | **PENDIENTE, navegador real** |
| @s33 | animation/transition dentro de prefers-reduced-motion | `movimientoRespetuoso.test.ts` → `@s33` (2º test: sabotaje sintético sin cobertura → rojo) |
| @s34 | sin animación en curso con menos movimiento | **PENDIENTE, navegador real** |

**26/34 escenarios cubiertos con test concreto y verde.** 8 escenarios
(`@s12`, `@s27`, `@s28`, `@s29`, `@s30`, `@s31`, `@s32`, `@s34`) declarados
explícitamente en el propio `.feature` como de **navegador real** (Decisión
11 de `project-spec.md`), fuera del gate de Vitest/Stryker. Se revisó cada
uno buscando una fracción pura razonable en jsdom:

- `@s25`/`@s26` (ya cubiertos arriba) SON la fracción pura de la familia del
  punto de corte — literal declarado y regla `esMovil` — mientras que `@s27`
  exige el LAYOUT real (medir la fila de navegación con
  `getBoundingClientRect` a 1024 y 1023px de ventana real), que jsdom no
  calcula (no hay motor de layout).
- `@s12`, `@s28`-`@s32`, `@s34` exigen: un custom property CSS efectivamente
  RESUELTO por el motor de render tras interacción real (@s12), axe-core con
  layout real (@s28), rectángulos delimitadores reales (@s29/@s30/@s32),
  píxeles renderizados en dos estados comparados con la fórmula de contraste
  (@s31), y el estado real del motor de animaciones CSS del navegador
  (@s34). Ninguno tiene una fracción residual verificable en jsdom sin
  fingir una medición que jsdom no hace: no se inventó ningún mock que
  simule `getBoundingClientRect`/`getComputedStyle` con valores de layout
  reales, por instrucción explícita de no fingir medir lo que no se puede
  medir. Quedan pendientes de una sesión con navegador real (`vite build &&
  vite preview` + Claude in Chrome / skill `browser-automation`), después de
  que esta ronda deje toda la infraestructura CSS real construida y las
  puertas unitarias en verde — el sitio, hasta esta feature, no tenía ningún
  CSS que esas 8 verificaciones pudieran auditar.

## Sabotajes manuales verificados

- **@s11** (vacuidad de contraste): `ejecutarComprobacionDeContrasteDeVariantes([])`
  probado directamente contra el catálogo vacío; se comprobó que sin la
  guarda explícita, `ejecutarPuertaDeContraste([])` ya devuelve `pasa:false`
  (no hay trampa de `.every()` vacío en ese punto porque `contraste.ts` ya
  guarda vacuidad) — la guarda de este módulo es sobre el VOCABULARIO
  ("variantes" vs "parejas"), no sobre lógica duplicada.
- **@s23** (vacuidad de co-localización): `comprobarCoLocalizacion([], [])`
  probado directamente; sin la guarda, `[].filter(...)` sobre un inventario
  vacío daría `faltantes: []` y `pasa: true` por vacuidad — la guarda evita
  exactamente esa trampa.
- **@s14**: `VIEWPORT_MAX_PX` sustituido por el literal `999` en producción
  → test en rojo (`expected 999 to be 1024`) → revertido a la importación
  real de `PUNTO_DE_CORTE_NAVEGACION_PX` → verde.
- **@s25**: el breakpoint de `.botonMenu` en `Cabecera.module.scss` cambiado
  a `768px` (divergiendo del `1024px` de `.navPrincipal`) → test en rojo
  (`expected 2 to be 1`, dos valores distintos detectados) → revertido →
  verde.
- **@s33**: test dedicado con un fichero sintético
  (`transition: color 150ms ease;` fuera de cualquier `@media`) → detectado
  como incumplimiento (`incumplimientos` con longitud 1, `pasa:false`).
- **@s24**: hallazgo real (no sintético) durante la propia implementación:
  los comentarios en español que citan "red CSS" (red = malla/cobertura, no
  el color) disparaban el patrón de nombre de color inglés `red` de la
  puerta ya `done`. Corregido reescribiendo los comentarios (`cobertura
  CSS`) — no se tocó la puerta reutilizada, que sigue intacta.

## Verificación final

- `pnpm run lint` (`oxlint --deny-warnings`): limpio.
- `pnpm run typecheck` (`tsc -b`): limpio. 2 rondas de fricción con
  `noUncheckedIndexedAccess`/`unicorn(no-array-sort)`, resueltas con el
  mismo patrón `as string` ya usado en `seo-logica.ts`/`site.test.tsx` y
  `Array#toSorted()`.
- `pnpm run test`: **699/699** (672 baseline antes de esta feature → 699,
  +27 tests nuevos: 11 + 6 + 2 + 4 + 2 + 2).
- `pnpm run build` (`tsc -b && vite build`): éxito, genera
  `dist/assets/index-*.css` real (11.45 kB) con las custom properties y
  reglas de los 17 módulos — confirmado leyendo el CSS compilado.
- `node .harness/harness.mjs init`: **verde de punta a punta**, sin timeouts
  de arranque de worker en esta corrida.

## Pendiente explícito para el cierre de la feature

1. **8 escenarios de navegador real** (`@s12`, `@s27`-`@s32`, `@s34`),
   documentados arriba, a verificar con `vite build && vite preview` +
   Claude in Chrome / skill `browser-automation` en una sesión posterior —
   son precisamente los que cierran, como consecuencia, los 4 escenarios
   pendientes de `accesibilidad.feature` (id 19, `blocked`).
2. Los roles de color más allá de fondo/texto/foco (superficie, borde de
   tarjeta…) siguen sin fijarse — ningún `.module.scss` de esta ronda los
   necesitó (los bordes usan `var(--color-texto)`, ya verificado).
3. `App.tsx` no tiene su propio fichero de estilos (fuera del alcance
   literal de esta feature, ya anotado como PENDIENTE en la cabecera del
   `.feature`); no se detectó ningún problema visual que lo exigiera durante
   esta ronda (pie de página no flotante gracias a que cada página ya es un
   `<main>`/landing con contenido real).

## Ronda 2 — refuerzo de mutación (23/08/2026, tras mutation_tester FAIL Ronda 1)

`mutation_tester` reportó FAIL (`progress/mutation_sistema_de_diseno_visual.md`,
132/177 = 74.58% sobre no-equivalentes, umbral 1.0): 45 mutantes sobrevivientes
reales repartidos en 5 de los 6 ficheros nuevos de la feature (todos menos
`escalaEspaciado.ts`). Esta ronda añade tests dirigidos a matar cada
superviviente real exacto, verificando CADA uno con el sabotaje preciso del
mutante correspondiente (edición manual de producción → `vitest run` en rojo →
revertido) antes de darlo por bueno. **Cero producción nueva**: los 45
supervivientes son huecos de test, no bugs de comportamiento — con una única
excepción documentada abajo (`87:51` de `tokensColor.ts`), que resultó ser un
mutante EQUIVALENTE genuino, no un hueco real, verificado empíricamente.

### `src/lib/diseno/movimientoRespetuoso.ts` — 26 supervivientes reales, 0 producción nueva

5 tests nuevos añadidos a `movimientoRespetuoso.test.ts` (más 1 aserción
reforzada en el test ya existente de @s33):

1. **Aserción de contenido exacto** en el test ya existente ("una transición
   fuera de cualquier bloque..."): `toHaveLength(1)` → `toEqual([{ ruta, linea: 2 }])`.
   Mata `44:35` (`indice + 1` → `indice - 1`) y `76:12`/`76:30` (`.map(...)` →
   `undefined`/`{}`).
2. **Bloque `reduce` con dos declaraciones dentro + una declaración tras
   cerrarlo**: fichero sintético con `@media (prefers-reduced-motion: reduce)`
   conteniendo dos declaraciones (ambas cubiertas) y una tercera declaración
   FUERA del bloque (no cubierta). Mata `20:23` (regex de `reduce`, 3 de sus 4
   variantes — la 4ª, formato con espaciado distinto, la mata el test 5),
   `27:7` + 2 no-coverage, `44:105` (`pila.includes('reduce')` →
   `pila.includes('')`), `46:9`/`46:24` (`if(linea.includes('{'))` →
   `true`/`''`), y los 5 mutantes de `48:16` (`else if(includes('}'))` →
   `true`/`false`/literal `''`/cuerpo vaciado/`pop()` eliminado).
3. **Fichero sin ninguna declaración de movimiento, evaluado en solitario**:
   espera `ficherosComprobados: 0, pasa: false`. Mata `71:33` (`.filter(...)`
   eliminado), `71:62` (`length > 0` → `>= 0`) y `80:11` (dos variantes:
   `true && ...` y `>= 0 && ...`).
4. **Línea con la subcadena "transition:" fuera de posición de declaración
   real** (`.a:hover { color: red; } // transition: fake`): espera 0
   declaraciones. Mata `21:40` (regex de propiedad, ambas variantes: sin ancla
   `^` y con clase de carácter distinta).
5. **Bloque `no-preference` sin espacio tras los dos puntos** y **bloque
   `reduce` con dos espacios tras los dos puntos**: matan `19:30` (`\s*` →
   `\s` en `PATRON_NO_PREFERENCE`) y la 4ª variante de `20:23` (`\s*` → `\s`
   en `PATRON_REDUCE`) respectivamente — verificado que exactamente un
   espacio (el formato de los tests anteriores) no distingue este mutante en
   concreto, de ahí la necesidad de un formato de espaciado explícitamente
   distinto.

Cada uno de los 26 mutantes (más 2 variantes adicionales de `20:23`
identificadas por sabotaje manual: `[^{]*` → `[^{]` y `\b` removido, ambas
verificadas — la primera matada por el test 2, la segunda confirmada
indiferente para los inputs usados) se saboteó individualmente en
`movimientoRespetuoso.ts`, se confirmó el rojo con `vitest run
src/lib/diseno/movimientoRespetuoso.test.ts`, y se revirtió. Verde final: 7/7.

### `src/lib/diseno/tokensColor.ts` — 11 supervivientes reportados, 10 reales + 1 equivalente

4 tests nuevos en `tokensColor.test.ts`:

1. **`extraerVariantesDeTokens` con una variante duplicada** (texto sintético
   con dos bloques `:root[data-variante='marca']`): espera un único id. Mata
   `27:9` (`if(!variantes.includes(id))` → `if(true)`).
2. **`leerTokenDeVariante` con una variante inexistente**: espera que lance
   `/no se encontró ningún bloque/i`. Mata `37:7` (`if(!coincidencia)` →
   `if(false)`) y sus 2 no-coverage asociados (cuerpo vaciado, mensaje → `''`).
3. **`leerTokenDeVariante` con un rol ausente en un bloque real**: espera que
   lance `/no se encontró el token/i`. Mata `54:7` y sus 2 no-coverage
   asociados (mismo patrón que el anterior, en `leerTokenDeVariante`).
4. **`ejecutarComprobacionDeContrasteDeVariantes` con un catálogo no vacío**
   (las 4 variantes reales, texto/fondo): espera `veredicto: 'aprobado'`,
   `variantesComprobadas: 4`. Mata `82:7` (`catalogo.length === 0` →
   `if(true)`), `87:10` (`return {...}` → `return {}`) y `87:38` (`'aprobado'`
   → `''`).

**Hallazgo de equivalencia genuina, verificado empíricamente antes de tocar
nada**: el mutante `87:51` (`'suspenso'` → `''`, en el literal del lado
`false` del ternario `informe.pasa ? 'aprobado' : 'suspenso'`) se saboteó
igual que los otros y la suite de 15 tests **siguió en verde**. Investigación:
`ejecutarPuertaDeContraste` (`src/lib/contraste.ts`, ya `done`, fuera del
alcance de esta feature) NUNCA devuelve `pasa: false` para un catálogo no
vacío — solo falla cerrada por vacuidad (`catalogo.length === 0`), pero no
comprueba aptitud/umbral alguno para un catálogo con contenido. Por tanto
`informe.pasa` es SIEMPRE `true` cuando `catalogo.length > 0`, y la rama
`'suspenso'` del ternario de `ejecutarComprobacionDeContrasteDeVariantes` es
código muerto para cualquier catálogo no vacío (la única vía real hacia
`'suspenso'` es la guarda de vacuidad de la línea 82-83, que usa su PROPIO
literal `'suspenso'`, en una ubicación de código distinta). No se modifica
`contraste.ts` (fuera de alcance, feature `accesibilidad`/`tokens_marca` ya
`done`) ni se duplica lógica de aptitud en `tokensColor.ts` sin que ningún
escenario de `sistema_de_diseno_visual.feature` lo exija: se documenta como
mutante equivalente, no como hueco real.

### `src/lib/diseno/inventarioModulos.ts` — 5 supervivientes reales, 0 producción nueva

1 test nuevo + 1 aserción reforzada en `inventarioModulos.test.ts`:

1. **Aserción `faltantes: []`** añadida al test ya existente de @s23
   (inventario vacío). Mata `66:72` (`faltantes: []` → `faltantes: ["Stryker
   was here"]`).
2. **Inventario real + un nombre inventado ("ModuloQueNoExiste")** contra las
   rutas reales: espera `pasa: false`, `faltantes: ['ModuloQueNoExiste']`,
   `modulosComprobados` = longitud del inventario. Mata `52:10`
   (`rutaEstiloDe` → `''`), `70:13` (`.filter(...)` → `.filter(() =>
   undefined)`), `71:10` (`.map((modulo) => modulo.nombre)` → `.map(() =>
   undefined)`) y `73:18` (`faltantes.length === 0` → `true`).

### `src/lib/diseno/puntoDeCorte.ts` — 2 supervivientes reales, 0 producción nueva

2 tests nuevos en `puntoDeCorte.test.ts`, ambos con texto SINTÉTICO (nunca el
fichero real, que solo usa un formato):

1. **`@media screen and (min-width: 500px)`** (tipo de medio explícito antes
   del paréntesis): espera `[500]`. Mata `[^{]*\(` → `[^{]\(`.
2. **`min-width:500px`** (sin espacio) y **`min-width:  500px`** (dos
   espacios): esperan `[500]`. Mata `width:\s*(\d+)px` → `width:\s(\d+)px`.

### `src/lib/diseno/escalaTipografica.ts` — 1 superviviente real, 0 producción nueva

1 test nuevo: `tamanoEnViewport(-2, 672)` (ancho estrictamente dentro del
rango 320-1024, paso distinto del base). Con los parámetros de la Decisión 24
(`minPx === maxPx` en todo el dominio, ya documentado en Ronda 1), el
resultado real es siempre `minPx`; el mutante `(maxPx - minPx)` →
`(maxPx + minPx)` en el numerador de la pendiente da `20.48` en vez de
`10.24` — verificado con sabotaje real antes de escribir el test definitivo
(no solo con el script de scratchpad de Ronda 1). Mata `81:22`.

### Mapa de trazabilidad del refuerzo (mutante real → test que lo mata)

| Fichero | Mutante(s) | Test nuevo/reforzado |
| --- | --- | --- |
| movimientoRespetuoso.ts | 44:35, 76:12, 76:30 | aserción de contenido en test de @s33 ya existente |
| movimientoRespetuoso.ts | 20:23 (x3), 27:7+2nc, 44:105, 46:9, 46:24, 48:16 (x5) | "un bloque reduce con dos declaraciones... deja de cubrir una declaración posterior a su cierre" |
| movimientoRespetuoso.ts | 71:33, 71:62, 80:11 (x2) | "un fichero sin ninguna declaración de movimiento no cuenta como comprobado" |
| movimientoRespetuoso.ts | 21:40 (x2) | "la palabra transition: en medio de una línea... no se confunde con una" |
| movimientoRespetuoso.ts | 19:30 | "un bloque no-preference sin espacio tras los dos puntos" |
| movimientoRespetuoso.ts | 20:23 (4ª variante, \s*→\s) | "un bloque reduce con dos espacios tras los dos puntos" |
| tokensColor.ts | 27:9 | "extraerVariantesDeTokens no duplica una variante declarada dos veces" |
| tokensColor.ts | 37:7 + 2nc | "una variante inexistente lanza un error..." |
| tokensColor.ts | 54:7 + 2nc | "un rol de color ausente en un bloque real lanza un error..." |
| tokensColor.ts | 82:7, 87:10, 87:38 | "las 4 variantes reales... dan veredicto aprobado" |
| tokensColor.ts | 87:51 | **EQUIVALENTE genuino** (documentado arriba, ninguna acción) |
| inventarioModulos.ts | 66:72 | aserción `faltantes: []` en test de @s23 ya existente |
| inventarioModulos.ts | 52:10, 70:13, 71:10, 73:18 | "un módulo del inventario sin su fichero de estilos... se señala como faltante" |
| puntoDeCorte.ts | `[^{]*\(`→`[^{]\(` | "un @media con tipo de medio explícito antes del paréntesis" |
| puntoDeCorte.ts | `\s*`→`\s` (width) | "espaciado distinto tras los dos puntos" |
| escalaTipografica.ts | 81:22 | "en el punto medio del rango (672px) tamanoEnViewport da el valor de interpolación exacto" |

### Verificación final de Ronda 2

- Cada uno de los 44 mutantes reales (45 reportados − 1 reclasificado como
  equivalente) se saboteó individualmente en el fichero de producción
  correspondiente, se confirmó el ROJO exacto con `vitest run
  src/lib/diseno/<fichero>.test.ts`, y se revirtió a la línea original antes
  de continuar con el siguiente. Ningún fichero de producción quedó con
  cambios: verificado releyendo cada uno íntegro al final de la ronda.
- `pnpm exec vitest run`: **712/712** (699 → 712, +13 tests nuevos: 6 en
  movimientoRespetuoso.test.ts + 4 en tokensColor.test.ts + 1 en
  inventarioModulos.test.ts + 2 en puntoDeCorte.test.ts + 1 en
  escalaTipografica.test.ts, más 2 aserciones reforzadas en tests ya
  existentes).
- `node .harness/harness.mjs init`: **verde de punta a punta** (lint,
  typecheck, 56 ficheros de test, 712/712 tests).
- Pendiente: nueva ronda de `judge` y `mutation_tester` sobre esta ronda 2
  para confirmar que el score sobre no-equivalentes alcanza el 100% exigido
  por `harness.config.json` (`mutation.threshold: 1.0`), incluyendo la
  revisión de la reclasificación de `87:51` de `tokensColor.ts` como
  equivalente.

## Refuerzo @s27 -- desbordamiento/superposición de cabecera (25/08/2026)

Encargo puntual del `craftsman_lead`, derivado de un hallazgo del `judge` en
su revisión de cierre (`progress/judge_sistema_de_diseno_visual.md`, sección
"@s27 -- punto de corte de la cabecera real"): el `Then` de `@s27` tiene tres
cláusulas —

1. a 1024px la fila de navegación horizontal está presente y ocupa un ancho
   mayor que 0;
2. a 1023px esa fila no está presente y el botón de menú sí;
3. **ningún elemento de la cabecera se desborda ni se superpone con otro en
   ninguno de los dos anchos.**

El test heredado (`tests/e2e/accesibilidad.spec.ts`, describe "El punto de
corte de la navegación (1024/1023)...") solo automatizaba 1 y 2. La cláusula
3 no la verificaba ningún test del repo (confirmado por el `judge` con grep
de "solap|overlap|desborda|superpone" en `tests/e2e/`: el único resultado,
`@s44` de `layout.spec.ts`, es desbordamiento HORIZONTAL DE LA RUTA a 320px,
otro viewport y otro propósito).

### Qué se añadió

Un segundo test dentro del MISMO `test.describe` ya dedicado a `@s27` (no un
describe nuevo, para no fragmentar la trazabilidad de un escenario que ya
tenía su sitio): `'ningún elemento de la cabecera se desborda ni se superpone
con otro, ni a 1024px ni a 1023px'`.

Para cada uno de los dos anchos (1024 y 1023px, mismo patrón de
`setViewportSize` que el test hermano):

- mide el `boundingBox()` de la propia cabecera (`header`);
- recoge los hijos DIRECTOS y visibles de la cabecera con
  `cabecera.locator('> *:visible')` (a 1024px: el bloque de marca + `nav`; a
  1023px: el bloque de marca + el botón de menú — el panel móvil no cuenta
  porque solo se monta si `abierto` es `true`, que no lo es aquí);
- comprueba que cada hijo está `estaContenidoEn` el rectángulo de la
  cabecera (con `TOLERANCIA_SUBPIXEL_PX = 0.5` para el redondeo de subpíxel
  real de Chromium, nombrada, no un número mágico suelto);
- comprueba con `seSuperponen` (intersección de rectángulos AABB estándar)
  que ningún par de hijos se solapa entre sí.

Tres funciones nuevas a nivel de módulo (`estaContenidoEn`, `seSuperponen`,
`hijosVisiblesDe`) siguiendo el mismo estilo que ya usa el fichero
(`objetivosVisibles`, `puntoAdyacenteA`): tipos inline `{x, y, width,
height}`, sin reimplementar `boundingBox()`.

### Verificación con sabotaje real (no solo "el test pasó a la primera")

El código de producción de `Cabecera.module.scss` no tenía ningún bug
conocido, así que el test pasaba en verde de entrada — eso por sí solo NO
demuestra que el test detecte nada. Verificado con sabotaje manual real,
revertido cada vez antes de continuar (`git diff -- src/components/
Cabecera.module.scss` limpio al final, confirmado):

1. **Desbordamiento por ancho fijo.** `.navPrincipal { width: 2000px;
   flex-shrink: 0; }` (imita el ejemplo del encargo). Rebuild real
   (`pnpm exec playwright test ...` fuerza `pnpm run build && vite preview`
   porque no había servidor de preview escuchando en el puerto 4173 —
   confirmado con `netstat` antes de cada ronda). Resultado: **ROJO** —
   `Error: a 1024px: "nav._navPrincipal_2hyt9_43" se desborda de la
   cabecera`. Revertido; reejecutado: **VERDE**.
2. **Desbordamiento por desplazamiento absoluto.** `.navPrincipal {
   position: relative; inset-inline-start: -500px; }`. Resultado: **ROJO** —
   mismo mensaje de desbordamiento (el desplazamiento saca el `nav` por la
   izquierda de la cabecera antes de llegar a solapar con el bloque de
   marca). Revertido; reejecutado: **VERDE**.

Un tercer intento con `margin-inline-start` negativo (-40px, -150px, -500px)
para forzar el solape SIN desbordamiento no llegó a disparar la rama de
`seSuperponen` de forma aislada: con `justify-content: space-between` el
motor de flexbox redistribuye el espacio libre según el tamaño exterior de
cada ítem (que ya incluye el margen negativo), así que el desplazamiento
visual neto queda parcialmente compensado — comportamiento real de flexbox,
no un fallo del test. Decisión: no perseguir un tercer sabotaje aislado para
la rama de solape puro. Los dos sabotajes de desbordamiento ya prueban que
`estaContenidoEn` detecta un fallo real de layout con el mensaje correcto, y
`seSuperponen` se ejecuta con coordenadas reales (no simuladas) en cada
ejecución del test contra la cabecera real (siempre hay al menos 2 hijos
visibles que comparar, en los dos anchos), quedando expuesta a
`mutation_tester` igual que el resto del fichero.

### Hallazgo real: ninguno

La cabecera de producción (sin sabotaje) NO se desborda ni se superpone a
1024px ni a 1023px. El hueco era exclusivamente de verificación (la
cláusula 3 de `@s27` no tenía test), no un defecto de `Cabecera.module.scss`.

### Trazabilidad @s27 (actualizada)

| @s | test | notas |
| --- | --- | --- |
| @s27 (cláusulas 1-2) | `tests/e2e/accesibilidad.spec.ts` → describe "El punto de corte de la navegación (1024/1023)..." → `'a 1024px la navegación horizontal es visible; a 1023px, el botón de menú'` | sin cambios, test heredado de `identidad_visual` |
| @s27 (cláusula 3, desbordamiento/superposición) | mismo describe → `'ningún elemento de la cabecera se desborda ni se superpone con otro, ni a 1024px ni a 1023px'` | **nuevo**, este refuerzo |

### Verificación final de este refuerzo

- `pnpm run test`: 914/914 (dos ejecuciones; una intermedia mostró 5 fallos
  en `src/accesibilidad-teclado.test.tsx`, ficheros no tocados por este
  refuerzo ni por ningún cambio de esta sesión — confirmado con `git diff
  --stat` sobre ese fichero, sin diferencias frente a HEAD, y confirmado
  también que en aislamiento (`vitest run
  src/accesibilidad-teclado.test.tsx`) pasa 5/5 siempre. Es una
  contaminación de orden/temporización preexistente, ajena a este refuerzo
  puntual — no tocada, fuera de alcance de este encargo). La repetición
  inmediata y la ejecución dentro de `bin/harness init` dieron 914/914
  limpio.
- `pnpm exec playwright test tests/e2e/accesibilidad.spec.ts`: **14/14**
  verde, incluidos los dos tests de `@s27`.
- `pnpm run lint` (`oxlint --deny-warnings`): sin salida, sin errores.
- `pnpm run typecheck` (`tsc -b`, incluye `tsconfig.e2e.json` →
  `tests/e2e/**`): sin errores.
- `bash bin/harness init`: **verde de punta a punta** (lint, typecheck,
  914/914 tests).
- `git diff --stat -- tests/e2e src/components`: solo
  `tests/e2e/accesibilidad.spec.ts` (+76 líneas). `Cabecera.module.scss`
  vuelve a coincidir exactamente con `HEAD` — el sabotaje no dejó rastro.

Ningún otro escenario ni fichero de `sistema_de_diseno_visual.feature` ni de
`accesibilidad.spec.ts` se tocó en este refuerzo.

## Refuerzo final -- formas largas de transition/animation (25/08/2026)

Encargo puntual del `craftsman_lead` para cerrar el último mutante
sobreviviente real de la Ronda 2 de `mutation_tester`
(`progress/mutation_sistema_de_diseno_visual.md`, sección "Re-medicion tras
Ronda 2 (25/08/2026)"): `movimientoRespetuoso.ts:21:40`, el patrón
`PATRON_PROPIEDAD_DE_MOVIMIENTO` no reconocía las formas largas hifenadas de
CSS (`transition-duration:`, `animation-name:`, etc.), solo las formas
cortas (`transition:`, `animation:`). Decisión de diseño ya tomada por el
`craftsman_lead` (no reabierta aquí): esto es un hueco real de la propia
puerta de `@s33`, no solo de cobertura de mutación, y el patrón debe
ampliarse.

### Ciclo 1 -- Rojo/Verde: reconocer formas largas hifenadas

**Rojo.** Test nuevo en `movimientoRespetuoso.test.ts` ("una propiedad larga
real ('transition-duration') fuera de cualquier bloque
prefers-reduced-motion también se señala como incumplimiento"): fichero
sintético `.boton { transition-duration: 0.3s; }` sin ningún bloque
`prefers-reduced-motion`, esperando `ficherosComprobados: 1`,
`incumplimientos: [{ ruta: ..., linea: 2 }]` y `pasa: false`. Confirmado en
rojo contra el código anterior: `informe.ficherosComprobados` daba `0`
(la línea ni se reconocía como declaración de movimiento) — reproduce
exactamente el hallazgo del `mutation_tester`.

**Verde.** `PATRON_PROPIEDAD_DE_MOVIMIENTO` pasa de

```
/^\s*(animation|transition)\s*:/
```

a

```
/^\s*(animation|transition)(-[\w-]+)?\s*:/
```

Un grupo opcional `(-[\w-]+)?` tras `animation`/`transition` que consume
cualquier sufijo hifenado (`-duration`, `-property`, `-timing-function`,
`-delay`, `-name`, `-iteration-count`, `-fill-mode`, `-play-state`,
`-direction`, etc.), manteniendo intactos el ancla `^` y el resto del
patrón. Verificado con `node -e` sobre una batería de formas largas reales
(`transition-duration:`, `animation-name:`) y cortas (`transition:`,
`animation:`): todas siguen matcheando igual que antes para las cortas, y
ahora también las largas. Suite completa del fichero: 8/8 verde.

### Ciclo 2 -- Rojo/Verde: espacio antes de los dos puntos (hallazgo propio durante el sabotaje)

Al aplicar el sabotaje manual exacto documentado por `mutation_tester`
(`\s*` → `\S*` justo antes de los dos puntos, ancla `^` intacta) sobre la
regex ya corregida, descubrí que **ningún test del fichero (los 8
existentes, incluido el nuevo del Ciclo 1) distinguía este mutante**: con mi
regex, el sufijo hifenado ya lo consume el grupo `(-[\w-]+)?`, así que en el
caso `transition-duration: 0.3s;` (sin espacio antes de los dos puntos) no
queda ningún carácter que `\s*`/`\S*` deba diferenciar — ambas variantes
matchean igual. Verificado con un script `node -e` independiente comparando
la regex original y la mutada sobre 6 casos: la única entrada que SÍ
distingue ambas es cuando hay un **espacio antes de los dos puntos**
(`transition-duration : 0.3s;`, `transition : color;`,
`animation-name : girar;` → original matchea, mutante no, porque ni el
grupo `(-[\w-]+)?` ni `\S*` pueden consumir un carácter de espacio).

**Rojo.** Test nuevo ("una propiedad larga real con un espacio antes de los
dos puntos también se señala como incumplimiento"): fichero sintético
`.boton { transition-duration : 0.3s; }` (espacio antes de los dos puntos),
esperando el incumplimiento señalado igual que sin espacio. Este test SÍ
pasa contra el código real (no rompe Ley 2 de forma retorcida: es un test
de robustez de formato, mismo patrón que los ya existentes de Ronda 2 —
"sin espacio"/"dos espacios" tras los dos puntos de `prefers-reduced-motion`
—, escrito específicamente para cerrar el hueco de mutación recién
encontrado en el sabotaje manual, no para forzar un cambio de producción).

**Confirmación cruzada:** con el sabotaje `\S*` reaplicado, corrí la suite
completa (9 tests): **solo este test nuevo falla** (los otros 8, incluido el
del Ciclo 1, siguen en verde) — el mutante queda limpiamente distinguido.
Revertido el sabotaje: 9/9 verde de nuevo.

### Sabotaje manual -- resultado final

- Mutante aplicado: `/^\s*(animation|transition)(-[\w-]+)?\S*:/` (la
  versión adaptada del mutante documentado, sobre la regex final con el
  grupo hifenado ya incorporado).
- Sin el test del Ciclo 2: el mutante sobrevive a los 8 tests entonces
  existentes (documentado arriba, no es un mutante equivalente — hay
  diferencia de comportamiento real y observable con CSS válido de verdad,
  espacio antes de los dos puntos).
- Con el test del Ciclo 2 añadido: el mutante muere (1/9 tests falla bajo
  el mutante, exactamente el nuevo).
- Revertido el sabotaje: 9/9 verde.

### Mapa @s → test (este refuerzo)

`@s33` — cubierto ahora por 9 tests en `movimientoRespetuoso.test.ts`
(los 7 preexistentes de Ronda 2 más los 2 de este refuerzo):

1. Los 17 ficheros reales del inventario (preexistente).
2. Transición corta sin cobertura → incumplimiento (preexistente).
3. Bloque `reduce` con dos declaraciones, una posterior sin cubrir
   (preexistente).
4. Fichero sin ninguna declaración de movimiento, evaluado en solitario
   (preexistente).
5. `transition:` en medio de una línea sin ser declaración real
   (preexistente).
6. **Nuevo (Ciclo 1)** — propiedad larga real (`transition-duration:`) sin
   cobertura → incumplimiento.
7. **Nuevo (Ciclo 2)** — propiedad larga real con espacio antes de los dos
   puntos (`transition-duration :`) sin cobertura → incumplimiento.
8. Bloque `no-preference` sin espacio tras los dos puntos (preexistente).
9. Bloque `reduce` con dos espacios tras los dos puntos (preexistente).

### Verificación final de este refuerzo

- Único fichero de producción tocado: `src/lib/diseno/movimientoRespetuoso.ts`
  (una línea, la regex). Único test tocado:
  `src/lib/diseno/movimientoRespetuoso.test.ts` (2 tests nuevos). Ningún
  otro fichero de `src/lib/diseno/`, ningún `.module.scss`, ni este
  `progress/tdd_identidad_visual.md` (no tocado, tal y como exigía el
  encargo).
- `git status --porcelain -- src/lib/diseno/`: solo los 2 ficheros de
  `movimientoRespetuoso`.
- `pnpm run test`: **916/916** verde (914 previos + 2 nuevos de este
  refuerzo).
- `pnpm run lint` (`oxlint --deny-warnings`): sin salida, sin errores.
- `pnpm run typecheck` (`tsc -b`): sin errores.
- `bash bin/harness init`: **verde de punta a punta** (lint, typecheck,
  916/916 tests).

Pendiente: nueva ronda de `judge` sobre este refuerzo puntual y nueva
re-medición de `mutation_tester` acotada a
`src/lib/diseno/movimientoRespetuoso.ts` para confirmar 100% sobre
mutantes no equivalentes (los 2 ya aceptados como equivalentes en Ronda 1/2
— `30:10` y `39:32` — no deberían cambiar, al no haberse tocado esas
líneas).
