# Mutación — feature `identidad_visual` (id 22)

## Ronda A

**Veredicto:** PASS

**Score:** killed+timeout/total = 491/496 = 98.99% bruto (umbral: 100%) — **491/491 = 100.00%
excluyendo los 5 mutantes equivalentes verificados** (comparación real contra el umbral, por
regla dura del repo: 100% sobre mutantes NO equivalentes)

Esta es la medición **posterior** al "REFUERZO MUTACIÓN 1" que `tdd_craftsman` documenta en
`progress/tdd_identidad_visual.md` §4 (26 tests nuevos, cero producción tocada, en respuesta a
la primera medición de esta misma ronda, que dio **FAIL** — 64 supervivientes reales — y que se
conserva íntegra más abajo como "Medición previa", por trazabilidad). Corrida completa desde
cero, un fichero detrás de otro, sin dar nada del refuerzo por bueno sin comprobarlo yo misma.

**Alcance (idéntico al de la primera medición):** los módulos PUROS `.ts` nuevos o ampliados en
la Ronda A, según `progress/tdd_identidad_visual.md` §3 y `progress/judge_identidad_visual.md`
("Disciplina TDD"):

- `src/lib/diseno/mezclaDeColor.ts`
- `src/lib/diseno/hojaGlobal.ts`
- `src/lib/diseno/tokensColor.ts`
- `src/lib/diseno/puertaTerceros.ts`

Explícitamente NO mutados: `.scss`, `.tsx`/`.module.scss` de componente, `vite.config.ts`,
`tools/puerta-terceros.ts` (sin test propio, patrón ya aceptado, igual que `src/main.tsx`), y
ningún `.test.ts` — mismas razones que la medición previa, sin cambios.

## Cómo se corrió (ficha de reproducción)

Un fichero detrás de otro, verificado con `tasklist` antes de cada arranque que no hubiera otra
corrida de Stryker activa (sí había, de forma estable, entre 8 y 36 procesos `node.exe` de
**otras** sesiones/agentes en la misma máquina durante esta sesión — nunca de dos Strykers
simultáneos sobre este repo, que es la regla dura):

```
pnpm exec stryker run --mutate src/lib/diseno/mezclaDeColor.ts  --plugins "@stryker-mutator/vitest-runner"                     # 5m 01s
pnpm exec stryker run --mutate src/lib/diseno/hojaGlobal.ts     --plugins "@stryker-mutator/vitest-runner"                     # 13m 42s
pnpm exec stryker run --mutate src/lib/diseno/tokensColor.ts    --plugins "@stryker-mutator/vitest-runner" --concurrency 1     # 10m 15s
pnpm exec stryker run --mutate src/lib/diseno/puertaTerceros.ts --plugins "@stryker-mutator/vitest-runner"                     # 1m 47s
```

`--plugins "@stryker-mutator/vitest-runner"` explícito por el mismo motivo ya documentado en la
medición previa (el glob por defecto no resuelve el plugin en esta máquina). `tokensColor.ts` se
corrió con `--concurrency 1` explícito desde el principio, porque ya se sabía por la medición
previa que ese fichero tiene 4 mutantes que cuelgan de verdad (ver más abajo) — `concurrency: 1`
ya es además el valor por defecto de `stryker.config.json` para los otros tres ficheros
("Creating 1 test runner process(es)" en los cuatro logs).

Antes de empezar, `pnpm run test` completo: 817 passed, 5 failed (822 total). Los 5 fallos están
TODOS fuera del alcance de esta ronda (4 en `src/accesibilidad-teclado.test.tsx`, la misma
inestabilidad de `userEvent.tab()` bajo contención ya documentada por `tdd_craftsman`/`judge`; 1
en `src/main.test.tsx`, timeout de 5000ms bajo la misma contención — ese fichero monta la app y
no toca ninguno de los 4 módulos de esta ronda). Ninguno de los 4 ficheros de esta ronda apareció
entre los fallos, en ninguna de las corridas de Stryker (cada una ejecuta su propio dry run
inicial, que en las cuatro corridas fue verde: 8, 58, 78 y 5 tests respectivamente).

## Resultado por fichero

| Fichero | total | killed | timeout | survived | no cov | equivalentes | score bruto | score s/no-equiv. |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `mezclaDeColor.ts` | 31 | 31 | 0 | 0 | 0 | 0 | 100.00% | 100.00% (31/31) |
| `hojaGlobal.ts` | 240 | 239 | 0 | 1 | 0 | 1 | 99.58% | 100.00% (239/239) |
| `tokensColor.ts` | 192 | 184 | 4 | 3 | 1 | 4 | 97.92% | 100.00% (188/188) |
| `puertaTerceros.ts` | 33 | 33 | 0 | 0 | 0 | 0 | 100.00% | 100.00% (33/33) |
| **Total** | **496** | **487** | **4** | **4** | **1** | **5** | **98.99% (491/496)** | **100.00% (491/491)** |

(`total` idéntico a la primera medición en los 4 ficheros — mismo catálogo de mutantes, misma
versión de Stryker, código fuente con el mismo AST fuera de los tests: confirma que el refuerzo
del `tdd_craftsman` no tocó producción, tal y como afirma `progress/tdd_identidad_visual.md` §4.)

**Cero mutantes sobrevivientes reales.** Los 5 mutantes que la suite no mata (1 en
`hojaGlobal.ts`, 4 en `tokensColor.ts` — 3 `Survived` + 1 `NoCoverage`) son EXACTAMENTE los 5 ya
identificados como equivalentes genuinos: 4 en la primera medición de esta misma ronda (antes del
refuerzo) y 1 más encontrado por el propio `tdd_craftsman` durante el refuerzo
(`progress/tdd_identidad_visual.md` §4.1). Ninguno es nuevo. Los he re-verificado yo misma, de
forma independiente, en esta corrida — con scripts propios y baterías de casos ampliadas respecto
de las citadas en los documentos previos, no aceptando ninguna de las dos fuentes sin
comprobación.

## Los 4 timeouts de `tokensColor.ts`, investigados de nuevo (no aceptados por herencia del informe anterior)

Los 4 son "Hit limit reached" (el mecanismo de instrumentación de Stryker que cuenta iteraciones
de bucle y corta cuando supera un límite calculado a partir del dry run — más robusto frente a
contención de CPU que un timeout de reloj de pared, porque cuenta iteraciones reales, no
milisegundos), extraídos de `reports/mutation/mutation.json` de la corrida de `tokensColor.ts`
(copiado a `mutation_tokensColor.json` en el scratchpad de sesión antes de que la siguiente
corrida lo sobrescribiera):

1. `LogicalOperator` línea 125: el `&&` de `cursor < textoScss.length && profundidad > PROFUNDIDAD_CERRADA` mutado a `||`.
2. `ConditionalExpression` línea 125: la condición completa del `while` mutada a `true`.
3. `BlockStatement` líneas 125-133: el cuerpo del `while` vaciado a `{}`.
4. `AssignmentOperator` línea 132: `cursor += UNO` mutado a `cursor -= UNO`.

Los cuatro mutan la condición de parada o el cuerpo del bucle `while` de
`extraerBloqueDeVariante` (mismo mecanismo ya analizado en la medición previa: con la condición
de parada rota o el cuerpo vaciado, ni `cursor` ni `profundidad` avanzan de forma que el bucle
pueda terminar).

**Reproducción aislada, propia, no heredada:** copié `tokensColor.ts` a un fichero desechable del
scratchpad, apliqué a mano el mutante #2 (`ConditionalExpression` a `true`, el más simple) y lo
ejecuté contra la entrada real mínima `leerTokenDeVariante(texto, 'marca', 'fondo')` (con
`texto = ":root[data-variante='marca'] { --color-fondo: #FFFFFF; }"`) bajo un watchdog externo de
3 segundos (comando POSIX `timeout`, no el `timeoutMS` de Stryker):

```
$ timeout 3 node --experimental-strip-types --disable-warning=ExperimentalWarning watchdog.mjs
llamando...
exit code: 124
```

Código de salida 124: el proceso nunca imprimió el resultado ni el mensaje de fin — watchdog
externo, lo mató a los 3 segundos. Bucle infinito genuino y determinista, confirmado por mí en
esta sesión, no solo citado del informe anterior. Los otros 3 mutantes comparten el mismo
mecanismo exacto (condición o cuerpo del mismo bucle neutralizados) — misma conclusión aplica por
el mismo razonamiento. Los 4 cuentan como `killed` (convención de Stryker: un mutante cuyo
proceso de test nunca termina normalmente demuestra, por definición, un comportamiento distinto
del código sin mutar, que sí termina) y no esconden ningún superviviente disfrazado.

## Los 5 mutantes NO matados, uno a uno — verificación propia de equivalencia (no heredada sin comprobar)

### 1. `src/lib/diseno/hojaGlobal.ts:209` — `ConditionalExpression`

```
-       } else if (normalizar(linea) !== TEXTO_VACIO) {
+       } else if (true) {
```

`selectoresPendientes` solo se lee en un sitio (al abrir una regla nueva), a través de
`trocearSelectores(...)`, que parte por comas, recorta cada trozo y filtra los que normalizan a
cadena vacía. El mutante hace que las líneas verdaderamente en blanco (las únicas donde
`normalizar(linea)` da cadena vacía, ya que las demás ramas del `if`/`else if` capturan todo lo
demás) también se acumulen en `selectoresPendientes` — pero lo que acumulan normaliza a cadena
vacía y el filtro posterior lo descarta igual. Álgebra: anexar N fragmentos en blanco de más es
invariante para una función que termina filtrando todo lo que normaliza a vacío, para cualquier N.

**Verificación propia:** script Node desechable (`node --experimental-strip-types`) que importa
`extraerReglas` real y una copia mutada exactamente como el mutante de Stryker, contra 11 casos
adversariales (línea en blanco entre fragmentos de selector, blanco con espacios, blanco al
inicio del fichero, dos blancos seguidos, comentario suelto en su propia línea, selector partido
en 3 líneas, anidamiento con blanco dentro de un `@media`, texto vacío, solo blancos, selector sin
blancos, blanco entre el cierre de una regla y la apertura de la siguiente): 0 diferencias en las
11. Mutante genuinamente equivalente.

### 2. `src/lib/diseno/tokensColor.ts:113` — `ConditionalExpression`

```
-   if (!coincidenciaEncabezado || coincidenciaEncabezado.index === undefined) {
+   if (!coincidenciaEncabezado || false) {
```

`coincidenciaEncabezado` viene de `String.prototype.match()` sobre un `RegExp` sin bandera `g`
(confirmado leyendo `patronDeEncabezadoDeVariante`: `new RegExp(...)` sin flags). Por ECMA-262,
cuando ese `match()` devuelve un resultado no nulo, `.index` es siempre un número — la
comprobación `.index === undefined` es una garantía imposible de violar en tiempo de ejecución con
un `RegExp` estándar, así que la rama derecha del `||` nunca puede ser la que decide.

**Verificación propia:** además del argumento de especificación, un script contra 154 casos:
todas las 60 combinaciones reales (4 variantes por 15 roles vía `leerTokenDeVariante`, más los
pares de sombra vía `leerDeclaracionDeVariante`), los 68 pares reales vía `declaraTokenEnVariante`,
`comprobarInventarioDeTokens` sobre el catálogo completo, `leerTokenDeRaizSinAtributo`, y 11 casos
sintéticos adversariales (bloque sin cerrar, cabecera sin llave, dos bloques seguidos, dos bloques
pegados sin espacio, un carácter extra tras el cierre, fuga de 2 caracteres casi-token, token
declarado dos veces, variante de un carácter, bloque con `@media` anidado, variante inexistente),
cada uno comprobado también en cruce contra "lima"/`fondo-alterno`: 0 diferencias en los 154.

### 3. `src/lib/diseno/tokensColor.ts:125:10` — `EqualityOperator`

```
-   while (cursor < textoScss.length && profundidad > PROFUNDIDAD_CERRADA) {
+   while (cursor <= textoScss.length && profundidad > PROFUNDIDAD_CERRADA) {
```

Para un bloque bien cerrado, el bucle sale siempre por la condición de `profundidad` (llega a 0)
antes o exactamente cuando `cursor` alcanza `textoScss.length` — y en el instante en que
`profundidad` llega a 0, el operador `&&` corta la evaluación por el lado derecho sin que importe
si el lado izquierdo usa `<` o `<=`. La única situación donde el cambio podría importar es un
bloque SIN CERRAR: ahí `cursor` sí llega a `textoScss.length` con `profundidad` aún positiva, y el
mutante permite una iteración de más, leyendo `textoScss[length]` (indefinido en JS, nunca
coincide con una llave) — no cambia `profundidad`, así que el resultado final (el mismo error de
"no se cierra") es idéntico.

**Verificación propia:** mismo arnés de 154 casos que el mutante anterior (incluye explícitamente
el caso "bloque sin cerrar" y "dos bloques seguidos"): 0 diferencias.

### 4. `src/lib/diseno/tokensColor.ts:139:41` — `ArithmeticOperator`

```
-     return textoScss.slice(cuerpoEmpieza, cursor - UNO)
+     return textoScss.slice(cuerpoEmpieza, cursor + UNO)
```

Cuando el bucle sale por la vía correcta, `cursor` apunta justo después de la llave de cierre:
`cursor - UNO` señala la llave (excluida, extremo exclusivo de `slice`); `cursor + UNO`
sobre-extiende el `slice` en dos caracteres (la llave de cierre más el siguiente carácter, o menos
si el bloque es lo último del texto — `slice` no lanza si el extremo excede la longitud). Los tres
consumidores de este texto exigen, vía regex, el patrón completo `NOMBRE_TOKEN:` valor `;`, y
`match()` sin `g` siempre devuelve la coincidencia más a la izquierda: dos caracteres de sobra al
final nunca alcanzan a completar un patrón nuevo ni desplazan cuál coincidencia se reporta
primero.

**Verificación propia:** mismo arnés de 154 casos, con énfasis en los diseñados justo para este
mutante (un carácter extra tras el cierre, fuga de 2 caracteres que casi forma un nombre de token
real tras la llave, bloques pegados sin separación, un bloque real seguido del bloque de la
siguiente variante real): 0 diferencias en los 154.

### 5. `src/lib/diseno/tokensColor.ts:315` — `StringLiteral` (`NoCoverage`)

```
-     return { veredicto: informe.pasa ? 'aprobado' : 'suspenso', variantesComprobadas: informe.parejasEvaluadas }
+     return { veredicto: informe.pasa ? 'aprobado' : "", variantesComprobadas: informe.parejasEvaluadas }
```

Prueba por lectura directa de `src/lib/contraste.ts:134-145` (reutilizado tal cual por esta
feature, sin tocar): para cualquier catálogo no vacío, `ejecutarPuertaDeContraste` devuelve
`{ pasa: true, ... }` de forma incondicional — la función solo calcula ratios y los adjunta, sin
comparar ninguno contra ningún umbral (esa lógica vive en `ejecutarPuertaDeContrasteParaUso` y
derivadas, que esta feature no invoca aquí). `ejecutarComprobacionDeContrasteDeVariantes` (líneas
310-311) ya filtra el catálogo vacío ANTES de llegar a la línea 315 (retorno temprano con
veredicto "suspenso", código distinto, no el mutado). Así que la única llamada a
`ejecutarPuertaDeContraste` que sobrevive a esa guarda siempre recibe un catálogo no vacío, luego
`informe.pasa` es provablemente verdadero siempre en la línea 315, luego la rama "suspenso" del
ternario es código muerto para cualquier entrada posible.

**Verificación propia, empírica además de la lectura del código:** `ejecutarPuertaDeContraste`
real contra 4 catálogos adversariales no vacíos, incluidos los peores casos matemáticamente
posibles (color y fondo idénticos, ratio 1.0, tanto en negro como en blanco): las 4 dieron
`pasa: true`, sin excepción.

No se escribió ningún test artificial para este mutante (igual que decidió el `tdd_craftsman` en
`progress/tdd_identidad_visual.md` §4.1): forzarlo exigiría simular una implementación de
`ejecutarPuertaDeContraste` que hoy no existe, inventando comportamiento fuera del `.feature`.

## Mutantes sobrevivientes (ninguno real)

Ninguno. Los 5 mutantes no matados por la suite están documentados arriba, cada uno con prueba
algebraica y verificación empírica propia (scripts nuevos, ejecutados en esta sesión, con
baterías de casos iguales o más amplias que las de los documentos previos — nunca aceptados por
conveniencia ni por herencia de un informe anterior). No queda ningún trabajo pendiente para
`tdd_craftsman` en esta ronda.

## Estado del repositorio tras la medición

`git status --short` sobre el árbol de trabajo, antes y después de las cuatro corridas de
Stryker: idéntico (Stryker restaura cada fichero mutado tras cada mutante; `reports/mutation/`
está en `.gitignore`, así que las cuatro corridas no dejan ningún rastro en el control de
versiones). Los informes JSON por fichero se copiaron al scratchpad de sesión
(`mutation_mezclaDeColor.json`, `mutation_hojaGlobal.json`, `mutation_tokensColor.json`) antes de
que la siguiente corrida sobrescribiera `reports/mutation/mutation.json`; el HTML/JSON que queda
en el repo tras la última corrida (`puertaTerceros.ts`) es solo el de ese último fichero, ninguno
se comprometió al repositorio.

---
## Medición previa de Ronda A (histórico, ANTES del Refuerzo Mutación 1 del `tdd_craftsman`) — FAIL

**Alcance revisado:** los módulos PUROS `.ts` nuevos o ampliados en la Ronda A,
tal y como los cierra `tdd_craftsman` en `progress/tdd_identidad_visual.md` §3
("Ficheros nuevos de esta ronda" / "Ficheros ampliados") y aprueba `judge` en
`progress/judge_identidad_visual.md` ("Disciplina TDD"):

- `src/lib/diseno/mezclaDeColor.ts` (nuevo — mezcla en sRGB, @s4)
- `src/lib/diseno/hojaGlobal.ts` (ampliado — campo `ancestros`, @s12-@s15)
- `src/lib/diseno/tokensColor.ts` (ampliado — lector generalizado, inventario,
  matriz de uso, comprobación de 68 pares, @s1-@s10)
- `src/lib/diseno/puertaTerceros.ts` (nuevo — puerta de build de terceros, paso 7)

Explícitamente NO mutados: `src/styles/*.scss` (Stryker no muta SCSS de forma
útil), ningún `.tsx`/`.module.scss` de componente (StrykerJS no muta JSX de
forma fiable — issue `stryker-mutator/stryker-js#4375`, ya excluido por diseño
en `stryker.config.json` → comentario de cabecera), `vite.config.ts`,
`tools/puerta-terceros.ts` (cablea `node:fs`, sin test propio, mismo patrón
aceptado que `src/main.tsx` — el `judge` ya lo revisó así), y ningún fichero
`.test.ts` (excluido por el propio glob `mutate` de `stryker.config.json`).

**Veredicto:** FAIL

**Score bruto:** 428/496 = 86.29% (killed+timeout / total)
**Score excluyendo los 4 mutantes equivalentes verificados:** 428/492 = 87.0%
(umbral: `harness.config.json` → `mutation.threshold` = 1.0 /
`stryker.config.json` → `thresholds.break` = 100)

**64 mutantes sobrevivientes reales** (59 `Survived` + 5 `NoCoverage`, ninguno
equivalente) repartidos en los 4 ficheros. Ninguno alcanza el 100%.

## Cómo se corrió (ficha de reproducción)

Un fichero detrás de otro, nunca dos corridas de Stryker simultáneas sobre
este repo (verificado con `tasklist` antes de cada arranque), con
`concurrency: 1` (ya fijado por defecto en `stryker.config.json`, y además
pasado explícito `--concurrency 1` en las corridas de `tokensColor.ts` y
`puertaTerceros.ts` tras el incidente de timeouts narrado abajo):

```
pnpm exec stryker run --mutate src/lib/diseno/mezclaDeColor.ts --plugins "@stryker-mutator/vitest-runner"
pnpm exec stryker run --mutate src/lib/diseno/hojaGlobal.ts    --plugins "@stryker-mutator/vitest-runner"
pnpm exec stryker run --mutate src/lib/diseno/tokensColor.ts   --plugins "@stryker-mutator/vitest-runner" --concurrency 1
pnpm exec stryker run --mutate src/lib/diseno/puertaTerceros.ts --plugins "@stryker-mutator/vitest-runner" --concurrency 1
```

Nota de entorno (infraestructura del arnés, no un hallazgo de la feature):
`bin/harness mutate <target>` invoca `pnpm exec stryker run --mutate
{{target}}` tal cual declara `harness.config.json`, pero Stryker no resuelve
el plugin `@stryker-mutator/vitest-runner` vía el glob por defecto
(`["@stryker-mutator/*"]`) en esta máquina pese a estar instalado — mismo
síntoma ya documentado por rondas de mutación anteriores del repo (ver
`progress/mutation_tokens_marca.md`, `progress/mutation_sistema_de_diseno_visual.md`).
Se repitió cada corrida con `--plugins "@stryker-mutator/vitest-runner"`
explícito, que sí carga el plugin. No se tocó ningún fichero de configuración.

**Incidente de timeouts durante `tokensColor.ts`, resuelto siguiendo la regla
dura del repo:** la primera corrida de `tokensColor.ts` (lanzada justo
después de que `hojaGlobal.ts` terminara, con la máquina todavía con
actividad de fondo — hasta 28 procesos `node.exe` vistos con `tasklist` al
inicio de esta sesión) marcó 4 timeouts a partir del 27% de progreso. Regla
dura de `stryker.config.json` (`_comment_concurrency`) y de esta sesión:
"antes de leer el score se lee la columna '# timeout'; si no es 0 el informe
no vale, se repite". Se **mató la corrida** (`taskkill /F /PID`, verificado
con `tasklist` que solo quedaban 2 procesos `node.exe` de fondo), se limpió y
se repitió con `--concurrency 1` explícito. La segunda corrida, ya con la
máquina en reposo, **volvió a marcar exactamente los mismos 4 timeouts**, en
la misma ubicación, con el recuento estable desde el primer momento en que
aparecieron (no creciendo con la carga de la máquina). Eso apunta a mutantes
que cuelgan de verdad, no a un artefacto de contención — pero, siguiendo el
patrón de memoria `informe-de-mutacion-con-timeouts-miente` ("un timeout
CUENTA COMO MUERTO, así que puede esconder un superviviente real"), **no se
dio por buena la sospecha sin comprobarla**: se extrajeron los 4 timeouts del
`reports/mutation/mutation.json` (ubicación exacta, no adivinada) y se
reprodujeron los 4 de forma aislada, fuera de Stryker, con un script Node
propio (`node --experimental-strip-types`) que aplica la MISMA mutación
sobre una copia del fichero real y la ejecuta bajo un *watchdog* externo
(`timeout 3 node …`, el comando POSIX `timeout`, no el `timeoutMS` de
Stryker) contra una entrada mínima real (`leerTokenDeVariante(":root[data-variante='marca'] { --color-fondo: #FFFFFF; }", 'marca', 'fondo')`).
El resultado: código de salida **124** (el proceso se mató por el watchdog
tras 3 s, sin haber terminado) para el mutante representativo
(`while (cursor < textoScss.length && profundidad > PROFUNDIDAD_CERRADA)` →
`while (true)`), confirmando un **bucle infinito genuino y determinista**, no
dependiente de la velocidad de la máquina. Los otros 3 timeouts son variantes
del mismo bucle (ver sección dedicada más abajo con el análisis de cada uno).
**Conclusión: los 4 timeouts son muertes legítimas** (mutantes que rompen la
condición de parada del bucle en `extraerBloqueDeVariante` y por tanto nunca
terminan, para cualquier entrada que alcance ese bucle) — el informe de
`tokensColor.ts` es válido y no esconde un superviviente disfrazado de
timeout.

## Resultado por fichero

| Fichero | total | killed | timeout | survived | no cov | equivalentes | score bruto | score s/no-equiv. |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `mezclaDeColor.ts` | 31 | 28 | 0 | 3 | 0 | 0 | 90.32% | 90.32% (28/31) |
| `hojaGlobal.ts` | 240 | 204 | 0 | 36 | 0 | 1 | 85.00% | 85.36% (204/239) |
| `tokensColor.ts` | 192 | 161 | 4 | 22 | 5 | 3 | 85.94% | 87.30% (165/189) |
| `puertaTerceros.ts` | 33 | 31 | 0 | 2 | 0 | 0 | 93.94% | 93.94% (31/33) |
| **Total** | **496** | **424** | **4** | **63** | **5** | **4** | **86.29%** | **87.0% (428/492)** |

(`killed` no incluye los timeout, listados aparte; `score s/no-equiv.` =
(killed+timeout) / (total − equivalentes).)

## Mutantes equivalentes excluidos (4), con prueba — nunca por conveniencia

Los cuatro se verificaron de dos formas independientes: (a) razonamiento
algebraico sobre el código fuente y (b) un script Node desechable
(`node --experimental-strip-types`, guardado en el scratchpad de sesión) que
importa la función REAL y una copia mutada exactamente igual al mutante que
reporta Stryker, y compara la salida sobre baterías de entradas adversariales
(no solo el corpus real de `_tokens.scss`).

### 1. `src/lib/diseno/hojaGlobal.ts:209` — `ConditionalExpression`

```
-     } else if (normalizar(linea) !== TEXTO_VACIO) {
+     } else if (true) {
```

`selectoresPendientes` solo se CONSUME en un punto: al abrir una regla nueva,
vía `trocearSelectores(`${selectoresPendientes}${SEPARADOR}...`)`, que hace
`.split(',').map(normalizar).filter(s => s !== TEXTO_VACIO)`. El mutante hace
que las líneas en blanco (o de puro comentario, ya vaciado antes por
`PATRON_COMENTARIO_DE_LINEA`) también entren en la rama de "acumular
selector pendiente" — pero el texto que acumulan es siempre una cadena que,
tras `normalizar` (trim), da `''`, y `trocearSelectores` la filtra igual que
si nunca se hubiera acumulado. Por álgebra: "anexar una cadena en blanco +
separador" seguido de "partir por comas, recortar cada trozo y descartar los
vacíos" es invariante a cuántos trozos en blanco de más se hayan anexado.
Verificado con un script contra 10 entradas adversariales (líneas en blanco
entre fragmentos de selector multilínea, comentario suelto en su propia
línea, dos blancos seguidos, blanco con espacios variados, blanco al
principio del fichero, selector partido en 3 líneas con blancos,
anidamiento con blanco dentro de un `@media`): **0 diferencias en las 10**.
Mutante genuinamente equivalente.

### 2. `src/lib/diseno/tokensColor.ts:113` — `ConditionalExpression`

```
-   if (!coincidenciaEncabezado || coincidenciaEncabezado.index === undefined) {
+   if (!coincidenciaEncabezado || false) {
```

`coincidenciaEncabezado` viene de `String.prototype.match()` SIN bandera `g`
sobre un `RegExp` normal (no una subclase con `Symbol.match` propio). Por
especificación ECMA-262, cuando ese `match()` devuelve un resultado no nulo,
la propiedad `.index` SIEMPRE es un número definido — nunca `undefined` — así
que `coincidenciaEncabezado.index === undefined` es una comprobación
provablemente `false` en cualquier rama donde `coincidenciaEncabezado` sea
verdadero (el único caso en que la expresión completa importaría). El
tipado `index?: number` de TypeScript es defensivo (por la posibilidad
teórica de motores de regex no estándar), no alcanzable en tiempo de
ejecución con un `RegExp` literal como el que usa `patronDeEncabezadoDeVariante`.
Verificado con un script contra las 60 combinaciones reales (4 variantes × 15
roles) más `variante` inexistente y `variante` vacía: **0 diferencias en 62
casos**.

### 3. `src/lib/diseno/tokensColor.ts:125:10` — `EqualityOperator`

```
-   while (cursor < textoScss.length && profundidad > PROFUNDIDAD_CERRADA) {
+   while (cursor <= textoScss.length && profundidad > PROFUNDIDAD_CERRADA) {
```

El bucle SIEMPRE sale por la condición de `profundidad` (llega a 0) antes de
que `cursor` alcance `textoScss.length`, para cualquier bloque bien formado
(la llave de cierre está, por construcción, dentro del texto). En el único
caso donde `cursor` sí podría alcanzar `length` (bloque sin cerrar,
`profundidad` nunca llega a 0), el `<=` solo permite UNA iteración extra que
lee `textoScss[length]` (`undefined` en JS, nunca lanza), no coincide con
`'{'` ni `'}'`, así que `profundidad` no cambia — el resultado observable
(el `throw` de "no se cierra") es idéntico. Verificado con un script contra
las 4 variantes reales, el caso "sin cierre" y el caso "dos bloques
consecutivos" (marca/lima): **0 diferencias en 8 casos**.

### 4. `src/lib/diseno/tokensColor.ts:139:41` — `ArithmeticOperator`

```
-     return textoScss.slice(cuerpoEmpieza, cursor - UNO)
+     return textoScss.slice(cuerpoEmpieza, cursor + UNO)
```

Cuando el bucle sale por la condición correcta (`profundidad` llega a 0, sin
tocar el mutante de la línea 125), `cursor` apunta justo DESPUÉS de la llave
de cierre. `cursor - UNO` señala la llave misma (excluida del `slice`,
extremo exclusivo); `cursor + UNO` sobre-extiende el `slice` en exactamente
DOS caracteres: la llave de cierre y el carácter siguiente (o nada, si el
bloque es lo último del fichero — `slice` recorta sin lanzar). Los tres
consumidores de este texto (`leerTokenDelBloque`, `leerDeclaracionDeVariante`,
`declaraTokenEnVariante`) buscan con una regex que exige el patrón COMPLETO
`NOMBRE_TOKEN:\s*VALOR;`, de al menos varios caracteres — dos caracteres de
sobra nunca alcanzan para completar un patrón nuevo, y `String.prototype.match`
sin bandera `g` siempre devuelve la coincidencia más a la izquierda, que ya
existía en el bloque real y no se ve afectada por basura al final. Verificado
con un script contra 72 casos: las 60 combinaciones reales (4 variantes × 15
roles), un bloque sin nada después del cierre, un bloque con exactamente un
carácter extra tras el cierre, un token declarado dos veces, una variante de
un solo carácter, una "fuga" deliberada de 2 caracteres que casi forma un
nombre de token real (`-c` tras el cierre, para `--color-texto`), un bloque
"pegado" sin separación al de la variante que se consulta, y un caso donde
`marca` pide un token que solo existe en el bloque de `lima` (para forzar la
sobre-captura si la hubiera): **0 diferencias en los 72**. Mutante
genuinamente equivalente.

## Investigación de los 4 timeouts de `tokensColor.ts` (mutantes en el bucle de `extraerBloqueDeVariante`, líneas 125-132)

Los 4 timeouts, extraídos de `reports/mutation/mutation.json` (no adivinados):

1. `LogicalOperator` línea 125: `cursor < textoScss.length && profundidad > PROFUNDIDAD_CERRADA` → `... || ...`. Con un bloque sin cerrar (`profundidad` nunca llega a 0), `cursor` termina superando `textoScss.length`, pero el `||` mantiene el bucle vivo mientras `profundidad > 0` siga siendo cierto — y como `textoScss[cursor]` fuera de rango es `undefined` (nunca `'{'` ni `'}'`), `profundidad` queda congelado en un valor positivo para siempre: bucle infinito determinista, exactamente en el caso que ya cubre el test "lanza con un mensaje que nombra la variante cuando el bloque no se cierra".
2. `ConditionalExpression` línea 125: la condición completa del `while` reemplazada por el literal `true`. Bucle infinito incondicional para CUALQUIER entrada que alcance este bucle (no hay ningún `break`/`return` dentro del cuerpo).
3. `BlockStatement` líneas 125-133: el cuerpo del `while` vaciado a `{}`. Como ni `cursor` ni `profundidad` se actualizan nunca dentro de un cuerpo vacío, la condición de entrada (`cursor < length && profundidad > 0`, ambas ciertas al arrancar cualquier bloque real) se mantiene idéntica para siempre: bucle infinito determinista para cualquier entrada.
4. `AssignmentOperator` línea 132: `cursor += UNO` → `cursor -= UNO`. `cursor` decrece indefinidamente hacia índices negativos; `textoScss[negativo]` es `undefined` en JS (nunca `'{'`/`'}'`), así que `profundidad` queda congelado en 1 y `cursor < textoScss.length` es cierto para siempre (un número cada vez más negativo siempre es menor que la longitud): bucle infinito determinista.

Los 4 se reprodujeron de forma aislada (mutante #2, el más simple de aplicar)
con un *watchdog* externo de 3 s (`timeout 3 node ...`), sobre una entrada
mínima real: código de salida **124** (el proceso NO terminó y el watchdog lo
mató). Confirmado: **muertes legítimas**, no artefactos de contención de CPU.
No se cuentan como supervivientes ni se excluyen del cómputo — cuentan como
`killed` en el score, tal y como Stryker los trata por convención.

## Mutantes sobrevivientes reales, uno a uno

### `src/lib/diseno/mezclaDeColor.ts` (3)

- **`src/lib/diseno/mezclaDeColor.ts:12`** `StringLiteral` —
  `const CERO_RELLENO = '0'` → `''`. `canalAHex` hace
  `canal.toString(16).toUpperCase().padStart(2, CERO_RELLENO)`; con relleno
  vacío, `padStart` no rellena nada (no hay carácter que repetir), así que un
  canal < 16 (un solo dígito hexadecimal, p. ej. `5` en vez de `05`) se
  queda sin el cero inicial. Verificado: `mezclar('#000000','#000000',0)` con
  el mutante da `'#000'` en vez de `'#000000'` — diferencia real, no
  hipotética. Falta: un test de `mezclar` cuyo resultado tenga al menos un
  canal < 16 (por ejemplo, mezclando dos colores muy oscuros con un
  porcentaje que dé un canal de un solo dígito hex) — ninguna de las 8
  mezclas de la tabla de derivaciones tiene ese caso (todas caen en pares de
  dos dígitos que no empiezan por `0`).
- **`src/lib/diseno/mezclaDeColor.ts:25`** `Regex` (mutante 1 de 2) —
  `/^#[0-9a-fA-F]{6}$/` → `/#[0-9a-fA-F]{6}$/` (sin `^`). Acepta basura ANTES
  del `#` (p. ej. `"X#FFFFFF"`), que debería seguir siendo inválido. Falta:
  un test de `validarHexadecimal`/`mezclar` con un prefijo espurio antes de
  un hexadecimal por lo demás válido.
- **`src/lib/diseno/mezclaDeColor.ts:25`** `Regex` (mutante 2 de 2) —
  `/^#[0-9a-fA-F]{6}$/` → `/^#[0-9a-fA-F]{6}/` (sin `$`). Acepta basura
  DESPUÉS de los 6 dígitos (p. ej. `"#FFFFFFX"`). Falta: un test simétrico al
  anterior, con sufijo espurio.

### `src/lib/diseno/hojaGlobal.ts` (35)

- **`hojaGlobal.ts:23`** `Regex` (3 mutantes, misma línea) — el patrón
  `PATRON_IMPORTACION` mutado de tres formas: `^\s*` → `^\S*` (exige NO
  espacio antes de `import`, rompe una línea con sangría), `import\s+` →
  `import\s` tras "import" (exige exactamente un espacio, rompe una
  importación por efecto secundario con dos o más espacios), y `\sfrom\s+` →
  `\sfrom\s` (exige exactamente un espacio tras "from", rompe una cláusula
  `from` con dos o más espacios antes de la comilla). Los tres verificados
  por razonamiento directo sobre la gramática de la regex (backtracking de
  `[^'"]*` no puede compensar ninguno de los tres recortes). Falta: 2-3 tests
  sintéticos de `contarImportacionesDeHojaGlobal` con formato de
  espaciado/sangría alternativo (indentado, doble espacio tras `import` en
  una importación por efecto secundario, doble espacio tras `from`).
- **`hojaGlobal.ts:78`** `ArrayDeclaration` — `ENCABEZADOS` (h1-h6) vaciado a
  `[]`. No afecta al corpus real completo (family 3 y family 9 siguen
  encontrando sus reglas porque el resto de selectores del literal ya
  matchea), pero rompe la garantía de que la family 9 (titulares) exige que
  la declaración `text-wrap: balance` esté ESPECÍFICAMENTE en `h1`-`h6`: con
  `ENCABEZADOS=[]`, cualquier regla con esa declaración (sobre CUALQUIER
  selector) pasaría por vacuidad de `.every()`. Mismo hueco de fondo que los
  9 pares `descripcion`/`selectores` de abajo — ver la nota conjunta.
- **`hojaGlobal.ts:88,93,98,103,108,113,123,128,133`** `StringLiteral` (9
  mutantes) — el campo `descripcion` de cada una de las 9 familias del reset
  vaciado a `""`. Ningún test comprueba el CONTENIDO de `descripcion`: el
  único sitio que lo lee (`hoja-global.test.ts:80`,
  `` `${familia.numero}. ${familia.descripcion}` ``) solo se ejecuta cuando
  `familiasAusentes` NO está vacío, y en el corpus real completo siempre está
  vacío — el `.map()` nunca corre con contenido real. Falta: un test que
  fuerce al menos una familia ausente y compruebe el mensaje completo
  (número + descripción exacta), o una aserción directa sobre
  `FAMILIAS_DEL_RESET[i].descripcion`.
- **`hojaGlobal.ts:89,94,99,104,109,116,124,129,136`** `ArrayDeclaration` (9
  mutantes) — el campo `selectores` de `reglasExigidas` de cada familia
  vaciado a `[]`. Como `reglaCumple` usa `exigida.selectores.every(...)`,
  un array vacío hace que ESA parte de la comprobación pase por vacuidad
  (verdad vacua), así que la familia se da por satisfecha con CUALQUIER regla
  que tenga la declaración correcta, sin importar su selector. El corpus real
  no lo detecta porque toda regla del `global.scss` real que declara la
  propiedad exigida TAMBIÉN tiene el selector correcto. **Falta un único tipo
  de test que mataría los 9 a la vez (y también el de `ENCABEZADOS`,
  arriba)**: `comprobarFamiliasDelReset` con un texto SINTÉTICO donde una
  regla declare la propiedad exigida de una familia sobre un selector
  DISTINTO al exigido (p. ej. `div { box-sizing: border-box; }` sin ningún
  `*`/`*::before`/`*::after`), esperando que esa familia siga marcada como
  ausente.
- **`hojaGlobal.ts:136`** `ArrayDeclaration` (mutante extra en la misma
  línea) — `declaraciones: ['text-wrap: pretty']` → `[]` para la fila
  `p, li` de la family 9. Mismo mecanismo (verdad vacua de `.every()` sobre
  `declaraciones`), mismo test que lo mataría (una regla con el selector
  correcto pero SIN la declaración exigida).
- **`hojaGlobal.ts:219`** `MethodExpression` — `exigida.selectores.every(...)`
  → `.some(...)`. Para familias con más de un selector exigido en la misma
  regla (family 1, 3, 4, 5, 9), basta con que la regla tenga UNO de los
  selectores para que la familia se dé por satisfecha. Falta: un test con una
  regla que tenga SOLO ALGUNOS de los selectores exigidos de una familia
  multi-selector (p. ej. `* { box-sizing: border-box; }` sin
  `*::before`/`*::after`), esperando que la familia 1 siga ausente.
- **`hojaGlobal.ts:220`** `MethodExpression` — `exigida.declaraciones.every(...)`
  → `.some(...)`. Simétrico al anterior pero para `declaraciones` (afecta a
  las familias 4 y 6, con 2 y 5 declaraciones exigidas respectivamente).
  Falta: una regla con SOLO ALGUNAS de las declaraciones exigidas.
- **`hojaGlobal.ts:240`** `MethodExpression` —
  `familia.reglasExigidas.every(...)` → `.some(...)`. Solo afecta a la
  family 9 (la única con 2 `reglasExigidas`): con `.some`, basta con que UNA
  de las dos sub-reglas (titulares con `balance`, o `p`/`li` con `pretty`)
  esté presente para dar la family 9 por satisfecha. Falta: un texto con
  SOLO una de las dos sub-reglas de la family 9, esperando que siga marcada
  ausente.

- **`hojaGlobal.ts:243`** `ConditionalExpression`/`EqualityOperator` (4
  mutantes en la misma expresión: `pasa: false` fijo, `true && ...`, `>=`,
  `<=`) — **ningún test comprueba `informe.pasa === true` en el caso de
  ÉXITO** (ni sobre el corpus real completo, ni sobre uno sintético): el test
  de `hoja-global.test.ts` que usa el `global.scss` real solo comprueba
  `familiasAusentes` y `familiasComprobadas`, nunca `.pasa`; el test dedicado
  de `hojaGlobal.test.ts` (paquete `@s13`) solo cubre el caso NEGATIVO (una
  sola familia presente, `pasa: false` esperado, que el mutante `pasa:false`
  fijo satisface trivialmente). Y **ningún test llama a
  `comprobarFamiliasDelReset(texto, [])`** (familias vacío), el caso que la
  guarda de vacuidad (`familias.length > CERO_FAMILIAS`) existe para cubrir.
  Faltan dos tests: (1) `pasa === true` con TODAS las familias satisfechas
  (mata el "false" fijo y el `<=`); (2) `comprobarFamiliasDelReset(texto, [])`
  esperando `pasa === false` (mata el `true && ...` y el `>=`).
- **`hojaGlobal.ts:155`** `Regex` (2 mutantes) — `PATRON_COMENTARIO_DE_LINEA`
  (`/\/\/.*$/`). Mutante A (sin `$`): equivalente SOLO para líneas sin `\r`
  final — con un `\r` incrustado (posible si el texto de entrada no está
  normalizado a LF, algo que esta función pura no puede garantizar porque
  recibe cualquier `textoScss`), `.` excluye `\r` de la clase de caracteres,
  así que CON `$` el `replace` no encuentra fin de cadena y NO recorta el
  comentario; SIN `$` sí lo recorta — diferencia real, verificada
  empíricamente (`'…// comentario\r'.replace(/\/\/.*$/,'')` conserva el
  comentario; sin `$` lo quita). Mutante B (`.` en vez de `.*`, exige
  EXACTAMENTE un carácter tras `//`): no recorta NINGÚN comentario de más de
  un carácter — verificado (`'color: red; // comentario largo'` con el
  mutante queda intacto). **No existe ningún test dedicado al recorte de
  comentarios en `hojaGlobal.ts`/`hoja-global.test.ts`** (el fichero real no
  tiene comentarios de línea en la porción que los tests ejercitan). Falta:
  un test directo de una línea con comentario `//` de más de un carácter.
- **`hojaGlobal.ts:162`** `Regex` — `PATRON_ESPACIOS` (`/\s+/g` → `/\s/g`).
  Sin el cuantificador `+`, cada espacio individual se sustituye por un
  espacio (sin efecto neto), así que una racha de 2+ espacios consecutivos
  YA NO se colapsa a uno solo. Ningún test actual tiene una línea con
  espacios múltiples consecutivos dentro de un selector o declaración. Falta:
  un test con, por ejemplo, `'margin:   0;'` (espacios múltiples) esperando
  que `normalizar` los colapse a uno.
- **`hojaGlobal.ts:165`** `StringLiteral` — `TEXTO_VACIO = ''` → `"Stryker
  was here!"`. A diferencia del mutante equivalente de la línea 209 (que solo
  toca la CONDICIÓN de la rama), este muta el VALOR SENTINELA usado a la vez
  como valor inicial de `selectoresPendientes` Y como criterio de filtrado en
  `trocearSelectores` (`.filter(s => s !== TEXTO_VACIO)`). Al cambiar el
  sentinela, los fragmentos que normalizan a `''` (líneas en blanco reales)
  YA NO se filtran (porque el filtro ahora compara contra
  `"Stryker was here!"`, no contra `''`), así que aparecen cadenas vacías
  como selectores "fantasma" en el resultado. Verificado: con un selector
  partido en 2 líneas por una línea en blanco (`'h1,\n\nh2 {'`), el mutante
  produce `selectores: ['h1', '', '', 'h2']` en vez de `['h1', 'h2']` —
  diferencia real y significativa. Falta: el mismo test de línea en blanco
  entre fragmentos de selector multilínea que mataría también el gap del
  separador de `join` (línea 197).
- **`hojaGlobal.ts:197`** `StringLiteral` — el separador de
  `ancestro.selectores.join(SEPARADOR_DE_SELECTORES + ' ')` (`', '`) mutado a
  `''`. Solo se distingue cuando un ancestro tiene MÁS DE UN selector (p. ej.
  `h1, h2 { .child { … } }`); el único test de `ancestros` que existe usa un
  `@media` como ancestro (un único "selector" tras `trocearSelectores`, no
  hay separador que perder). Verificado con Node: para ese caso, el código
  real da `ancestros: ['h1, h2']` y el mutante daría `['h1h2']`. Falta: un
  test de `extraerReglas` con un ancestro de selector compuesto
  (`h1, h2 { … }`) y una regla anidada dentro.

### `src/lib/diseno/tokensColor.ts` (24: 19 `Survived` + 5 `NoCoverage`)

- **`tokensColor.ts:94`** `UnaryOperator` — `SIN_COINCIDENCIA = -1` → `+1`.
  Mismo hueco de fondo que el punto siguiente: sin un caso real de "cabecera
  de variante encontrada pero sin `{` después", la comparación
  `indiceDeLlaveDeApertura === SIN_COINCIDENCIA` nunca se ejercita con el
  valor -1 de verdad.
- **`tokensColor.ts:118`** `ConditionalExpression` (`Survived`) +
  **`tokensColor.ts:118`/`119`** `BlockStatement`/`StringLiteral`
  (`NoCoverage`, 2 mutantes) — la guarda "no se encontró ninguna llave de
  apertura tras la cabecera de la variante" nunca se ejercita: no existe
  ningún test con un texto donde `":root[data-variante='x']"` aparezca SIN
  una `{` después en el resto del texto. Falta: un test de
  `leerTokenDeVariante`/`declaraTokenEnVariante` con un texto así (cabecera
  de variante sin bloque), esperando el error "no se encontró ningún bloque".
- **`tokensColor.ts:125`** `ConditionalExpression` — el lado derecho del
  `&&` (`profundidad > PROFUNDIDAD_CERRADA`) reemplazado por `true`. Con
  texto de más de un bloque de variante (p. ej. `dosBloquesSeguidos`), el
  bucle deja de parar en la llave de cierre CORRECTA y sigue consumiendo el
  resto del texto (incluido el bloque de la SIGUIENTE variante), aunque no
  siempre es observable porque `.match()` sin `/g/` toma la coincidencia MÁS
  A LA IZQUIERDA. Sí es observable si se pide un token que está AUSENTE en
  el bloque propio pero PRESENTE en el bloque siguiente (indebidamente
  absorbido). Falta: un test como
  `declaraTokenEnVariante(dosBloquesSeguidos, 'marca', '--color-texto-que-solo-existe-en-lima')`
  esperando `false` (el código real) — el mutante daría `true`.
- **`tokensColor.ts:125`** `EqualityOperator` — `profundidad >
  PROFUNDIDAD_CERRADA` → `>=`. Mismo mecanismo que el anterior (una
  iteración de más tras llegar a profundidad 0, que en presencia de más
  contenido puede volver a absorber el bloque siguiente). Mismo test lo
  mataría.
- **`tokensColor.ts:179`** `MethodExpression` — `.trim()` eliminado del
  valor devuelto por `leerDeclaracionDeVariante`. Ningún test actual tiene
  un espacio ANTES del `;` de cierre (p. ej.
  `'--sombra-reposo: 0 6px 18px rgba(83, 28, 75, 0.07) ;'`, con espacio antes
  del `;`); con ese espacio, el valor capturado por la regex incluiría el
  espacio final, y solo `.trim()` lo quita. Falta ese test.
- **`tokensColor.ts:224`** `Regex` — `PATRON_ROOT_SIN_ATRIBUTO`
  (`:root\s*\{...\}` → `:root\s\{...\}`, exige EXACTAMENTE un espacio). El
  `_tokens.scss` real usa exactamente un espacio, así que el corpus real no
  lo distingue. Falta un test sintético con `":root{...}"` (sin espacio) para
  `leerTokenDeRaizSinAtributo`.
- **`tokensColor.ts:235`** `ConditionalExpression` (`Survived`) +
  **`tokensColor.ts:235`/`236`** `BlockStatement`/`StringLiteral`
  (`NoCoverage`, 2 mutantes) — la guarda "no se encontró ningún `:root` sin
  atributo" nunca se ejercita: ningún test llama a
  `leerTokenDeRaizSinAtributo` con un texto que carezca de un bloque `:root`
  desnudo. Falta ese test negativo.
- **`tokensColor.ts:244`** `StringLiteral` — el mensaje de error de "token no
  encontrado DENTRO del `:root` sin atributo" (distinto del "bloque no
  encontrado" de arriba) vaciado a cadena vacía. Ningún test pide un rol
  AUSENTE del `:root` sin atributo (los 3 tests existentes de
  `leerTokenDeRaizSinAtributo` solo piden `fondo`/`texto`/`foco`, siempre
  presentes). Falta un test con un rol ausente de ese bloque concreto.
- **`tokensColor.ts:315`** `StringLiteral` (`NoCoverage`) — el literal
  `'suspenso'` de
  `veredicto: informe.pasa ? 'aprobado' : 'suspenso'` (dentro de
  `ejecutarComprobacionDeContrasteDeVariantes`) vaciado a cadena vacía.
  Ningún test llama a esta función con un catálogo NO VACÍO que FALLE el
  contraste (solo se cubre el catálogo vacío —guardia de vacuidad, código
  distinto— y el catálogo no vacío que SÍ aprueba). Falta un test con un
  catálogo no vacío y deliberadamente insuficiente en contraste (p. ej. un
  par `color`≈`fondo`), esperando `veredicto: 'suspenso'`.
- **`tokensColor.ts:262-272`** `StringLiteral` (11 mutantes, una por fila) —
  el campo `uso` de las 11 filas de `MATRIZ_DE_USO_MARCA` vaciado a cadena
  vacía. `ejecutarPuertaDeContraste` (reutilizada de `contraste.ts`, sin
  tocar) NO usa `.uso` para decidir `pasa` (siempre da `pasa: true` con
  catálogo no vacío, sin comparar contra ningún umbral — eso lo hacen otras
  funciones de `contraste.ts` que esta feature no usa aquí), así que ningún
  test que solo mire `informe.pasa`/`parejasEvaluadas` puede matar estos
  mutantes. Y ninguna otra aserción de `tokensColor.test.ts` fija el valor
  exacto de `.uso` para NINGUNA de las 11 filas (@s7 comprueba la AUSENCIA de
  filas con `rol==='borde'`, que no son estas 11). Dado que
  `MATRIZ_DE_USO_MARCA` es dato exportado cuyo campo `uso` es, por diseño
  (@s5/@s6/@s7), la documentación formal del umbral WCAG de cada par, esto es
  un hueco real de test, no un campo decorativo. Falta: una aserción que fije
  el `uso` exacto de cada fila (o al menos que las 9 filas de "texto normal"
  y las 2 de "componente de interfaz" sean exactamente esas, contadas).

### `src/lib/diseno/puertaTerceros.ts` (2)

- **`puertaTerceros.ts:64`** `ArrayDeclaration` — `hallazgos: []` mutado a un
  array con contenido, en la rama de `dist/` vacío. El test de esta rama
  solo comprueba `pasa`, `archivosInspeccionados` y `motivo`, nunca
  `hallazgos`. Falta: `expect(informe.hallazgos).toEqual([])` en ese test.
- **`puertaTerceros.ts:67`** `ArrayDeclaration` — `hallazgos: []` mutado
  igual, en la rama de lista de dominios vacía. Mismo hueco, misma rama
  simétrica. Falta la misma aserción en ese test.

## Resumen y siguiente paso

**FAIL.** 64 mutantes sobrevivientes reales (59 `Survived` + 5 `NoCoverage`),
repartidos en los 4 ficheros de esta ronda; ninguno de los 4 alcanza el 100%
(rango 85.0%-93.9% bruto). 4 mutantes se verificaron y excluyeron como
genuinamente equivalentes (justificación algebraica + empírica para cada
uno, arriba); los 4 timeouts de `tokensColor.ts` se investigaron y son
muertes legítimas (bucles infinitos deterministas), no artefactos de
contención de CPU — el informe de ese fichero es válido pese a no tener 0
timeouts en el sentido literal, porque se demostró que esos 4 timeouts NO
esconden un superviviente disfrazado. No se ha tocado ningún fichero de
`src/` ni de test durante esta medición: el trabajo de escribir los tests que
maten estos 64 mutantes corresponde al `tdd_craftsman`, seguido de un nuevo
paso por `judge` y una nueva ronda de `mutation_tester`.

Prioridad sugerida (de mayor a menor impacto por test nuevo):
1. Un único test sintético de `comprobarFamiliasDelReset` con "declaración
   correcta, selector incorrecto" mata 19 mutantes de golpe en `hojaGlobal.ts`
   (los 9 `descripcion`, los 9 `selectores`/`declaraciones` vacíos y
   `ENCABEZADOS`).
2. Dos tests de `pasa === true`/`pasa === false` (éxito completo y catálogo
   de familias vacío) matan otros 4 mutantes de `hojaGlobal.ts:243`.
3. Un test con línea en blanco dentro de un selector multilínea mata a la
   vez el gap de `TEXTO_VACIO` (línea 165) y el del separador de `join`
   (línea 197) en `hojaGlobal.ts`.
4. Un test de `declaraTokenEnVariante`/`leerDeclaracionDeVariante` que pida,
   sobre el bloque de una variante, un token que solo existe en el bloque
   SIGUIENTE, mata los 2 mutantes del bucle de `extraerBloqueDeVariante`
   (línea 125, los 2 no-equivalentes) en `tokensColor.ts`.
5. Cuatro tests negativos de "bloque no encontrado" (cabecera sin `{`, `:root`
   sin atributo ausente, rol ausente en `:root` sin atributo, catálogo no
   vacío que suspende) matan 9 mutantes (`NoCoverage` + `Survived` asociados)
   de `tokensColor.ts`.
6. Fijar el `uso` exacto de las 11 filas de `MATRIZ_DE_USO_MARCA` mata los 11
   `StringLiteral` de `tokensColor.ts:262-272`.
7. Dos aserciones sueltas (`hallazgos` en las dos ramas de vacuidad) matan
   los 2 de `puertaTerceros.ts`.
8. `mezclaDeColor.ts`: un caso con canal < 16 y dos casos de formato
   hexadecimal con basura antes/después matan los 3 restantes.

---

## Ronda B

**Veredicto:** PASS

**Score:** killed+timeout/total = 31/33 = 93.94% bruto (umbral: `harness.config.json` →
`mutation.threshold` = 1.0 / `stryker.config.json` → `thresholds.break` = 100) — **31/31 =
100.00% excluyendo los 2 mutantes equivalentes verificados** (comparación real contra el umbral,
por regla dura del repo: 100% sobre mutantes NO equivalentes)

Esta es la medición **posterior** al "REFUERZO MUTACIÓN 1 (Ronda B)" que `tdd_craftsman` documenta
en `progress/tdd_identidad_visual.md` §7 (2 tests nuevos — ruta `.jpg` sin "e" y ruta `.jpeg` con
"e" — cero producción tocada, en respuesta a la primera medición de esta misma ronda, que dio
**FAIL**: 1 superviviente real más 2 equivalentes ya excluidos entonces — se conserva íntegra más
abajo como "Medición previa", por trazabilidad). Corrida completa desde cero, sin dar el refuerzo
por bueno sin comprobarlo yo misma.

**Alcance (idéntico al de la primera medición de esta ronda, reconfirmado):** el único módulo PURO
`.ts` nuevo de la Ronda B, según `progress/tdd_identidad_visual.md` §3/§6 ("Ficheros nuevos de
esta ronda") y `progress/judge_identidad_visual.md` (sección "Ronda B", "Disciplina TDD"/"Calidad"):

- `src/lib/diseno/inventarioActivosPublicos.ts`

Reconfirmado con `git diff --stat HEAD -- src/lib/diseno/hojaGlobal.ts src/lib/diseno/tokensColor.ts
src/lib/diseno/mezclaDeColor.ts src/lib/diseno/puertaTerceros.ts` (diff **vacío**) que los cuatro
módulos puros de la Ronda A, ya mutados al 100% s/no-equiv. en esa ronda, siguen sin tocar — no
hace falta remedirlos. El texto de `inventarioActivosPublicos.ts` leído línea a línea en esta
sesión coincide exactamente con el que analizó la medición previa (mismo `PATRON_RUTA_DE_IMAGEN`
en la línea 18 con la alternancia `jpe?g`, mismo ternario en la línea 61): el refuerzo del
`tdd_craftsman` no tocó producción, solo `src/lib/diseno/inventarioActivosPublicos.test.ts` (19 →
21 tests, +2).

Explícitamente NO mutados, mismas razones que la primera medición de esta ronda: `src/styles/*.scss`
(Stryker no muta SCSS de forma útil); `.test.ts` (excluidos por el propio glob `mutate` de
`stryker.config.json`); `.tsx`/`.module.scss` de componente (`stryker-mutator/stryker-js#4375`,
ya excluido por diseño); `index.html`, `package.json`, `public/` (no son `.ts`); y los 4 módulos
puros `hojaGlobal.ts`, `tokensColor.ts`, `mezclaDeColor.ts`, `puertaTerceros.ts` de la Ronda A
(confirmados sin tocar arriba, ya midieron 100% s/no-equiv. en esa ronda).

## Cómo se corrió (ficha de reproducción)

Comprobado con `tasklist` antes de arrancar que no había otra corrida de Stryker sobre este repo
activa (12 procesos `node.exe` de otras sesiones/agentes en la máquina, ninguno propio de este
repo). `pnpm exec vitest run src/lib/diseno/inventarioActivosPublicos.test.ts` primero, en
aislamiento: **21/21 verdes** (los 19 de antes del refuerzo + los 2 del refuerzo), antes de mutar
nada.

```
pnpm exec stryker run --mutate src/lib/diseno/inventarioActivosPublicos.ts --plugins "@stryker-mutator/vitest-runner"   # 5m 00s
```

`--plugins "@stryker-mutator/vitest-runner"` explícito, mismo motivo ya documentado en la Ronda A
y en la primera medición de esta ronda (el glob por defecto no resuelve el plugin en esta
máquina). La columna `# timeout` dio **0** a la primera — la regla dura de "si `# timeout` no es
0, repetir a `--concurrency 1`" no se activa; el score se toma directamente de esta única corrida
(`concurrency: 1` ya es el valor por defecto de `stryker.config.json`, "Creating 1 test runner
process(es)" en el log).

Dry run inicial de Stryker: verde (`Found 1 of 818 file(s) to be mutated`, `Instrumented 1 source
file(s) with 33 mutant(s)`). `git status --short src/lib/diseno/inventarioActivosPublicos.ts`
antes y después de la corrida: idéntico (sigue `??` sin modificar) — Stryker restauró el fichero
tras cada mutante, ninguno dejó rastro.

Verificación adicional, no exigida por el protocolo pero hecha por transparencia y siguiendo el
mismo criterio de "no fiarse sin comprobar" de las rondas anteriores: `pnpm run test` completo,
lanzado después de la corrida de Stryker → **868/868 verdes, 65 ficheros** — ninguna regresión
fuera del alcance de esta medición.

## Resultado por fichero

| Fichero | total | killed | timeout | survived | no cov | equivalentes | score bruto | score s/no-equiv. |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `inventarioActivosPublicos.ts` | 33 | 31 | 0 | 2 | 0 | 2 | 93.94% | 100.00% (31/31) |
| **Total** | **33** | **31** | **0** | **2** | **0** | **2** | **93.94%** | **100.00% (31/31)** |

Cifras extraídas directamente de `reports/mutation/mutation.json` (copiado a
`mutation_inventarioActivosPublicos_rondaB2.json` en el scratchpad de sesión antes de continuar),
no solo del resumen impreso en consola — conteo por `status` verificado con un script Node propio:
`{ Killed: 31, Survived: 2 }`, total 33. `total` idéntico a la primera medición de esta ronda (33
en ambas): mismo catálogo de mutantes, misma versión de Stryker, el código fuente mutado tiene el
mismo AST — confirma que el refuerzo del `tdd_craftsman` no tocó producción, tal y como afirma
`progress/tdd_identidad_visual.md` §7.

**Cero mutantes sobrevivientes reales.** Los 2 mutantes que la suite no mata son EXACTAMENTE los 2
ya identificados como equivalentes genuinos en la primera medición de esta misma ronda, ambos
sobre la misma sub-expresión `inventarioActivosPublicos.ts:61:50` (`ConditionalExpression` y
`EqualityOperator`) — reconfirmado leyendo el `mutation.json` de esta corrida: misma ubicación
(`{"start":{"line":61,"column":50},"end":{"line":61,"column":89}}`), mismo `mutatorName` y mismo
`replacement` (`true` / `rutasRealesDePublic.length >= CERO_RUTAS`) que la primera medición. El
mutante real de la primera medición (`:18`, `Regex` `jpe?g` → `jpeg`) **ya no aparece entre los
supervivientes**: no está en la lista de `Survived` del `mutation.json` de esta corrida, y el log
de Stryker muestra el test nuevo matándolo: `✓ extraerRutasDeImagenDeclaradas extrae una ruta
"/img/…" con extensión ".jpg" (sin "e")… (killed 1)`.

## Los 2 mutantes NO matados, uno a uno — re-verificación (no heredada sin comprobar)

Ambos, en `src/lib/diseno/inventarioActivosPublicos.ts:61:50`, mutan la misma sub-expresión
`rutasRealesDePublic.length > CERO_RUTAS` del `&&` que compone `pasa` en
`compararRutasDeclaradasConFicherosReales` — una función que **no cambió** entre la primera
medición de esta ronda y esta corrida (mismo texto, confirmado leyendo el fichero real antes de
lanzar Stryker). La prueba algebraica y la verificación empírica que los excluyó entonces (más
abajo, "Medición previa de Ronda B" → "Los 3 mutantes NO matados, uno a uno" → puntos 1 y 2) sigue
siendo válida sin ajustes porque no depende de nada que el refuerzo haya tocado. Resumen, sin
repetir palabra por palabra el análisis ya escrito y verificado allí:

### 1. `ConditionalExpression` (equivalente) — `rutasRealesDePublic.length > CERO_RUTAS` → `true`

`rutasFaltantes` se calcula siempre ANTES del `return`, como
`rutasDeclaradas.filter((ruta) => !catalogoReal.has(ruta))`. Si `rutasRealesDePublic.length === 0`,
`catalogoReal` es el `Set` vacío y `rutasFaltantes` queda ser exactamente `rutasDeclaradas`
(mismo `length`): o `rutasDeclaradas.length === 0` también (la primera cláusula del `&&` ya es
`false` en ambas versiones), o `rutasDeclaradas.length > 0` (entonces la tercera cláusula,
`rutasFaltantes.length === CERO_RUTAS`, ya es `false` en ambas versiones). Ninguna combinación de
entradas distingue las dos versiones.

### 2. `EqualityOperator` (equivalente) — `>` → `>=`

`Array.prototype.length` es siempre un entero `>= 0`: `rutasRealesDePublic.length >= CERO_RUTAS`
es una tautología, de valor idéntico al literal `true` del mutante 1. El mismo argumento de
vacuidad aplica en la única situación donde `>` y `>=` podrían diferir (`length === 0`).

## Mutantes sobrevivientes (ninguno real)

Ninguno. Los 2 mutantes no matados por la suite son los mismos 2 equivalentes ya documentados y
verificados con prueba algebraica + script empírico (12 casos, 0 diferencias) en la primera
medición de esta ronda, re-confirmados aquí contra la corrida actual (mismo `mutatorName`, misma
ubicación, mismo `replacement`, misma función sin cambios). No queda ningún trabajo pendiente para
`tdd_craftsman` en esta ronda.

## Estado del repositorio tras la medición

`git status --short src/lib/diseno/inventarioActivosPublicos.ts`: idéntico antes y después de la
corrida de Stryker (Stryker restaura el fichero mutado tras cada mutante; `reports/mutation/` está
en `.gitignore`). El informe JSON de esta corrida se copió al scratchpad de sesión
(`mutation_inventarioActivosPublicos_rondaB2.json`) antes de que quedara sobrescrito por una
corrida futura; el HTML/JSON que queda en el repo tras esta corrida es solo el de este fichero, no
se comprometió al control de versiones. El `pnpm run test` completo lanzado después tampoco dejó
rastro (`868/868` sigue siendo el mismo recuento que cita `tdd_craftsman` en su §7).

## Resumen y siguiente paso

**PASS.** 0 mutantes sobrevivientes reales sobre 33 mutantes del único módulo puro `.ts` de esta
ronda. Score bruto 93.94% (31/33); score excluyendo los 2 mutantes equivalentes verificados
**100.00% (31/31)** — cumple el umbral de `harness.config.json` → `mutation.threshold` = 1.0. El
refuerzo del `tdd_craftsman` (2 tests: ruta `.jpg` sin "e", ruta `.jpeg` con "e") mató el único
superviviente real de la primera medición de esta ronda sin tocar producción, exactamente como su
propia bitácora documenta en §7 — comprobado por mí de forma independiente, no aceptado por
herencia. Ronda B queda cerrada en mutación. `identidad_visual` sigue `in_progress` (pasos 9-12
del plan por delante); corresponde al `craftsman_lead` decidir el siguiente paso del pipeline
(p. ej., una pasada de `judge` sobre el refuerzo del `tdd_craftsman` antes de continuar).

---

## Medición previa de Ronda B (histórico, ANTES del Refuerzo Mutación 1 del `tdd_craftsman`) — FAIL

**Veredicto:** FAIL

**Score bruto:** killed+timeout/total = 30/33 = 90.91% (umbral: `harness.config.json` →
`mutation.threshold` = 1.0 / `stryker.config.json` → `thresholds.break` = 100)
**Score excluyendo los 2 mutantes equivalentes verificados:** 30/31 = 96.77% — sigue por
debajo del umbral del 100% porque queda 1 superviviente real.

**Alcance:** los módulos PUROS `.ts` nuevos o ampliados en la Ronda B, según
`progress/tdd_identidad_visual.md` (sección "RONDA B: tipografía autoalojada y `public/`",
apartado "Ficheros nuevos de esta ronda") y `progress/judge_identidad_visual.md`. Verificado con
`git status --short src/lib/` y `git diff --stat HEAD -- src/lib/diseno/hojaGlobal.ts
src/lib/diseno/tokensColor.ts src/lib/diseno/mezclaDeColor.ts src/lib/diseno/puertaTerceros.ts`
(diff vacío: los cuatro módulos puros de la Ronda A, ya mutados al 100% en esa ronda, NO se
tocaron en la Ronda B) antes de fijar el alcance:

- `src/lib/diseno/inventarioActivosPublicos.ts` (nuevo — el único módulo puro `.ts` nuevo o
  ampliado de esta ronda: los dos extractores por regex, `extraerRutasDeImagenDeclaradas` y
  `extraerRutasDeFuenteDeclaradas`, el "parser" de las rutas declaradas en el texto crudo de
  `global.scss`/`src/data`/componentes, y `compararRutasDeclaradasConFicherosReales`, la puerta
  de nivel A que compara esas rutas contra el catálogo de ficheros reales de `public/`).

Explícitamente NO mutados, con su razón: `src/styles/global.scss` (SCSS, Stryker no lo muta de
forma útil, mismo criterio que la Ronda A); `src/styles/hoja-global.test.ts`,
`src/lib/diseno/inventarioActivosPublicos.test.ts`, `src/documento-fuentes.test.ts`,
`src/documento-iconos.test.ts` (ficheros `.test.ts`, excluidos por el propio glob `mutate` de
`stryker.config.json`); `src/components/MetadatosPagina.tsx` (componente `.tsx`, StrykerJS no
muta JSX de forma fiable, issue `stryker-mutator/stryker-js#4375`, mismo criterio ya excluido
por diseño en `stryker.config.json`); `index.html`, `package.json`, `pnpm-lock.yaml`, `public/`
(no son `.ts`); `src/lib/diseno/hojaGlobal.ts`, `tokensColor.ts`, `mezclaDeColor.ts`,
`puertaTerceros.ts` (módulos puros de la Ronda A, confirmados sin tocar en esta ronda por el
`git diff --stat` vacío citado arriba, ya midieron 100% s/no-equiv. en la Ronda A y esta ronda no
reintroduce cambios sobre ellos, así que no hace falta remedirlos).

## Cómo se corrió (ficha de reproducción)

Comprobado antes de arrancar, con `tasklist`, que no había otra corrida de Stryker sobre este
repo activa (sí había, de forma estable, alrededor de 34-36 procesos `node.exe` de **otras**
sesiones/agentes en la misma máquina — nunca de dos Strykers simultáneos sobre este repo).
`pnpm exec vitest run src/lib/diseno/inventarioActivosPublicos.test.ts` primero, en aislamiento:
**19/19 verdes**, antes de mutar nada.

```
pnpm exec stryker run --mutate src/lib/diseno/inventarioActivosPublicos.ts --plugins "@stryker-mutator/vitest-runner"   # 5m 17s
```

`--plugins "@stryker-mutator/vitest-runner"` explícito por el mismo motivo ya documentado en la
Ronda A (el glob por defecto no resuelve el plugin en esta máquina). No hizo falta
`--concurrency 1` explícito (ya es el valor por defecto de `stryker.config.json`, "Creating 1 test
runner process(es)" en el log) ni repetir la corrida: la columna `# timeout` dio **0** a la
primera, así que la regla dura de "si `# timeout` no es 0, repetir a `--concurrency 1`" no se
activa — el score se toma directamente de esta única corrida.

Dry run inicial de Stryker: 19 tests en 17 s, verde. `git status --short
src/lib/diseno/inventarioActivosPublicos.ts` antes y después de la corrida: idéntico (sigue `??`
sin modificar) — Stryker restauró el fichero tras cada mutante, ninguno dejó rastro.

## Resultado por fichero

| Fichero | total | killed | timeout | survived | no cov | equivalentes | score bruto | score s/no-equiv. |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `inventarioActivosPublicos.ts` | 33 | 30 | 0 | 3 | 0 | 2 | 90.91% | 96.77% (30/31) |
| **Total** | **33** | **30** | **0** | **3** | **0** | **2** | **90.91%** | **96.77% (30/31)** |

Cifras extraídas directamente de `reports/mutation/mutation.json` (copiado a
`mutation_inventarioActivosPublicos.json` en el scratchpad de sesión antes de continuar), no solo
del resumen impreso en consola — conteo por `status` verificado con un script propio:
`{ Killed: 30, Survived: 3 }`, total 33.

## Los 3 mutantes NO matados, uno a uno

### 1. `src/lib/diseno/inventarioActivosPublicos.ts:61:50` — `ConditionalExpression` (equivalente)

```
-       pasa: rutasDeclaradas.length > CERO_RUTAS && rutasRealesDePublic.length > CERO_RUTAS && rutasFaltantes.length === CERO_RUTAS,
+       pasa: rutasDeclaradas.length > CERO_RUTAS && true && rutasFaltantes.length === CERO_RUTAS,
```

**Prueba algebraica.** `rutasFaltantes` se calcula ANTES del `return`, siempre, como
`rutasDeclaradas.filter((ruta) => !catalogoReal.has(ruta))` con `catalogoReal = new
Set(rutasRealesDePublic)`. Si `rutasRealesDePublic.length === 0`, entonces `catalogoReal` es el
`Set` vacío, `catalogoReal.has(ruta)` es `false` para cualquier `ruta`, y el `filter` conserva
todas las rutas de `rutasDeclaradas` sin excepción: `rutasFaltantes` queda ser exactamente
`rutasDeclaradas` (mismo contenido, mismo `length`). Por tanto, siempre que la condición mutada
(`rutasRealesDePublic.length > CERO_RUTAS`, sustituida por `true`) sea la que marca la diferencia
— es decir, siempre que `rutasRealesDePublic.length === 0` — se cumple una de estas dos cosas:
(a) `rutasDeclaradas.length === 0` también, y entonces la PRIMERA cláusula del `&&`
(`rutasDeclaradas.length > CERO_RUTAS`) ya es `false` en ambas versiones, o (b)
`rutasDeclaradas.length > 0`, y entonces `rutasFaltantes.length === rutasDeclaradas.length > 0`,
así que la TERCERA cláusula (`rutasFaltantes.length === CERO_RUTAS`) ya es `false` en ambas
versiones. En cualquiera de los dos casos, `pasa` da `false` tanto con el código real como con el
mutante: no existe ninguna combinación de `rutasDeclaradas`/`rutasRealesDePublic` que distinga las
dos versiones. Mutante genuinamente equivalente.

**Verificación empírica.** Script Node desechable (`node`, sin dependencias, guardado en el
scratchpad de sesión) con las dos implementaciones (`original` y `mutante1_conditional`) copiadas
literalmente del código real y del mutante de Stryker, ejecutadas sobre 12 casos, incluidos los
adversariales que un razonamiento superficial podría pasar por alto (listas vacías cruzadas,
duplicados, cadena vacía como "ruta", 50 rutas): **0 diferencias en las 12**.

### 2. `src/lib/diseno/inventarioActivosPublicos.ts:61:50` — `EqualityOperator` (equivalente)

```
-       pasa: rutasDeclaradas.length > CERO_RUTAS && rutasRealesDePublic.length > CERO_RUTAS && rutasFaltantes.length === CERO_RUTAS,
+       pasa: rutasDeclaradas.length > CERO_RUTAS && rutasRealesDePublic.length >= CERO_RUTAS && rutasFaltantes.length === CERO_RUTAS,
```

**Prueba algebraica, en dos pasos independientes que ambos cierran el caso.** Primero:
`Array.prototype.length` es siempre un entero `>= 0` en JavaScript (no puede ser negativo) — así
que `rutasRealesDePublic.length >= CERO_RUTAS` (con `CERO_RUTAS = 0`) es una tautología, cierta
para cualquier array, exactamente equivalente en valor al literal `true` del mutante 1 de arriba.
Segundo, y por si ese primer argumento pareciera demasiado directo: el mismo razonamiento de
"vacuidad" del mutante 1 aplica aquí sin cambios, porque la única situación en la que `>` y `>=`
difieren (`rutasRealesDePublic.length === 0`) es exactamente la misma situación ya cubierta
arriba, donde `rutasFaltantes.length` queda forzosamente igual a `rutasDeclaradas.length`. Mutante
genuinamente equivalente, con doble justificación.

**Verificación empírica.** Mismo script y misma batería de 12 casos que el mutante 1
(`mutante2_equality`, tercera función del mismo script): **0 diferencias en las 12**.

### 3. `src/lib/diseno/inventarioActivosPublicos.ts:18:31` — `Regex` (SUPERVIVIENTE REAL)

```
-   const PATRON_RUTA_DE_IMAGEN = /['"](\/img\/[^'"]+\.(?:webp|png|jpe?g|svg))['"]/g
+   const PATRON_RUTA_DE_IMAGEN = /['"](\/img\/[^'"]+\.(?:webp|png|jpeg|svg))['"]/g
```

(el mutante sustituye `jpe?g` por `jpeg`: quita el cuantificador que hace la "e" opcional)

`jpe?g` es un grupo de extensión que acepta tanto `jpg` (la "e" es opcional, se omite) como
`jpeg`. El mutante deja solo `jpeg`, literal, sin el cuantificador — deja de aceptar `.jpg`. Esto
SÍ es una diferencia de comportamiento observable, no un caso de vacuidad: cualquier ruta real
terminada en `.jpg` (sin la "e") deja de ser extraída por `extraerRutasDeImagenDeclaradas` con el
mutante activo, mientras que con el código real sí se extrae.

**Verificación empírica** (además de la lectura directa de la gramática de la regex): script Node
que aplica las dos regex (original y mutante, copiadas literales) contra la cadena
`dato: '/img/foto.jpg'`:

```
original: [ '/img/foto.jpg' ]
mutant  : []
```

Diferencia real y reproducible. No es un mutante equivalente: es un hueco de test genuino.

**Por qué la suite actual no lo detecta.** `inventarioActivosPublicos.test.ts` (los 14 `it`
unitarios de `extraerRutasDeImagenDeclaradas`/`extraerRutasDeFuenteDeclaradas`/
`compararRutasDeclaradasConFicherosReales`, líneas 6-86) solo ejercita las extensiones webp, png
y, como caso negativo, txt — ninguna entrada usa jpg ni jpeg. Los cinco `it` de integración
(líneas 118-142, contra el árbol real de `src/data`/`MetadatosPagina.tsx`/`PieDePagina.tsx` y
`public/img/`) tampoco lo alcanzan porque ninguna imagen real del inventario de esta feature usa
jpg/jpeg (§4 de `progress/tdd_identidad_visual.md`: los 26 huecos de imagen son todos webp salvo
el Open Graph, que es png) — así que el corpus real nunca pasa por esa rama de la alternancia,
exactamente el mismo mecanismo de "el corpus real no lo distingue" que ya documentó la Ronda A
para varios de sus mutantes.

**Falta:** un test directo de `extraerRutasDeImagenDeclaradas` con una ruta jpg (sin "e"), por
ejemplo una entrada con `/img/galeria/ejemplo.jpg` esperando esa misma ruta en el resultado — el
mutante daría un array vacío. Un segundo caso con jpeg (que sí sigue matando el mutante, pero no
basta por sí solo porque no distingue la versión mutada de la real) puede añadirse junto al
primero para dejar constancia explícita de que la alternancia cubre ambas grafías, no solo una.

## Mutantes sobrevivientes (reales)

- **`src/lib/diseno/inventarioActivosPublicos.ts:18`** `Regex` — `jpe?g` → `jpeg` (pierde la
  alternancia jpg/jpeg).
  Falta: un test de `extraerRutasDeImagenDeclaradas` con una ruta jpg (sin "e"), ver análisis
  arriba. Es trabajo del `tdd_craftsman`; no se toca `src/` ni los tests desde este informe.

## Mutantes equivalentes excluidos (2), con prueba — nunca por conveniencia

Los dos, en `inventarioActivosPublicos.ts:61:50` (`ConditionalExpression` y `EqualityOperator`
sobre la misma sub-expresión `rutasRealesDePublic.length > CERO_RUTAS`), quedan documentados y
verificados uno a uno en la sección anterior — prueba algebraica más verificación empírica con
script propio (12 casos, 0 diferencias), mismo estándar que exige `docs/mutation-testing.md` y que
ya siguió la Ronda A para sus 5 equivalentes.

## Estado del repositorio tras la medición

`git status --short` sobre `src/lib/diseno/inventarioActivosPublicos.ts`: idéntico antes y después
de la corrida de Stryker (Stryker restaura el fichero mutado tras cada mutante; `reports/mutation/`
está en `.gitignore`). El informe JSON de esta corrida se copió al scratchpad de sesión
(`mutation_inventarioActivosPublicos.json`) antes de que quedara sobrescrito por una corrida
futura; el HTML/JSON que queda en el repo tras esta corrida es solo el de este fichero, no se
comprometió al control de versiones.

## Resumen y siguiente paso

**FAIL.** 1 mutante superviviente real (`inventarioActivosPublicos.ts:18`, la alternancia
jpg/jpeg de `PATRON_RUTA_DE_IMAGEN`), sobre un total de 33 mutantes del único módulo puro `.ts`
nuevo de esta ronda. Score bruto 90.91% (30/33); score excluyendo los 2 mutantes equivalentes
verificados 96.77% (30/31) — por debajo del umbral de 100% exigido por `harness.config.json` →
`mutation.threshold`. No se ha tocado ningún fichero de `src/` ni de test durante esta medición:
el test que falta corresponde al `tdd_craftsman`, seguido de un nuevo paso por `judge` y una nueva
ronda de `mutation_tester` sobre este mismo fichero.

**Prioridad sugerida:** un único test nuevo (ruta jpg sin "e") mata el único superviviente real y
deja la Ronda B en 100% s/no-equiv. — no hace falta tocar producción, el hallazgo no señala ningún
comportamiento incorrecto, solo un hueco de cobertura de mutación.

---

## Re-medicion -- REFUERZO MUTACION 1 (Ronda B)

**Veredicto:** PASS

**Score:** killed/total = 31/33 = 93.94% bruto (umbral: harness.config.json -> mutation.threshold
= 1.0 / stryker.config.json -> thresholds.break = 100) -- 31/31 = 100.00% excluyendo los 2
mutantes equivalentes ya documentados y re-verificados (comparacion real contra el umbral, por
regla dura del repo: 100% sobre mutantes NO equivalentes).

Nota de trazabilidad: al abrir este fichero para anotar el veredicto se encontro que ya existe una
seccion "## Ronda B" (mas arriba) con exactamente este mismo resultado (31/31 s/no-equiv., mismos
2 equivalentes), fechada de una medicion previa sobre el mismo alcance. No se ha dado ese
resultado por bueno por herencia: esta seccion documenta una corrida de Stryker propia, lanzada de
nuevo en esta sesion, de principio a fin, con verificacion independiente del mutation.json
resultante (script Node propio, no solo el resumen de consola) -- el numero coincide, pero se ha
comprobado, no copiado.

**Alcance:** unico fichero pedido -- src/lib/diseno/inventarioActivosPublicos.ts. No se ha mutado
ningun otro fichero de src/ en esta corrida.

## Como se corrio (ficha de reproduccion)

Comprobado antes de arrancar, con `tasklist //FI "IMAGENAME eq node.exe"`, que no habia ninguna
corrida de Stryker propia activa sobre este repo: 9 procesos node.exe en la maquina, ninguno de
sesion/hilo propio; `.stryker-tmp/` tiene 17 carpetas `sandbox-*` residuales de corridas
anteriores (ninguna de este repo en curso ahora mismo), todas con fecha de modificacion de horas o
dias antes de esta corrida (la mas reciente, `sandbox-8WI8rs`, del 24/08 20:15, mas de 13 h antes
de empezar esta medicion el 25/08 a las 09:25), asi que ninguna corresponde a un proceso vivo.
Regla dura de "nunca dos Strykers a la vez sobre este repo" respetada.

`pnpm exec vitest run src/lib/diseno/inventarioActivosPublicos.test.ts` primero, en aislamiento:
21/21 verdes, antes de mutar nada (confirma que el fichero de test sigue siendo el reforzado por
tdd_craftsman: 9 `it` de `extraerRutasDeImagenDeclaradas` -incluidas las dos del refuerzo, ruta
`.jpg` sin "e" y ruta `.jpeg` con "e"-, 4 de `extraerRutasDeFuenteDeclaradas`, 4 de
`compararRutasDeclaradasConFicherosReales`, 4 de integracion contra el arbol real).

    pnpm exec stryker run --mutate src/lib/diseno/inventarioActivosPublicos.ts --plugins "@stryker-mutator/vitest-runner"   # 2m 33s

`--plugins "@stryker-mutator/vitest-runner"` explicito, mismo motivo ya documentado en todas las
mediciones anteriores de esta feature (el glob por defecto no resuelve el plugin en esta maquina).
Dry run inicial: verde, "Found 1 of 818 file(s) to be mutated" / "Instrumented 1 source file(s)
with 33 mutant(s)", 21 tests en 5 s. La columna "# timeout" dio 0 -- la regla dura de "si #
timeout no es 0, repetir a --concurrency 1" no se activa; el score se toma directamente de esta
unica corrida (concurrency: 1 ya es el valor por defecto de stryker.config.json, "Creating 1 test
runner process(es)" en el log).

`git status --short src/lib/diseno/inventarioActivosPublicos.ts` antes y despues de la corrida:
identico (sigue "??", sin modificar) -- Stryker restauro el fichero tras cada mutante, ninguno
dejo rastro.

Verificacion adicional, por transparencia: `pnpm run test` completo tras la corrida de Stryker ->
868/868 verdes, 65 ficheros -- ninguna regresion.

## Resultado por fichero

| Fichero | total | killed | timeout | survived | no cov | equivalentes | score bruto | score s/no-equiv. |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `inventarioActivosPublicos.ts` | 33 | 31 | 0 | 2 | 0 | 2 | 93.94% | 100.00% (31/31) |
| **Total** | **33** | **31** | **0** | **2** | **0** | **2** | **93.94%** | **100.00% (31/31)** |

Cifras extraidas directamente de `reports/mutation/mutation.json` de esta corrida (copiado a
`mutation_inventarioActivosPublicos_remedicion.json` en el scratchpad de sesion antes de
continuar, no solo del resumen de consola) -- conteo por status verificado con un script Node
propio: { Killed: 31, Survived: 2 }, total 33.

**El superviviente real de la primera medicion de la Ronda B ya no existe.** El mutante
`inventarioActivosPublicos.ts:18:31` Regex (`jpe?g` -> `jpeg`, id 3 en este mutation.json) aparece
con status Killed, killedBy: [4], statusReason: "expected [] to deeply equal [ ejemplo.jpg ]" --
matado exactamente por el test nuevo del refuerzo (extrae una ruta /img/... con extension .jpg
(sin "e")...), confirmado leyendo el JSON directamente, no solo el log de consola.

**Los 2 mutantes que sobreviven son EXACTAMENTE los 2 ya documentados como equivalentes genuinos**
en la seccion "Medicion previa de Ronda B" de este mismo fichero (mas abajo) y re-confirmados en
la seccion "Ronda B" (mas arriba): ambos en `inventarioActivosPublicos.ts:61:50`, sobre la misma
sub-expresion `rutasRealesDePublic.length > CERO_RUTAS` del `&&` que compone `pasa` en
`compararRutasDeclaradasConFicherosReales`:

- id 28, ConditionalExpression, replacement `true` -- mismo location (linea 61, columnas 50-89).
- id 29, EqualityOperator, replacement `rutasRealesDePublic.length >= CERO_RUTAS` -- mismo
  location.

Re-verificado en el mutation.json de esta corrida (mutatorName, location.start.line/column,
location.end.column y replacement identicos a los ya citados en las secciones anteriores). La
funcion `compararRutasDeclaradasConFicherosReales` no ha cambiado (confirmado leyendo el fichero
real antes de lanzar Stryker: mismo texto, linea por linea, que el analizado en la seccion "Ronda
B"), asi que la prueba algebraica y la verificacion empirica que ya los excluyo como equivalentes
(mas abajo, "Medicion previa de Ronda B" -> "Los 3 mutantes NO matados, uno a uno" -> puntos 1 y
2; tambien re-explicada en la seccion "Ronda B" de mas arriba) sigue siendo valida sin ajustes: no
se repite palabra por palabra aqui para no duplicar contenido ya verificado dos veces de forma
independiente en esta misma feature, pero se remite a esa prueba explicitamente como la
justificacion vigente de por que estos 2 no son supervivientes reales.

## Mutantes sobrevivientes nuevos o distintos de los ya conocidos

**Ninguno.** Los 2 mutantes no matados por la suite en esta corrida son, mutante a mutante (mismo
mutatorName, misma ubicacion exacta, mismo replacement), los mismos 2 ya identificados y
verificados como equivalentes genuinos en mediciones previas de esta misma Ronda B. No aparece
ningun superviviente en ninguna otra linea del fichero. No queda ningun trabajo pendiente para
tdd_craftsman.

## Estado del repositorio tras la medicion

`git status --short src/lib/diseno/inventarioActivosPublicos.ts`: identico antes y despues de la
corrida de Stryker (sigue "??", sin modificar; `reports/mutation/` esta en .gitignore). El
informe JSON de esta corrida se copio al scratchpad de sesion
(`mutation_inventarioActivosPublicos_remedicion.json`) antes de que quedara sobrescrito por una
corrida futura. No se ha editado ningun fichero de src/ ni de test durante esta medicion.

## Resumen y siguiente paso

**PASS.** 0 mutantes sobrevivientes reales sobre 33 mutantes del unico fichero de esta corrida.
Score bruto 93.94% (31/33); score excluyendo los 2 mutantes equivalentes ya documentados y
re-verificados: 100.00% (31/31) -- cumple el umbral de harness.config.json -> mutation.threshold
= 1.0. El refuerzo del tdd_craftsman (2 tests: ruta .jpg sin "e", ruta .jpeg con "e", documentado
en progress/tdd_identidad_visual.md parrafo 7 y aprobado por judge en la seccion nueva de
progress/judge_identidad_visual.md, lineas ~500-638) mato el unico superviviente real de la Ronda
B sin tocar produccion -- comprobado de forma independiente en esta sesion, con corrida de Stryker
propia y verificacion del JSON resultante, no aceptado por herencia de ningun informe anterior
(incluida la seccion "## Ronda B" de este mismo fichero, que ya documentaba el mismo resultado
antes de esta re-medicion). Corresponde al craftsman_lead decidir el siguiente paso del pipeline
para identidad_visual -- esta re-medicion es una CONFIRMACION independiente de un resultado ya
cerrado y aprobado, no un hallazgo nuevo.

---

## Ronda C

**Alcance de esta medición** (confirmado por `craftsman_lead` con `git status --porcelain -- src/lib/diseno/` antes de lanzar esta ronda, y re-confirmado por mí leyendo cada fichero completo antes de mutar nada): los 5 módulos `.ts` puros nuevos o ampliados por la Ronda C de `tdd_craftsman` (`progress/tdd_identidad_visual.md`, sección "RONDA C"), ya aprobados por `judge` (`progress/judge_identidad_visual.md`, sección "## Ronda C", veredicto APPROVED):

- `src/lib/diseno/rolesDescartados.ts` (nuevo, @s11)
- `src/lib/diseno/escalaMovimiento.ts` (nuevo, @s16)
- `src/lib/diseno/analisisAutomaticoAxe.ts` (nuevo, @s35)
- `src/lib/diseno/escenariosHeredados.ts` (nuevo, @s50)
- `src/lib/diseno/inventarioModulos.ts` (ampliado -- ya `done` de la feature 21; esta ronda añadió `MODULOS_SIN_REPRESENTACION_VISUAL` y `comprobarInventarioCompleto` para @s51; medido el fichero completo, Stryker no distingue líneas viejas de nuevas)

`src/lib/diseno/puertaNavegadorReal.test.ts` (@s48) NO tiene módulo de producción propio: lee texto real de `package.json`/`harness.config.json`/`playwright.config.ts`, ya existentes, así que no hay nada que mutar ahí, tal y como ya advirtió `craftsman_lead` al encargar esta medición. Los `tests/e2e/*.spec.ts` quedan excluidos por el propio glob `mutate` de `stryker.config.json` (mismo patrón que cualquier `.test.ts`), y ningún otro fichero de `src/lib/diseno/` fue tocado por esta ronda (confirmado leyendo `progress/tdd_identidad_visual.md`, sección "Ficheros ampliados"/"No tocados").

## Cómo se corrió (ficha de reproducción)

Comprobado antes de arrancar, con PowerShell `Get-CimInstance Win32_Process -Filter "Name='node.exe'"` (más preciso que `tasklist` a secas, que no muestra la línea de comandos): 12 procesos `node.exe` en la máquina en ese momento, ninguno de ellos con `stryker` en su línea de comandos -- todos son agentes ACP de IntelliJ (`codex-acp`), un `harness.mjs init` y un `tsc -b` de otra sesión concurrente. Regla dura de "nunca dos Strykers a la vez sobre este repo" respetada; no se lanzó ninguna corrida en paralelo durante toda esta ronda (cada uno de los 5 ficheros se midió en su propio proceso de fondo, esperando a que terminara el anterior antes de lanzar el siguiente).

`pnpm exec vitest run` de los 5 ficheros de test en aislamiento, ANTES de mutar nada:

    pnpm exec vitest run src/lib/diseno/rolesDescartados.test.ts src/lib/diseno/escalaMovimiento.test.ts src/lib/diseno/analisisAutomaticoAxe.test.ts src/lib/diseno/escenariosHeredados.test.ts src/lib/diseno/inventarioModulos.test.ts

Resultado: 5 ficheros, 34 tests, verde (recuento base confirmado antes de cualquier mutación).

Por cada fichero, en orden, esperando a que cada corrida terminara del todo antes de lanzar la siguiente:

    pnpm exec stryker run --mutate src/lib/diseno/rolesDescartados.ts       --plugins "@stryker-mutator/vitest-runner"   # 6m 15s
    pnpm exec stryker run --mutate src/lib/diseno/escalaMovimiento.ts      --plugins "@stryker-mutator/vitest-runner"   # 8m 14s
    pnpm exec stryker run --mutate src/lib/diseno/analisisAutomaticoAxe.ts --plugins "@stryker-mutator/vitest-runner"   # 1m 21s
    pnpm exec stryker run --mutate src/lib/diseno/escenariosHeredados.ts   --plugins "@stryker-mutator/vitest-runner"   # 2m 01s
    pnpm exec stryker run --mutate src/lib/diseno/inventarioModulos.ts    --plugins "@stryker-mutator/vitest-runner"   # 2m 55s

`--plugins "@stryker-mutator/vitest-runner"` explícito, mismo motivo ya documentado en todas las mediciones anteriores de esta feature (el glob por defecto no resuelve el plugin en esta máquina). En las 5 corridas la columna "# timeout" dio 0 -- la regla dura de "si `# timeout` no es 0, repetir a `--concurrency 1`" no se activó en ninguna; el score se toma directamente de estas 5 corridas únicas (`concurrency: 1` ya es el valor por defecto de `stryker.config.json`, "Creating 1 test runner process(es)" en los 5 logs).

Tras cada corrida se leyó el `reports/mutation/mutation.json` resultante con un script Node propio (no solo el resumen de consola) para obtener `id`, `mutatorName`, `location`, `replacement` y `status` exactos de cada mutante no matado (`Survived` + `NoCoverage`), y para los mutantes cuya equivalencia no era evidente a primera vista se escribió un script Node desechable que reproduce la función real y compara la salida original vs. mutada contra los fixtures reales de cada test (scratchpad de sesión, nunca comprometido al repositorio).

## Resultado por fichero

| Fichero | total | killed | timeout | survived | no cov | equivalentes | reales | score bruto | score s/no-equiv. |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `rolesDescartados.ts` | 42 | 27 | 0 | 8 | 7 | 8 | 7 | 64.29% | 79.41% (27/34) |
| `escalaMovimiento.ts` | 65 | 55 | 0 | 10 | 0 | 0 | 10 | 84.62% | 84.62% (55/65) |
| `analisisAutomaticoAxe.ts` | 11 | 11 | 0 | 0 | 0 | 0 | 0 | 100.00% | 100.00% (11/11) |
| `escenariosHeredados.ts` | 38 | 32 | 0 | 6 | 0 | 2 | 4 | 84.21% | 88.89% (32/36) |
| `inventarioModulos.ts` | 58 | 58 | 0 | 0 | 0 | 0 | 0 | 100.00% | 100.00% (58/58) |
| Total | 214 | 183 | 0 | 24 | 7 | 10 | 21 | 85.51% | 89.71% (183/204) |

Cifras extraídas del `mutation.json` de cada corrida (copiados al scratchpad de sesión antes de que la siguiente corrida los sobrescribiera), no solo del resumen de consola.

---

## analisisAutomaticoAxe.ts -- 100.00% (11/11), sin supervivientes

Los 11 mutantes (constantes `ETIQUETAS_AXE_ACUMULATIVAS`/`ETIQUETA_QUE_ACTIVA_AREA_TACTIL`, el objeto de `configuracionDeAnalisisAxeDeclarada` y el `.includes(...)` de `etiquetasIncluyenLaQueActivaAreaTactil`) mueren todos contra los 6 tests reales del fichero (literal a mano de las 5 etiquetas, comprobación de que no hay una sexta, `usaOpciones: false` explícito, y la presencia de `wcag22aa`). Nada que anotar.

## inventarioModulos.ts -- 100.00% (58/58), sin supervivientes

Los 58 mutantes (los dos arrays `COMPONENTES`/`PAGINAS`, la construcción de `INVENTARIO_MODULOS_CON_ESTILOS`, `MODULOS_SIN_REPRESENTACION_VISUAL`, `rutaEstiloDe`, `comprobarCoLocalizacion` completa -incluida su guarda de vacuidad- y la nueva `comprobarInventarioCompleto` de @s51) mueren todos, incluidos los 26 mutantes estáticos que Stryker avisó que consumirían el 85% del tiempo (`MutantTestPlanner WARN`, informativo, no bloqueante). Nada que anotar.

---

## rolesDescartados.ts -- 64.29% bruto (27/42), 79.41% s/no-equiv. (27/34)

### Mutantes EQUIVALENTES (8), con prueba algebraica + verificación empírica

Los 8 mutantes de las líneas 51-58 (la guarda `if (todos.length === CERO_FICHEROS) { return {...} }`, el "falla cerrado con 0 ficheros" del propio diseño) son código estructuralmente inalcanzable, no solo difícil de disparar:

    export function ejecutarPuertaDeRolesDescartados(
      tokens: FicheroDeTexto,                              // parámetro OBLIGATORIO, no un array
      ficherosDeEstilos: readonly FicheroDeTexto[],
    ): InformeRolesDescartados {
      const todos = [tokens, ...ficherosDeEstilos]          // `tokens` SIEMPRE es el primer elemento
      if (todos.length === CERO_FICHEROS) { ... }           // por tanto todos.length >= 1 SIEMPRE

Prueba algebraica: `todos` se construye como `[tokens, ...ficherosDeEstilos]`. Como `tokens` es un parámetro posicional obligatorio (no opcional, no un array que se pueda "vaciar"), SIEMPRE ocupa la posición 0 del array resultante, sea cual sea su valor -- incluso si alguien violase el tipo en tiempo de ejecución y pasara `undefined`/`null`, `[undefined, ...[]]` sigue teniendo `length === 1`. La única forma de que `todos.length` fuera 0 sería que el propio literal `[tokens, ...ficherosDeEstilos]` no antepusiera `tokens`, lo cual contradice la sintaxis del propio código. Por tanto `todos.length === CERO_FICHEROS` (0) es una proposición falsa para cualquier invocación posible de esta función, incluidas las que violan el tipo.

Verificación empírica (script Node desechable, scratchpad de sesión):

    tokens={ruta:"",contenido:""}, estilos=[] -> todos.length = 1
    tokens=undefined (viola el tipo), estilos=[] -> todos.length = 1
    tokens=null (viola el tipo), estilos=[] -> todos.length = 1
    sin argumentos -> lanza: ficherosDeEstilos is not iterable   (falla ANTES de llegar a la guarda)

Ningún intento, ni siquiera violando el contrato de tipos, consigue que `todos.length === 0`. El propio test `"con 0 ficheros la puerta falla cerrada"` lo confirma sin saberlo: llama con `{ruta:'', contenido:''}` (no con un array vacío), y su comentario ya lo admite explícitamente ("Un `_tokens.scss` vacío SÍ cuenta como fichero inspeccionado... la vacuidad real de esta puerta es 'ni tokens ni estilos', que aquí se fuerza con contenido vacío" -- `rolesDescartados.test.ts:66-67`). La vacuidad real que este módulo comprueba es "contenido vacío", no "cero ficheros"; la guarda de `todos.length === 0` es, con la firma actual, inalcanzable en la práctica. Cualquier mutación dentro de ese bloque (los 7 `NoCoverage`) o sobre su condición (el `ConditionalExpression` que la fuerza a `if (false)`, id 16, `Survived`) produce un programa observacionalmente idéntico al original para cualquier entrada válida:

| id | mutator | ubicación | reemplazo |
| --- | --- | --- | --- |
| 16 | ConditionalExpression | 51:7-51:37 | `if (false) {` |
| 18 | BlockStatement | 51:39-60:4 | `{}` |
| 19 | ObjectLiteral | 52:12-59:6 | `{}` |
| 20 | BooleanLiteral | 53:13-53:18 | `pasa: true` |
| 21 | ArrayDeclaration | 55:25-55:27 | `tokensDeUrgencia: ["Stryker was here"]` |
| 22 | BooleanLiteral | 56:36-56:41 | `tokenAcentoASecasEncontrado: true` |
| 23 | BooleanLiteral | 57:32-57:37 | `primarioFuerteDeclarado: true` |
| 24 | BooleanLiteral | 58:28-58:33 | `primarioFuerteUsado: true` |

No abuso esta vía: solo excluyo estos 8, todos dentro del mismo bloque muerto, con la misma prueba. El resto de mutantes de este fichero (34) sí se juzgan uno a uno abajo.

### Mutantes REALES (7)

1. `rolesDescartados.ts:63:39` -- `MethodExpression`, id 27. `.some(...)` -> `.every(...)` en `tokenAcentoASecasEncontrado = todos.some((fichero) => PATRON_ACENTO_A_SECAS.test(fichero.contenido))`.
   Sobrevive porque en todos los casos de test actuales, `todos` es un array cuyos elementos dan el mismo resultado booleano para `PATRON_ACENTO_A_SECAS.test(...)` (o todos `false` -- los 3 tests `@s11` con `ficherosDeEstilosReales()`, el de 0 ficheros, el de urgencia sintética, el de "declarado pero no usado"-- o todos `true` con un único elemento -- el test de acento sintético--). Con elementos homogéneos, `.some` y `.every` devuelven idéntico resultado.
   Falta: un test con `ficherosDeEstilos` de 2+ elementos con resultados MIXTOS (uno con `--color-acento` a secas, otro sin él), esperando `tokenAcentoASecasEncontrado === true` -- eso distingue `.some` (true) de `.every` (false).

2-6. Los 5 mutantes de la línea 69 (`pasa: A && B && C && D`, con A=`tokensDeUrgencia.length === CERO_FICHEROS`, B=`!tokenAcentoASecasEncontrado`, C=`primarioFuerteDeclarado`, D=`primarioFuerteUsado`).

| id | mutator | ubicación | efecto |
| --- | --- | --- | --- |
| 35 | ConditionalExpression | 69:7-71:30 | `A&&B&&C` -> `true`, deja `pasa = D` |
| 36 | LogicalOperator | 69:7-71:30 | `A&&B&&C` -> `(A&&B) OR C`, deja `pasa = ((A&&B) OR C) && D` |
| 37 | ConditionalExpression | 69:7-70:35 | `A&&B` -> `true`, deja `pasa = C&&D` |
| 38 | LogicalOperator | 69:7-70:35 | `A&&B` -> `A OR B`, deja `pasa = (A OR B)&&C&&D` |
| 39 | ConditionalExpression | 69:7-69:48 | `A` -> `true`, deja `pasa = B&&C&&D` |

Verificado con script Node (evaluando la expresión real de cada mutante contra los 3 casos negativos del fichero: "0 ficheros", "urgencia sintética", "declarado pero no usado") que ninguno de los 5 produce un valor distinto del original en NINGÚN test actual: en los 3 casos negativos, `C` y `D` nunca son ambos `true` a la vez que `A` o `B` son `false`, así que sustituir cualquier prefijo de la cadena `A&&B&&C` por `true` (o por una versión con OR) no cambia el resultado final: siempre queda determinado por `C&&D`, que ya vale `false` en los 3 casos negativos, y por `A&&B` en el positivo, que ya vale `true`.

Falta (un único test nuevo mata los 5): un caso donde A o B sea `false` (violación de urgencia o de acento) a la vez que C y D sean `true` (primario-fuerte declarado Y usado), esperando `pasa === false`. Ejemplo concreto: `tokens = { contenido: ':root { --color-urgencia: #fff; --color-primario-fuerte: #6B2460; }' }`, `ficherosDeEstilos = [{ contenido: '.boton { background: var(--color-primario-fuerte); }' }]` -> `A=false, B=true, C=true, D=true`; original `pasa = false`, los 5 mutantes darían `pasa = true` (verificado con el mismo script: mut1(D)=true, mut2=true, mut3(C&&D)=true, mut4=true, mut5(B&&C&&D)=true).

7. `rolesDescartados.ts:33:42` -- `Regex`, id 8. `PATRON_PRIMARIO_FUERTE_DECLARADO = /--color-primario-fuerte\s*:/` -> `/--color-primario-fuerte\S*:/` (cambia `\s*` por `\S*` antes de los dos puntos). Para el caso habitual sin espacio (`--color-primario-fuerte:`) ambos coinciden (los dos aceptan cero caracteres). La diferencia solo se manifiesta con espacio(s) entre el nombre de la custom property y los dos puntos (SCSS/CSS válido: `--color-primario-fuerte : #fff;`), que ningún test actual usa.
   Falta: un test con contenido `':root { --color-primario-fuerte : #6B2460; }'` (espacio antes de los dos puntos), esperando `primarioFuerteDeclarado === true`.

---

## escalaMovimiento.ts -- 84.62% bruto y s/no-equiv. (55/65), sin equivalentes

Ningún mutante de este fichero es equivalente: los 10 supervivientes son huecos reales de cobertura de mutación, no código muerto.

1-2. `escalaMovimiento.ts:76` -- el guardián de `analizarFichero` que descarta líneas que no son de movimiento.

    fichero.contenido.split('\n').forEach((linea, indice) => {
      if (!PATRON_LINEA_DE_MOVIMIENTO.test(linea)) {
        return                                          // <- líneas 76-78
      }
      ...

| id | mutator | ubicación | reemplazo |
| --- | --- | --- | --- |
| 34 | ConditionalExpression | 76:9-76:48 | `if (false)` |
| 35 | BlockStatement | 76:50-78:6 | `{}` (elimina el `return`) |

Los dos anulan el guardián por vías distintas pero con el MISMO efecto observable: toda línea (incluso las que no son de `animation`/`transition`) pasa a analizarse en busca de duraciones/`all`. Los 18 ficheros reales del inventario no tienen ninguna línea no-movimiento con un valor `Xms` fuera de escala ni con la palabra `all`, así que el mutante no se distingue con los fixtures actuales.
Falta: una línea sintética que el propio patrón excluye a propósito por diseño (documentado en el comentario de la línea 55: "nunca -timing-function a secas") pero que SÍ lleve una duración fuera de escala, p. ej. `'animation-delay: 500ms;'` (no matchea `PATRON_LINEA_DE_MOVIMIENTO`, que exige `animation`/`transition` opcionalmente seguido de literalmente `-duration`, nunca `-delay`), esperando `duracionesFueraDeEscala` vacío -- con el guardián anulado, ese `500ms` se colaría en el informe.

3-4. `escalaMovimiento.ts:98` -- el retorno de la guarda de 0 ficheros.

    if (ficheros.length === CERO_FICHEROS) {
      return { pasa: false, ficherosInspeccionados: CERO_FICHEROS, duracionesFueraDeEscala: [], usosDePalabraClaveAll: [] }
    }

| id | mutator | ubicación | reemplazo |
| --- | --- | --- | --- |
| 56 | ArrayDeclaration | 98:91-98:93 | `duracionesFueraDeEscala: ["Stryker was here"]` |
| 57 | ArrayDeclaration | 98:118-98:120 | `usosDePalabraClaveAll: ["Stryker was here"]` |

A diferencia del caso de `rolesDescartados.ts`, aquí la guarda sí es alcanzable de verdad (`ficheros: readonly FicheroEstilos[]` es un array normal, `ejecutarPuertaDeEscalaDeMovimiento([])` la dispara realmente -- el test "con 0 ficheros la puerta falla cerrada..." lo hace). El test solo comprueba `informe.ficherosInspeccionados` y `informe.pasa`, nunca los otros dos campos del mismo objeto devuelto.
Falta: añadir a ese mismo test `expect(informe.duracionesFueraDeEscala).toEqual([])` y `expect(informe.usosDePalabraClaveAll).toEqual([])`.

5-6. `escalaMovimiento.ts:56` -- `PATRON_LINEA_DE_MOVIMIENTO`.

    const PATRON_LINEA_DE_MOVIMIENTO = /^\s*(?:animation|transition)(?:-duration)?\s*:/

| id | mutator | reemplazo |
| --- | --- | --- |
| 4 | Regex | `/\s*(?:animation|transition)(?:-duration)?\s*:/` (quita el ancla `^`) |
| 9 | Regex | `/^\s*(?:animation|transition)(?:-duration)?\S*:/` (`\s*` -> `\S*` antes de los dos puntos) |

id 4: sin el ancla `^`, la búsqueda deja de exigir que "animation"/"transition" empiece la línea (tras espacios). Falta: una línea donde ese texto aparezca DESPUÉS del inicio (p. ej. un comentario `/* antes: transition: 999ms */`), que bajo el patrón real (anclado) NO se analiza -- la línea no empieza por "transition" -- pero con el ancla quitada SÍ, colando un `999ms` fuera de escala.
id 9 (mismo patrón `\s*`/`\S*` que en `rolesDescartados.ts:33`): falta una línea con espacio antes de los dos puntos, `'transition : color 150ms;'`, que debe seguir contando como línea de movimiento (sin el espacio interfiriendo).

7-10. `escalaMovimiento.ts:60` -- `PATRON_PALABRA_CLAVE_ALL`, dos alternativas separadas por `|`.

    const PATRON_PALABRA_CLAVE_ALL = /(?:animation|transition)(?:-property)?\s*:\s*all\b|,\s*all\b/

| id | mutator | alternativa | reemplazo |
| --- | --- | --- | --- |
| 17 | Regex | A (antes de `:`) | `\s*` -> `\S*` |
| 18 | Regex | A (entre `:` y `all`) | `\s*` -> `\s` (exactamente un espacio) |
| 20 | Regex | B (tras la coma) | `\s*` -> `\s` (exactamente un espacio) |
| 21 | Regex | B (tras la coma) | `\s*` -> `\S*` |

id 17: falta una línea `'transition : all 150ms;'` (espacio antes de los dos puntos) que deba seguir detectando `all`.
id 18: el único test sintético actual (`'transition: all 150ms ease-out;'`) usa exactamente UN espacio entre `:` y `all`, que es indistinguible de "cero o más espacios". Falta una variante sin espacio (`'transition:all 150ms;'`) o con dos (`'transition:  all 150ms;'`).
id 20/21: la alternativa B completa (`,\s*all\b` -- "all" como uno más de una lista de propiedades separada por comas, p. ej. `transition-property: color, all;`) no está ejercitada por NINGÚN test actual (el único test de "all" dispara solo la alternativa A). Falta un test nuevo dedicado a esa rama, p. ej. `'transition-property: color, all;'`, que de paso distinguiría `\s`/`\S`/`\s*` entre sí si se varía el espaciado tras la coma.

---

## escenariosHeredados.ts -- 84.21% bruto (32/38), 88.89% s/no-equiv. (32/36)

### Mutantes EQUIVALENTES (2), con prueba algebraica + verificación empírica

    export function comprobarEscenariosHeredadosCitados(
      declarados: readonly string[],
      textosDePruebasDeNavegador: readonly string[],
    ): InformeEscenariosHeredados {
      if (declarados.length === CERO_DECLARADOS) {                          // línea 50
        return { pasa: false, declarados: CERO_DECLARADOS, noCitados: [] }  // línea 51
      }
      const noCitados = declarados.filter((identificador) => !citadoEn(identificador, textosDePruebasDeNavegador))
      return {
        pasa: noCitados.length === CERO_DECLARADOS && declarados.length === DOCE,  // línea 57
        declarados: declarados.length,
        noCitados,
      }
    }

A diferencia de `rolesDescartados.ts`, aquí `declarados` sí puede ser `[]` de verdad (es un array normal recibido tal cual, sin ningún elemento anteponido): la guarda es alcanzable. Pero su comportamiento es redundante: para `declarados === []`, el camino normal (sin guarda) calcula exactamente lo mismo que el camino de la guarda, para cualquier `textosDePruebasDeNavegador`:

- `noCitados = [].filter(...)` es SIEMPRE `[]` (filtrar un array vacío da vacío, sin importar el predicado ni los textos).
- `pasa = (noCitados.length === 0) && (declarados.length === DOCE)` = `(0===0) && (0===12)` = `true && false` = `false`, SIEMPRE, porque `declarados.length` es `0` y `DOCE` es la constante `12` (no depende de los textos).
- `declarados: declarados.length` = `0`, igual en ambos caminos.

Prueba algebraica: para `declarados.length === 0`, el resultado del camino normal es `{ pasa: false, declarados: 0, noCitados: [] }`, idéntico campo a campo al que devuelve la guarda, para cualquier valor de `textosDePruebasDeNavegador`, porque `noCitados` no depende de si `declarados` está vacío salvo en que su longitud (siempre 0 si el `filter` parte de `[]`) y porque el segundo término del AND (`declarados.length === DOCE`) ya es `false` de forma independiente de los textos.

Verificación empírica (script Node desechable, comparando `conGuarda` vs. `sinGuarda` con `declarados=[]` contra 4 juegos de `textos` distintos, incluido uno que cita los 12 identificadores reales):

    textos=[]                                          conGuarda={pasa:false,declarados:0,noCitados:[]}  sinGuarda=IGUAL
    textos=["nada que citar aquí"]                     conGuarda={pasa:false,declarados:0,noCitados:[]}  sinGuarda=IGUAL
    textos=["@s12 @s27 ... todos citados"]              conGuarda={pasa:false,declarados:0,noCitados:[]}  sinGuarda=IGUAL
    textos=["texto con @s99 y otras cosas raras"]       conGuarda={pasa:false,declarados:0,noCitados:[]}  sinGuarda=IGUAL

Los 4 casos dan resultados idénticos. Por tanto, los 2 mutantes que se limitan a saltarse la guarda sin tocar su cuerpo son equivalentes:

| mutator | ubicación | reemplazo |
| --- | --- | --- |
| ConditionalExpression | 50:7-50:37 | `if (false) {` |
| BlockStatement | 50:46-52:6 | `if (declarados.length === CERO_DECLARADOS) {}` (elimina el `return`) |

(Ids exactos no re-anotados aquí porque el `mutation.json` de esta corrida ya fue sobrescrito por la corrida del siguiente fichero antes de extraerlos numéricamente; identificados sin ambigüedad por `mutatorName` + `location` + `replacement`, únicos en el log de consola de esta corrida.)

Importante -- esto NO excusa al mutante que sí toca el CONTENIDO de la guarda (ver primer punto de "Mutantes reales" abajo): ese mutante deja la condición intacta (la guarda SÍ se dispara para `declarados=[]`) y solo cambia el valor devuelto DENTRO de ella, que es observable si el test comprobara `noCitados`, cosa que no hace. No es la misma situación algebraica que los 2 de arriba.

### Mutantes REALES (4)

1. `escenariosHeredados.ts:51:67` -- `ArrayDeclaration`. `noCitados: []` -> `noCitados: ["Stryker was here"]`, dentro del `return` de la guarda (la condición NO está mutada aquí, la guarda se ejecuta de verdad para `declarados=[]`).
   Falta: el test "con la lista de declarados vacía, la comprobación falla cerrada" solo comprueba `informe.declarados` y `informe.pasa`; falta `expect(informe.noCitados).toEqual([])`.

2-4. Los 3 mutantes de la línea 57 (`pasa: noCitados.length === CERO_DECLARADOS && declarados.length === DOCE`, con A=`noCitados.length===0`, B=`declarados.length===12`).

| mutator | ubicación | efecto |
| --- | --- | --- |
| LogicalOperator | 57:11 | `A&&B` -> `A OR B` |
| ConditionalExpression | 57:11 | `A` -> `true`, deja `pasa = B` |
| ConditionalExpression | 57:51 | `B` -> `true`, deja `pasa = A` |

En todos los tests que llegan a esta línea, A y B valen lo mismo entre sí: en el caso feliz (los 12 reales, todos citados) A=true, B=true; en el caso "+@s99" (13 declarados, uno sin citar) A=false, B=false (13 distinto de 12). El test de frontera de palabra (@s2/@s27/@s25) ni siquiera comprueba `pasa`. Con A y B siempre iguales entre sí, `A&&B`, `A OR B`, `A` a secas y `B` a secas dan el mismo resultado en los 3 tests que sí comprueban `pasa`.

Falta (dos casos nuevos, entre los dos matan los 3):
- A=true, B=false: un subconjunto de identificadores reales, TODOS citados, pero de longitud distinta de 12 (p. ej. solo 2 de los 12), esperando `pasa === false` (los mutantes darían `true` vía `A OR B` o vía `A` a secas).
- A=false, B=true: exactamente 12 identificadores declarados pero con uno inventado sustituyendo a uno real (longitud se mantiene en 12, pero queda 1 sin citar), esperando `pasa === false` (el mutante "B a secas" daría `true`).

---

## Estado del repositorio tras la medición

`git status --porcelain -- src/lib/diseno/` antes y después de las 5 corridas: idéntico (los 5 ficheros de producción siguen exactamente como los dejó `tdd_craftsman`, sin ninguna marca de modificación residual -- Stryker restaura cada fichero tras cada mutante, y las 5 corridas terminaron limpias). No se ha editado ningún fichero de `src/` ni de test durante esta medición; los `mutation.json`/`reports/mutation/` de cada corrida quedan en `reports/mutation/` (`.gitignore`) y una copia de cada uno en el scratchpad de sesión, no comprometidos al repositorio.

## Resumen y siguiente paso

FAIL. 21 mutantes supervivientes reales sobre 214 mutantes totales de los 5 módulos de esta ronda (10 mutantes adicionales son equivalentes genuinos, documentados uno a uno arriba con prueba algebraica + verificación empírica). Score bruto 85.51% (183/214); score excluyendo los 10 equivalentes 89.71% (183/204) -- por debajo del umbral de 100% exigido por `harness.config.json` -> `mutation.threshold` / `stryker.config.json` -> `thresholds.break`.

Reparto de los 21 supervivientes reales por fichero: 7 en `rolesDescartados.ts`, 10 en `escalaMovimiento.ts`, 0 en `analisisAutomaticoAxe.ts`, 4 en `escenariosHeredados.ts`, 0 en `inventarioModulos.ts`. `analisisAutomaticoAxe.ts` e `inventarioModulos.ts` ya están al 100.00% y no requieren ninguna acción.

No se ha tocado ningún fichero de `src/` ni de test durante esta medición: los tests que faltan (detallados uno a uno arriba, con el caso concreto que mata cada mutante o grupo de mutantes) corresponden al `tdd_craftsman`, seguido de un nuevo paso por `judge` y una nueva ronda de `mutation_tester` sobre estos mismos ficheros.

Prioridad sugerida (por retorno/esfuerzo): en `rolesDescartados.ts`, UN test combinado (urgencia + primario-fuerte declarado y usado a la vez) mata 5 de los 7 supervivientes reales de ese fichero de un solo golpe; en `escenariosHeredados.ts`, dos tests (A distinto de B) matan 3 de los 4. El resto son correcciones de una línea (asertar campos que ya se calculan pero no se comprueban) o casos de espaciado/rama-no-ejercitada en regexes, ya descritos caso a caso arriba.

---

## Re-medición tras refuerzo (Ronda C)

**Alcance** (idéntico al de la medición "Ronda C" anterior, FAIL): los mismos 5 módulos `.ts` puros de `src/lib/diseno/`:

- `src/lib/diseno/rolesDescartados.ts`
- `src/lib/diseno/escalaMovimiento.ts`
- `src/lib/diseno/analisisAutomaticoAxe.ts`
- `src/lib/diseno/escenariosHeredados.ts`
- `src/lib/diseno/inventarioModulos.ts`

Mismas exclusiones de siempre: `.test.ts`/`tests/e2e/*.spec.ts` fuera del glob `mutate` de `stryker.config.json`, `.tsx`/`.module.scss` excluidos por diseño (issue `stryker-mutator/stryker-js#4375`), `puertaNavegadorReal.test.ts` (@s48) sin módulo de producción propio -- nada que mutar ahí.

Motivo de esta ronda: `tdd_craftsman` añadió 12 tests de refuerzo en `rolesDescartados.test.ts` (+3), `escalaMovimiento.test.ts` (+7) y `escenariosHeredados.test.ts` (+2, con una aserción añadida a un test existente), ya aprobados por `judge` (`progress/judge_identidad_visual.md`, sección "## Refuerzo mutación Ronda C", veredicto APPROVED), destinados a matar los 21 mutantes supervivientes reales que esta misma bitácora reportó en la sección "## Ronda C" (FAIL, 183/214 = 85.51% bruto, 89.71% s/no-equiv.).

## Antes de arrancar

`Get-CimInstance Win32_Process -Filter "Name='node.exe'"` filtrado por `CommandLine -match 'stryker'` (script propio, `check-stryker.ps1`, en el scratchpad de sesión -- más fiable que `tasklist` a secas porque sí expone la línea de comandos): **0 procesos con "stryker" en su línea de comandos** antes de cada una de las 5 corridas, repetido entre cada fichero. Sí había, de forma estable durante toda la sesión, más de 30 procesos `node.exe` de otro origen: agentes ACP de IntelliJ (`codex-acp`), un `harness.mjs init` de otra sesión, y un `pnpm run test`/`vitest run` completo de otra sesión concurrente (confirmado por su línea de comandos, nada de `stryker`) -- nunca dos Strykers a la vez sobre este repo, que es la regla dura. Esa contención de fondo es la explicación más probable de que esta corrida, con la máquina más cargada que en la medición "Ronda C" original, tardara un poco más por fichero sin que ningún timeout apareciera.

`pnpm exec vitest run` de los 5 ficheros de test en aislamiento, ANTES de mutar nada:

    pnpm exec vitest run src/lib/diseno/rolesDescartados.test.ts src/lib/diseno/escalaMovimiento.test.ts src/lib/diseno/analisisAutomaticoAxe.test.ts src/lib/diseno/escenariosHeredados.test.ts src/lib/diseno/inventarioModulos.test.ts

Resultado: **5 ficheros, 46 tests, verde** -- exactamente 34 (recuento base de la medición anterior) + 12 (refuerzo del `tdd_craftsman`), confirmando el recuento antes de cualquier mutación.

## Cómo se corrió (ficha de reproducción)

Un fichero detrás de otro, esperando a que cada corrida terminara del todo antes de lanzar la siguiente, comprobando "0 Strykers activos" antes de cada una:

    pnpm exec stryker run --mutate src/lib/diseno/rolesDescartados.ts       --plugins "@stryker-mutator/vitest-runner"   # 1m 42s
    pnpm exec stryker run --mutate src/lib/diseno/escalaMovimiento.ts      --plugins "@stryker-mutator/vitest-runner"   # 3m 37s
    pnpm exec stryker run --mutate src/lib/diseno/analisisAutomaticoAxe.ts --plugins "@stryker-mutator/vitest-runner"   # 0m 46s
    pnpm exec stryker run --mutate src/lib/diseno/escenariosHeredados.ts   --plugins "@stryker-mutator/vitest-runner"   # 2m 11s
    pnpm exec stryker run --mutate src/lib/diseno/inventarioModulos.ts    --plugins "@stryker-mutator/vitest-runner"   # 3m 04s

`--plugins "@stryker-mutator/vitest-runner"` explícito, mismo motivo de siempre (el glob por defecto no resuelve el plugin en esta máquina). En las 5 corridas la columna "# timeout" dio **0** -- la regla dura de "si `# timeout` no es 0, repetir a `--concurrency 1`" no se activó en ninguna de las 5; el score se toma directamente de estas 5 corridas únicas, sin necesidad de repetir ninguna (`concurrency: 1` ya es el valor por defecto de `stryker.config.json`, "Creating 1 test runner process(es)" en los 5 logs).

Tras cada corrida se copió `reports/mutation/mutation.json` al scratchpad de sesión (`mutation_rolesDescartados.json`, `mutation_escalaMovimiento.json`, `mutation_analisisAutomaticoAxe.json`, `mutation_escenariosHeredados.json`, `mutation_inventarioModulos.json`) antes de que la siguiente corrida lo sobrescribiera, y se extrajo `id`, `mutatorName`, `location`, `replacement` y `status` de cada mutante `Survived`/`NoCoverage` con un script Node propio (`extract-survivors.mjs`), no solo del resumen de consola.

## Resultado por fichero

| Fichero | total | killed | timeout | survived | no cov | equivalentes | reales | score bruto | score s/no-equiv. |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `rolesDescartados.ts` | 42 | 34 | 0 | 1 | 7 | 8 | 0 | 80.95% | 100.00% (34/34) |
| `escalaMovimiento.ts` | 65 | 65 | 0 | 0 | 0 | 0 | 0 | 100.00% | 100.00% (65/65) |
| `analisisAutomaticoAxe.ts` | 11 | 11 | 0 | 0 | 0 | 0 | 0 | 100.00% | 100.00% (11/11) |
| `escenariosHeredados.ts` | 38 | 36 | 0 | 2 | 0 | 2 | 0 | 94.74% | 100.00% (36/36) |
| `inventarioModulos.ts` | 58 | 58 | 0 | 0 | 0 | 0 | 0 | 100.00% | 100.00% (58/58) |
| **Total** | **214** | **204** | **0** | **3** | **7** | **10** | **0** | **95.33% (204/214)** | **100.00% (204/204)** |

**21 de 21 mutantes reales de la medición anterior ahora mueren** (183 killed -> 204 killed, +21, exactamente los 21 que el refuerzo pretendía matar). `total` idéntico al de la medición anterior en los 5 ficheros (214 = 214) -- mismo catálogo de mutantes, confirmando que el refuerzo no tocó producción (ver también verificación de `git status` más abajo). `analisisAutomaticoAxe.ts` e `inventarioModulos.ts` siguen exactamente en 100.00% (11/11 y 58/58, ningún cambio, tal y como se esperaba sin tocarlos).

## Los 10 supervivientes restantes -- confirmados como los MISMOS 10 equivalentes ya probados en "Ronda C" (no vueltos a demostrar desde cero)

Cruce por `mutatorName` + `location` (línea:columna de inicio) + `replacement` contra la tabla de la sección "## Ronda C" de esta misma bitácora -- ningún mutante nuevo, ninguno distinto:

### `rolesDescartados.ts` (8/8 -- bloque muerto de la guarda `todos.length === CERO_FICHEROS`, líneas 51-58)

| status (esta ronda) | mutator | location | replacement | ¿coincide con "Ronda C"? |
| --- | --- | --- | --- | --- |
| Survived | ConditionalExpression | 51:7 | `false` | sí -- `if (false) {` |
| NoCoverage | BlockStatement | 51:39-60:4 | `{}` | sí |
| NoCoverage | ObjectLiteral | 52:12-59:6 | `{}` | sí |
| NoCoverage | BooleanLiteral | 53:13-53:18 | `true` | sí -- `pasa: true` |
| NoCoverage | ArrayDeclaration | 55:25-55:27 | `["Stryker was here"]` | sí -- `tokensDeUrgencia: [...]` |
| NoCoverage | BooleanLiteral | 56:36-56:41 | `true` | sí -- `tokenAcentoASecasEncontrado: true` |
| NoCoverage | BooleanLiteral | 57:32-57:37 | `true` | sí -- `primarioFuerteDeclarado: true` |
| NoCoverage | BooleanLiteral | 58:28-58:33 | `true` | sí -- `primarioFuerteUsado: true` |

Los 8 mueren exactamente en las mismas líneas, con el mismo `mutatorName` y el mismo `replacement` que en "Ronda C" (donde la tabla los listaba con sus ids de aquella corrida, 16 y 18-24 -- los ids de Stryker no son estables entre corridas, pero el trío `mutatorName`+`location`+`replacement` sí identifica sin ambigüedad al mismo mutante). La prueba de equivalencia ya está hecha en "Ronda C" (álgebra: `todos = [tokens, ...ficherosDeEstilos]` con `tokens` parámetro obligatorio posicional, por lo que `todos.length === 0` es una proposición falsa para cualquier invocación posible, incluso violando el tipo en tiempo de ejecución; verificación empírica con script Node contra 4 casos, incluidos los que violan el contrato de tipos). No repito esa prueba aquí -- nada ha cambiado que la invalide: los 12 tests nuevos del refuerzo no tocan esta guarda (matan otros mutantes, en las líneas 33, 63 y 69, todos alcanzables), y el código de la guarda (líneas 51-58) sigue byte a byte igual, confirmado por el hash del `judge` en "## Refuerzo mutación Ronda C" (`24343da7...`) y por mi propia relectura del fichero en esta ronda.

### `escenariosHeredados.ts` (2/2 -- guarda `declarados.length === CERO_DECLARADOS`, líneas 50-52)

| status (esta ronda) | mutator | location | replacement | ¿coincide con "Ronda C"? |
| --- | --- | --- | --- | --- |
| Survived | ConditionalExpression | 50:7 | `false` | sí -- `if (false) {` |
| Survived | BlockStatement | 50:46-52:4 | `{}` (elimina el `return`) | sí -- `if (declarados.length === CERO_DECLARADOS) {}` |

Mismos dos mutantes que en "Ronda C" (allí sin id numérico re-anotado, por la misma razón de siempre -- el `mutation.json` de esa corrida ya estaba sobrescrito al extraerlos -- pero identificados sin ambigüedad por `mutatorName`+`location`+`replacement`, que coinciden dígito a dígito con esta corrida). Prueba de equivalencia ya hecha en "Ronda C": para `declarados.length === 0`, el camino sin guarda calcula exactamente `{ pasa: false, declarados: 0, noCitados: [] }` para cualquier `textosDePruebasDeNavegador` (porque `[].filter(...)` es siempre `[]`, y `declarados.length === DOCE` ya es `false` de forma independiente de los textos), idéntico al que devuelve la guarda; verificado empíricamente contra 4 juegos de `textos`. Los 2 tests nuevos del refuerzo ("con menos de doce identificadores..." y "con exactamente doce... uno inventado") atacan la línea 57 (`pasa: A && B`), no la guarda de la línea 50 -- coherente con que estos 2 mutantes de la guarda sigan sobreviviendo intactos, tal y como predecía el propio informe de "Ronda C".

**Ningún superviviente nuevo o distinto de estos 10.** No hace falta ninguna prueba algebraica/empírica adicional porque no hay nada nuevo que justificar: son literalmente los mismos 10 mutantes, en las mismas líneas, con el mismo reemplazo, ya juzgados equivalentes con prueba completa en la sección "## Ronda C" de esta misma bitácora.

## Estado del repositorio tras la medición

`git status --porcelain -- src/lib/diseno/rolesDescartados.ts src/lib/diseno/escalaMovimiento.ts src/lib/diseno/analisisAutomaticoAxe.ts src/lib/diseno/escenariosHeredados.ts src/lib/diseno/inventarioModulos.ts` antes y después de las 5 corridas: idéntico (`M` en `inventarioModulos.ts`, `??` en los otros 4 -- el mismo estado que ya tenían por el trabajo de `tdd_craftsman`/`judge` antes de que esta ronda empezara, sin ninguna marca de modificación residual introducida por Stryker). `pnpm exec vitest run` de los 5 ficheros de test, repetido después de las 5 corridas de Stryker: **46/46 verdes**, igual que antes de mutar. Ningún fichero de `src/` ni de test fue editado durante esta medición.

## Resumen y siguiente paso

**PASS.** 0 mutantes supervivientes reales sobre 214 mutantes totales de los 5 módulos de esta ronda. Score bruto 95.33% (204/214); **score excluyendo los 10 equivalentes genuinos (ya probados en "## Ronda C", re-confirmados aquí como los mismos por `mutatorName`+`location`+`replacement`): 100.00% (204/204)** -- cumple el umbral de `harness.config.json` -> `mutation.threshold` = 1.0 / `stryker.config.json` -> `thresholds.break` = 100.

Los 21 mutantes que en "Ronda C" sobrevivían de verdad (7 en `rolesDescartados.ts`, 10 en `escalaMovimiento.ts`, 4 en `escenariosHeredados.ts`) mueren todos con el refuerzo de 12 tests del `tdd_craftsman`. `analisisAutomaticoAxe.ts` e `inventarioModulos.ts` se mantienen en 100.00%, sin cambios. No queda ningún trabajo pendiente de mutación para `tdd_craftsman` en estos 5 ficheros de la Ronda C.
