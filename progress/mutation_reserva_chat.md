# Mutación — feature `reserva_chat` (id 7) — ronda 3 (re-medición tras aprobación del `judge`)

**Contexto:** la primera medición oficial (conservada íntegra más abajo, sección
"Histórico — medición ronda 2 (FAIL)") midió **20/32 = 62.50%**, con 12
mutantes no-killed en `siguientePaso` (6 sin cobertura, 6 cubiertos pero no
matados), los 12 verificados uno a uno como no-equivalentes. El informe dejó
dos vías de cierre abiertas como "elección de diseño, no me corresponde
decidirla a mí"; `tdd_craftsman` eligió la vía 1 (reforzar solo
`ReservaChat-logica.test.ts` con 5 tests directos, sin tocar producción,
`progress/tdd_reserva_chat.md` "Ronda 3"), y `judge` aprobó ese cierre sin
pedir cambios (`progress/judge_reserva_chat.md` ronda 3, veredicto
**APPROVED**, delegando C7 explícitamente a esta re-medición independiente).
Esta es esa re-medición.

**Veredicto:** **PASS**

**Score:** 32/32 = **100.00%** (umbral: 100% / `1.0`, `harness.config.json` ->
`mutation.threshold`; `stryker.config.json` -> `thresholds.break = 100`)
**Timeouts:** 0, columna `# timeout` leída antes que el score (patrón
`informe-de-mutacion-con-timeouts-miente`) — no hace falta repetir la corrida.
**Mutantes equivalentes:** 0 necesarios — no hay ningún superviviente que
justificar como equivalente; el score es 100% real.

## Alcance

Igual que la ronda 2 (sin cambios de alcance): `progress/tdd_reserva_chat.md`
lista dos ficheros de producción, pero solo `src/components/ReservaChat-logica.ts`
entra en la superficie mutable declarada por `stryker.config.json` (`mutate:
["src/lib/**/*.ts", "src/**/*-logica.ts", ...]`). `ReservaChat.tsx` sigue fuera
a propósito (comentario de cabecera de `stryker.config.json`: los `.tsx` solo
cablean presentación y StrykerJS no muta JSX). El `tdd_craftsman` de esta ronda
eligió explícitamente la vía que **no** toca `ReservaChat.tsx` (0 líneas de
producción esta ronda, confirmado también por `judge`), así que el alcance de
la medición no cambia: `ReservaChat-logica.ts` en su totalidad, que sigue
siendo toda la superficie mutable real de la feature.

## Ficheros de producción tocados desde la última medición

Según `progress/tdd_reserva_chat.md` ("Ronda 3") y confirmado por `judge`
(`progress/judge_reserva_chat.md`, §0, `git diff --stat`): **ninguno**. El
único fichero modificado es `src/components/ReservaChat-logica.test.ts` (+20
líneas, 5 tests nuevos). `ReservaChat-logica.ts` es byte a byte el mismo que
midió la ronda 2.

## Verificación de entorno antes de arrancar

`Get-CimInstance Win32_Process -Filter "Name='node.exe'"`: 18 procesos
`node.exe` activos, ninguno de ellos Stryker — inspeccionados uno a uno por
línea de comandos: 1× `harness.mjs init`, 1× `pnpm run test`, 16× workers de
`vitest` (`.../vitest/dist/workers/forks.js`), todos de otra sesión ajena a
esta medición. Cero procesos con `stryker` en la línea de comandos. No viola
la regla "nunca dos corridas de Stryker a la vez sobre el repo" (esa regla es
sobre Stryker, no sobre Vitest/harness de otras sesiones — mismo criterio ya
aplicado en la ronda 2 de esta misma feature y en `datos_negocio` ronda 2).

## Comando usado

Workaround ya validado (`progress/mutation_tokens_marca.md`,
`progress/mutation_datos_negocio.md`, sección "Comando usado", y la propia
ronda 2 de este informe): `node .harness/harness.mjs mutate <target>` falla en
esta máquina con "Cannot find TestRunner plugin vitest" (Stryker no resuelve
`@stryker-mutator/vitest-runner` vía el glob por defecto
`["@stryker-mutator/*"]`). Un solo fichero:

```
pnpm exec stryker run --mutate src/components/ReservaChat-logica.ts --plugins @stryker-mutator/vitest-runner
```

Corrida única (no hizo falta repetir: columna `# timeout` = 0 a la primera).
Dry run inicial: 30 tests verdes (167 totales del proyecto; 30 es el
subconjunto que Stryker detecta como relevante para este fichero mutado por
análisis de cobertura `perTest`). `concurrency: 1` (fijado en
`stryker.config.json`). Duración: 5 minutos 14 segundos.

## Resultado

```
-----------------------|------------------|----------|-----------|------------|----------|----------|
                       | % Mutation score |          |           |            |          |          |
File                   |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
-----------------------|--------|---------|----------|-----------|------------|----------|----------|
All files              | 100.00 |  100.00 |       32 |         0 |          0 |        0 |        0 |
 ReservaChat-logica.ts | 100.00 |  100.00 |       32 |         0 |          0 |        0 |        0 |
-----------------------|--------|---------|----------|-----------|------------|----------|----------|
Final mutation score of 100.00 is greater than or equal to break threshold 100
```

`reports/mutation/mutation.json` y `reports/mutation/index.html` regenerados
correctamente para esta corrida.

## Verificación independiente de los 12 mutantes que sobrevivieron en la ronda 2

No me fío solo del resumen `clear-text` ni de la cifra que reportó
`tdd_craftsman` en `progress/tdd_reserva_chat.md`: leído directamente
`reports/mutation/mutation.json` con un script Node.js de una línea, cruzando
los 12 ids que la ronda 2 documentó uno a uno (`progress/judge_reserva_chat.md`
cita el mismo informe) contra su estado en esta corrida:

```
20 Killed ConditionalExpression line 41 testsCompleted 1 coveredBy ["25"] killedBy ["25"]
21 Killed StringLiteral       line 41 testsCompleted 2 coveredBy ["24","25","26","27","28","29"] killedBy ["25"]
22 Killed StringLiteral       line 42 testsCompleted 1 coveredBy ["25"] killedBy ["25"]
23 Killed ConditionalExpression line 43 testsCompleted 1 coveredBy ["26"] killedBy ["26"]
24 Killed StringLiteral       line 43 testsCompleted 2 coveredBy ["24","26","27","28","29"] killedBy ["26"]
25 Killed StringLiteral       line 44 testsCompleted 1 coveredBy ["26"] killedBy ["26"]
26 Killed ConditionalExpression line 45 testsCompleted 1 coveredBy ["27"] killedBy ["27"]
27 Killed StringLiteral       line 45 testsCompleted 2 coveredBy ["24","27","28","29"] killedBy ["27"]
28 Killed StringLiteral       line 46 testsCompleted 1 coveredBy ["27"] killedBy ["27"]
29 Killed StringLiteral       line 47 testsCompleted 2 coveredBy ["24","28","29"] killedBy ["28"]
30 Killed ConditionalExpression line 48 testsCompleted 2 coveredBy ["24","28","29"] killedBy ["28"]
31 Killed StringLiteral       line 48 testsCompleted 2 coveredBy ["24","29"] killedBy ["29"]
```

Los 32 mutantes del fichero, sin excepción, tienen `status: "Killed"`
(`{ Killed: 32 }` al agregar por estado). Los 12 antes supervivientes ahora
tienen `testsCompleted >= 1` y un `killedBy` no vacío — cobertura y muerte
atribuidas por la propia herramienta, no una inferencia manual. Los ids de
test que los matan (`24`-`29` en el reporte de esta corrida) se corresponden,
por orden y por el propio nombre en la salida `clear-text` de Stryker, con los
5 tests nuevos de refuerzo (`refuerzo mutación: desde "animal"/"cuando"/
"nombre"/"final"/"urgencia"...`) más el test preexistente de @s23
(`desde "urgencia" el paso siguiente no es ni "animal", ni "cuando", ni
"nombre"`, que sigue cubriendo pero ya no es el único que decide el veredicto
de esas líneas). Coincide exactamente con la causa raíz que documentó la
ronda 2: las 3 transiciones lineales (`'animal'→'cuando'`, `'cuando'→'nombre'`,
`'nombre'→'final'`) y el estado terminal `'urgencia'` ahora se ejercitan de
forma directa contra `siguientePaso`, con aserciones positivas en vez de solo
negaciones.

## Conclusión

**PASS.** Score 32/32 = 100.00%, igual al umbral `1.0` de
`harness.config.json`. 0 timeouts en la única corrida. 0 mutantes
supervivientes, así que no hace falta invocar la vía de exclusión por
equivalencia en absoluto. `ReservaChat.tsx` permanece fuera de la superficie
mutable declarada del proyecto (glob de `stryker.config.json`), sin cambios
respecto a la ronda 2 — el `judge` de la ronda 3 confirmó que 0 líneas de
producción se tocaron esta ronda, así que no hay superficie nueva que medir.

### Para `craftsman_lead`

C7 (mutación) queda satisfecho para `reserva_chat` (id 7). Combinado con
`progress/judge_reserva_chat.md` ronda 3 (APPROVED, sin cambios pedidos), no
quedan puertas pendientes de este ciclo para esta feature — corresponde a
`craftsman_lead`, no a mí, decidir el cierre en `feature_list.json`.

---

## Histórico — medición ronda 2 (FAIL), conservada para trazabilidad

**Veredicto:** FAIL — **Score:** 20/32 = 62.50% — **Timeouts:** 0 —
**Mutantes equivalentes:** 0 (los 12 supervivientes eran huecos reales).

Causa raíz: `siguientePaso` está diseñada como máquina de estados completa de
6 casos, pero `ReservaChat.tsx` solo la invocaba para 1 de las 4 transiciones
reales del guion (`'servicio'` → `urgencia`/`animal`); las otras tres
transiciones lineales hardcodeaban `setPaso(...)` directo, y el único test
directo que tocaba las demás ramas del `switch` (@s23, con `'urgencia'`) solo
hacía negaciones, no aserciones positivas. Detalle completo de los 12 ids, sus
mutadores, líneas y la verificación de no-equivalencia (script de sondeo con
los 12 diffs aplicados uno a uno, comparando salida original vs. mutante):
conservado en el historial de commits de este fichero y en
`progress/judge_reserva_chat.md` (que cita la tabla íntegra al aprobar la
ronda 3). No se reproduce aquí para no duplicar contenido ya verificado y
superado por la medición PASS de arriba.

Comando usado (idéntico al de esta ronda):

```
pnpm exec stryker run --mutate src/components/ReservaChat-logica.ts --plugins @stryker-mutator/vitest-runner
```

Resultado de esa corrida:

```
-----------------------|------------------|----------|-----------|------------|----------|----------|
                       | % Mutation score |          |           |            |          |          |
File                   |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
-----------------------|--------|---------|----------|-----------|------------|----------|----------|
All files              |  62.50 |   76.92 |       20 |         0 |          6 |        6 |        0 |
 ReservaChat-logica.ts |  62.50 |   76.92 |       20 |         0 |          6 |        6 |        0 |
-----------------------|--------|---------|----------|-----------|------------|----------|----------|
```
