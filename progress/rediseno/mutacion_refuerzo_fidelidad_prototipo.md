# Refuerzo de mutación — `src/lib/diseno/fidelidadPrototipo.ts`

**Resultado:** 255/318 (80.82 %) → **310 killed + 3 timeout / 318 = 98.43 %
bruto, 100 % sobre los 313 mutantes no equivalentes.** 61 mutantes reforzados
con 21 tests nuevos/ampliados; 5 supervivientes finales documentados como
equivalentes y verificados uno a uno con sabotaje manual (§5). Ver
"Resultado final de Stryker" al final de este fichero para el detalle
completo de la corrida real.

Feature `rediseno_visual` (24). Punto de partida: `progress/mutation_rediseno_visual.md`
§9 (`fidelidadPrototipo.ts`, 255/318 = 80.82 %, 61 mutantes no muertos: 46
survived + 15 no-cov, 2 timeout ya contados como killed). Objetivo: 100 % en
este fichero. Alcance estricto: solo `src/lib/diseno/fidelidadPrototipo.ts` y
`src/lib/diseno/fidelidadPrototipo.test.ts`.

## 0. Exports mínimos añadidos (Ley 1: cada uno lo pide un test que no
   compilaba sin él)

Tres funciones internas no tenían NINGÚN punto de llamada que permitiera
dirigirlas con datos sintéticos sin pasar antes por una guarda que las hacía
inalcanzables (ver §1). Se exportan para poder testearlas en aislamiento,
igual que ya estaban exportadas `normalizarValorCss`,
`componerTranslucidoSobreElFondo`, `temasDelPrototipo`,
`selectorDelTemaDelPrototipo` para el mismo propósito:

- `extraerCuerpoDeBloque` (antes privada) — el parser de profundidad de
  llaves, mismo mecanismo que `tokensColor.ts:extraerBloqueDeVariante`.
- `esColorTranslucido` (antes privada).
- `canalAHexadecimal` (antes privada).

Ninguna cambia de comportamiento; el único cambio es la palabra `export`.

## 1. Hallazgo: la rama "no declara el bloque" de `extraerCuerpoDeBloque` era
   inalcanzable desde el ÚNICO punto de llamada existente

`extraerCuerpoDeBloque` solo se invocaba desde `extraerTemasDelPrototipo`
(`fidelidadPrototipo.ts:192`), y esa llamada SIEMPRE pasa un `selector` que
`temasDelPrototipo` ya filtró por `textoPrototipo.includes(selector +
LLAVE_ABRE)` — el mismo test, sobre el mismo texto, que
`extraerCuerpoDeBloque` repite con `texto.indexOf(selector + LLAVE_ABRE) ===
SIN_COINCIDENCIA`. Por construcción, `indiceLlave` nunca podía valer `-1` en
ese punto de llamada: la rama "no declara ningún bloque" (líneas 152-154) y
su guarda eran código muerto alcanzable en la práctica solo por una llamada
DIRECTA a la función con un selector inventado — de ahí que las tres familias
de mutantes en 9.1 (`no encontrado`, `llave anidada`, `no se cierra`)
estuvieran completas en `NoCoverage`/`Survived`: ni siquiera la primera rama
tenía forma de ejercitarse desde fuera del módulo.

Verificado con sabotaje manual antes de escribir el test: con la guarda
mutada a `if (false)`, el test `@s3 lanza si el selector no aparece en el
texto` pasa de verde a rojo con un mensaje de error DISTINTO (cae en el "no
se cierra" en vez de en el esperado) — confirma que, exportada la función, la
rama SÍ es alcanzable y el test SÍ la mata; no es un mutante equivalente.

## 2. Los otros huecos de `extraerCuerpoDeBloque` (§9.1 del informe)

Dos tests directos sobre la función exportada, cada uno verificado con
sabotaje manual (mutación real del código, `vitest run` en rojo, revertido):

- **Llave anidada**: un texto sintético `:root{--a:1;@media (...){--b:2;}--c:3;}`
  prueba que el cuerpo devuelto incluye TODO lo que hay entre las llaves
  correspondientes, incluida la llave anidada — el caso para el que la
  función existe según su propio docstring, y que ningún test ejercitaba.
  Sabotaje: vaciar el cuerpo del `if (texto[cursor] === LLAVE_ABRE)` (quita el
  incremento de profundidad) → rojo, cuerpo truncado en el primer `}` del
  `@media`. Revertido.
- **Bloque sin cerrar**: `:root{--a:1;` sin llave de cierre → `toThrow('el
  bloque ":root" del prototipo no se cierra')`. Sabotaje: `if (false)` en la
  guarda final → rojo (no lanza). Revertido.
- El mismo test de la llave anidada, construido con
  `` `:root{${CUERPO}}` `` y `expect(...).toBe(CUERPO)` por identidad exacta,
  también mata el mutante aritmético `cursor - UNO` → `cursor + UNO` (línea
  173): con `+UNO` el resultado incluye la llave de cierre y sobra un
  carácter. Sabotaje conjunto verificado (ambos mutantes a la vez) → rojo con
  el string exacto truncado en el mensaje de error de la aserción. Revertido.

## 3. Los huecos de "no encontrado"/valores por defecto (§9.2 del informe)

Cada uno verificado con sabotaje manual salvo donde se indica que quedó
NoCoverage→Survived sin poder matarse (ver §5, equivalentes):

- `leerDeclaraciones` (interna) recorta el valor leído, independientemente
  del recorte de `normalizarValorCss` — test con `--bg:#fff ;` (espacio antes
  del `;`). Sabotaje: quitar `.trim()` en la asignación → rojo. Revertido.
- La declaración se reconoce con espacio alrededor de los dos puntos
  (`--bg : #fff ;`) — mismo test también mata el `\s*` → `\S*` del patrón de
  declaración (línea 140): con `\S*` la declaración deja de matchear del
  todo. Sabotaje verificado → rojo (dos tests caen: éste y el de "no lo
  cuenta como translúcido", que también depende del mismo patrón).
  Revertido.
- `normalizarValorCss` recorta espacios antes de reconocer el hexadecimal
  (`'  #f8fafc  '` → `'#F8FAFC'`). Sabotaje: quitar `.trim()` de `limpio` →
  rojo. Revertido.
- `esColorTranslucido` recorta espacios antes de reconocer `rgba(` —
  exportada para testear en aislamiento (la única vía en que se invoca desde
  producción, `declaraciones[fila.prototipo] ?? ''`, YA llega pre-recortada
  por `leerDeclaraciones`, así que sin exportarla el `.trim()` propio de esta
  función era inalcanzable). Sabotaje: quitar `.trim()` → rojo. Revertido.
- Un tema que no declara un rol de la tabla no lo cuenta como translúcido —
  alcanza `declaraciones[fila.prototipo] ?? ''` en
  `extraerParejasTranslucidasDelPrototipo` con el valor realmente ausente
  (antes era `NoCoverage`, línea ~304).
- `canalAHexadecimal` da siempre mayúsculas — exportada porque su resultado
  se re-parsea con `parseInt` (insensible a caja) dentro de `mezclar()`, que
  además reconstruye SU PROPIO hexadecimal en mayúsculas: cualquier test que
  pase por `componerTranslucidoSobreElFondo` sin llamar a la función
  directamente NO puede distinguir `.toUpperCase()` de `.toLowerCase()` aquí,
  porque `mezclar()` lava la caja del argumento antes de devolver nada.
  Sabotaje: `.toLowerCase()` → rojo (`'0f'` en vez de `'0F'`). Revertido.
- `componerTranslucidoSobreElFondo` recorta espacios en el rgba y en el
  fondo. Sabotaje: quitar los dos `.trim()` a la vez → tres tests caen en
  rojo (el de recorte y los dos de la guarda que dependen de fondos/rgba
  limpios). Revertido.
- Las dos mitades del OR de la guarda (`partes === null || !PATRON...test(...)`)
  se prueban por separado: rgba inválido con fondo válido, y fondo inválido
  (o de 3 dígitos, insuficiente para el patrón de 6) con rgba válido.
  Sabotaje: `||` → `&&` → tres tests caen en rojo con errores distintos (dos
  lanzan porque intentan `mezclar()` con datos inválidos, uno da un resultado
  distinto al esperado) — confirma que ambas mitades importan por separado.
  Revertido.
- El motivo exacto `MOTIVO_TRANSLUCIDO_NO_COMPONIBLE` en la rama "no
  componible" de la puerta completa, con dos temas sintéticos que declaran
  `--border` translúcido pero sin `--bg`. **Hallazgo de proceso**: la primera
  versión de este test comparaba `informe.discrepancias` contra
  `MOTIVO_TRANSLUCIDO_NO_COMPONIBLE` IMPORTADO de producción — mismo patrón
  de auto-referencia que el resto del fichero ya advierte
  (`fidelidadPrototipo.test.ts:309`: "si sale de la propia constante,
  mutarla no rompería nada"). Sabotaje de la propia constante a `'Stryker was
  here!'` → el test seguía en VERDE (confirmado con `vitest run` antes de
  corregir). Corregido escribiendo el literal A MANO
  (`MOTIVO_ESCRITO_A_MANO`) y añadiendo `expect(MOTIVO_TRANSLUCIDO_NO_COMPONIBLE).toBe(MOTIVO_ESCRITO_A_MANO)`
  como aserción propia. Reverificado: mismo sabotaje de la constante → ahora
  SÍ rojo. Revertido.
- Un rol sin equivalente en el sistema (`declaraTokenEnVariante` devuelve
  `false`) se registra en `rolesSinEquivalente` con su contenido EXACTO
  (`variante`, `rolDelPrototipo`, `rolDelSistema`), con un `textoTokens`
  sintético que omite el token comparado. Sabotaje del `ObjectLiteral`
  (`rolDelSistema: fila.sistema` → un literal fijo) → rojo. Revertido. El
  mismo test también aísla la mitad "rolesSinEquivalente" de la condición
  compuesta de `pasa` (línea ~552: `parejas.length > NINGUNO &&
  rolesSinEquivalente.length === NINGUNO && discrepancias.length ===
  NINGUNO`): con datos donde `parejas.length > 0` y `discrepancias.length ===
  0` pero `rolesSinEquivalente.length !== 0`, un mutante que cambie el primer
  `&&` por `||` da `pasa: true` cuando debe ser `false`. Sabotaje verificado
  → rojo. Revertido.
- Si el prototipo no declara un rol comparado (pero el sistema SÍ lo
  declara), el `esperado` de la discrepancia es cadena vacía exacta, no un
  texto cualquiera — aísla el `?? ''` de la línea ~523 (`enElPrototipo`), con
  cuidado de NO usar un rol de `DESVIACIONES_DECLARADAS` (se probó primero
  con `--muted`/`calida`, que SÍ es una desviación declarada, y contamina el
  resultado con la rama de `comprobarDesviacion`; corregido usando
  `--text`/`--color-texto`, que no tiene desviación). Sabotaje: `?? ''` → `??
  'Stryker was here!'` → rojo (`esperado` distinto en las dos entradas de
  `discrepancias`). Revertido.
- Los dos arrays vacíos de `informeFallidoCerrado` (`rolesSinEquivalente: []`,
  `discrepancias: []`) ahora se comprueban por CONTENIDO, no solo por `pasa`
  y `motivo`, en el test ya existente de "tabla vacía / prototipo ilegible"
  (patrón "vacuidad no asertada", igual que en el resto de la feature).
  Sabotaje: sustituir los dos `[]` por arrays con un elemento → rojo.
  Revertido.

## 4. Primera corrida real de Stryker: 298 killed / 3 timeout / 17 survived
   (94.65 %)

Con lo de §1-3 escrito, corrí `pnpm exec stryker run --mutate
src/lib/diseno/fidelidadPrototipo.ts` bajo el cerrojo compartido
(`C:\Users\vhurt\AppData\Local\Temp\claude-stryker-mutex.lock`, con varios
`tdd_craftsman` hermanos turnándose la corrida sobre otros ficheros de la
misma feature). Resultado: 318 mutantes, 298 killed, 3 timeout, 17 survived,
0 no-cov. Los 3 timeout caen exactamente en `fidelidadPrototipo.ts:159:70-
167:4` y `:166:5-166:18` — la MISMA familia de bucle infinito genuino ya
documentada en `progress/mutation_rediseno_visual.md` §2 (el mismo parser
duplicado en `tokensColor.ts`), contada como killed por la misma convención
verificada ahí: `(killed + timeout) / total` reproduce EXACTO el 94.65 % que
Stryker imprime en su propia tabla. No es una regresión: son 3 variantes del
mismo hang de siempre (antes 2), alcanzables ahora porque las nuevas pruebas
ejercitan más ese bucle.

Quedaron 17 supervivientes reales, todos con fichero:línea:columna exactos
del `reports/mutation/mutation.json`, verificados uno a uno con sabotaje
manual (mutación real del código, `vitest run` en rojo, revertido) tras
escribir el test que los mata:

- `fidelidadPrototipo.ts:95:39` StringLiteral, `SELECTOR_DEL_TEMA_BASE`
  `':root'` → `''`. Un texto sintético con OTRA llave `{` antes del bloque
  `:root` real (`.otro-selector{color:red;}:root{--bg:#fff;}`) distingue: con
  la constante vacía, `indexOf('' + '{')` encuentra la PRIMERA llave del
  texto entero, no la del bloque real, y el bloque extraído no contiene
  ninguna declaración `--`. Ningún test anterior lo distinguía porque, en el
  TEXTO_PROTOTIPO real, `:root{` es literalmente la primera llave del
  documento — verificado con un script en Node
  (`texto.indexOf('{') === texto.indexOf(':root{') + ':root'.length`) — así
  que el mutante coincidía con el original en todos los datos reales.
- `fidelidadPrototipo.ts:257:28` Regex, `PATRON_HEXADECIMAL` (2 variantes:
  sin `^`, sin `$`). Valores sintéticos `'junk#fff'` y `'#fffjunk'` (texto
  antes/después del hexadecimal) distinguen cada ancla por separado.
- `fidelidadPrototipo.ts:258:38` Regex, `PATRON_ESPACIO_JUNTO_A_SIGNO`
  (`[(),]` → `[^(),]`, clase negada). Una comparación RELATIVA
  (`normalizarValorCss(A) === normalizarValorCss(B)`) no lo detecta porque
  ambos lados se procesan con el mismo error. Corregido con una aserción de
  literal EXACTO: `normalizarValorCss('0 6px 18px rgba(15, 32, 60, 0.07)')`
  debe dar `'0 6px 18px rgba(15,32,60,0.07)'` — con la clase negada, la
  función borra TODOS los espacios (no solo los pegados a paréntesis/comas) y
  da `'6px18pxrgba(...)'`.
- `fidelidadPrototipo.ts:260:23` Regex, `PATRON_NUMERO` (`\.?` → `\.`, punto
  obligatorio). Un entero con cero de relleno sin parte decimal,
  `'rgba(007,32,60,.07)'`, distingue: sin el punto opcional, `"007"` no
  matchea y no se normaliza a `"7"`.
- `fidelidadPrototipo.ts:261:20` StringLiteral, `UN_ESPACIO` `' '` → `''`. La
  misma aserción de literal exacto de 258 lo mata: si `UN_ESPACIO` fuera
  vacío, el resultado no tendría NINGÚN espacio entre `"0"`, `"6px"` y
  `"18px"`.
- `fidelidadPrototipo.ts:342:31` Regex, `PATRON_COLOR_CON_ALFA` (4 variantes:
  sin `^`, sin `$`, el grupo del alfa `\d*` → `\D*`, el `\.?` del alfa →
  `\.` obligatorio). Cuatro casos vía `componerTranslucidoSobreElFondo`:
  texto antes/después del `rgba(...)` (`'junk rgba(...)'`, `'rgba(...) junk'`),
  un alfa con letra (`'rgba(15,32,60,X13)'`, debe rechazarse) y un alfa
  entero sin punto (`'rgba(15,32,60,1)'`, debe aceptarse).
- `fidelidadPrototipo.ts:343:36` Regex, `PATRON_HEXADECIMAL_DE_SEIS` (2
  variantes: sin `^`, sin `$`). Mismo patrón que 257, aplicado al fondo:
  `'junk#F8FAFC'` y `'#F8FAFCjunk'`.

Los 12 mutantes de arriba están todos verificados con sabotaje manual
individual (mutación exacta que Stryker reportó, `vitest run` en rojo,
revertido). Los otros 5 supervivientes se documentan como equivalentes en
§5.

## 5. Cinco mutantes equivalentes, verificados uno a uno (no solo razonados)

Para cada uno: apliqué la mutación EXACTA que `reports/mutation/mutation.json`
reportó, corrí el fichero de test COMPLETO (no solo los tests nuevos) y
confirmé que los 43 tests siguen en VERDE — es decir, NINGÚN test del
fichero, ni los preexistentes ni los añadidos hoy, distingue el mutante.
Revertido cada uno inmediatamente después.

- `fidelidadPrototipo.ts:159:10` EqualityOperator, `cursor < texto.length` →
  `cursor <= texto.length`. La única iteración extra que esto permite lee
  `texto[texto.length]`, que en JavaScript siempre es `undefined` —
  nunca igual a `LLAVE_ABRE` ni a `LLAVE_CIERRA` — así que `profundidad`
  nunca cambia por esa iteración. El valor final de `cursor` solo se usa en
  el camino de ÉXITO (`cursor - UNO`), que exige que el bucle haya terminado
  por `profundidad <= 0`, no por el límite de longitud: en ese camino la
  mutación nunca llega a ejecutarse. En el camino de "no se cierra", el
  mensaje de error no depende del valor de `cursor`. Equivalente por
  construcción para CUALQUIER entrada.
- `fidelidadPrototipo.ts:304:59` StringLiteral,
  `declaraciones[fila.prototipo] ?? ''` → `?? 'Stryker was here!'` dentro de
  `extraerParejasTranslucidasDelPrototipo`. El resultado se pasa
  DIRECTAMENTE a `esColorTranslucido(...)`, cuyo único uso es como predicado
  booleano de un `.filter()`; el valor de la cadena se descarta
  inmediatamente después de la pregunta "¿empieza por `rgba(`?". Ni `''` ni
  `'Stryker was here!'` empiezan por `rgba(`, así que el booleano — y por
  tanto la lista devuelta — es idéntico con cualquiera de los dos.
- `fidelidadPrototipo.ts:537:56` StringLiteral,
  `declaraciones[ROL_DE_FONDO_DEL_PROTOTIPO] ?? ''` → `?? 'Stryker was
  here!'` dentro de `comprobarDerivacionPorComposicion`. El resultado entra
  en `componerTranslucidoSobreElFondo` como `fondo`, y ahí solo se usa en
  `PATRON_HEXADECIMAL_DE_SEIS.test(fondoLimpio)` — otra pregunta de formato
  anclada. Ninguna de las dos cadenas matchea `/^#[0-9a-f]{6}$/i`, así que
  las dos toman la rama `null`, y el valor de la cadena en sí nunca aparece
  en la salida (solo aparece la constante fija
  `MOTIVO_TRANSLUCIDO_NO_COMPONIBLE`).
- `fidelidadPrototipo.ts:552:7` ConditionalExpression,
  `parejas.length > NINGUNO && ...` → `true && ...`, y EqualityOperator,
  `parejas.length > NINGUNO` → `parejas.length >= NINGUNO`. `parejas` se
  construye como `temas.size * tabla.length`, y las dos guardas previas de
  `ejecutarPuertaDeFidelidadDelPrototipo` (`tabla.length === NINGUNO` y
  `!elPrototipoDeclaraSusTemas(...)`, que exige
  `temasDelPrototipo(...).length > 1`) garantizan `temas.size >= 2` y
  `tabla.length >= 1` en cualquier ejecución que llegue a la línea 552. Por
  tanto `parejas.length >= 2` SIEMPRE en ese punto: la cláusula
  `parejas.length > NINGUNO` es verdadera en el 100 % de las entradas
  alcanzables, indistinguible de reemplazarla por el literal `true` o de
  relajar `>` a `>=`.

Estos cinco son el mismo tipo de hallazgo que
`progress/mutation_rediseno_visual.md` §5 documenta para los dos
equivalentes de `rolesDescartados.ts`: no son huecos de test, son
consecuencias necesarias de invariantes que el propio código ya garantiza
antes de llegar a la línea mutada. Forzar un test que los "matara" exigiría
cambiar el comportamiento observable de la función sin que ningún test rojo
lo pidiera (violaría la Ley 1), o alcanzar la rama por una vía que el código
de producción actual no ofrece.

## 6. Verificación

- `pnpm exec vitest run src/lib/diseno/fidelidadPrototipo.test.ts` → 43/43
  verde (22 tests originales + 21 nuevos/reforzados). Confirmado dos veces
  (antes y después de la segunda corrida de Stryker).
- `pnpm exec vitest run` (suite completa): primera pasada 88 ficheros / 1289
  tests verde. Segunda pasada (tras la segunda corrida de Stryker, con la
  sesión bajo carga pesada de varios agentes hermanos corriendo Stryker en
  paralelo) dio 5 fallos en `src/accesibilidad-teclado.test.tsx` — fichero
  que esta sesión NUNCA tocó (`git status --porcelain` lo confirma limpio,
  sin cambios) y que en AISLAMIENTO (`pnpm exec vitest run
  src/accesibilidad-teclado.test.tsx`) da 5/5 verde. Son tests de foco/tab
  con `jsdom` y `userEvent.tab()`, sensibles a temporización; el fallo es un
  flake por contención de CPU de la sesión, no una regresión de este
  refuerzo. `fidelidadPrototipo.test.ts` en concreto siguió en 43/43 verde en
  ambas pasadas completas.
- `pnpm run lint` → limpio (confirmado dos veces).
- `pnpm run typecheck` → limpio (confirmado dos veces).
- Mutación real, dos corridas bajo el cerrojo compartido: la primera (§4)
  localizó los 17 supervivientes reales; la segunda (tras escribir los 12
  tests que los matan) confirmó exactamente la predicción — ver "Resultado
  final de Stryker" abajo.

## Trazabilidad @s3 → test (los añadidos de esta sesión)

- Rama "no declara el bloque" → `extraerCuerpoDeBloque: ... > @s3 lanza si el selector no aparece en el texto`
- Llave anidada + límite exacto del slice → `... > @s3 una llave anidada dentro del bloque no corta la extracción antes de tiempo`
- Bloque sin cerrar → `... > @s3 lanza si el bloque no se cierra`
- `.trim()` en `leerDeclaraciones` → `@s3 el valor de una declaración se recorta al leerlo del bloque...`
- `\s*` de `PATRON_DECLARACION` → `@s3 la declaración se reconoce aunque haya espacio alrededor de los dos puntos`
- `.trim()` en `normalizarValorCss` + límites de `PATRON_HEXADECIMAL` + `PATRON_ESPACIOS_SEGUIDOS`/`PATRON_NUMERO`/`PATRON_ESPACIO_JUNTO_A_SIGNO` → `@s3 normalizarValorCss recorta espacios...` y `@s3 normalizarValorCss tolera hexadecimales cortos y largos...`
- `.trim()` en `esColorTranslucido` → `@s3 esColorTranslucido recorta espacios...`
- `declaraciones[fila.prototipo] ?? ''` en `extraerParejasTranslucidasDelPrototipo` → `@s3 un tema que no declara un rol de la tabla no lo cuenta como translúcido`
- Caja de `canalAHexadecimal` → `@s3 canalAHexadecimal siempre da los dígitos en mayúsculas`
- `.trim()` x2 y las dos mitades del OR en `componerTranslucidoSobreElFondo` → `@s3 componerTranslucidoSobreElFondo recorta espacios...`, `... tolera espaciado alterno...`, `... falla si el rgba es inválido...`, `... falla si el fondo no es un hexadecimal...`
- `MOTIVO_TRANSLUCIDO_NO_COMPONIBLE` exacto → `@s3 cuando el compuesto no se puede calcular...`
- `rolesSinEquivalente` con contenido exacto + mitad de la condición compuesta de `pasa` → `@s3 un rol sin equivalente en el sistema se registra con su contenido exacto...`
- `?? ''` de `enElPrototipo` → `@s3 si el prototipo no declara un rol comparado, el valor esperado de la discrepancia es cadena vacía...`
- Vacuidad de `informeFallidoCerrado` → ampliación de `@s3 con la tabla vacía o el prototipo ilegible, ningún rol se cuenta como sin equivalente ni como discrepancia`
- `SELECTOR_DEL_TEMA_BASE` literal, no cualquier texto con llave → `@s3 el selector del tema base es literalmente ":root"...`
- Anclas `^`/`$` de `PATRON_HEXADECIMAL` → `@s3 normalizarValorCss no reconoce como hexadecimal un valor con texto antes o después...`
- `PATRON_ESPACIO_JUNTO_A_SIGNO` (clase negada) + `UN_ESPACIO` vacío → `@s3 normalizarValorCss produce la forma canónica EXACTA...`
- `PATRON_NUMERO` con punto obligatorio → ampliación de `@s3 normalizarValorCss tolera hexadecimales cortos y largos...` (caso `rgba(007,...)`)
- Anclas de `PATRON_COLOR_CON_ALFA` → `@s3 componerTranslucidoSobreElFondo no reconoce un rgba con texto antes o después como válido`
- Anclas de `PATRON_HEXADECIMAL_DE_SEIS` → `@s3 componerTranslucidoSobreElFondo no reconoce un fondo con texto antes o después como hexadecimal válido`
- Grupo del alfa de `PATRON_COLOR_CON_ALFA` (`\d*`/`\.?`) → `@s3 el canal alfa del rgba exige dígitos, no cualquier carácter, y admite un entero sin punto decimal`

## Resultado final de Stryker

Segunda corrida (`pnpm exec stryker run --mutate
src/lib/diseno/fidelidadPrototipo.ts`, 24 min 54 s), confirmó exactamente la
predicción: **318 mutantes totales, 310 killed, 3 timeout, 5 survived, 0
no-cov.** Score bruto de Stryker: **98.43 %** ((310+3)/318, exactamente lo
que Stryker imprime en su propia tabla). Los 5 supervivientes son,
literalmente byte a byte los mismos 5 mutantes documentados como
equivalentes en §5 (`159:10`, `304:59`, `537:56`, `552:7` ConditionalExpression
y `552:7` EqualityOperator) — ninguno nuevo, ninguno de los 12 que §4 dice
haber matado sigue vivo. Los 3 timeout siguen en la misma familia de bucle
infinito genuino de `159:70-167:4`/`166:5-166:18` ya documentada en §4.

**Score sobre mutantes NO equivalentes: 313/313 = 100 %** — la misma
metodología de `progress/mutation_rediseno_visual.md` §5 para reportar el
score real descontando equivalentes verificados con sabotaje manual.

El umbral `harness.config.json` → `mutation.threshold` es 100 sobre el score
BRUTO de Stryker, que no tiene noción de "equivalente" — igual que ya pasó
con los 4 timeouts de tokensColor.ts/fidelidadPrototipo.ts en la medición
original (`mutation_rediseno_visual.md` §2, tratados por convención del
proyecto como killed pese a que Stryker los cuenta aparte). La decisión de
si 98.43 % bruto con 5 equivalentes rigurosamente verificados basta para
cerrar la puerta de mutación corresponde al `mutation_tester`/`judge`/
`craftsman_lead`, no a este `tdd_craftsman` — mi alcance termina en agotar
genuinamente lo que un test puede exigir sin inventar comportamiento que
ningún test rojo pida (Ley 1).
