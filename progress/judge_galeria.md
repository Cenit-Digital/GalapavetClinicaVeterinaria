# Review — feature 8 (galeria), ronda 1

**Veredicto:** CHANGES_REQUESTED

## Método de revisión

Releídos `features/galeria.feature` (17 escenarios), `progress/tdd_galeria.md`,
y los 5 ficheros de código y test uno a uno (no solo la bitácora). Ejecutado
`node .harness/harness.mjs init` de forma independiente. Verificación empírica
propia (no solo lectura): sabotaje manual de
`SEPARACION_ENTRE_TARJETAS_PX` (`src/components/Galeria-logica.ts:28`, de `18`
a `18 + 47`) y re-ejecución de la suite de galería, revertido byte a byte
después. Comparación cruzada con el precedente ya aprobado del propio proyecto
(`src/components/Cabecera-logica.test.ts` / `Cabecera.test.tsx`, constante
`PUNTO_DE_CORTE_NAVEGACION_PX`) para confirmar que la disciplina correcta ya
existe en este repo y no se aplicó aquí. Leído
`.memoria-cache/patterns/testing/doble-de-test-anclado-al-literal-no-al-simbolo.md`
y `.../verde-por-vacuidad-en-puerta-de-verificacion.md` completos, no solo el
título.

## Cobertura de escenarios (@s ↔ test)

Los 17 escenarios tienen un `describe`/`it` concreto en
`src/components/Galeria.test.tsx`, verificado directamente contra el fichero
(no contra la tabla de `progress/tdd_galeria.md`):

- @s1: [x] `Galeria.test.tsx:58-75`
- @s2: [x] `Galeria.test.tsx:77-95`
- @s3: [x] `Galeria.test.tsx:97-112`
- @s4: [x] `Galeria.test.tsx:114-131`
- @s5: [x] `Galeria.test.tsx:133-148` + `Galeria-logica.test.ts:10-15` — ver
  hallazgo 1: la cláusula "de exactamente el ancho de una tarjeta más la
  separación entre tarjetas" no queda realmente verificada (ver abajo).
- @s6: [x] `Galeria.test.tsx:150-165` + `Galeria-logica.test.ts:17-22` — mismo
  hallazgo 1.
- @s7: [x] `Galeria.test.tsx:167-182` + `Galeria-logica.test.ts:24-38` — mismo
  hallazgo 1 sobre la cláusula de distancia.
- @s8: [x] `Galeria.test.tsx:184-199` + `Galeria-logica.test.ts:60-64` — mismo
  hallazgo 1 sobre la cláusula de distancia.
- @s9: [x] `Galeria.test.tsx:208-222` (1ª cláusula medible en jsdom; 3
  restantes declaradas Decisión 11, navegador real, no ocultas)
- @s10: [x] `Galeria.test.tsx:224-235` + `Galeria-logica.test.ts:40-44` (1ª
  cláusula; 2ª Decisión 11)
- @s11: [x] `Galeria.test.tsx:237-255`
- @s12: [x] `Galeria.test.tsx:260-272`
- @s13: [x] `Galeria.test.tsx:274-282`
- @s14: [x] `Galeria.test.tsx:284-295`
- @s15: [x] `Galeria.test.tsx:297-306`
- @s16: [x] `Galeria.test.tsx:308-316`
- @s17: [x] `Galeria.test.tsx:318-336` + `Galeria-logica.test.ts:46-58`

Cobertura formal 17/17. El hallazgo 1 no es un hueco de cobertura (hay test
para cada `@s`) sino un hueco de **mordida** en 4 de esos tests — motivo por
el que se documenta aquí y no arriba.

## Disciplina TDD

- ¿Producción sin test que la pida? Un punto discutible, no bloqueante:
  `Galeria.tsx:20` cambia el guardián de `catalogo.length === 0` (el único que
  el rojo de @s15 exigía) a `validas.length === 0` durante el ciclo de @s17.
  Repasando la traza (`progress/tdd_galeria.md` @s17): el rojo de @s17 solo
  exige "2 figuras en vez de 3", que ya se satisface con
  `catalogo.length === 0` intacto (3 ≠ 0) más `validas.map(...)` en el
  render — el cambio del guardián en sí no era estrictamente necesario para
  ese rojo. Es una generalización defendible (coherente con el modo de error
  del proyecto "dato ausente → no se renderiza el bloque",
  `project-spec.md:71`, y con el propio patrón ya usado en `Equipo`/
  `Servicios`), pero ningún `@s` cubre hoy el caso que la motiva (catálogo con
  entradas, todas de nombre en blanco). No bloquea por sí solo — se deja
  anotado porque la Ley 3 pide precisión aquí, no porque haya un riesgo real
  de comportamiento.
- ¿Evidencia de Rojo→Verde→Refactor? Sí, y de buena calidad: la bitácora
  documenta el rojo real ciclo a ciclo, y para los 6 escenarios que pasaron a
  la primera (@s6, @s9, @s11, @s13, @s14, @s16) aplica sabotaje manual
  documentado para demostrar que el rojo era genuino antes de aceptar el
  ciclo — exactamente la disciplina que pide `docs/tdd.md` ("un test que pasa
  a la primera no demuestra nada").

### Hallazgo 1 (bloqueante) — `SEPARACION_ENTRE_TARJETAS_PX` anclada al símbolo, no al literal

Patrón `doble-de-test-anclado-al-literal-no-al-simbolo`
(`.memoria-cache/patterns/testing/...md`), confirmado empíricamente, no solo
por lectura.

`src/components/Galeria-logica.ts:28` declara
`export const SEPARACION_ENTRE_TARJETAS_PX = 18`, mordible por Stryker
(`stryker.config.json` incluye `src/**/*-logica.ts` con `ignoreStatic: false`
— las constantes estáticas también se mutan). Tanto
`src/components/Galeria-logica.test.ts` (líneas 7, 13, 20) como
`src/components/Galeria.test.tsx` (línea 7, y usos en 144, 161, 178, 195)
**reimportan ese mismo símbolo** y lo usan para *calcular* el valor esperado
(`240 + SEPARACION_ENTRE_TARJETAS_PX`) en vez de escribir el número a mano.
Como `calcularSolicitudDeDesplazamiento` calcula internamente
`anchoTarjetaPx + SEPARACION_ENTRE_TARJETAS_PX` con el mismo símbolo, la
aserción es una tautología: si Stryker muta la constante, ambos lados de la
comparación mutan igual y el mutante sobrevive.

Verificado en vivo: cambié la línea 28 a
`export const SEPARACION_ENTRE_TARJETAS_PX = 18 + 47 // SABOTAJE_TEMPORAL_JUDGE`
y corrí `pnpm exec vitest run src/components/Galeria.test.tsx
src/components/Galeria-logica.test.ts` → **24/24 en verde**, ninguno de los 6
tests que dependen de esa constante (los 2 de `Galeria-logica.test.ts` de
@s5/@s6, y los 4 de `Galeria.test.tsx` de @s5/@s6/@s7/@s8) se puso en rojo.
Revertido a `= 18` inmediatamente después; confirmado con `grep` que el
fichero quedó exactamente como estaba.

Esto contradice el propio precedente ya aprobado de este proyecto:
`src/components/Cabecera-logica.test.ts:6` fija
`PUNTO_DE_CORTE_NAVEGACION_PX` con `expect(...).toBe(1024)` — un literal
escrito a mano — precisamente para que la mutación sí lo muerda, mientras que
`Cabecera.test.tsx` reutiliza el símbolo solo como **entrada** de la prueba
(`ancho: PUNTO_DE_CORTE_NAVEGACION_PX`), nunca como parte del valor
*esperado* de una aserción. `galeria` no tiene el equivalente de esa línea 6:
en ningún sitio se afirma `SEPARACION_ENTRE_TARJETAS_PX === 18` (o cualquier
otro valor) contra un literal.

Matiz que sí hay que respetar (no es un "arreglo trivial: pon 18 en todos
lados"): la cabecera del propio `.feature`
(`features/galeria.feature`, sección PENDIENTE) dice explícitamente que "este
contrato solo exige que el paso de desplazamiento sea «ancho de tarjeta +
separación efectiva», nunca un literal", porque el valor de separación es
provisional hasta que `tokens_marca` resuelva la escala de espaciado (hoy
PENDIENTE). Esa instrucción es sobre el **texto Gherkin del `.feature`** (no
clavar "18" en el `Then`), y ahí se respeta: ningún escenario menciona "18".
No es una instrucción sobre el test de TypeScript. La propia
`Galeria-logica.ts:24-26` intenta justificar la reimportación ("Producción y
test importan este mismo símbolo... el ancho real de tarjeta+separación no es
medible en jsdom") pero mezcla dos cosas distintas: que el ancho de tarjeta no
sea medible en jsdom (cierto, y por eso se mockea con
`fijarAnchoDePrimeraTarjeta`) no justifica que la separación se deje sin
morder — son mecanismos independientes.

**Cambio pedido:** una única aserción de apoyo, igual que
`Cabecera-logica.test.ts:6`, que fije `SEPARACION_ENTRE_TARJETAS_PX` contra un
literal escrito a mano (p. ej. `expect(SEPARACION_ENTRE_TARJETAS_PX).toBe(18)`
en un test rotulado como apoyo de implementación, no como escenario de
negocio) — así el día que `tokens_marca` fije el token real, se actualiza esa
única línea y ninguna otra. No hace falta tocar las 4 aserciones de
`Galeria.test.tsx` que usan el símbolo como parte del valor esperado si esa
aserción de apoyo existe y muerde la constante — pero si se prefiere, también
vale escribir el `18` a mano directamente en esas aserciones (como hace
`Cabecera.test.tsx` con el ancho, aunque ahí el símbolo se usa como entrada,
no como parte del cálculo del resultado esperado). Lo que no vale es dejarlo
como está: ahora mismo ningún test del proyecto mata ese mutante.

## Calidad (lente de artesano)

- `src/data/galeria.ts` — limpio, `interface EntradaGaleria` con campos
  `readonly`, catálogo `as const satisfies`. Comentario de cabecera documenta
  el PENDIENTE real (fotos no cedidas, rutas provisionales) sin ocultarlo.
  Sin números mágicos, sin duplicación. Sin objeciones.
- `src/components/Galeria-logica.ts` — funciones puras, cortas, un motivo de
  cambio cada una, nombres reveladores (`entradasValidas`,
  `calcularSolicitudDeDesplazamiento`, `prefiereMenosMovimiento`). Falla
  cerrado en los dos sitios que el contrato exige (@s8, @s10). Único punto
  débil: el propio comentario de la línea 24-26 que intenta justificar el
  hallazgo 1 (ver arriba).
- `src/components/Galeria.tsx` — solo cablea, sin lógica de decisión filtrada
  (respeta invariante 6 de `project-spec.md`). El `oxlint-disable-next-line`
  de la línea 58 está justificado con el patrón WAI-ARIA APG citado en el
  propio comentario, no es una desactivación muda. El guardián
  `validas.length === 0` (línea 20) — ver nota en "Disciplina TDD" arriba, no
  bloqueante.
- `src/components/Galeria-logica.test.ts` — el `matchMedia` de apoyo de @s7 y
  la guarda de @s8 aplican correctamente el patrón "literal a mano, no
  símbolo" (`'(prefers-reduced-motion: reduce)'` escrito a mano, no
  reimportado de `CONSULTA_MENOS_MOVIMIENTO`, que ni siquiera se exporta) —
  contraste directo con el hallazgo 1: en este mismo fichero convive la
  aplicación correcta del patrón (para `matchMedia`) y la incorrecta (para
  `SEPARACION_ENTRE_TARJETAS_PX`), lo que confirma que no es una limitación
  del enfoque sino una inconsistencia puntual, corregible sin rediseñar nada.
- `src/components/Galeria.test.tsx` — `fijarPreferenciaDeMovimiento` también
  hand-escribe el literal de la consulta (línea 30), mismo patrón correcto.
  Los dos `for` sobre colecciones (líneas 66 y 243) van precedidos de
  `toHaveLength`/`toBeGreaterThan` sobre esa misma colección — no hay
  "verde por vacuidad": revisado explícitamente contra
  `.memoria-cache/patterns/testing/verde-por-vacuidad-en-puerta-de-verificacion.md`
  y no encontré ningún guardián de ausencia que se satisfaga vacuamente en
  este componente (los tres guardianes de falla-cerrado de
  `Galeria-logica.ts` — ancho ≤ 0, `matchMedia` no función, catálogo/válidas
  vacío — tienen cada uno su escenario dedicado con caso positivo, no solo el
  vacío). Único hallazgo real es el 1.

## Checkpoints

- **C1** [x] Ficheros base y docs presentes. `node .harness/harness.mjs init`
  verde (lint + typecheck + 191/191 tests), confirmado en esta revisión, no
  solo citado de la bitácora.
- **C2** [x] Única feature `in_progress` es `galeria` (id 8), confirmado
  leyendo `feature_list.json`. `progress/current.md` refleja la sesión activa
  (bitácora acumulada de las 7 features previas ya cerradas — mismo patrón ya
  aceptado en las 7 rondas anteriores de este proyecto, no basura nueva).
- **C3** [x] `src/` respeta la arquitectura de `project-spec.md`
  (páginas → componentes → lógica pura → datos). Sin dependencias externas
  nuevas. Sin logs de debug. El único "valor suelto" (`SEPARACION_ENTRE_TARJETAS_PX
  = 18`, fuera de `_tokens.scss`) está documentado como deuda declarada hasta
  que `tokens_marca` resuelva la escala de espaciado — no oculto.
- **C4** [x] Un test por módulo nuevo (`Galeria.tsx`, `Galeria-logica.ts`,
  `galeria.ts` vía @s16). Aislamiento real vía Testing Library/jsdom, sin
  mocks de sistema de ficheros. `pnpm run test`: 191 tests, todos verdes.
- **C5** [ ] No evaluado a fondo (mitad de sesión, no bloqueante — mismo
  criterio que las 7 rondas previas de este proyecto). No se detectan
  ficheros sueltos sospechosos relacionados con `galeria` más allá de los 5
  entregables + `progress/tdd_galeria.md`, confirmado con `git status`.
- **C6** [~] Los 17 `@s` tienen test concreto (mapa completo en
  `progress/tdd_galeria.md`), pero **el hallazgo 1 significa que 4 de esos
  tests no muerden realmente** la cláusula de distancia exacta que su propio
  escenario exige — cobertura nominal sí, mordida real no en ese punto
  concreto. No marco checkbox hasta que se corrija.
- **C7** [ ] No corresponde a esta puerta (`mutation_tester` corre después de
  la aprobación del `judge`) — pero dado que el hallazgo 1 predice con
  certeza razonable un superviviente real en la primera medición de
  `Galeria-logica.ts`, se rechaza aquí para no quemar una ronda completa de
  Stryker en un hueco ya detectado por lectura + verificación manual.

## Cambios requeridos

1. **Bloqueante:** anclar `SEPARACION_ENTRE_TARJETAS_PX` a un literal escrito
   a mano en al menos un test (mismo patrón que
   `Cabecera-logica.test.ts:6`), de modo que un mutante que cambie su valor
   se detecte. Alcance: `src/components/Galeria-logica.test.ts` (idealmente
   también revisar si conviene desacoplar las aserciones de
   `Galeria.test.tsx` @s5/@s6/@s7/@s8 del símbolo, aunque no es
   estrictamente necesario si la aserción de apoyo existe).
2. **No bloqueante, dejar anotado o cerrar con una frase:** decidir si el
   guardián `validas.length === 0` de `Galeria.tsx:20` necesita su propio
   escenario (catálogo no vacío, todas las entradas con nombre en blanco) o
   si se documenta explícitamente como generalización deliberada análoga a
   `Equipo`/`Servicios`, para que quede trazada y no como una duda abierta.

---

# Judge — galeria (id 8), ronda 2

> Revisión contra `features/galeria.feature` (17 escenarios @s1-@s17),
> `progress/tdd_galeria.md` (sección "Ronda 2") y mi propio veredicto anterior
> (`progress/judge_galeria.md`, ronda 1, CHANGES_REQUESTED, hallazgo 1
> bloqueante + hallazgo 2 no bloqueante). Alcance exacto de esta ronda: los
> cambios descritos en la sección "Ronda 2" de `progress/tdd_galeria.md`.
> Verificación propia, no solo lectura del relato: releídos los 5 ficheros
> completos, `bin/harness init` corrido por mí, y **sabotaje manual propio**
> de `SEPARACION_ENTRE_TARJETAS_PX` (independiente del que documenta el
> `tdd_craftsman`) para confirmar en vivo que el nuevo test muerde la
> constante.

## Veredicto

**APPROVED**

## 0. Confirmación de alcance (antes de entrar en detalle)

No hay commit intermedio entre rondas (los 5 ficheros son `??` sin trazar en
`git status`), así que no hay `git diff --stat` de qué cambió; en su lugar
comparé línea a línea el contenido actual contra las citas exactas de mi
propio informe de ronda 1:

- `src/components/Galeria.test.tsx` — **sin cambios**: las citas de línea de
  mi ronda 1 (`@s1: 58-75`, `@s5: 133-148`, `@s12: 260-272`, etc.) siguen
  apuntando exactamente al mismo contenido. Confirma lo que dice
  `progress/tdd_galeria.md`: "no se tocaron las 4 aserciones de
  `Galeria.test.tsx`".
- `src/data/galeria.ts` — sin cambios (6 entradas, rutas locales, igual que
  ronda 1).
- `src/components/Galeria-logica.ts` — **1 cambio real**: el comentario de
  cabecera de `SEPARACION_ENTRE_TARJETAS_PX` (líneas 18-35) se reescribió; el
  valor (`= 18`, línea 36) no cambió. El comentario de ronda 1 que yo mismo
  señalé como engañoso ("Producción y test importan este mismo símbolo...")
  ya no está — el nuevo texto documenta con precisión que la constante queda
  anclada por el literal de `Galeria-logica.test.ts`, cita mi hallazgo 1 por
  su nombre, y separa correctamente "el ancho de tarjeta no es medible en
  jsdom" de "la separación necesita su propio anclaje".
- `src/components/Galeria-logica.test.ts` — **1 test nuevo**: `describe`
  añadido al principio (líneas 10-14) con
  `expect(SEPARACION_ENTRE_TARJETAS_PX).toBe(18)`. Es exactamente el cambio
  pedido.
- `src/components/Galeria.tsx` — **1 cambio real, cosmético**: comentario
  añadido junto al guardián `validas.length === 0` (líneas 20-25)
  documentando la decisión (ya tomada por el humano/`craftsman_lead`, según
  `progress/tdd_galeria.md`) de no abrir un escenario nuevo. Sin cambio de
  comportamiento — confirmado releyendo el resto del fichero: `desplazar`
  (líneas 30-46) y el JSX (48-78) son idénticos a lo que revisé en ronda 1.

Alcance confirmado: exactamente lo que la bitácora anuncia, nada más.

## 1. Hallazgo 1 (bloqueante, ronda 1) — verificado cerrado

Repetí el sabotaje **yo mismo**, de forma independiente al que documenta
`tdd_craftsman` (incluso con un comentario distinto para distinguirlo en el
historial):

```
src/components/Galeria-logica.ts:36
- export const SEPARACION_ENTRE_TARJETAS_PX = 18
+ export const SEPARACION_ENTRE_TARJETAS_PX = 18 + 47 // SABOTAJE_TEMPORAL_JUDGE_RONDA2
```

`pnpm exec vitest run src/components/Galeria.test.tsx
src/components/Galeria-logica.test.ts` →

```
Test Files  1 failed | 1 passed (2)
     Tests  1 failed | 24 passed (25)
 FAIL  ... > el valor declarado es exactamente 18 píxeles, escrito a mano y no derivado del símbolo
 AssertionError: expected 65 to be 18
```

Exactamente **1 test se puso en rojo** (el nuevo, anclado al literal) y los
**24 restantes siguieron en verde** — incluidas las 4 aserciones de
`Galeria.test.tsx` (@s5/@s6/@s7/@s8) y las 2 de `Galeria-logica.test.ts`
(@s5/@s6) que calculan el valor esperado a partir del símbolo. Esto confirma
dos cosas a la vez: (a) mi hallazgo de ronda 1 era correcto — esas 6
aserciones siguen siendo tautológicas, tal como advertí, y no hacía falta
tocarlas; (b) el nuevo test **sí** muerde la constante, que es lo único que
el hallazgo exigía. Revertido a `= 18` inmediatamente; confirmado con `grep`
que el fichero quedó exactamente como estaba antes del sabotaje.

El patrón coincide byte a byte con el precedente ya aprobado del proyecto
(`Cabecera-logica.test.ts:6`, `expect(PUNTO_DE_CORTE_NAVEGACION_PX).toBe(1024)`),
confirmado de nuevo en esta ronda.

**Hallazgo 1: cerrado.**

## 2. Hallazgo 2 (no bloqueante, ronda 1) — cerrado por documentación explícita

Pedí "decidir y dejar trazado, no como duda abierta". `Galeria.tsx:20-25`
ahora documenta la decisión deliberada (generalización del modo de error
"dato ausente → no se renderiza el bloque", igual que `Equipo`/`Servicios`,
citando `project-spec.md:71`) y remite explícitamente a este mismo informe.
Es justo la resolución que pedí — no exigí un escenario `@s` nuevo, y el
`craftsman_lead` no fabricó uno artificialmente para "completar el expediente"
(lo que habría sido peor: un test sin rojo genuino que lo pidiera). **Cerrado.**

## 3. Cobertura de escenarios (@s ↔ test)

Sin cambios respecto a ronda 1 (ningún `@s` nuevo, ningún test de escenario
tocado) — 17/17, releído contra el fichero real, no contra la tabla de la
bitácora:

- @s1: [x] `Galeria.test.tsx:58-75`
- @s2: [x] `Galeria.test.tsx:77-95`
- @s3: [x] `Galeria.test.tsx:97-112`
- @s4: [x] `Galeria.test.tsx:114-131`
- @s5: [x] `Galeria.test.tsx:133-148` + `Galeria-logica.test.ts:16-21` — mordida real confirmada (ver §1).
- @s6: [x] `Galeria.test.tsx:150-165` + `Galeria-logica.test.ts:23-28` — ídem.
- @s7: [x] `Galeria.test.tsx:167-182` + `Galeria-logica.test.ts:30-44` — ídem.
- @s8: [x] `Galeria.test.tsx:184-199` + `Galeria-logica.test.ts:66-70`. La
  cláusula "no se produce ningún error en la consola" no depende solo del
  título del test: `src/test/setup.ts` convierte cualquier `console.error`/
  `console.warn` en fallo global de la suite (verificado leyendo el fichero),
  así que es una aserción real, no decorativa.
- @s9: [x] `Galeria.test.tsx:208-222` (única cláusula medible en jsdom; las 3
  restantes son Decisión 11 — navegador real, declarado en el propio
  `.feature`, no oculto).
- @s10: [x] `Galeria.test.tsx:224-235` + `Galeria-logica.test.ts:46-50` (1ª
  cláusula; 2ª Decisión 11).
- @s11: [x] `Galeria.test.tsx:237-255`
- @s12: [x] `Galeria.test.tsx:260-272`
- @s13: [x] `Galeria.test.tsx:274-282`
- @s14: [x] `Galeria.test.tsx:284-295`
- @s15: [x] `Galeria.test.tsx:297-306`
- @s16: [x] `Galeria.test.tsx:308-316`
- @s17: [x] `Galeria.test.tsx:318-336` + `Galeria-logica.test.ts:52-64`

## 4. Disciplina TDD

- ¿Producción sin test que la pida? **NO.** El único cambio de producción de
  esta ronda es cosmético (comentarios en `Galeria-logica.ts` y `Galeria.tsx`,
  cero cambios de comportamiento) — no hay lógica nueva sin rojo que la exija.
- ¿Evidencia de Rojo→Verde→Refactor? **SÍ**, y con el mismo estándar exigente
  de ronda 1: `progress/tdd_galeria.md` documenta el sabotaje manual propio
  del `tdd_craftsman` (`18 + 47 // SABOTAJE_TEMPORAL_TDD`, 1 failed / 7
  passed) **antes** de aceptar el ciclo como válido, pese a que el test pasó
  en verde a la primera (mismo patrón que exige `docs/tdd.md` para los "pasan
  a la primera"). Reproducido de forma independiente por mí en §1 con
  resultado idéntico.

### Anti-patrones específicos de esta convocatoria

- **`doble-de-test-anclado-al-literal-no-al-simbolo`**: revisado de nuevo
  sobre los 2 ficheros de test completos. `SEPARACION_ENTRE_TARJETAS_PX` ya
  no es el único hueco (cerrado, §1). El resto de dobles del componente
  siguen escritos a mano correctamente: `CONSULTA_MENOS_MOVIMIENTO` no se
  exporta desde `Galeria-logica.ts` y ambos tests (`Galeria-logica.test.ts:39`,
  `Galeria.test.tsx:30`) escriben el literal `'(prefers-reduced-motion: reduce)'`
  a mano; `AVISO_DEMOSTRACION` (`Galeria.test.tsx:257-258`) es un literal de
  test, no una reimportación (el componente no exporta esa cadena como
  símbolo). No encontré ningún otro símbolo de producción reimportado para
  *construir* la entrada de un doble.
- **`verde-por-vacuidad-en-puerta-de-verificacion`**: los dos `for` sobre
  colecciones (`Galeria.test.tsx:66`, `:243`) siguen precedidos de
  `toHaveLength(2)` / `length > 0` sobre la misma colección — ninguno puede
  pasar vacuamente. El guardián de producción `validas.length === 0`
  (`Galeria.tsx:26-28`) es un guardián de *ausencia legítima* (catálogo sin
  entradas válidas es un estado real y esperado, no "no miré nada"), con su
  propio escenario positivo (@s15) — no encaja en el patrón de "conjunto
  derivado que sale vacío por error de extracción" que describe
  `.memoria-cache/patterns/testing/verde-por-vacuidad-en-puerta-de-verificacion.md`.
  @s16 existe precisamente como guarda anti-vacuidad de que el catálogo real
  de producción (`GALERIA`) no está vacío, ejercitado sin doble.

## 5. Calidad (lente de artesano)

- `src/components/Galeria-logica.ts` — el comentario reescrito de
  `SEPARACION_ENTRE_TARJETAS_PX` (líneas 18-35) ya no mezcla dos cosas
  distintas (el hallazgo de ronda 1); documenta con precisión el anclaje real
  y remite a este informe. Resto del fichero sin cambios respecto a mi
  revisión de ronda 1 (funciones puras, cortas, nombres reveladores, ambas
  guardas de fallo cerrado intactas).
- `src/components/Galeria-logica.test.ts` — el nuevo `describe` está
  correctamente rotulado "apoyo de implementación, no escenario de negocio",
  distinguiéndolo de los `describe` de apoyo a un `@s` concreto — buena
  higiene de trazabilidad, mismo criterio que el resto del fichero.
- `src/components/Galeria.tsx` — el comentario nuevo del guardián es preciso
  y cita la fuente de la decisión sin inflar el fichero; no introduce ningún
  código muerto ni rama nueva.
- `src/components/Galeria.test.tsx`, `src/data/galeria.ts` — sin cambios,
  siguen mereciendo la valoración de ronda 1 (sin objeciones).

## 6. `bin/harness init`

Corrido por mí de forma independiente (`node .harness/harness.mjs init`, esta
máquina no tiene `pwsh`):

```
[OK] Lint sin errores
 Test Files  18 passed (18)
      Tests  192 passed (192)
[OK] Todos los tests pasan
[OK] Entorno listo. Puedes empezar a trabajar.
```

192/192 (191 + el nuevo test de esta ronda), lint y typecheck limpios.

## 7. Checkpoints (`CHECKPOINTS.md`)

- **C1** [x] Ficheros base y docs presentes. `bin/harness init` verde,
  confirmado en esta revisión (§6), no solo citado de la bitácora.
- **C2** [x] Única feature `in_progress`: `galeria` (id 8) —
  `feature_list.json` confirma `reserva_chat` (id 7) en `done` y `galeria`
  (id 8) en `in_progress`, sin ninguna otra en `in_progress`.
  `progress/current.md` refleja la sesión activa (bitácora acumulada de las 7
  features previas cerradas, mismo patrón aceptado en rondas anteriores).
- **C3** [x] `src/` respeta la arquitectura de `project-spec.md`
  (datos → lógica pura → componente que cablea). Sin dependencias externas
  nuevas. Sin `console.log`/`TODO`/`FIXME`/`debugger` sueltos en los 4
  ficheros de producción/test tocados (`grep` propio, sin resultados). El
  valor `SEPARACION_ENTRE_TARJETAS_PX = 18` sigue documentado como deuda
  declarada hasta que `tokens_marca` resuelva el token de espaciado — no
  oculto.
- **C4** [x] Un test por módulo (`Galeria.tsx`, `Galeria-logica.ts`,
  `galeria.ts` vía @s16). Aislamiento real vía Testing Library/jsdom, sin
  mocks de sistema de ficheros. `pnpm run test`: 192/192, todos verdes.
- **C5** [ ] No evaluado a fondo (mitad de sesión, mismo criterio no
  bloqueante que las 7 rondas previas de este proyecto y que mi propia ronda
  1). `git status` no muestra ficheros sueltos sospechosos relacionados con
  `galeria` más allá de los 5 entregables + `progress/tdd_galeria.md` +
  este informe.
- **C6** [x] Los 17 `@s` tienen test concreto **y mordida real** confirmada
  (a diferencia de ronda 1, donde marqué `[~]` por el hallazgo 1: ese hueco
  de mordida ya está cerrado, verificado con sabotaje propio en §1).
- **C7** [ ] No corresponde a esta puerta — `mutation_tester` corre después
  de esta aprobación. Mi propia verificación de mordida en §1 (sabotaje
  manual sobre la única constante mutable relevante de
  `Galeria-logica.ts` que ronda 1 dejó sin morder) reduce el riesgo de que la
  medición oficial encuentre ese mismo superviviente, pero no sustituye a la
  corrida real de Stryker.

## Cambios requeridos

Ninguno.
