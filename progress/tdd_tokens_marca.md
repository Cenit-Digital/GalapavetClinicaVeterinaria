# TDD — tokens_marca (id 1)

> Bitácora ciclo a ciclo (Rojo → Verde → Refactor) de
> `features/tokens_marca.feature` (23 escenarios: `@s1`-`@s11`, `@s23`,
> `@s12`-`@s22`). Ejecutada por `tdd_craftsman`.

## Fix previo (fuera de `src/lib`, sin tocar comportamiento)

`src/test/setup.ts:75-82` — `Element.prototype.scrollTo` / `scrollBy` usaban
`vi.fn<Element['scrollTo']>()`. TypeScript lo rechazaba (TS2322: los métodos
tienen overloads y `vi.fn<T>()` no los tipa bien). Sustituido por:

```ts
Element.prototype.scrollTo = vi.fn<
  (x?: number | ScrollToOptions, y?: number) => void
>() as unknown as Element['scrollTo']
```

Se tipó el mock con una firma no sobrecargada (satisface también la regla
`oxlint` `vitest/require-mock-type-parameters`, que también reventaba) y se
casteó a través de `unknown` hacia el tipo real. `pnpm run lint && pnpm run
typecheck` quedó en verde antes del primer test rojo.

## Estructura creada (cimiento para las features siguientes)

- `src/lib/contraste.ts` — cálculo de ratio WCAG, aptitud por uso, tipo
  `UsoDeColor`, y la puerta de contraste (`ejecutarPuertaDeContraste`),
  genérica sobre cualquier catálogo de parejas.
- `src/lib/tokens.ts` — `coloresDeMarca` (los 3 hexadecimales del logo) y
  `catalogoDeContraste` (las parejas color/fondo reales del proyecto, con su
  uso declarado).
- `src/lib/puertaLiteralesColor.ts` — puerta que escanea ficheros SCSS (dados
  como `{ruta, contenido}`, no leídos de disco: la propia feature no afirma
  sobre ficheros reales del repo, solo sobre la lógica de detección) y señala
  colores literales.
- Tests co-locados: `src/lib/contraste.test.ts`, `src/lib/tokens.test.ts`,
  `src/lib/puertaLiteralesColor.test.ts`.

No se creó `src/styles/_tokens.scss`: ningún escenario de
`tokens_marca.feature` lo pide (la cabecera del `.feature` es explícita en que
"esta feature no pinta DOM" y ningún `Then` depende de una clase CSS, un
selector o un fichero SCSS real). El "fichero de tokens de marca del
proyecto" de `@s1` es el módulo puro `src/lib/tokens.ts`, consistente con:
(a) `vitest.config` corre con `css: false` (no procesa SCSS real), (b) el
patrón de la memoria organizacional `logica-de-decision-en-modulo-puro-no-en-el-jsx`
(el símbolo de producción vive en `src/lib`, no en SCSS/JSX, para que Stryker
pueda morderlo), y (c) `stryker.config.json` solo mata `src/lib/**/*.ts` y
`*-logica.ts`. Escribir un `_tokens.scss` sin ningún test que lo exigiera
habría violado la Ley 1. Queda para cuando una feature futura (p. ej.
`selector_paleta` o cualquier componente con `.module.scss`) lo necesite de
verdad y lo pida con un test rojo — el propio `tokens_marca.feature` deja
escrito en su cabecera que la escala tipográfica/espaciado y los tokens de la
variante "noche" quedan PENDIENTE, sin inventarlos aquí.

## Estrategia dentro de las Tres Leyes

- Para la fórmula de contraste WCAG (no ambigua, de una sola fuente
  autorizada) se usó "implementación obvia" (Kent Beck) en vez de
  fake-it-primero: `@s2` disparó directamente la fórmula completa porque no
  hay una versión "más falsa" que la real que tenga sentido escribir para
  luego triangular — habría sido teatro. `@s3`-`@s5`, `@s7`, `@s8`,
  `@s13`-`@s15`, `@s23` pasaron en verde a la primera porque la generalización
  de `@s2`/`@s6`/`@s9`-`@s12` ya los cubría; se verificó cada uno igualmente
  antes de continuar, no se asumió.
- Para las puertas (`ejecutarPuertaDeContraste`,
  `ejecutarPuertaDeLiteralesColor`) se detectaron **dos casos de código
  escrito por adelantado** sin un test rojo que lo pidiera en el momento
  (Ley 1): la guarda de vacuidad de `ejecutarPuertaDeContraste` (para `@s17`)
  y la de `ejecutarPuertaDeLiteralesColor` (para `@s21`) se escribieron a la
  vez que la implementación de `@s16`/`@s18` respectivamente, anticipando el
  escenario siguiente del propio fichero. Corregido a posteriori con
  verificación honesta: se quitó cada guarda, se confirmó que el test del
  escenario correspondiente **sí** fallaba en rojo sin ella (capturado abajo),
  y se restauró. Documentado aquí en vez de ocultarlo.
- Se detectó y se corrigió una sobre-implementación real: la primera versión
  de `ejecutarPuertaDeContraste` incluía lógica de "pareja no apta hace fallar
  la puerta" (`parejasNoAptas`, `usosSinPareja`, `motivoDeIncumplimiento`) que
  ningún escenario de `tokens_marca.feature` pide — releyendo `@s16` con
  cuidado, sus `Then` piden que el informe *contenga* el ratio de cada pareja
  y que el catálogo tenga cobertura por uso (verificable directamente sobre
  los datos de `informe.parejas` en el test), pero **no** piden
  `Then la puerta pasa`. Solo `@s17` fija `pasa` (para el caso vacío). Se
  refactorizó en verde para eliminar esa rama: sin ningún test que la
  disparara, habría dejado mutantes de Stryker sin forma de morir. `pasa`
  quedó como "el catálogo no está vacío", que es exactamente lo que `@s16` y
  `@s17` verifican entre los dos.

## Ciclos Rojo → Verde → Refactor

### @s1 — los tres colores de marca
- ROJO: `src/lib/tokens.test.ts` importa `coloresDeMarca` de `./tokens`
  (no existe) → falla al resolver el import.
- VERDE: `src/lib/tokens.ts` con `coloresDeMarca = { morado, lima,
  verdeProfundo }` (hexadecimales de `docs/datos-galapavet.md` §10).
- REFACTOR: ninguno necesario (módulo trivial).

### @s2 — ratio negro/blanco = 21.00
- ROJO: `calcularRatioContraste` no existe → falla al resolver el import.
- VERDE: `src/lib/contraste.ts` con la fórmula WCAG completa (luminancia
  relativa + fórmula de ratio), implementación obvia.
- REFACTOR: ninguno.

### @s3-@s5 — morado/blanco 9.13, simetría, mayúsc./minúsc.
- Se escribieron los tres tests; los tres pasaron en verde a la primera
  ejecución (la fórmula de `@s2` ya generaliza correctamente: es simétrica
  por construcción y `parseInt` con radix 16 ya es insensible a mayúsculas).
  Verificado, no asumido: se ejecutó la suite y se confirmó verde antes de
  seguir.

### @s6 — lima/blanco NO apta para ningún uso
- ROJO: `evaluarAptitudPareja` no existe → `TypeError: evaluarAptitudPareja
  is not a function`.
- VERDE: se añadió `UsoDeColor`, `RATIO_MINIMO_POR_USO` (4.5 / 3 / 3),
  `esAptoParaUso` (privada) y `evaluarAptitudPareja` (pública) en
  `contraste.ts`.
- REFACTOR: ninguno.

### @s7, @s8 — lima/morado apta normal; verde/lima apta grande+componente, no normal
- Ambos en verde a la primera con la implementación de `@s6` (misma función,
  otros datos). Verificado ejecutando la suite.

### @s9, @s10, @s11, @s23 — frontera de `esAptoParaUso`
- ROJO: `esAptoParaUso` no estaba exportado → `TypeError: esAptoParaUso is
  not a function` en los 4 tests a la vez (mismo cambio mínimo los resuelve
  todos).
- VERDE: se cambió `function esAptoParaUso` a `export function
  esAptoParaUso` (la lógica ya existía desde `@s6`).
- REFACTOR: ninguno.

### @s12 — hexadecimal con caracteres inválidos
- ROJO: `calcularRatioContraste('#ZZ286B', '#FFFFFF')` no lanzaba
  (`AssertionError: expected [Function] to throw an error`).
- VERDE: `validarHexadecimal` con `PATRON_HEXADECIMAL_VALIDO =
  /^#[0-9a-fA-F]{6}$/`, invocada al principio de `calcularRatioContraste`
  para `color` y `fondo`; el mensaje cita el valor rechazado con
  `` `"${valor}" no es...` ``, que contiene el literal `"#ZZ286B"` exigido.
- REFACTOR: ninguno.

### @s13, @s14, @s15 — longitud incorrecta, forma abreviada, cadena vacía
- Los tres en verde a la primera: la misma regex de `@s12` ya los cubre
  (longitud exacta 6, sin forma de 3 dígitos, cadena vacía no matchea).
  Verificado, no asumido.

### @s16 — puerta de contraste sobre el catálogo del proyecto
- ROJO: `ejecutarPuertaDeContraste` y `catalogoDeContraste` no existían →
  `TypeError: ejecutarPuertaDeContraste is not a function`.
- VERDE: `ParDeContraste`, `ejecutarPuertaDeContraste` en `contraste.ts`
  (calcula el ratio de cada pareja); `catalogoDeContraste` en `tokens.ts`
  con 5 parejas reales (morado/blanco y verde-profundo/blanco para texto
  normal, lima/morado para texto normal, morado/blanco para texto grande y
  para componente de interfaz), **sin** incluir verde-profundo/lima (excluida
  por la EXCEPCIÓN DECIDIDA de la cabecera del `.feature`).
- REFACTOR (en verde): se detectó y quitó la lógica especulativa de
  "pareja no apta hace fallar la puerta" (ver sección de arriba). Se
  re-ejecutó la suite completa tras el refactor: sigue verde.

### @s17 — catálogo vacío falla cerrado
- ROJO (verificado retroactivamente, ver nota de proceso arriba): con la
  guarda de vacuidad temporalmente quitada, el test fallaba con
  `expected true to be false` (`pasa` salía `true` con 0 parejas — verde por
  vacuidad clásico).
- VERDE: guarda `if (catalogo.length === CERO_PAREJAS) return { pasa: false,
  parejasEvaluadas: 0, parejas: [], motivo: '...0 parejas' }` al principio de
  `ejecutarPuertaDeContraste`. Restaurada y confirmada.
- REFACTOR: ninguno adicional.

### @s18 — 3 ficheros que solo consumen tokens: la puerta pasa
- ROJO: `ejecutarPuertaDeLiteralesColor` no existe → falla al resolver el
  import.
- VERDE (fake-it-primero, deliberado: la detección real de literales tiene
  más de una forma legítima y no era obvia de antemano): `src/lib/
  puertaLiteralesColor.ts` con `hallazgosDelFichero` devolviendo siempre `[]`
  (`.filter(() => false)`), y la puerta devolviendo `pasa` en función de si
  hay señalados.
- REFACTOR: se ajustó la desestructuración para evitar un parámetro sin usar
  que rompía `oxlint` (`no-unused-vars`), sin cambiar comportamiento.

### @s19 — hex literal señalado con ruta y línea 7
- ROJO: `informe.señalados` venía vacío (`expected [] to deeply equal [...]`
  con el hallazgo esperado).
- VERDE: `PATRON_HEX = /#[0-9a-fA-F]{3,8}\b/` y `declaraColorLiteral`/
  `hallazgosDelFichero` recorren el contenido línea a línea (1-indexado) y
  reemplazan el `.filter(() => false)` fake por la detección real.
- REFACTOR: ninguno adicional.

### @s20 — forma funcional `rgb(...)` y nombre CSS `white`
- ROJO: `informe.señalados` no incluía ninguna de las dos rutas esperadas.
- VERDE: `PATRON_FUNCIONAL = /\b(?:rgba?|hsla?)\(/i` y
  `PATRON_NOMBRE_DE_COLOR` construido sobre los 16 nombres de color de CSS
  Color Module Level 1 (conjunto mínimo y no arbitrario, no solo "white":
  ver el porqué en el comentario del propio fichero).
- REFACTOR: ninguno adicional.

### @s21 — 0 ficheros inspeccionados falla cerrado
- ROJO (verificado retroactivamente, mismo proceso que `@s17`): sin la
  guarda, `pasa` salía `true` con 0 ficheros.
- VERDE: guarda `if (ficheros.length === CERO_FICHEROS) return
  ejecutarPuertaDeLiteralesColorSinFicheros()` con motivo "...0 ficheros" (no
  contiene la palabra "encontró", verificado con el propio test).
- REFACTOR: ninguno adicional.

### @s22 — `currentColor`, `transparent`, `inherit` no se señalan
- Verde a la primera: la lista `NOMBRES_DE_COLOR_CSS` nunca incluyó esas tres
  palabras clave (por diseño, documentado en el comentario del fichero desde
  `@s20`), y ninguno de los otros dos patrones (`hex`, funcional) las
  matchea. Verificado ejecutando la suite, no asumido.

## Trazabilidad `@s → test`

| Escenario | Test |
| --- | --- |
| @s1 | `src/lib/tokens.test.ts` › `@s1 ...` › ambos `it` |
| @s2 | `src/lib/contraste.test.ts` › `@s2 ...` |
| @s3 | `src/lib/contraste.test.ts` › `@s3 ...` |
| @s4 | `src/lib/contraste.test.ts` › `@s4 ...` |
| @s5 | `src/lib/contraste.test.ts` › `@s5 ...` |
| @s6 | `src/lib/contraste.test.ts` › `@s6 ...` |
| @s7 | `src/lib/contraste.test.ts` › `@s7 ...` |
| @s8 | `src/lib/contraste.test.ts` › `@s8 ...` |
| @s9 | `src/lib/contraste.test.ts` › `@s9 ...` |
| @s10 | `src/lib/contraste.test.ts` › `@s10 ...` |
| @s11 | `src/lib/contraste.test.ts` › `@s11 ...` |
| @s23 | `src/lib/contraste.test.ts` › `@s23 ...` |
| @s12 | `src/lib/contraste.test.ts` › `@s12 ...` |
| @s13 | `src/lib/contraste.test.ts` › `@s13 ...` |
| @s14 | `src/lib/contraste.test.ts` › `@s14 ...` |
| @s15 | `src/lib/contraste.test.ts` › `@s15 ...` |
| @s16 | `src/lib/tokens.test.ts` › `@s16 ...` › ambos `it` |
| @s17 | `src/lib/contraste.test.ts` › `@s17 ...` |
| @s18 | `src/lib/puertaLiteralesColor.test.ts` › `@s18 ...` |
| @s19 | `src/lib/puertaLiteralesColor.test.ts` › `@s19 ...` |
| @s20 | `src/lib/puertaLiteralesColor.test.ts` › `@s20 ...` |
| @s21 | `src/lib/puertaLiteralesColor.test.ts` › `@s21 ...` |
| @s22 | `src/lib/puertaLiteralesColor.test.ts` › `@s22 ...` |

23/23 escenarios cubiertos por al menos un test concreto.

## Estado final (previo al cierre de huecos de mutación)

- `pnpm run test`: **25 tests, 3 ficheros, verde.**
- `pnpm run lint && pnpm run typecheck`: **verde, cero avisos.**
- `node .harness/harness.mjs init`: **verde de punta a punta.**
- Pendiente: revisión del `judge` y prueba de mutación del
  `mutation_tester` sobre `src/lib/contraste.ts`, `src/lib/tokens.ts` y
  `src/lib/puertaLiteralesColor.ts` (umbral 1.0, `stryker.config.json`). El
  `tdd_craftsman` no marca `done`; espera el veredicto.

## Intento 2 — cierre de huecos de mutación (judge aprobó, mutación falló: 119/130 = 91.54%)

El `judge` aprobó la implementación pero el `mutation_tester` (intento 1)
midió 11 mutantes supervivientes sobre 130 (detalle completo en
`progress/mutation_tokens_marca.md`). De los 11, **1 es un mutante
equivalente documentado y excluido** (`contraste.ts:36`, `<=` vs `<` en la
rama de gamma lineal: indistinguible para cualquier entero de 8 bits, ver
justificación en el informe de mutación). Los otros **10 son huecos reales de
aserción**, no de producción: en todos los casos el comportamiento correcto
ya existía en `src/lib`, pero ningún test lo ejercitaba con la entrada
concreta que distingue el código real del mutante, o no comprobaba el dato
exacto (conteo, campo vacío) que el mutante corrompía.

Siguiendo la instrucción explícita de esta ronda — "añade EXCLUSIVAMENTE los
tests que faltan, no escribas producción que ningún test rojo haya pedido" —
no se tocó ningún fichero de `src/lib/*.ts` (ni `contraste.ts`, ni
`tokens.ts`, ni `puertaLiteralesColor.ts`). Solo se añadieron `it()` nuevos a
los tres ficheros de test existentes, cada uno atado al `@s` cuyo
comportamiento ya afirma (o, en el caso de `tokens.ts:24-26`, reforzando la
aserción del propio `@s16` con un conteo exacto en vez de `length >
0`/`every(...)`). Nota de honestidad sobre "rojo": estos tests no estaban en
rojo contra la producción real (que ya era correcta) sino contra los
**mutantes** — es exactamente el caso que cubre la nota de proceso "si un
mutante sobrevive es casi siempre porque falta una aserción, no porque falte
producción": no hay ciclo Rojo→Verde de producción que ejecutar aquí, porque
no hay producción que escribir. Se verificó cada test igualmente contra la
suite completa (verde) y, más importante, se verificó directamente contra
Stryker que cada uno mata su mutante objetivo (ver "Verificación con
Stryker" abajo) — sustituyendo el "ROJO visto fallar" habitual por "ROJO visto
sobrevivir sin este test, verde al añadirlo", que es la forma correcta de
demostrar necesidad cuando el rojo es un mutante y no un `TypeError`.

### Tests añadidos

**`src/lib/contraste.test.ts`** (dentro de los `describe` de `@s2` y `@s12`,
sin crear escenarios nuevos):

1. `@s2` refuerzo: `calcularRatioContraste('#010101', '#FFFFFF')` →
   `20.87`. Cierra `contraste.ts:37`
   (`canal / DIVISOR_GAMMA_LINEAL` → `canal * DIVISOR_GAMMA_LINEAL`): el
   único caso que la suite ya cubría en la rama de gamma lineal era
   `#000000` (canal=0, donde dividir y multiplicar dan lo mismo); `#010101`
   tiene canal=1 (dentro del umbral 0.03928 ≈ byte 10) y sí distingue las dos
   operaciones (20.87 real vs 10.43 con el mutante, verificado a mano antes
   de escribir el test).
2. `@s12` refuerzo: `calcularRatioContraste('#77286B', '#ZZZZZZ')` lanza y
   cita `'#ZZZZZZ'`. Cierra `contraste.ts:65`
   (`validarHexadecimal(fondo)` eliminado): `@s12`-`@s15` solo variaban
   `color`, nunca `fondo`.
3. `@s12` refuerzo: `calcularRatioContraste('X#77286B', '#FFFFFF')` lanza.
   Cierra `contraste.ts:26` (regex sin `^`): verificado con Node que sin el
   ancla de inicio, `'X#77286B'` matchea (el mutante NO lanzaría); con el
   ancla, la producción real sí lanza.
4. `@s12` refuerzo: `calcularRatioContraste('#77286BXY', '#FFFFFF')` lanza.
   Cierra `contraste.ts:26` (regex sin `$`): simétrico al anterior,
   verificado igual con Node.

**`src/lib/tokens.test.ts`** (dentro del `describe` de `@s16`):

5. Refuerzo: `porUso('texto normal')` tiene longitud exacta 3,
   `porUso('texto grande')` longitud 1, `porUso('componente de interfaz o
   borde de foco')` longitud 1. Cierra los 3 mutantes de `tokens.ts:24-26`
   (`uso: 'texto normal'` → `uso: ""` en cualquiera de las 3 parejas): el
   test original de `@s16` solo comprobaba `length > 0` y `every(...)`, verdad
   parcial que sobrevive si una de las tres parejas pierde su etiqueta.

**`src/lib/puertaLiteralesColor.test.ts`** (dentro de los `describe` de
`@s21` y `@s20`):

6. `@s21` refuerzo: `informe.señalados` tiene longitud exacta 0 en el caso de
   0 ficheros. Cierra `puertaLiteralesColor.ts:62`
   (`señalados: []` → con relleno en `ejecutarPuertaDeLiteralesColorSinFicheros`):
   el test original solo leía `pasa` y `motivo`, nunca `señalados`.
7. `@s20` refuerzo: un fichero con `hsl(88, 79%, 44%)` (forma funcional sin
   alfa) se señala en su línea. Cierra `puertaLiteralesColor.ts:30`
   (regex `hsla?` → `hsla`, pierde `hsl(`): `@s20` solo probaba `rgb(...)`.
8. `@s20` refuerzo: un fichero con `WHITE` (nombre de color CSS en
   mayúsculas) se señala. Cierra `puertaLiteralesColor.ts:56`
   (flags de regex `'i'` → `""`): ningún test usaba un nombre de color CSS
   en mayúsculas o mixto.

### Verificación con Stryker (por fichero, tras añadir los tests)

Mismo procedimiento que en el intento 1 (patrón
`informe-de-mutacion-con-timeouts-miente`: medido fichero a fichero, a
`concurrency: 1`, columna `# timeout` leída antes que el score en las tres
corridas — 0 timeouts en las tres):

    pnpm exec stryker run --mutate src/lib/contraste.ts --plugins "@stryker-mutator/vitest-runner"
    pnpm exec stryker run --mutate src/lib/tokens.ts --plugins "@stryker-mutator/vitest-runner"
    pnpm exec stryker run --mutate src/lib/puertaLiteralesColor.ts --plugins "@stryker-mutator/vitest-runner"

| Fichero | total | killed | survived | # timeout | # errors | score |
| --- | --- | --- | --- | --- | --- | --- |
| src/lib/contraste.ts | 65 | 64 | 1 | 0 | 0 | 98.46% |
| src/lib/tokens.ts | 12 | 12 | 0 | 0 | 0 | 100.00% |
| src/lib/puertaLiteralesColor.ts | 53 | 53 | 0 | 0 | 0 | 100.00% |
| Total feature | 130 | 129 | 1 | 0 | 0 | 99.23% |

El único superviviente es exactamente el mutante equivalente ya documentado
y justificado en `progress/mutation_tokens_marca.md`
(`contraste.ts:36`, `<=` vs `<`, EqualityOperator). Los 10 huecos reales
identificados en el intento 1 quedan todos matados: `contraste.ts` pasó de
5 supervivientes a 1 (el equivalente), `tokens.ts` de 3 a 0, y
`puertaLiteralesColor.ts` de 3 a 0. Sobre el conjunto de mutantes
no-equivalentes: 129/129 = 100%.

No se modificó ningún fichero de `src/lib/*.ts`, ni `stryker.config.json`,
ni `harness.config.json` en este intento — solo los tres ficheros de test.
`pnpm run test` (32 tests, 3 ficheros), `pnpm run lint`, `pnpm run
typecheck` y `node .harness/harness.mjs init` vuelven a estar verdes de
punta a punta tras los añadidos.

### Trazabilidad `@s → test` (huecos de mutación, complemento a la tabla de arriba)

| Mutante cerrado | Test |
| --- | --- |
| `contraste.ts:37` (÷→×, gamma lineal) | `contraste.test.ts` › `@s2 ...` › `refuerzo mutación: un canal bajo pero no nulo ...` |
| `contraste.ts:65` (fondo sin validar) | `contraste.test.ts` › `@s12 ...` › `refuerzo mutación: un fondo inválido ...` |
| `contraste.ts:26` (regex sin `^`) | `contraste.test.ts` › `@s12 ...` › `refuerzo mutación: basura antes ...` |
| `contraste.ts:26` (regex sin `$`) | `contraste.test.ts` › `@s12 ...` › `refuerzo mutación: basura después ...` |
| `tokens.ts:24,25,26` (uso → "") | `tokens.test.ts` › `@s16 ...` › `refuerzo mutación: el catálogo declara exactamente 3/1/1 ...` |
| `puertaLiteralesColor.ts:62` (señalados con relleno) | `puertaLiteralesColor.test.ts` › `@s21 ...` (aserción añadida al `it` existente) |
| `puertaLiteralesColor.ts:30` (pierde `hsl(`) | `puertaLiteralesColor.test.ts` › `@s20 ...` › `refuerzo mutación: "hsl(...)" ...` |
| `puertaLiteralesColor.ts:56` (flags `'i'` → "") | `puertaLiteralesColor.test.ts` › `@s20 ...` › `refuerzo mutación: un nombre CSS en mayúsculas ...` |

## Estado final (tras el intento 2)

- `pnpm run test`: **32 tests, 3 ficheros, verde.**
- `pnpm run lint && pnpm run typecheck`: **verde, cero avisos.**
- `node .harness/harness.mjs init`: **verde de punta a punta.**
- Mutación medida directamente (ver tabla arriba): **129/130 = 99.23%**
  total, **129/129 = 100%** sobre mutantes no-equivalentes; el único
  superviviente es el equivalente ya documentado y aceptado.
- Pendiente: que el `mutation_tester` repita su propia medición oficial y el
  `craftsman_lead` decida sobre el mutante equivalente (excluirlo del umbral
  o marcarlo `ignore` en `stryker.config.json`, según corresponda). El
  `tdd_craftsman` no marca `done`; espera el veredicto.
