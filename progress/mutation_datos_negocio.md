# Mutación — feature `datos_negocio` (id 2) — ronda 2 (re-medición tras aprobación del `judge`)

**Contexto:** ronda 1 (`FAIL`, 86/96 = 89.58%, 9 supervivientes reales + 1
equivalente) generó correcciones R1-R6 en `tdd_craftsman`
(`progress/tdd_datos_negocio.md`), revisadas y aprobadas por `judge`
(`progress/judge_datos_negocio.md`, veredicto `APPROVED`, C7 delegado
explícitamente a esta re-medición oficial). Esta es esa re-medición
independiente.

**Veredicto:** **PASS**

**Score agregado (killed/total):** 95/96 = 98.96%
**Score sobre mutantes no equivalentes (excluye el único equivalente verificado):** 95/95 = **100.00%** (umbral: 100% / `1.0`)
**Timeouts en las tres corridas válidas: 0** (columna `# timeout` leída antes que el score en las tres, patrón `informe-de-mutacion-con-timeouts-miente`; ver detalle de la corrida doble de `site.ts` más abajo).

## Alcance

Mismos tres módulos que la ronda 1 (`progress/tdd_datos_negocio.md`, "Diseño
de módulos"):

- `src/lib/telefono.ts`
- `src/lib/site.ts`
- `src/lib/puertaTelefonoHardcodeado.ts`

## Comando usado

Workaround ya validado (ronda 1, `docs/mutation-testing.md`), un fichero a la
vez, `concurrency: 1` (fijado en `stryker.config.json`), nunca dos corridas de
Stryker a la vez sobre el repo (confirmado con `tasklist` antes de cada
arranque: cero procesos `node.exe` antes de lanzar cada uno de los tres):

```
pnpm exec stryker run --mutate src/lib/telefono.ts --plugins @stryker-mutator/vitest-runner
pnpm exec stryker run --mutate src/lib/site.ts --plugins @stryker-mutator/vitest-runner
pnpm exec stryker run --mutate src/lib/puertaTelefonoHardcodeado.ts --plugins @stryker-mutator/vitest-runner
```

**Incidente propio de esta corrida, sin impacto en el veredicto:** el primer
intento de `site.ts` se lanzó con `--reporters json --reporters clear-text
--reporters progress` añadidos a mayores (para intentar capturar el JSON en
un fichero de log aparte). Yargs no acumula flags `--reporters` repetidos:
solo sobrevivió el último (`progress`), así que ese intento **no regeneró**
`reports/mutation/mutation.json` (quedó con los datos de `telefono.ts`) ni
imprimió la tabla `clear-text`. Sí llegué a ver en el log de ese intento la
línea final `Final mutation score of 100.00 is greater than or equal to break
threshold 100` y la columna de progreso `(0 survived, 0 timed out)` en el
100% de las líneas — un primer dato de 100.00%/0 timeouts, pero sin JSON
verificable. Repetido inmediatamente con el comando exacto validado (sin
flags añadidos): segunda corrida completa, con tabla `clear-text` y
`mutation.json` regenerado correctamente, mismo resultado — **100.00%, 0
timeouts** — confirmando estabilidad con dos corridas independientes en vez
de una. La medición oficial de este informe usa el `mutation.json` de esa
segunda corrida (la única con reporte JSON válido).

## Resultados por módulo

| Módulo | total | killed | survived | timeout | errors | score |
| --- | --- | --- | --- | --- | --- | --- |
| `src/lib/telefono.ts` | 37 | 36 | 1 | 0 | 0 | 97.30% |
| `src/lib/site.ts` | 37 | 37 | 0 | 0 | 0 | **100.00%** |
| `src/lib/puertaTelefonoHardcodeado.ts` | 22 | 22 | 0 | 0 | 0 | **100.00%** |
| **Total** | **96** | **95** | **1** | **0** | **0** | **98.96%** (100.00% excluyendo el equivalente) |

Los tres módulos alcanzan o superan el umbral `1.0` (100%) declarado en
`harness.config.json` -> `mutation.threshold`, una vez excluido el único
mutante equivalente verificado (abajo). La feature puede cerrarse en lo que a
C7 respecta.

## Mutante equivalente (heredado de la ronda 1, citado sin reverificar)

- **`src/lib/telefono.ts:13`** — `valor.replace(/\s+/g, '')` -> `valor.replace(/\s/g, '')` (mutador `Regex`).
  **Justificación de equivalencia (ronda 1, sin cambios):** al sustituir
  siempre por cadena vacía `''`, reemplazar cada carácter de espacio
  individualmente (`/\s/g`) o cada tramo contiguo de espacios (`/\s+/g`)
  produce exactamente la misma cadena resultante para cualquier entrada — no
  hay ninguna entrada observable que distinga ambas versiones. Verificado
  computacionalmente en la ronda 1: casos borde a mano (cadena vacía, un
  espacio, tabulaciones, saltos de línea, mezcla de separadores) más 100 000
  cadenas aleatorias generadas con el alfabeto
  `a,b,c,espacio,tab,salto de línea,retorno de carro,1,2`, comparando
  `s.replace(/\s+/g,'') === s.replace(/\s/g,'')` para todas — 0 diferencias.
  **No se reverifica en esta ronda** (instrucción explícita de la tarea): el
  código de `telefono.ts:13` no cambió entre rondas (confirmado — ningún
  módulo de producción se tocó en R1-R6, ver `progress/tdd_datos_negocio.md`
  y `progress/judge_datos_negocio.md`, sección "Calidad"), así que el
  análisis de equivalencia sigue siendo válido sin repetir el trabajo. Esta
  corrida lo confirma como el único superviviente de `telefono.ts` (idéntica
  ubicación, idéntico mutador, idéntico diff), consistente con la ronda 1.

  Detalle capturado en esta corrida (idéntico al de la ronda 1):
  ```
  [Survived] Regex
  src/lib/telefono.ts:13:24
  -     return valor.replace(/\s+/g, '')
  +     return valor.replace(/\s/g, '')
  Ran all tests for this mutant.
  ```

## Verificación específica: mutantes estáticos de `site.ts:10-12` — ¿cobertura real de Stryker o solo verificación manual?

Este era el punto crítico dejado abierto por la ronda 1: los tres mutantes de
`TELEFONO_CLINICA` / `TELEFONO_MOVIL` / `TELEFONO_URGENCIAS` vaciados
(`site.ts:10-12`) sobrevivían con `testsCompleted: 0`, `coveredBy: []` —
Stryker no lograba atribuirlos a ningún test, pese a que la suite sí los
detectaba en la práctica. `tdd_craftsman` diagnosticó la causa (import
estático de cabecera en `site.test.tsx` tumbaba el fichero completo antes de
que arrancara ningún `it()`) y la resolvió con un fichero nuevo,
`src/lib/site.reimportacion.test.ts`, que evalúa `site.ts` mediante
`vi.resetModules()` + `import()` dinámico **dentro** del cuerpo del `it()`.

Leído directamente `reports/mutation/mutation.json` de la segunda corrida de
`site.ts` (no me fío del resumen de `clear-text` ni de la bitácora de
`tdd_craftsman` para este punto concreto):

```json
{"id":"0","line":10,"mutatorName":"StringLiteral","status":"Killed","static":true,"testsCompleted":1,"coveredBy":["14"],"killedBy":["14"]}
{"id":"1","line":11,"mutatorName":"StringLiteral","status":"Killed","static":true,"testsCompleted":1,"coveredBy":["14"],"killedBy":["14"]}
{"id":"2","line":12,"mutatorName":"StringLiteral","status":"Killed","static":true,"testsCompleted":1,"coveredBy":["14"],"killedBy":["14"]}
```

Y cruzando el id de test `"14"` contra `report.testFiles`:

```json
"src/lib/site.reimportacion.test.ts": { "tests": [
  {"id":"14","name":"refuerzo mutación: los tres teléfonos reales siguen
   siendo el dato real al importar site.ts el texto visible de
   telefonoClinica, telefonoMovil y telefonoUrgencias es el dato real del
   cliente"}
]}
```

**Confirmado: `testsCompleted` pasó de `0` (ronda 1) a `1` (ronda 2) en los
tres mutantes**, y `coveredBy`/`killedBy` apuntan de forma inequívoca al test
nuevo de `site.reimportacion.test.ts`. Esto es cobertura real atribuida por
la propia herramienta, no una inferencia mía ni una verificación manual como
en la ronda 1 — el diagnóstico de `tdd_craftsman` (aislar el `import`
dinámico fuera de cualquier import estático de `./site` en ese fichero) queda
demostrado con el dato crudo del reporte, no solo con su razonamiento. Los 37
mutantes de `site.ts` (incluidos estos 3) son ahora `Killed`, `0 no cov`, `0
survived` en la tabla `clear-text`.

## Los 9 supervivientes reales de la ronda 1: confirmados muertos

Los 9 mutantes que la ronda 1 reportó como supervivientes genuinos (huecos de
aserción, no defectos de comportamiento — ver detalle completo en el informe
de la ronda 1 conservado en `progress/tdd_datos_negocio.md` y
`progress/judge_datos_negocio.md`) quedan todos `Killed` en esta corrida:

| # | Ubicación | Mutador | Test que lo mata (ronda 2) |
| --- | --- | --- | --- |
| 1 | `telefono.ts:16` (`errorTelefonoNoValido` vaciado) | `BlockStatement` | `telefono.test.ts` — refuerzo R1, `instanceof Error` |
| 2-4 | `site.ts:10-12` (constantes de teléfono vaciadas) | `StringLiteral` | `site.reimportacion.test.ts` — ver sección anterior |
| 5 | `site.ts:22` (condición del `rotulo` anulada) | `ConditionalExpression` | `site.test.tsx` — refuerzo R2, `'rotulo' in telefonoClinica` |
| 6-8 | `puertaTelefonoHardcodeado.ts:55` (campo `pasa` nunca verificado / siempre `true` / siempre `false`) | `ConditionalExpression` × 2, `EqualityOperator` | `puertaTelefonoHardcodeado.test.ts` — refuerzo R3 (`pasa===false` con hallazgos reales) + refuerzo R4 (`pasa===true` con 0 hallazgos, fichero sintético) |
| 9 | `puertaTelefonoHardcodeado.ts:30` (patrón pierde la bandera `g`) | `StringLiteral` | `puertaTelefonoHardcodeado.test.ts` — refuerzo R5, `toHaveLength(3)` |

No aparece ningún mutante nuevo por los tests añadidos en R1-R6 (37 + 37 + 22
= 96 mutantes totales, idéntico recuento a la ronda 1 — ninguna producción
cambió, solo se añadieron tests).

## Verificaciones de entorno

- `tasklist` sin procesos `node.exe` antes de cada uno de los tres arranques
  (y antes del segundo intento de `site.ts`): nunca dos Stryker a la vez.
- Columna `# timeout` = 0 en las tres corridas válidas (y en el intento
  descartado de `site.ts` por el fallo de reporters, también 0 — coherente).
- `reports/mutation/mutation.json` y `reports/mutation/index.html`
  regenerados correctamente para las corridas finales de `site.ts` (segundo
  intento) y `puertaTelefonoHardcodeado.ts`; el de `telefono.ts` se generó
  limpio en el primer intento.

## Resumen para `craftsman_lead`

**PASS.** Los 9 mutantes reales de la ronda 1 quedan muertos, confirmado con
Stryker vuelto a correr desde cero, no solo con la remedición que el propio
`tdd_craftsman` ya había documentado. El punto más delicado — si los tres
mutantes estáticos de `site.ts:10-12` tenían cobertura real atribuida por la
herramienta o seguían dependiendo de una verificación manual — queda resuelto
a favor de la herramienta: `testsCompleted: 1` y `coveredBy`/`killedBy`
apuntando al test nuevo, leído directamente de `mutation.json`. El único
superviviente de las tres corridas es el mutante equivalente ya verificado en
la ronda 1 (`telefono.ts:13`), citado aquí sin reverificar porque el código
de esa línea no cambió. Score sobre mutantes no equivalentes: **95/95 =
100%**, igual o por encima del umbral `1.0` de `harness.config.json`. C7
queda satisfecho; no quedan puertas de mutación pendientes para
`datos_negocio` (id 2).
