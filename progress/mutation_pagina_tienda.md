# Mutación — feature `pagina_tienda` (id 18) — ronda 2 (re-medición tras refuerzo de `tdd_craftsman` y `judge` Ronda 8, APPROVED)

**Veredicto:** PASS

**Score (bruto, 2 ficheros):** 191/193 = 98.96%
**Score (excluidos los 2 mutantes equivalentes genuinos ya documentados y re-verificados sin cambios, `PaginaTienda-logica.ts:226`):** 191/191 = 100.00%
(umbral: 1.0 / 100%, `harness.config.json` -> `mutation.threshold`; `stryker.config.json` -> `thresholds.break = 100`)

Timeouts: 0 en las 2 corridas. Columna "# timeout" leida antes que el score en
cada corrida, siguiendo el patron `informe-de-mutacion-con-timeouts-miente`:
0/0. Errors: 0 en las 2 corridas. No cov: 0 en las 2 corridas.

## Nota sobre el encargo recibido - correccion de premisa

El encargo indicaba que la ultima seccion de `progress/judge_pagina_tienda.md`
era la "Ronda 6 (2026-08-22, correccion del registro)", `APPROVED`. Al leer el
fichero completo (1204 lineas) antes de arrancar, esa no es la seccion final
real: el fichero contiene, despues de esa Ronda 6, una **Ronda 7** (linea 657,
verificacion independiente de cierre, `APPROVED`, con la tabla @s1-@s44
completa) y una **Ronda 8** (linea 931, "tras refuerzo de mutacion",
`APPROVED`), esta ultima siendo la seccion final real del fichero a dia de
hoy. La Ronda 8 revisa explicitamente el refuerzo de `tdd_craftsman`
(Rondas 6-7 de `progress/tdd_pagina_tienda.md`) que responde a la medicion
`FAIL` anterior de este mismo informe, y cierra diciendo textualmente: "Queda
pendiente `mutation_tester` (C7, umbral 1.0) sobre
`src/pages/PaginaTienda-logica.ts` y `src/App-logica.ts` - no marcar `done`
hasta que esa puerta tambien quede superada." No cambia el resultado de esta
verificacion (Ronda 6 y Ronda 8 son ambas `APPROVED`, la precondicion de
`judge` aprobado se cumple igual), pero se deja constatado porque el propio
proyecto tiene un historial de sesiones que se fian de una seccion que
parecia "la ultima" sin serlo (mismo patron ya documentado dentro de las
Rondas 5-8 de ese mismo fichero) - no repetirlo aqui.

## Contexto - por que esta es una "ronda 2" y no la primera medicion

La medicion anterior (conservada integra mas abajo, seccion "Historico -
medicion ronda 1 (FAIL)") midio **174/192 = 90.63%** bruto (174/190 = 91.58%
excluidos 2 equivalentes), con 13 mutantes reales agrupados en 5 causas raiz
(Grupos A-D en `PaginaTienda-logica.ts` + 1 grupo en `App-logica.ts`).
`progress/tdd_pagina_tienda.md` documenta el refuerzo en dos rondas:

- **Ronda 6** - 11 tests nuevos en `PaginaTienda-logica.test.ts` (Grupos A-D)
  mas extraccion de `derivarRutasDeSubpagina` en `App-logica.ts` con su propio
  test de caso positivo (grupo 5), sin cambio de comportamiento observable.
- **Ronda 7** - hallo y revirtio un resto de sabotaje de verificacion sin
  revertir en `src/pages/PaginaTienda-logica.ts:226` (`if (false)` en vez de
  `if (elementosFocusables.length === 0)`), dejado por la sesion de medicion
  anterior que "no devolvio un veredicto estructurado" segun su propio
  encargo. Confirmado en esta ronda que el fichero esta ya restaurado (ver
  verificacion de entorno).

`progress/judge_pagina_tienda.md` Ronda 8 reviso ese refuerzo con 4 sabotajes
manuales propios e independientes y aprobo sin cambios requeridos. Esta es la
re-medicion que esa Ronda 8 deja pendiente.

## Alcance - identificacion de ficheros

Mismos 2 ficheros que la ronda 1 (sin cambio de alcance):

- `src/pages/PaginaTienda-logica.ts` - objetivo principal, re-medido
  integro tras el refuerzo de las Rondas 6-7 de `tdd_craftsman`.
- `src/App-logica.ts` - modificado en la Ronda 6 (extraccion de
  `derivarRutasDeSubpagina`), re-medido tal como pide el propio informe de
  la ronda 1 (grupo 5).

Fuera de alcance, sin cambio: `src/data/tienda.ts` (dato puro, catalogo
literal + `CATEGORIAS_TIENDA`, sin logica de decision) y
`src/pages/PaginaTienda.tsx` (fuera de la superficie mutable declarada,
`stryker.config.json` solo muta `src/lib/**/*.ts` y `src/**/*-logica.ts`).

## Verificacion de entorno antes de cada corrida

- `Get-CimInstance Win32_Process` filtrando por linea de comandos que
  contiene "stryker" (excluyendo el propio comando de filtrado y su propio
  proceso bash envolvente): **0 procesos `stryker.js` reales** antes de
  lanzar la primera corrida. Confirmado leyendo la lista completa de
  procesos devueltos: los unicos con "stryker" en la linea de comandos eran
  el propio comando `Get-CimInstance ... -like "*stryker*"` y sus procesos
  bash/powershell envolventes, nunca un `stryker.js` vivo.
- Tras lanzar la primera corrida en segundo plano, verificacion explicita
  del arbol de procesos: **exactamente un** `stryker.js` (PID 57388) con
  **un unico** `child-process-proxy-worker.js` (coherente con
  `concurrency: 1`), sin ningun otro proceso `stryker.js` competidor.
- `--concurrency 1` ya fijado por defecto en `stryker.config.json`.
- Antes de arrancar, releido el propio codigo fuente de
  `elementoTrasAtraparFoco` (`PaginaTienda-logica.ts:221-239`) y de
  `App-logica.ts` completo: confirmado que la guarda de la linea 226 esta
  restaurada a `if (elementosFocusables.length === 0)` (no queda el resto de
  sabotaje `if (false)` que documenta la Ronda 7 de `tdd_craftsman`), y que
  `derivarRutasDeSubpagina` existe como funcion pura parametrizada. `grep`
  dirigido de `if (false)`/`if (true)` sobre todo `src/**/*.ts` y
  `src/**/*.tsx`: **0 coincidencias** - no queda ningun resto de sabotaje de
  verificacion sin revertir en el repositorio antes de medir.
- Ningun fichero de `src/` ni de test fue editado por mi durante esta
  medicion (Stryker muta sobre una copia interna, no sobre el fichero
  original): `git status --porcelain` sobre los 2 ficheros mutados, tras
  ambas corridas, solo refleja el estado ya existente antes de empezar (el
  diff de `App-logica.ts` es el de la extraccion de `derivarRutasDeSubpagina`
  de la Ronda 6 de `tdd_craftsman`, no algo introducido por esta medicion).

## Como se corrio (2 corridas independientes, secuenciales, nunca en paralelo)

Mismo workaround ya validado en rondas anteriores de este proyecto
(`node .harness/harness.mjs mutate <target>` falla con "Cannot find
TestRunner plugin vitest"):

```
pnpm exec stryker run --mutate src/pages/PaginaTienda-logica.ts --plugins @stryker-mutator/vitest-runner
pnpm exec stryker run --mutate src/App-logica.ts --plugins @stryker-mutator/vitest-runner
```

Duracion: `PaginaTienda-logica.ts` 14 min 15 s (180 mutantes, ~1.42 tests por
mutante de media - bastante mas rapido que la ronda 1, 29 min 17 s, con menos
contencion de CPU esta vez); `App-logica.ts` 1 min 11 s (13 mutantes, ~7.92
tests por mutante de media, +1 mutante respecto a la ronda 1 por la extraccion
de `derivarRutasDeSubpagina`).

## Resultado por fichero

| Fichero | total | killed | survived | # timeout | # no cov | # errors | score |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `src/pages/PaginaTienda-logica.ts` | 180 | 178 | 2 | 0 | 0 | 0 | 98.89% |
| `src/App-logica.ts` | 13 | 13 | 0 | 0 | 0 | 0 | 100.00% |
| Total (bruto) | 193 | 191 | 2 | 0 | 0 | 0 | 98.96% |
| Total (excluidos 2 equivalentes) | 191 | 191 | 0 | - | - | - | 100.00% |

---

## `src/pages/PaginaTienda-logica.ts` - 178/180 = 98.89% bruto, 178/178 = 100.00% excluidos los 2 equivalentes

Los 13 mutantes reales de la ronda 1 (Grupos A, B, C y D) pasan todos a
**Killed** en esta corrida - confirmado directamente en la salida clear-text
de Stryker (ninguno de ellos aparece en `[Survived]`; solo aparecen los 2 ya
conocidos, ver abajo). Verificacion cruzada, test por test, contra los
nombres de test citados por el informe de la ronda 1:

- **Grupo A** (3 mutantes, fabricas de `Error` vacias) - killed: los 3 nuevos
  `it` "lo lanzado es una instancia real de Error con el mensaje exacto, no
  un valor vacio" (dentro de `@s16`, `@s17` y `@s35`) aparecen como `killed`
  en la salida.
- **Grupo B** (1 mutante, frontera `importeCentimos === 0`) - killed: `@s17
  refuerzo: un importe de exactamente 0 centimos es valido ...
  construirCatalogoTienda no lanza y conserva el producto con
  importeCentimos: 0 (killed 5)`.
- **Grupo C** (2 mutantes, `quitarUnidad` sin identificador inexistente) -
  killed: `@s25/@s26 ... con un identificador que no existe en el estado,
  lo devuelve sin cambios (ni lanza, ni muta nada) (killed 2)`.
- **Grupo D** (7 mutantes, `fijarCantidad` sin cantidad positiva) - killed:
  los 2 nuevos `it` de `@s34 refuerzo` ("actualiza su cantidad exacta y deja
  las demas intactas" / "crea una linea nueva con esa cantidad exacta")
  aparecen `killed 3` y `killed 5` respectivamente.

### Los 2 supervivientes de esta corrida son los mismos 2 equivalentes ya excluidos en la ronda 1 - re-verificados sin cambios

```
[Survived] ConditionalExpression
src/pages/PaginaTienda-logica.ts:226:7
-     if (elementosFocusables.length === 0) {
+     if (false) {

[Survived] BlockStatement
src/pages/PaginaTienda-logica.ts:226:41
-     if (elementosFocusables.length === 0) {
-       return null
-     }
+     if (elementosFocusables.length === 0) {}
```

Mismos ids de mutador (`ConditionalExpression`/`BlockStatement`), misma
linea exacta (226), mismo codigo fuente (`elementoTrasAtraparFoco`,
`PaginaTienda-logica.ts:221-239`, releido integro antes de esta corrida y
confirmado byte a byte igual al citado en el historico de mas abajo - no
sobrevivio ningun resto del sabotaje de verificacion que documenta la Ronda 7
de `tdd_craftsman`, ese resto ya estaba revertido antes de correr Stryker).

La justificacion de equivalencia ya escrita y verificada en la ronda 1
(demostracion analitica exhaustiva de las 4 combinaciones de
`retroceder x elementoActivo` apoyada en que `elementosFocusables = []`
implica `primero = ultimo = null` y `elementoActivoDentroDelDialogo = false`
siempre, por lo que las 3 ramas de la funcion devuelven `null` con o sin la
guarda) se mantiene sin cambios: no hay codigo ni tipo nuevo que reabra el
analisis, la funcion no se toco en las Rondas 6-7. No se abusa de la via de
exclusion: son los mismos 2 mutantes ya justificados con prueba matematica
exhaustiva del dominio completo (no solo de casos de ejemplo), no 2 mutantes
nuevos ni una excusa retorica.

---

## `src/App-logica.ts` - 13/13 = 100.00%

Los 3 mutantes de la ronda 1 (`ArrowFunction`/`ConditionalExpression` sobre
el `.filter().map()` que entonces derivaba `RUTAS_DE_SUBPAGINA` directamente
sobre `ENLACES_NAVEGACION`) ya no existen como tales: la Ronda 6 de
`tdd_craftsman` extrajo esa logica a `derivarRutasDeSubpagina(enlaces,
rutasYaConPaginaPropia)`, una funcion pura parametrizada, y le anadio un test
con datos sinteticos que si incluye un destino de ruta real sin pagina propia
todavia - el caso positivo que la ronda 1 senalo como el punto ciego
estructural (contingente de los datos de hoy, no un mutante equivalente
genuino).

El fichero pasa de 12 a 13 mutantes (la extraccion introduce una funcion
nueva con su propio cuerpo mutable) y los 13 quedan **Killed**:

- `RUTAS_DE_SUBPAGINA deriva exactamente los destinos no-ancla de
  ENLACES_NAVEGACION que aun no tienen pagina propia es exactamente []
  (array vacio) ... (killed 10)` - cubre el caso contingente de hoy (los 10
  mutantes que ya mataba el test original de la ronda 1).
- `derivarRutasDeSubpagina (funcion pura parametrizada, caso positivo con
  datos sinteticos) incluye un destino de ruta real que todavia no tiene
  pagina propia, y excluye anclas y rutas ya cubiertas (killed 3)` - el test
  nuevo, que mata los 3 mutantes exactos que sobrevivian en la ronda 1
  (`() => undefined` en el `.filter`, `() => false` en el predicado, `() =>
  undefined` en el `.map`), ahora demostrado con datos donde el resultado
  correcto NO es `[]`.

Ya no queda ningun mutante contingente-de-los-datos-actuales sin cubrir: el
punto ciego que motivo la ronda 1 a NO excluir estos 3 mutantes como
equivalentes esta cerrado por el propio diseno del test, no por casualidad de
los datos de hoy.

---

## Conclusion

**PASS.** Score bruto de esta ronda: 191/193 = 98.96%; excluidos los 2
mutantes equivalentes genuinos (ya documentados en la ronda 1, re-verificados
sin cambios en esta - misma linea, mismo codigo, misma demostracion analitica
exhaustiva), **191/191 = 100.00%**, igual al umbral de `harness.config.json`
-> `mutation.threshold` (1.0 / 100%). 0 timeouts, 0 errores y 0 "no coverage"
en las 2 corridas, asi que el resultado es de fiar tal cual (no hace falta
repetir a `--concurrency 1` explicito, ya lo es por defecto). Los 13 mutantes
reales que documento la ronda 1 (Grupos A-D en `PaginaTienda-logica.ts` +
grupo de `App-logica.ts`) estan confirmados `Killed` por esta medicion
independiente, no solo por la bitacora de `tdd_craftsman`. El resto de
sabotaje de verificacion sin revertir que dejo una sesion de medicion
anterior (`PaginaTienda-logica.ts:226`, documentado en `progress/tdd_pagina_tienda.md`
Ronda 7) ya estaba restaurado antes de arrancar esta medicion - confirmado
con lectura directa y `grep` dirigido, no solo asumido.

No he tocado ningun fichero de `src/` ni de test durante esta medicion
(regla dura de este rol: mide, no talla). No hubo ninguna otra corrida de
Stryker en marcha en ningun momento (verificado antes y durante ambas
corridas).

### Para `craftsman_lead`

`pagina_tienda` (id 18) tiene ahora `judge` `APPROVED` (ultima seccion real
del fichero: Ronda 8, que reviso especificamente este refuerzo - ver nota
sobre la premisa del encargo, arriba) y mutacion por encima del umbral (100%
excluidos los 2 equivalentes justificados, C7 satisfecho). No quedan puertas
tecnicas pendientes de este ciclo. Recordatorios heredados de rondas
anteriores del `judge` (hallazgos no bloqueantes, sin relacion con
mutacion), pendientes de reconciliar al cierre:

1. Sincronizar `features/ensamblaje_landing.feature` @s12 (lineas ~223-227):
   ya no es cierto que "/tienda" carezca de pagina propia - mismo patron ya
   resuelto al cerrar `pagina_campanas`/`pagina_blog`.
2. Actualizar el comentario (no la asercion) de `src/App.test.tsx` linea
   ~172 para reflejar que `RUTAS_DE_SUBPAGINA` es ahora un array vacio.
3. Reconciliar `progress/current.md` con el estado real en disco de esta
   feature (multiples rondas `APPROVED` en `progress/judge_pagina_tienda.md`
   - incluida la Ronda 8 final - que sus ultimas entradas todavia podrian no
   reflejar).

---

## Historico - medicion ronda 1 (FAIL), conservada para trazabilidad

**Veredicto:** FAIL

**Score (bruto, 2 ficheros):** 174/192 = 90.63%
**Score (excluidos los 2 mutantes equivalentes genuinos de `PaginaTienda-logica.ts:226`):** 174/190 = 91.58%
(umbral: 1.0 / 100%, harness.config.json -> mutation.threshold; stryker.config.json -> thresholds.break = 100)

Timeouts: 0 en las 2 corridas. Columna "# timeout" leida antes que el
score en cada corrida, siguiendo el patron
informe-de-mutacion-con-timeouts-miente: 0/0. Errors: 0 en las 2 corridas.
No cov: 7 (todos en PaginaTienda-logica.ts, ver detalle abajo).

Muy por debajo del umbral en ambos ficheros. No es sorprendente: es la
feature con mas logica de negocio del proyecto hasta ahora (aritmetica de
dinero, guardas de cantidad, reducer de cesta con 6 operaciones) y el router
quedo en un estado de derivacion vacia tras esta feature.

## Alcance - identificacion de ficheros

Leido progress/tdd_pagina_tienda.md completo (5 rondas) y
progress/judge_pagina_tienda.md completo (7 rondas, ultima: APPROVED,
Ronda 7). Ficheros *-logica.ts nuevos o modificados por esta feature:

- src/pages/PaginaTienda-logica.ts -- nuevo, objetivo principal de la
  feature (construirCatalogoTienda, formatearImporte,
  filtrarProductosPorCategoria, reducer de cesta completo,
  calcularResumenCesta, elementoTrasAtraparFoco, etc.). Dentro del glob
  mutable de stryker.config.json (src/**/*-logica.ts).
- src/App-logica.ts -- modificado por esta feature: /tienda se anade
  a RUTAS_YA_CON_PAGINA_PROPIA (confirmado leyendo el fichero: linea 14),
  lo que deja RUTAS_DE_SUBPAGINA en un array vacio (consecuencia esperada
  y documentada por tdd_craftsman: ya no queda ninguna subpagina de
  navegacion.ts sin su propia Route). Re-medido tal como pide el encargo.

Fuera de alcance, por construccion: src/data/tienda.ts (dato puro, sin
logica de decision -- confirmado leyendo el fichero, catalogo literal +
CATEGORIAS_TIENDA), src/pages/PaginaTienda.tsx (fuera de la superficie
mutable declarada: stryker.config.json solo muta src/lib/**/*.ts y
src/**/*-logica.ts, nunca .tsx, por el issue conocido
stryker-mutator/stryker-js#4375 documentado en el propio comentario del
fichero de config).

## Verificacion de entorno antes de cada corrida

- Get-CimInstance Win32_Process filtrando por linea de comandos que
  contenga "stryker.js" (proceso real de Stryker, no el propio comando de
  filtrado): 0 procesos antes de lanzar la corrida de
  PaginaTienda-logica.ts y de nuevo 0 procesos reales antes de lanzar
  la de App-logica.ts (los PID que aparecieron en el filtro eran siempre
  el propio powershell/bash ejecutando el filtro, nunca un
  stryker.js vivo). Nunca hubo dos corridas de Stryker vivas a la vez.
- --concurrency 1 ya fijado por defecto en stryker.config.json
  (el propio comentario _comment_concurrency del fichero cita
  explicitamente el patron informe-de-mutacion-con-timeouts-miente: un
  timeout cuenta como "matado", asi que una corrida con la CPU saturada
  infla la puntuacion). No hizo falta forzarlo aparte porque ya es la
  config por defecto del proyecto.
- Maquina con alta contencion de CPU durante esta medicion (11+ procesos
  claude.exe concurrentes, mismo patron que documentan
  progress/judge_pagina_tienda.md Rondas 5-6 y progress/current.md):
  la corrida de PaginaTienda-logica.ts tardo 29 min 17 s (180
  mutantes) -- muy por encima de los ~5 min de features comparables
  (pagina_blog, 104 mutantes en 5 min 14 s), consistente con saturacion,
  no con un problema del propio mutador. Verificado que esto NO infla
  el score: la columna "# timeout" de ambas corridas es 0, asi que el
  resultado es de fiar tal cual, sin necesidad de repetir a
  --concurrency 1 explicito (ya lo es).
- Ningun fichero de src/ ni de test quedo editado al terminar esta
  medicion: cada sabotaje manual de verificacion (ver detalle de cada
  superviviente abajo) se revirtio inmediatamente y se comprobo con diff
  contra una copia de seguridad tomada antes de sabotear -- diff sin
  salida en todos los casos.

## Como se corrio (2 corridas independientes, secuenciales, nunca en paralelo)

bin/harness mutate src/pages/PaginaTienda-logica.ts se probo primero, tal
como pide el protocolo -- falla en esta maquina con el mismo problema ya
documentado en sesiones anteriores del proyecto (tokens_marca,
pagina_blog): "Cannot find TestRunner plugin vitest" (Stryker no
resuelve @stryker-mutator/vitest-runner via el glob de plugins por
defecto). Workaround ya validado en este repo, una corrida a la vez:

```
pnpm exec stryker run --mutate src/pages/PaginaTienda-logica.ts --plugins @stryker-mutator/vitest-runner
pnpm exec stryker run --mutate src/App-logica.ts --plugins @stryker-mutator/vitest-runner
```

Duracion: PaginaTienda-logica.ts 29 min 17 s (180 mutantes, 2.25 tests
por mutante de media); App-logica.ts 6 min 32 s (12 mutantes, 44.50 tests
por mutante de media).

## Resultado por fichero

| Fichero | total | killed | survived | # timeout | # no cov | # errors | score |
| --- | --- | --- | --- | --- | --- | --- | --- |
| src/pages/PaginaTienda-logica.ts | 180 | 165 | 8 | 0 | 7 | 0 | 91.67% |
| src/App-logica.ts | 12 | 9 | 3 | 0 | 0 | 0 | 75.00% |
| Total (bruto) | 192 | 174 | 11 | 0 | 7 | 0 | 90.63% |
| Total (excluidos 2 equivalentes genuinos) | 190 | 174 | 9 | - | - | - | 91.58% |

---

## src/pages/PaginaTienda-logica.ts -- 165/180 = 91.67% (15 no-killed: 8 survived + 7 no-cov)

Los 15 mutantes no-killed se agrupan en 5 causas raiz (no son 15
hallazgos sueltos). Cada uno de los 4 grupos "reales" se verifico
EMPIRICAMENTE, reproduciendo el mutante a mano (sabotaje manual,
mismo patron que usa este proyecto en judge/tdd_craftsman), corriendo
la suite, y revirtiendo con diff limpio contra una copia de seguridad --
no me quede solo con la lectura del reporte de Stryker.

### Grupo A (3 supervivientes) -- las 3 funciones fabrica de Error devuelven undefined al vaciar su cuerpo, y ningun test lo distingue de un Error real

- src/pages/PaginaTienda-logica.ts:9 errorCategoriaNoPublicada -- [Survived] BlockStatement:
  ```
  -   return new Error(`El producto "${nombre}" declara la categoria no publicada "${categoria}"`)
  +   (cuerpo vacio, la funcion devuelve undefined)
  ```
  Verificado en vivo: con el sabotaje aplicado, `throw errorCategoriaNoPublicada(...)` lanza literalmente
  undefined en vez de un Error. `pnpm exec vitest run src/pages/PaginaTienda-logica.test.ts -t "@s16"`
  sigue dando 1/1 verde con el sabotaje activo. Revertido, diff identico.
  Falta: el test de @s16 (PaginaTienda-logica.test.ts:26) usa
  `expect(() => construirCatalogoTienda(catalogoCorrupto)).toThrowError(/categoria no publicada/)`.
  Con un valor lanzado que no es una instancia de Error (undefined), este matcher no distingue el caso
  del correcto -- pasa igual. Falta una asercion que compruebe explicitamente que lo lanzado es una
  instancia real de Error (p. ej. `expect(() => fn()).toThrow(Error)` ademas de la comprobacion de
  mensaje, o capturar el valor con try/catch y afirmar `error instanceof Error`).

- src/pages/PaginaTienda-logica.ts:19 errorImporteInvalido -- mismo patron exacto, [Survived] BlockStatement.
  Verificado en vivo: con el sabotaje, `pnpm exec vitest run src/pages/PaginaTienda-logica.test.ts -t "@s17"`
  da 2/2 verde (ambos casos, importe negativo y no entero). Revertido, diff identico.
  Falta: mismo tipo de asercion que el Grupo A anterior, aplicada a los 2 tests de @s17
  (PaginaTienda-logica.test.ts:35,44).

- src/pages/PaginaTienda-logica.ts:116 errorCantidadInvalida -- mismo patron exacto, [Survived] BlockStatement.
  Verificado en vivo: con el sabotaje, `pnpm exec vitest run src/pages/PaginaTienda-logica.test.ts -t "@s35|@s36"`
  da 5/5 verde. Revertido, diff identico.
  Falta: mismo tipo de asercion, aplicada a @s35 (linea 148) y a los 3 casos it.each de @s36
  (linea 161).

### Grupo B (1 superviviente) -- frontera importeCentimos === 0 nunca probada como valida

- src/pages/PaginaTienda-logica.ts:25 comprobarImporteValido -- [Survived] EqualityOperator:
  ```
  -   if (!Number.isInteger(producto.importeCentimos) || producto.importeCentimos < 0) {
  +   if (!Number.isInteger(producto.importeCentimos) || producto.importeCentimos <= 0) {
  ```
  Verificado en vivo: con el sabotaje activo (rechaza tambien 0 como importe invalido),
  `pnpm exec vitest run src/pages/PaginaTienda-logica.test.ts src/pages/PaginaTienda.test.tsx` sigue dando
  86/86 verde. Revertido, diff identico.
  Falta: ningun producto del catalogo de demostracion usado en los tests tiene
  `importeCentimos: 0`, y ningun test de construirCatalogoTienda verifica explicitamente que un importe
  de exactamente 0 centimos es VALIDO (el contrato, segun el comentario de la linea 23, es "mayor o
  igual que cero"). Falta un caso it con `importeCentimos: 0` que espere que
  construirCatalogoTienda NO lance.

### Grupo C (2 mutantes: 1 survived + 1 no-cov) -- quitarUnidad nunca se llama con un identificador que no existe en la cesta

- src/pages/PaginaTienda-logica.ts:107:7 quitarUnidad -- [Survived] ConditionalExpression:
  `if (existente === undefined) { -> if (false) {`.
- src/pages/PaginaTienda-logica.ts:107:32 quitarUnidad -- [NoCoverage] BlockStatement:
  el bloque `{ return estado }` (la rama que protege contra un identificador inexistente) tiene
  0 tests que lo ejecuten.

  Verificado en vivo (mutante [Survived]): con `if (false)` sustituyendo la guarda,
  `pnpm exec vitest run src/pages/PaginaTienda-logica.test.ts src/pages/PaginaTienda.test.tsx` sigue dando
  86/86 verde. Revertido, diff identico. Esto confirma tambien por que el segundo mutante
  ([NoCoverage]) es coherente: si ningun test distingue `if (false)` de la guarda real, es porque ningun
  test ejecuta jamas la rama `existente === undefined` con un valor real undefined -- el bloque que
  protege ese caso literalmente nunca corre.

  Falta: un test que llame `quitarUnidad(estado, 'un-identificador-que-no-esta-en-estado')` y
  compruebe que devuelve el estado sin cambios (ni lanza, ni muta nada) -- el mismo tipo de guarda de
  "identificador inexistente se ignora sin reventar" que si esta probado para calcularResumenCesta
  (@s37) pero nunca para quitarUnidad.

### Grupo D (7 mutantes: 1 survived + 6 no-cov) -- fijarCantidad nunca se llama con una cantidad positiva

fijarCantidad solo tiene tests directos para: cantidad 0 (@s34, elimina la linea) y cantidades
invalidas que lanzan antes de llegar aqui (@s35/@s36: negativa/fraccionaria/no numerica). NINGUN test
llama fijarCantidad con una cantidad entera positiva -- ni sobre una linea ya existente (deberia
actualizar la cantidad) ni sobre un identificador nuevo (deberia crear la linea). Confirmado leyendo
PaginaTienda-logica.test.ts completo: fijarCantidad solo aparece en los describe de @s34, @s35 y
@s36.

- src/pages/PaginaTienda-logica.ts:130:7 fijarCantidad -- [Survived] ConditionalExpression:
  `if (cantidad === 0) { -> if (true) {`.
  Verificado en vivo: con `if (true)` (cualquier cantidad, incluida una positiva, entra por la rama de
  "eliminar linea"), `pnpm exec vitest run src/pages/PaginaTienda-logica.test.ts src/pages/PaginaTienda.test.tsx`
  sigue dando 86/86 verde -- confirma que ningun test pasa nunca una cantidad positiva a fijarCantidad.
  Revertido, diff identico.
- src/pages/PaginaTienda-logica.ts:133:7 -- 3 mutantes [NoCoverage] (ConditionalExpression -> true,
  ConditionalExpression -> false, EqualityOperator === -> !==) sobre
  `if (buscarLinea(estado, identificador) === undefined) {`.
- src/pages/PaginaTienda-logica.ts:133:57 -- [NoCoverage] BlockStatement: el bloque
  `{ return [...estado, { identificador, cantidad }] }` (crear linea nueva).
- src/pages/PaginaTienda-logica.ts:134:12 -- [NoCoverage] ArrayDeclaration:
  `return [...estado, {...}] -> return []`.
- src/pages/PaginaTienda-logica.ts:134:24 -- [NoCoverage] ObjectLiteral:
  `{ identificador, cantidad } -> {}`.

  Falta: 2 tests nuevos dentro de (o junto a) @s34: (1) fijarCantidad con una cantidad positiva
  sobre un identificador que YA TIENE linea en el estado (debe actualizar su cantidad exacta, dejando
  las demas lineas intactas -- mata el mutante de linea 130 y confirma la rama else de
  conCantidadFijada); (2) fijarCantidad con una cantidad positiva sobre un identificador SIN LINEA
  todavia (debe crear una linea nueva con esa cantidad exacta -- mata los 6 mutantes de lineas 133-134
  de un solo golpe, al ejecutar por fin ese bloque).

### Los 2 mutantes restantes -- equivalentes genuinos, verificados por partida doble (no excluidos a la ligera)

- src/pages/PaginaTienda-logica.ts:226:7 elementoTrasAtraparFoco -- [Survived] ConditionalExpression:
  `if (elementosFocusables.length === 0) { -> if (false) {`.
- src/pages/PaginaTienda-logica.ts:226:41 -- [Survived] BlockStatement: el bloque `{ return null }` vacio.

  Demostracion analitica exhaustiva (los 3 parametros de la funcion son: el array -- cuyo unico caso
  relevante aqui es vacio --, elementoActivo: Element | null, y retroceder: boolean, dominio finito de 2
  valores x "null o no-null"): con elementosFocusables = [], `primero = arr[0] ?? null = null` y
  `ultimo = arr[length-1] ?? null = null` (el `?? null` que ya usa el codigo para satisfacer
  noUncheckedIndexedAccess, documentado en progress/tdd_pagina_tienda.md Ronda 2). elementoActivoDentroDelDialogo
  es siempre false (`[].includes(cualquierCosa)` es siempre false). Recorriendo las 4 combinaciones de
  retroceder x elementoActivo (null / no-null):
  - retroceder=true: la condicion `retroceder && (elementoActivo === primero || !elementoActivoDentroDelDialogo)`
    es `true && (... || true)` = true siempre (el segundo operando del || es constante true porque
    elementoActivoDentroDelDialogo es siempre false) -> devuelve ultimo = null, sin importar el resto.
  - retroceder=false, elementoActivo=null: la segunda condicion `!retroceder && elementoActivo === ultimo`
    es `true && (null === null)` = true -> devuelve primero = null.
  - retroceder=false, elementoActivo no nulo: ninguna condicion se cumple -> cae al `return null` final.

  En los 4 casos el resultado observable es null, EXACTAMENTE IGUAL que la guarda temprana que el
  mutante elimina. Verificado tambien EMPIRICAMENTE: sustituida la guarda por `if (false) { return null }`
  (ambos mutantes a la vez), `pnpm exec vitest run src/pages/PaginaTienda-logica.test.ts src/pages/PaginaTienda.test.tsx`
  sigue dando 86/86 verde -- coincide con la demostracion analitica. Revertido, diff identico.

  Esta guarda es redundante POR CONSTRUCCION, no por casualidad de datos: los operadores `?? null` en
  las lineas 229-230 y la propiedad matematica de `[].includes(x) === false` para cualquier x garantizan
  el mismo resultado con o sin la guarda, para cualquier valor futuro de elementoActivo/retroceder -- a
  diferencia de los 3 supervivientes de App-logica.ts (ver abajo), que dependen del contenido actual de
  un catalogo de datos que puede cambiar. Se excluyen del score estos 2 mutantes con esta justificacion
  explicita, sin abusar de la via (son los unicos 2 de los 15 con esta propiedad).

---

## src/App-logica.ts -- 9/12 = 75.00%

Peor que la medicion de la ronda anterior de pagina_blog (11/11 = 100%
sobre el mismo fichero) por una razon estructural nueva: con /tienda
anadida a RUTAS_YA_CON_PAGINA_PROPIA, las 3 rutas reales de
ENLACES_NAVEGACION (/campanas, /blog, /tienda) ya estan las tres
cubiertas, y las 5 restantes son anclas (#reservar, #servicios,
#equipo, #contacto, #faq) -- confirmado leyendo src/data/navegacion.ts
completo (8 entradas exactas). El resultado es que RUTAS_DE_SUBPAGINA es
ahora [] PARA CUALQUIER ELEMENTO de ENLACES_NAVEGACION tal como existe
hoy, asi que la logica de filtrado y mapeo interna nunca produce una
diferencia observable.

### Los 3 supervivientes

```
[Survived] ArrowFunction
src/App-logica.ts:32:3
-     (enlace) => !esAncla(enlace.destino) && !RUTAS_YA_CON_PAGINA_PROPIA.has(enlace.destino),
+     () => undefined,

[Survived] ConditionalExpression
src/App-logica.ts:32:15
-     (enlace) => !esAncla(enlace.destino) && !RUTAS_YA_CON_PAGINA_PROPIA.has(enlace.destino),
+     (enlace) => false,

[Survived] ArrowFunction
src/App-logica.ts:33:7
-   ).map((enlace) => enlace.destino)
+   ).map(() => undefined)
```

Los 3 mutan el cuerpo del .filter(...).map(...) que deriva
RUTAS_DE_SUBPAGINA. Para cada uno de los 8 elementos de
ENLACES_NAVEGACION, el predicado original ya evalua a false hoy (los 5
anclas por `!esAncla(...) === false`, cortocircuitando el &&; los 3
destinos reales por `!RUTAS_YA_CON_PAGINA_PROPIA.has(...) === false`), asi
que sustituir el predicado entero por false o por undefined (falsy) no
cambia el resultado del .filter() para ningun elemento real existente hoy.
El .map() nunca llega a ejecutar su callback porque el array que recibe
ya esta vacio tras el .filter().

Verificado que el unico test directo de este simbolo
(App-logica.test.ts, "RUTAS_DE_SUBPAGINA deriva exactamente los destinos
no-ancla...") compara contra el literal []. No contra un caso positivo
donde el filtro/mapeo tenga algo real que derivar. Es exactamente el patron
doble-de-test-anclado-al-literal-no-al-simbolo, pero en su variante
"literal vacio": el test ancla un resultado vacio, nunca demuestra que la
logica de derivacion en si sigue funcionando.

### Por que NO se excluyen como equivalentes (a diferencia de los 2 de PaginaTienda-logica.ts:226)

Esta equivalencia es CONTINGENTE DE LOS DATOS ACTUALES
(ENLACES_NAVEGACION + RUTAS_YA_CON_PAGINA_PROPIA), no una garantia
estructural del codigo. Si en el futuro se anade una nueva entrada a
ENLACES_NAVEGACION con un destino de ruta real que todavia no tenga su
Route propia (el caso que esta misma constante existe para detectar), los
3 mutantes SI producirian una diferencia observable -- y ahora mismo NO HAY
NINGUN TEST que lo demuestre, porque no existe ningun dato de prueba con
esa forma. Es el patron de riesgo "mutante inmortal / frontera nunca
probada exacta" que el propio proyecto ya identifico como sistemico
(progress/current.md, revision adversarial del 18/08, cluster 3) -- dejar
esto sin test es un punto ciego real: si alguien rompe la derivacion de
RUTAS_DE_SUBPAGINA el mismo dia que anade una subpagina nueva sin su
propia Route todavia, nada lo detectaria hasta que ensamblaje_landing
(ya done) tuviera que revisarse a mano.

Falta: dado que RUTAS_DE_SUBPAGINA es una constante exportada
calculada directamente sobre el ENLACES_NAVEGACION real (sin parametros),
no hay forma de probar el caso positivo sin que tdd_craftsman extraiga la
derivacion a una funcion pura parametrizada (mismo patron ya establecido en
este proyecto, logica-de-decision-en-modulo-puro-no-en-el-jsx -- p. ej.
derivarRutasDeSubpagina(enlaces, rutasYaConPaginaPropia)), de forma que un
test unitario pueda pasarle un catalogo sintetico con una entrada de ruta
real sin cubrir y comprobar que SI aparece en el resultado. Es una decision
de diseno de test, no algo que yo deba tallar (regla dura de este rol: mido,
no edito src/).

---

## Conclusion

FAIL. Score bruto: 174/192 = 90.63%; excluidos los 2 equivalentes
genuinos de PaginaTienda-logica.ts:226 (justificados arriba con prueba
analitica exhaustiva + verificacion empirica), 174/190 = 91.58%. Ambos muy
por debajo del umbral de harness.config.json -> mutation.threshold
(1.0 / 100%). 0 timeouts en las 2 corridas, asi que el resultado es de
fiar tal cual -- no hace falta repetir ninguna corrida a --concurrency 1
explicito (ya es la configuracion por defecto de este proyecto).

No he tocado ningun fichero de src/ ni de test para producir este
informe: cada uno de los sabotajes de verificacion descritos arriba se
revirtio inmediatamente, confirmado con diff limpio contra una copia de
seguridad tomada antes de sabotear.

### Para tdd_craftsman

13 mutantes reales por matar (11 en PaginaTienda-logica.ts agrupados en
4 causas raiz + 3 en App-logica.ts en 1 causa raiz), mas una decision de
diseno de test para el grupo de App-logica.ts (extraer funcion pura
parametrizada o aceptar el punto ciego documentandolo de otra forma -- no es
una via de "excluir como equivalente", ver justificacion arriba):

1. Grupo A (3 mutantes) -- errorCategoriaNoPublicada/errorImporteInvalido/errorCantidadInvalida:
   reforzar @s16/@s17/@s35/@s36 para que la asercion distinga un Error real de un valor lanzado
   que no lo es (no basta toThrowError(regex) solo).
2. Grupo B (1 mutante) -- comprobarImporteValido: test con importeCentimos: 0 esperando construccion
   valida.
3. Grupo C (2 mutantes) -- quitarUnidad: test con un identificador inexistente, esperando estado
   sin cambios.
4. Grupo D (7 mutantes) -- fijarCantidad: 2 tests con cantidad positiva (sobre linea existente y
   sobre linea nueva).
5. App-logica.ts (3 mutantes) -- decision de diseno: extraer la derivacion de RUTAS_DE_SUBPAGINA a
   una funcion pura parametrizada y testear el caso positivo con datos sinteticos, o escalar la decision a
   craftsman_lead si se prefiere otra via.

Tras el refuerzo, vuelve a pasar por judge y de nuevo por
mutation_tester -- no marcar done en feature_list.json hasta que ambas
puertas queden superadas.
