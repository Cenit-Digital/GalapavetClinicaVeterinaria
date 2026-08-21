# Mutación — feature `ensamblaje_landing` (id 20) — ronda 2 (medición tras "Ronda de refuerzo 2" del `tdd_craftsman`)

**Contexto:** `judge` aprobó la ronda 2 de `tdd_craftsman` (`progress/judge_ensamblaje_landing.md`,
veredicto `APPROVED`, checkpoint C7 explícitamente delegado a esta medición,
señalando además que `progress/mutation_ensamblaje_landing.md` anterior
"documenta la medición de ronda 1 (FAIL, 66.67%, previa al refuerzo)" y
"queda desactualizado". Esta es la medición oficial e independiente sobre el
código posterior al refuerzo, **sustituye por completo** al informe de ronda 1
(preservado solo en el historial de `git`, no en este fichero).

**Veredicto:** **PASS**

**Score (feature completa, 5 ficheros, sobre no-equivalentes):** 26/26 = **100.00%**
(umbral: 100% / `1.0`, `harness.config.json` -> `mutation.threshold` /
`stryker.config.json` -> `thresholds.break`)
Score bruto sin excluir el mutante equivalente: 26/27 = 96.30%.
**Timeouts: 0 en las 5 corridas** (columna "# timeout" leída antes que el
score en cada corrida, patrón `informe-de-mutacion-con-timeouts-miente`; ver
detalle abajo). **Errors: 0** en las 5 corridas.

## Identificación de ficheros tocados (leído de `progress/tdd_ensamblaje_landing.md`)

Sección "Ficheros de producción entregados" (ronda 1) + "Ronda de refuerzo 2"
(cambio de producción de los supervivientes 5-8): `src/main.tsx`, `src/App.tsx`,
`src/App-logica.ts` (nuevo en la ronda de refuerzo, extraído de `App.tsx` por
una restricción real de `oxlint` `react-refresh/only-export-components`, no
por preferencia), `src/pages/Landing.tsx`, `src/pages/PaginaNoEncontrada.tsx`.
Estos 5 ficheros son la superficie completa de producción de esta feature.
Confirmado leyendo el código fuente actual de los 5 antes de medir (no solo
la bitácora): coincide exactamente con lo que describe el `tdd_craftsman`.

## Nota importante: la premisa de "superficie 0"/"fuera del gate de Stryker" tampoco se dio por buena en esta ronda

`stryker.config.json` solo muta por defecto `src/lib/**/*.ts` +
`src/**/*-logica.ts`, excluyendo todo `.tsx`. Bajo ese glob, `main.tsx`,
`App.tsx`, `Landing.tsx` y `PaginaNoEncontrada.tsx` quedarían fuera; solo el
nuevo `src/App-logica.ts` caería dentro por patrón `*-logica.ts`. Igual que
documentó ya `progress/mutation_hero.md` para `Hero.tsx` y el propio informe
de ronda 1 de esta misma feature, esa lectura del glob por defecto es
correcta pero **no implica ausencia de superficie mutable**: el flag
`--mutate <fichero>` sobreescribe el array `mutate` de la config sin importar
el glob. No repetí la premisa sin comprobarla: corrí el comando explícito
sobre los 5 ficheros, uno a la vez (incluido `App-logica.ts`, que además
verifiqué también cae ya en el glob por defecto -- corrida igualmente
explícita por consistencia con el resto de la feature). Resultado: 3 de los 5
ficheros (`main.tsx`, `App.tsx`, `App-logica.ts`) tienen lógica JS/TS real y
mordible; `Landing.tsx` y `PaginaNoEncontrada.tsx` siguen siendo superficie
genuinamente trivial (mismo hallazgo que ronda 1, reconfirmado en esta ronda,
no asumido): cada uno solo admite el único mutante posible (`BlockStatement`
que vacía la función de composición entera), y ambos vuelven a morir.

## Cómo se corrió (ficha de reproducción, 5 corridas independientes, nunca en paralelo)

Verificado antes de la primera corrida (`Get-CimInstance Win32_Process`
filtrado por `node.exe`, inspeccionando además la línea de comandos de cada
proceso): 3 procesos `node.exe` presentes en todo momento, los tres tooling
del IDE ajeno al arnés (`acp-agents`/`codex-acp`, PIDs 3128/8400/20176),
ninguno de ellos `stryker` ni `vitest`. Repetido el mismo chequeo (filtro
`stryker|vitest` en la línea de comandos) entre cada una de las 5 corridas:
sin resultados en todos los casos -- nunca dos corridas de Stryker vivas a
la vez.

Primero se probó `bin/harness mutate src/main.tsx` tal cual (sin workaround),
para no dar por sentado que el problema de plugin de rondas anteriores seguía
vigente: falló exactamente igual que documentó la ronda 1 (`Cannot find
TestRunner plugin "vitest"`). Confirmado el mismo workaround ya validado en
este proyecto (`progress/mutation_hero.md`, informe de ronda 1 de esta misma
feature, etc.):

```
pnpm exec stryker run --mutate src/main.tsx --plugins @stryker-mutator/vitest-runner
pnpm exec stryker run --mutate src/App.tsx --plugins @stryker-mutator/vitest-runner
pnpm exec stryker run --mutate src/pages/Landing.tsx --plugins @stryker-mutator/vitest-runner
pnpm exec stryker run --mutate src/pages/PaginaNoEncontrada.tsx --plugins @stryker-mutator/vitest-runner
pnpm exec stryker run --mutate src/App-logica.ts --plugins @stryker-mutator/vitest-runner
```

`--concurrency 1` ya fijado en `stryker.config.json`. No se tocó ningún
fichero de configuración para esto. Columna "# timeout" leída antes que el
score en las 5 corridas: **0 en todas**. Informes válidos.

## Resultado por fichero (medición oficial, ronda 2)

| Fichero | total | killed | survived | # timeout | # errors | score |
| --- | --- | --- | --- | --- | --- | --- |
| src/main.tsx | 9 | 9 | 0 | 0 | 0 | 100.00% |
| src/App.tsx | 12 | 11 | 1 | 0 | 0 | 91.67% |
| src/pages/Landing.tsx | 1 | 1 | 0 | 0 | 0 | 100.00% |
| src/pages/PaginaNoEncontrada.tsx | 1 | 1 | 0 | 0 | 0 | 100.00% |
| src/App-logica.ts | 4 | 4 | 0 | 0 | 0 | 100.00% |
| Total feature (bruto) | 27 | 26 | 1 | 0 | 0 | 96.30% |
| Total feature (excluido el equivalente) | 26 | 26 | 0 | 0 | 0 | 100.00% |

`main.tsx` pasó de 8/9 (ronda 1) a 9/9: la aserción `rejects.toBeInstanceOf(Error)`
añadida en la ronda de refuerzo mata el mutante `BlockStatement` de
`errorElementoRaizAusente()` (antes superviviente). `App.tsx` pasó de 8/16
(ronda 1) a 11/12: el total bajó de 16 a 12 porque los 4 mutantes de la
derivación de `RUTAS_DE_SUBPAGINA` (antes en `App.tsx:16-17`) se movieron con
el código a `App-logica.ts` (ahora 4/4 killed ahí); de los 12 que quedan en
`App.tsx`, los 2 de la limpieza del `useEffect` (antes `38:12`/`38:45`, ahora
reubicados en la línea 28) y el de la generación de `<Route>` por subpágina
(antes `57:33`) mueren con los tests nuevos de la ronda de refuerzo. Solo
sobrevive uno: el array de dependencias del `useEffect`.

## El único superviviente: `src/App.tsx:29:6` -- ArrayDeclaration

```
- }, [])
+ }, ["Stryker was here"])
```

(mismo mutante que en ronda 1, entonces reportado como `38:6`; se reubicó de
línea por la extracción de `RUTAS_DE_SUBPAGINA` a `App-logica.ts`, no cambió
de naturaleza).

### Evaluación independiente de equivalencia (no delegada al relato de `tdd_craftsman`)

`progress/tdd_ensamblaje_landing.md` (sección "Ronda de refuerzo 2",
superviviente 4) documenta una investigación propia de por qué este mutante
sería equivalente, y explícitamente NO se auto-excluye -- deja la decisión
para `mutation_tester`, tal como exige `docs/mutation-testing.md` ("solo el
`mutation_tester` mide y excluye, con justificación explícita"). No se aceptó
esa investigación por relato: se reprodujo de forma independiente en esta
sesión.

1. **Reproducción del mutante confirmada por la propia corrida de Stryker**:
   la línea `[Survived] ArrayDeclaration src/App.tsx:29:6` de la salida de
   consola de esta ronda 2 (ver arriba) es evidencia directa -- no una
   inferencia -- de que las 18 pruebas de `App.test.tsx` (incluidas las 2
   nuevas de la ronda de refuerzo dirigidas específicamente al `useEffect` de
   resize) siguen en verde con `}, ["Stryker was here"])`.
2. **Verificación de la causa raíz leyendo el código fuente real de React
   instalado en `node_modules`** (no solo aceptando la cita de la bitácora de
   TDD): `node_modules/react-dom/cjs/react-dom-client.development.js:7601-7621`,
   función `areHookInputsEqual`, leída directamente en esta sesión:

```js
function areHookInputsEqual(nextDeps, prevDeps) {
  if (ignorePreviousDependencies) return !1;
  if (null === prevDeps) return (console.error(...), !1);
  nextDeps.length !== prevDeps.length && console.error(...);
  for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++)
    if (!objectIs(nextDeps[i], prevDeps[i])) return !1;
  return !0;
}
```

   La comparación es por valor, elemento a elemento, no por identidad del
   array contenedor. Tanto `[]` (código real) como `["Stryker was here"]`
   (mutante) son literales: su longitud y su único contenido (si lo hay) son
   exactamente los mismos en cada render de la misma instancia montada,
   independientemente de qué prop/estado cambie. Para `[]`, el bucle nunca se
   ejecuta (longitud 0) -> siempre "iguales". Para `["Stryker was here"]`, el
   bucle compara `Object.is('Stryker was here', 'Stryker was here')` -> `true`
   siempre, porque es el mismo literal de cadena primitivo en cada
   evaluación -> también siempre "iguales". El aviso de dev "changed size
   between renders" tampoco puede dispararse en ningún caso: dispararía solo
   si la longitud cambiara entre renders de la misma instancia, y aquí la
   longitud es constante (0 en un caso, 1 en el otro) en toda la vida del
   componente.
   Conclusión verificada, no asumida: para cualquier re-render posible de
   `App` dentro de la misma instancia montada (el único mecanismo que
   `useAnchoDeVentana` puede disparar, vía `setAncho` en el listener de
   `resize`), el efecto se ejecuta exactamente una vez tanto con `[]` como
   con `["Stryker was here"]` -- no hay ninguna observación de comportamiento
   posible (conteo de llamadas a `addEventListener`, número de suscripciones,
   warnings de React, fugas de listener) que distinga las dos variantes sin
   inspeccionar el propio código fuente (AST) en vez del comportamiento en
   tiempo de ejecución.
3. **Comprobación adicional, no solo teórica**: el propio test de refuerzo
   de `App.test.tsx` ("el listener de 'resize' se suscribe una sola vez,
   incluso tras un resize real que provoca un re-render") es precisamente el
   experimento que un mutation tester diseñaría a mano para intentar matar
   este mutante -- cuenta `addEventListener('resize', ...)` antes y después
   de un `resize` real que fuerza un re-render, y en ambos momentos son 1.
   Este test ya se ejecutó como parte de la corrida oficial de Stryker de
   esta ronda (test id "9" en el informe JSON, `covered: 12`, no aparece
   entre los `killedBy` del mutante 10) -- confirma en la práctica, con el
   runner real de Stryker (no una simulación aparte), que ni siquiera el
   test más dirigido posible distingue las dos variantes.

**Decisión de este `mutation_tester`**: mutante equivalente genuino, excluido
del score con esta justificación explícita e independientemente verificada
(no una repetición del relato de `tdd_craftsman`). No se abusa de esta vía:
es el único mutante de las 27 corridas de esta ronda que se excluye, y la
exclusión está respaldada por lectura directa del algoritmo real de React que
ejecuta la suite, no por una suposición sobre su comportamiento.

## Mutantes sobrevivientes de Landing.tsx / PaginaNoEncontrada.tsx / App-logica.ts / main.tsx

Ninguno. `main.tsx`: 9/9 killed (detalle: `StringLiteral` de `ID_ELEMENTO_RAIZ`,
`BlockStatement`/`StringLiteral` de `errorElementoRaizAusente` -- este último
antes superviviente en ronda 1, ahora killed por la aserción
`rejects.toBeInstanceOf(Error)` --, `BlockStatement`/`ConditionalExpression`/
`EqualityOperator` de `elementoRaiz()`, `CallExpression` del render final).
`Landing.tsx`/`PaginaNoEncontrada.tsx`: 1/1 cada uno, el único
`BlockStatement` posible de cada función de composición. `App-logica.ts`:
4/4 -- los 4 mutantes exactos de la derivación de `RUTAS_DE_SUBPAGINA`
(`MethodExpression` que elimina el `.filter`, `ArrowFunction` que vacía el
predicado, `BooleanLiteral` que invierte la negación de `esAncla`,
`ArrowFunction` que vacía el `.map` final), todos matados por el test único
de `App-logica.test.ts` que compara el valor exacto
`['/campanas', '/blog', '/tienda']`.

## Mutantes equivalentes

Uno: `src/App.tsx:29:6` (`ArrayDeclaration`, dependencias del `useEffect` de
`useAnchoDeVentana`), documentado y justificado arriba con verificación
independiente del algoritmo real de React (`areHookInputsEqual`) y con la
corrida real de Stryker de esta ronda como evidencia empírica adicional.
Excluido del score. Ningún otro mutante de las 27 corridas se declara
equivalente -- todos los demás supervivientes de ronda 1 se mataron con
tests de comportamiento reales, no se excluyeron.

## Verificaciones de entorno

- `Get-CimInstance Win32_Process` (filtrado por `node.exe`, con línea de
  comandos completa) antes de la primera corrida: 3 procesos, los 3 tooling
  del IDE (`acp-agents`/`codex-acp`), ninguno `stryker`/`vitest`. Repetido
  (filtro `stryker|vitest`) entre cada una de las 5 corridas: 0 resultados
  siempre.
- Una sola corrida de Stryker viva en cada momento; nunca dos en paralelo.
- Columna "# timeout" = 0 y "# errors" = 0 en las 5 corridas, leída antes que
  el score en cada una.
- `reports/mutation/mutation.json` regenerado en cada corrida (se
  sobreescribe por fichero); copiado a un directorio temporal después de
  cada corrida para poder comparar el detalle de las 5 sin que la siguiente
  corrida lo pisara. Detalle de mutantes (id, mutador, ubicación, estado,
  reemplazo, test que mata) leído directamente de esas copias del JSON, no
  solo del resumen clear-text de consola.
- Ningún fichero de `src/` ni de test editado durante esta medición.
- `git status --porcelain -- src/` confirma que los 5 ficheros de esta
  feature siguen sin comitear (mismo estado que dejó `tdd_craftsman`/`judge`);
  ningún otro fichero de `src/` fuera de esta feature aparece modificado por
  esta medición.

## Resumen para `craftsman_lead`

**PASS.** Los 5 ficheros de producción de esta feature (`main.tsx`, `App.tsx`,
`App-logica.ts`, `Landing.tsx`, `PaginaNoEncontrada.tsx`) sí tienen superficie
mutable real, medida explícitamente con `--mutate <fichero>
--plugins @stryker-mutator/vitest-runner` sobre cada uno, uno a la vez:

- `src/main.tsx`: 9/9 = 100.00%.
- `src/App.tsx`: 11/12 = 91.67%, 1 superviviente evaluado de forma
  independiente como mutante equivalente genuino (dependencias del
  `useEffect` de resize, justificación verificada contra el código fuente
  real de React en `node_modules`).
- `src/pages/Landing.tsx`: 1/1 = 100.00%.
- `src/pages/PaginaNoEncontrada.tsx`: 1/1 = 100.00%.
- `src/App-logica.ts`: 4/4 = 100.00%.

Score de la feature sobre mutantes no-equivalentes: **26/26 = 100.00%**,
alcanza el umbral `1.0` de `harness.config.json`. La "Ronda de refuerzo 2" de
`tdd_craftsman` (`progress/tdd_ensamblaje_landing.md`) mató con éxito los 8
supervivientes de comportamiento real que dejó la ronda 1 (1 en `main.tsx`,
2 de limpieza de listener + 4 de derivación de rutas + 1 de generación de
`<Route>` en `App.tsx`); el noveno superviviente de ronda 1 se confirma en
esta ronda como mutante equivalente y se excluye con justificación explícita,
no se "resuelve" con un test artificioso. C7 queda satisfecho para
`ensamblaje_landing` (id 20). No quedan puertas de mutación pendientes para
esta feature; corresponde a `craftsman_lead` marcarla `done` en
`feature_list.json` si el resto de puertas (`judge` ya `APPROVED`) están
cerradas.
