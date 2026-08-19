# Mutación — feature `hero` (id 4) — ronda 1 (medición tras aprobación del `judge`)

**Contexto:** `judge` aprobó la ronda 1 de `tdd_craftsman`
(`progress/judge_hero.md`, veredicto `APPROVED`, C7 explícitamente delegado a
esta medición). Esta es esa medición oficial e independiente.

**Veredicto:** **PASS**

**Score:** 16/16 = **100.00%**
(umbral: 100% / `1.0`, `harness.config.json` → `mutation.threshold` /
`stryker.config.json` → `thresholds.break`)
**Timeouts: 0** (columna `# timeout` leída antes que el score, patrón
`informe-de-mutacion-con-timeouts-miente`; ver detalle abajo).

## Identificación de ficheros tocados (leído de `progress/tdd_hero.md`)

Sección "Ficheros de producción creados en esta sesión" de
`progress/tdd_hero.md`, literal:

> `src/components/Hero.tsx` — el componente [...]. Ningún fichero de
> `src/lib` ni `src/data` tocado: `Hero` reutiliza `datosNegocio` y
> `enlaceLlamada` tal cual, sin duplicar lógica ya mordida por mutación en
> `datos_negocio`.

Confirmado de forma independiente antes de correr nada, sin fiarme solo del
relato del `tdd_craftsman`:

- `git status --porcelain -- src/` → todo `src/` sigue sin comitear en este
  repo (commit inicial no lo incluyó), así que no hay diff de git que leer;
  verificado en su lugar por **fecha de modificación** de cada fichero de
  `src/lib/`: `telefono.ts` y `site.ts` quedaron con su último cambio a las
  19:15–19:16 del 19/08 — **antes** de que se escribiera
  `progress/mutation_datos_negocio.md` (19:54) y muy antes de que arrancara
  esta sesión de `hero` (`Hero.tsx` creado/tocado entre las 20:57 y las
  22:08). Ningún fichero de `src/lib/` tiene fecha posterior al cierre de la
  medición oficial de `datos_negocio` (ronda 2, `progress/mutation_datos_negocio.md`,
  95/95 = 100% sobre no-equivalentes). **No hay riesgo de regresión que
  reverificar en `telefono.ts`/`site.ts`: no se tocaron, así que no se
  vuelven a correr en esta ronda** (evita una corrida redundante sobre una
  feature ya cerrada).
- `ls src/components/` → único fichero de producción nuevo de esta sesión:
  `Hero.tsx` (más su test, `Hero.test.tsx`, que no se muta).

Único fichero de producción a mutar en esta ronda: **`src/components/Hero.tsx`**.

## Nota importante: la premisa de "superficie 0" de `tdd_hero.md`/`judge_hero.md` C7 no se dio por buena sin comprobar

Tanto `progress/tdd_hero.md` como `progress/judge_hero.md` (checkpoint C7)
asumen que esta ronda "medirá superficie 0" porque `Hero.tsx` no cae en el
glob `mutate` de `stryker.config.json` (`["src/lib/**/*.ts",
"src/**/*-logica.ts", ...]`, que excluye todo `.tsx` a propósito por el
issue conocido de StrykerJS con texto/atributos JSX). Esa lectura del glob
es correcta, pero **no implica que el fichero no tenga superficie mutable
en absoluto**: el flag `--mutate <fichero>` del propio workaround de este
proyecto (el mismo que exige la tarea) **sobreescribe** el array `mutate`
de la config y apunta a un fichero concreto sin importar si ese fichero
está o no en el glob por defecto — exactamente el mismo mecanismo con el
que ya se midieron `contraste.ts`, `tokens.ts`, `telefono.ts`, `site.ts`,
etc. en rondas anteriores.

No di por buena la premisa de "0 superficie": la comprobé corriendo el
comando tal cual. Resultado — **StrykerJS sí generó mutantes reales sobre
`Hero.tsx`** (16, ninguno sobre texto/atributos JSX, todos sobre lógica
JS/TS legítima: las tres constantes de texto y los dos guardas
`telefono !== null` / `horario !== null` más el `.map` del horario). El
comentario de `stryker.config.json` sobre por qué `.tsx` queda fuera del
**glob por defecto** sigue siendo válido (evita que una corrida sin
`--mutate` explícito reporte "mutantes" fantasma sobre JSX que Stryker ni
siquiera toca) y la política del proyecto de no incluir `.tsx` en el
`mutate` por defecto sigue siendo correcta — pero **la medición explícita
que pide esta tarea sí tenía trabajo real que hacer**, y se hizo.

## Cómo se corrió (ficha de reproducción)

Verificado `tasklist` sin procesos `node.exe` antes de arrancar (ninguna
otra corrida de Stryker en paralelo sobre el repo). Un único fichero, una
única corrida:

```
pnpm exec stryker run --mutate src/components/Hero.tsx --plugins @stryker-mutator/vitest-runner
```

Columna `# timeout` leída **antes** que el score: **0**. Informe válido
(patrón `informe-de-mutacion-con-timeouts-miente`).

## Resultado

| Fichero | total | killed | survived | # timeout | # errors | score |
| --- | --- | --- | --- | --- | --- | --- |
| `src/components/Hero.tsx` | 16 | 16 | 0 | 0 | 0 | **100.00%** |

16/16 mutantes muertos, 0 supervivientes, 0 timeouts, 0 errores. Alcanza el
umbral `1.0` de `harness.config.json` sin necesidad de excluir ningún
mutante equivalente (no hubo ningún superviviente que justificar).

### Detalle de mutantes (leído directamente de `reports/mutation/mutation.json`, no solo del resumen `clear-text`)

| id | mutador | línea | reemplazo | estado | muerto por |
| --- | --- | --- | --- | --- | --- |
| 0 | StringLiteral | 27 | `""` (vacía `UBICACION`/titular auxiliar) | Killed | @s1/@s2 |
| 1 | StringLiteral | 28 | `""` | Killed | @s1/@s2 |
| 2 | StringLiteral | 30 | `""` (`TEXTO_DESCRIPTIVO` vaciado) | Killed | @s2/@s7/@s8 |
| 3 | BlockStatement | 36:39 | `{}` | Killed | @s3/@s4/@s5 |
| 4 | ConditionalExpression | 44:10 | `true` (guarda `telefono !== null` forzada) | Killed | @s9 |
| 5 | ConditionalExpression | 44:10 | `false` | Killed | @s4/@s5/@s11 |
| 6 | LogicalOperator | 44:10 | `!==` → `\|\|` en la guarda | Killed | @s9 |
| 7 | ConditionalExpression | 44:10 | `true` (variante) | Killed | @s9 |
| 8 | EqualityOperator | 44:10 | `!==` → `===` | Killed | @s4/@s9 |
| 9 | StringLiteral | 44:66 | `` `` `` (vacía el `` `Llamar ${telefono}` ``) | Killed | @s4/@s5 |
| 10 | ConditionalExpression | 46:8 | `true` (guarda `horario !== null` forzada) | Killed | @s10 |
| 11 | ConditionalExpression | 46:8 | `false` | Killed | @s6 |
| 12 | LogicalOperator | 46:8 | `!==` → `\|\|` en la guarda | Killed | @s10 |
| 13 | ConditionalExpression | 46:8 | `true` (variante) | Killed | @s10 |
| 14 | EqualityOperator | 46:8 | `!==` → `===` | Killed | @s6/@s10 |
| 15 | ArrowFunction | 48:24 | `tramo => undefined` (mapa de horario anulado) | Killed | @s6 |

Todos los mutantes de los guardas `telefono !== null` / `horario !== null`
(ids 4-14) mueren por los pares @s4/@s9 y @s6/@s10 respectivamente —
exactamente los escenarios que el propio `tdd_craftsman` diseñó en los
ciclos 9 y 10 (`progress/tdd_hero.md`) para distinguir "hay dato" de "la
fuente única no lo declara". Ninguno sobrevive.

## Mutantes equivalentes

Ninguno. 0 supervivientes que justificar o excluir.

## Verificaciones de entorno

- `tasklist` sin procesos `node.exe`/`stryker` antes de la única corrida de
  esta ronda.
- Columna `# timeout` = 0, leída antes que el score.
- `reports/mutation/mutation.json` y `reports/mutation/index.html`
  regenerados correctamente por esta corrida; detalle de mutantes leído
  directamente del JSON (no solo del resumen `clear-text`), tabla arriba.
- `src/lib/telefono.ts` y `src/lib/site.ts`: confirmado por fecha de
  modificación que no se tocaron en esta sesión de `hero` (ver sección de
  identificación de ficheros); su medición oficial sigue siendo la de
  `progress/mutation_datos_negocio.md` (ronda 2, 95/95 = 100% sobre
  no-equivalentes) y no se reabre en esta ronda por no haber cambiado.
- Ningún fichero de `src/` ni de test editado durante esta medición.

## Resumen para `craftsman_lead`

**PASS.** Único fichero de producción propio de esta feature,
`src/components/Hero.tsx`, sí tiene superficie mutable real más allá de
JSX (16 mutantes: 3 constantes de texto + 2 guardas de presencia con su
`.map`), contra lo que daba por hecho el checkpoint C7 de
`progress/judge_hero.md` ("superficie 0 esperada"). Medido explícitamente
con el workaround `--mutate src/components/Hero.tsx
--plugins @stryker-mutator/vitest-runner`: **16/16 killed, 0 supervivientes,
0 timeouts, 100.00%**, igual al umbral `1.0` de `harness.config.json`. No
hace falta excluir ningún mutante equivalente. `src/lib/telefono.ts` y
`src/lib/site.ts`, de los que `Hero.tsx` depende, no se tocaron en esta
sesión (confirmado por fecha) y mantienen su medición oficial ya al 100% de
`datos_negocio`. C7 queda satisfecho para `hero` (id 4); no quedan puertas
de mutación pendientes para esta feature.
