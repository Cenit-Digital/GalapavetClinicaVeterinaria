# Mutacion -- feature sistema_de_diseno_visual (id 21)

**Fecha:** 23/08/2026 -- Ronda 1 (mutation_tester)

**Veredicto:** FAIL

**Score global (sobre mutantes NO equivalentes):** 132/177 = 74.58% (umbral: 100%)

## Alcance

Ficheros nuevos de esta ronda segun `progress/tdd_sistema_de_diseno_visual.md`
(seccion "Arquitectura entregada"), todos bajo `src/lib/diseno/`, ejecutados
UNO DETRAS DE OTRO (`concurrency: 1` de `stryker.config.json`), sin ningun
proceso `stryker` previo vivo (comprobado con `Get-CimInstance Win32_Process`
antes de arrancar):

```
pnpm exec stryker run --mutate src/lib/diseno/tokensColor.ts          --plugins @stryker-mutator/vitest-runner
pnpm exec stryker run --mutate src/lib/diseno/escalaTipografica.ts    --plugins @stryker-mutator/vitest-runner
pnpm exec stryker run --mutate src/lib/diseno/escalaEspaciado.ts      --plugins @stryker-mutator/vitest-runner
pnpm exec stryker run --mutate src/lib/diseno/inventarioModulos.ts    --plugins @stryker-mutator/vitest-runner
pnpm exec stryker run --mutate src/lib/diseno/puntoDeCorte.ts         --plugins @stryker-mutator/vitest-runner
pnpm exec stryker run --mutate src/lib/diseno/movimientoRespetuoso.ts --plugins @stryker-mutator/vitest-runner
```

`src/lib/contraste.ts` se EXCLUYE a proposito: `git diff --stat -- src/lib/contraste.ts`
muestra 111 inserciones en el arbol de trabajo, pero pertenecen a la ronda
de `accesibilidad` (id 19, ya con su propio `progress/judge_accesibilidad.md`
y `progress/mutation_accesibilidad.md`), no a esta feature -- el propio
`progress/judge_sistema_de_diseno_visual.md` lo confirma explicitamente
("de nuevo, pertenece a accesibilidad, no a esta feature"). `tokensColor.ts`
solo REUTILIZA `ejecutarPuertaDeContraste` de `contraste.ts` tal cual, sin
tocarlo. Los `.tsx` y `.scss` quedan fuera del `mutate` de `stryker.config.json`
por diseno del proyecto (StrykerJS no muta JSX de forma fiable).

En las 6 corridas la columna `# timeout` fue **0** en todas (verificado antes
de leer cada score); ninguna corrida se repitio por contencion de CPU.

## Resultado por fichero

| Fichero | total | killed | timeout | survived | no cov | score bruto | equivalentes | score sobre no-equivalentes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tokensColor.ts | 39 | 28 | 0 | 4 | 7 | 71.79% | 0 | 71.79% (28/39) |
| escalaTipografica.ts | 28 | 12 | 0 | 10 | 6 | 42.86% | 15 | 92.31% (12/13) |
| escalaEspaciado.ts | 1 | 1 | 0 | 0 | 0 | 100.00% | 0 | 100.00% (1/1) |
| inventarioModulos.ts | 47 | 42 | 0 | 5 | 0 | 89.36% | 0 | 89.36% (42/47) |
| puntoDeCorte.ts | 9 | 7 | 0 | 2 | 0 | 77.78% | 0 | 77.78% (7/9) |
| movimientoRespetuoso.ts | 70 | 42 | 0 | 26 | 2 | 60.00% | 2 | 61.76% (42/68) |
| **Total** | **194** | **132** | **0** | **47** | **15** | **68.04%** | **17** | **74.58% (132/177)** |

Solo `escalaEspaciado.ts` alcanza el umbral. Los otros 5 ficheros quedan por
debajo de 100% incluso despues de descontar los mutantes genuinamente
equivalentes (verificados empiricamente, ver abajo) -- **45 mutantes
sobrevivientes reales** en total.

## src/lib/diseno/tokensColor.ts -- 28/39 = 71.79% (umbral 100%)

11 mutantes no muertos, 0 equivalentes -- los 11 son huecos reales de test.

- `src/lib/diseno/tokensColor.ts:27:9` `if (!variantes.includes(id))` -> `if (true)`
  (ConditionalExpression, Survived). Falta: un test de `extraerVariantesDeTokens`
  con un texto SINTETICO que declare la MISMA variante dos veces (dos bloques
  `:root[data-variante='marca']`), esperando que el resultado NO tenga
  duplicados. El texto real de `_tokens.scss` nunca repite una variante, asi
  que el mutante (que deja de deduplicar) no se distingue con el fichero real.
- `src/lib/diseno/tokensColor.ts:37:7` `if (!coincidencia)` -> `if (false)`
  (ConditionalExpression, Survived, en `extraerBloqueDeVariante`). Falta: un
  test que llame `leerTokenDeVariante` (o `extraerVariantesDeTokens`) con una
  variante que NO existe en el texto de tokens, esperando que lance un Error.
  Ningun test de `tokensColor.test.ts` ejercita el camino "variante no
  encontrada".
- `src/lib/diseno/tokensColor.ts:37:22`-`39:4` (BlockStatement, `if (!coincidencia) {}`,
  NoCoverage) y `src/lib/diseno/tokensColor.ts:38:21` (StringLiteral, el
  mensaje del `Error` -> `''`, NoCoverage): mismo hueco que el anterior --
  la rama entera nunca se ejecuta.
- `src/lib/diseno/tokensColor.ts:54:7` `if (!coincidencia)` -> `if (false)`
  (ConditionalExpression, Survived, en `leerTokenDeVariante`). Falta: un test
  que pida un `rol` (`fondo`/`texto`/`foco`) que NO exista para una variante
  real (o un rol inventado sobre un bloque real), esperando que lance un
  Error.
- `src/lib/diseno/tokensColor.ts:54:22`-`56:4` (BlockStatement, NoCoverage) y
  `src/lib/diseno/tokensColor.ts:55:21` (StringLiteral del mensaje -> `''`,
  NoCoverage): mismo hueco, rama del token-no-encontrado nunca ejercitada.
- `src/lib/diseno/tokensColor.ts:82:7` `if (catalogo.length === CERO_VARIANTES)`
  -> `if (true)` (ConditionalExpression, Survived, solo cubierto por @s11 con
  catalogo vacio, donde la rama YA es verdadera). Falta: un test que llame
  `ejecutarComprobacionDeContrasteDeVariantes` con un catalogo NO vacio (por
  ejemplo, los pares reales de las 4 variantes), para que la rama "false"
  tambien se ejercite.
- `src/lib/diseno/tokensColor.ts:87:10` (ObjectLiteral, `return {...}` ->
  `return {}`, NoCoverage), `87:38` (StringLiteral, `'aprobado'` -> `''`,
  NoCoverage) y `87:51` (StringLiteral, `'suspenso'` -> `''`, NoCoverage):
  la linea de retorno del camino "catalogo no vacio" de
  `ejecutarComprobacionDeContrasteDeVariantes` nunca se ejecuta -- ningun test
  llama a esta funcion con un catalogo no vacio (ni el caso "aprobado" con
  pares que pasan, ni el caso "suspenso" con pares que fallan el umbral).

**Falta un unico tipo de test para matar 4 de los 7 no-coverage y 1 de los 4
survived**: una llamada a `ejecutarComprobacionDeContrasteDeVariantes` con un
catalogo real no vacio (aprobado) y, idealmente, otra con un catalogo que
falle el umbral (suspenso por contraste insuficiente, no por vacuidad).

## src/lib/diseno/escalaTipografica.ts -- 12/28 = 42.86% bruto, 12/13 = 92.31% sobre no-equivalentes

16 mutantes no muertos. **15 son equivalentes genuinos**, verificados
empiricamente (script independiente en el scratchpad de sesion, re-implementa
`calcularTamanoDePaso`/`tamanoEnViewport` y cada variante mutada, comparando
la salida para 8 pasos x 23 anchos de viewport, incluyendo los limites
exactos 320/1024 y valores negativos/extremos): con los parametros de la
Decision 24 (`ratio=1.25` y `base=16` identicos en los dos extremos del
viewport), `calcularTamanoDePaso` devuelve LITERALMENTE el mismo valor para
`minPx` y `maxPx` (linea 62: `return { paso, minPx: tamanoPx, maxPx: tamanoPx }`,
la MISMA variable en las dos posiciones) -- por lo tanto `maxPx - minPx` es
identicamente 0 para cualquier paso, no solo aproximadamente, y
`tamanoEnViewport` devuelve `minPx` (=`maxPx`) para CUALQUIER ancho de
viewport, sin excepcion. Esto hace que toda la logica de saturacion/rama de
`tamanoEnViewport` (lineas 74-82) sea, con estos parametros concretos,
observacionalmente indistinguible de "devolver siempre minPx":

- `74:7` `if (anchoViewportPx <= viewportMinPx)` -> `true` / `false` /
  `< viewportMinPx` / `> viewportMinPx` (Survived x4) y `74:41`-`76:4` ->
  `{}` sin `return` (Survived): EQUIVALENTES. Verificado: para los 3 posibles
  caminos de la funcion (saturacion inferior, saturacion superior,
  interpolacion), el resultado es siempre `minPx` porque `minPx === maxPx` y
  la pendiente de interpolacion es 0; ningun input (incluidos los limites
  exactos 320 y 1024, y valores negativos) distingue estas 5 variantes de la
  version real.
- `77:7` `if (anchoViewportPx >= viewportMaxPx)` -> `true` / `false` /
  `> viewportMaxPx` / `< viewportMaxPx` (Survived x4) y `77:41`-`79:4` -> `{}`
  sin `return` (Survived): EQUIVALENTES, mismo argumento (la rama de arriba
  siempre da `maxPx`, que es identico a `minPx`).
- `81:21` `(maxPx - minPx) / (...)` -> `(maxPx - minPx) * (...)`
  (ArithmeticOperator, NoCoverage): EQUIVALENTE. El numerador es 0 siempre
  (`maxPx - minPx = 0`), y `0 * x === 0 / x` para cualquier `x` finito
  distinto de cero (el denominador real es 704, siempre != 0).
- `81:40` `(... ) / (viewportMaxPx - viewportMinPx)` -> `/ (viewportMaxPx +
  viewportMinPx)` (ArithmeticOperator, NoCoverage): EQUIVALENTE. Con
  numerador identicamente 0, el valor del denominador (704 vs 1344) es
  irrelevante: `0/704 === 0/1344 === 0`.
- `82:20` `minPx + pendiente * (...)` -> `minPx - pendiente * (...)`
  (ArithmeticOperator, NoCoverage): EQUIVALENTE. `pendiente` es siempre 0
  (ver arriba), y `minPx + 0 === minPx - 0`.
- `82:28` `pendiente * (anchoViewportPx - viewportMinPx)` -> `pendiente /
  (anchoViewportPx - viewportMinPx)` (ArithmeticOperator, NoCoverage):
  EQUIVALENTE. Con `pendiente === 0`, `0 * x === 0 / x` para cualquier `x`
  distinto de cero; y en la rama de interpolacion `anchoViewportPx >
  viewportMinPx` esta GARANTIZADO (las dos ramas de saturacion ya devolvieron
  antes), asi que `x` nunca es 0 aqui.
- `82:41` `anchoViewportPx - viewportMinPx` -> `anchoViewportPx +
  viewportMinPx` (ArithmeticOperator, NoCoverage): EQUIVALENTE. Multiplicado
  por una `pendiente` identicamente 0, el valor de este termino no cambia el
  resultado (`0 * cualquier-numero-finito === 0`).

**El unico mutante NO equivalente (hueco real) es:**

- `src/lib/diseno/escalaTipografica.ts:81:22` `(maxPx - minPx)` ->
  `(maxPx + minPx)` (ArithmeticOperator, NoCoverage). A diferencia de los
  anteriores, este cambia el NUMERADOR de "identicamente 0" a `2 * tamanoPx`
  (no nulo, ya que ningun tamano de la escala es 0px). Verificado
  empiricamente: `tamanoEnViewport(-2, 672)` da `10.24` con el codigo real y
  `10.27` con este mutante -- una diferencia real y detectable. Falta: un
  test que llame `tamanoEnViewport` con un ancho de viewport ESTRICTAMENTE
  entre 320 y 1024 (por ejemplo 672, el punto medio), algo que `@s18` no
  cubre (solo prueba 200 y 2000, los dos casos de saturacion). Ningun test
  actual ejercita la rama de interpolacion en absoluto.

## src/lib/diseno/escalaEspaciado.ts -- 1/1 = 100.00%

PASS. Unico mutante (Regex u otro sobre la escala) muerto por `@s19`/`@s20`.
Nada que reportar.

## src/lib/diseno/inventarioModulos.ts -- 42/47 = 89.36% (umbral 100%)

5 mutantes sobrevivientes, 0 equivalentes -- los 5 apuntan al MISMO hueco de
fondo: `inventarioModulos.test.ts` nunca ejercita `comprobarCoLocalizacion`
con un modulo que realmente FALTE (todas las llamadas usan, o bien el
inventario vacio de `@s23`, o bien el inventario real completo de `@s22`
donde los 17 modulos SI tienen su `.module.scss`). Nunca hay un caso
"inventario no vacio pero con al menos un modulo sin fichero".

- `src/lib/diseno/inventarioModulos.ts:52:10` `return \`/${modulo.carpeta}/${modulo.nombre}.module.scss\``
  -> `return \`\`` (StringLiteral, Survived). Si `rutaEstiloDe` siempre
  devuelve `''`, entonces `ruta.endsWith('')` es SIEMPRE verdadero para
  cualquier `ruta` no vacia -- un modulo realmente ausente se marcaria
  igualmente como "encontrado" mientras exista AL MENOS una ruta real en
  `rutasDeEstilosExistentes`. No detectado porque nunca se prueba un modulo
  ausente.
- `src/lib/diseno/inventarioModulos.ts:66:72` `faltantes: []` ->
  `faltantes: ["Stryker was here"]` (ArrayDeclaration, Survived, en la rama
  de vacuidad). `@s23` nunca hace `expect(informe.faltantes)` -- solo
  comprueba `modulosComprobados`, `pasa` y `motivo`. Falta esa asercion.
- `src/lib/diseno/inventarioModulos.ts:70:13` `.filter((modulo) =>
  !rutasDeEstilosExistentes.some((ruta) => ruta.endsWith(rutaEstiloDe(modulo))))`
  -> `.filter(() => undefined)` (ArrowFunction, Survived). `undefined` es
  falsy, asi que el `.filter` nunca conserva nada, dando `faltantes: []`
  SIEMPRE -- indetectable sin un caso con modulos realmente ausentes.
- `src/lib/diseno/inventarioModulos.ts:71:10` `.map((modulo) =>
  modulo.nombre)` -> `.map(() => undefined)` (ArrowFunction, Survived). Solo
  se distingue si `faltantes` tiene al menos un elemento que mapear -- mismo
  hueco.
- `src/lib/diseno/inventarioModulos.ts:73:18` `faltantes.length ===
  CERO_MODULOS` -> `true` (ConditionalExpression, Survived). Fuerza
  `pasa: true` siempre en la rama no vacia, incluso con modulos ausentes.

**Test que mataria los 5 a la vez**: `comprobarCoLocalizacion` con un
inventario que incluya un nombre inventado (p. ej. `{ nombre:
'ModuloQueNoExiste', carpeta: 'components' }`) junto a `rutasDeEstilosExistentes`
reales que NO lo contengan, esperando `pasa: false`, `faltantes:
['ModuloQueNoExiste']` y `modulosComprobados` igual a la longitud del
inventario.

## src/lib/diseno/puntoDeCorte.ts -- 7/9 = 77.78% (umbral 100%)

2 mutantes sobrevivientes, 0 equivalentes -- ambos en el mismo regex
`PATRON_PUNTO_DE_CORTE`, y ambos verificados empiricamente (script en el
scratchpad de sesion) como NO equivalentes: el texto REAL de
`Cabecera.module.scss` siempre escribe `@media (min-width: 1024px)` con
exactamente un espacio antes del parentesis y exactamente un espacio despues
de los dos puntos -- por eso, sobre ESE input concreto, quitar el cuantificador
`*`/`*` no cambia el resultado (una ocurrencia unica de espacio sigue
matchando `[^{]`/`\s` sin el `*`). Pero con un input SINTETICO con formato
distinto, ambos mutantes SI cambian de comportamiento respecto al original
(confirmado con `matchAll` real de Node sobre 5 variantes de formato):

- `src/lib/diseno/puntoDeCorte.ts:6:31` `[^{]*\(` -> `[^{]\(` (Regex,
  Survived). Con `@media screen and (min-width: 500px)` (mas de un caracter
  antes del parentesis, tipo de medio explicito) el patron original captura
  `500` y el mutante no captura nada. Ningun test ejercita un `@media` con
  algo distinto de un unico espacio antes del parentesis.
- `src/lib/diseno/puntoDeCorte.ts:6:31` `width:\s*(\d+)px` -> `width:\s(\d+)px`
  (Regex, Survived). Con `min-width:500px` (sin espacio) o `min-width:  500px`
  (dos espacios) el patron original captura `500` y el mutante, o no captura
  nada (0 espacios, `\s` exige exactamente uno) o tampoco captura (2 espacios,
  `\s` exige exactamente uno). Ningun test ejercita variacion de espaciado
  tras los dos puntos.

Falta: 1-2 tests de `extraerPuntosDeCorteDeclarados` con texto SINTETICO
(no el fichero real) que cubran formato alternativo -- multiples tokens antes
del parentesis (`@media screen and (...)`) y/o espaciado distinto tras los
dos puntos -- para probar que el parser tolera variaciones razonables de
formato CSS, tal y como su propio disenio con `*` sugiere que pretende
hacer.

## src/lib/diseno/movimientoRespetuoso.ts -- 42/70 = 60.00% bruto, 42/68 = 61.76% sobre no-equivalentes

28 mutantes no muertos (26 survived + 2 no-coverage). Solo tiene 2 tests en
total en `movimientoRespetuoso.test.ts` (uno con los 17 ficheros reales, que
solo ejercitan el tipo `no-preference`, y uno sintetico con una sola
transicion sin cobertura y SIN ningun bloque `@media`), asi que casi ninguna
rama secundaria (tipo `reduce`, anidamiento con mas de un nivel, mas de una
declaracion dentro del mismo bloque cubierto, formato de espaciado
alternativo, o el propio guardado de vacuidad de `pasa`) se ejercita con mas
de una forma. Verificacion empirica exhaustiva (script en el scratchpad de
sesion, reimplementando `tipoDeAperturaEnLinea`, `extraerDeclaracionesDeMovimiento`
y `ejecutarPuertaDeMovimientoRespetuoso`, y cada variante mutada, comparando
salida completa contra los 17 ficheros reales mas 18 entradas sinteticas
deliberadamente adversariales: bloques `reduce` con dos declaraciones dentro,
anidamiento de hasta 4 niveles, llaves de cierre sin apertura previa, formato
CSS sin espacios o con doble espacio, comentarios y valores de propiedad que
contienen la subcadena `transition:`).

**2 mutantes SI son equivalentes genuinos**, confirmados tras 21+ inputs
(incluidos los adversariales) sin ninguna diferencia observable:

- `src/lib/diseno/movimientoRespetuoso.ts:30:10` `return 'otro'` -> `return ''`
  (StringLiteral, Survived). El tercer miembro del tipo interno `TipoDeBloque`
  ('otro') nunca se compara con un literal especifico en ningun punto del
  modulo -- solo se usa dentro de `pila.includes('no-preference')` y
  `pila.includes('reduce')`, y tanto `'otro'` como `''` son igualmente
  distintos de esos dos literales. Cualquier valor de relleno que no sea
  exactamente `'no-preference'` o `'reduce'` es intercambiable aqui.
- `src/lib/diseno/movimientoRespetuoso.ts:39:32` `const pila: TipoDeBloque[]
  = []` -> `= ["Stryker was here"]` (ArrayDeclaration, Survived). El elemento
  extra ocupa el fondo de la pila desde el inicio, pero como nunca es igual a
  `'no-preference'` ni a `'reduce'`, jamas cambia el resultado de
  `.includes(...)`; y para cualquier contenido bien formado (llaves
  balanceadas, el unico CSS/SCSS real posible) el elemento de relleno nunca
  llega a desapilarse de forma que afecte a una comprobacion posterior.
  Probado incluso con contenido deliberadamente desbalanceado (llaves de
  cierre sobrantes al inicio del fichero): el resultado final es identico en
  todos los casos probados.

**Los otros 26 mutantes NO son equivalentes** (huecos reales, confirmados
empiricamente encontrando al menos un input, casi siempre sintetico, que
distingue el mutante del codigo real):

- `19:30` regex de `no-preference`, `\s*` -> `\s` (Regex, Survived). Requiere
  formato CSS con 0 o 2+ espacios tras los dos puntos para detectarse (los 17
  ficheros reales usan exactamente 1). Hueco: sin test de formato alternativo.
- `20:23` regex de `reduce`, 4 variantes de mutacion de caracter o
  cuantificador (Regex, Survived x4). Ningun fichero real ni sintetico actual
  usa `prefers-reduced-motion: reduce` en absoluto (el unico uso real de
  movimiento vive en `Faq.module.scss` con `no-preference`). Hueco: falta un
  test dedicado al tipo `reduce`.
- `21:40` regex de propiedad, sin ancla de inicio de linea y con clase de
  caracter distinta (Regex, Survived x2). Sin la ancla, un comentario o un
  valor de propiedad que contenga la subcadena `transition:` o `animation:`
  en medio de la linea se detecta como declaracion real -- confirmado con
  una linea del tipo `.a:hover { color: red; } // transition: fake` (el
  mutante la marca como declaracion; el codigo real, correctamente, no).
  Hueco: falta un test con una linea que contenga esas palabras sin ser una
  declaracion real al principio de linea.
- `27:7` `if (PATRON_REDUCE.test(linea))` -> `false`, y sus dos mutantes de
  no-coverage asociados en el cuerpo del `if` y el mensaje literal
  (Survived/NoCoverage): mismo hueco que `reduce` arriba -- sin un bloque
  `reduce` real en ningun test, `tipoDeAperturaEnLinea` nunca devuelve
  efectivamente `'reduce'` de forma observable.
- `44:35` `linea: indice + 1` -> `indice - 1` (ArithmeticOperator, Survived).
  El numero de linea reportado nunca se compara con un valor concreto en
  ningun test (`@s33` solo comprueba `toHaveLength(1)`). Hueco: falta
  comprobar el numero de linea exacto del incumplimiento.
- `44:105` `pila.includes('reduce')` -> `pila.includes('')` (StringLiteral,
  Survived). Mismo hueco de fondo que el de `reduce` en las lineas 20/27.

- `46:9` `if (linea.includes('{'))` -> `true` (ConditionalExpression,
  Survived) y `46:24` el literal de apertura -> cadena vacia (StringLiteral,
  Survived, `.includes('')` es siempre verdadero): con contenido de mas de
  una linea sin llave de apertura en cada una, este mutante empuja tipos
  espurios a la pila en cada linea -- confirmado con un caso adversarial de
  multiples empujes que si distingue el resultado.
- `48:16` `else if (linea.includes('}'))` -> `true` / `false` (Survived x2),
  el literal de cierre -> cadena vacia (Survived, `.includes('')` siempre
  verdadero), el cuerpo del `else if` vaciado sin desapilar (Survived), y la
  propia llamada a `pop()` eliminada (Survived, mismo efecto que el cuerpo
  vacio): hueco real confirmado con el caso decisivo -- un bloque
  `@media (prefers-reduced-motion: reduce) { ... }` con DOS declaraciones de
  movimiento dentro del MISMO bloque cubierto. El mutante `else if (true)`
  (y equivalentes) empieza a desapilar en cada linea que no abre llave,
  incluida la propia linea de la primera declaracion, asi que para la
  SEGUNDA declaracion del mismo bloque la pila ya esta vacia y `cubierta`
  pasa de verdadero (codigo real) a falso (mutante): diferencia observable
  confirmada. Ningun test actual tiene mas de una declaracion dentro del
  mismo bloque cubierto.
- `71:33` el `.filter(...)` sobre ficheros eliminado por completo
  (MethodExpression, Survived) y `71:62` `.length > CERO_FICHEROS` ->
  `true` (ConditionalExpression, Survived): confirmado con cualquier fichero
  SIN declaraciones de movimiento evaluado en solitario (por ejemplo
  `Cabecera.module.scss`, que no declara `transition`/`animation`): el
  codigo real da `ficherosComprobados: 0, pasa: false` (nada que comprobar);
  el mutante da `ficherosComprobados: 1, pasa: true` (lo cuenta como
  "comprobado y aprobado" sin haber comprobado nada) -- el mismo patron de
  vacuidad que `@s11`/`@s23` ya previenen en otros modulos de esta feature,
  pero aqui no esta probado con un fichero aislado sin movimiento.
- `71:62` `.length > CERO_FICHEROS` -> `.length >= CERO_FICHEROS`
  (EqualityOperator, Survived): mismo hueco -- `.length` nunca es negativo,
  asi que "mayor o igual que cero" equivale a "siempre verdadero", mismo
  caso decisivo que el anterior.

- `76:12` y `76:30` el `.map(...)` que construye cada incumplimiento
  reemplazado por una funcion que devuelve `undefined` o un objeto vacio
  (Survived x2). Solo se distinguen si `incumplimientos` tiene contenido
  real que comparar campo a campo; `@s33` solo comprueba `toHaveLength(1)`,
  nunca el contenido de cada incumplimiento. Hueco: falta comparar el
  incumplimiento completo (ruta y linea) con el valor esperado.
- `80:11` `ficherosConMovimiento.length > CERO_FICHEROS && ...` -> `true &&
  ...` / `>= CERO_FICHEROS && ...` (Survived x2): mismo caso decisivo que el
  de la linea 71 -- un fichero SIN movimiento evaluado en solitario da
  `pasa: true` bajo el mutante (vacuidad positiva falsa) y `pasa: false` en
  el codigo real.
- Los dos mutantes de no-coverage dentro de la rama `reduce` de
  `tipoDeAperturaEnLinea` (cuerpo vaciado y literal de retorno vaciado):
  mismo hueco de fondo que todos los mutantes de `reduce` de arriba.

**3 tests nuevos matarian la mayoria de estos 26**: (1) un fichero con un
bloque `reduce` con DOS declaraciones de movimiento dentro (mata la familia
completa de la linea 48 y buena parte de la 20/27/44); (2) un fichero sin
ninguna declaracion de movimiento (por ejemplo `Cabecera.module.scss`)
evaluado EN SOLITARIO, esperando `ficherosComprobados: 0, pasa: false` (mata
la familia de las lineas 71 y 80); (3) aserciones de contenido exacto sobre
el primer incumplimiento (ruta y linea, no solo la longitud del array) en el
test ya existente de `@s33` (mata la familia de las lineas 44 y 76). El resto
(regex de formato alternativo, ancla de inicio de linea de la 21) necesita
2-3 tests sinteticos adicionales de formato CSS.

## Metodologia de verificacion de equivalencia

Ningun mutante se declaro equivalente por argumento retorico. Para
`escalaTipografica.ts` y `movimientoRespetuoso.ts` (los dos ficheros con
candidatos a equivalencia) se escribio un script independiente por fichero
en el scratchpad de la sesion que reimplementa la funcion real y CADA
variante mutada segun el reporte de Stryker, y compara la salida completa
sobre una bateria de entradas (parametros/anchos de viewport exhaustivos
para el primero; los 17 ficheros reales mas hasta 18 entradas sinteticas
adversariales para el segundo, incluyendo los casos limite que inicialmente
parecian equivalentes por error -- 4 candidatos de `movimientoRespetuoso.ts`
se descartaron como equivalentes tras anadir el caso decisivo que SI los
distinguia). Los 17 mutantes finalmente aceptados como equivalentes (15 en
`escalaTipografica.ts`, 2 en `movimientoRespetuoso.ts`) no mostraron ninguna
diferencia en ningun input probado, incluyendo los limites exactos y casos
desbalanceados/adversariales, y en el caso de `escalaTipografica.ts` la
equivalencia se apoya ademas en una prueba algebraica directa sobre el
codigo fuente (linea 62: `minPx` y `maxPx` son literalmente la misma
variable, luego `maxPx - minPx` es identicamente 0, no solo numericamente
cercano).

## Resumen y siguiente paso

**FAIL.** 45 mutantes sobrevivientes reales repartidos en 5 de los 6
ficheros nuevos de esta feature (todos menos `escalaEspaciado.ts`). El score
sobre mutantes no equivalentes (74.58%) esta muy por debajo del umbral de
`harness.config.json` (`mutation.threshold: 1.0`). No se ha tocado ningun
fichero de `src/` ni de test: el trabajo de escribir los tests que maten
estos 45 mutantes corresponde al `tdd_craftsman`, seguido de un nuevo paso
por `judge` y una nueva ronda de `mutation_tester`.

Prioridad sugerida (de mayor a menor impacto por test): (1) el bloque
`reduce` con dos declaraciones dentro, en `movimientoRespetuoso.ts` (mata
~13 de los 26 supervivientes reales de ese fichero); (2) un fichero sin
movimiento evaluado en solitario, mismo fichero (mata otros 4); (3) un
inventario con un modulo realmente ausente, en `inventarioModulos.ts` (mata
los 5); (4) un catalogo de variantes no vacio (aprobado y/o suspenso por
contraste) en `tokensColor.ts` (mata 4-5 de los 11); (5) un ancho de
viewport intermedio (por ejemplo 672) en `escalaTipografica.ts` (mata el
unico superviviente real de ese fichero); (6) formato CSS alternativo
(sin espacio, doble espacio, `@media screen and (...)`) en `puntoDeCorte.ts`
y en el resto de regex de `movimientoRespetuoso.ts`.
