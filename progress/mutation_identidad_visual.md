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
