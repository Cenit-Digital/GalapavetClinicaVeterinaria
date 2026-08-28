# Refuerzo de mutación — `src/lib/diseno/tokensColor.ts`

Encargo de `craftsman_lead`: cerrar los 103 mutantes no muertos de este
fichero (informe `progress/mutation_rediseno_visual.md`, sección 6,
96/199 = 49.25 %). Alcance estricto: `tokensColor.ts` y `tokensColor.test.ts`.

## 1. Código huérfano (sección 6.1 del informe) — borrado, verificado dos veces

Grep propio, independiente del informe, antes de tocar nada:

```
grep -rn "MATRIZ_DE_USO_MARCA\|resolverMatrizDeUso\|motivoDeVacuidadDeVariantes\|ejecutarComprobacionDeContrasteDeVariantes" src/
```

Resultado: únicamente las 5 líneas de su propia declaración dentro de
`tokensColor.ts` (293, 312, 328, 339, 343). Ningún import, ninguna llamada
desde otro fichero de producción ni de test. Confirmado también con un grep
separado de `EntradaDeMatrizDeUso` e `InformeContrasteDeVariantes`:

- `EntradaDeMatrizDeUso` (la interfaz, no el array) **SÍ tiene consumidor
  real**: `matrizDeContraste.ts` y `matrizDeContraste.test.ts` la importan.
  **Se conservó.**
- `InformeContrasteDeVariantes` no tiene consumidor fuera de su propia
  declaración y de la función que se borraba junto con ella. Se borró con el
  resto.

**Borrado** (tokensColor.ts, antiguas líneas ~286-349): el docstring y el
array `MATRIZ_DE_USO_MARCA`, la función `resolverMatrizDeUso`, la constante
`CERO_VARIANTES`, la interfaz `InformeContrasteDeVariantes`, la función
`motivoDeVacuidadDeVariantes` y la función
`ejecutarComprobacionDeContrasteDeVariantes`. El import de la cabecera se
redujo de
`import { ejecutarPuertaDeContraste, type ParDeContraste, type UsoDeColor } from '../contraste'`
a `import type { UsoDeColor } from '../contraste'` (los otros dos símbolos
solo los usaban las funciones borradas).

Ningún test en `tokensColor.test.ts` importaba estos símbolos (confirmado
antes de borrar), así que no hubo que tocar el test file para esta parte.

**Efecto en mutantes**: el fichero pasó de 199 a 139 mutantes totales
(-60, exactamente lo que el informe atribuía a este código muerto).

## 2. Tests nuevos añadidos (16 en total, 16 → 32 tests en el fichero)

### 2.1 Parser de profundidad de llaves (`extraerBloqueDeVariante`) — sección 6.2

Describe `tokensColor.ts extrae el bloque de una variante siguiendo la
profundidad de llaves`:

- Encabezado de variante no encontrado en el texto → lanza.
- Encabezado encontrado pero sin llave de apertura → lanza (mismo mensaje).
- Bloque que nunca cierra su llave → lanza `"...no se cierra: falta la
  llave de cierre"`.
- **Bloque con una llave anidada real** (un `@media` sintético dentro del
  bloque de la variante): comprueba que el primer `--color-fondo` es el del
  propio selector (no el redeclarado dentro de `@media`) y que
  `--color-texto`, declarado DESPUÉS de la llave anidada, se encuentra —
  solo posible si el parser contó la apertura Y el cierre de `@media` en vez
  de cortar el bloque en la primera `"}"`.
- Deduplicación de variantes cuyo selector aparece repetido en el texto.
- **Test de límite exacto del `slice`**: un texto donde, justo tras la `"}"`
  de cierre del bloque, hay un `";"` suelto, y dentro del bloque una
  declaración de `--sombra-reposo` SIN su propio `";"`. Si el slice se
  colara un carácter de más (la propia `"}"` de cierre) más el `";"` de
  fuera, la declaración parecería completarse con ese `";"` ajeno. Verificado
  antes con un script de Node (ver §4) que esto distingue exactamente
  `cursor - UNO` de `cursor + UNO`.

### 2.2 Mensajes de error exactos de "no encontrado" — sección 6.3

Describe `tokensColor.ts lanza el mensaje exacto cuando el rol o el token
pedido no existe`, con bloques sintéticos incompletos (un solo token
declarado):

- `leerTokenDeVariante` con un rol ausente → mensaje exacto.
- `leerDeclaracionDeVariante` con un token ausente → mensaje exacto.
- `leerDeclaracionDeVariante` recorta espacios sobrantes alrededor del valor
  (con un texto sintético con espacios extra antes Y después del valor, algo
  que ningún dato real de `_tokens.scss` ejercitaba).
- `leerTokenDeRaizSinAtributo`/`leerDeclaracionDeRaizSinAtributo`: mismo
  patrón para el bloque `:root` sin atributo, más un test de "no existe
  ningún bloque `:root` sin atributo" y un test de que el patrón reconoce el
  bloque **sin espacio** entre `:root` y `{` (verificado con Node, ver §4).

### 2.3 `comprobarInventarioDeTokens` — sección 6.4

Describe `comprobarInventarioDeTokens distingue "aprobado" de "con
faltantes" en un catálogo no vacío`:

- Catálogo no vacío que aprueba (todos los pares presentes).
- Catálogo no vacío con al menos un faltante (`pasa: false`, con el array de
  faltantes comprobado por contenido exacto).
- **Catálogo de variantes vacío** (con el inventario real de 20 tokens):
  `paresComprobados: 0`, `faltantes: []`, `pasa: false`. Esta es la que
  distingue el `&&` de un `||`/`>=` en la guarda de vacuidad: con el único
  test previo (100 pares, todos presentes) ambas mitades de la condición ya
  salían verdaderas, así que ningún mutante de esa familia se detectaba.

## 3. Mapa `@s → test` (trazabilidad)

Los tests nuevos son refuerzo de mutación sobre comportamiento YA cubierto
por los escenarios `@s1-@s12` existentes (que siguen intactos y en verde);
no son escenarios nuevos del `.feature`, así que no llevan etiqueta `@s`
propia — mismo patrón que el test preexistente `"lee las sombras sin
reinterpretar su valor CSS"`. Cada uno prueba una RAMA del mismo mecanismo
interno (`extraerBloqueDeVariante`, los cuatro lectores, y
`comprobarInventarioDeTokens`) que los escenarios `@s2`, `@s4`, `@s5` y
`@s12` ya ejercitan en su camino feliz con datos reales.

## 4. Verificación de los tests más delicados con Node antes de escribirlos

Antes de añadir los dos tests más sutiles (el de "límite exacto del slice" y
el de "sin espacio antes de la llave"), reproduje la mutación a mano en un
script de Node aparte y comprobé la diferencia observable:

```js
// ArithmeticOperator cursor-UNO -> cursor+UNO
CORRECT bloque: "\n  --sombra-reposo: 0 6px black\n"
MUTANT  bloque: "\n  --sombra-reposo: 0 6px black\n};"
CORRECT match: null
MUTANT  match: [ '--sombra-reposo: 0 6px black\n};', '0 6px black\n}', ... ]

// Regex \s* -> \s
original.exec(":root{--color-fondo: #ABCDEF;}") -> match
mutant.exec(":root{--color-fondo: #ABCDEF;}")    -> null
```

Confirmado que ambos tests distinguen exactamente lo que debían antes de
gastar una corrida de Stryker en comprobarlo.

## 5. Corridas de Stryker (protocolo de cerrojo compartido)

`craftsman_lead` lanzó 5 agentes hermanos en paralelo sobre el resto de la
superficie de mutación, todos compitiendo por el mismo directorio temporal
fijo de Stryker (`tempDirName: ".stryker-tmp"`). Seguí el protocolo de
cerrojo que impuso a media tarea (fichero fuera del repo
`claude-stryker-mutex.lock`, creación exclusiva antes de cada corrida,
borrado inmediato al terminar) en las CUATRO corridas de Stryker que lancé.

### Corrida 1 (tras borrar el código huérfano + escribir los primeros 13 tests)

- Primer intento de dry-run: falló por un test AJENO en rojo
  (`rolesDescartados.test.ts`, de un agente hermano a mitad de su propio
  ciclo rojo-verde). Solté el cerrojo de inmediato y esperé a que el hermano
  lo pusiera en verde antes de reintentar — no es mi fichero, no lo toqué.
- Segundo intento: el proceso hijo de Stryker murió con
  `exit code 3221225794` (violación de acceso / posible OOM) a mitad de
  corrida, bajo carga extrema del sistema (~70 procesos `node.exe` con 6
  agentes corriendo Stryker/Vitest a la vez). Solté el cerrojo, esperé, y
  reintenté.
- Tercer intento: completó en 13 min 33 s. **95.68 %** — 129 killed, 4
  timeout, 6 survived, 0 no-cov, sobre 139 mutantes totales.

Localicé los 6 survivors y los 4 timeout exactos con el JSON del reporte
(`reports/mutation/mutation.json`), no solo con el resumen de consola.

### Corrida 2 (tras añadir los 3 tests que cierran 4 de los 6 survivors)

Completó en 15 min 33 s. **98.56 %** — 133 killed, 4 timeout, **2
survived**, 0 no-cov, sobre los mismos 139 mutantes totales.

Los 4 timeout y los 2 survived son EXACTAMENTE los mismos, mutante a
mutante (mismo fichero:línea:columna), en ambas corridas — mismo criterio
de reproducibilidad que ya usó `mutation_tester` en el informe original
para descartar contención de CPU como causa.

## 6. Los 4 timeout: 2 ya documentados + 2 nuevos, los 4 genuinos (no una regresión)

- `tokensColor.ts:137:74-145:4` (BlockStatement, cuerpo del `while`
  vaciado) y `tokensColor.ts:144:5-144:18` (AssignmentOperator, `cursor +=
  UNO` → `cursor -= UNO`): **son los mismos 2 timeout YA documentados** en
  `progress/mutation_rediseno_visual.md` sección 2, mismas líneas y
  columnas exactas. No es una regresión.
- `tokensColor.ts:137:10-72` (LogicalOperator, `&&` → `||`) y
  `tokensColor.ts:137:10-35` (ConditionalExpression, `cursor <
  textoScss.length` → `true`): **nuevos**, causados por mi propio test de
  "bloque sin cerrar" (§2.1). Verificado por qué son un cuelgue genuino y no
  ruido de contención: con un bloque que nunca cierra, `profundidad` se
  queda en `1` para siempre. La condición mutada pasa a depender SOLO de
  `profundidad > 0` (con `||`, en cuanto `cursor` supera la longitud del
  texto, la mitad `cursor < length` ya no importa porque la otra mitad basta
  para mantener el `||` en verdadero; con la sustitución directa por `true`
  ocurre lo mismo). Como `profundidad` nunca cambia, el bucle no tiene
  ninguna condición de parada: `cursor` crece sin límite (no hay excepción
  por indexar una cadena fuera de rango en JS, siempre da `undefined`) y el
  bucle jamás termina. Confirmado por ser el MISMO PAR exacto de mutantes en
  las dos corridas independientes.

## 7. Los 2 survivors restantes: mutantes equivalentes, verificados con rigor

### 7.1 `tokensColor.ts:125:34` — ConditionalExpression, `coincidenciaEncabezado.index === undefined` → `false`

```ts
if (!coincidenciaEncabezado || coincidenciaEncabezado.index === undefined) {
```

El operando derecho del `||` solo se evalúa cuando `coincidenciaEncabezado`
es verdadero (hubo match). Por especificación de ECMAScript,
`String.prototype.match()` con una regex sin `global` devuelve `null` si no
hay coincidencia, o un array cuyo `.index` es SIEMPRE un número si la
devuelve — nunca `undefined` cuando el array existe. Ese operando es código
defensivo exigido por el tipo `RegExpMatchArray.index?: number` de
TypeScript, pero inalcanzable en la ejecución real: ningún test, con
cualquier entrada posible, puede hacer que `coincidenciaEncabezado.index`
sea `undefined` cuando `coincidenciaEncabezado` ya es verdadero. Sustituirlo
por `false` no cambia ningún resultado observable. Equivalente por
construcción del lenguaje, no por falta de un test.

### 7.2 `tokensColor.ts:137:10` — EqualityOperator, `cursor < textoScss.length` → `cursor <= textoScss.length`

```ts
while (cursor < textoScss.length && profundidad > PROFUNDIDAD_CERRADA) {
```

Cuando el bloque SÍ cierra correctamente, la condición de parada la decide
siempre `profundidad > 0` (se vuelve falsa en la misma iteración que
procesa la llave de cierre), nunca la comparación de `cursor`: da igual `<`
o `<=`, el resultado final (valor de `cursor` al salir, y por tanto el
`slice` que se devuelve) es idéntico.

Cuando el bloque NO cierra (caso ya cubierto por mi test de "bloque sin
cerrar"), la única diferencia que introduce `<=` es UNA iteración extra que
lee `textoScss[cursor]` con `cursor === textoScss.length` — en JS, indexar
una cadena en o más allá de su longitud siempre da `undefined`, que no es
igual a `LLAVE_ABRE` ni a `LLAVE_CIERRA`, así que `profundidad` no cambia en
esa iteración extra. El bucle sigue terminando por la MISMA razón (con
`cursor` habiendo crecido un paso más) y cae en la MISMA rama de "no se
cierra", con el MISMO mensaje. Ninguna entrada posible hace observable la
diferencia entre `<` y `<=` a través de las funciones públicas del módulo
(todas leen el resultado con expresiones regulares que ignoran caracteres
de más al final, y el único punto donde el valor exacto de `cursor`
importa — el `slice` del camino de éxito — nunca llega a ejecutarse con un
`cursor` distinto). Equivalente por construcción.

Ambos son del mismo tipo de hallazgo que los 2 equivalentes ya documentados
en `progress/mutation_rediseno_visual.md` sección 5 para
`rolesDescartados.ts` (mismo rigor: verificación por construcción del
lenguaje/regex, no solo "no se me ocurre un test").

## 8. Resultado final

- `tokensColor.ts`: 199 → 139 mutantes totales (-60 por el borrado de
  código huérfano).
- Score bruto final: **98.56 %** (133 killed + 4 timeout + 2 survived).
- Score sobre no-equivalentes: **137/137 = 100 %** de lo que es
  genuinamente detectable — los 2 survivors restantes son equivalentes
  verificados por construcción (§7), no huecos de test.
- No quedó ningún hueco de cobertura real: cada uno de los 103 mutantes no
  muertos originales quedó o bien eliminado (60, código huérfano), o
  matado por un test nuevo (39: 6 supervivientes + 33 que ya caían dentro
  de las mismas ramas reforzadas), o confirmado como timeout genuino (4, 2
  ya documentados + 2 nuevos, mismo criterio de "cuelgue real" que el
  informe original), o documentado como equivalente con prueba (2).

## 9. Verificación final

1. `pnpm exec vitest run src/lib/diseno/tokensColor.test.ts` → **32/32
   verde** (16 tests preexistentes + 16 nuevos).
2. `pnpm exec vitest run` (suite completa) → **88 ficheros / 1300 tests,
   100 % verde**. (Durante el trabajo, la suite completa pasó por estados
   rojos intermitentes en `datosDelSitio.test.ts` y `rolesDescartados.test.ts`
   — ficheros de agentes hermanos a mitad de su propio ciclo TDD, no
   tocados por mí; confirmado con `git status`/grep que mis cambios no los
   afectan, y la corrida final los encuentra en verde.)
3. `pnpm run lint` (oxlint --deny-warnings) → limpio.
4. `pnpm run typecheck` (tsc -b) → limpio.
5. `pnpm exec stryker run --mutate src/lib/diseno/tokensColor.ts` (dos
   corridas completas, cerrojo compartido respetado en las 4 invocaciones
   reales) → score final **98.56 %**, reproducible mutante a mutante entre
   las dos corridas.

## 10. Alcance

Solo se tocaron `src/lib/diseno/tokensColor.ts` y
`src/lib/diseno/tokensColor.test.ts`. Ningún otro fichero de `src/` fue
necesario para ningún mutante de este fichero. No se ejecutó ningún comando
git de escritura.

## 11. Nota para craftsman_lead

`src/lib/diseno/fidelidadPrototipo.ts` tiene el MISMO parser de profundidad
de llaves duplicado (`extraerCuerpoDeBloque`), con el mismo patrón de
huecos de cobertura (según el informe original, sección 9.1) — un agente
hermano en paralelo se está encargando de ese fichero. Si aplica el mismo
refuerzo (bloque con llave anidada, bloque sin cerrar, test de "límite
exacto del slice"), es probable que encuentre los MISMOS 2 tipos de
mutantes equivalentes que documenté en §7 aquí (la comparación `.index ===
undefined` y el `cursor < length` vs `<=`), si ese fichero replica el mismo
patrón de código. No lo he tocado ni verificado — solo lo señalo por si
ahorra tiempo de análisis repetido.

El score de 98.56 % (en vez de 100 % literal) es el máximo alcanzable dado
el `threshold.break: 100` de `stryker.config.json`, que no distingue
mutantes equivalentes de huecos reales. Queda a decisión de
`craftsman_lead`/`mutation_tester` si esto satisface la puerta de mutación
para este fichero (mismo criterio ya aplicado a `rolesDescartados.ts` en el
informe original, que quedó con 2 equivalentes documentados) o si se
requiere alguna acción adicional (por ejemplo, ajustar el umbral o aceptar
formalmente estos 2 como equivalentes en el próximo informe de
`mutation_tester`).
