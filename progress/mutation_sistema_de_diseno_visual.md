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

---

## Re-medicion tras Ronda 2 (25/08/2026)

**Encargo:** re-medicion pedida por craftsman_lead, tras la revision de cierre
de judge (progress/judge_sistema_de_diseno_visual.md, seccion "Revision de
cierre (25/08/2026, tras identidad_visual)", punto 3), que confirmo
fichero-por-fichero (via git log) que 3 de los 6 modulos de
src/lib/diseno/ nunca se remidieron desde el refuerzo de Ronda 2
(23/08/2026): movimientoRespetuoso.ts, puntoDeCorte.ts y
escalaTipografica.ts. escalaEspaciado.ts se incluye en la misma tanda por
higiene (1 solo mutante, ya PASS desde Ronda 1). tokensColor.ts e
inventarioModulos.ts quedan fuera de alcance a proposito: ya fueron
ampliados y remedidos con PASS 100% sobre no-equivalentes por el propio
mutation_tester de identidad_visual (id 22, done) sobre su version
actual -- remedirlos aqui seria trabajo redundante.

### Pre-vuelo

- git log --oneline -1 sobre los 4 ficheros: los 4 apuntan a 6ffd3b7
  (commit WIP previo a Ronda 2), ningun commit posterior -- confirmado
  intactos desde entonces, tal y como afirma el judge.
- git status: sin cambios en src/lib/diseno/ ni en
  tests/e2e/accesibilidad.spec.ts en el momento de arrancar -- sin
  colision con el tdd_craftsman trabajando en paralelo sobre @s27.
- Get-CimInstance Win32_Process antes de arrancar: sin ningun proceso
  stryker vivo.
- pnpm exec vitest run de los 4 .test.ts en aislamiento: 4 ficheros,
  20 tests, verde (previo a mutar nada).
- Las 4 corridas se lanzaron una detras de otra (nunca en paralelo),
  cada una con --plugins @stryker-mutator/vitest-runner explicito.
  Durante la corrida de movimientoRespetuoso.ts (la mas larga, ~9m25s)
  se detecto una rafaga de ~20-25 procesos vitest adicionales -- el
  tdd_craftsman corriendo pnpm run test / bin/harness init en paralelo
  sobre su hueco de @s27, en un fichero fuera de este alcance --, pero la
  columna "# timeout" se mantuvo en 0 en las 4 corridas (verificado en
  cada informe antes de leer el score, incluida la de mayor contencion), asi
  que ninguna corrida se repitio. concurrency: 1 de stryker.config.json
  contuvo el riesgo de falsos "timeout = killed" descrito en su propio
  comentario.
- Cada score se verifico dos veces: una vez contra el texto de la terminal y
  otra contra reports/mutation/mutation.json (el tail de la terminal
  trunco el listado completo de sobrevivientes de escalaTipografica.ts;
  el JSON no).

### Resultado por fichero

| Fichero | total | killed | timeout | survived | no cov | score bruto | equivalentes | score sobre no-equivalentes | veredicto |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| escalaEspaciado.ts | 1 | 1 | 0 | 0 | 0 | 100.00% | 0 | 100.00% (1/1) | PASS |
| escalaTipografica.ts | 28 | 13 | 0 | 15 | 0 | 46.43% | 15 | 100.00% (13/13) | PASS |
| puntoDeCorte.ts | 9 | 9 | 0 | 0 | 0 | 100.00% | 0 | 100.00% (9/9) | PASS |
| movimientoRespetuoso.ts | 70 | 67 | 0 | 3 | 0 | 95.71% | 2 | 98.53% (67/68) | FAIL |
| Total (4 ficheros) | 108 | 90 | 0 | 18 | 0 | 83.33% | 17 | 98.90% (90/91) | FAIL |

### escalaEspaciado.ts -- 1/1 = 100.00%

PASS, sin cambios respecto a Ronda 1 (nunca tuvo supervivientes). Nada que
reportar.

### escalaTipografica.ts -- 13/28 = 46.43% bruto, 13/13 = 100.00% sobre no-equivalentes

El unico superviviente real de Ronda 1 (81:22, "(maxPx - minPx)" a
"(maxPx + minPx)") ahora aparece Killed, coherente con el nuevo test
dirigido al punto medio del viewport (672px) que documenta
progress/tdd_sistema_de_diseno_visual.md Ronda 2.

Los 15 supervivientes restantes se cotejaron uno a uno contra el
catalogo de equivalentes de Ronda 1 (reports/mutation/mutation.json, no
solo la terminal, que el "tail -100" trunco): mismo mutatorName +
location + replacement, caracter a caracter, en los 15 casos --
74:7 x4 + 74:41-76:4 x1 (rama de saturacion inferior), 77:7 x4 +
77:41-79:4 x1 (rama de saturacion superior), y 81:21, 81:40, 82:20,
82:28, 82:41 (los 5 terminos aritmeticos de la interpolacion). Codigo
fuente confirmado byte-identico desde Ronda 2 (git log da un unico commit,
6ffd3b7, para el fichero). Acepto los 15 como equivalentes por
herencia, re-verificada (no repito el analisis algebraico/empirico
completo de Ronda 1, que ya demostro con script independiente que
minPx === maxPx para los parametros reales de la Decision 24, haciendo
"pendiente" identicamente 0 y las tres ramas de tamanoEnViewport
observacionalmente indistinguibles de "siempre minPx").

PASS sobre no-equivalentes: 13/13 = 100.00%.

### puntoDeCorte.ts -- 9/9 = 100.00%

Los 2 supervivientes reales de Ronda 1 (formato "@media screen and (...)" y
espaciado alternativo tras los dos puntos) ahora estan Killed, por los 2
tests nuevos de formato CSS alternativo que documenta
progress/tdd_sistema_de_diseno_visual.md Ronda 2 (visibles en la salida:
"un @media con tipo de medio explicito antes del parentesis tambien se
reconoce" y "espaciado distinto tras los dos puntos... tambien se
reconoce"). 0 equivalentes, 0 supervivientes. PASS limpio.

### movimientoRespetuoso.ts -- 67/70 = 95.71% bruto, 67/68 = 98.53% sobre no-equivalentes -- FAIL

De los 26 supervivientes reales + 2 equivalentes de Ronda 1, 24 de los 26
reales estan ahora Killed por los tests nuevos de Ronda 2 (bloque "reduce"
con dos declaraciones, fichero sin movimiento evaluado en solitario,
contenido exacto del incumplimiento, formatos de espaciado alternativos en
"no-preference"/"reduce", y el caso de la palabra "transition:" en medio de
una linea que no es declaracion real).

2 mutantes siguen siendo los mismos equivalentes ya documentados en Ronda
1, re-verificados contra el codigo actual (identico desde 6ffd3b7, mismo
mutatorName+location+replacement):

- movimientoRespetuoso.ts:30:10 "return 'otro'" a "return \"\""
  (StringLiteral). El tercer miembro de TipoDeBloque nunca se compara con
  un literal concreto -- sigue siendo intercambiable con cualquier relleno
  distinto de 'no-preference'/'reduce'.
- movimientoRespetuoso.ts:39:32 "const pila: TipoDeBloque[] = []" a
  "= [\"Stryker was here\"]" (ArrayDeclaration). El elemento de relleno
  nunca llega a afectar ningun .includes(...) posterior -- mismo
  argumento de Ronda 1.

1 mutante sobreviviente es REAL (no equivalente) y es NUEVO respecto al
catalogo de Ronda 1 -- no lo cubre ninguno de los 13 tests anadidos en
Ronda 2:

- src/lib/diseno/movimientoRespetuoso.ts:21:40 (Regex)

  Original:
      const PATRON_PROPIEDAD_DE_MOVIMIENTO = /^\s*(animation|transition)\s*:/
  Mutante:
      const PATRON_PROPIEDAD_DE_MOVIMIENTO = /^\s*(animation|transition)\S*:/

  Cambia el \s* inmediatamente anterior a los dos puntos por \S*
  (no-espacio), conservando el ancla ^ intacta -- por eso el nuevo test
  de Ronda 2 ("la palabra 'transition:' en medio de una linea... no se
  confunde con una", que ataca la falta de ancla) no lo distingue: ambas
  variantes (original y mutante) siguen ancladas al inicio de linea, asi que
  una linea tipo ".a:hover { color: red; } // transition: fake" no matchea
  en ninguna de las dos.

  Verificado que NO es equivalente (diferencia de comportamiento real, no
  solo teorica): con una linea como "transition-duration: 0.3s;" (una
  propiedad larga real de CSS, no la forma abreviada "transition:"), el
  patron ORIGINAL no matchea -- entre "transition" y ":" hay "-duration"
  (9 caracteres no-espacio), y \s* exige que ahi solo pueda haber espacio
  en blanco (cero o mas), asi que la posicion falla y, al estar anclado, no
  hay otro punto de inicio que probar. El patron MUTANTE si matchea:
  \S* consume literalmente "-duration" (todo no-espacio) y luego encuentra
  los dos puntos. Mismo razonamiento aplica a "transition-property:",
  "transition-timing-function:", "animation-duration:",
  "animation-name:", etc. -- cualquier propiedad larga real de transition/
  animation que el proyecto pudiera declarar.

  Falta: un test que llame extraerDeclaracionesDeMovimiento (o
  ejecutarPuertaDeMovimientoRespetuoso) con un contenido sintetico que
  contenga una linea con una propiedad larga real ("transition-duration:
  0.3s;" o similar) fuera de cualquier bloque prefers-reduced-motion,
  y compruebe que el codigo real la trata igual que hoy la trata realmente
  (ningun test actual ejercita esta distincion, asi que primero habria que
  confirmar con el propio tdd_craftsman/judge cual es el comportamiento
  pretendido -- si PATRON_PROPIEDAD_DE_MOVIMIENTO deberia o no reconocer
  las formas largas -- antes de decidir si el test espera 0 declaraciones o
  1 declaracion no cubierta; en cualquier caso, sin ese test el mutante
  sobrevive porque ninguna asercion actual distingue "propiedad larga
  ignorada" de "propiedad larga detectada").

  No es candidato a equivalente: hay al menos una entrada (transition-
  duration: 0.3s;) que produce una salida observable distinta entre el
  codigo real y el mutante.

### Metodologia de verificacion de equivalencia (esta ronda)

Para los 17 mutantes heredados de Ronda 1 (15 en escalaTipografica.ts, 2 en
movimientoRespetuoso.ts) no se repitio el analisis algebraico/empirico
completo desde cero -- se re-verifico que (a) el codigo fuente de cada
fichero sigue siendo byte-identico desde Ronda 2 (git log --oneline -1 da
un unico commit, 6ffd3b7, para los 4 ficheros de esta ronda) y (b) cada
mutante sobreviviente coincide exactamente, por mutatorName + location +
replacement, con el ya justificado en
progress/mutation_sistema_de_diseno_visual.md (seccion Ronda 1, "Resumen y
siguiente paso" y los apartados por fichero). Los 17 coinciden sin
excepcion. El mutante nuevo (movimientoRespetuoso.ts:21:40, variante
\S*) se analizo desde cero porque, aunque comparte linea:columna con un
hueco ya catalogado en Ronda 1, su replacement es distinto del descrito
entonces (Ronda 1 documento la falta de ancla ^; este mutante conserva el
ancla y muta un caracter distinto de la misma expresion regular) -- no se
acepto por herencia.

### Resumen y siguiente paso

FAIL. Score global de esta tanda (4 ficheros): 90/108 = 83.33% bruto,
90/91 = 98.90% sobre mutantes no equivalentes -- por debajo del umbral de
harness.config.json (mutation.threshold: 1.0). 3 de los 4 ficheros
(escalaEspaciado.ts, escalaTipografica.ts, puntoDeCorte.ts) alcanzan
100% sobre no-equivalentes y quedan cerrados. movimientoRespetuoso.ts
queda con 1 mutante sobreviviente real (21:40, variante \S* de
PATRON_PROPIEDAD_DE_MOVIMIENTO), sin tocar src/ ni ningun test: el
trabajo de escribir el test que lo mate (y decidir, junto con
craftsman_lead, si PATRON_PROPIEDAD_DE_MOVIMIENTO debe o no reconocer
formas largas de transition-/animation-) corresponde al tdd_craftsman,
seguido de un nuevo paso por judge y una nueva ronda de mutation_tester
acotada a este unico fichero.

tokensColor.ts e inventarioModulos.ts no se remidieron en esta tanda
(fuera de alcance, ya PASS 100% sobre no-equivalentes por identidad_visual
-- ver progress/mutation_identidad_visual.md). La feature sistema_de_diseno_visual
(id 21) sigue sin poder cerrarse por mutacion hasta que
movimientoRespetuoso.ts alcance 100% sobre no-equivalentes.

## Remedicion final -- movimientoRespetuoso.ts (25/08/2026)

**Encargo:** re-medicion acotada UNICAMENTE a `src/lib/diseno/movimientoRespetuoso.ts`,
tras el refuerzo de una sola linea de tdd_craftsman (linea 21,
`PATRON_PROPIEDAD_DE_MOVIMIENTO` ahora reconoce tambien formas largas
hifenadas: `/^\s*(animation|transition)(-[\w-]+)?\s*:/`) mas 2 tests
nuevos, aprobado por judge (progress/judge_sistema_de_diseno_visual.md,
seccion "Refuerzo final -- formas largas (25/08/2026)").

### Pre-vuelo

- `Get-CimInstance Win32_Process` (filtro por nombre/linea de comando con
  "stryker"): sin ningun proceso Stryker vivo antes de arrancar (los 4
  procesos que devolvio el filtro eran, cada uno, la propia consulta
  PowerShell ejecutandose a si misma via bash -- ningun `stryker run` real).
- `pnpm exec vitest run src/lib/diseno/movimientoRespetuoso.test.ts` en
  aislamiento, antes de mutar: 9 tests, 1 fichero, verde (los 7
  originales de Ronda 1/2 mas los 2 nuevos del refuerzo: "una propiedad
  larga real (transition-duration)... tambien se senala como incumplimiento"
  y "una propiedad larga real con un espacio antes de los dos puntos...
  tambien se senala como incumplimiento").

### Corrida

```
pnpm exec stryker run --mutate src/lib/diseno/movimientoRespetuoso.ts --plugins "@stryker-mutator/vitest-runner"
```

Concurrency 1 de `stryker.config.json` (sin necesidad de forzarla por CLI).
`# timeout` fue 0 en la unica corrida (verificado en el resumen de
terminal antes de leer el score) -- no hizo falta repetir con
`--concurrency 1` explicito.

El numero total de mutantes subio de 70 (Ronda 1/2) a 74: el refuerzo de
la linea 21 (nuevo grupo opcional `(-[\w-]+)?`) anade superficie mutable
propia -- 9 mutantes de tipo Regex sobre esa linea en esta corrida, frente a
los 2 de antes.

### Resultado

| Fichero | total | killed | timeout | survived | no cov | score bruto | equivalentes | score sobre no-equivalentes | veredicto |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| movimientoRespetuoso.ts | 74 | 72 | 0 | 2 | 0 | 97.30% | 2 | 100.00% (72/72) | PASS |

Verificado dos veces: una vez contra el resumen de terminal ("All files ...
97.30 ... 72 ... 0 ... 2 ... 0 ... 0") y otra contra
`reports/mutation/mutation.json` (`file.mutants`, 74 entradas, conteo
programatico de `status`: Killed 72, Survived 2, sin ninguna entrada
Timeout ni NoCoverage).

### Mutante 21:40 (el superviviente real de la re-medicion anterior) -- ahora Killed

Los 9 mutantes de tipo Regex sobre la linea 21 en esta corrida (uno por
cada variante que Stryker genero sobre la expresion ya reforzada, incluidos
los que atacan especificamente el nuevo grupo opcional `(-[\w-]+)?` y su
clase de caracteres interna) aparecen todos Killed, confirmado
directamente contra `mutation.json` (ids 8-16, mutatorName Regex,
status Killed en los 9 casos):

- `/\s*(...)...` (quita el ancla `^`)
- `/^\s(...)...` (`\s*` a `\s`, antes del grupo de propiedad)
- `/^\S*(...)...` (`\s*` a `\S*`, antes del grupo de propiedad)
- `(-[\w-]+)` (quita el `?`, grupo obligatorio en vez de opcional) -- este
  es el que mas directamente ataca el refuerzo de la Ronda 3
- `(-[\w-])?` (quita el `+`, un solo caracter tras el guion en vez de uno
  o mas)
- `(-[^\w-]+)?` (invierte la clase de caracteres a "no palabra, no guion")
- `(-[\W-]+)?` (`\w` a `\W`, invierte solo la parte "palabra" de la clase)
- `(-[\w-]+)?\s:` (el `\s*` final, justo antes de los dos puntos a `\s`)
- `(-[\w-]+)?\S*:` (el `\s*` final a `\S*`, la variante EXACTA que
  sobrevivio en la re-medicion anterior, referenciada entonces por su columna
  antigua 21:40; en esta corrida cae dentro del mismo rango de columnas
  21:40-21:82 que agrupa los 9 mutantes de la linea, y esta Killed)

Los 2 tests nuevos del refuerzo ("transition-duration: 0.3s;" sin espacio
antes de los dos puntos y "transition-duration : 0.3s;" con espacio extra
antes de los dos puntos) juntos distinguen las 9 variantes: sin el grupo
`(-[\w-]+)?` intacto (obligatorio en vez de opcional, cuantificador o clase
de caracteres alterados), la linea sintetica "transition-duration: 0.3s;"
(o su variante con espacio) deja de matchear el patron por completo -- el
codigo real SI la reconoce como declaracion de movimiento (1 incumplimiento
esperado), asi que cualquier mutacion que rompa el grupo opcional o su
contenido hace que el test, que espera 1 incumplimiento con ruta y linea
exactas, falle y mate al mutante. El segundo test (con el espacio extra
antes de los dos puntos) ademas confirma que el `\s*` final sigue aceptando
cero o mas espacios tal y como antes.

### Equivalentes de Ronda 1 -- re-verificados, no re-analizados desde cero

Los 2 supervivientes de esta corrida coinciden EXACTAMENTE (mutatorName,
location y replacement, verificado contra `mutation.json`, no solo contra
el resumen de terminal) con los 2 equivalentes ya documentados y aceptados en
Ronda 1 y re-verificados en la re-medicion de Ronda 2:

- movimientoRespetuoso.ts:30:10-30:16, mutatorName StringLiteral,
  replacement una cadena vacia -- el codigo real dice devolver el literal
  "otro" y el mutante devuelve cadena vacia. Mismo argumento de siempre: el
  tercer miembro de TipoDeBloque (el literal "otro") nunca se compara con un
  literal concreto en ningun punto del modulo -- solo participa en
  pila.includes de "no-preference" y de "reduce", y cualquier valor de
  relleno distinto de esos dos literales es intercambiable. El refuerzo de
  la linea 21 no toca esta linea ni la logica de tipoDeAperturaEnLinea, asi
  que el argumento de equivalencia sigue aplicando sin cambios.
- movimientoRespetuoso.ts:39:32-39:34, mutatorName ArrayDeclaration,
  replacement un array con el elemento de relleno "Stryker was here" en vez
  del array vacio original. Mismo argumento: el elemento de relleno nunca es
  igual a "no-preference" ni a "reduce", y para cualquier contenido bien
  formado (incluidos los 9 tests actuales, con formas largas incluidas)
  nunca llega a afectar un pila.includes posterior. El refuerzo de la linea
  21 tampoco toca la inicializacion de la pila ni su logica de
  apilado/desapilado.

No se repite el analisis empirico/algebraico completo de Ronda 1 para estos
2 -- solo se re-verifica la coincidencia exacta de identificador
(mutatorName, location y replacement) contra el codigo actual, tal y como
pide el encargo.

### Cualquier superviviente nuevo o distinto -- no hay ninguno

Se reviso explicitamente el listado completo de `mutation.json` (no solo el
resumen de terminal) buscando cualquier mutante con status distinto de
Killed que NO fuera uno de los 2 anteriores: no aparece ninguno. En
particular, no sobrevive ningun mutante sobre el nuevo grupo opcional
`(-[\w-]+)?` ni sobre su clase de caracteres `[\w-]+` (ver el desglose de
los 9 mutantes de la linea 21 arriba, todos Killed) -- el riesgo que
anticipaba el encargo (que el grupo entero pudiera volverse opcional-
siempre-vacio, o que `[\w-]+` pudiera mutarse) no se materializo: los 2
tests del refuerzo (con y sin espacio antes de los dos puntos, ambos usando
"transition-duration", que exige que el grupo consuma "-duration" para que
el patron matchee en absoluto) cubren de forma cruzada tanto la
obligatoriedad como el contenido del grupo.

### Resumen y siguiente paso

PASS. movimientoRespetuoso.ts: 72/74 = 97.30% bruto, 72/72 = 100.00% sobre
mutantes no equivalentes (umbral: 100%). Los 2 sobrevivientes son los
mismos 2 equivalentes genuinos ya documentados y re-verificados desde
Ronda 1, sin ningun mutante nuevo o distinto. No se ha tocado src/ ni
ningun test durante esta medicion.

Con este resultado, los 6 modulos puros de sistema_de_diseno_visual (id
21) bajo src/lib/diseno/ quedan al 100% sobre no-equivalentes:
escalaEspaciado.ts (1/1), escalaTipografica.ts (13/13), puntoDeCorte.ts
(9/9) y movimientoRespetuoso.ts (72/72) medidos hoy en esta ronda y la
anterior; tokensColor.ts e inventarioModulos.ts ya PASS 100% sobre
no-equivalentes, medidos por el mutation_tester de identidad_visual (id
22, done) sobre su version actual (ver progress/mutation_identidad_visual.md).
La puerta de mutacion de sistema_de_diseno_visual (id 21) queda satisfecha
para estos 6 ficheros; cualquier bloqueo restante de la feature (si lo hay)
corresponde a otro alcance fuera de src/lib/diseno/.
