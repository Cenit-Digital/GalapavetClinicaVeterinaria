# Mutación — feature `pie_de_pagina` (id 13)

**Contexto:** medición tras `progress/judge_pie_de_pagina.md` (ronda 1),
veredicto **APPROVED**, "Cambios requeridos: Ninguno".

**Veredicto:** **PASS**

**Score:** 21/21 = **100.00%** (umbral: `1.0` en `harness.config.json` →
`mutation.threshold`; `stryker.config.json` → `thresholds.break = 100`)

**Timeouts: 0.** Columna `# timeout` leída antes que el score (patrón
`informe-de-mutacion-con-timeouts-miente`, recordado en el
`_comment_concurrency` de `stryker.config.json`): 0 en la única corrida — no
hizo falta repetir a `--concurrency 1` (además `stryker.config.json` ya trae
`"concurrency": 1` por defecto en todo el proyecto). Confirmado también
contra `reports/mutation/mutation.json`: el único `status` presente en el
objeto agregado es `Killed` (21) — ni `Timeout`, ni `NoCoverage`, ni
`RuntimeError`, ni `Survived` aparecen.

## Alcance — por qué un solo fichero

Ficheros de producción listados en `progress/tdd_pie_de_pagina.md` §
"Entregables":

- `src/components/PieDePagina-logica.ts` — módulo puro (`construirEnlacesLegales`,
  `textoCopyright`, `nombreEnlaceUrgencias` privada, `construirEnlacesContacto`).
- `src/components/PieDePagina.tsx` — solo cablea (presentación).
- `src/data/pieDePaginaEnlaces.ts` — catálogo readonly (`ENLACES_CLINICA`,
  `ENLACES_CONTENIDO`).
- `src/data/paginasLegales.ts` — catálogo readonly (`PAGINAS_LEGALES`).

Contrastados contra el glob mordible declarado en `stryker.config.json`:

```
"mutate": [
  "src/lib/**/*.ts",
  "src/**/*-logica.ts",
  "!src/**/*.test.ts",
  "!src/**/*.test.tsx",
  "!src/**/*.d.ts"
]
```

Solo `src/components/PieDePagina-logica.ts` cae dentro (coincide con
`src/**/*-logica.ts`). `PieDePagina.tsx` queda fuera a propósito (comentario
de cabecera de `stryker.config.json`: los `.tsx` solo cablean presentación,
StrykerJS no muta JSX de forma fiable — issue `stryker-mutator/stryker-js#4375`).
`src/data/pieDePaginaEnlaces.ts` y `src/data/paginasLegales.ts` tampoco caen
en el glob: viven bajo `src/data/`, no `src/lib/`, y ninguno de los dos
nombres de fichero termina en `-logica.ts`. Mismo criterio ya aplicado y
aprobado en `servicios.ts`/`equipo.ts`/`navegacion.ts`/`galeria.ts`/`campanas.ts`
en features previas: los catálogos de datos quedan fuera de la superficie
mordible por diseño, no por descuido.

Por tanto la superficie mutable real de esta feature es en su totalidad
`src/components/PieDePagina-logica.ts`, y basta una sola corrida de Stryker.

## Comando usado

`bin/harness mutate src/components/PieDePagina-logica.ts` reprodujo el fallo
de entorno ya documentado en rondas previas (`progress/mutation_tokens_marca.md`,
`progress/mutation_datos_negocio.md`, `progress/mutation_faq.md`, entre
otras): Stryker no resuelve el plugin `@stryker-mutator/vitest-runner` vía el
glob por defecto pese a estar instalado en `node_modules/@stryker-mutator/vitest-runner`
(mensaje: `Cannot find TestRunner plugin "vitest". In fact, no TestRunner
plugins were loaded.`). Repetido con el workaround ya validado, plugin
explícito, un único fichero, sin corridas de Stryker concurrentes:

```
pnpm exec stryker run --mutate src/components/PieDePagina-logica.ts --plugins @stryker-mutator/vitest-runner
```

## Resultado

```
-----------------------|------------------|----------|-----------|------------|----------|----------|
                       | % Mutation score |          |           |            |          |          |
File                   |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
-----------------------|--------|---------|----------|-----------|------------|----------|----------|
All files              | 100.00 |  100.00 |       21 |         0 |          0 |        0 |        0 |
 PieDePagina-logica.ts | 100.00 |  100.00 |       21 |         0 |          0 |        0 |        0 |
-----------------------|--------|---------|----------|-----------|------------|----------|----------|
Final mutation score of 100.00 is greater than or equal to break threshold 100
```

21 mutantes generados sobre `PieDePagina-logica.ts` (comparaciones,
booleanos, literales de cadena — `SUFIJO_VENTANA_NUEVA`, `SEPARADOR_ROTULO`,
`NOMBRE_COMO_LLEGAR`, `DESTINO_COMO_LLEGAR`, etc.), los 21 muertos. Ninguno
sobrevivió, ninguno hizo timeout, ninguno quedó sin cobertura. Cruzado contra
`reports/mutation/mutation.json` (leído directamente, no solo el resumen de
consola): el único `status` presente en los 21 mutantes es `Killed`.

Tests que matan cada rama, según el detalle de Stryker (`~`/`✓` por test):
- `nombreEnlaceUrgencias` (rama con/sin rótulo): matado tanto por
  `PieDePagina-logica.test.ts` (@s12/@s13 + el test de refuerzo sobre la
  rama sin rótulo) como por `PieDePagina.test.tsx` (@s6).
- `textoCopyright`: matado por los tests de lógica pura de @s12/@s13
  (`PieDePagina-logica.test.ts`) — exactamente lo que pedía el propio
  Gherkin ("se calcula el texto... para esa fecha", cobertura a nivel de
  función, no solo de render).
- `construirEnlacesLegales` (sufijo de nombre, `target`/`rel`): matado por
  @s9/@s10.
- `construirEnlacesContacto` (rótulo de urgencias, teléfonos, "Cómo llegar"):
  matado por @s5/@s6.

## Mutantes sobrevivientes

Ninguno. Score 100% real, no hay nada que excluir por equivalencia.

## Verificación cruzada

- `reports/mutation/mutation.json`: `files["src/components/PieDePagina-logica.ts"].mutants`
  — 21 entradas, `status: "Killed"` en las 21, sin ninguna `"Survived"`,
  `"Timeout"`, `"NoCoverage"` ni `"RuntimeError"`.
- Corrida única de Stryker (no hubo ninguna otra activa en paralelo sobre
  este repo durante esta medición).
- `stryker.config.json` ya trae `"concurrency": 1` a nivel de proyecto, así
  que no hizo falta forzarlo por flag: la corrida ya cumplía la condición
  antes incluso de leer la columna `# timeout`.

## Conclusión

**PASS.** 21/21 = 100% ≥ umbral 100% (`harness.config.json` →
`mutation.threshold: 1.0`). Feature `pie_de_pagina` (id 13) supera la puerta
de mutación; queda pendiente solo que el `craftsman_lead` marque `done` en
`feature_list.json` tras leer este informe y `progress/judge_pie_de_pagina.md`
completos.
