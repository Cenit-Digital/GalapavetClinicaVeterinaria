# Mutación — fidelidad_galeria (33)

Fichero medido: `src/components/Galeria-logica.ts` (único de la sección dentro
del glob mordible de `stryker.config.json`: `src/lib/**/*.ts` +
`src/**/*-logica.ts`; `Galeria.tsx` queda fuera por la limitación conocida de
StrykerJS con JSX, ver `_comment` de la config). Umbral: 100 %
(`stryker.config.json` → `thresholds.break`; `harness.config.json` →
`mutation.threshold` = 1.0).

## Medición 1 (craftsman_lead, 03/09/2026 ~20:0x) — FAIL

```
pnpm exec stryker run --mutate src/components/Galeria-logica.ts --testFiles src/components/Galeria-logica.test.ts --plugins @stryker-mutator/vitest-runner
```

**Columna `# timeout` leída antes que el score** (patrón
`informe-de-mutacion-con-timeouts-miente`): **0**, el informe valía.

| Fichero | Mutantes | Eliminados | Supervivientes | Timeouts | Puntuación |
| --- | ---: | ---: | ---: | ---: | ---: |
| `Galeria-logica.ts` | 31 | 28 | **3** | 0 | 90,32 % (umbral 100 %) |

Supervivientes leídos del JSON crudo de esa corrida
(`files['src/components/Galeria-logica.ts'].mutants`, agregado por `status`:
`{"Killed":28,"Survived":3}`):

| Mutante | Línea:col · mutador · sustitución | Por qué sobrevivía |
| --- | --- | --- |
| 25 | `77:7` ConditionalExpression `typeof consultarMedios !== 'function'` → `true` | `coveredBy: ["4","7"]`. Los dos únicos tests de `prefiereMenosMovimiento` esperaban `true` (el doble que empareja la consulta, y el `undefined` que falla cerrado). Un mutante que devuelve **siempre** `true` los pasa a los dos: faltaba el caso que devuelve `false`. |
| 28 | `77:34` StringLiteral `'function'` → `""` | Igual: `typeof x !== ""` es siempre cierto, y ningún test exigía un `false`. |
| 23 | `68:35` StringLiteral `'(prefers-reduced-motion: reduce)'` → `""` | `static: true`, `coveredBy: []`, `testsCompleted: 8`. Los 8 tests corrieron **y pasaron**: el mutante nunca llegó a activarse (ver causa raíz abajo). |

### Causa raíz del superviviente estático (23)

`CONSULTA_MENOS_MOVIMIENTO` es una constante de módulo: se evalúa al importar,
así que Stryker la marca `static: true`. En
`@stryker-mutator/core/.../mutant-test-planner.js`, un mutante estático con
`ignoreStatic: false` se planifica con `testFilter = globalTestFilter`, y ese
`globalTestFilter` **existe precisamente cuando se pasa `--testFiles`**; la
activación se decide con `mutantActivation: testFilter ? 'runtime' : 'static'`.
Con activación `'runtime'`, `stryker-setup.js` fija el mutante activo en un
`beforeAll`, o sea **con el módulo ya importado**: el literal vaciado no se
evalúa jamás y el mutante sobrevive aunque el test 4 (que ancla la consulta al
literal escrito a mano) lo detectaría si el módulo se hubiera evaluado con él.

Es coherente con `progress/mutation_galeria.md` (feature 8): aquella corrida
**sin** `--testFiles` sí lo mató, porque entonces la activación es `'static'` y
el módulo se carga ya mutado. El mismo diagnóstico, con la misma cita del
planificador, está en `progress/mutation_fidelidad_equipo.md` (medición 2), que
compartía 11 supervivientes de esta misma naturaleza.

## Medición 2 (tdd_craftsman, 03/09/2026 20:32) — PASS

```
pnpm exec stryker run --mutate src/components/Galeria-logica.ts --testFiles src/components/Galeria-logica.test.ts --plugins @stryker-mutator/vitest-runner
```

**Columna `# timeout` leída ANTES que el score: 0.** El informe vale; no hay
que repetir la corrida.

| Fichero | Mutantes | Eliminados | Supervivientes | Timeouts | Puntuación |
| --- | ---: | ---: | ---: | ---: | ---: |
| `Galeria-logica.ts` | 31 | **31** | **0** | **0** | **100,00 %** (umbral 100 %) |

Duración 2 min 35 s, `concurrency: 1`, exit 0 («Final mutation score of 100.00
is greater than or equal to break threshold 100»).

**Verificación independiente del JSON crudo**, agregando
`files['src/components/Galeria-logica.ts'].mutants` por `status`:

```
{"Killed":31}   total 31   score 100.00
mutados: ['src/components/Galeria-logica.ts']   testFiles: ['src/components/Galeria-logica.test.ts']
```

Sin `Survived`, `Timeout`, `NoCoverage` ni `RuntimeError` en el objeto.

### Trazabilidad de los tres supervivientes

| Mutante | Test que lo mata (id en el JSON) |
| --- | --- |
| 25 `77:7` → `true` | `killedBy: ["8"]` — *«con una consulta disponible que NO empareja, respeta al sistema y devuelve `false`: no cae al valor seguro»* |
| 28 `77:34` `'function'` → `""` | `killedBy: ["8"]` — el mismo test: si la guarda se cumple siempre, la función devolvería `true` donde se exige `false` |
| 23 `68:35` → `""` (estático) | `killedBy: ["9"]` — *«pregunta al sistema exactamente por "(prefers-reduced-motion: reduce)"»*, que re-evalúa el módulo con `vi.resetModules()` + `import()` dinámico dentro del cuerpo del test (patrón de `src/lib/site.reimportacion.test.ts`) y afirma la consulta **recogida por el doble**, tecleada a mano, no la constante importada |

De regalo, el mismo test 8 cubre los mutantes vecinos `26` (`false`), `27`
(`EqualityOperator`) y `29` (`BlockStatement`), que ya morían antes.

Ningún mutante de este fichero resultó equivalente: los tres se mataron con
tests, sin tocar producción. `Galeria-logica.ts` no se ha modificado en esta
sesión.

## Incidencia de concurrencia (documentada, no oculta)

La primera corrida de esta medición 2 (20:27:08–20:29:06, 31/31, 0 timeouts)
se solapó con **otra corrida de Stryker lanzada por otro agente** sobre
`src/components/CampanasPortada-logica.ts` (PID 42556, creada a las 20:27:41),
que sobrescribió `reports/mutation/mutation.json` a las 20:29:18 con su propio
informe. Eso impedía la verificación independiente del JSON crudo, que este
repo exige además del resumen `clear-text`.

Actuación: **no** se lanzó nada en paralelo. Se esperó a que no quedara ningún
proceso `node.exe` con `stryker` en su línea de comandos
(`Get-CimInstance Win32_Process` → 0) y se repitió la corrida entera a las
20:30:09–20:32:44, copiando el JSON a un directorio propio nada más terminar.
Los números de la tabla de arriba son los de **esa segunda corrida limpia**,
sin ninguna otra de Stryker activa. La primera dio exactamente lo mismo
(31 muertos, 0 supervivientes, 0 timeouts), así que el solape no alteró el
resultado, solo el artefacto.

## Tests añadidos a `src/components/Galeria-logica.test.ts`

- *«con una consulta disponible que NO empareja, respeta al sistema y devuelve
  `false`: no cae al valor seguro»* — el doble devuelve `{ matches: false }`.
  Cierra el hueco de contrato real: hasta ahora la suite no exigía en ningún
  sitio que la función pudiera devolver `false`, y el caso de @s7 («respeta
  `prefers-reduced-motion`») necesita las dos respuestas, no solo el fallo
  cerrado de @s8.
- *«pregunta al sistema exactamente por "(prefers-reduced-motion: reduce)"»* —
  el doble apunta las consultas recibidas y el test las compara con el literal
  tecleado a mano; el módulo se re-importa dentro del test para que la
  constante se evalúe con el mutante activo. Comprobado (aserción temporal,
  verde y retirada antes de medir) que `vi.resetModules()` + `import()` crea de
  verdad otra instancia del módulo.

Ambos anclados al literal, nunca al símbolo importado (patrón
`doble-de-test-anclado-al-literal-no-al-simbolo`, `feature_list.json` →
`rules.notas`).

## Puertas verdes

- `pnpm exec vitest run src/components/Equipo-logica.test.ts src/components/Galeria-logica.test.ts` → **47/47**.
- `pnpm exec vitest run src/components/Equipo.test.tsx src/components/Galeria.test.tsx` → **59/59**.
- `pnpm run typecheck` (`tsc -b`) → exit 0; `pnpm exec oxlint --deny-warnings` sobre los ficheros tocados → exit 0.
- No se ejecutó `bin/harness init` completo: el árbol de trabajo tiene cambios
  a medias de otros artesanos en otras secciones y su resultado no sería
  atribuible a este encargo (que era, por mandato, «solo tests»).
