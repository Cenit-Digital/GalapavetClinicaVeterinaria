# Mutación — feature `servicios` (id 5)

**Contexto:** medición tras `progress/judge_servicios.md` (veredicto `APPROVED`
en ronda 2, único hallazgo de ronda 1 — atributos `id`/`aria-labelledby`
sin test — ya resuelto). El propio `judge` delega C7 a esta medición,
dejando fijado el alcance: único fichero dentro del glob mordible de
`stryker.config.json` (`src/**/*-logica.ts`) para esta feature es
`src/components/Servicios-logica.ts` (`Servicios.tsx` queda fuera por
diseño: StrykerJS no muta JSX de forma fiable, mismo criterio que
`Hero.tsx`/`Cabecera.tsx`).

**Veredicto:** **PASS**

**Score:** 21/21 = **100.00%** (umbral: `1.0` en `harness.config.json` →
`mutation.threshold`; `stryker.config.json` → `thresholds.break = 100`)

**Timeouts: 0.** Columna `# timeout` leída antes que el score, patrón
`informe-de-mutacion-con-timeouts-miente`: 0 en la única corrida (no hizo
falta repetir, la instrucción de repetir aplica solo si la columna no es 0).

## Alcance

Confirmado leyendo `progress/tdd_servicios.md` §"Diseño de la solución" y
§"Entregables": el único módulo de lógica pura de esta feature es
`src/components/Servicios-logica.ts` (`rotuloBoton`, `puntosVisibles`,
`tieneDesglose`, `nombreAccesibleBoton`). `src/data/servicios.ts` es
catálogo estático sin lógica (mismo patrón que `src/data/navegacion.ts`,
fuera del glob mordible salvo que contuviera código, que no es el caso) y
`src/components/Servicios.tsx` es cableado JSX, excluido del glob por
diseño (comentario `_comment` de `stryker.config.json`).

## Verificación de entorno previa

- `tasklist` (vía Bash) mostró varios `node.exe` en ejecución, pero
  `Get-Process -Name node` desde PowerShell —consulta directa al sistema,
  sin pasar por el wrapper de `tasklist`/WMI que en esta máquina no
  devolvió línea de comandos— reportó **"No se encuentra ningún proceso con
  el nombre node"**, es decir, **0 procesos Node activos** en el momento de
  arrancar. Se tomó esa consulta como la autoridad (más directa) antes de
  lanzar Stryker: ninguna otra corrida de Stryker en curso sobre el repo.
- `node .harness/harness.mjs init` antes de medir: **verde** — lint,
  typecheck y **121/121** tests (Node v22.15.0), mismo recuento que cerró
  la ronda 2 del `judge`. Ninguna producción tocada desde esa aprobación.

## Comando usado

Workaround ya validado en sesiones anteriores de este proyecto
(`progress/mutation_tokens_marca.md`, `progress/mutation_datos_negocio.md`,
sección "Comando usado"): `bin/harness mutate` invoca
`pnpm exec stryker run --mutate {{target}}` tal cual declara
`harness.config.json`, pero Stryker no resuelve el plugin
`@stryker-mutator/vitest-runner` vía el glob por defecto en esta máquina.
Se usó directamente, un solo fichero, sin ninguna otra corrida de Stryker en
paralelo:

```
pnpm exec stryker run --mutate src/components/Servicios-logica.ts --plugins @stryker-mutator/vitest-runner
```

No se tocó ningún fichero de configuración para esto.

## Resultado

```
---------------------|------------------|----------|-----------|------------|----------|----------|
                     | % Mutation score |          |           |            |          |          |
File                 |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
---------------------|--------|---------|----------|-----------|------------|----------|----------|
All files            | 100.00 |  100.00 |       21 |         0 |          0 |        0 |        0 |
 Servicios-logica.ts | 100.00 |  100.00 |       21 |         0 |          0 |        0 |        0 |
---------------------|--------|---------|----------|-----------|------------|----------|----------|
Final mutation score of 100.00 is greater than or equal to break threshold 100
```

Verificado además leyendo `reports/mutation/mutation.json` directamente
(no solo el resumen `clear-text`), agregando por `status` sobre los 21
mutantes del fichero:

| status | recuento |
| --- | --- |
| Killed | 21 |
| Survived | 0 |
| Timeout | 0 |
| NoCoverage | 0 |
| RuntimeError | 0 |

21/21 mutantes generados, uno por cada rama/operador/literal de las 4
funciones del módulo (`BlockStatement`, `ConditionalExpression`,
`EqualityOperator`, `StringLiteral`, `MethodExpression`, `ArrowFunction`
sobre las líneas 7, 10-12, 18-19, 23-24, 33-34), todos `Killed`. Ninguno
`Survived`, ninguno `Timeout`, ninguno sin cobertura, ningún error de
ejecución.

## Mutantes supervivientes

**Ninguno.** No hay mutante que justificar como equivalente ni ningún hueco
de aserción que reportar al `tdd_craftsman`.

## Conclusión

`src/components/Servicios-logica.ts` — único fichero de la feature
`servicios` (id 5) dentro del glob mordible de `stryker.config.json` —
alcanza 21/21 = 100.00% de mutación, con 0 timeouts confirmados antes de
leer el score y verificados de forma independiente contra el JSON crudo del
reporte. Igual al umbral `1.0` de `harness.config.json` →
`mutation.threshold`. C7 queda satisfecho. No se editó ningún fichero de
`src/` ni de test durante esta medición.

**Para `craftsman_lead`:** con `judge` `APPROVED` (ronda 2) y esta mutación
en `PASS`, la feature `servicios` (id 5) cumple los requisitos para
marcarse `done` en `feature_list.json` (decisión que corresponde al
`craftsman_lead`, no a este rol).
