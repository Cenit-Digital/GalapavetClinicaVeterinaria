# Review — feature 3 (cabecera_y_navegacion)

**Veredicto:** APPROVED

Ronda revisada: 3 (`progress/tdd_cabecera_y_navegacion.md`, Ciclo 17 —
corrección puntual tras `progress/mutation_cabecera_y_navegacion.md` FAIL:
14/16 = 87.50% sobre mutantes no equivalentes, 2 huecos reales en `esAncla`,
líneas 33-34 de `Cabecera-logica.ts`). El diseño y la cobertura de los 15
escenarios ya quedaron aprobados en la ronda 2 (`APPROVED`, ver historial más
abajo); esta ronda solo añade 2 tests unitarios directos sobre `esAncla` en
`src/components/Cabecera-logica.test.ts`. No repito mecánicamente la ronda 2:
releo el diff real, verifico de forma independiente (no me fío del informe
del `tdd_craftsman`) que los dos tests nuevos matan los dos mutantes exactos
que el `mutation_tester` documentó, y recorro de nuevo los dos patrones de
riesgo señalados por `craftsman_lead` sobre el fichero completo.

## Diff real de esta ronda

Único fichero tocado: `src/components/Cabecera-logica.test.ts` (+20 líneas,
un nuevo `describe`). `src/components/Cabecera.tsx`, `Cabecera-logica.ts` y
`src/data/navegacion.ts` — sin cambios, confirmado leyéndolos íntegros contra
lo que documentó la ronda 2. `git status --porcelain -- src/components
src/data` solo muestra los directorios como no trackeados en bloque (no hay
baseline de git dentro de esta sesión), consistente con "primeros ficheros
del proyecto" ya anotado en rondas previas.

## Cobertura de escenarios (@s ↔ test)

Sin cambios respecto a la ronda 2 — **15/15 siguen cubiertos**, ningún `@s`
nuevo ni perdido. El código nuevo de esta ronda (`esAncla('#servicios')`,
`esAncla('/tienda')`, `esAncla('tienda#')`) es test unitario de refuerzo de
mutación sobre una función pura ya usada por @s9/@s10, no un escenario nuevo
del `.feature` — correctamente no se le asigna una etiqueta `@s` propia, y el
`tdd_craftsman` no la inventa.

- @s1..@s15: [x] — mapa sin cambios, ver `progress/tdd_cabecera_y_navegacion.md`
  sección "Trazabilidad" y la revisión línea a línea ya hecha en la ronda 2
  (`Cabecera.test.tsx:33-237` + `Cabecera-logica.test.ts:4-8`).

## Disciplina TDD (Ciclo 17)

- ¿Producción sin test que la pida? **NO.** `src/components/Cabecera.tsx`,
  `Cabecera-logica.ts` y `src/data/navegacion.ts` están byte a byte igual que
  en la ronda 2 (releídos completos, comparados contra las citas de línea del
  informe de mutación y de `progress/judge_cabecera_y_navegacion.md` ronda 2).
  El único cambio es de test — Ley 3 respetada.
- ¿Evidencia de Rojo→Verde→Refactor? **SÍ, con verificación independiente
  propia, no solo leída en la bitácora.** El ciclo pasó "verde a la primera"
  (comportamiento correcto ya existía) y el `tdd_craftsman` lo contrastó
  reproduciendo a mano los dos mutantes exactos del informe de Stryker. Repetí
  esa verificación yo mismo, sin fiarme del relato:
  1. Mutado a mano `Cabecera-logica.ts:34` de `return destino.startsWith('#')`
     a `return destino.endsWith('#')` (mutante `MethodExpression`, id 15) →
     corrida aislada `pnpm exec vitest run src/components/Cabecera-logica.test.ts
     -t "esAncla"` → **2 failed** de 2, con los mensajes de assertion
     exactos que documenta el ciclo 17 (`expected false to be true` /
     `expected true to be false`).
  2. Revertido. Mutado a mano el cuerpo de `esAncla` a vacío (mutante
     `BlockStatement`, id 14, la función devuelve `undefined`) → misma corrida
     aislada → **2 failed** de 2 (`expected undefined to be true` /
     `expected undefined to be false`).
  3. Revertido a la versión original. `diff` byte a byte contra la copia
     leída al inicio de esta revisión: **idéntico**, sin residuo.
  4. Suite completa tras el revert final: `pnpm exec vitest run` →
     **84/84 verdes**. `pnpm run lint && pnpm run typecheck`: sin avisos.

  Los dos mutantes reales que hizo sobrevivir la ronda de mutación anterior
  quedan matados por los dos tests nuevos — no es una afirmación del
  `tdd_craftsman` que este `judge` da por buena sin más, está reproducida.

## Patrón `doble-de-test-anclado-al-literal-no-al-simbolo`: sin violaciones

Revisado el fichero completo (no solo el diff), porque el patrón es sobre el
uso de un símbolo importado en cualquier aserción, no solo en la línea
tocada:

- `Cabecera-logica.test.ts:6-7` (@s1, sin cambios) — `PUNTO_DE_CORTE_NAVEGACION_PX`
  comparado contra los literales `1024`/`1120`. Es el test de definición del
  propio símbolo: comparar la constante consigo misma sería absurdo aquí, y
  no es lo que hace — compara contra literales escritos a mano. Correcto.
- `Cabecera-logica.test.ts:23,27-28` (**nuevo, Ciclo 17**) —
  `expect(esAncla('#servicios')).toBe(true)`,
  `expect(esAncla('/tienda')).toBe(false)`,
  `expect(esAncla('tienda#')).toBe(false)`. `esAncla` es la función bajo
  prueba (no un doble ni una constante de datos); los valores esperados
  (`true`/`false`) son literales booleanos escritos a mano, no reimportados
  de ningún módulo de producción. Sin violación.
- `Cabecera.test.tsx` — sin cambios en esta ronda; ya verificado en ronda 2
  que `PUNTO_DE_CORTE_NAVEGACION_PX` solo se usa como **entrada** (`ancho:
  PUNTO_DE_CORTE_NAVEGACION_PX [- 1]`), nunca como valor esperado, y que
  `NOMBRES_EN_ORDEN`/`DESTINOS_EN_ORDEN` son literales a mano. Releído de
  nuevo línea a línea en esta ronda (líneas 1-238): sigue así, ningún import
  nuevo de `ENLACES_NAVEGACION` ni de `datosNegocio` para comparar contra sí
  mismos.

## Patrón `verde-por-vacuidad-en-puerta-de-verificacion`: sin violaciones

Los dos tests nuevos del Ciclo 17 no son guardas de ausencia (no verifican
"la lista está vacía" ni "el elemento no existe"): son igualdades estrictas
(`toBe`) sobre el valor de retorno de una función pura con dominio de entrada
totalmente determinado por el literal pasado en la misma línea — no hay
ninguna colección que pueda colapsar a vacía y hacer pasar la aserción por
descarte. Confirmado empíricamente arriba: bajo los dos mutantes reales
(`endsWith` y cuerpo vacío) ambos tests fallan de verdad, así que no hay
vacuidad oculta.

Los cinco puntos de riesgo ya identificados en `Cabecera.test.tsx` en la
ronda 2 (`:25` filter, `:89` toHaveLength(0), `:113` every, `:183`
ternario del panel, `:211` bucle for..of) no cambian en esta ronda —
releídos de nuevo, siguen sin tocarse y siguen operando sobre conjuntos de
partida no vacíos verificados, tal como documentó la ronda 2.

## Calidad (lente de artesano)

### `src/components/Cabecera-logica.test.ts` (único fichero tocado)
El nuevo `describe` (líneas 11-30) tiene un comentario que explica el
**porqué** no obvio (qué informe de mutación lo motivó, por qué la cobertura
indirecta vía `Cabecera.tsx` no bastaba), nombra los dos casos con precisión
("un destino que NO empieza por '#' no es ancla, aunque termine en '#'" deja
explícito que el segundo caso del `it` existe para distinguir `startsWith` de
`endsWith`, no es relleno). Dos `it`, sin duplicación real entre ellos (cada
uno cubre una dirección del contrato: positivo y negativo). No usa
`it.each` para un caso de solo 2/3 pares — proporcionado a la complejidad,
consistente con el resto del fichero (@s1 tampoco usa tabla). Import
actualizado en una sola línea (`esAncla` añadido junto a
`PUNTO_DE_CORTE_NAVEGACION_PX`), sin duplicar el `import` existente.

### `src/components/Cabecera-logica.ts`, `Cabecera.tsx`, `src/data/navegacion.ts`
Sin cambios en esta ronda. Sostengo la valoración de la ronda 2 (funciones
puras con un solo motivo de cambio, estado condicional en `aria-expanded`/
presencia-DOM, dato de marca desde fuente única, catálogo `as const
satisfies` documentado). El único matiz no bloqueante ya anotado en ronda 2
(`onClick` de navegación de subpágina inline en el JSX de `Cabecera.tsx` en
vez de en la capa `-logica.ts`) sigue vigente y sigue sin ser bloqueante: no
es una decisión, es cableado de un efecto (`pushState`), y la decisión real
(`esAncla`) sí vive en la capa pura — que es precisamente lo que esta ronda
reforzó con test directo.

## Verificación de entorno (independiente, no solo leída del informe)

- `node .harness/harness.mjs init` ejecutado por este `judge`: **verde** —
  entorno OK, ficheros base OK, `feature_list.json` válido (19 features),
  lint sin errores, typecheck sin errores, **84/84 tests verdes**.
- `pnpm run lint && pnpm run typecheck` ejecutado de forma aislada: sin
  avisos.
- `pnpm exec vitest run` (suite completa) ejecutado dos veces por este
  `judge` (antes y después de las dos verificaciones de mutación manual, con
  revert limpio entre medias): **84/84 verdes** ambas veces.
- `grep -rEn "TODO|console\.(log|debug)|debugger"` sobre los 5 ficheros de la
  feature: sin resultados.
- `ls src/components/` / `ls src/data/`: exactamente 4 ficheros y 1 fichero
  respectivamente — sin ficheros sueltos ajenos a la feature.

## Cambios requeridos

Ninguno.

## Checkpoints (`CHECKPOINTS.md`)

- **C1** — [x] Ficheros base y docs presentes (`AGENTS.md`, `CLAUDE.md`,
  `CHECKPOINTS.md`, `docs/workflow.md`, `feature_list.json`,
  `progress/current.md`). `bin/harness init` verde, verificado en esta ronda
  con `node .harness/harness.mjs init` (84/84 tests, lint+typecheck limpios).
- **C2** — [x] Una sola feature `in_progress` (`cabecera_y_navegacion`, id 3;
  confirmado en `feature_list.json`). Las `done` (ids 1-2) tienen tests que
  pasan (incluidos en los 84/84). `progress/current.md` describe la sesión
  activa sin basura de sesiones previas; nota menor no bloqueante: su conteo
  de tests ("82/82") quedó desactualizado respecto al Ciclo 17 (84/84) —
  actualización de `craftsman_lead` al cerrar la ronda, no bloquea esta
  aprobación de `judge`.
- **C3** — [x] `src/components/` contiene exactamente los 4 ficheros de esta
  feature; `src/data/` contiene exactamente `navegacion.ts`. Sin
  dependencias nuevas. Grep de `TODO|console\.(log|debug)|debugger`: sin
  resultados.
- **C4** — [x] Cada módulo tiene su test co-locado. Tests reales sobre DOM
  (Testing Library) y sobre funciones puras, sin mocks de sistema de
  ficheros. `pnpm run test` → **84/84 verdes**, confirmado por este `judge`
  en tres corridas independientes (antes, entre y después de las
  verificaciones de mutación manual).
- **C5** — [ ] No evaluado: checkpoint de cierre de sesión, feature todavía
  `in_progress` (mismo criterio que en rondas y features anteriores).
- **C6** — [x] `features/cabecera_y_navegacion.feature` existe, con sección
  en `project-spec.md`. 15/15 escenarios con test concreto, mapa en
  `progress/tdd_cabecera_y_navegacion.md`. Sin producción sin test que la
  pida (confirmado: 0 cambios de producción en el Ciclo 17). Sin violaciones
  de `doble-de-test-anclado-al-literal-no-al-simbolo` ni de
  `verde-por-vacuidad-en-puerta-de-verificacion`, en el fichero tocado ni en
  el resto de la feature.
- **C7** — [ ] No evaluado por este rol: corresponde a `mutation_tester`,
  posterior a esta aprobación. Esta ronda existe exactamente para cerrar los
  2 huecos reales que la medición anterior (`progress/mutation_cabecera_y_navegacion.md`,
  FAIL 87.50%) le señaló al `tdd_craftsman`; ambos quedan verificados
  cerrados por este `judge` de forma independiente (ver sección de
  disciplina TDD arriba), pero la puntuación oficial de mutación la certifica
  el `mutation_tester`, no este rol.

## Siguiente paso

`craftsman_lead` relanza `mutation_tester` sobre el único fichero mordible de
la feature (`src/components/Cabecera-logica.ts`, patrón `*-logica.ts` de
`stryker.config.json`) con el umbral `1.0` de `harness.config.json`. Solo si
esa medición confirma que los 2 huecos reales (líneas 33-34) quedaron
cerrados — y que no aparece ningún superviviente nuevo — se marca `done` la
feature id 3 en `feature_list.json`.
