# Mutación — feature `cabecera_y_navegacion` (id 3) — ronda 2 de mutación (tras Ciclo 17 y `judge` ronda 3, `APPROVED`)

**Contexto:** la ronda 1 de mutación (conservada íntegra más abajo como
historial) dio `FAIL` (14/16 = 87.50% sobre mutantes no equivalentes), con 2
huecos reales de aserción en `esAncla` (`src/components/Cabecera-logica.ts:33-34`).
`tdd_craftsman` los cerró en el Ciclo 17 (`progress/tdd_cabecera_y_navegacion.md`,
sección "Ronda 3") con dos tests unitarios directos sobre `esAncla` en
`src/components/Cabecera-logica.test.ts`, sin tocar producción. `judge` revisó
ese cambio, lo aprobó (`progress/judge_cabecera_y_navegacion.md`, ronda 3,
veredicto `APPROVED`, sin cambios requeridos) y delegó C7 a esta re-medición
oficial. Esta es esa re-medición, independiente, corrida desde cero.

**Veredicto:** **PASS**

**Score bruto (killed/total):** 16/17 = 94.12%
**Score sobre mutantes no equivalentes:** 16/16 = **100.00%** (umbral:
`harness.config.json` → `mutation.threshold` = `1.0` / `stryker.config.json`
→ `thresholds.break` = 100)
**Timeouts:** 0 (columna `# timeout` leída antes que el score, patrón
`informe-de-mutacion-con-timeouts-miente`; una sola corrida bastó porque salió
0 a la primera).

## Alcance

Sin cambios respecto a la ronda 1: el único fichero mordible de esta feature
sigue siendo `src/components/Cabecera-logica.ts` (coincide con el patrón
`src/**/*-logica.ts` de `stryker.config.json` → `mutate`; `Cabecera.tsx` es
`.tsx` y `src/data/navegacion.ts` es catálogo de datos sin lógica, ambos fuera
de alcance por diseño documentado del proyecto — ver
`progress/mutation_cabecera_y_navegacion.md` ronda 1 más abajo y
`progress/judge_cabecera_y_navegacion.md` checkpoint C3). Confirmado antes de
correr: los únicos ficheros nuevos/tocados desde la ronda 1 son
`src/components/Cabecera-logica.test.ts` (los 2 tests del Ciclo 17); ni
`Cabecera-logica.ts` ni `Cabecera.tsx` ni `navegacion.ts` cambiaron (releídos
íntegros y comparados contra las citas de línea de la ronda 1 antes de
lanzar Stryker — coinciden byte a byte).

## Cómo se corrió (ficha de reproducción)

Sanidad previa: `pnpm exec vitest run` (suite completa) → **84/84 verdes**
antes de tocar Stryker, mismo conteo que documentó `judge` en la ronda 3.

Workaround ya validado (`progress/mutation_tokens_marca.md`,
`progress/mutation_datos_negocio.md`, ronda 1 de esta misma feature): `node
.harness/harness.mjs mutate <target>` no se reintentó por separado en esta
ronda (síntoma ya documentado tres veces en el proyecto — "Cannot find
TestRunner plugin vitest"); se fue directo al comando que sí funciona:

```
pnpm exec stryker run --mutate src/components/Cabecera-logica.ts --plugins @stryker-mutator/vitest-runner
```

Un único fichero mordible → una única corrida. Verificación de que no había
otra corrida de Stryker en marcha: nota de entorno para esta sesión —
`tasklist` (vía la herramienta Bash) listaba 12 procesos `node.exe` sin
información de línea de comandos, mientras que `Get-CimInstance Win32_Process`
(vía la herramienta PowerShell) veía 0 procesos `node`/`stryker` en total
sobre 475 procesos — las dos herramientas de esta sesión no comparten la
misma vista de procesos. Se resolvió la discrepancia con `ps -W` (Git Bash,
lista completa con ruta de ejecutable, no solo el nombre truncado a 25
caracteres que usa `tasklist`): **0 coincidencias** para `node|stryker` antes
Y después de la corrida. `concurrency: 1` ya fijado en `stryker.config.json`.
Columna `# timeout` leída ANTES que el score: **0**. El informe es válido, no
hizo falta repetir la corrida.

`reports/mutation/mutation.json` y `reports/mutation/index.html`
regenerados correctamente. Leído `mutation.json` directamente (no solo el
resumen `clear-text`) para extraer `mutatorName`, `line`, `status`,
`testsCompleted`, `coveredBy`/`killedBy` de los 17 mutantes.

## Resultado

| Fichero | total | killed | survived | # timeout | # errors | score |
| --- | --- | --- | --- | --- | --- | --- |
| `src/components/Cabecera-logica.ts` | 17 | 16 | 1 | 0 | 0 | 94.12% |

17 mutantes generados (mismo total que la ronda 1). Cobertura de test: 17/17
`covered` (0 `no cov`).

## El único superviviente: línea 18, EQUIVALENTE — cita sin re-derivar (código sin cambios)

```
[id 6] EqualityOperator
src/components/Cabecera-logica.ts:18:9
-   if (!(anchoVentana > 0)) {
+   if (!(anchoVentana >= 0)) {
```

`testsCompleted: 23`, `coveredBy`: los 23 tests que ejercitan `esMovil`
(directa o indirectamente vía `Cabecera`).

Este es exactamente el mismo mutante (misma línea, mismo mutador, mismo diff)
que la ronda 1 de esta misma feature ya verificó como equivalente de forma
exhaustiva sobre el dominio completo de `number` (los cuatro casos `x>0`,
`x===0`, `x<0`, `x=NaN`, ver detalle íntegro conservado en el historial más
abajo), y que a su vez reproducía la justificación original de
`tdd_craftsman` en el Ciclo 14 de `progress/tdd_cabecera_y_navegacion.md`.
**No se re-deriva la prueba en esta ronda**, siguiendo el mismo precedente que
`progress/mutation_datos_negocio.md` ronda 2 aplicó a `telefono.ts:13`: el
código de `Cabecera-logica.ts:17-21` (`esMovil` completa) no cambió entre
rondas — confirmado arriba, releído íntegro antes de correr Stryker — así que
el análisis de equivalencia sigue siendo válido sin repetir el trabajo. Esta
corrida lo confirma como el único superviviente, idéntica ubicación e idéntico
diff que en la ronda 1.

Excluido del cómputo de huecos reales, conforme a `docs/mutation-testing.md`
("Un mutante equivalente... puede excluirse, pero solo con justificación
explícita").

## Los 2 huecos reales de la ronda 1 (`esAncla`, líneas 33-34): confirmados muertos

```
[id 14] BlockStatement (línea 33) — status: Killed — testsCompleted: 3 — killedBy: ["24"]
[id 15] MethodExpression (línea 34, startsWith→endsWith) — status: Killed — testsCompleted: 1 — killedBy: ["24"]
[id 16] StringLiteral (línea 34) — status: Killed — testsCompleted: 2 — killedBy: ["25"]
```

Los dos mutantes que la ronda 1 documentó como supervivientes reales (ids 14 y
15 de aquella corrida) aparecen ahora `Killed`. Stryker generó además un
tercer mutante nuevo sobre la misma línea 34 (`StringLiteral`, id 16 en esta
corrida — el literal `'#'` mutado) que no figuraba como superviviente en la
ronda 1 (no es un mutante "nuevo" en el sentido de código nuevo: `esAncla` no
cambió; es una variación de mutantes que Stryker no siempre genera de forma
idéntica entre corridas para el mismo código). También queda `Killed`.

Cruzados los ids de test `"24"`/`"25"` contra `report.testFiles` en
`mutation.json`, ambos apuntan a
`src/components/Cabecera-logica.test.ts`, describe `esAncla distingue un
destino de sección ("#...") de uno de subpágina` — exactamente los dos tests
directos que añadió el Ciclo 17 (`esAncla('#servicios')` → `true`;
`esAncla('/tienda')` y `esAncla('tienda#')` → `false`). Confirmado con el dato
crudo del reporte, no solo con la bitácora del `tdd_craftsman` ni con la
reproducción manual que ya hizo `judge` en su revisión.

## Cómputo del score

- Total: 17. Equivalente verificado (cita, sin re-derivar): 1 (línea 18, id 6).
  No equivalentes: 16.
- Killed sobre no equivalentes: 16. Survived reales: 0.
- **16/16 = 100.00%**, alcanza el umbral `1.0` (100%) de
  `harness.config.json` → `mutation.threshold`.

## Verificaciones de entorno

- `pnpm exec vitest run` antes de la corrida de Stryker: **84/84 verdes**.
- `ps -W` (Git Bash, listado completo con ruta de ejecutable) sin
  coincidencias `node|stryker` antes ni después de la única corrida: nunca dos
  Stryker a la vez sobre el repo en esta sesión. Ver nota de discrepancia
  entre herramientas en la sección "Cómo se corrió" — no bloqueante, resuelta
  con la fuente más fiable disponible en esta sesión.
- Columna `# timeout` = 0 en la única corrida. No hizo falta repetir.
- `reports/mutation/mutation.json` leído directamente para extraer estado,
  `testsCompleted` y `killedBy` de los 17 mutantes (no solo el resumen
  `clear-text`).
- Ningún fichero de `src/` ni de test tocado durante esta medición.

## Resumen para `craftsman_lead`

**PASS.** El único fichero mordible de esta feature
(`src/components/Cabecera-logica.ts`) alcanza 94.12% bruto / **100.00% sobre
mutantes no equivalentes**, igual al umbral `1.0` de `harness.config.json`. De
los 17 mutantes generados, 16 mueren y el único superviviente es el mutante
equivalente ya verificado exhaustivamente en la ronda 1 de esta misma feature
(línea 18 de `esMovil`, `> 0` vs `>= 0`), citado aquí sin re-derivar porque el
código de esa función no cambió. Los 2 huecos reales que bloquearon la ronda 1
(`esAncla`, líneas 33-34) quedan confirmados `Killed`, atribuidos por la
propia herramienta (no por inferencia) a los dos tests directos que añadió
`tdd_craftsman` en el Ciclo 17 y que `judge` ya validó en su ronda 3.

C7 queda satisfecho. No quedan puertas de mutación pendientes para
`cabecera_y_navegacion` (id 3): puede marcarse `done` en `feature_list.json`.

---

## Historial — ronda 1 de mutación (`FAIL`, referencia íntegra)

# Mutación — feature `cabecera_y_navegacion` (id 3) — tras aprobación del `judge` en ronda 2

**Contexto:** `progress/judge_cabecera_y_navegacion.md` (ronda 2, veredicto
`APPROVED`, C7 delegado explícitamente a esta medición). Esta es la primera
medición de mutación de esta feature (no hubo ronda 1 de mutación: el
`judge` paró en `CHANGES_REQUESTED` en su primera revisión, antes de llegar
a esta puerta — ver `progress/tdd_cabecera_y_navegacion.md`, sección "Ronda
2").

**Veredicto:** **FAIL**

**Score bruto (killed/total):** 14/17 = 82.35%
**Score sobre mutantes no equivalentes:** 14/16 = **87.50%** (umbral:
`harness.config.json` → `mutation.threshold` = `1.0` / `stryker.config.json`
→ `thresholds.break` = 100)
**Timeouts:** 0 (columna `# timeout` leída antes que el score, patrón
`informe-de-mutacion-con-timeouts-miente`; ver detalle abajo).

### Alcance: qué ficheros son "mordibles" para esta feature

Leído `progress/tdd_cabecera_y_navegacion.md`, sección "Ficheros de
producción creados en esta sesión": tres ficheros nuevos —
`src/components/Cabecera-logica.ts`, `src/components/Cabecera.tsx` y
`src/data/navegacion.ts`. Pero `stryker.config.json` → `mutate` solo declara
`src/lib/**/*.ts` y `src/**/*-logica.ts` (comentario explícito en el propio
fichero: "Los `.tsx` solo cablean... StrykerJS no muta ni el texto ni los
atributos de JSX... incluirlos daría una métrica engañosa"). De los tres
ficheros de esta feature, solo uno cae dentro de ese patrón:

- `src/components/Cabecera-logica.ts` → coincide con `src/**/*-logica.ts`.
  **Único fichero mordible de esta feature** (confirmado también por la
  propia decisión de diseño 2 documentada en `progress/tdd_cabecera_y_navegacion.md`:
  "la única superficie que `stryker.config.json` muta").
- `src/components/Cabecera.tsx` → `.tsx`, no coincide con ningún patrón.
  Fuera de alcance por diseño del proyecto.
- `src/data/navegacion.ts` → no está bajo `src/lib/` ni termina en
  `-logica.ts` (catálogo de datos estático, sin lógica). Fuera de alcance
  por diseño del proyecto.

Verificado además que no existe ningún otro `*-logica.ts` nuevo ni ningún
fichero bajo `src/lib/` tocado por esta feature (`git status` /
`progress/judge_cabecera_y_navegacion.md` checkpoint C3: "`src/lib/` son los
10 ficheros de `datos_negocio`/`tokens_marca`... sin tocar en esta ronda").
Por tanto esta medición cubre el 100% de la superficie mordible real de la
feature con una sola corrida de Stryker.

### Cómo se corrió (ficha de reproducción)

Workaround ya validado (`progress/mutation_tokens_marca.md`,
`progress/mutation_datos_negocio.md`, sección "Comando usado"): `node
.harness/harness.mjs mutate <target>` falla en esta máquina con "Cannot find
TestRunner plugin vitest" (mismo síntoma ya documentado dos veces). Se
corrió directamente:

```
pnpm exec stryker run --mutate src/components/Cabecera-logica.ts --plugins @stryker-mutator/vitest-runner
```

Un único fichero mordible → una única corrida. `tasklist` sin procesos
`node.exe`/`stryker` antes de arrancar y después de terminar (verificado en
ambos momentos): nunca dos Stryker a la vez sobre el repo.
`concurrency: 1` ya fijado en `stryker.config.json`. Columna `# timeout`
leída ANTES que el score: **0**. El informe es válido, no hizo falta
repetir la corrida.

`reports/mutation/mutation.json` y `reports/mutation/index.html`
regenerados correctamente. Leído `mutation.json` directamente (no solo el
resumen `clear-text`) para confirmar `coveredBy`/`killedBy` de cada mutante,
igual que hizo la medición de `datos_negocio`.

### Resultado

| Fichero | total | killed | survived | # timeout | # errors | score |
| --- | --- | --- | --- | --- | --- | --- |
| `src/components/Cabecera-logica.ts` | 17 | 14 | 3 | 0 | 0 | 82.35% |

17 mutantes generados sobre 34 líneas de código puro (`PUNTO_DE_CORTE_NAVEGACION_PX`,
`esMovil`, `esAncla`). Cobertura de test: 17/17 `covered` (0 `no cov`; cada
mutante fue ejercitado por al menos un test; el problema no es cobertura,
es aserción).

### Los 3 supervivientes

#### 1. `src/components/Cabecera-logica.ts:18` — EQUIVALENTE, verificado

```
-   if (!(anchoVentana > 0)) {
+   if (!(anchoVentana >= 0)) {
```

Mutador `EqualityOperator` (id `6` en `mutation.json`), `testsCompleted: 23`,
cubierto por los 23 tests que ejercitan `esMovil` (directa o
indirectamente vía `Cabecera`).

Este es exactamente el mutante que `tdd_craftsman` ya documentó y justificó
como equivalente en `progress/tdd_cabecera_y_navegacion.md`, Ciclo 14. No se
da por buena esa justificación sin comprobarla — se reconstruye la prueba de
forma independiente y exhaustiva (no solo sobre el rango `[0, 255]` de la
feature `tokens_marca`, aquí el dominio de `anchoVentana` es cualquier
`number`):

**Prueba (cubre el dominio completo de entrada, no una muestra):**

```
esMovil(x):
  original: if (!(x > 0))  return true; else return x < 1024
  mutante:  if (!(x >= 0)) return true; else return x < 1024
```

- `x > 0`: ambas guardas son `false` (no disparan) → ambas caen a
  `x < 1024`. Idéntico resultado.
- `x === 0`: original dispara (`!(0>0)` = `true`) → `return true`. Mutante
  NO dispara (`!(0>=0)` = `false`) → cae a `0 < 1024` = `true` → `return
  true`. Mismo resultado final por caminos distintos.
- `x < 0`: ambas guardas son `true` (`x>0` y `x>=0` son ambas `false` para
  cualquier negativo) → ambas devuelven `true` directamente. Idéntico.
- `x` es `NaN`: `NaN > 0` y `NaN >= 0` son ambas `false` (toda comparación
  con `NaN` es `false`) → ambas guardas disparan (`!false` = `true`) →
  ambas devuelven `true`. Idéntico.

Estos cuatro casos cubren la recta real completa más `NaN`: no queda ningún
valor de `anchoVentana` sin clasificar. Para todo el dominio de entrada que
esta función puede recibir, `esMovil` devuelve el mismo booleano con `>` que
con `>=`. Mutante genuinamente equivalente — no hay, ni puede construirse,
un test que los distinga sin cambiar el contrato de la función (que solo
expone `boolean`, nunca cuál rama del `if` se tomó).

Excluido del cómputo de huecos reales, conforme a `docs/mutation-testing.md`
("Un mutante equivalente... puede excluirse, pero solo con justificación
explícita").

#### 2 y 3. `src/components/Cabecera-logica.ts:33-34` — REALES, no equivalentes (en esta ronda 1)

```
[14] BlockStatement (línea 33):
-   export function esAncla(destino: string): boolean {
-     return destino.startsWith('#')
-   }
+   export function esAncla(destino: string): boolean {}

[15] MethodExpression (línea 34):
-     return destino.startsWith('#')
+     return destino.endsWith('#')
```

Ambos cubiertos únicamente por los tests `@s9`/`@s10`
(`Cabecera.test.tsx`, ids de test `14`/`15` en `mutation.json`),
`testsCompleted: 2` cada uno, ninguno los mata.

**Por qué sobreviven (leído el código real, `src/components/Cabecera.tsx:65-71`):**

```
alPulsar={(destino, evento) => {
  if (!esAncla(destino)) {
    evento.preventDefault()
    window.history.pushState(null, '', destino)
  }
  setAbierto(false)
}}
```

Con ambos mutantes, `esAncla('#servicios')` deja de devolver `true`
(mutante 1: siempre `undefined`; mutante 2: `'#servicios'.endsWith('#')` es
`false`). En los dos casos `!esAncla(destino)` pasa a ser `true` también
para destinos ancla, así que el clic en "Servicios" (`@s9`) toma la rama de
`preventDefault()` + `history.pushState(null, '', '#servicios')` en vez de
dejar el comportamiento nativo del navegador. El test de `@s9` solo
comprueba el estado final (`window.location.hash === '#servicios'`,
`aria-expanded` y ausencia del panel) — y **ese estado final resulta
idéntico** tanto si se llega por navegación nativa de fragmento como por
`pushState` con una URL que solo cambia el hash, porque `pushState` también
actualiza `location.hash` al mismo valor.

**Verificación de que NO es equivalente (hay una diferencia observable real,
solo que el test actual no la mira):** leído el código fuente de jsdom
(`node_modules/jsdom/lib/jsdom/living/window/SessionHistory.js` y
`History-impl.js`) y confirmado empíricamente con un script standalone
usando el mismo `jsdom` del proyecto:

```
CASO NATIVO (click en <a href="#servicios">):
  hash final: #servicios
  hashchange disparado: true

CASO MUTANTE (esAncla siempre falso -> pushState("#servicios")):
  hash final: #servicios
  hashchange disparado: false
```

La navegación nativa de fragmento (`navigateToFragment` →
`traverseHistory` → `_fireEvents`) sí dispara `hashchange`; la ruta de
`History-impl.js` → `pushState` **nunca** llama a `_fireEvents` (lo
confirma el propio código: solo actualiza `_sessionHistory` y `document._URL`
directamente, sin pasar por `traverseHistory`). Es una diferencia de
comportamiento real y observable — un test que escuchara el evento
`hashchange` del `window` (o que espiara `window.history.pushState`/
`evento.preventDefault`) mataría ambos mutantes. El motivo de que sobrevivan
en esta ronda 1 es que la suite de entonces solo verificaba el estado final
(`location.hash`), que da la casualidad de coincidir en ambos caminos para un
destino tipo `#servicios` — **no** es que el comportamiento sea indistinguible
en general.

**Conclusión de la ronda 1: 2 huecos reales de aserción**, no mutantes
equivalentes. Cerrados en el Ciclo 17 con un test directo de `esAncla` en
`Cabecera-logica.test.ts` (ver medición oficial arriba, que confirma ambos
`Killed`).

### Cómputo del score (ronda 1)

- Total: 17. Equivalente verificado: 1 (línea 18). No equivalentes: 16.
- Killed sobre no equivalentes: 14. Survived reales: 2 (líneas 33 y 34).
- **14/16 = 87.50%**, por debajo del umbral `1.0` (100%) de
  `harness.config.json` → `mutation.threshold`.

### Verificaciones de entorno (ronda 1)

- `tasklist` sin procesos `node.exe`/`stryker` antes y después de la única
  corrida: nunca dos Stryker a la vez sobre el repo.
- Columna `# timeout` = 0. No hizo falta repetir la corrida.
- `reports/mutation/mutation.json` leído directamente (no solo el resumen
  `clear-text`) para extraer `coveredBy`/`killedBy` de los 17 mutantes.
- Ningún fichero de `src/` ni de test tocado durante esta medición. El
  script de verificación empírica del punto "2 y 3" se escribió y ejecutó
  fuera del árbol del proyecto (ficha temporal en el scratchpad de la
  sesión, borrada del repo tras usarla — nunca se creó ni quedó ningún
  fichero `*_TEMP.mjs` en el árbol de trabajo; confirmado con `git status`
  limpio en la raíz del repo).

### Resumen de la ronda 1 (histórico)

**FAIL.** El único fichero mordible de esta feature
(`src/components/Cabecera-logica.ts`) alcanzó 82.35% bruto / 87.50% sobre
mutantes no equivalentes, por debajo del umbral 100% de
`harness.config.json`. De los 3 supervivientes, 1 fue un mutante
genuinamente equivalente (línea 18, `> 0` vs `>= 0`, ya documentado por
`tdd_craftsman` y reverificado con una prueba exhaustiva sobre todo el
dominio de entrada) y **2 fueron huecos reales de aserción** en `esAncla`
(líneas 33 y 34): la función `esAncla` en sí solo se ejercitaba
indirectamente a través de `Cabecera.tsx`, y ni `@s9` ni `@s10` comprobaban
una consecuencia observable que distinguiera "se trató como ancla nativa" de
"se interceptó con `preventDefault` + `pushState`" — ambos caminos convergían
en el mismo `window.location.hash` final para un destino tipo `#servicios`.
Existía una diferencia real y explotable (el evento `hashchange`, que solo
dispara la ruta nativa — verificado leyendo el código fuente de jsdom y con
un script empírico), así que no procedía excluir estos dos como
equivalentes. `craftsman_lead` relanzó `tdd_craftsman` (Ciclo 17), que cerró
ambos huecos con un test directo de unidad sobre `esAncla`; `judge` aprobó
ese cambio en su ronda 3; y esta re-medición oficial (arriba) confirma
`PASS`.
