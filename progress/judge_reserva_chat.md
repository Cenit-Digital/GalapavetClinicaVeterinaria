# Judge — reserva_chat (id 7), ronda 3

> Revisión contra `features/reserva_chat.feature` (23 escenarios @s1-@s23),
> `progress/tdd_reserva_chat.md` (sección "Ronda 3") y `progress/mutation_reserva_chat.md`
> (FAIL 20/32 = 62.50% tras la ronda 2, que yo mismo aprobé). Alcance exacto de
> esta ronda: los 5 tests nuevos de `src/components/ReservaChat-logica.test.ts`
> que cierran los 12 mutantes no-killed de `siguientePaso`. Verificación propia
> con `git diff --stat`, `bin/harness init` corrido por mí, y relectura completa
> de los 4 ficheros de la feature — no me fío solo del relato del `tdd_craftsman`.

## Veredicto

**APPROVED**

## 0. Confirmación de alcance (antes de entrar en detalle)

`git diff --stat -- src/components/ReservaChat.tsx src/components/ReservaChat.test.tsx src/components/ReservaChat-logica.ts src/components/ReservaChat-logica.test.ts`
corrido por mí:

```
 src/components/ReservaChat-logica.test.ts | 20 ++++++++++++++++++++
 1 file changed, 20 insertions(+)
```

Confirmado de forma independiente: **el único fichero de producción o test
tocado esta ronda es `ReservaChat-logica.test.ts`** (+20 líneas, 0 borradas).
`ReservaChat.tsx` releído completo (211 líneas) — idéntico al que aprobé en
ronda 2, incluida la ausencia de la línea `setRespuestas(...)` en `reiniciar()`
que ya cerré entonces. `ReservaChat.test.tsx` y `ReservaChat-logica.ts`
también releídos completos — sin cambios. La decisión de diseño ("vía 1: solo
reforzar los tests puros, sin hacer que `ReservaChat.tsx` llame a
`siguientePaso` en las 4 transiciones") está correctamente ejecutada: no hay
ningún cambio fuera del fichero de test anunciado.

## 1. Cobertura @s ↔ test

23/23 siguen cubiertos. Los 5 tests nuevos no añaden ningún `@s` nuevo: viven
dentro del `describe('@s23 ...')` ya existente, como refuerzo de mutación
para una función pura cuyo comportamiento correcto ya exigían escenarios de
DOM anteriores (@s2/@s5/@s8/@s13 vía observación en pantalla; @s23 vía
llamada directa). No hay inflación del contrato Gherkin: el mapa de
trazabilidad de `progress/tdd_reserva_chat.md` sigue siendo 23 filas, sin
añadir una 24ª.

## 2. Patrón `doble-de-test-anclado-al-literal-no-al-simbolo`

**Sin hallazgos.** Releído `ReservaChat-logica.test.ts` completo (líneas
1-55). El único import de producción es la lista de funciones bajo test
(`componerResumen, normalizarRespuesta, puedeRegistrarRespuesta, siguientePaso`,
línea 2) — correcto y necesario, es la definición misma de un test directo
sobre un módulo puro, no el patrón prohibido. `OPCION_URGENCIA` **no** se
importa en ningún punto del fichero (confirmado con lectura línea a línea),
así que el literal `'Es una urgencia'` de la línea 26 sigue escrito a mano,
sin cambios respecto a ronda 1/2. Los 5 tests nuevos (líneas 36-54) comparan
contra literales de `IdPaso` escritos a mano (`'cuando'`, `'nombre'`,
`'final'`, `'urgencia'`) — nunca contra un símbolo reimportado que pudiera
volver la aserción tautológica. Sabotaje-verificación propia (no me fío del
relato): apliqué a mano `case 'nombre': return 'final'` → cuerpo vaciado en
`ReservaChat-logica.ts:45-46` y corrí solo
`pnpm exec vitest run src/components/ReservaChat-logica.test.ts` →
**exactamente 1 test en rojo** (`refuerzo mutación: desde "nombre" el paso
siguiente es exactamente "final"`, `expected undefined to be 'final'`), los
otros 9 tests del fichero siguieron en verde. Confirma que el test muerde
contra el mutante real y no está anclado a nada que se mueva junto con la
producción. Sabotaje revertido; releído `ReservaChat-logica.ts` idéntico al
original tras revertir.

## 3. Patrón `verde-por-vacuidad-en-puerta-de-verificación`

**Sin hallazgos.** Los 5 tests nuevos son `expect(fn(...)).toBe(literal)`
directos — ninguno itera sobre una colección que pudiera estar vacía por
construcción. No hay bucles `for` ni `queryAllByRole` en este fichero. El
resto de `ReservaChat.test.tsx` no cambió esta ronda: mantengo la tabla que
ya verifiqué en ronda 2 (líneas 75-77 @s3, 109-112 @s4, 287-290 @s12,
335-337 @s14, 415-420 @s18, 435-437 @s19 — todas no vacías por construcción;
374-377 @s16 ya corregido en ronda 2 con aserción directa, sin bucle).

## 4. Disciplina TDD (Rojo-Verde-Refactor)

**Ley 1 respetada de punta a punta.** El "rojo" de esta ronda no viene de un
`TypeError` sino de un mutante aplicado a mano — patrón ya sancionado por
`docs/mutation-testing.md` ("Un mutante sobreviviente es trabajo del
`tdd_craftsman`: escribe el test rojo que lo mata") y con precedente directo
ya aprobado en este mismo repositorio (`progress/tdd_tokens_marca.md`,
"Intento 2"). La bitácora documenta, sabotaje por sabotaje, el diff aplicado,
el test que cae y que solo ese test cae — verifiqué uno de los cinco de forma
independiente (§2 arriba) con el mismo resultado que reporta la bitácora.

Ningún código de producción se escribió esta ronda (0 líneas en
`ReservaChat.tsx` / `ReservaChat-logica.ts`) — no hay forma de que la Ley 1
se viole por exceso de alcance, porque no hay producción nueva que juzgar.
La elección de la "vía 1" sobre la "vía 2" (que el propio informe de
mutación dejó como decisión de diseño, no como mandato) es razonable y está
justificada: la vía 2 (hacer que `ReservaChat.tsx` llame a `siguientePaso`
en las 4 transiciones) habría sido un cambio de producción **sin que ningún
test de comportamiento observable lo exigiera** — el propio guion ya se
comporta correctamente hoy — así que forzarla habría sido footgun de la
propia Ley 1 en sentido contrario (producción motivada por "arquitectura
más limpia" en vez de por un rojo).

No quedan `console.*`, `debugger`, `.only`/`.skip`, `TODO` ni restos de
`SABOTAJE`/`sondaje` en ningún fichero de la feature ni en el árbol de
trabajo (`grep` propio sobre los 4 ficheros, sin coincidencias;
`git status --porcelain | grep -iE "sondaje|sabotaje"` vacío).

## 5. Calidad de artesano, fichero a fichero

- **`src/components/ReservaChat-logica.ts`** — sin cambios esta ronda (ya
  aprobado en rondas anteriores).
- **`src/components/ReservaChat.tsx`** — sin cambios esta ronda (ya aprobado
  en ronda 2, confirmado idéntico por `git diff --stat`).
- **`src/components/ReservaChat.test.tsx`** — sin cambios esta ronda (ya
  aprobado en ronda 2).
- **`src/components/ReservaChat-logica.test.ts`** — único fichero tocado.
  Los 5 tests nuevos están bien nombrados (`refuerzo mutación: desde "<paso>"
  el paso siguiente es exactamente "<paso>"`), cada uno con un único motivo
  de fallo, sin duplicación de lógica de aserción, sin números mágicos, y
  ubicados en el `describe` correcto (`@s23`) en vez de inventar una
  agrupación nueva. Las 3 negaciones originales de @s23 no se tocaron —
  correcto: retirarlas se habría alejado del literal del `.feature`
  (patrón `doble-de-test-anclado-al-literal-no-al-simbolo` aplicado también
  a no tocar lo que el Gherkin ya pedía tal cual).

## 6. Fidelidad a los datos verificados

Sin cambios respecto a rondas anteriores: esta ronda no toca ningún dato de
negocio (teléfonos, horario, servicios). Los 5 tests nuevos usan el literal
neutro `'cualquier respuesta'` como segundo argumento (correcto: el valor de
`respuesta` es irrelevante para las 5 ramas que no son `'servicio'`, y el
`.feature` no exige un valor concreto ahí).

## 7. `bin/harness init`

Corrido por mí de forma independiente (no solo citado de la bitácora):

```
node .harness/harness.mjs init
```

**Verde**: lint (`oxlint --deny-warnings`) sin errores, `tsc -b` sin errores,
suite completa **167/167** (162 previos + 5 refuerzos nuevos, mismo recuento
que reporta `progress/tdd_reserva_chat.md` Ronda 3).

## 8. CHECKPOINTS.md

- **C1** — [x] ficheros base presentes; `bin/harness init` exit 0 (verificado
  por mí en esta sesión, §7).
- **C2** — [x] una sola feature `in_progress` (`reserva_chat`, id 7,
  confirmado con script propio sobre `feature_list.json`); `progress/current.md`
  describe la sesión activa (bitácora acumulada de features previas, no
  basura suelta — mismo formato ya aceptado en rondas anteriores de este
  proyecto).
- **C3** — [x] `ReservaChat-logica.test.ts` es el único fichero tocado, sin
  dependencias nuevas, sin logs de debug ni TODOs (grep propio, §4).
- **C4** — [x] hay test por módulo; `bin/harness init` (que ejecuta `pnpm run
  test`) da 167 > 0, todos verdes.
- **C5** — N/D a mitad de sesión (no es cierre de sesión); no quedan ficheros
  de sondeo ni sabotaje sin trackear (`git status --porcelain` verificado).
- **C6** — [x] Se mantiene completo: 23/23 `@s` con test concreto, sin
  producción sin test que la pida (0 líneas de producción esta ronda), `.feature`
  con `@s1..@s23` medibles sin cambios.
- **C7** — pendiente de medición independiente por `mutation_tester`. El
  `tdd_craftsman` reporta 100.00% (32/32) con el mismo comando oficial que
  documentó el `mutation_tester` en su informe FAIL de ronda 2
  (`pnpm exec stryker run --mutate src/components/ReservaChat-logica.ts
  --plugins @stryker-mutator/vitest-runner`), pero no me corresponde a mí
  darlo por bueno sin la corrida independiente de esa puerta — coherente con
  `docs/workflow.md` (`judge` y `mutation_tester` son puertas distintas, la
  segunda corre después de mi aprobación).

---

## Cambios requeridos

Ninguno. Los 5 tests nuevos son un refuerzo de mutación correctamente
alcanzado (dentro del `describe` de @s23, sin escenario Gherkin nuevo, sin
tocar producción, sin anclarse a símbolos reimportados, sin guardas vacíos) y
verificado de forma independiente por mí (sabotaje manual + `bin/harness
init`). Pasa a `mutation_tester` para la medición oficial de C7.
