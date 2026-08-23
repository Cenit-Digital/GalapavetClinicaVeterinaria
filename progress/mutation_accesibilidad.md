# Mutación — feature `accesibilidad` (id 19)

**Veredicto:** FAIL
**Score agregado:** killed/total = 210/225 = 93.33% (umbral: 100%)
**Score sobre mutantes NO equivalentes:** 210/224 = 93.75% (umbral: 100%)

> `judge` aprobó en `progress/judge_accesibilidad.md` (Ronda 2, APPROVED,
> 22/08/2026). Umbral exigido por `harness.config.json` -> `mutation.threshold`
> = 1.0. Corrida StrykerJS secuencial (concurrency 1, un fichero detras de
> otro, ningun proceso stryker concurrente en ningun momento), con
> `pnpm exec stryker run --mutate <fichero> --plugins @stryker-mutator/vitest-runner`.
> `# timeout` = 0 en las 4 corridas (columna verificada antes de leer el score
> en cada una): ningun informe se repitio por saturacion de CPU.

## Ficheros mutados (nuevos/modificados por esta feature, `progress/tdd_accesibilidad.md`)

`src/components/Cabecera.tsx` queda fuera del glob de `mutate` en
`stryker.config.json` (`src/lib/**/*.ts`, `src/**/*-logica.ts`) - es el
unico cambio de produccion de esta feature en un `.tsx`, wiring de evento sin
rama de decision propia, tal y como documenta `progress/tdd_accesibilidad.md`.
No se muta ni se cuenta (correcto, es la disciplina que exige la cabecera del
propio `.feature`).

| Fichero | total | killed | survived | timeout | no cov | score |
| --- | --- | --- | --- | --- | --- | --- |
| `src/lib/accesibilidad-analisis.ts` | 56 | 53 | 3 | 0 | 0 | 94.64% |
| `src/lib/accesibilidad-areaTactil.ts` | 62 | 54 | 8 | 0 | 0 | 87.10% |
| `src/lib/accesibilidad-movimiento.ts` | 9 | 9 | 0 | 0 | 0 | 100.00% |
| `src/lib/contraste.ts` (extendido esta sesion, +111 lineas; fichero completo mutado porque Stryker muta por fichero, no por diff) | 98 | 94 | 3 | 0 | 1 | 95.92% (96.91% sobre cubiertos) |
| Total | 225 | 210 | 14 | 0 | 1 | 93.33% |

`src/lib/accesibilidad-movimiento.ts` cierra al 100% a la primera: sin
supervivientes.

## Mutantes sobrevivientes

### src/lib/accesibilidad-analisis.ts (3, todos huecos reales -- patron de vacuidad)

- **src/lib/accesibilidad-analisis.ts:69** (ArrayDeclaration, parametro por
  defecto) `paginasNoCargadas: readonly string[] = []` a
  `= ["Stryker was here"]`.
  Solo se ejerce por la llamada de un solo argumento en la linea 91 (rama
  @s4, inventario vacio). Ningun test de @s4 (accesibilidad-analisis.test.ts:69-77)
  hace ninguna aserción sobre `informe.paginasNoCargadas`.
  Falta: un `expect(informe.paginasNoCargadas).toEqual([])` (o
  `toHaveLength(0)`) en el test de @s4.

- **src/lib/accesibilidad-analisis.ts:74** (ArrayDeclaration, dentro de
  `informeVacio`) `violaciones: []` a `violaciones: ["Stryker was here"]`.
  Sobrevive en @s4 y @s5 (la misma funcion `informeVacio` alimenta las dos
  ramas). Ninguno de los dos tests comprueba `informe.violaciones`; @s4 solo
  comprueba `motivo` (y que NO mencione "violacion" en el texto, que es una
  aserción sobre una cadena, no sobre el array real), @s5 solo comprueba
  `paginasAnalizadas`/`veredicto`/`motivo`.
  Falta: `expect(informe.violaciones).toEqual([])` en los tests de @s4 y de
  @s5.

- **src/lib/accesibilidad-analisis.ts:106** (ArrayDeclaration, rama "0
  reglas aplicadas") `violaciones: []` a `["Stryker was here"]`. Sobrevive en
  @s6. El test de @s6 (accesibilidad-analisis.test.ts:94-101) solo comprueba
  `veredicto` y `motivo`, nunca el array `violaciones` en si (el unico test
  del fichero que compara `informe.violaciones` con `toEqual` es @s3, y no
  cubre esta rama).
  Falta: `expect(informe.violaciones).toEqual([])` en el test de @s6.

### src/lib/accesibilidad-areaTactil.ts (8, todos huecos reales)

- **src/lib/accesibilidad-areaTactil.ts:41** (ConditionalExpression)
  `control.anchoPx >= AREA_TACTIL_MINIMA_PX && control.altoPx >= AREA_TACTIL_MINIMA_PX`
  a `&& true`. Ningun test cubre la combinacion "ancho suficiente, alto
  insuficiente" (@s11 prueba lo contrario: 23x24). Falta: un control con p.
  ej. `anchoPx: 24, altoPx: 23` que espere `veredicto: 'suspenso'`.

- **src/lib/accesibilidad-areaTactil.ts:64** (ConditionalExpression, spread
  condicional) `...(excepcion !== undefined && { excepcionAplicada: excepcion })`
  a `...(true && { excepcionAplicada: excepcion })`. Cuando `excepcion` es
  `undefined`, el mutante igualmente hace spread de
  `{ excepcionAplicada: undefined }` -- la clave queda presente con valor
  `undefined`, y `expect(veredicto.excepcionAplicada).toBeUndefined()`
  (usado en @s11/@s12) no distingue "clave ausente" de "clave presente con
  valor undefined". Falta: un test que compruebe la AUSENCIA de la clave, p.
  ej. `expect('excepcionAplicada' in veredicto).toBe(false)` o
  `expect(Object.hasOwn(veredicto, 'excepcionAplicada')).toBe(false)`, para
  un control sin excepcion.

- **src/lib/accesibilidad-areaTactil.ts:65** (ConditionalExpression, mismo
  patron) `...(excepcion === 'espaciado' && { diametroEmpleadoPx: ... })` a
  `...(true && {...})`. Mismo hueco: ningun test comprueba la ausencia de la
  clave `diametroEmpleadoPx` cuando la excepcion no es "espaciado" (@s11,
  @s12, la parte "en linea" de @s13). Falta: equivalente a lo anterior con
  `diametroEmpleadoPx`.

- **src/lib/accesibilidad-areaTactil.ts:92** (ArrayDeclaration, guarda de
  vacuidad @s15) `suspensos: []` a `["Stryker was here"]`. El test de @s15 no
  hace ninguna aserción sobre `informe.suspensos`. Falta:
  `expect(informe.suspensos).toEqual([])` en el test de @s15.

- **src/lib/accesibilidad-areaTactil.ts:98** (3 mutantes en la misma linea:
  ArrowFunction a `() => undefined`, ConditionalExpression a `false`,
  StringLiteral `'suspenso'` a `""`, los tres sobre
  `evaluados.filter((evaluado) => evaluado.veredicto.veredicto === 'suspenso')`)
  y **:100** (ConditionalExpression `pasa: suspensos.length === CERO_CONTROLES`
  a `pasa: true`): los cinco sobreviven porque `ejecutarPuertaDeAreaTactil`
  nunca se ejercita con un inventario MIXTO (con al menos un control que
  suspenda) -- solo con el inventario 100% aprobado de @s10 y el inventario
  vacio de @s15. La logica de agregacion de la puerta (filtrar los
  suspensos, decidir `pasa`) queda sin cubrir en su caso de uso real: cuando
  si hay un control que falla. Falta: un test que llame a
  `ejecutarPuertaDeAreaTactil` con un inventario mixto (p. ej. un control
  23x24 y un control 44x44) y compruebe `informe.pasa === false`,
  `informe.suspensos` con longitud 1, y que contiene el control que falla.

### src/lib/accesibilidad-movimiento.ts

Sin supervivientes. 9/9 mutantes muertos.

### src/lib/contraste.ts (3 supervivientes + 1 sin cobertura; 1 de los 4 es equivalente genuino)

- **src/lib/contraste.ts:36** (EqualityOperator) `canal <= UMBRAL_GAMMA_LINEAL`
  a `canal < UMBRAL_GAMMA_LINEAL` -- MUTANTE EQUIVALENTE, excluido del score
  con justificacion explicita:
  `canal = canal8Bits / 255`, y `canal8Bits` es SIEMPRE un entero en [0,255]
  (proviene de `parseInt` sobre 2 digitos hexadecimales en `aComponentesRgb`,
  unica llamadora de `componenteLineal` en todo el fichero -- confirmado
  leyendo el fichero completo, sin otro caller). `UMBRAL_GAMMA_LINEAL =
  0.03928`. Para que `canal === UMBRAL_GAMMA_LINEAL` se necesitaria
  `canal8Bits = 0.03928 x 255 = 10.0164`, que no es un entero. Verificacion
  exhaustiva de los dos enteros mas cercanos: `n=10 -> 10/255 =
  0.0392156862... < 0.03928` (rama lineal en ambas versiones); `n=11 -> 11/255
  = 0.0431372549... > 0.03928` (rama gamma en ambas versiones). Ningun valor
  entero de `canal8Bits` en [0,255] puede igualar 0.03928, asi que `<=` y
  `<` devuelven exactamente el mismo booleano para los 256 valores posibles
  del dominio completo de entrada -- no hay ningun color hexadecimal valido
  (el unico tipo de entrada que este modulo acepta, `validarHexadecimal`
  rechaza cualquier otra cosa) que pueda distinguir las dos versiones.
  Mutante genuinamente equivalente, no una excusa retorica: la prueba cubre
  el dominio de entrada completo (256 valores, no una muestra).
  Nota: esta linea es logica PRE-EXISTENTE de la feature `tokens_marca` (ya
  done), no tocada por `accesibilidad` (confirmado por
  progress/tdd_accesibilidad.md: "extendido, no reescrito ... se reutiliza
  calcularRatioContraste ... sin reimplementarlos"); se midio igualmente
  porque Stryker muta el fichero completo, no el diff.

- **src/lib/contraste.ts:225** (ArrayDeclaration, guarda de vacuidad
  compartida `ejecutarPuertaDeContrasteParaUso`) `parejas: []` a
  `["Stryker was here"]`. Sobrevive en @s33/@s35/@s36. Los tres tests solo
  comprueban `parejasEvaluadas`, `pasa` y `motivo`; ninguno comprueba
  `informe.parejas`. Falta: `expect(informe.parejas).toEqual([])` en los tres
  tests (@s33, @s35, @s36).

- **src/lib/contraste.ts:229** (MethodExpression)
  `parejas.every((par) => esAptoParaUso(par.ratio, par.uso))` a
  `parejas.some(par => esAptoParaUso(par.ratio, par.uso))`. Sobrevive en
  @s29/@s30/@s31 porque el catalogo REAL (tokens.ts) tiene TODAS las parejas
  aptas, asi que `every` y `some` coinciden (ambos true). Ningun test llama a
  `ejecutarPuertaDeContrasteTextoNormal`/`TextoGrande`/`ComponentesInterfaz`
  con un catalogo MIXTO (alguna pareja apta, alguna no) -- el unico test con
  una pareja no apta, @s32, usa `formularVeredictoDePareja` directamente
  sobre una sola pareja, no pasa por la agregacion de la puerta. Falta: un
  test que llame a `ejecutarPuertaDeContrasteTextoNormal` (o cualquiera de
  las tres) con un catalogo de 2 parejas, una apta y una no, y compruebe
  `informe.pasa === false`.

- **src/lib/contraste.ts:203** (`evaluarParDeContraste`) -- [NoCoverage], no
  [Survived]: la funcion esta exportada pero NINGUN test ni codigo de
  produccion la invoca (confirmado por `grep -rn evaluarParDeContraste src`
  -> una sola coincidencia, su propia definicion). Es la composicion real de
  `calcularRatioContraste` + `formularVeredictoDePareja` que
  progress/tdd_accesibilidad.md documenta como el motivo de separar
  `formularVeredictoDePareja` (para poder anclar tests a un ratio exacto),
  pero la funcion compuesta en si quedo sin ningun test que la ejercite:
  produccion sin ningun test rojo que la exigiera (viola la Ley 1 de TDD).
  Falta: un test que llame a `evaluarParDeContraste({color, fondo, uso})` con
  hexadecimales reales y compruebe que compone correctamente
  `calcularRatioContraste` + `formularVeredictoDePareja` (p. ej. contra el
  mismo par negro/blanco de @s2, verificando `ratio` y `veredicto`).

## Mutantes equivalentes excluidos (con justificacion)

- `src/lib/contraste.ts:36` -- ver arriba, verificacion matematica exhaustiva
  sobre el dominio completo de 256 valores de entrada. Unico mutante excluido
  de esta ronda.

## Resumen para tdd_craftsman

14 huecos reales que matar (3 en accesibilidad-analisis.ts, 8 en
accesibilidad-areaTactil.ts, 3 en contraste.ts, de los cuales uno es
NoCoverage por funcion sin ningun test), todos con la correccion de test
propuesta arriba. El patron dominante es exactamente el que advierte la
cabecera del .feature (verde-por-vacuidad-en-puerta-de-verificacion): las
guardas de @s4/@s5/@s6/@s15/@s33/@s35/@s36 matan la CONDICION de vacuidad
(gracias al sabotaje manual de `if (false)` documentado por
tdd_craftsman/judge), pero ningun test verifica que el CONTENIDO devuelto en
esa rama (violaciones, paginasNoCargadas, suspensos, parejas) sea realmente
el array vacio declarado en el codigo -- un mutante que vacia un array en
`[]` a `["Stryker was here"]` no lo detecta ninguna aserción actual.
Añadidos a esto: dos huecos de agregacion (accesibilidad-areaTactil.ts:98/100
y contraste.ts:229) por falta de un caso de prueba con inventario MIXTO a
traves de la puerta completa (no solo a traves de la funcion de evaluacion
individual), dos huecos de spread condicional (accesibilidad-areaTactil.ts:64/65)
por usar `toBeUndefined()` en vez de comprobar ausencia de clave, y una
funcion exportada sin ningun test (contraste.ts:203, `evaluarParDeContraste`).

No corresponde a mutation_tester escribir estos tests ni tocar `src/`: vuelve
a tdd_craftsman para el ciclo Rojo->Verde por cada hueco, y de ahi a judge de
nuevo antes de reintentar esta puerta.

---

## Ronda 2 — re-medición tras refuerzo (`progress/tdd_accesibilidad.md`, "Ronda 3" de refuerzo; `progress/judge_accesibilidad.md`, "Ronda 3" de verificación, APPROVED)

**Veredicto:** PASS
**Score sobre los 3 ficheros re-mutados:** killed/total = 215/216 = 99.54% (1 superviviente, equivalente, excluido)
**Score sobre los 3 ficheros re-mutados, mutantes NO equivalentes:** 215/215 = 100% (umbral: 100%)
**Score agregado de la feature completa (incluye `accesibilidad-movimiento.ts`, no re-mutado):** killed/total = 224/225 = 99.56%
**Score agregado sobre mutantes NO equivalentes:** 224/224 = 100% (umbral: 100%)

> Pre-condición verificada: `Get-CimInstance Win32_Process -Filter "name='node.exe'"` (32
> procesos `node.exe` vivos en la máquina en el momento de arrancar) filtrado por
> `CommandLine` que contenga "stryker" → 0 coincidencias. Ningún proceso StrykerJS vivo
> antes de arrancar esta ronda.
>
> Las 3 corridas se ejecutaron **secuencialmente, una detrás de otra, nunca dos a la
> vez** (`concurrency: 1` ya fijado en `stryker.config.json`), con
> `pnpm exec stryker run --mutate <fichero> --plugins @stryker-mutator/vitest-runner`.
> Columna `# timeout` verificada **antes** de leer el score en las 3 corridas: **0** en
> las tres — ningún informe se repitió por saturación de CPU.
>
> `src/lib/accesibilidad-movimiento.ts` **NO** se re-midió en esta ronda por instrucción
> explícita: midió 100% (9/9) en la Ronda 1 y no fue tocado por el refuerzo de
> `tdd_craftsman` (`progress/tdd_accesibilidad.md`, Ronda 3: los únicos ficheros con
> aserciones nuevas son `accesibilidad-analisis.test.ts`, `accesibilidad-areaTactil.test.ts`
> y `contraste.test.ts`). Su score de la Ronda 1 se arrastra sin cambios al agregado de la
> feature completa.

### Resultado por fichero

| Fichero | total | killed | survived | timeout | no cov | score |
| --- | --- | --- | --- | --- | --- | --- |
| `src/lib/accesibilidad-analisis.ts` | 56 | 56 | 0 | 0 | 0 | 100.00% |
| `src/lib/accesibilidad-areaTactil.ts` | 62 | 62 | 0 | 0 | 0 | 100.00% |
| `src/lib/contraste.ts` | 98 | 97 | 1 | 0 | 0 | 98.98% (100% sobre no equivalentes) |
| **Subtotal re-mutado esta ronda** | **216** | **215** | **1** | **0** | **0** | **99.54%** |
| `src/lib/accesibilidad-movimiento.ts` (Ronda 1, no re-mutado — sin cambios) | 9 | 9 | 0 | 0 | 0 | 100.00% |
| **Total feature `accesibilidad`** | **225** | **224** | **1** | **0** | **0** | **99.56%** |

Los 14 huecos reales de la Ronda 1 (3 en `accesibilidad-analisis.ts`, 8 en
`accesibilidad-areaTactil.ts`, 3 en `contraste.ts` de los cuales uno era `NoCoverage`)
quedan **todos muertos** en esta re-medición: `accesibilidad-analisis.ts` pasa de 53→56
killed (3/3 huecos cerrados), `accesibilidad-areaTactil.ts` pasa de 54→62 killed (8/8
huecos cerrados), y `contraste.ts` pasa de 94→97 killed sobre el subconjunto de
supervivientes reales (los 2 huecos reales — `:225` guarda compartida y `:229`
`every`/`some` — más el `NoCoverage` de `evaluarParDeContraste` quedan cerrados; el
`NoCoverage` ahora aparece como test explícito `evaluarParDeContraste compone el cálculo
real...` en la salida de Stryker, `killed 1`).

### Mutante superviviente (1, ya documentado como equivalente en Ronda 1 — sin cambios de código)

- **`src/lib/contraste.ts:36`** (EqualityOperator) `canal <= UMBRAL_GAMMA_LINEAL` →
  `canal < UMBRAL_GAMMA_LINEAL`.
  Verificado por lectura directa del fichero en esta ronda (`src/lib/contraste.ts:34-38`):
  el código de esta línea, la constante `UMBRAL_GAMMA_LINEAL = 0.03928`
  (línea 9), `MAXIMO_CANAL_8_BITS = 255` (línea 8), y el único punto de llamada de
  `componenteLineal` (líneas 43-45, dentro de `luminanciaRelativa`, alimentado
  exclusivamente por `aComponentesRgb`) son **idénticos** a los que sustentaban la
  justificación matemática ya hecha en la Ronda 1 de esta misma bitácora — confirmado con
  `grep -n componenteLineal src/lib/contraste.ts` → únicamente la definición (línea 34) y
  las 3 llamadas de `luminanciaRelativa` (líneas 43-45), sin ningún caller nuevo.
  Se reitera, sin rehacerla desde cero, la justificación ya registrada arriba (sección
  "Mutantes sobrevivientes" / "Mutantes equivalentes excluidos" de la Ronda 1): `canal =
  canal8Bits / 255` con `canal8Bits` siempre entero en `[0, 255]`; para que `canal ===
  UMBRAL_GAMMA_LINEAL` haría falta `canal8Bits = 0.03928 × 255 = 10.0164`, no entero; los
  dos enteros más próximos (`10 → 0.039215... < 0.03928`, `11 → 0.043137... > 0.03928`)
  caen ambos al mismo lado del umbral en las dos versiones (`<=` y `<`), para los 256
  valores posibles del dominio completo de entrada. Mutante genuinamente equivalente,
  excluido del score sobre no equivalentes con la misma justificación exhaustiva ya
  verificada, sin necesidad de repetir el cálculo porque ni la línea ni sus dependencias
  cambiaron entre rondas.

### Mutantes equivalentes excluidos (arrastrado de Ronda 1, sin cambios)

- `src/lib/contraste.ts:36` — único mutante excluido, ver arriba. Confirmado que el
  código de esta línea y su único caller no cambiaron entre la Ronda 1 y esta ronda.

### Verificación de umbral

`harness.config.json` → `mutation.threshold = 1.0`, exigido sobre mutantes NO
equivalentes. Score sobre no equivalentes de la feature completa: 224/224 = **100%** ≥
100%. **Cumple el umbral.**

## Veredicto final

**PASS.** La feature `accesibilidad` (id 19) cierra la puerta de mutación con score
100% sobre mutantes no equivalentes (224/224), tras el refuerzo de `tdd_craftsman`
verificado por `judge` en su Ronda 3 (`progress/judge_accesibilidad.md`, APPROVED). El
único superviviente restante (`contraste.ts:36`) es un mutante equivalente genuino, ya
justificado matemáticamente sobre el dominio completo de 256 valores de entrada en la
Ronda 1 de esta misma bitácora, con el código y su único caller confirmados sin cambios
en esta re-medición.
